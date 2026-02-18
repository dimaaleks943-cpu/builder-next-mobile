import { Box, Button, IconButton } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import { EXTRANET_API_TOKEN } from "../../../api/extranet"

interface BuilderHeaderProps {
  pageId?: string
}

export const BuilderHeader = ({ pageId }: BuilderHeaderProps) => {
  const navigate = useNavigate()
  const { actions, query } = useEditor()

  const handleClick = () => {
    actions.clearEvents()
  }

  const handleSave = async () => {
    if (!pageId) {
      console.error("Невозможно сохранить: не указан pageId")
      return
    }

    // Сериализуем текущее дерево Craft.js в JSON-структуру
    const serialized = query.getSerializedNodes()

    const body = {
      directory_id: null as string | null,
      name: "Главная",
      slug: "/main",
      content: JSON.stringify(serialized),
      sort: 0,
    }

    try {
      const response = await fetch(
        `https://dev-api.cezyo.com/v3/sites/extranet/pages/${pageId}`,
        {
          method: "PUT",
          headers: {
            Authorization: EXTRANET_API_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      )

      if (!response.ok) {
        console.error(
          "Ошибка при сохранении страницы extranet:",
          pageId,
          response.status,
          response.statusText,
        )
        return
      }

      console.log("Страница extranet успешно сохранена:", pageId)
    } catch (error) {
      console.error("Ошибка сети при сохранении страницы extranet:", pageId, error)
    }
  }

  return (
    <Box
      sx={{
        flexShrink: 0,
        height: "44px",
        padding: "12px 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.white,
        borderBottom: `1px solid ${COLORS.purple100}`,
        boxSizing: "border-box",
      }}
      onClick={handleClick}
    >
      <Box>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ padding: 0 }}
        >
          {"<="}
        </IconButton>
      </Box>

      <Box>
        <Button
          variant="outlined"
          size="small"
          onClick={handleSave}
        >
          Сохранить
        </Button>
      </Box>
    </Box>
  )
}

