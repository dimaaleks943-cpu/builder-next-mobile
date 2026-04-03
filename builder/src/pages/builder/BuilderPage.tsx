import { useCallback, useEffect, useMemo, useState } from "react"
import { Box } from "@mui/material"
import { Editor, type SerializedNodes } from "@craftjs/core"
import { useParams } from "react-router-dom"
import { BuilderHeader } from "./components/BuilderHeader"
import { BuilderLeftPanel } from "./components/BuilderLeftPanel/BuilderLeftPanel.tsx"
import { BuilderCanvas } from "./components/BuilderCanvas"
import { BuilderRightPanel } from "./components/BuilderRightPanel"
import { RightPanelContext } from "./context/RightPanelContext.tsx"
import {
  CollectionsContext,
  type CollectionInfo,
} from "./context/CollectionsContext.tsx"
import { CollectionFilterScopeProvider } from "./context/CollectionFilterScopeContext.tsx"
import { BuilderTemplatePageContext } from "./context/BuilderTemplatePageContext.tsx"
import { BuilderModeContext } from "./context/BuilderModeContext.tsx"
import { COLORS } from "../../theme/colors"
import { CraftBlock } from "../../craft/Block.tsx"
import { CraftBody } from "../../craft/Body.tsx"
import { CraftText } from "../../craft/Text.tsx"
import { CraftLinkText } from "../../craft/LinkText.tsx"
import { CraftContentList } from "../../craft/ContentList.tsx"
import { CraftContentListCell } from "../../craft/ContentListCell.tsx"
import { CraftCategoryFilter } from "../../craft/CategoryFilter.tsx"
import { CraftImage } from "../../craft/Image.tsx"
import { PageType, type IContentItem, type IContentTypeField } from "../../api/extranet"
import {
  useGetContentItemsQuery,
  useGetContentTypesQuery,
  useGetExtranetPageQuery,
} from "../../store/extranetApi"
import { MODE_TYPE, type PreviewViewport } from "./builder.enum"
import { decodeSerializedNodesStyleProps } from "../../utils/stylePropsCodec"
import { CRAFT_DISPLAY_NAME } from "../../craft/craftDisplayNames.ts"
import { normalizeItemPathPrefix } from "../../utils/normalizeItemPathPrefix.ts"

function pickBindableTypeFields(
  fields: IContentTypeField[] | undefined,
): IContentTypeField[] {
  if (!fields?.length) return []
  return fields.filter(
    (f) => f.reference_type === "item",
  )
}

/** Пустое дерево Craft (только ROOT + Body без детей). Нужно, чтобы при переключении на режим с пустым контентом Canvas вызывал deserialize и очищал холст, а не игнорировал null. */
export const EMPTY_SERIALIZED_NODES: SerializedNodes = {
  ROOT: {
    type: { resolvedName: "Body" },
    isCanvas: true,
    props: {},
    displayName: CRAFT_DISPLAY_NAME.Body,
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
    parent: null,
  },
}

const parseContent = (raw: string): SerializedNodes => {
  if (!raw || !raw.trim()) return EMPTY_SERIALIZED_NODES
  try {
    const parsed = (JSON.parse(raw) as SerializedNodes) || EMPTY_SERIALIZED_NODES
    return decodeSerializedNodesStyleProps(parsed)
  } catch {
    return EMPTY_SERIALIZED_NODES
  }
}

