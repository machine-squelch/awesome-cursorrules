import { createClient } from "@/lib/supabase/server";
import { formatDate, formatJurisdiction, severityClasses } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  // Fetch recent published changes
  const { data: changes } = await supabase
    .from("changes")
    .select("*, sources(name, jurisdiction, url)")
    .eq("status", "approved")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(20);

  // Fetch monitored sources
  const { data: sources } = await supabase
    .from("sources")
    .select("*")
    .eq("is_active", true)
    .order("jurisdiction");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-gray-600">
          Monitoring {sources?.length || 0} official sources across Pleasanton
          &amp; Alameda County.
        </p>
      </div>

      {/* Recent changes */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Recent Changes</h2>
        {changes && changes.length > 0 ? (
          <div className="space-y-3">
            {changes.map((change: any) => (
              <Link
                key={change.id}
                href={`/changes/${change.id}`}
                className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${severityClasses(
                          change.severity
                        )}`}
                      >
                        {change.severity}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatJurisdiction(change.sources?.jurisdiction)}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm mb-1">
                      {change.sources?.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {change.summary || "Change detected. Review details."}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(change.published_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-2">No changes detected yet.</p>
            <p className="text-sm text-gray-400">
              We&apos;re actively monitoring all sources. You&apos;ll see
              changes here as they&apos;re detected and verified.
            </p>
          </div>
        )}
      </section>

      {/* Monitored sources */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Monitored Sources</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Source
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Jurisdiction
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Category
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Last Checked
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sources?.map((source: any) => (
                <tr key={source.id}>
                  <td className="py-3 px-4">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline"
                    >
                      {source.name}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatJurisdiction(source.jurisdiction)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                      {source.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {source.last_checked_at
                      ? formatDate(source.last_checked_at)
                      : "Not yet checked"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
