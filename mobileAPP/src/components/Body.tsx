import type { ReactNode } from "react";
import { View, StyleSheet } from "react-native";

interface BodyProps {
  children?: ReactNode;
  backgroundColor?: string;
}

export const Body = ({
  children,
  backgroundColor = "#FFFFFF",
}: BodyProps) => {
  return (
    <View style={[styles.root, { backgroundColor }]}>{children}</View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
  },
});

