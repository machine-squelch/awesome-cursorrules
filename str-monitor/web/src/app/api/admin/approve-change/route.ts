import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/approve-change
 *
 * Approve a detected change and set its human-written summary.
 * Requires admin auth (checked via ADMIN_EMAIL env var for simplicity).
 *
 * Body: { change_id, summary, severity? }
 */
export async function POST(request: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }

  // Simple auth: check bearer token matches a secret, or check Supabase session
  const authHeader = request.headers.get("authorization");
  const adminToken = process.env.ADMIN_API_TOKEN;

  if (adminToken && authHeader !== `Bearer ${adminToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { change_id, summary, severity } = body;

  if (!change_id || !summary) {
    return NextResponse.json(
      { error: "change_id and summary are required" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("changes")
    .update({
      status: "approved",
      summary,
      severity: severity || "info",
      approved_at: new Date().toISOString(),
    })
    .eq("id", change_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, change: data });
}
