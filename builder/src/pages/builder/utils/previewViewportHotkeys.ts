import { PreviewViewport } from "../builder.enum"

export const PREVIEW_HOTKEY_KEYS_WEB = new Set(["1", "2", "3", "4", "5"])
export const PREVIEW_HOTKEY_KEYS_RN = new Set(["1", "2", "3", "4"])

function isInsideModalDialog(element: Element | null): boolean {
  let current: Element | null = element
  while (current) {
    if (
      current.getAttribute("role") === "dialog" ||
      current.getAttribute("aria-modal") === "true"
    ) {
      return true
    }
    current = current.parentElement
  }
  return false
}

/** `true` if the preview viewport shortcut must not be handled (modifiers, inputs, dialogs). */
export function suppressPreviewHotkey(event: KeyboardEvent): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return true

  const active = document.activeElement
  if (!active || !(active instanceof HTMLElement)) return false

  const tag = active.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
  if (active.getAttribute("contenteditable") === "true") return true
  if (isInsideModalDialog(active)) return true

  return false
}

export function keyToPreviewViewport(
  key: string,
  isRn: boolean,
): PreviewViewport | null {
  if (isRn) {
    switch (key) {
      case "1":
        return PreviewViewport.TABLET_LANDSCAPE
      case "2":
        return PreviewViewport.TABLET
      case "3":
        return PreviewViewport.PHONE_LANDSCAPE
      case "4":
        return PreviewViewport.PHONE
      default:
        return null
    }
  }
  switch (key) {
    case "1":
      return PreviewViewport.DESKTOP
    case "2":
      return PreviewViewport.TABLET_LANDSCAPE
    case "3":
      return PreviewViewport.TABLET
    case "4":
      return PreviewViewport.PHONE_LANDSCAPE
    case "5":
      return PreviewViewport.PHONE
    default:
      return null
  }
}
