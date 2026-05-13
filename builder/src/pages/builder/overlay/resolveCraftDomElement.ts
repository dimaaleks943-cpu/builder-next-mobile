/** Craft.js иногда хранит в `node.dom` не сам узел, а ref-подобный объект (`{ current: Element }`). */
export const resolveCraftDomElement = (dom: unknown): HTMLElement | null => {
  if (dom == null) return null
  if (typeof Element !== "undefined" && dom instanceof Element) {
    return dom as HTMLElement
  }
  if (typeof dom === "object" && dom !== null && "current" in dom) {
    const c = (dom as { current: unknown }).current
    if (c != null && typeof Element !== "undefined" && c instanceof Element) {
      return c as HTMLElement
    }
  }
  const rec = dom as { nodeType?: unknown; getBoundingClientRect?: unknown }
  if (
    rec.nodeType === 1 &&
    typeof rec.getBoundingClientRect === "function"
  ) {
    return dom as HTMLElement
  }
  return null
}
