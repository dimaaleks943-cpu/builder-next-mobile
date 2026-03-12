import { Box, Button, IconButton } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import { EXTRANET_API_TOKEN } from "../../../api/extranet"
import {
  useBuilderModeContext,
  type BuilderMode,
} from "../context/BuilderModeContext"
import { MODE_TYPE } from "../builder.enum"
import { MonitorIcon } from "../../../icons/MonitorIcon.tsx";
import { TabletIcon } from "../../../icons/TabletIcon.tsx";
import { MobileIcon } from "../../../icons/MobileIcon.tsx";

interface BuilderHeaderProps {
  pageId?: string;
}

const MODES: { value: BuilderMode; label: string }[] = [
  { value: MODE_TYPE.WEB, label: "Веб" },
  { value: MODE_TYPE.RN, label: "Мобилка" },
]

export const BuilderHeader = ({ pageId }: BuilderHeaderProps) => {
  const navigate = useNavigate()
  const { actions, query } = useEditor()
  const modeContext = useBuilderModeContext()

  const handleClick = () => {
    actions.clearEvents()
  }

  const handleModeChange = (nextMode: BuilderMode) => {
    if (!modeContext || modeContext.mode === nextMode) return
    const serialized = query.getSerializedNodes()
    const json = JSON.stringify(serialized)
    if (nextMode === MODE_TYPE.RN) {
      modeContext.setContentWeb(json)
      modeContext.setMode(MODE_TYPE.RN)
    } else {
      modeContext.setContentMobile(json)
      modeContext.setMode(MODE_TYPE.WEB)
    }
  }

  const handleSave = async () => {
    if (!pageId) {
      console.error("Невозможно сохранить: не указан pageId")
      return
    }
    if (!modeContext) {
      console.error("BuilderModeContext недоступен")
      return
    }

    const serialized = query.getSerializedNodes()
    const currentJson = JSON.stringify(serialized)

    if (modeContext.mode === MODE_TYPE.WEB) {
      modeContext.setContentWeb(currentJson)
    } else {
      modeContext.setContentMobile(currentJson)
    }

    const contentPayload =
      modeContext.mode === MODE_TYPE.WEB ? currentJson : modeContext.contentWeb
    const mobContentPayload =
      modeContext.mode === MODE_TYPE.RN ? currentJson : modeContext.contentMobile

    const body = {
      directory_id: null as string | null,
      name: "Главная",
      slug: "/",
      content: contentPayload,
      content_mobile: mobContentPayload,
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
      console.error(
        "Ошибка сети при сохранении страницы extranet:",
        pageId,
        error,
      )
    }
  }

  return (
    <Box
      sx={{
        flexShrink: 0,
        height: "44px",
        paddingTop: "12px",
        paddingRight: "8px",
        paddingBottom: "12px",
        paddingLeft: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.white,
        borderBottom: `1px solid ${COLORS.purple100}`,
        boxSizing: "border-box",
      }}
      onClick={handleClick}
    >

        <IconButton onClick={() => navigate(-1)} sx={{ padding: 0 }}>
          {"<="}
        </IconButton>

        <Box sx={{ display: "flex", columnGap: "8px" }}>
          <IconButton onClick={() => {
          }}>
            <MonitorIcon/>
          </IconButton>

          <IconButton onClick={() => {
          }}>
            <TabletIcon/>
          </IconButton>

          <IconButton onClick={() => {
          }}>
            <MobileIcon/>
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", columnGap: "12px" }}>
          {modeContext && (
            <Box
              sx={{
                display: "flex",
                border: `1px solid ${COLORS.gray200}`,
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              {MODES.map(({ value, label }) => (
                <Box
                  key={value}
                  component="button"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleModeChange(value)
                  }}
                  sx={{
                    paddingTop: "4px",
                    paddingRight: "10px",
                    paddingBottom: "4px",
                    paddingLeft: "10px",
                    fontSize: "12px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor:
                      modeContext.mode === value ? COLORS.purple100 : "transparent",
                    color:
                      modeContext.mode === value
                        ? COLORS.purple400
                        : COLORS.gray600,
                    "&:hover": {
                      backgroundColor:
                        modeContext.mode === value
                          ? COLORS.purple100
                          : COLORS.gray100,
                    },
                  }}
                >
                  {label}
                </Box>
              ))}
            </Box>
          )}
          <Button variant="outlined" size="small" onClick={handleSave}>
            Сохранить
          </Button>
        </Box>

    </Box>
  )
}
