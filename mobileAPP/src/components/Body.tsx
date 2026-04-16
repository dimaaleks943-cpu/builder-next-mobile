import type { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { resolveCraftVisualEffectsRnStyle } from "../lib/craftVisualEffectsRn";

interface BodyProps {
  backgroundColor?: string;
  opacityPercent?: number;
  children?: ReactNode;
}

export const Body = ({
  children,
  backgroundColor = "#FFFFFF",
  opacityPercent,
}: BodyProps) => {
  return (
    <View
      style={[
        styles.root,
        { backgroundColor },
        resolveCraftVisualEffectsRnStyle({ opacityPercent }),
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
  },
});

