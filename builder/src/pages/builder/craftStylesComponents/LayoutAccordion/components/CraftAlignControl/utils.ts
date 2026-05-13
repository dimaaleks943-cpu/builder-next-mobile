import type { PlaceItemsValue } from "../../../../../../builder.enum.ts";

export const placeValueToVisualAxisIndex = (v: PlaceItemsValue): 0 | 1 | 2 => {
  if (v === "center") return 1
  if (v === "end") return 2
  return 0
}

interface SelectionGridSpec {
  $rowStart: number
  $rowEnd: number
  $colStart: number
  $colEnd: number
  /** Одна ячейка без baseline — показать внутренний квадратик */
  showInnerSquare: boolean
}

export const getSelectionGridSpec = (
  alignY: PlaceItemsValue,
  alignX: PlaceItemsValue,
): SelectionGridSpec | null => {
  if (alignY === "stretch" && alignX === "stretch") return null

  const yIdx = placeValueToVisualAxisIndex(alignY)
  const xIdx = placeValueToVisualAxisIndex(alignX)

  if (alignX === "stretch" && alignY !== "stretch") {
    const r = yIdx
    return {
      $rowStart: r + 1,
      $rowEnd: r + 2,
      $colStart: 1,
      $colEnd: 4,
      showInnerSquare: false,
    }
  }

  if (alignY === "stretch" && alignX !== "stretch") {
    const c = xIdx
    return {
      $rowStart: 1,
      $rowEnd: 4,
      $colStart: c + 1,
      $colEnd: c + 2,
      showInnerSquare: false,
    }
  }

  return {
    $rowStart: yIdx + 1,
    $rowEnd: yIdx + 2,
    $colStart: xIdx + 1,
    $colEnd: xIdx + 2,
    showInnerSquare: alignY !== "baseline" && alignX !== "baseline",
  }
}
