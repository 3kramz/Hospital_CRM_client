/** Normalize roles from Mongo user doc (supports legacy single `role`). */
export const getUserRoles = (userData) => {
  if (!userData) return [];
  const roles = userData.roles || (userData.role ? [userData.role] : []);
  return roles.map((r) => String(r || "").toLowerCase()).filter(Boolean);
};

export const hasAnyRole = (userData, allowedRoles = []) => {
  const userRoles = getUserRoles(userData);
  const allowed = allowedRoles.map((r) => String(r).toLowerCase());
  return userRoles.some((role) => allowed.includes(role));
};

/** Normalize report/test status for comparisons (handles labels and snake_case). */
export const normalizeTestStatus = (status) =>
  String(status || "assigned").toLowerCase().replace(/\s+/g, "_");

/** Map stored test status to report list display label (matches backend aggregation). */
export const toReportTestStatusLabel = (status) => {
  const key = String(status || "").toLowerCase();
  const labels = {
    assigned: "Assigned",
    collecting_sample: "Collecting Sample",
    sample_collected: "Sample Collected",
    test_running: "Running",
    complete: "Complete",
    ready_to_deliver: "Ready to Deliver",
    delivered: "Delivered",
  };
  return labels[key] || status;
};
