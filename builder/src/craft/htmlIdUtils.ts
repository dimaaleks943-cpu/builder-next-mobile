export const stripSpacesFromHtmlIdInput = (value: string): string => value.replace(/\s/g, "")

export const normalizeHtmlIdProp = (value: string): string | undefined => {
  const stripped = stripSpacesFromHtmlIdInput(value).trim()

  return stripped.length > 0 ? stripped : undefined
}
