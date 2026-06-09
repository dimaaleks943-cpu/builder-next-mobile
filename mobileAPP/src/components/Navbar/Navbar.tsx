import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useResponsiveViewport } from "../../contexts/ResponsiveViewportContext";
import { resolveResponsiveStyle } from "../../content/responsiveStyle";
import {
  NavbarMenuProvider,
  useNavbarMenu,
} from "../../lib/navbar/navbarMenuContext";
import type { NavbarProps } from "../../lib/navbar/navbarTypes";

interface Props extends NavbarProps {
  children?: ReactNode;
  style?: unknown;
  nativeID?: string;
}

interface NavbarRootProps {
  nativeID?: string;
  rs: StyleProp<ViewStyle>;
  children?: ReactNode;
}

const NavbarRoot = ({ nativeID, rs, children }: NavbarRootProps) => {
  const { isMenuOpen, isCompact } = useNavbarMenu();
  const shouldElevateNavbar = isCompact && isMenuOpen;

  return (
    <View
      nativeID={nativeID}
      style={[
        { position: "relative" },
        rs,
        shouldElevateNavbar && {
          zIndex: 100,
          elevation: 100,
          overflow: "visible",
        },
      ]}
    >
      {children}
    </View>
  );
};

export const Navbar = ({
  children,
  style,
  nativeID,
  menuType,
  easingOpen,
  easingClose,
  durationMs,
  menuIconBreakpoint,
  menuFillsPageHeight,
}: Props) => {
  const { viewport } = useResponsiveViewport();
  const rs = resolveResponsiveStyle(style, viewport);

  return (
    <NavbarMenuProvider
      menuType={menuType}
      easingOpen={easingOpen}
      easingClose={easingClose}
      durationMs={durationMs}
      menuIconBreakpoint={menuIconBreakpoint}
      menuFillsPageHeight={menuFillsPageHeight}
    >
      <NavbarRoot nativeID={nativeID} rs={rs}>
        {children}
      </NavbarRoot>
    </NavbarMenuProvider>
  );
};
