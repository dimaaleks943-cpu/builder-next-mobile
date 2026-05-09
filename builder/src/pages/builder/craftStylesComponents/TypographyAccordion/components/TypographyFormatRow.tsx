import { Box, IconButton, Typography } from "@mui/material"
import type { RefObject } from "react"
import { COLORS } from "../../../../../theme/colors.ts"
import { CloseIcon } from "../../../../../icons/CloseIcon.tsx"
import { FormatItalicIcon } from "../../../../../icons/FormatItalicIcon.tsx"
import { FormatOverlinedIcon } from "../../../../../icons/FormatOverlinedIcon.tsx"
import { FormatUnderlinedIcon } from "../../../../../icons/FormatUnderlinedIcon.tsx"
import { MoreHorizontalIcon } from "../../../../../icons/MoreHorizontalIcon.tsx"
import { StrikeThroughIcon } from "../../../../../icons/StrikeThroughIcon.tsx"

export type TextDecorationKind = "line-through" | "underline" | "overline"

const FORMAT_ICON_SIZE = 14

interface Props {
  decoration: TextDecorationKind | undefined;
  isItalic: boolean;
  onClear: () => void;
  onDecorationPress: (kind: TextDecorationKind) => void;
  onItalicPress: () => void;
  decorationSettingsWrapRef: RefObject<HTMLDivElement | null>;
  onToggleDecorationSettingsPopper: () => void;
}

export const TypographyFormatRow = ({
  decoration,
  isItalic,
  onClear,
  onDecorationPress,
  onItalicPress,
  decorationSettingsWrapRef,
  onToggleDecorationSettingsPopper,
}: Props) => {
  const accentFill = COLORS.purple400
  const isClearHighlighted = decoration === undefined && !isItalic

  const segmentIconButtonSx = (opts: {
    active: boolean;
    cornerLeft?: boolean;
    cornerRight?: boolean;
  }) => ({
    flex: 1,
    minWidth: 0,
    padding: "5px 7px",
    borderRadius: opts.cornerLeft
      ? "5px 0 0 5px"
      : opts.cornerRight
        ? "0 5px 5px 0"
        : 0,
    backgroundColor: opts.active ? COLORS.white : COLORS.purple100,
    color: accentFill,
    "&:hover": {
      backgroundColor: opts.active ? COLORS.white : COLORS.purple200,
    },
  })

  const labelSx = {
    width: "48px",
    minWidth: "48px",
    flexShrink: 0,
    fontSize: "10px",
    lineHeight: "14px",
    color: COLORS.gray700,
    textAlign: "left" as const,
  }

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}
    >
      <Typography sx={labelSx}>Format</Typography>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            backgroundColor: COLORS.purple100,
            padding: "1px",
            borderRadius: "2px",
          }}
        >
          <IconButton
            disableRipple
            size="small"
            aria-label="Clear format"
            onClick={onClear}
            sx={segmentIconButtonSx({
              active: isClearHighlighted,
              cornerLeft: true,
            })}
          >
            <CloseIcon size={FORMAT_ICON_SIZE} fill={accentFill}/>
          </IconButton>
          <IconButton
            disableRipple
            size="small"
            aria-label="Strikethrough"
            onClick={() => onDecorationPress("line-through")}
            sx={segmentIconButtonSx({
              active: decoration === "line-through",
            })}
          >
            <StrikeThroughIcon size={FORMAT_ICON_SIZE} fill={accentFill}/>
          </IconButton>
          <IconButton
            disableRipple
            size="small"
            aria-label="Underline"
            onClick={() => onDecorationPress("underline")}
            sx={segmentIconButtonSx({
              active: decoration === "underline",
            })}
          >
            <FormatUnderlinedIcon size={FORMAT_ICON_SIZE} fill={accentFill}/>
          </IconButton>
          <IconButton
            disableRipple
            size="small"
            aria-label="Overline"
            onClick={() => onDecorationPress("overline")}
            sx={segmentIconButtonSx({
              active: decoration === "overline",
            })}
          >
            <FormatOverlinedIcon size={FORMAT_ICON_SIZE} fill={accentFill}/>
          </IconButton>
          <IconButton
            disableRipple
            size="small"
            aria-label="Italic"
            onClick={onItalicPress}
            sx={segmentIconButtonSx({
              active: isItalic,
              cornerRight: true,
            })}
          >
            <FormatItalicIcon size={FORMAT_ICON_SIZE} fill={accentFill}/>
          </IconButton>
        </Box>
        <Box ref={decorationSettingsWrapRef}>
          <IconButton
            disableRipple
            size="small"
            aria-label="More format options"
            onClick={onToggleDecorationSettingsPopper}
            sx={{
              flexShrink: 0,
              padding: "4px",
              color: COLORS.gray700,
              "&:hover": {
                backgroundColor: COLORS.secondaryVeryLightGray,
              },
            }}
          >
            <MoreHorizontalIcon size={FORMAT_ICON_SIZE} fill={COLORS.gray700}/>
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}
