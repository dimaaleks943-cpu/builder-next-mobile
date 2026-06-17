export interface ComponentNode {
  nodeId: string;
  className?: string;
  type: string;
  props: Record<string, any>;
  conditionalVisibility?: unknown;
  children?: ComponentNode[];
}

