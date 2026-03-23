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
import { BuilderModeContext } from "./context/BuilderModeContext.tsx"
import { COLORS } from "../../theme/colors"
import { CraftBlock } from "../../craft/Block.tsx"
import { CraftBody } from "../../craft/Body.tsx"
import { CraftText } from "../../craft/Text.tsx"
import { CraftLinkText } from "../../craft/LinkText.tsx"
import { CraftContentList } from "../../craft/ContentList.tsx"
import { CraftContentListCell } from "../../craft/ContentListCell.tsx"
import { CraftImage } from "../../craft/Image.tsx"
import type { IContentItem, IContentTypeField } from "../../api/extranet"
import {
  useGetContentTypesQuery,
  useGetExtranetPageQuery,
} from "../../store/extranetApi"
import { MODE_TYPE, type PreviewViewport } from "./builder.enum"

function pickBindableTypeFields(
  fields: IContentTypeField[] | undefined,
): IContentTypeField[] {
  if (!fields?.length) return []
  return fields.filter(
    (f) => f.reference_type === "item",
  )
}

/** Пустое дерево Craft (только ROOT + Body без детей). Нужно, чтобы при переключении на режим с пустым контентом Canvas вызывал deserialize и очищал холст, а не игнорировал null. */
const EMPTY_SERIALIZED_NODES: SerializedNodes = {
  ROOT: {
    type: { resolvedName: "Body" },
    isCanvas: true,
    props: {},
    displayName: "CraftBody",
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
    return (JSON.parse(raw) as SerializedNodes) || EMPTY_SERIALIZED_NODES
  } catch {
    return EMPTY_SERIALIZED_NODES
  }
}

export const BuilderPage = () => {
  const { id } = useParams<{ id: string }>()
  const [rightPanelTabIndex, setRightPanelTabIndex] = useState(0)
  const [collections, setCollections] = useState<CollectionInfo[]>([])
  const [mode, setMode] = useState<MODE_TYPE.WEB | MODE_TYPE.RN>(MODE_TYPE.WEB)
  const [contentWeb, setContentWeb] = useState("")
  const [contentMobile, setContentMobile] = useState("")
  const [loaded, setLoaded] = useState(false)
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>("desktop")

  const { data: pageResponse, isSuccess: pageLoadSuccess } =
    useGetExtranetPageQuery(id!, { skip: !id })
  const { data: typesData } = useGetContentTypesQuery({ limit: 200 })

  useEffect(() => {
    if (!id) return
    setLoaded(false)
  }, [id])

  useEffect(() => {
    if (!pageLoadSuccess || !pageResponse?.data) return
    const page = pageResponse.data
    setContentWeb(page.content ?? "")
    setContentMobile(page.content_mobile ?? "")
    setLoaded(true)
  }, [pageLoadSuccess, pageResponse, id])

  const setCollectionItems = useCallback(
    (contentTypeId: string, items: IContentItem[]) => {
      setCollections((prev) =>
        prev.map((c) =>
          c.key === contentTypeId ? { ...c, items } : c,
        ),
      )
    },
    [],
  )

  useEffect(() => {
    if (!typesData?.data?.length) {
      setCollections([])
      return
    }
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

  const collectionsContextValue = useMemo(
    () => ({
      collections,
      setCollectionItems,
    }),
    [collections, setCollectionItems],
  )

  const initialContent = useMemo(() => {
    if (!loaded) return null
    const raw = mode === MODE_TYPE.WEB ? contentWeb : contentMobile
    return parseContent(raw)
  }, [loaded, mode, contentWeb, contentMobile])

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
          Image: CraftImage,
        }}
      >
        <RightPanelContext.Provider
          value={{
            tabIndex: rightPanelTabIndex,
            setTabIndex: setRightPanelTabIndex,
          }}
        >
          <CollectionsContext.Provider value={collectionsContextValue}>
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
                />
                <BuilderRightPanel />
              </Box>
            </Box>
          </CollectionsContext.Provider>
        </RightPanelContext.Provider>
      </Editor>
    </BuilderModeContext.Provider>
  )
}
