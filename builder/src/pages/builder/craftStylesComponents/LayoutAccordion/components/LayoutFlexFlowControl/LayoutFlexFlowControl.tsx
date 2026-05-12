import { Box, MenuList } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useCallback, useMemo, useState, type MouseEvent, type ReactNode } from "react"
import type { FlexFlowOption } from "../../../../../../builder.enum.ts"
import { ArrowRightIcon } from "../../../../../../icons/ArrowRightIcon.tsx"
import { ChevronRightIcon } from "../../../../../../icons/ChevronRightIcon.tsx"
import { ZigzagRightIcon } from "../../../../../../icons/ZigzagRightIcon.tsx"
import { COLORS } from "../../../../../../theme/colors.ts"
import {
  CraftSettingsResetLabelWithPopper
} from "../../../../components/craftSettingsControls/CraftSettingsResetLabelWithPopper.tsx"
import {
  flexFlowToCssValue,
  isPrimaryColumnActive,
  isPrimaryRowActive,
  isThirdSegmentActive,
} from "../../../../../../utils/flexFlowDerived.ts"
import {
  LayoutFlexFlowIconSpin,
  LayoutFlexFlowMenu,
  LayoutFlexFlowMenuFooter,
  LayoutFlexFlowMenuItem,
  LayoutFlexFlowMenuItemIcon,
  LayoutFlexFlowMenuSection,
  LayoutFlexFlowMenuTrigger,
  LayoutFlexFlowRow,
  LayoutFlexFlowSegmentBtn,
  LayoutFlexFlowSegmented,
} from "./styles.ts"

const ZIGZAG_ICON_SIZE = 18
const ARROW_ICON_SIZE = 16
const fill = COLORS.purple400

const normalizeStored = (v: string) => v.trim()

interface Props {
  label: string
  value: FlexFlowOption
  onChange: (next: FlexFlowOption) => void
  onReset: () => void
  hasExplicitStyle: boolean
}

type MenuEntry = { value: FlexFlowOption; label: string; icon: ReactNode }

const RowWrapUpGlyph = () => (
  <LayoutFlexFlowIconSpin sx={{ transform: "scaleX(-1) rotate(180deg)" }}>
    <ZigzagRightIcon size={ZIGZAG_ICON_SIZE} fill={fill}/>
  </LayoutFlexFlowIconSpin>
)

const ArrowLeftGlyph = () => (
  <LayoutFlexFlowIconSpin $rotate={180}>
    <ArrowRightIcon size={ARROW_ICON_SIZE} fill={fill}/>
  </LayoutFlexFlowIconSpin>
)

const RowRevWrapDownGlyph = () => (
  <LayoutFlexFlowIconSpin sx={{ transform: "scaleX(-1)" }}>
    <ZigzagRightIcon size={ZIGZAG_ICON_SIZE} fill={fill}/>
  </LayoutFlexFlowIconSpin>
)

const RowRevWrapUpGlyph = () => (
  <LayoutFlexFlowIconSpin sx={{ transform: "rotate(180deg)" }}>
    <ZigzagRightIcon size={ZIGZAG_ICON_SIZE} fill={fill}/>
  </LayoutFlexFlowIconSpin>
)

const ArrowUpGlyph = () => (
  <LayoutFlexFlowIconSpin $rotate={-90}>
    <ArrowRightIcon size={ARROW_ICON_SIZE} fill={fill}/>
  </LayoutFlexFlowIconSpin>
)

const ColWrapRightGlyph = () => (
  <LayoutFlexFlowIconSpin sx={{ transform: "scaleX(-1) rotate(90deg)" }}>
    <ZigzagRightIcon size={ZIGZAG_ICON_SIZE} fill={fill}/>
  </LayoutFlexFlowIconSpin>
)

const ColWrapLeftGlyph = () => (
  <LayoutFlexFlowIconSpin sx={{ transform: "rotate(90deg)" }}>
    <ZigzagRightIcon size={ZIGZAG_ICON_SIZE} fill={fill}/>
  </LayoutFlexFlowIconSpin>
)

