import { Box, Button, IconButton } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import { useUpdateExtranetPageMutation } from "../../../store/extranetApi"
import {
  useBuilderModeContext,
  type BuilderMode,
} from "../context/BuilderModeContext"
import { MODE_TYPE, type PreviewViewport } from "../builder.enum"
import { encodeSerializedNodesStyleProps } from "../../../utils/stylePropsCodec"
import { compactContentListCells } from "../../../utils/compactContentListCells"
import { MonitorIcon } from "../../../icons/MonitorIcon.tsx";
import { TabletIcon } from "../../../icons/TabletIcon.tsx";
import { MobileIcon } from "../../../icons/MobileIcon.tsx";

interface BuilderHeaderProps {
  pageId?: string
  previewViewport: PreviewViewport
  onPreviewViewportChange: (viewport: PreviewViewport) => void
}

const MODES: { value: BuilderMode; label: string }[] = [
  { value: MODE_TYPE.WEB, label: "WEB" },
  { value: MODE_TYPE.RN, label: "APP" },
]

export const BuilderHeader = ({
  pageId,
  previewViewport,
  onPreviewViewportChange,
}: BuilderHeaderProps) => {
  const navigate = useNavigate()
  const { actions, query } = useEditor()
  const modeContext = useBuilderModeContext()
  const [updateExtranetPage, { isLoading: isSaving }] =
    useUpdateExtranetPageMutation()

  const handleClick = () => {
    actions.clearEvents()
  }

  const handleModeChange = (nextMode: BuilderMode) => {
    if (!modeContext || modeContext.mode === nextMode) return
    const serialized = query.getSerializedNodes()
    const compacted = compactContentListCells(serialized)
    const json = JSON.stringify(encodeSerializedNodesStyleProps(compacted))
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
    const compacted = compactContentListCells(serialized)
    const currentJson = JSON.stringify(encodeSerializedNodesStyleProps(compacted))

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
      await updateExtranetPage({ id: pageId, body }).unwrap()
      console.log("Страница extranet успешно сохранена:", pageId)
    } catch (error) {
      console.error(
        "Ошибка при сохранении страницы extranet:",
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
        <IconButton
          onClick={(e) => {
            e.stopPropagation()
            onPreviewViewportChange("desktop")
          }}
          size="small"
          title="Десктоп"
          disableRipple
        >
          <MonitorIcon fill={previewViewport === "desktop" ? COLORS.purple400 : COLORS.gray600}/>
        </IconButton>

        <IconButton
          disableRipple
          onClick={(e) => {
            e.stopPropagation()
            onPreviewViewportChange("tablet")
          }}
          size="small"
          title="Планшет"
        >
          <TabletIcon fill={previewViewport === "tablet" ? COLORS.purple400 : COLORS.gray600}/>
        </IconButton>

        <IconButton
          onClick={(e) => {
            e.stopPropagation()
            onPreviewViewportChange("phone")
          }}
          size="small"
          title="Телефон"
          disableRipple
        >
          <MobileIcon fill={previewViewport === "phone" ? COLORS.purple400 : COLORS.gray600}/>
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
        <Button
          variant="outlined"
          size="small"
          onClick={handleSave}
          disabled={isSaving}
        >
          Сохранить
        </Button>
      </Box>

    </Box>
  )
}
