export const buildComboClassId = (memberIds: readonly string[]): string =>
  `combo__${memberIds.join("__")}`
