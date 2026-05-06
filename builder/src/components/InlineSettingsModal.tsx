import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { createPortal } from "react-dom"
import { COLORS } from "../theme/colors.ts"
import { Box, Button, IconButton, Typography } from "@mui/material";
import { CloseIcon } from "../icons/CloseIcon.tsx";

export interface InlineSettingsModalProps {
  open: boolean;
  title: string;
  top: number;
  left: number;
  onClose: () => void;
  onShowAllSettings?: () => void;
  children?: ReactNode;
}

export const InlineSettingsModal = ({
  open,
  title,
  top,
  left,
  onClose,
  onShowAllSettings,
  children,
}: InlineSettingsModalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null)

  // 1) Гасим события внутри модалки в capture phase, чтобы Craft.js и другие
  // обработчики не перехватывали клики/mousedown и не меняли выделение.
  useEffect(() => {
    if (!open) return
    const modal = modalRef.current
    if (!modal) return

    // @ts-ignore
    const handleCapture = (event: Event) => {
      event.stopPropagation()
      // есть не во всех реализациях, но если есть — используем
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation()
      }
    }

    modal.addEventListener("mousedown", handleCapture, true)
    // modal.addEventListener("click", handleCapture, true)
    // modal.addEventListener("pointerdown", handleCapture, true)

    return () => {
      modal.removeEventListener("mousedown", handleCapture, true)
      // modal.removeEventListener("click", handleCapture, true)
      // modal.removeEventListener("pointerdown", handleCapture, true)
    }
  }, [open])

  // 2) Клик вне модалки — закрываем
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (modalRef.current && !modalRef.current.contains(target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, onClose])

  if (!open || typeof document === "undefined") {
    return null
  }

  /** Портал в body: иначе `position:fixed` цепляется к предку с transform (Craft/Frame) и координаты ломаются. */
  return createPortal(
    <div
      ref={modalRef}
      style={{
        position: "fixed",
        top,
        left,
        backgroundColor: COLORS.white,
        padding: "12px 14px",
        borderRadius: 8,
        minWidth: 260,
        maxWidth: 320,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        fontSize: "14px",
        lineHeight: "20px",
        zIndex: 16000,
      }}
      onClick={(event) => {
        // Не даём клику внутри модалки всплывать до Craft/других обработчиков
        event.stopPropagation()
      }}
    >
      <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <Typography style={{ fontWeight: 500, fontSize: "12px", lineHeight: "14px" }}>{title}</Typography>
        <IconButton onClick={onClose} sx={{ padding: 0 }}>
          <CloseIcon size={10} fill={COLORS.black}/>
        </IconButton>
      </Box>

      {/* Контент модалки (у каждого компонента свой) */}
      <div>{children}</div>

      {/* Кнопка "Показать все настройки" (опциональная) */}
      {onShowAllSettings && (
        <Box style={{ marginTop: 10, display: "flex" }}>
          <Button
            onClick={(event) => {
              event.stopPropagation()
              onShowAllSettings()
            }}
            sx={{ fontSize: "10px", lineHeight: "14px", fontWeight: 400, width: "100%", color: COLORS.black }}
            color="secondary"
            variant="outlined"
          >
            Показать все настройки
          </Button>
        </Box>
      )}
    </div>,
    document.body,
  )
}
