import type { ResponsiveStyle } from "../../content/responsiveStyle";

export type StyleClassKind = "base" | "combo";

export type StyleClassDefinition = {
  id: string;
  name: string;
  resolvedName: string;
  style: ResponsiveStyle;
  kind?: StyleClassKind;
  comboMemberIds?: string[];
};

export type StyleClassesRegistry = Record<string, StyleClassDefinition>;

export type PageCraftContent = {
  nodes: Record<string, unknown>;
  styleClasses: StyleClassesRegistry;
};
