import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatJurisdiction, severityClasses } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function DiffView({ diffText }: { diffText: string }) {
  const lines = diffText.split("\n");

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-gray-800 text-gray-400 text-xs font-mono">
        Unified Diff &mdash; Red = removed, Green = added
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        {lines.map((line, i) => {
          let className = "text-gray-300";
          if (line.startsWith("+") && !line.startsWith("+++")) {
            className = "text-green-400 bg-green-900/20";
          } else if (line.startsWith("-") && !line.startsWith("---")) {
            className = "text-red-400 bg-red-900/20";
          } else if (line.startsWith("@@")) {
            className = "text-blue-400";
          } else if (line.startsWith("+++") || line.startsWith("---")) {
            className = "text-gray-500";
          }
          return (
            <div key={i} className={`${className} px-2 -mx-2`}>
              {line || " "}
            </div>
          );
        })}
      </pre>
    </div>
  );
}

export default async function ChangeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: change } = await supabase
    .from("changes")
    .select(
      "*, sources(name, jurisdiction, url, category), snapshot_before:snapshots!snapshot_before_id(extracted_text, fetched_at), snapshot_after:snapshots!snapshot_after_id(extracted_text, fetched_at)"
    )
    .eq("id", params.id)
    .single();

  if (!change) {
    notFound();
  }

  const source = change.sources as any;
  const snapshotBefore = change.snapshot_before as any;
  const snapshotAfter = change.snapshot_after as any;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        &larr; Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${severityClasses(
              change.severity
            )}`}
          >
            {change.severity}
          </span>
          <span className="text-sm text-gray-500">
            {formatJurisdiction(source?.jurisdiction)}
          </span>
          <span className="text-sm text-gray-400">&middot;</span>
          <span className="text-sm text-gray-500">{source?.category}</span>
        </div>

        <h1 className="text-2xl font-bold mb-2">{source?.name}</h1>

        {change.summary && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <h2 className="text-sm font-semibold text-amber-800 mb-1">
              What Changed
            </h2>
            <p className="text-sm text-amber-700 leading-relaxed">
              {change.summary}
            </p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Previous Version
          </div>
          <div className="text-sm text-gray-700">
            {snapshotBefore
              ? formatDateTime(snapshotBefore.fetched_at)
              : "Unknown"}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            New Version
          </div>
          <div className="text-sm text-gray-700">
            {snapshotAfter
              ? formatDateTime(snapshotAfter.fetched_at)
              : "Unknown"}
          </div>
        </div>
      </div>

      {/* Diff */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Exact Changes</h2>
        {change.diff_text ? (
          <DiffView diffText={change.diff_text} />
        ) : (
          <p className="text-gray-500">No diff available.</p>
        )}
      </div>

      {/* Source link */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          Official source:{" "}
          <a
            href={source?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 hover:underline"
          >
            {source?.url}
          </a>
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Detected: {formatDateTime(change.detected_at)}
          {change.approved_at && (
            <> &middot; Verified: {formatDateTime(change.approved_at)}</>
          )}
          {change.published_at && (
            <> &middot; Alert sent: {formatDateTime(change.published_at)}</>
          )}
        </p>
      </div>
    </div>
  );
}
