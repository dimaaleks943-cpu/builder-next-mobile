import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useState, type ChangeEvent, type MouseEvent } from "react"
import { AddIcon } from "../../../../../icons/AddIcon.tsx"
import { COLORS } from "../../../../../theme/colors.ts"
import type { StyleVariableRef } from "../../../variables/types.ts"
import { isStyleVariableRef } from "../../../variables/types.ts"
import {
  ColorVariableConnectPopper,
  resolveColorFieldDisplay,
} from "./components/ColorVariableConnectPopper/ColorVariableConnectPopper.tsx"
import { CraftSettingsResetLabelWithPopper } from "../CraftSettingsResetLabelWithPopper.tsx"
import {
  ColorFieldInputShell,
} from "../styles.ts"
import {
  ColorFieldInputShellVariable,
  ColorFieldSwatch,
  ColorFieldTextInput,
  ColorFieldVariableName,
  ColorVariableConnectButton,
  ColorVariableConnectDot
} from "./styles.ts";

type LabelReset = {
  hasValue: boolean
  onReset: () => void
}

type BaseProps = {
  label: string
  hideLabel?: boolean
  disabled?: boolean
  labelReset?: LabelReset
  disableResetPopperPortal?: boolean
}

type LiteralProps = BaseProps & {
  withVariables?: false
  value: string
  onChange: (value: string) => void
}

type WithVariablesProps = BaseProps & {
  withVariables: true
  value: string | StyleVariableRef
  onChange: (value: string | StyleVariableRef) => void
}

type Props = LiteralProps | WithVariablesProps

export const CraftSettingsColorField = (props: Props) => {
  const {
    label,
    hideLabel = false,
    disabled = false,
    labelReset,
    disableResetPopperPortal = false,
  } = props

  const theme = useTheme()
  const popperZIndex = theme.zIndex.modal + 1
  const [inputShellEl, setInputShellEl] = useState<HTMLElement | null>(null)
  const [isInputHovered, setIsInputHovered] = useState(false)
  const [isConnectHovered, setIsConnectHovered] = useState(false)
  const [isConnectOpen, setIsConnectOpen] = useState(false)

  const withVariables = props.withVariables === true
  const display = withVariables
    ? resolveColorFieldDisplay(props.value)
    : {
        isVariable: false,
        color: props.value,
        label: props.value,
      }

  const isVariableRef = withVariables && isStyleVariableRef(props.value)
  const showConnectButton =
    withVariables &&
    (isInputHovered || isConnectHovered || isConnectOpen || isVariableRef)

  const handlePickerChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (withVariables) {
      props.onChange(event.target.value)
      return
    }
    props.onChange(event.target.value)
  }

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (withVariables) {
      props.onChange(event.target.value)
      return
    }
    props.onChange(event.target.value)
  }

  const handleOpenConnect = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setIsConnectOpen((current) => !current)
  }

  const handleCloseConnect = () => {
    setIsConnectOpen(false)
  }

  const handleSelectVariable = (variable: { id: string }) => {
    if (!withVariables) return
    props.onChange({ $ref: variable.id })
  }

  const InputShell = display.isVariable
    ? ColorFieldInputShellVariable
    : ColorFieldInputShell

  const literalValue = withVariables
    ? isStyleVariableRef(props.value)
      ? display.color
      : props.value
    : props.value

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: hideLabel ? 0 : "8px",
        ...(disabled ? { opacity: 0.55, pointerEvents: "none" } : {}),
      }}
    >
      <CraftSettingsResetLabelWithPopper
        kind="labelReset"
        label={label}
        hidden={hideLabel}
        variant="fixed"
        labelReset={labelReset}
        disableResetPopperPortal={disableResetPopperPortal}
      />

      <InputShell
        ref={setInputShellEl}
        onMouseEnter={() => setIsInputHovered(true)}
        onMouseLeave={() => setIsInputHovered(false)}
      >
        {showConnectButton && (
          <ColorVariableConnectButton
            role="button"
            tabIndex={0}
            onMouseEnter={() => setIsConnectHovered(true)}
            onMouseLeave={() => setIsConnectHovered(false)}
            onMouseDown={handleOpenConnect}
          >
            {isConnectHovered ? (
              <AddIcon height={8} width={8} fill={COLORS.white} />
            ) : (
              <ColorVariableConnectDot />
            )}
          </ColorVariableConnectButton>
        )}

        <ColorFieldSwatch
          sx={{
            backgroundColor: display.color,
            ...(display.isVariable
              ? { borderColor: "rgba(255, 255, 255, 0.35)" }
              : {}),
          }}
        >
          {!display.isVariable && (
            <Box
              component="input"
              type="color"
              value={literalValue}
              onChange={handlePickerChange}
              sx={{
                width: "18px",
                height: "18px",
                position: "absolute",
                inset: 0,
                opacity: 0,
                cursor: "pointer",
                padding: 0,
                border: "none",
              }}
            />
          )}
        </ColorFieldSwatch>

        {display.isVariable ? (
          <ColorFieldVariableName title={display.label}>
            {display.label}
          </ColorFieldVariableName>
        ) : (
          <ColorFieldTextInput
            type="text"
            value={literalValue}
            onChange={handleTextChange}
          />
        )}
      </InputShell>

      {withVariables && (
        <ColorVariableConnectPopper
          anchorEl={inputShellEl}
          open={isConnectOpen}
          zIndex={popperZIndex}
          onSelect={handleSelectVariable}
          onClose={handleCloseConnect}
        />
      )}
    </Box>
  )
}
