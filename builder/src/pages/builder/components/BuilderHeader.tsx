import { Box, IconButton, Menu, MenuItem } from "@mui/material"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import { useUpdateExtranetPageMutation } from "../../../store/extranetApi"
import { type BuilderMode, useBuilderModeContext, } from "../context/BuilderModeContext"
import { MODE_TYPE, PreviewViewport } from "../builder.enum"
import { encodeSerializedNodesStyleProps } from "../../../utils/stylePropsCodec"
import { compactContentListCells } from "../../../utils/compactContentListCells"
import { normalizeItemPathPrefix } from "../../../utils/normalizeItemPathPrefix.ts"
import { computePageContentTypes } from "../../../utils/computePageContentTypes"
import {
  type Locale,
  PageType,
  PAGE_MODES,
  PAGE_VISIBILITY,
  SUPPORTED_LOCALES,
} from "../../../api/extranet"
import {
  collectUsedI18nKeys,
  pruneTranslationsByKeys,
  saveStoredTranslations,
  toLocaleLabel,
} from "../../../utils/i18nTranslations.ts"
import { DoneIcon } from "../../../icons/DoneIcon.tsx"
import { ChevronDownIcon } from "../../../icons/ChevronDownIcon.tsx";

interface BuilderHeaderProps {
  pageId?: string;
  pageName?: string;
  pageSlug?: string;
  /** С метаданных GET страницы — нужны для PUT. */
  siteId?: number;
  directoryId?: string | null;
  pageType?: PageType;
  collectionTypeId?: string | null;
  /**
   * Для `template` — редактируемый префикс из билдера (строка); для `static` — как с API или null.
   */
  itemPathPrefix?: string | null;
  initialPageMode?: PAGE_MODES;
  initialPageVisibility?: PAGE_VISIBILITY;
  onPreviewViewportChange: (viewport: PreviewViewport) => void;
}

const MODES: { value: BuilderMode; label: string }[] = [
  { value: MODE_TYPE.WEB, label: "Сайт" },
  { value: MODE_TYPE.RN, label: "Приложение" },
]

const DEVELOPMENT_MODES: { value: PAGE_MODES; label: string }[] = [
  { value: PAGE_MODES.COMMON, label: "Общий" },
  { value: PAGE_MODES.PLATFORM, label: "По платформам" },
]

const VISIBILITY_OPTIONS: { value: PAGE_VISIBILITY; label: string }[] = [
  { value: PAGE_VISIBILITY.ACTIVE, label: "Активная" },
  { value: PAGE_VISIBILITY.NO_INDEX, label: "Закрыта от индексации" },
  { value: PAGE_VISIBILITY.RESTRICTED, label: "Для просмотра только сотрудниками" },
]

const baseSelectButtonSx = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  padding: "4px 8px",
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#F9F9F9",
  cursor: "pointer",
  height: "20px",
  boxSizing: "border-box",
  "&:hover": {
    backgroundColor: "#F1F1F5",
  },
} as const

