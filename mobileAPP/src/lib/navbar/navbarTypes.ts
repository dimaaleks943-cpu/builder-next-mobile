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

export interface NavbarProps {
  menuType?: NavbarMenuTypeValue;
  easingOpen?: NavbarEasingValue;
  easingClose?: NavbarEasingValue;
  durationMs?: number;
  menuIconBreakpoint?: NavbarMenuIconBreakpointValue;
  menuFillsPageHeight?: boolean;
  disableScrollOffsetWhenFixed?: boolean;
}
