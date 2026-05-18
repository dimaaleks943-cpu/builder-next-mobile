import type { ResponsiveStyle } from "../../content/responsiveStyle";
import type { StyleClassesRegistry } from "./types";

const hasStyleBranches = (style: ResponsiveStyle): boolean =>
  Object.values(style).some(
    (branch) =>
      branch &&
      typeof branch === "object" &&
      Object.keys(branch).length > 0,
  );

/** Один источник: класс или `props.style`, без склейки слоёв. */
export const resolveSerializedNodeStyle = (
  rawProps: Record<string, unknown>,
  _componentType: string,
  _nodeDisplayName: string | undefined,
  styleClasses: StyleClassesRegistry,
): ResponsiveStyle | undefined => {
  const styleClassId =
    typeof rawProps.styleClassId === "string" ? rawProps.styleClassId : undefined;
  const nodeStyle = styleClassId
    ? styleClasses[styleClassId]?.style
    : rawProps.style && typeof rawProps.style === "object"
      ? (rawProps.style as ResponsiveStyle)
      : undefined;

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
  delete props.styleClassId;
  if (resolvedStyle) {
    props.style = resolvedStyle;
  } else {
    delete props.style;
  }
  return props;
};
