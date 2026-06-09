import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useResponsiveViewport } from "../../contexts/ResponsiveViewportContext";
import { isNavbarMenuCompact } from "./isNavbarMenuCompact";
import { DEFAULT_NAVBAR_MENU_ICON_BREAKPOINT } from "./menuIconBreakpoint";
import type {
  NavbarEasingValue,
  NavbarMenuIconBreakpointValue,
  NavbarMenuTypeValue,
  NavbarProps,
} from "./navbarTypes";

export interface NavbarMenuContextValue {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleMenu: () => void;
  isCompact: boolean;
  menuType: NavbarMenuTypeValue;
  easingOpen: NavbarEasingValue;
  easingClose: NavbarEasingValue;
  durationMs: number;
  menuFillsPageHeight: boolean;
}

export const NavbarMenuContext = createContext<NavbarMenuContextValue | null>(
  null,
);

export const useNavbarMenu = (): NavbarMenuContextValue => {
  const context = useContext(NavbarMenuContext);
  if (!context) {
    throw new Error("useNavbarMenu must be used within NavbarMenuContext");
  }
  return context;
};

export const useNavbarMenuOptional = (): NavbarMenuContextValue | null =>
  useContext(NavbarMenuContext);

interface ProviderProps extends NavbarProps {
  children: ReactNode;
}

export const NavbarMenuProvider = ({
  children,
  menuType = "dropDown",
  easingOpen = "ease",
  easingClose = "ease",
  durationMs = 400,
  menuIconBreakpoint,
  menuFillsPageHeight = false,
}: ProviderProps) => {
  const { viewport } = useResponsiveViewport();
  const normalizedBreakpoint = normalizeMenuIconBreakpoint(menuIconBreakpoint);
  const isCompact = isNavbarMenuCompact(viewport, normalizedBreakpoint);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isCompact) {
      setIsMenuOpen(false);
    }
  }, [isCompact]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const value = useMemo(
    (): NavbarMenuContextValue => ({
      isMenuOpen,
      setIsMenuOpen,
      toggleMenu,
      isCompact,
      menuType,
      easingOpen,
      easingClose,
      durationMs,
      menuFillsPageHeight,
    }),
    [
      isMenuOpen,
      toggleMenu,
      isCompact,
      menuType,
      easingOpen,
      easingClose,
      durationMs,
      menuFillsPageHeight,
    ],
  );

  return (
    <NavbarMenuContext.Provider value={value}>
      {children}
    </NavbarMenuContext.Provider>
  );
};

export const normalizeMenuIconBreakpoint = (
  value: unknown,
): NavbarMenuIconBreakpointValue => {
  if (
    value === "desktop" ||
    value === "tablet_landscape" ||
    value === "tablet" ||
    value === "phone_landscape" ||
    value === "phone" ||
    value === "none"
  ) {
    return value;
  }
  return DEFAULT_NAVBAR_MENU_ICON_BREAKPOINT;
};
