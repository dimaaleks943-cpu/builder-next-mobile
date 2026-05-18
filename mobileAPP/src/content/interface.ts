export interface ComponentNode {
  nodeId: string;
  type: string;
  props: Record<string, any>;
  children?: ComponentNode[];
}
