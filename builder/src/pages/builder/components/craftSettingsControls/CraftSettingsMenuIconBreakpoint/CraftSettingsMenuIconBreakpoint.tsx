import { MODE_TYPE, PreviewViewport } from "../../../builder.enum.ts"
import { useBuilderModeContext } from "../../../context/BuilderModeContext.tsx"
import {
  getNavbarMenuIconBreakpointLabel,
  getNavbarMenuIconBreakpointSteps,
  menuIconBreakpointToSliderIndex,
  sliderIndexToMenuIconBreakpoint,
  type NavbarMenuIconBreakpointValue,
} from "../../../context/navbarMenuContext.tsx"
import { COLORS } from "../../../../../theme/colors.ts"
import { MonitorIcon } from "../../../../../icons/MonitorIcon.tsx"
import { TabletIcon } from "../../../../../icons/TabletIcon.tsx"
import { MobileIcon } from "../../../../../icons/MobileIcon.tsx"
import { EyeHideIcon } from "../../../../../icons/EyeHideIcon.tsx"
import {
  getMenuIconBreakpointStepMeta,
  type MenuIconBreakpointStepMeta,
} from "./menuIconBreakpointIcons.ts"
import {
  MenuIconBreakpointDeviceButton,
  MenuIconBreakpointHeaderLabel,
  MenuIconBreakpointHeaderRow,
  MenuIconBreakpointHeaderValue,
  MenuIconBreakpointIconsRow,
  MenuIconBreakpointRoot,
  MenuIconBreakpointSlider,
} from "./styles.ts"

interface Props {
  value: NavbarMenuIconBreakpointValue
  onChange: (value: NavbarMenuIconBreakpointValue) => void
}

const renderStepIcon = (
  meta: MenuIconBreakpointStepMeta,
  fill: string,
) => {
  switch (meta.icon) {
    case "monitor":
      return <MonitorIcon fill={fill} />
    case "tablet":
      return <TabletIcon fill={fill} />
    case "mobile":
      return <MobileIcon fill={fill} />
    case "eyeHide":
      return <EyeHideIcon size={16} fill={fill} />
    default:
      return null
  }
}

export const CraftSettingsMenuIconBreakpoint = ({ value, onChange }: Props) => {
  const modeContext = useBuilderModeContext()
  const isRn = modeContext?.mode === MODE_TYPE.RN
  const displayValue =
    isRn && value === PreviewViewport.DESKTOP
      ? PreviewViewport.TABLET_LANDSCAPE
      : value
  const steps = getNavbarMenuIconBreakpointSteps(isRn)
  const sliderIndex = menuIconBreakpointToSliderIndex(displayValue, isRn)
  const maxIndex = steps.length - 1

  const handleSliderChange = (_: Event, next: number | number[]) => {
    const index = typeof next === "number" ? next : next[0] ?? 0
    onChange(sliderIndexToMenuIconBreakpoint(index, isRn))
  }

  const handleBreakpointSelect = (breakpoint: NavbarMenuIconBreakpointValue) => {
    onChange(breakpoint)
  }

  const isActive = (breakpoint: NavbarMenuIconBreakpointValue) =>
    displayValue === breakpoint

  const activeFill = (breakpoint: NavbarMenuIconBreakpointValue) =>
    isActive(breakpoint) ? COLORS.purple400 : COLORS.gray600

  return (
    <MenuIconBreakpointRoot>
      <MenuIconBreakpointHeaderRow>
        <MenuIconBreakpointHeaderLabel>Menu icon for:</MenuIconBreakpointHeaderLabel>
        <MenuIconBreakpointHeaderValue>
          {getNavbarMenuIconBreakpointLabel(displayValue)}
        </MenuIconBreakpointHeaderValue>
      </MenuIconBreakpointHeaderRow>

      <MenuIconBreakpointIconsRow $columnCount={steps.length}>
        {steps.map((step) => {
          const meta = getMenuIconBreakpointStepMeta(step)

          return (
            <MenuIconBreakpointDeviceButton
              key={step}
              onClick={() => handleBreakpointSelect(step)}
              size="small"
              title={meta.title}
              aria-label={meta.ariaLabel}
              disableRipple
              $active={isActive(step)}
              $rotated={meta.rotated}
            >
              {renderStepIcon(meta, activeFill(step))}
            </MenuIconBreakpointDeviceButton>
          )
        })}
      </MenuIconBreakpointIconsRow>

      <MenuIconBreakpointSlider
        size="small"
        value={sliderIndex}
        min={0}
        max={maxIndex}
        step={1}
        onChange={handleSliderChange}
      />
    </MenuIconBreakpointRoot>
  )
}