const ColRevWrapRightGlyph = () => (
  <LayoutFlexFlowIconSpin sx={{ transform: "rotate(270deg)" }}>
    <ZigzagRightIcon size={ZIGZAG_ICON_SIZE} fill={fill}/>
  </LayoutFlexFlowIconSpin>
)

const ColRevWrapLeftGlyph = () => (
  <LayoutFlexFlowIconSpin sx={{ transform: "scaleX(-1) rotate(270deg)" }}>
    <ZigzagRightIcon size={ZIGZAG_ICON_SIZE} fill={fill}/>
  </LayoutFlexFlowIconSpin>
)

const MENU_SECTIONS: { title: string; items: MenuEntry[] }[] = [
  {
    title: "Left to right",
    items: [
      { value: "row wrap", label: "Wrap down", icon: <ZigzagRightIcon size={ZIGZAG_ICON_SIZE} fill={fill}/> },
      { value: "row wrap-reverse", label: "Wrap up", icon: <RowWrapUpGlyph/> },
    ],
  },
  {
    title: "Right to left",
    items: [
      { value: "row-reverse", label: "Single row", icon: <ArrowLeftGlyph/> },
      { value: "row-reverse wrap", label: "Wrap down", icon: <RowRevWrapDownGlyph/> },
      { value: "row-reverse wrap-reverse", label: "Wrap up", icon: <RowRevWrapUpGlyph/> },
    ],
  },
  {
    title: "Top to bottom",
    items: [
      { value: "column wrap", label: "Wrap right", icon: <ColWrapRightGlyph/> },
      { value: "column wrap-reverse", label: "Wrap left", icon: <ColWrapLeftGlyph/> },
    ],
  },
  {
    title: "Bottom to top",
    items: [
      { value: "column-reverse", label: "Single column", icon: <ArrowUpGlyph/> },
      { value: "column-reverse wrap", label: "Wrap right", icon: <ColRevWrapRightGlyph/> },
      { value: "column-reverse wrap-reverse", label: "Wrap left", icon: <ColRevWrapLeftGlyph/> },
    ],
  },
]

const thirdSegmentIcon = (flexFlow: string): ReactNode => {
  const n = normalizeStored(flexFlow)
  if (isPrimaryRowActive(flexFlow)) {
    return <ZigzagRightIcon size={ZIGZAG_ICON_SIZE} fill={fill}/>
  }
  if (isPrimaryColumnActive(flexFlow)) {
    return <ColWrapRightGlyph/>
  }
  switch (n) {
    case "row wrap":
      return <ZigzagRightIcon size={ZIGZAG_ICON_SIZE} fill={fill}/>
    case "row wrap-reverse":
      return <RowWrapUpGlyph/>
    case "row-reverse":
      return <ArrowLeftGlyph/>
    case "row-reverse wrap":
      return <RowRevWrapDownGlyph/>
    case "row-reverse wrap-reverse":
      return <RowRevWrapUpGlyph/>
    case "column wrap":
      return <ColWrapRightGlyph/>
    case "column wrap-reverse":
      return <ColWrapLeftGlyph/>
    case "column-reverse":
      return <ArrowUpGlyph/>
    case "column-reverse wrap":
      return <ColRevWrapRightGlyph/>
    case "column-reverse wrap-reverse":
      return <ColRevWrapLeftGlyph/>
    default:
      return <ZigzagRightIcon size={ZIGZAG_ICON_SIZE} fill={fill}/>
  }
}

