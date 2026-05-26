import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { createPortal } from "react-dom"
import { COLORS } from "../../theme/colors.ts"
import { CloseIcon } from "../../icons/CloseIcon.tsx"
import {
  ModalCloseButton,
  ModalContent,
  ModalDivider,
  ModalHeader,
  ModalRoot,
  ModalTitle,
  ShowAllSettingsButton,
  ShowAllSettingsWrapper,
} from "./styles.ts"

interface Props {
  open: boolean
  title: string
  top: number
  left: number
  onClose: () => void
  onShowAllSettings?: () => void
  children?: ReactNode
}

export const InlineSettingsModal = ({
  open,
  title,
  top,
  left,
  onClose,
  onShowAllSettings,
  children,
}: Props) => {
  const modalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const modal = modalRef.current
    if (!modal) return

    const handleCapture = (event: Event) => {
      event.stopPropagation()
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation()
      }
    }

    // Bubble phase: дочерние элементы (input, кнопки) получают mousedown первыми,
    // затем останавливаем всплытие до Craft.js.
    modal.addEventListener("mousedown", handleCapture, false)

    return () => {
      modal.removeEventListener("mousedown", handleCapture, false)
    }
  }, [open])

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

  return createPortal(
    <ModalRoot
      ref={modalRef}
      style={{ top, left }}
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <ModalCloseButton onClick={onClose}>
          <CloseIcon size={14} fill={COLORS.black} />
        </ModalCloseButton>
      </ModalHeader>

      <ModalDivider />

      <ModalContent>{children}</ModalContent>

      {onShowAllSettings && (
        <ShowAllSettingsWrapper>
          <ShowAllSettingsButton
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onShowAllSettings()
            }}
          >
            Показать все настройки
          </ShowAllSettingsButton>
        </ShowAllSettingsWrapper>
      )}
    </ModalRoot>,
    document.body,
  )
}
