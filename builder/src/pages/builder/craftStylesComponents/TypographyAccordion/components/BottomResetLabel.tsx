import { useEffect, useRef, useState } from "react";
import { Paper, Popper, Typography } from "@mui/material";
import { COLORS } from "../../../../../theme/colors.ts";
import {
  CraftSettingsStyleResetFooter
} from "../../../components/craftSettingsControls/CraftSettingsStyleResetFooter.tsx";
import type { MouseEvent as ReactMouseEvent } from "react"

interface Props {
  children: string;
  hasValue: boolean;
  onReset: () => void;
}

export const BottomResetLabel = ({
  children,
  hasValue,
  onReset,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const popperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!anchorEl) return
    const onDocMouseDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node
      if (anchorEl.contains(target)) return
      if (popperRef.current?.contains(target)) return
      setAnchorEl(null)
    }
    document.addEventListener("mousedown", onDocMouseDown, true)

    return () => document.removeEventListener("mousedown", onDocMouseDown, true)
  }, [anchorEl])

  const handleFooterReset = () => {
    onReset()
    setAnchorEl(null)
  }

  const handleLabelClick = (event: ReactMouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  if (!hasValue) {
    return (
      <Typography
        sx={{
          fontSize: "8px",
          lineHeight: "10px",
          color: COLORS.gray700,
        }}
      >
        {children}
      </Typography>
    )
  }

  return (
    <>
      <Typography
        onClick={handleLabelClick}
        component="span"
        sx={{
          fontSize: "8px",
          lineHeight: "10px",
          color: COLORS.purple400,
          fontWeight: 600,
        }}
      >
        {children}
      </Typography>

      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="bottom-start"
        modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
        style={{ zIndex: 4000 }}
      >
        <Paper
          ref={popperRef}
          elevation={3}
          sx={{
            width: "211px",
            border: `1px solid ${COLORS.purple100}`,
            borderRadius: "8px",
            padding: "8px",
          }}
        >
          <CraftSettingsStyleResetFooter onReset={handleFooterReset}/>
        </Paper>
      </Popper>
    </>
  )
}
