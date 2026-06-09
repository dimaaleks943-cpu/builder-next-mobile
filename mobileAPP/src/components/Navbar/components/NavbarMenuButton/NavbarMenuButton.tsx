import type { ReactNode } from "react";
import { Pressable } from "react-native";
import { useResponsiveViewport } from "../../../../contexts/ResponsiveViewportContext";
import { resolveResponsiveStyle } from "../../../../content/responsiveStyle";
import { useNavbarMenu } from "../../../../lib/navbar/navbarMenuContext";

interface Props {
  children?: ReactNode;
  style?: unknown;
  nativeID?: string;
}

export const NavbarMenuButton = ({
  children,
  style,
  nativeID,
}: Props) => {
  const { viewport } = useResponsiveViewport();
  const { isCompact, isMenuOpen, toggleMenu } = useNavbarMenu();
  const rs = resolveResponsiveStyle(style, viewport);

  if (!isCompact) {
    return null;
  }

  return (
    <Pressable
      nativeID={nativeID}
      accessibilityRole="button"
      accessibilityLabel="menu"
      accessibilityState={{ expanded: isMenuOpen }}
      onPress={toggleMenu}
      style={rs}
    >
      {children}
    </Pressable>
  );
};
