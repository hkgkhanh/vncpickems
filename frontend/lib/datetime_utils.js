const TIME_ZONE = "Asia/Ho_Chi_Minh";
const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Backend datetime is UTC but WITHOUT the trailing Z.
 * Example:
 * 2026-07-18T01:32:33
 */
export function parseBackendDate(dateString) {
  if (!dateString) return null;

  return new Date(`${dateString}Z`);
}

export function formatDate(dateString) {
  if (!dateString) return "";

  return parseBackendDate(dateString).toLocaleDateString("en-GB", {
    timeZone: TIME_ZONE,
  });
}

export function formatOriginalDate(dateString) {
  if (!dateString) return "";

  console.log(dateString);

  return new Date(`${dateString}`).toLocaleDateString("en-GB");
}

export function formatDateTime(dateString) {
  if (!dateString) return "";

  return parseBackendDate(dateString)
    .toLocaleString("en-GB", {
      timeZone: TIME_ZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(",", "");
}

/**
 * Backend UTC -> datetime-local value (Vietnam time)
 *
 * Example:
 * backend:
 *   2026-07-18T01:32:00
 *
 * input value:
 *   2026-07-18T08:32
 */
export function toDateTimeLocal(dateString) {
  if (!dateString) return "";

  const utc = parseBackendDate(dateString);

  const vietnam = new Date(utc.getTime() + VIETNAM_OFFSET_MS);

  return vietnam.toISOString().slice(0, 16);
}

/**
 * datetime-local value (Vietnam time)
 * -> backend UTC string (WITHOUT Z)
 *
 * Example:
 * input:
 *   2026-07-18T08:32
 *
 * backend:
 *   2026-07-18T01:32:00
 */
export function fromDateTimeLocal(localValue) {
  if (!localValue) return "";

  const vietnam = new Date(localValue);

  const utc = new Date(vietnam.getTime() - 7 * 60 * 60 * 1000);

  return utc.toISOString().replace("Z", "");
}




export function backendStringToDate(dateString) {
  if (!dateString) return null;

  const utc = new Date(`${dateString}Z`);

  return new Date(utc.getTime());
}

export function dateToBackendString(date) {
  if (!date) return "";

  const utc = new Date(date.getTime());

  return utc.toISOString().replace("Z", "");
}