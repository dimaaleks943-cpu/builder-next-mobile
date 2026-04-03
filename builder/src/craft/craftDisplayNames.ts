/**
 * Единый префикс `Craft*` для `craft.displayName` / `node.data.displayName`.
 * Resolver keys (`type.resolvedName`: Body, ContentList, …) не меняем — они задаются ключами в `<Editor resolver>`.
 */
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
