export type GridAutoFlow = "row" | "column";
/** `flex-flow` в craft — строка как в CSS shorthand (доверяем данным компонента). */
export type FlexFlowOption =
  | "row"
  | "column"
  | "row wrap"
  | "row wrap-reverse"
  | "row-reverse"
  | "row-reverse wrap"
  | "row-reverse wrap-reverse"
  | "column wrap"
  | "column wrap-reverse"
  | "column-reverse"
  | "column-reverse wrap"
  | "column-reverse wrap-reverse";
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
