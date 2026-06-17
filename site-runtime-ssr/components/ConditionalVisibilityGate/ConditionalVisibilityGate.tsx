import React from "react"
import { useConditionalVisibilityRuntime } from "@/hooks/useConditionalVisibilityRuntime"
import type { ConditionalVisibilityConfig } from "@/lib/conditionalVisibility"

interface Props {
  rawConfig: ConditionalVisibilityConfig | null | undefined
  componentProps: Record<string, unknown> | null
  children: React.ReactNode
}

export const ConditionalVisibilityGate = ({
  rawConfig,
  componentProps,
  children,
}: Props) => {
  const visibilityResult = useConditionalVisibilityRuntime({
    rawConfig,
    componentProps,
  })

  if (visibilityResult.isVisible) {
    return <>{children}</>
  }

  return <div style={{ display: "none" }}>{children}</div>
}
