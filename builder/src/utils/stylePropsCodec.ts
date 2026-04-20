import type { SerializedNodes } from "@craftjs/core"
import {
  FULL_TO_SHORT,
  SHORT_TO_FULL,
  type FullStylePropKey,
  type ShortStylePropKey,
} from "./stylePropsShortMapV1"

type StylePropsInput = Record<string, unknown> | null | undefined
type StyleBranches = "base" | "tablet" | "phone"

const RESPONSIVE_STYLE_BRANCHES: StyleBranches[] = ["base", "tablet", "phone"]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value)

const STYLE_KEYS = Object.keys(FULL_TO_SHORT) as FullStylePropKey[]

const encodeStyleBranch = (
  fullStyleBranch: Record<string, unknown>,
): Record<string, unknown> => {
  const encoded: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(fullStyleBranch)) {
    const shortKey = FULL_TO_SHORT[key as FullStylePropKey] ?? key
    encoded[shortKey] = value
  }

  return encoded
}

const decodeStyleBranch = (
  shortStyleBranch: Record<string, unknown>,
): Record<string, unknown> => {
  const decoded: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(shortStyleBranch)) {
    const fullKey = SHORT_TO_FULL[key as ShortStylePropKey] ?? key
    decoded[fullKey] = value
  }

  return decoded
}

export const encodeStyleProps = (
  fullProps: StylePropsInput,
): Record<string, unknown> => {
  if (!fullProps) return {}

  const encoded = { ...fullProps }
  const style = fullProps.style
  const currentStyle = isRecord(style) ? (style as Record<string, unknown>) : {}
  const normalizedStyle: Record<string, Record<string, unknown>> = {}

  for (const branch of RESPONSIVE_STYLE_BRANCHES) {
    const branchValue = currentStyle[branch]
    if (isRecord(branchValue)) {
      normalizedStyle[branch] = { ...branchValue }
    }
  }

  // Migration: if some style keys are still in flat props, move them into style.base.
  const baseBranch = { ...(normalizedStyle.base ?? {}) }
  for (const fullKey of STYLE_KEYS) {
    const shortKey = FULL_TO_SHORT[fullKey]
    const baseHasKey = Object.prototype.hasOwnProperty.call(baseBranch, fullKey)
    const flatFullValue = fullProps[fullKey]
    const flatShortValue = fullProps[shortKey]
    if (!baseHasKey) {
      if (flatFullValue !== undefined) {
        baseBranch[fullKey] = flatFullValue
      } else if (flatShortValue !== undefined) {
        baseBranch[fullKey] = flatShortValue
      }
    }
    delete encoded[fullKey]
    delete encoded[shortKey]
  }
  if (Object.keys(baseBranch).length > 0) {
    normalizedStyle.base = baseBranch
  }

  if (Object.keys(normalizedStyle).length === 0) {
    delete encoded.style
    return encoded
  }

  const encodedStyle: Record<string, unknown> = {}
  for (const branch of RESPONSIVE_STYLE_BRANCHES) {
    const branchValue = normalizedStyle[branch]
    if (!isRecord(branchValue)) continue
    encodedStyle[branch] = encodeStyleBranch(branchValue)
  }

  encoded.style = encodedStyle
  return encoded
}

export const decodeStyleProps = (
  shortProps: StylePropsInput,
): Record<string, unknown> => {
  if (!shortProps) return {}

  const decoded = { ...shortProps }
  const style = shortProps.style
  const styleRecord = isRecord(style) ? style : {}
  const decodedStyle: Record<string, Record<string, unknown>> = {}
  for (const branch of RESPONSIVE_STYLE_BRANCHES) {
    const branchValue = styleRecord[branch]
    if (!isRecord(branchValue)) continue
    decodedStyle[branch] = decodeStyleBranch(branchValue)
  }

  // Migration: old pages may keep style values in flat props.
  const baseBranch = { ...(decodedStyle.base ?? {}) }
  for (const fullKey of STYLE_KEYS) {
    const shortKey = FULL_TO_SHORT[fullKey]
    if (Object.prototype.hasOwnProperty.call(baseBranch, fullKey)) continue
    const flatFullValue = shortProps[fullKey]
    const flatShortValue = shortProps[shortKey]
    if (flatFullValue !== undefined) {
      baseBranch[fullKey] = flatFullValue
    } else if (flatShortValue !== undefined) {
      baseBranch[fullKey] = flatShortValue
    }
  }
  if (Object.keys(baseBranch).length > 0) {
    decodedStyle.base = baseBranch
  }

  if (Object.keys(decodedStyle).length > 0) {
    decoded.style = decodedStyle
  } else {
    delete decoded.style
  }
  return decoded
}

export const encodeSerializedNodesStyleProps = (
  nodes: SerializedNodes,
): SerializedNodes => {
  const encodedEntries = Object.entries(nodes).map(([nodeId, node]) => [
    nodeId,
    {
      ...node,
      props: encodeStyleProps(node.props as Record<string, unknown> | undefined),
    },
  ])

  return Object.fromEntries(encodedEntries) as SerializedNodes
}

export const decodeSerializedNodesStyleProps = (
  nodes: SerializedNodes,
): SerializedNodes => {
  const decodedEntries = Object.entries(nodes).map(([nodeId, node]) => [
    nodeId,
    {
      ...node,
      props: decodeStyleProps(node.props as Record<string, unknown> | undefined),
    },
  ])

  return Object.fromEntries(decodedEntries) as SerializedNodes
}

