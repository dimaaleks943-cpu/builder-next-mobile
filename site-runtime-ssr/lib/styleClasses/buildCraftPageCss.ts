import type { CraftContentParseResult } from "../craftContentToComponents"
import { buildCraftFragmentCss } from "./buildCraftFragmentCss"

export const buildCraftPageCss = (
  ...parseResults: CraftContentParseResult[]
): string =>
  parseResults.map((result) => buildCraftFragmentCss(result)).join("")
