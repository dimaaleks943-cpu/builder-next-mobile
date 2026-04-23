import { Box, Button, IconButton, Menu, MenuItem } from "@mui/material"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import { useUpdateExtranetPageMutation } from "../../../store/extranetApi"
import {
  useBuilderModeContext,
  type BuilderMode,
} from "../context/BuilderModeContext"
import { MODE_TYPE } from "../builder.enum"
import { encodeSerializedNodesStyleProps } from "../../../utils/stylePropsCodec"
import { compactContentListCells } from "../../../utils/compactContentListCells"
import { normalizeItemPathPrefix } from "../../../utils/normalizeItemPathPrefix.ts"
import { computePageContentTypes } from "../../../utils/computePageContentTypes"
import { PageType } from "../../../api/extranet";
import { SUPPORTED_LOCALES, type Locale } from "../../../api/extranet"
import {
  collectUsedI18nKeys,
  pruneTranslationsByKeys,
  saveStoredTranslations,
  toLocaleLabel,
} from "../../../utils/i18nTranslations.ts"

interface BuilderHeaderProps {
  pageId?: string
  pageName?: string
  pageSlug?: string
  /** С метаданных GET страницы — нужны для PUT. */
  siteId?: number
  directoryId?: string | null
  pageType?: PageType
  collectionTypeId?: string | null
  /**
   * Для `template` — редактируемый префикс из билдера (строка); для `static` — как с API или null.
   */
  itemPathPrefix?: string | null
}

const MODES: { value: BuilderMode; label: string }[] = [
  { value: MODE_TYPE.WEB, label: "Сайт" },
  { value: MODE_TYPE.RN, label: "Приложение" },
]

export const BuilderHeader = ({
  pageId,
  pageName,
  pageSlug,
  siteId,
  directoryId = null,
  pageType = PageType.STATIC,
  collectionTypeId = null,
  itemPathPrefix = null,
}: BuilderHeaderProps) => {
  const navigate = useNavigate()
  const { actions, query } = useEditor()
  const modeContext = useBuilderModeContext()
  const [updateExtranetPage, { isLoading: isSaving }] =
    useUpdateExtranetPageMutation()
  const [langMenuAnchorEl, setLangMenuAnchorEl] = useState<null | HTMLElement>(null)

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

      <Box sx={{ display: "flex", alignItems: "center", columnGap: "12px" }}>
        {modeContext && (
          <>
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
                sx={{ display: "inline-flex", width: "16px", height: "16px" }}
                aria-hidden
              >
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="#1B1D21" strokeWidth="1"/>
                  <path d="M2 8H14" stroke="#1B1D21" strokeWidth="1"/>
                  <path d="M8 2C6.2 3.8 5.2 6 5.2 8C5.2 10 6.2 12.2 8 14" stroke="#1B1D21" strokeWidth="1"/>
                  <path d="M8 2C9.8 3.8 10.8 6 10.8 8C10.8 10 9.8 12.2 8 14" stroke="#1B1D21" strokeWidth="1"/>
                </svg>
              </Box>
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
              <Box
                component="span"
                sx={{ display: "inline-flex", width: "12px", height: "12px" }}
                aria-hidden
              >
                <svg viewBox="0 0 12 12" width="12" height="12" fill="none">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="#727280" strokeWidth="1.2" strokeLinecap="round"
                        strokeLinejoin="round"/>
                </svg>
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
          </>
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
