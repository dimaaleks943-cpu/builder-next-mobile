import { forwardRef, useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { COLORS } from "../theme/colors"

export interface InlineSettingsBadgeProps {
  icon?: ReactNode;
  label: string;
  showSettingsButton?: boolean;
  onSettingsClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  maxWidth?: number;
}

export const InlineSettingsBadge = forwardRef<
  HTMLDivElement,
  InlineSettingsBadgeProps
>(({ icon, label, showSettingsButton = true, onSettingsClick, maxWidth }, ref) => {
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null)

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

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "-20px",
        left: 0,
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
})