export const LayoutFlexFlowControl = ({
  label,
  value,
  onChange,
  onReset,
  hasExplicitStyle,
}: Props) => {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const menuModalZIndex = theme.zIndex.modal + 50

  const handleOpen = useCallback((event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handlePick = useCallback(
    (next: FlexFlowOption) => {
      onChange(next)
      handleClose()
    },
    [handleClose, onChange],
  )

  const rowActive = useMemo(() => isPrimaryRowActive(value), [value])
  const colActive = useMemo(() => isPrimaryColumnActive(value), [value])
  const thirdActive = useMemo(() => isThirdSegmentActive(value), [value])

  const handleThirdClick = useCallback(() => {
    const v = value
    if (v === "row" || v === "row wrap") {
      onChange(v === "row" ? "row wrap" : "row")
      return
    }
    if (v === "column" || v === "column wrap") {
      onChange(v === "column" ? "column wrap" : "column")
      return
    }
  }, [onChange, value])

  const normalizedValue = normalizeStored(value)
  const menuHasSelection = useMemo(
    () =>
      MENU_SECTIONS.some((sec) =>
        sec.items.some((it) => normalizeStored(it.value) === normalizedValue),
      ),
    [normalizedValue],
  )

  const fourthAria = menuHasSelection
    ? `Дополнительно: ${flexFlowToCssValue(value)}`
    : "Дополнительные варианты flex-flow"

  return (
    <LayoutFlexFlowRow sx={{ gap: "8px" }}>
      <CraftSettingsResetLabelWithPopper
        kind="buttonToggle"
        label={label}
        withoutLabel={false}
        onReset={onReset}
        hasResettableValue={hasExplicitStyle}
      />
      <LayoutFlexFlowSegmented>
        <LayoutFlexFlowSegmentBtn
          type="button"
          $active={rowActive}
          onClick={() => onChange("row")}
          aria-label="Flex direction row"
        >
          <ArrowRightIcon size={ARROW_ICON_SIZE} fill={fill}/>
        </LayoutFlexFlowSegmentBtn>
        <LayoutFlexFlowSegmentBtn
          type="button"
          $active={colActive}
          onClick={() => onChange("column")}
          aria-label="Flex direction column"
        >
          <LayoutFlexFlowIconSpin $rotate={90}>
            <ArrowRightIcon size={ARROW_ICON_SIZE} fill={fill}/>
          </LayoutFlexFlowIconSpin>
        </LayoutFlexFlowSegmentBtn>
        <LayoutFlexFlowSegmentBtn
          type="button"
          $active={thirdActive}
          onClick={handleThirdClick}
          aria-label="Flex wrap"
        >
          {thirdSegmentIcon(value)}
        </LayoutFlexFlowSegmentBtn>
        <LayoutFlexFlowMenuTrigger
          type="button"
          $active={open}
          onClick={handleOpen}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          aria-label={fourthAria}
        >
          <LayoutFlexFlowIconSpin $rotate={90}>
            <ChevronRightIcon size={12}/>
          </LayoutFlexFlowIconSpin>
        </LayoutFlexFlowMenuTrigger>
      </LayoutFlexFlowSegmented>
      <LayoutFlexFlowMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        disableAutoFocusItem
        slotProps={{
          root: {
            sx: { zIndex: menuModalZIndex, padding: 0 },
          },
        }}
        sx={{ "& .MuiMenu-list": { padding: 0 } }}
      >
        <MenuList dense disablePadding>
          {MENU_SECTIONS.map((section) => (
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }} key={section.title}>
              <LayoutFlexFlowMenuSection disableSticky>
                {section.title}
              </LayoutFlexFlowMenuSection>
              {section.items.map((row) => (
                <LayoutFlexFlowMenuItem
                  key={row.value}
                  selected={normalizeStored(row.value) === normalizedValue}
                  onClick={() => handlePick(row.value)}
                  title={flexFlowToCssValue(row.value)}
                >
                  <LayoutFlexFlowMenuItemIcon>{row.icon}</LayoutFlexFlowMenuItemIcon>
                  {row.label}
                </LayoutFlexFlowMenuItem>
              ))}
            </Box>
          ))}
        </MenuList>
        <LayoutFlexFlowMenuFooter>
          Hover an option to see direction and wrap values.
        </LayoutFlexFlowMenuFooter>
      </LayoutFlexFlowMenu>
    </LayoutFlexFlowRow>
  )
}
