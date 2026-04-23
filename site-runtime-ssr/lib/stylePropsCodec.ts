import {
  FULL_TO_SHORT,
  SHORT_TO_FULL,
  type FullStylePropKey,
  type ShortStylePropKey,
} from "./stylePropsShortMapV1"
import { BRANCHES } from "@/lib/responsiveCss";

type StylePropsInput = Record<string, unknown> | null | undefined

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value)

const STYLE_KEYS = Object.keys(FULL_TO_SHORT) as FullStylePropKey[]

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

type SerializedNodes = Record<
  string,
  {
    type: unknown
    isCanvas: boolean
    props: Record<string, unknown>
    displayName?: string
    hidden?: boolean
    nodes?: string[]
    linkedNodes?: Record<string, string>
    parent?: string
    custom?: Record<string, unknown>
  }
>


export const decodeStyleProps = (
  shortProps: StylePropsInput,
): Record<string, unknown> => {
  if (!shortProps) return {}

  const decoded = { ...shortProps }
  const style = shortProps.style
  const styleRecord = isRecord(style) ? style : {}
  const decodedStyle: Record<string, Record<string, unknown>> = {}
  for (const branch of BRANCHES) {
    const branchValue = styleRecord[branch]
    if (!isRecord(branchValue)) continue
    decodedStyle[branch] = decodeStyleBranch(branchValue)
  }

  // Migration: support pages where style keys were still stored as flat props.
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
