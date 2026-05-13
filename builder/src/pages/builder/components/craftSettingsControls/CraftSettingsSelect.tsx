import { Box } from "@mui/material"
import type { SxProps, Theme } from "@mui/material/styles"
import type { ChangeEvent } from "react"
import { COLORS } from "../../../../theme/colors.ts"
import { ChevronRightIcon } from "../../../../icons/ChevronRightIcon.tsx"
import { CraftSettingsResetLabelWithPopper } from "./CraftSettingsResetLabelWithPopper.tsx"
import {
  CraftSettingsSelectShellFullRow,
  CraftSettingsSelectShellInline,
} from "./styles.ts"

interface Option {
  id: string;
  value: string;
}

interface Props {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  disabled?: boolean;
  /** When false, only the select is shown (full width); label is omitted and used as `aria-label`. */
  showInlineLabel?: boolean;
  /**
   * When set together with {@link showInlineLabel}, the label uses the reset affordance:
   * purple and clickable when `hasValue` is true; opens the same reset popover as other craft settings.
   */
  labelReset?: {
    hasValue: boolean;
    onReset: () => void;
  };
  /**
   * Keep the reset Popper in the DOM under the parent (no portal). Use inside another Popper
   * that closes on outside `mousedown` using `Node.contains()` on a panel ref.
   */
  disableResetPopperPortal?: boolean;
  /** Fires on pointer down on the native `<select>` (e.g. commit implicit default before opening). */
  onNativeSelectPointerDown?: () => void;
  /** Applied to the inline label next to the select (via {@link CraftSettingsResetLabelWithPopper}). */
  labelSx?: SxProps<Theme>;
}

export const CraftSettingsSelect = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  showInlineLabel = true,
  labelReset,
  disableResetPopperPortal = false,
  onNativeSelectPointerDown,
  labelSx,
}: Props) => {
  const SelectShell = showInlineLabel ? CraftSettingsSelectShellInline : CraftSettingsSelectShellFullRow

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        columnGap: "8px",
        ...(showInlineLabel ? {} : { width: "100%", minWidth: 0 }),
      }}
    >
      <CraftSettingsResetLabelWithPopper
        kind="labelReset"
        label={label}
        hidden={!showInlineLabel}
        variant="fluid"
        labelReset={labelReset}
        disableResetPopperPortal={disableResetPopperPortal}
        sx={labelSx}
      />
      <SelectShell>
        <Box
          component="select"
          value={value}
          onChange={onChange}
          onPointerDown={() => {
            onNativeSelectPointerDown?.()
          }}
          disabled={disabled}
          aria-label={showInlineLabel ? undefined : label}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            padding: "6px 8px",
            paddingRight: "24px",
            fontSize: "12px",
            lineHeight: "14px",
            borderRadius: "4px",
            border: `1px solid ${COLORS.purple100}`,
            backgroundColor: COLORS.white,
            appearance: "none",
            WebkitAppearance: "none",
          }}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.value}
            </option>
          ))}
        </Box>
        <Box
          sx={{
            position: "absolute",
            right: "6px",
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            transform: "rotate(90deg)",
          }}
        >
          <ChevronRightIcon size={12} fill={COLORS.gray700} />
        </Box>
      </SelectShell>
    </Box>
  )
}
