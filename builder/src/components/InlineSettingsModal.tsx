import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { COLORS } from "../theme/colors.ts"

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

  if (!open) {
    return null
  }

  return (
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
        fontSize: 13,
        zIndex: 1000,
      }}
      onClick={(event) => {
        // Не даём клику внутри модалки всплывать до Craft/других обработчиков
        event.stopPropagation()
      }}
    >
      {/* Шапка с заголовком и крестиком */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontWeight: 600,
          }}
        >
          {title}
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          ✕
        </button>
      </div>

      {/* Контент модалки (у каждого компонента свой) */}
      <div>{children}</div>

      {/* Кнопка "Показать все настройки" (опциональная) */}
      {onShowAllSettings && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "none",
              backgroundColor: COLORS.purple400,
              color: COLORS.white,
              fontSize: 12,
              cursor: "pointer",
            }}
            onClick={(event) => {
              event.stopPropagation()
              onShowAllSettings()
            }}
          >
            Показать все настройки
          </button>
        </div>
      )}
    </div>
  )
}

