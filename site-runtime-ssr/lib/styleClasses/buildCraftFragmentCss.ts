import type { CraftContentParseResult } from "../craftContentToComponents"
import { buildComboClassId } from "./comboClassId"
import { buildOrphanNodeCss } from "./buildOrphanNodeCss"
import {
  buildStackedClassesCss,
  collectStacksFromRegistry,
} from "./buildStackedClassesCss"
import { buildStyleClassesCss } from "./buildStyleClassesCss"

const dedupeStacks = (stacks: readonly (readonly string[])[]): string[][] => {
  const seen = new Set<string>()
  const out: string[][] = []
  for (const ids of stacks) {
    if (ids.length < 2) continue
    const key = buildComboClassId(ids)
    if (seen.has(key)) continue
    seen.add(key)
    out.push([...ids])
  }
  return out
}

export const buildCraftFragmentCss = (
  result: CraftContentParseResult,
): string => {
  const { fragmentScope, styleClasses, orphanStyleNodes, stackedStyleClassIds } =
    result
  const uniqueStacks = dedupeStacks([
    ...stackedStyleClassIds,
    ...collectStacksFromRegistry(styleClasses),
  ])

  return (
    buildStyleClassesCss(styleClasses, fragmentScope) +
    buildStackedClassesCss(uniqueStacks, styleClasses, fragmentScope) +
    buildOrphanNodeCss(orphanStyleNodes)
  )
}
