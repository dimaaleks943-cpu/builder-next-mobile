/** Matches builder `CRAFT_DISPLAY_NAME` / node `displayName` for intrinsic styles. */
export const CRAFT_DISPLAY_NAME = {
  Block: "CraftBlock",
  Body: "CraftBody",
  Text: "CraftText",
  LinkText: "CraftLinkText",
  Image: "CraftImage",
  ContentList: "CraftContentList",
  ContentListCell: "CraftContentListCell",
  CategoryFilter: "CraftCategoryFilter",
} as const

const RESOLVER_TO_DISPLAY: Record<string, string> = {
  Block: CRAFT_DISPLAY_NAME.Block,
  Body: CRAFT_DISPLAY_NAME.Body,
  Text: CRAFT_DISPLAY_NAME.Text,
  LinkText: CRAFT_DISPLAY_NAME.LinkText,
  Image: CRAFT_DISPLAY_NAME.Image,
  ContentList: CRAFT_DISPLAY_NAME.ContentList,
  ContentListCell: CRAFT_DISPLAY_NAME.ContentListCell,
  CategoryFilter: CRAFT_DISPLAY_NAME.CategoryFilter,
  [CRAFT_DISPLAY_NAME.Block]: CRAFT_DISPLAY_NAME.Block,
  [CRAFT_DISPLAY_NAME.Body]: CRAFT_DISPLAY_NAME.Body,
  [CRAFT_DISPLAY_NAME.Text]: CRAFT_DISPLAY_NAME.Text,
  [CRAFT_DISPLAY_NAME.LinkText]: CRAFT_DISPLAY_NAME.LinkText,
  [CRAFT_DISPLAY_NAME.Image]: CRAFT_DISPLAY_NAME.Image,
  [CRAFT_DISPLAY_NAME.ContentList]: CRAFT_DISPLAY_NAME.ContentList,
  [CRAFT_DISPLAY_NAME.ContentListCell]: CRAFT_DISPLAY_NAME.ContentListCell,
  [CRAFT_DISPLAY_NAME.CategoryFilter]: CRAFT_DISPLAY_NAME.CategoryFilter,
}

export const resolveCraftDisplayName = (
  componentType: string,
  nodeDisplayName?: string,
): string => {
  if (nodeDisplayName && RESOLVER_TO_DISPLAY[nodeDisplayName]) {
    return nodeDisplayName
  }
  return RESOLVER_TO_DISPLAY[componentType] ?? componentType
}
