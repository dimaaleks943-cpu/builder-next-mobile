import { useEffect, useState } from "react"
import { Box } from "@mui/material"
import { Editor, type SerializedNodes } from "@craftjs/core"
import { useParams } from "react-router-dom"
import { BuilderHeader } from "./components/BuilderHeader"
import { BuilderLeftPanel } from "./components/BuilderLeftPanel"
import { BuilderCanvas } from "./components/BuilderCanvas"
import { BuilderRightPanel } from "./components/BuilderRightPanel"
import { COLORS } from "../../theme/colors"
import { Block } from "../../craft/Block.tsx"
import { Body } from "../../craft/Body.tsx"
import { Text } from "../../craft/Text.tsx"
import { LinkText } from "../../craft/LinkText.tsx"
import { EXTRANET_API_TOKEN, type ExtranetPageResponse } from "../../api/extranet"

export const BuilderPage = () => {
  const { id } = useParams<{ id: string }>()
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

  return (
    <Editor
      resolver={{
        Block,
        Body,
        Text,
        LinkText,
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
          }}
        >
          <BuilderLeftPanel />
          <BuilderCanvas initialContent={initialContent} />
          <BuilderRightPanel />
        </Box>
      </Box>
    </Editor>
  )
}
