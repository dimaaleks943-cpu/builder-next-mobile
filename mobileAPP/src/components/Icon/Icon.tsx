import type { ReactNode } from "react";
import { View } from "react-native";
import { useResponsiveViewport } from "../../contexts/ResponsiveViewportContext";
import { resolveResponsiveStyle } from "../../content/responsiveStyle";
import { BurgerIcon } from "./BurgerIcon";

export type IconVariant = "burger";

interface Props {
  icon?: IconVariant;
  style?: unknown;
  nativeID?: string;
  children?: ReactNode;
}

export const Icon = ({
  icon = "burger",
  style,
  nativeID,
}: Props) => {
  const { viewport } = useResponsiveViewport();
  const rs = resolveResponsiveStyle(style, viewport);
  const iconFill =
    rs.color != null && rs.color !== "" ? String(rs.color) : "currentColor";

  return (
    <View nativeID={nativeID} style={rs}>
      {icon === "burger" && <BurgerIcon fill={iconFill} />}
    </View>
  );
};
