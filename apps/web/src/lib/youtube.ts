const DIRECT_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function parseYouTubeVideoId(rawValue: string) {
  const value = rawValue.trim();
  if (!value) {
    return null;
  }

  if (DIRECT_ID_PATTERN.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    const fromSearch = url.searchParams.get("v");
    if (fromSearch && DIRECT_ID_PATTERN.test(fromSearch)) {
      return fromSearch;
    }

    const parts = url.pathname.split("/").filter(Boolean);
    const maybeId = parts.at(-1);
    if (maybeId && DIRECT_ID_PATTERN.test(maybeId)) {
      return maybeId;
    }
  } catch {
    return null;
  }

  return null;
}
