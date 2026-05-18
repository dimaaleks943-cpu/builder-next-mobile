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

export const buildCraftPageCss = (
  ...parseResults: CraftContentParseResult[]
): string => {
  const styleClasses = Object.assign(
    {},
    ...parseResults.map((result) => result.styleClasses),
  )
  const orphanStyleNodes = parseResults.flatMap(
    (result) => result.orphanStyleNodes,
  )
  const stacksFromNodes = parseResults.flatMap(
    (result) => result.stackedStyleClassIds,
  )
  const uniqueStacks = dedupeStacks([
    ...stacksFromNodes,
    ...collectStacksFromRegistry(styleClasses),
  ])

  return (
    buildStyleClassesCss(styleClasses) +
    buildStackedClassesCss(uniqueStacks, styleClasses) +
    buildOrphanNodeCss(orphanStyleNodes)
  )
}
