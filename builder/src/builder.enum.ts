export type BlockLayoutMode = "block" | "flex" | "grid" | "absolute";
export type GridAutoFlow = "row" | "column";
/** Для flex: row = row nowrap, column = column nowrap, wrap = row wrap */
export type FlexFlowOption = "row" | "column" | "wrap";
/** justify-content для flex */
export type FlexJustifyContent =
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around";
/** align-items для flex */
export type FlexAlignItems =
  | "flex-start"
  | "flex-end"
  | "center"
  | "stretch"
  | "baseline";
export type PlaceItemsValue = "start" | "center" | "end" | "stretch" | "baseline";
