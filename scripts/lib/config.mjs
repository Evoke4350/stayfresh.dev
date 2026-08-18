// Site-wide configuration consumed by templates.mjs (head()) and, later,
// the splash page. Kept as a tiny standalone module (no imports) so it can
// be edited by hand without touching the generator.
//
// ga4 / searchConsole are intentionally empty strings for now -- head()
// treats an empty string as "omit this feature entirely" so fixtures and
// tests stay clean until a real measurement id / verification token is
// supplied (see docs/plans/2026-08-17-stayfresh-rebuild.md, Task 18).
export const siteUrl = "https://stayfresh.dev";
export const ga4 = "G-LWV58FCXB9";
export const searchConsole = "";
