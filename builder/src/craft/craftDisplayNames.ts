/**
 * Единый префикс `Craft*` для `craft.displayName` / `node.data.displayName`.
 * Resolver keys (`type.resolvedName`: Body, ContentList, …) не меняем — они задаются ключами в `<Editor resolver>`.
 */
export const CRAFT_DISPLAY_NAME = {
  Block: "CraftBlock",
  Body: "CraftBody",
  Button: "CraftButton",
  Heading: "CraftHeading",
  Paragraph: "CraftParagraph",
  LinkText: "CraftLinkText",
  LinkBlock: "CraftLinkBlock",
  Image: "CraftImage",
  ContentList: "CraftContentList",
  ContentListCell: "CraftContentListCell",
  CategoryFilter: "CraftCategoryFilter",
  Navbar: "CraftNavbar",
} as const
