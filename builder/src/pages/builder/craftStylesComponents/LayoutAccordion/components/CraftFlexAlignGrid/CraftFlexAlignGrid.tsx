/**
 * Визуальный грид выравнивания; значения в крафт пишутся родителем в `responsiveStyle`
 * как прямые ключи React/CSS: `justifyContent`, `alignItems` (см. LayoutAccordion).
 */
import {
  FlexAlignBarHorizontal,
  FlexAlignBarVertical,
  FlexAlignClusterCol,
  FlexAlignClusterRow,
  FlexAlignDistributedBarWrap,
  FlexAlignGridCell,
  FlexAlignGridDot,
  FlexAlignGridRoot,
  FlexAlignSpaceAroundOverlay,
  FlexAlignStretchBarHorizontalFull,
  FlexAlignStretchBarVerticalFull,
  FlexAlignStretchBarsOuter,
  FlexAlignStretchTray,
} from "./CraftFlexAlignGrid.styles.ts"
import type { FlexAlignItems, FlexJustifyContent } from "../../../../../../builder.enum.ts";
import { FlexAlignSpaceAroundArrow } from "../../../../components/craftSettingsControls/styles.ts";
import { COLORS } from "../../../../../../theme/colors.ts";

const JUSTIFY_VALUES: FlexJustifyContent[] = [
  "flex-start",
  "center",
  "flex-end",
]

const alignToGrid3 = (a: FlexAlignItems): 0 | 1 | 2 => {
  if (a === "flex-start") return 0
  if (a === "center") return 1
  if (a === "flex-end") return 2
  return 0
}

type StretchOuterJustify =
  | "flex-start"
  | "center"
  | "flex-end"
  | "space-between"
  | "space-around"

interface Props {
  isRowLike: boolean
  justifyContent: FlexJustifyContent | undefined
  alignItems: FlexAlignItems | undefined
  onCellClick: (rowIndex: number, colIndex: number) => void
}

const ClusterBarsRowMode = () => (
  <FlexAlignClusterRow>
    <FlexAlignBarVertical sx={{ height: "7px" }} />
    <FlexAlignBarVertical sx={{ height: "11px" }} />
    <FlexAlignBarVertical sx={{ height: "8px" }} />
  </FlexAlignClusterRow>
)

const ClusterBarsColumnMode = () => (
  <FlexAlignClusterCol>
    <FlexAlignBarHorizontal sx={{ width: "9px" }} />
    <FlexAlignBarHorizontal sx={{ width: "13px" }} />
    <FlexAlignBarHorizontal sx={{ width: "7px" }} />
  </FlexAlignClusterCol>
)

const DistributedVerticalBar = () => (
  <FlexAlignDistributedBarWrap>
    <FlexAlignBarVertical sx={{ height: "65%" }} />
  </FlexAlignDistributedBarWrap>
)

const DistributedHorizontalBar = () => (
  <FlexAlignDistributedBarWrap>
    <FlexAlignBarHorizontal sx={{ width: "65%" }} />
  </FlexAlignDistributedBarWrap>
)

const ThreeStretchBarsRow = () => (
  <>
    <FlexAlignStretchBarVerticalFull />
    <FlexAlignStretchBarVerticalFull />
    <FlexAlignStretchBarVerticalFull />
  </>
)

const ThreeStretchBarsColumn = () => (
  <>
    <FlexAlignStretchBarHorizontalFull />
    <FlexAlignStretchBarHorizontalFull />
    <FlexAlignStretchBarHorizontalFull />
  </>
)

const resolveStretchOuterJustify = (
  j: FlexJustifyContent,
): { justify: StretchOuterJustify; grouped: boolean } => {
  if (j === "flex-start" || j === "center" || j === "flex-end") {
    return { justify: j, grouped: true }
  }
  if (j === "space-between" || j === "space-around") {
    return { justify: j, grouped: false }
  }
  return { justify: "flex-start", grouped: true }
}

