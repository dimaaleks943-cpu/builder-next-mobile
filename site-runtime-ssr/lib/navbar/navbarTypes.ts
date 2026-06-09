export type NavbarMenuIconBreakpointValue =
  | "desktop"
  | "tablet_landscape"
  | "tablet"
  | "phone_landscape"
  | "phone"
  | "none"

export type NavbarMenuTypeValue = "dropDown" | "overRight" | "overLeft"

export type NavbarEasingValue =
  | "ease"
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"

export interface NavbarBehaviorNode {
  menuIconBreakpoint: NavbarMenuIconBreakpointValue;
  linksNodeId: string;
  menuButtonNodeId: string | null;
  menuNodeId: string;
}

export interface NavbarProps {
  menuType?: NavbarMenuTypeValue;
  easingOpen?: NavbarEasingValue;
  easingClose?: NavbarEasingValue;
  durationMs?: number;
  menuIconBreakpoint?: NavbarMenuIconBreakpointValue;
  menuFillsPageHeight?: boolean;
  disableScrollOffsetWhenFixed?: boolean;
}
