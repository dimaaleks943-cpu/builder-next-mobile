import type { ReactNode } from "react";
import { View, StyleSheet } from "react-native";

interface BodyProps {
  children?: ReactNode;
}

export const Body = ({ children }: BodyProps) => {
  return <View style={styles.root}>{children}</View>;
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
});