export const BuilderPage = () => {
  const { id } = useParams<{ id: string }>()
  const [rightPanelTabIndex, setRightPanelTabIndex] = useState(0)
  const [collections, setCollections] = useState<CollectionInfo[]>([])
  const [collectionItemsByKey, setCollectionItemsByKey] = useState<
    Record<string, IContentItem[]>
  >({})
  const [mode, setMode] = useState<MODE_TYPE.WEB | MODE_TYPE.RN>(MODE_TYPE.WEB)
  const [contentWeb, setContentWeb] = useState("")
  const [contentMobile, setContentMobile] = useState("")
  const [loaded, setLoaded] = useState(false)
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>("desktop")
  const [templateItemPathPrefix, setTemplateItemPathPrefix] = useState("")

  const { data: pageResponse, isSuccess: pageLoadSuccess } =
    useGetExtranetPageQuery(id!, { skip: !id })
  const { data: typesData } = useGetContentTypesQuery({ limit: 200 })

  const pageMeta = pageResponse?.data
  const templateCollectionId = pageMeta?.collection_type_id ?? null
  const isTemplateWithCollection =
    pageMeta?.type === PageType.TEMPLATE && !!templateCollectionId

  const { data: templateItemsResponse, isSuccess: templateItemsSuccess } =
    useGetContentItemsQuery(
      { contentTypeId: templateCollectionId ?? "" },
      { skip: !isTemplateWithCollection },
    )

  useEffect(() => {
    if (!id) return
    setLoaded(false)
  }, [id])

  useEffect(() => {
    if (!pageLoadSuccess || !pageResponse?.data) return
    const page = pageResponse.data
    setContentWeb(page.content ?? "")
    setContentMobile(page.content_mobile ?? "")
    if (page.type === PageType.TEMPLATE) {
      setTemplateItemPathPrefix(
        normalizeItemPathPrefix(page.item_path_prefix ?? page.slug),
      )
    }
    setLoaded(true)
  }, [pageLoadSuccess, pageResponse, id])

  const setCollectionItems = useCallback(
    (cacheKey: string, items: IContentItem[]) => {
      setCollectionItemsByKey((prev) => ({ ...prev, [cacheKey]: items }))
      if (!cacheKey.includes("::")) {
        setCollections((prev) =>
          prev.map((c) => (c.key === cacheKey ? { ...c, items } : c)),
        )
      }
    },
    [],
  )

  useEffect(() => {
    if (!typesData?.data?.length) {
      setCollections([])
      setCollectionItemsByKey({})
      return
    }
    setCollectionItemsByKey({})
    setCollections(
      typesData.data.map(
        (t): CollectionInfo => ({
          key: t.id,
          label: t.name,
          items: [],
          fields: pickBindableTypeFields(t.fields),
        }),
      ),
    )
  }, [typesData])

  useEffect(() => {
    if (!isTemplateWithCollection || !templateCollectionId) return
    if (!templateItemsSuccess) return
    setCollectionItems(templateCollectionId, templateItemsResponse?.data ?? [])
  }, [
    isTemplateWithCollection,
    templateCollectionId,
    templateItemsSuccess,
    templateItemsResponse,
    setCollectionItems,
  ])

  const collectionsContextValue = useMemo(
    () => ({
      collections,
      collectionItemsByKey,
      setCollectionItems,
    }),
    [collections, collectionItemsByKey, setCollectionItems],
  )

  const initialContent = useMemo(() => {
    if (!loaded) return null
    const raw = mode === MODE_TYPE.WEB ? contentWeb : contentMobile
    return parseContent(raw)
  }, [loaded, mode, contentWeb, contentMobile])

  const templatePreviewItem = useMemo(() => {
    if (!isTemplateWithCollection || !templateItemsSuccess || !templateItemsResponse)
      return null
    const items = templateItemsResponse.data ?? []
    return items[0] ?? null
  }, [isTemplateWithCollection, templateItemsSuccess, templateItemsResponse])
  console.log("templatePreviewItem12321", templatePreviewItem)
  const builderTemplatePageValue = useMemo(
    () => ({
      templatePageCollectionKey:
        pageMeta?.type === PageType.TEMPLATE && pageMeta.collection_type_id
          ? pageMeta.collection_type_id
          : null,
      templatePreviewItem,
    }),
    [pageMeta?.type, pageMeta?.collection_type_id, templatePreviewItem],
  )

  const modeContextValue = useMemo(
    () => ({
      mode,
      setMode,
      contentWeb,
      contentMobile,
      setContentWeb,
      setContentMobile,
    }),
    [mode, contentWeb, contentMobile],
  )

  return (
    <BuilderModeContext.Provider value={modeContextValue}>
      <Editor
        resolver={{
          Block: CraftBlock,
          Body: CraftBody,
          Text: CraftText,
          LinkText: CraftLinkText,
          ContentList: CraftContentList,
          ContentListCell: CraftContentListCell,
          CategoryFilter: CraftCategoryFilter, // filterScope должен совпадать с ContentList
          Image: CraftImage,
        }}
      >
        <RightPanelContext.Provider
          value={{
            tabIndex: rightPanelTabIndex,
            setTabIndex: setRightPanelTabIndex,
          }}
        >
          {/* Общее состояние выбора категории для CategoryFilter и ContentList на canvas */}
          <CollectionFilterScopeProvider>
            <CollectionsContext.Provider value={collectionsContextValue}>
            <BuilderTemplatePageContext.Provider value={builderTemplatePageValue}>
            <Box
              sx={{
                position: "fixed",
                inset: 0,
                zIndex: (theme) => theme.zIndex.modal + 1,
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                backgroundColor: COLORS.gray100,
              }}
            >
              <BuilderHeader
                pageId={id}
                pageName={pageMeta?.name}
                pageSlug={pageMeta?.slug}
                siteId={pageMeta?.site_id}
                directoryId={pageMeta?.directory_id ?? null}
                pageType={pageMeta?.type ?? PageType.STATIC}
                collectionTypeId={pageMeta?.collection_type_id ?? null}
                itemPathPrefix={
                  pageMeta?.type === PageType.TEMPLATE
                    ? templateItemPathPrefix
                    : (pageMeta?.item_path_prefix ?? null)
                }
                previewViewport={previewViewport}
                onPreviewViewportChange={setPreviewViewport}
              />

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  backgroundColor: COLORS.white,
                  minHeight: 0,
                }}
              >
                <BuilderLeftPanel />
                <BuilderCanvas
                  initialContent={initialContent}
                  previewViewport={previewViewport}
                  pageType={pageMeta?.type ?? PageType.STATIC}
                  collectionTypeId={pageMeta?.collection_type_id ?? null}
                  templatePreviewItem={templatePreviewItem}
                />
                <BuilderRightPanel
                  isTemplatePage={pageMeta?.type === PageType.TEMPLATE}
                  templateItemPathPrefix={templateItemPathPrefix}
                  onTemplateItemPathPrefixChange={setTemplateItemPathPrefix}
                />
              </Box>
            </Box>
            </BuilderTemplatePageContext.Provider>
            </CollectionsContext.Provider>
          </CollectionFilterScopeProvider>
        </RightPanelContext.Provider>
      </Editor>
    </BuilderModeContext.Provider>
  )
}
