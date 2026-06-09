import type { ReactNode } from "react";
import { View } from "react-native";
import { useResponsiveViewport } from "../../../../contexts/ResponsiveViewportContext";
import { resolveResponsiveStyle } from "../../../../content/responsiveStyle";
import { useNavbarMenu } from "../../../../lib/navbar/navbarMenuContext";

interface Props {
  children?: ReactNode;
  style?: unknown;
  nativeID?: string;
}

export const NavbarLinks = ({
  children,
  style,
  nativeID,
}: Props) => {
  const { viewport } = useResponsiveViewport();
  const { isCompact } = useNavbarMenu();
  const rs = resolveResponsiveStyle(style, viewport);

  if (isCompact) {
    return null;
  }

  return (
    <View nativeID={nativeID} style={rs}>
      {children}
    </View>
  );
};
