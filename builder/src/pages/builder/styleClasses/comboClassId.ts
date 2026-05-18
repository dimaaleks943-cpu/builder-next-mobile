/** Stable id for a combo style class derived from member base class ids (order matters). */
export const buildComboClassId = (memberIds: readonly string[]): string =>
  `combo__${memberIds.join("__")}`
