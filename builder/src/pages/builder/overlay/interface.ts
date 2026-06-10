export interface OverlaySelectionData {
  nodeId: string
  label: string
  dom: HTMLElement
  resolvedName: string | null
}

export interface OverlayHoverData {
  nodeId: string
  dom: HTMLElement
  label: string
}

export interface OverlayGeometry {
  isVisible: boolean
  top: number
  left: number
  width: number
  height: number
}