export const CraftFlexAlignGrid = ({
  isRowLike,
  justifyContent,
  alignItems,
  onCellClick,
}: Props) => {
  const effectiveJustify: FlexJustifyContent = justifyContent ?? "flex-start"
  const effectiveAlign: FlexAlignItems = alignItems ?? "stretch"
  const isCrossStretch = effectiveAlign === "stretch"
  const isSpaceDistributed =
    effectiveJustify === "space-between" || effectiveJustify === "space-around"
  const showSpaceAroundArrows =
    isSpaceDistributed && effectiveJustify === "space-around"

  const justifyIdx = JUSTIFY_VALUES.indexOf(
    effectiveJustify as (typeof JUSTIFY_VALUES)[number],
  )
  const inMainAxisTriple =
    justifyIdx >= 0 && justifyIdx <= 2 && !isSpaceDistributed

  const crossRow = alignToGrid3(effectiveAlign)
  const crossCol = alignToGrid3(effectiveAlign)

  const clusterRow = isRowLike ? crossRow : justifyIdx
  const clusterCol = isRowLike ? justifyIdx : crossCol

  const distributedAlignRow = crossRow
  const distributedAlignCol = crossCol

  const { justify: stretchOuterJustify, grouped: stretchGrouped } =
    resolveStretchOuterJustify(effectiveJustify)

  const renderStretchOverlay = () => {
    if (!isCrossStretch) return null
    if (isRowLike) {
      return (
        <FlexAlignStretchBarsOuter
          $isRow
          $justify={stretchOuterJustify}
          $grouped={stretchGrouped}
        >
          {stretchGrouped ? (
            <FlexAlignStretchTray $isRow>
              <ThreeStretchBarsRow />
            </FlexAlignStretchTray>
          ) : (
            <ThreeStretchBarsRow />
          )}
        </FlexAlignStretchBarsOuter>
      )
    }
    return (
      <FlexAlignStretchBarsOuter
        $isRow={false}
        $justify={stretchOuterJustify}
        $grouped={stretchGrouped}
      >
        {stretchGrouped ? (
          <FlexAlignStretchTray $isRow={false}>
            <ThreeStretchBarsColumn />
          </FlexAlignStretchTray>
        ) : (
          <ThreeStretchBarsColumn />
        )}
      </FlexAlignStretchBarsOuter>
    )
  }

  const renderCell = (rowIndex: number, colIndex: number) => {
    if (isCrossStretch) {
      return <FlexAlignGridDot />
    }

    if (isSpaceDistributed) {
      if (isRowLike && rowIndex === distributedAlignRow) {
        return <DistributedVerticalBar />
      }
      if (!isRowLike && colIndex === distributedAlignCol) {
        return <DistributedHorizontalBar />
      }
      return <FlexAlignGridDot />
    }

    if (
      inMainAxisTriple &&
      rowIndex === clusterRow &&
      colIndex === clusterCol
    ) {
      return isRowLike ? <ClusterBarsRowMode /> : <ClusterBarsColumnMode />
    }

    return <FlexAlignGridDot />
  }

  const cells = [0, 1, 2].flatMap((rowIndex) =>
    [0, 1, 2].map((colIndex) => (
      <FlexAlignGridCell
        key={`${rowIndex}-${colIndex}`}
        type="button"
        onClick={() => onCellClick(rowIndex, colIndex)}
      >
        {renderCell(rowIndex, colIndex)}
      </FlexAlignGridCell>
    )),
  )

  return (
    <FlexAlignGridRoot>
      {cells}
      {renderStretchOverlay()}
      {showSpaceAroundArrows && (
        <FlexAlignSpaceAroundOverlay>
          {isRowLike ? (
            <>
              <FlexAlignSpaceAroundArrow
                sx={{
                  left: "2px",
                  top: "43%",
                  borderTop: "4px solid transparent",
                  borderBottom: "4px solid transparent",
                  borderRight: `6px solid ${COLORS.gray400}`,
                }}
              />
              <FlexAlignSpaceAroundArrow
                sx={{
                  right: "2px",
                  top: "43%",
                  borderTop: "4px solid transparent",
                  borderBottom: "4px solid transparent",
                  borderLeft: `6px solid ${COLORS.gray400}`,
                }}
              />
            </>
          ) : (
            <>
              <FlexAlignSpaceAroundArrow
                sx={{
                  top: "2px",
                  left: "43%",
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderBottom: `6px solid ${COLORS.gray400}`,
                }}
              />
              <FlexAlignSpaceAroundArrow
                sx={{
                  bottom: "2px",
                  left: "43%",
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderTop: `6px solid ${COLORS.gray400}`,
                }}
              />
            </>
          )}
        </FlexAlignSpaceAroundOverlay>
      )}
    </FlexAlignGridRoot>
  )
}
