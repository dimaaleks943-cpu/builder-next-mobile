import type { ResponsiveStyle } from "../../content/responsiveStyle";
import { normalizeStyleClassIds } from "./styleClassIds";
import { resolveStackedNodeStyle } from "./resolveStackedNodeStyle";
import type { StyleClassesRegistry } from "./types";

const hasStyleBranches = (style: ResponsiveStyle): boolean =>
  Object.values(style).some(
    (branch) =>
      branch &&
      typeof branch === "object" &&
      Object.keys(branch).length > 0,
  );

export const resolveSerializedNodeStyle = (
  rawProps: Record<string, unknown>,
  _componentType: string,
  _nodeDisplayName: string | undefined,
  styleClasses: StyleClassesRegistry,
): ResponsiveStyle | undefined => {
  const styleClassIds = normalizeStyleClassIds(rawProps.styleClassIds);
  const nodeStyle = resolveStackedNodeStyle(
    styleClassIds,
    rawProps.style && typeof rawProps.style === "object"
      ? (rawProps.style as ResponsiveStyle)
      : undefined,
    styleClasses,
  );

  return nodeStyle && hasStyleBranches(nodeStyle) ? nodeStyle : undefined;
};

export const propsForRuntime = (
  rawProps: Record<string, unknown>,
  componentType: string,
  nodeDisplayName: string | undefined,
  styleClasses: StyleClassesRegistry,
): Record<string, unknown> => {
  const resolvedStyle = resolveSerializedNodeStyle(
    rawProps,
    componentType,
    nodeDisplayName,
    styleClasses,
  );
  const props = { ...rawProps };
  delete props.styleClassIds;
  if (resolvedStyle) {
    props.style = resolvedStyle;
  } else {
    delete props.style;
  }
  return props;
};
