export interface ComponentNode {
  type: string
  props: Record<string, any>
  children?: ComponentNode[]
}

