export interface ComponentNode {
  nodeId: string
  className: string
  type: string
  props: Record<string, any>
  children?: ComponentNode[]
}