export const BuilderHeader = ({
  pageId,
  pageName,
  pageSlug,
  siteId,
  directoryId = null,
  pageType = PageType.STATIC,
  collectionTypeId = null,
  itemPathPrefix = null,
  initialPageMode = PAGE_MODES.PLATFORM,
  initialPageVisibility = PAGE_VISIBILITY.ACTIVE,
  onPreviewViewportChange,
}: BuilderHeaderProps) => {
  const navigate = useNavigate()
  const { actions, query } = useEditor()
  const modeContext = useBuilderModeContext()
  const [updateExtranetPage, { isLoading: isSaving }] =
    useUpdateExtranetPageMutation()
  const [langMenuAnchorEl, setLangMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [devModeMenuAnchorEl, setDevModeMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [visibilityMenuAnchorEl, setVisibilityMenuAnchorEl] =
    useState<null | HTMLElement>(null)
  const [pageMode, setPageMode] = useState<PAGE_MODES>(initialPageMode)
  const [pageVisibility, setPageVisibility] =
    useState<PAGE_VISIBILITY>(initialPageVisibility)

  useEffect(() => {
    setPageMode(initialPageMode)
  }, [initialPageMode])

  useEffect(() => {
    setPageVisibility(initialPageVisibility)
  }, [initialPageVisibility])

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
      onPreviewViewportChange(PreviewViewport.TABLET_LANDSCAPE)
    } else {
      modeContext.setContentMobile(json)
      modeContext.setMode(MODE_TYPE.WEB)
      onPreviewViewportChange(PreviewViewport.DESKTOP)
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
    if (!pageName || !pageSlug) {
      console.error("Невозможно сохранить: не загружены name/slug страницы")
      return
    }
    if (siteId == null) {
      console.error("Невозможно сохранить: не загружен site_id страницы")
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
    const { webKeys, mobileKeys } = collectUsedI18nKeys(
      contentPayload ?? "",
      mobContentPayload ?? "",
    )
    const prunedTranslate = pruneTranslationsByKeys(modeContext.translateWeb, webKeys)
    const prunedTranslateMobile = pruneTranslationsByKeys(
      modeContext.translateMobile,
      mobileKeys,
    )

    const itemPathForApi =
      pageType === PageType.TEMPLATE
        ? normalizeItemPathPrefix(itemPathPrefix ?? "")
        : itemPathPrefix ?? null
    const contentTypes = computePageContentTypes({
      content: contentPayload,
      contentMobile: mobContentPayload,
      pageType,
      collectionTypeId,
    })

    const body = {
      directory_id: directoryId,
      name: pageName,
      slug: pageSlug,
      type: pageType,
      content_types: contentTypes,
      collection_type_id: collectionTypeId,
      item_path_prefix: itemPathForApi,
      content: contentPayload,
      content_mobile: mobContentPayload,
      translate: prunedTranslate,
      translate_mobile: prunedTranslateMobile,
      sort: 0,
      site_id: siteId,
      mode: pageMode,
      visibility: pageVisibility,
    }

    try {
      await updateExtranetPage({ id: pageId, body }).unwrap()
      modeContext.setTranslateWeb(prunedTranslate)
      modeContext.setTranslateMobile(prunedTranslateMobile)
      saveStoredTranslations(pageId, {
        translate: prunedTranslate,
        translate_mobile: prunedTranslateMobile,
      })
      console.log("Страница extranet успешно сохранена:", pageId)
    } catch (error) {
      console.error(
        "Ошибка при сохранении страницы extranet:",
        pageId,
        error,
      )
    }
  }

  const isLangMenuOpen = Boolean(langMenuAnchorEl)
  const isDevModeMenuOpen = Boolean(devModeMenuAnchorEl)
  const isVisibilityMenuOpen = Boolean(visibilityMenuAnchorEl)
  const selectedVisibilityLabel =
    VISIBILITY_OPTIONS.find(({ value }) => value === pageVisibility)?.label ?? "Активная"

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

      <Box display="flex" columnGap="24px" alignItems="center">
        <IconButton onClick={() => navigate(-1)} sx={{ padding: 0 }}>
          {"<="}
        </IconButton>

        <Box
          component="button"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setDevModeMenuAnchorEl(e.currentTarget)
          }}
          sx={{
            ...baseSelectButtonSx,
            justifyContent: "flex-end",
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: "10px",
              lineHeight: "14px",
              letterSpacing: "0.015em",
              color: "#1B1D21",
              flex: 1,
              textAlign: "left",
            }}
          >
            {pageMode === PAGE_MODES.PLATFORM ? "По платформам" : "Общий"}
          </Box>
          <Box
            component="span"
            sx={{ display: "inline-flex", width: "12px", height: "12px" }}
            aria-hidden
          >
            <ChevronDownIcon size={12} fill={COLORS.gray700}/>
          </Box>
        </Box>
        <Menu
          anchorEl={devModeMenuAnchorEl}
          open={isDevModeMenuOpen}
          onClose={() => setDevModeMenuAnchorEl(null)}
          onClick={(e) => e.stopPropagation()}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          sx={{ zIndex: 12000 }}
          slotProps={{
            paper: {
              sx: {
                width: "228px",
                borderRadius: "4px",
                mt: "4px",
              },
            },
          }}
          MenuListProps={{ disablePadding: true }}
        >
          <Box sx={{ padding: "8px", borderBottom: "1px solid #DFDAEB" }}>
            <Box sx={{ fontSize: "12px", fontWeight: 500, lineHeight: "14px", color: "#1B1D21" }}>
              Режим разработки
            </Box>
          </Box>
          <Box sx={{ padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {DEVELOPMENT_MODES.map(({ value, label }) => (
              <MenuItem
                key={value}
                onClick={() => {
                  setPageMode(value)
                  setDevModeMenuAnchorEl(null)
                  if (value === PAGE_MODES.COMMON && modeContext?.mode === MODE_TYPE.RN) {
                    handleModeChange(MODE_TYPE.WEB)
                  }
                }}
                sx={{
                  minHeight: "16px",
                  padding: "2px 0",
                  fontSize: "10px",
                  lineHeight: "14px",
                  letterSpacing: "0.015em",
                  display: "flex",
                  gap: "4px",
                }}
              >
                <Box sx={{ width: "12px", height: "12px", display: "inline-flex" }}>
                  {pageMode === value ? <DoneIcon size={12} fill="#00C78D" /> : null}
                </Box>
                <Box component="span">{value === PAGE_MODES.PLATFORM ? "По платформам" : label}</Box>
              </MenuItem>
            ))}
          </Box>
        </Menu>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", columnGap: "24px" }}>
        {modeContext && (
          <>
            <Box
              component="button"
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLangMenuAnchorEl(e.currentTarget)
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 4px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "transparent",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: COLORS.gray100,
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 4px",
                  border: "none",
                  borderRadius: "4px",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: COLORS.gray100,
                  },
                }}
              >
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="#1B1D21" strokeWidth="1"/>
                  <path d="M2 8H14" stroke="#1B1D21" strokeWidth="1"/>
                  <path d="M8 2C6.2 3.8 5.2 6 5.2 8C5.2 10 6.2 12.2 8 14" stroke="#1B1D21" strokeWidth="1"/>
                  <path d="M8 2C9.8 3.8 10.8 6 10.8 8C10.8 10 9.8 12.2 8 14" stroke="#1B1D21" strokeWidth="1"/>
                </svg>

              <Box
                component="span"
                sx={{
                  fontFamily: "Roboto, sans-serif",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "14px",
                  letterSpacing: "0.0125em",
                  color: "#1B1D21",
                }}
              >
                {toLocaleLabel(modeContext.activeLocale)}
              </Box>
              <ChevronDownIcon size={12} fill={COLORS.gray700}/>
            </Box>
            </Box>
            <Menu
              anchorEl={langMenuAnchorEl}
              open={isLangMenuOpen}
              onClose={() => setLangMenuAnchorEl(null)}
              onClick={(e) => e.stopPropagation()}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              sx={{ zIndex: 12000 }}
            >
              {SUPPORTED_LOCALES.map((locale) => (
                <MenuItem
                  key={locale}
                  selected={modeContext.activeLocale === locale}
                  onClick={() => {
                    modeContext.setActiveLocale(locale as Locale)
                    setLangMenuAnchorEl(null)
                  }}
                >
                  {toLocaleLabel(locale)}
                </MenuItem>
              ))}
            </Menu>

            {pageMode !== PAGE_MODES.COMMON && (
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
                    fontWeight: 500,
                    backgroundColor:
                      modeContext.mode === value ? COLORS.purple100 : "transparent",
                    color: COLORS.purple400,
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

          </>
        )}

      </Box>

    <Box sx={{display: "flex", columnGap: "24px"}}>
      <IconButton
        onClick={handleSave}
        disabled={isSaving}
        sx={{
          width: "20px",
          height: "20px",
          color: "#00C78D",
          padding: 0,
        }}
      >
        <DoneIcon size={20} fill="#00C78D" />
      </IconButton>

      <Box
        component="button"
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setVisibilityMenuAnchorEl(e.currentTarget)
        }}
        sx={baseSelectButtonSx}
      >
        <Box
          component="span"
          sx={{ fontSize: "10px", lineHeight: "14px", letterSpacing: "0.015em", color: "#1B1D21" }}
        >
          {selectedVisibilityLabel}
        </Box>
        <Box
          component="span"
          sx={{ display: "inline-flex", width: "12px", height: "12px" }}
          aria-hidden
        >
          <ChevronDownIcon size={12} fill={COLORS.gray700}/>
        </Box>
      </Box>
      <Menu
        anchorEl={visibilityMenuAnchorEl}
        open={isVisibilityMenuOpen}
        onClose={() => setVisibilityMenuAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        sx={{ zIndex: 12000 }}
        slotProps={{
          paper: {
            sx: {
              width: "228px",
              borderRadius: "4px",
              mt: "4px",
            },
          },
        }}
        MenuListProps={{ disablePadding: true }}
      >
        <Box sx={{ padding: "8px", borderBottom: "1px solid #DFDAEB" }}>
          <Box sx={{ fontSize: "12px", fontWeight: 500, lineHeight: "14px", color: "#1B1D21" }}>
            Выберите тип публикации
          </Box>
        </Box>
        <Box sx={{ padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {VISIBILITY_OPTIONS.map(({ value }) => (
            <MenuItem
              key={value}
              onClick={() => {
                setPageVisibility(value)
                setVisibilityMenuAnchorEl(null)
              }}
              sx={{
                minHeight: "16px",
                padding: "2px 0",
                fontSize: "10px",
                lineHeight: "14px",
                letterSpacing: "0.015em",
                display: "flex",
                gap: "4px",
              }}
            >
              <Box sx={{ width: "12px", height: "12px", display: "inline-flex" }}>
                {pageVisibility === value ? <DoneIcon size={12} fill="#00C78D" /> : null}
              </Box>
              <Box component="span">
                {value === PAGE_VISIBILITY.ACTIVE
                  ? "Активна"
                  : value === PAGE_VISIBILITY.NO_INDEX
                    ? "Закрыта от индексации"
                    : "Для просмотра только сотрудниками"}
              </Box>
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </Box>
    </Box>
  )
}
