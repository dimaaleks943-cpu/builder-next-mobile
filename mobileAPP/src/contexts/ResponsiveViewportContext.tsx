import React, { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import {
  viewportFromWidth,
  type Viewport,
} from "../content/responsiveStyle";

export type ResponsiveViewportContextValue = {
  width: number;
  height: number;
  viewport: Viewport;
};

const defaultValue: ResponsiveViewportContextValue = {
  width: 0,
  height: 0,
  viewport: "desktop",
};

const ResponsiveViewportContext =
  React.createContext<ResponsiveViewportContextValue>(defaultValue);

export const ResponsiveViewportProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { width, height } = useWindowDimensions();
  const viewport = useMemo(() => viewportFromWidth(width), [width]);
  const value = useMemo(
    () => ({ width, height, viewport }),
    [width, height, viewport],
  );

  return (
    <ResponsiveViewportContext.Provider value={value}>
      {children}
    </ResponsiveViewportContext.Provider>
  );
};

export const useResponsiveViewport = (): ResponsiveViewportContextValue =>
  React.useContext(ResponsiveViewportContext);
