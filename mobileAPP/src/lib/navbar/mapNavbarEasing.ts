import { Easing } from "react-native";
import type { NavbarEasingValue } from "./navbarTypes";

export const mapNavbarEasing = (
  easing: NavbarEasingValue,
): (value: number) => number => {
  switch (easing) {
    case "linear":
      return Easing.linear;
    case "ease-in":
      return Easing.in(Easing.ease);
    case "ease-out":
      return Easing.out(Easing.ease);
    case "ease-in-out":
      return Easing.inOut(Easing.ease);
    default:
      return Easing.ease;
  }
};
