import { useEffect, useMemo, useState } from "react"
import { Box } from "@mui/material"
import { Editor, type SerializedNodes } from "@craftjs/core"
import { useParams } from "react-router-dom"
import { BuilderHeader } from "./components/BuilderHeader"
import { BuilderLeftPanel } from "./components/BuilderLeftPanel/BuilderLeftPanel.tsx"
import { BuilderCanvas } from "./components/BuilderCanvas"
import { BuilderRightPanel } from "./components/BuilderRightPanel"
import { RightPanelContext } from "./context/RightPanelContext.tsx"
import { CollectionsContext } from "./context/CollectionsContext.tsx"
import { BuilderModeContext } from "./context/BuilderModeContext.tsx"
import { COLORS } from "../../theme/colors"
import { CraftBlock } from "../../craft/Block.tsx"
import { CraftBody } from "../../craft/Body.tsx"
import { CraftText } from "../../craft/Text.tsx"
import { CraftLinkText } from "../../craft/LinkText.tsx"
import { CraftContentList } from "../../craft/ContentList.tsx"
import { CraftContentListCell } from "../../craft/ContentListCell.tsx"
import { CraftImage } from "../../craft/Image.tsx"
import {
  EXTRANET_API_TOKEN,
  type ExtranetPageResponse,
  fetchProductsCollection,
} from "../../api/extranet"
import { MODE_TYPE } from "./builder.enum"

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
  const [collections, setCollections] = useState<
    { key: string; label: string; items: any[] }[]
  >([])
  const [mode, setMode] = useState<MODE_TYPE.WEB | MODE_TYPE.RN>(MODE_TYPE.WEB)
  const [contentWeb, setContentWeb] = useState("")
  const [contentMobile, setContentMobile] = useState("")
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchPage = async () => {
      try {
        const response = await fetch(
          `https://dev-api.cezyo.com/v3/sites/extranet/pages/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: EXTRANET_API_TOKEN,
            },
          },
        )

        if (!response.ok) {
          console.error(
            "Ошибка при запросе страницы по id:",
            id,
            response.status,
            response.statusText,
          )
          return
        }

        const result: ExtranetPageResponse = await response.json()
        const page = result.data

        setContentWeb(page.content ?? "")
        setContentMobile(page.mobContent ?? "")
        setLoaded(true)
      } catch (error) {
        console.error(
          "Ошибка сети при запросе страницы extranet по id:",
          id,
          error,
        )
      }
    }

    void fetchPage()
  }, [id])

  useEffect(() => {
    const fetchCollections = async () => {
      const products = await fetchProductsCollection()
      if (products) {
        setCollections([
          {
            key: "products",
            label: "Products",
            items: products.data,
          },
        ])
      }
    }

    void fetchCollections()
  }, [])

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
          <CollectionsContext.Provider
            value={{
              collections,
            }}
          >
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
              <BuilderHeader pageId={id} />

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  backgroundColor: COLORS.white,
                  minHeight: 0,
                }}
              >
                <BuilderLeftPanel />
                <BuilderCanvas initialContent={initialContent} />
                <BuilderRightPanel />
              </Box>
            </Box>
          </CollectionsContext.Provider>
        </RightPanelContext.Provider>
      </Editor>
    </BuilderModeContext.Provider>
  )
}
