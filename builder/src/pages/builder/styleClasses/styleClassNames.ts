import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts"
import type { StyleClassesRegistry } from "./types.ts"

const DISPLAY_LABEL: Record<string, string> = {
  [CRAFT_DISPLAY_NAME.Block]: "Block",
  [CRAFT_DISPLAY_NAME.Body]: "Body",
  [CRAFT_DISPLAY_NAME.Heading]: "Heading",
  [CRAFT_DISPLAY_NAME.LinkText]: "Link Text",
  [CRAFT_DISPLAY_NAME.Image]: "Image",
  [CRAFT_DISPLAY_NAME.ContentList]: "Content List",
  [CRAFT_DISPLAY_NAME.ContentListCell]: "List Cell",
  [CRAFT_DISPLAY_NAME.CategoryFilter]: "Category Filter",
}

const getStyleClassDisplayLabel = (resolvedName: string): string =>
  DISPLAY_LABEL[resolvedName] ?? resolvedName.replace(/^Craft/, "")

export const createStyleClassName = (
  resolvedName: string,
  registry: StyleClassesRegistry,
): string => {
  const base = getStyleClassDisplayLabel(resolvedName)
  const prefix = `${base} `
  const usedNumbers = Object.values(registry)
    .filter((c) => c.resolvedName === resolvedName && c.name.startsWith(prefix))
    .map((c) => {
      const suffix = c.name.slice(prefix.length)
      const n = Number(suffix)
      return Number.isFinite(n) ? n : 0
    })
  const next = usedNumbers.length === 0 ? 1 : Math.max(...usedNumbers) + 1
  return `${base} ${next}`
}

export const createStyleClassId = (): string =>
  `sc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
