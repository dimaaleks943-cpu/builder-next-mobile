import { useEffect, useRef, type ReactNode } from "react";
import { Animated, useWindowDimensions } from "react-native";
import { useResponsiveViewport } from "../../../../contexts/ResponsiveViewportContext";
import { resolveResponsiveStyle } from "../../../../content/responsiveStyle";
import { mapNavbarEasing } from "../../../../lib/navbar/mapNavbarEasing";
import { useNavbarMenu } from "../../../../lib/navbar/navbarMenuContext";

const DROP_DOWN_MAX_HEIGHT_FALLBACK = 2000;

interface Props {
  children?: ReactNode;
  style?: unknown;
  nativeID?: string;
}

export const NavbarMenu = ({
  children,
  style,
  nativeID,
}: Props) => {
  const { viewport } = useResponsiveViewport();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const rs = resolveResponsiveStyle(style, viewport);
  const {
    isCompact,
    isMenuOpen,
    menuType,
    easingOpen,
    easingClose,
    durationMs,
    menuFillsPageHeight,
  } = useNavbarMenu();

  const progress = useRef(new Animated.Value(isMenuOpen ? 1 : 0)).current;

  useEffect(() => {
    const easing = mapNavbarEasing(isMenuOpen ? easingOpen : easingClose);
    Animated.timing(progress, {
      toValue: isMenuOpen ? 1 : 0,
      duration: durationMs,
      easing,
      useNativeDriver: false,
    }).start();
  }, [isMenuOpen, easingOpen, easingClose, durationMs, progress]);

  if (!isCompact) {
    return null;
  }

  const menuPanelWidth = Math.min(280, screenWidth * 0.8);
  const dropDownMaxHeight = menuFillsPageHeight
    ? screenHeight
    : DROP_DOWN_MAX_HEIGHT_FALLBACK;

  if (menuType === "dropDown") {
    const clipMaxHeight = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, dropDownMaxHeight],
    });
    const menuTranslateY = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-dropDownMaxHeight, 0],
    });

    return (
      <Animated.View
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          width: "100%",
          overflow: "hidden",
          maxHeight: clipMaxHeight,
          zIndex: 10,
          pointerEvents: isMenuOpen ? "auto" : "none",
        }}
      >
        <Animated.View
          nativeID={nativeID}
          style={[
            {
              display: "flex",
              flexDirection: "column",
              width: "100%",
              transform: [{ translateY: menuTranslateY }],
              ...(menuFillsPageHeight && isMenuOpen
                ? { minHeight: screenHeight, height: screenHeight }
                : {}),
            },
            rs,
          ]}
        >
          {children}
        </Animated.View>
      </Animated.View>
    );
  }

  const isOverRight = menuType === "overRight";
  const slideDistance = menuPanelWidth;
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: isOverRight ? [slideDistance, 0] : [-slideDistance, 0],
  });
  const overlayOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      nativeID={nativeID}
      style={[
        {
          display: "flex",
          position: "absolute",
          zIndex: 10,
          opacity: overlayOpacity,
          pointerEvents: isMenuOpen ? "auto" : "none",
          flexDirection: "column",
          width: menuPanelWidth,
          height: menuFillsPageHeight ? screenHeight : undefined,
          transform: [{ translateX }],
          ...(isOverRight
            ? { top: 0, right: 0 }
            : { top: 0, left: 0 }),
        },
        rs,
      ]}
    >
      {children}
    </Animated.View>
  );
};
