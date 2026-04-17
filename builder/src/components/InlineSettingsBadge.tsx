import { forwardRef, useEffect, useMemo, useRef } from "react"
import type { ReactNode } from "react"
import { createPortal } from "react-dom"
import { COLORS } from "../theme/colors.ts"
import { useAnchoredOverlayPosition } from "./useAnchoredOverlayPosition.ts"

const BADGE_OVERLAY_ROOT_ID = "builder-badge-overlay-root"

export interface InlineSettingsBadgeProps {
  icon?: ReactNode
  label: string
  showSettingsButton?: boolean
  onSettingsClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  maxWidth?: number
  anchorElement?: HTMLElement | null
  usePortal?: boolean
  offsetTop?: number
}

export const InlineSettingsBadge = forwardRef<
  HTMLDivElement,
  InlineSettingsBadgeProps
>(
  (
    {
      icon,
      label,
      showSettingsButton = true,
      onSettingsClick,
      maxWidth,
      anchorElement,
      usePortal = false,
      offsetTop = -20,
    },
    ref,
  ) => {
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null)
  const overlayRootElement = useMemo(() => {
    if (typeof document === "undefined") return null
    return document.getElementById(BADGE_OVERLAY_ROOT_ID)
  }, [])
  const { top, left, isReady } = useAnchoredOverlayPosition({
    anchorElement: usePortal ? anchorElement : null,
    overlayRootElement: usePortal ? overlayRootElement : null,
    offsetTop,
  })

  // Используем native-listeners в capture phase, чтобы обойти обработчики Craft.js
  // и гарантированно открыть нашу модалку по клику на шестерёнку.
  useEffect(() => {
    if (!showSettingsButton || !onSettingsClick) return
    const button = settingsButtonRef.current
    if (!button) return

    const handle = (event: Event) => {
      event.stopPropagation()
      event.preventDefault()
      onSettingsClick(event as unknown as React.MouseEvent<HTMLButtonElement>)
    }

    button.addEventListener("mousedown", handle, true)
    button.addEventListener("click", handle, true)

    return () => {
      button.removeEventListener("mousedown", handle, true)
      button.removeEventListener("click", handle, true)
    }
  }, [showSettingsButton, onSettingsClick])

  const badgeNode = (
    <div
      ref={ref}
      style={{
        // Полный reset типографики/эффектов, чтобы внешний стиль ноды не влиял на бейдж.
        all: "initial",
        position: usePortal ? "absolute" : "absolute",
        top: usePortal ? top : -20,
        left: usePortal ? left : 0,
        padding: "2px 6px",
        backgroundColor: COLORS.purple400,
        color: COLORS.white,
        fontSize: 10,
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        gap: 4,
        pointerEvents: "auto",
        zIndex: 10,
        maxWidth: maxWidth ?? 140,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontFamily: "Inter, Arial, sans-serif",
        fontWeight: 500,
        fontStyle: "normal",
        lineHeight: "14px",
        letterSpacing: "normal",
        textTransform: "none",
        textDecoration: "none",
        opacity: 1,
        mixBlendMode: "normal",
        boxSizing: "border-box",
        visibility: usePortal && !isReady ? "hidden" : "visible",
      }}
      onMouseDown={(event) => {
        // не даём перетаскиванию/кликам по бирке сбивать выделение
        event.stopPropagation()
      }}
    >
      {icon && (
        <span
          style={{
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      )}
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </span>
      {showSettingsButton && onSettingsClick && (
        <button
          ref={settingsButtonRef}
          type="button"
          style={{
            all: "unset",
            border: "none",
            background: "transparent",
            color: COLORS.white,
            cursor: "pointer",
            padding: "2px",
            fontSize: 10,
            flexShrink: 0,
          }}
        >
          ⚙
        </button>
      )}
    </div>
  )

    if (usePortal && overlayRootElement && anchorElement) {
      return createPortal(badgeNode, overlayRootElement)
    }

    return badgeNode
  },
)

