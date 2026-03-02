import { useEffect, useState } from "react"
import { Box } from "@mui/material"
import { Editor, type SerializedNodes } from "@craftjs/core"
import { useParams } from "react-router-dom"
import { BuilderHeader } from "./components/BuilderHeader"
import { BuilderLeftPanel } from "./components/BuilderLeftPanel/BuilderLeftPanel.tsx"
import { BuilderCanvas } from "./components/BuilderCanvas"
import { BuilderRightPanel } from "./components/BuilderRightPanel"
import { RightPanelContext } from "./context/RightPanelContext.tsx"
import { CollectionsContext } from "./context/CollectionsContext.tsx"
import { COLORS } from "../../theme/colors"
import { Block } from "../../craft/Block.tsx"
import { Body } from "../../craft/Body.tsx"
import { Text } from "../../craft/Text.tsx"
import { LinkText } from "../../craft/LinkText.tsx"
import { ContentList } from "../../craft/ContentList.tsx"
import { ContentListCell } from "../../craft/ContentListCell.tsx"
import { Image } from "../../craft/Image.tsx"
import {
  EXTRANET_API_TOKEN,
  type ExtranetPageResponse,
  fetchProductsCollection,
} from "../../api/extranet"

export const BuilderPage = () => {
  const { id } = useParams<{ id: string }>()
  /** для управления правой боковой панели */
  const [rightPanelTabIndex, setRightPanelTabIndex] = useState(0)
  const [collections, setCollections] = useState<
    { key: string; label: string; items: any[] }[]
  >([])
  const [initialContent, setInitialContent] = useState<SerializedNodes | null>(null)

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
        console.log("Данные страницы extranet по id:", id, result)

        const page = result.data

        if (page.content) {
          try {
            const parsed = JSON.parse(page.content) as SerializedNodes
            setInitialContent(parsed)
          } catch (e) {
            console.error("Не удалось распарсить content как JSON:", e)
          }
        } else {
          setInitialContent(null)
        }
      } catch (error) {
        console.error("Ошибка сети при запросе страницы extranet по id:", id, error)
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

  return (
    <Editor
      resolver={{
        Block,
        Body,
        Text,
        LinkText,
        ContentList,
        ContentListCell,
        Image,
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
            <BuilderHeader pageId={id}  />

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
  )
}
