import { Popper } from "@mui/material"
import { CraftSettingsStyleResetFooter } from "./CraftSettingsStyleResetFooter.tsx"
import {
  CraftSettingsFixedLabel,
  CraftSettingsResetPopoverPaper,
  CraftSettingsResetToggleLabelButton,
  CraftSettingsResetTriggerFixedLabel,
  CraftSettingsResetTriggerFluidLabel,
} from "./styles.ts"
import { useCraftSettingsLabelResetPopper } from "./useCraftSettingsLabelResetPopper.ts"

interface ILabelResetFieldProps {
  kind: "labelReset";
  label: string;
  /** When true, render nothing */
  hidden?: boolean;
  variant: "fixed" | "fluid";
  labelReset?: {
    hasValue: boolean;
    onReset: () => void;
  };
  disableResetPopperPortal?: boolean;
}

interface IButtonToggleProps {
  kind: "buttonToggle";
  label: string;
  withoutLabel: boolean;
  onReset?: () => void;
  hasResettableValue: boolean;
  /** Keep reset UI in the DOM tree (needed inside nested poppers so outside-click handlers still see clicks). */
  disableResetPopperPortal?: boolean;
}

export type Props =
  | ILabelResetFieldProps
  | IButtonToggleProps

export const CraftSettingsResetLabelWithPopper = (props: Props) => {
  const resetEnabled =
    props.kind === "buttonToggle"
      ? Boolean(props.onReset) && !props.withoutLabel
      : Boolean(props.labelReset?.hasValue) && !props.hidden

  const anchorActive =
    props.kind === "buttonToggle"
      ? true
      : Boolean(props.labelReset?.hasValue)

  const anchorClickMode =
    props.kind === "buttonToggle" ? "toggle" : "set"

  const {
    resetAnchorEl,
    resetPaperRef,
    handleAnchorClick,
    closePopper,
  } = useCraftSettingsLabelResetPopper({
    resetEnabled,
    anchorActive,
    anchorClickMode,
  })

  const handleFooterReset = () => {
    if (props.kind === "labelReset") {
      props.labelReset?.onReset()
    } else {
      props.onReset?.()
    }
    closePopper()
  }

  const disablePortal =
    props.kind === "labelReset"
      ? Boolean(props.disableResetPopperPortal)
      : props.kind === "buttonToggle"
        ? Boolean(props.disableResetPopperPortal)
        : false

  const renderPopper = () => (
    <Popper
      open={Boolean(resetAnchorEl)}
      anchorEl={resetAnchorEl}
      placement="bottom-start"
      modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
      style={{ zIndex: 4000 }}
      disablePortal={disablePortal}
    >
      <CraftSettingsResetPopoverPaper ref={resetPaperRef} elevation={3}>
        <CraftSettingsStyleResetFooter onReset={handleFooterReset} />
      </CraftSettingsResetPopoverPaper>
    </Popper>
  )

  if (props.kind === "labelReset") {
    if (props.hidden) return null

    if (!props.labelReset || !props.labelReset.hasValue) {
      return (
        <CraftSettingsFixedLabel>{props.label}</CraftSettingsFixedLabel>
      )
    }

    return props.variant === "fluid" ? (
      <>
        <CraftSettingsResetTriggerFluidLabel onClick={handleAnchorClick}>
          {props.label}
        </CraftSettingsResetTriggerFluidLabel>
        {renderPopper()}
      </>
    ) : (
      <>
        <CraftSettingsResetTriggerFixedLabel onClick={handleAnchorClick}>
          {props.label}
        </CraftSettingsResetTriggerFixedLabel>
        {renderPopper()}
      </>
    )
  }

  return (
    <>
      <CraftSettingsResetToggleLabelButton
        type="button"
        $hasResettableValue={props.hasResettableValue}
        onClick={handleAnchorClick}
      >
        {props.label}
      </CraftSettingsResetToggleLabelButton>
      {renderPopper()}
    </>
  )
}
