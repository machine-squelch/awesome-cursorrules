/**
 * Format a jurisdiction slug to a display name.
 */
export function formatJurisdiction(jurisdiction: string): string {
  const map: Record<string, string> = {
    pleasanton: "Pleasanton, CA",
    alameda_county: "Alameda County, CA",
    california: "State of California",
  };
  return map[jurisdiction] || jurisdiction;
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date string with time.
 */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Severity badge color classes.
 */
export function severityClasses(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-red-50 text-red-700 border-red-200";
    case "warning":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}
