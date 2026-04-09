import { PageType } from "../api/extranet"

type SerializedNode = {
  type: unknown
  props?: Record<string, unknown>
  hidden?: boolean
}

type SerializedNodes = Record<string, SerializedNode>

const resolveTypeName = (type: unknown): string => {
  if (!type) return "div"
  if (typeof type === "string") return type
  if (typeof type === "object") {
    const t = type as { resolvedName?: string; displayName?: string }
    if (typeof t.resolvedName === "string") return t.resolvedName
    if (typeof t.displayName === "string") return t.displayName
  }
  return "div"
}

export const extractContentListTypeIdsFromCraftContent = (
  content: string | null | undefined,
): string[] => {
  if (!content?.trim()) return []

  let nodes: SerializedNodes
  try {
    nodes = JSON.parse(content) as SerializedNodes
  } catch {
    return []
  }

  const ids = new Set<string>()
  for (const nodeId of Object.keys(nodes)) {
    const node = nodes[nodeId]
    if (!node || node.hidden) continue
    if (resolveTypeName(node.type) !== "ContentList") continue
    const raw = node.props?.selectedSource
    if (typeof raw !== "string") continue
    const selectedSource = raw.trim()
    if (!selectedSource) continue
    ids.add(selectedSource)
  }

  return Array.from(ids)
}

type ComputePageContentTypesParams = {
  content: string | null | undefined
  contentMobile: string | null | undefined
  pageType: PageType
  collectionTypeId: string | null | undefined
}

/**
 * метод для выборки из craftJSON ид типов контента, для последующего сохранения в content_types (pages)
 * нужен для запрета удаления типа контента когда топ испольузется на какой-либо странице
 * */
export const computePageContentTypes = ({
  content,
  contentMobile,
  pageType,
  collectionTypeId,
}: ComputePageContentTypesParams): string[] => {
  const ids = new Set<string>()

  for (const id of extractContentListTypeIdsFromCraftContent(content)) {
    ids.add(id)
  }
  for (const id of extractContentListTypeIdsFromCraftContent(contentMobile)) {
    ids.add(id)
  }

  if (pageType === PageType.TEMPLATE) {
    const templateCollectionId = collectionTypeId?.trim()
    if (templateCollectionId) {
      ids.add(templateCollectionId)
    }
  }

  return Array.from(ids).sort((a, b) => a.localeCompare(b))
}
