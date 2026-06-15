import type { MouseEvent as ReactMouseEvent, RefObject } from "react"
import { useEffect, useRef, useState } from "react"

interface UseFormSendToPopperResult {
  anchorEl: HTMLElement | null
  paperRef: RefObject<HTMLDivElement>
  isOpen: boolean
  open: (anchor: HTMLElement) => void
  close: () => void
  toggle: (event: ReactMouseEvent<HTMLElement>) => void
}

export const useFormSendToPopper = (): UseFormSendToPopperResult => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const paperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!anchorEl) return

    const onDocMouseDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node
      if (anchorEl.contains(target)) return
      if (paperRef.current?.contains(target)) return
      setAnchorEl(null)
    }

    document.addEventListener("mousedown", onDocMouseDown, true)
    return () => document.removeEventListener("mousedown", onDocMouseDown, true)
  }, [anchorEl])

  const open = (anchor: HTMLElement) => {
    setAnchorEl(anchor)
  }

  const close = () => {
    setAnchorEl(null)
  }

  const toggle = (event: ReactMouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl((prev) => (prev === event.currentTarget ? null : event.currentTarget))
  }

  return {
    anchorEl,
    paperRef,
    isOpen: Boolean(anchorEl),
    open,
    close,
    toggle,
  }
}
