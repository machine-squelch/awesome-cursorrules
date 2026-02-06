import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";

/**
 * POST /api/admin/send-alerts
 *
 * Send email alerts to all active subscribers for an approved change.
 *
 * Body: { change_id }
 */
export async function POST(request: NextRequest) {
  // Auth check
  const adminToken = process.env.ADMIN_API_TOKEN;
  const authHeader = request.headers.get("authorization");
  if (adminToken && authHeader !== `Bearer ${adminToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { change_id } = body;

  if (!change_id) {
    return NextResponse.json({ error: "change_id is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Fetch the change with source info
  const { data: change, error: changeError } = await supabase
    .from("changes")
    .select("*, sources(name, jurisdiction)")
    .eq("id", change_id)
    .single();

  if (changeError || !change) {
    return NextResponse.json({ error: "Change not found" }, { status: 404 });
  }

  if (change.status !== "approved") {
    return NextResponse.json(
      { error: "Change must be approved before sending alerts" },
      { status: 400 }
    );
  }

  const source = change.sources as any;
  const jurisdiction = source.jurisdiction;

  // Fetch active subscribers for this jurisdiction
  const { data: allSubscribers } = await supabase
    .from("subscribers")
    .select("*")
    .eq("status", "active");

  const subscribers = (allSubscribers || []).filter(
    (s: any) => (s.jurisdictions || []).includes(jurisdiction)
  );

  if (subscribers.length === 0) {
    return NextResponse.json({
      success: true,
      sent: 0,
      message: "No active subscribers for this jurisdiction",
    });
  }

  // Send emails via Resend
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.ALERT_FROM_EMAIL || "alerts@strmonitor.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://strmonitor.com";
  let sentCount = 0;

  const jurisdictionDisplay: Record<string, string> = {
    pleasanton: "Pleasanton, CA",
    alameda_county: "Alameda County, CA",
    california: "State of California",
  };

  const severityLabel: Record<string, string> = {
    critical: "URGENT",
    warning: "Important",
    info: "Update",
  };

  for (const subscriber of subscribers) {
    try {
      const subject = `[${severityLabel[change.severity] || "Update"}] STR Rule Change: ${source.name}`;

      const result = await resend.emails.send({
        from: fromEmail,
        to: [subscriber.email],
        subject,
        html: buildAlertEmail({
          subscriberName: subscriber.name,
          sourceName: source.name,
          jurisdiction: jurisdictionDisplay[jurisdiction] || jurisdiction,
          summary: change.summary || "A change was detected.",
          severity: change.severity,
          changeUrl: `${appUrl}/changes/${change_id}`,
        }),
      });

      // Log the alert
      await supabase.from("alert_log").insert({
        change_id,
        subscriber_id: subscriber.id,
        channel: "email",
        status: "sent",
        resend_message_id: result?.data?.id || null,
      });

      sentCount++;
    } catch (err) {
      console.error(`Failed to send alert to ${subscriber.email}:`, err);
    }
  }

  // Mark change as published
  await supabase
    .from("changes")
    .update({ published_at: new Date().toISOString() })
    .eq("id", change_id);

  return NextResponse.json({ success: true, sent: sentCount });
}

function buildAlertEmail(params: {
  subscriberName: string;
  sourceName: string;
  jurisdiction: string;
  summary: string;
  severity: string;
  changeUrl: string;
}): string {
  const severityColor: Record<string, string> = {
    critical: "#DC2626",
    warning: "#F59E0B",
    info: "#3B82F6",
  };

  const color = severityColor[params.severity] || "#3B82F6";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="border-left: 4px solid ${color}; padding-left: 16px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 8px 0; color: #111827;">STR Regulation Change Detected</h2>
        <p style="margin: 0; color: #6B7280; font-size: 14px;">${params.jurisdiction} &middot; ${params.sourceName}</p>
      </div>

      <p>Hi ${params.subscriberName},</p>

      <p>We detected a change in short-term rental regulations that may affect your property:</p>

      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; font-size: 15px; line-height: 1.6;">${params.summary}</p>
      </div>

      <p>
        <a href="${params.changeUrl}"
           style="display: inline-block; background: #111827; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
          View Full Details &amp; Evidence
        </a>
      </p>

      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">

      <p style="color: #9CA3AF; font-size: 12px;">
        You're receiving this because you're subscribed to STR Monitor alerts for ${params.jurisdiction}.
        This is an automated regulatory monitoring service. Always verify changes with official sources before taking action.
      </p>
    </div>
  `;
}
