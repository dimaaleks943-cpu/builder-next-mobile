import { type ChangeEvent } from "react"
import type {
  GridAutoFlow,
  PlaceItemsValue,
} from "../../../../../../builder.enum.ts"
import { ZigzagRightIcon } from "../../../../../../icons/ZigzagRightIcon.tsx"
import { COLORS } from "../../../../../../theme/colors.ts"
import { CraftAlignControl } from "../CraftAlignControl/CraftAlignControl.tsx"
import { CraftSettingsButtonGroup } from "../../../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsInput } from "../../../../components/craftSettingsControls/CraftSettingsInput.tsx"
import { CraftSettingsResetLabelWithPopper } from "../../../../components/craftSettingsControls/CraftSettingsResetLabelWithPopper.tsx"
import { LayoutGapControl } from "../LayoutGapControl/LayoutGapControl.tsx"
import {
  parseGridTemplateColumnsCount,
  parseGridTemplateRowsCount,
} from "./utils.ts"
import {
  LayoutGridAutoFlowIconSpin,
  LayoutGridSectionGridInputsArea,
  LayoutGridSectionGridMainLabelColumn,
  LayoutGridSectionGridRow,
  LayoutGridSectionNumericStack,
  LayoutGridSectionRoot,
  LayoutGridSectionSubLabel,
} from "./styles.ts"

const ZIGZAG_ICON_SIZE = 18
const zigzagFill = COLORS.purple400

interface Props {
  gridTemplateColumnsRaw: unknown
  gridTemplateRowsRaw: unknown
  onGridColumnsChange: (event: ChangeEvent<HTMLInputElement>) => void
  onGridRowsChange: (event: ChangeEvent<HTMLInputElement>) => void
  onGridReset: () => void
  gridAutoFlow: GridAutoFlow
  gridAutoFlowHasExplicitStyle: boolean
  onGridAutoFlowChange: (value: GridAutoFlow) => void
  onGridAutoFlowReset: () => void
  alignY: PlaceItemsValue | undefined
  alignX: PlaceItemsValue | undefined
  onAlignChange: (
    alignY: PlaceItemsValue | undefined,
    alignX: PlaceItemsValue | undefined,
  ) => void
  placeItemsHasExplicitStyle: boolean
  onAlignReset: () => void
  gapValue: unknown
  onGapCommit: (next: string | number | undefined) => void
}

const gridHasExplicitStyle = (
  columnsRaw: unknown,
  rowsRaw: unknown,
): boolean => {
  const c =
    typeof columnsRaw === "string" && columnsRaw.trim() !== ""
  const r = typeof rowsRaw === "string" && rowsRaw.trim() !== ""
  return c || r
}

export const LayoutGridSection = ({
  gridTemplateColumnsRaw,
  gridTemplateRowsRaw,
  onGridColumnsChange,
  onGridRowsChange,
  onGridReset,
  gridAutoFlow,
  gridAutoFlowHasExplicitStyle,
  onGridAutoFlowChange,
  onGridAutoFlowReset,
  alignY,
  alignX,
  onAlignChange,
  placeItemsHasExplicitStyle,
  onAlignReset,
  gapValue,
  onGapCommit,
}: Props) => {
  const gridExplicit = gridHasExplicitStyle(
    gridTemplateColumnsRaw,
    gridTemplateRowsRaw,
  )

  return (
    <LayoutGridSectionRoot>
      <LayoutGridSectionGridRow>
        <LayoutGridSectionGridMainLabelColumn>
          <CraftSettingsResetLabelWithPopper
            kind="labelReset"
            label="Grid"
            variant="fixed"
            labelReset={
              gridExplicit
                ? { hasValue: true, onReset: onGridReset }
                : undefined
            }
          />
        </LayoutGridSectionGridMainLabelColumn>
        <LayoutGridSectionGridInputsArea>
          <LayoutGridSectionNumericStack>
            <CraftSettingsInput
              label="Columns"
              hideLabel
              type="number"
              min={1}
              value={
                parseGridTemplateColumnsCount(gridTemplateColumnsRaw) ?? ""
              }
              onChange={onGridColumnsChange}
            />
            <LayoutGridSectionSubLabel>Columns</LayoutGridSectionSubLabel>
          </LayoutGridSectionNumericStack>
          <LayoutGridSectionNumericStack>
            <CraftSettingsInput
              label="Rows"
              hideLabel
              type="number"
              min={1}
              value={parseGridTemplateRowsCount(gridTemplateRowsRaw) ?? ""}
              onChange={onGridRowsChange}
            />
            <LayoutGridSectionSubLabel>Rows</LayoutGridSectionSubLabel>
          </LayoutGridSectionNumericStack>
        </LayoutGridSectionGridInputsArea>
      </LayoutGridSectionGridRow>

      <CraftSettingsButtonGroup
        label="Direction"
        value={gridAutoFlowHasExplicitStyle ? gridAutoFlow : undefined}
        onReset={
          gridAutoFlowHasExplicitStyle ? onGridAutoFlowReset : undefined
        }
        options={[
          {
            id: "row",
            content: (
              <ZigzagRightIcon size={ZIGZAG_ICON_SIZE} fill={zigzagFill} />
            ),
          },
          {
            id: "column",
            content: (
              <LayoutGridAutoFlowIconSpin>
                <ZigzagRightIcon size={ZIGZAG_ICON_SIZE} fill={zigzagFill} />
              </LayoutGridAutoFlowIconSpin>
            ),
          },
        ]}
        onChange={(id) => onGridAutoFlowChange(id as GridAutoFlow)}
      />

      <CraftAlignControl
        label="Align"
        labelReset={
          placeItemsHasExplicitStyle
            ? { hasValue: true, onReset: onAlignReset }
            : undefined
        }
        alignY={alignY}
        alignX={alignX}
        onChange={onAlignChange}
      />

      <LayoutGapControl value={gapValue} onCommit={onGapCommit} />
    </LayoutGridSectionRoot>
  )
}
