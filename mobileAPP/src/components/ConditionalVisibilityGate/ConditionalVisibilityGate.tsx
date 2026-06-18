import React from "react";
import { View } from "react-native";
import { useConditionalVisibilityRuntime } from "../../hooks/useConditionalVisibilityRuntime";
import type { ConditionalVisibilityConfig } from "../../lib/conditionalVisibility";

interface Props {
  rawConfig: ConditionalVisibilityConfig | null | undefined;
  componentProps: Record<string, unknown> | null;
  children: React.ReactNode;
}

export const ConditionalVisibilityGate = ({
  rawConfig,
  componentProps,
  children,
}: Props): React.ReactElement => {
  const visibilityResult = useConditionalVisibilityRuntime({
    rawConfig,
    componentProps,
  });

  if (visibilityResult.isVisible) {
    return <>{children}</>;
  }

  return <View style={{ display: "none" }}>{children}</View>;
};
