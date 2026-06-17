import React from "react"
import { useConditionalVisibilityRuntime } from "@/hooks/useConditionalVisibilityRuntime"

interface Props {
  rawConfig: unknown
  componentProps: Record<string, unknown> | null | undefined
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
