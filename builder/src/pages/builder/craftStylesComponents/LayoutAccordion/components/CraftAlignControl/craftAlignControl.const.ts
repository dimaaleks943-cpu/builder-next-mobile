import type { PlaceItemsValue } from "../../../../../../builder.enum.ts";

export const X_OPTIONS: { id: string; value: string }[] = [
  { id: "left", value: "Left" },
  { id: "center", value: "Center" },
  { id: "right", value: "Right" },
  { id: "stretch", value: "Stretch" },
  { id: "baseline", value: "Baseline" },
]

export const Y_OPTIONS: { id: string; value: string }[] = [
  { id: "top", value: "Top" },
  { id: "center", value: "Center" },
  { id: "bottom", value: "Bottom" },
  { id: "stretch", value: "Stretch" },
  { id: "baseline", value: "Baseline" },
]

export const DISPLAY_TO_CSS: Record<string, PlaceItemsValue> = {
  left: "start",
  right: "end",
  top: "start",
  bottom: "end",
  center: "center",
  stretch: "stretch",
  baseline: "baseline",
}

export const CSS_TO_X_DISPLAY: Record<PlaceItemsValue, string> = {
  start: "left",
  end: "right",
  center: "center",
  stretch: "stretch",
  baseline: "baseline",
}

export const CSS_TO_Y_DISPLAY: Record<PlaceItemsValue, string> = {
  start: "top",
  end: "bottom",
  center: "center",
  stretch: "stretch",
  baseline: "baseline",
}

export const GRID_POSITIONS: { y: PlaceItemsValue; x: PlaceItemsValue }[][] = [
  [
    { y: "start", x: "start" },
    { y: "start", x: "center" },
    { y: "start", x: "end" },
  ],
  [
    { y: "center", x: "start" },
    { y: "center", x: "center" },
    { y: "center", x: "end" },
  ],
  [
    { y: "end", x: "start" },
    { y: "end", x: "center" },
    { y: "end", x: "end" },
  ],
]

