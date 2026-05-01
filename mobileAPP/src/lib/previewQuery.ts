export type PreviewParams = Record<string, string>;

export function readQueryString(
  value: string | string[] | undefined | null,
): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === "string") {
      const trimmed = first.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
  }
  return null;
}

function toSearchParams(urlOrQuery: string): URLSearchParams {
  const input = urlOrQuery.trim();
  if (!input) return new URLSearchParams();

  if (input.startsWith("?")) {
    return new URLSearchParams(input.slice(1));
  }

  const queryStart = input.indexOf("?");
  if (queryStart >= 0) {
    const hashStart = input.indexOf("#", queryStart);
    const querySlice =
      hashStart >= 0
        ? input.slice(queryStart + 1, hashStart)
        : input.slice(queryStart + 1);
    return new URLSearchParams(querySlice);
  }

  return new URLSearchParams(input);
}

export function parsePreviewParams(urlOrQuery: string): PreviewParams {
  const params = toSearchParams(urlOrQuery);
  const result: PreviewParams = {};
  params.forEach((value, key) => {
    const normalizedValue = readQueryString(value);
    if (!normalizedValue) return;
    const normalizedKey = key.trim();
    if (!normalizedKey) return;
    result[normalizedKey] = normalizedValue;
  });
  return result;
}

export function appendPreviewQueryToUrl(
  baseUrl: string,
  previewParams: PreviewParams,
): string {
  const url = baseUrl.trim();
  if (!url) return baseUrl;

  const [beforeHash, hash = ""] = url.split("#", 2);
  const [pathPart, queryPart = ""] = beforeHash.split("?", 2);
  const search = new URLSearchParams(queryPart);

  Object.entries(previewParams).forEach(([key, value]) => {
    const normalizedKey = key.trim();
    const normalizedValue = readQueryString(value);
    if (!normalizedKey || !normalizedValue) return;
    search.set(normalizedKey, normalizedValue);
  });

  const query = search.toString();
  const withQuery = query ? `${pathPart}?${query}` : pathPart;
  return hash ? `${withQuery}#${hash}` : withQuery;
}

