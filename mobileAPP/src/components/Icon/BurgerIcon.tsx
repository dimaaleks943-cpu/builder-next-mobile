import { View } from "react-native";

interface Props {
  fill?: string;
}

export const BurgerIcon = ({ fill = "currentColor" }: Props) => (
  <View style={{ width: 28, height: 24, justifyContent: "space-between" }}>
    <View style={{ height: 4, width: "100%", backgroundColor: fill }} />
    <View style={{ height: 4, width: "100%", backgroundColor: fill }} />
    <View style={{ height: 4, width: "100%", backgroundColor: fill }} />
  </View>
);
