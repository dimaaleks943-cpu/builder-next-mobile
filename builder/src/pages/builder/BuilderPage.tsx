import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Box } from "@mui/material"
import { Editor } from "@craftjs/core"
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
import { PreviewViewportContext } from "./context/PreviewViewportContext.tsx"
import { CraftGridManualEditBridgeProvider } from "./context/CraftGridManualEditBridgeContext.tsx"
import { StyleClassProvider } from "./context/StyleClassContext.tsx"
import { CraftInlineSettingsBridgeProvider } from "./context/CraftInlineSettingsBridgeContext.tsx"
import { COLORS } from "../../theme/colors"
import { CraftBlock } from "../../craft/Block.tsx"
import { CraftBody } from "../../craft/Body.tsx"
import { CraftHeading } from "../../craft/CraftHeading.tsx"
import { CraftParagraph } from "../../craft/CraftParagraph.tsx"
import { CraftButton } from "../../craft/CraftButton.tsx"
import { CraftLinkText } from "../../craft/LinkText.tsx"
import { CraftLinkBlock } from "../../craft/CraftLinkBlock.tsx"
import { CraftContentList } from "../../craft/ContentList.tsx"
import { CraftContentListCell } from "../../craft/ContentListCell.tsx"
import { CraftCategoryFilter } from "../../craft/CategoryFilter.tsx"
import { CraftImage } from "../../craft/Image.tsx"
import { CraftNavbar } from "../../craft/CraftNavbar/CraftNavbar.tsx"
import { CraftNavbarMenuButton } from "../../craft/CraftNavbar/components/CraftNavbarMenuButton.tsx"
import { CraftNavbarMenu } from "../../craft/CraftNavbar/components/CraftNavbarMenu.tsx"
import { CraftNavbarLinks } from "../../craft/CraftNavbar/components/CraftNavbarLinks.tsx"
import { CraftIcon } from "../../craft/CraftIcon/CraftIcon.tsx"
import { CraftFormWrapper } from "../../craft/form/CraftFormWrapper/CraftFormWrapper.tsx"
import { CraftFormForm } from "../../craft/form/CraftFormForm/CraftFormForm.tsx"
import { CraftFormSuccessMessage } from "../../craft/form/CraftFormSuccessMessage/CraftFormSuccessMessage.tsx"
import { CraftFormErrorMessage } from "../../craft/form/CraftFormErrorMessage/CraftFormErrorMessage.tsx"
import { CraftFormInput } from "../../craft/form/CraftFormInput/CraftFormInput.tsx"
import { CraftFormBlockLabel } from "../../craft/form/CraftFormBlockLabel/CraftFormBlockLabel.tsx"
import { CraftFormTextInput } from "../../craft/form/CraftFormTextInput/CraftFormTextInput.tsx"
import { CraftFormTextarea } from "../../craft/form/CraftFormTextarea/CraftFormTextarea.tsx"
import { CraftFormButton } from "../../craft/form/CraftFormButton/CraftFormButton.tsx"
import { PageType, type IContentItem, type IContentTypeField } from "../../api/extranet"
import {
  useGetContentItemsQuery,
  useGetContentTypesQuery,
  useGetExtranetPageQuery,
} from "../../store/extranetApi"
import { MODE_TYPE, PreviewViewport } from "./builder.enum"
import {
  keyToPreviewViewport, PREVIEW_HOTKEY_KEYS_RN, PREVIEW_HOTKEY_KEYS_WEB,
  suppressPreviewHotkey,
} from "./utils/previewViewportHotkeys"
import { parsePageCraftContent } from "./utils/craftPageContent.ts"
import { normalizeItemPathPrefix } from "../../utils/normalizeItemPathPrefix.ts"
import {
  createEmptyTranslations,
  loadStoredTranslations,
  mergeTranslations,
  normalizeTranslations,
} from "../../utils/i18nTranslations.ts"
import type { Locale, TranslationsByLocale } from "../../api/extranet.ts"
import type { StyleClassesRegistry } from "./styleClasses/types.ts"
import { BuilderUploadedFontsFaceRegistry } from "./fonts/BuilderUploadedFontsFaceRegistry.tsx"
import {
  isProductsSelectedSource,
  PRODUCT_BINDABLE_FIELDS,
  PRODUCTS_SELECTED_SOURCE,
} from "../../constants/contentListSources.ts"
import { useFullProductsList } from "../../hooks/useFullProduct.ts"
import { mapFullProductToContentItem } from "../../utils/productToContentItem.ts"

function pickBindableTypeFields(
  fields: IContentTypeField[] | undefined,
): IContentTypeField[] {
  if (!fields?.length) return []
  return fields.filter(
    (f) => f.reference_type === "item",
  )
}

const pickTemplatePreviewItem = (items: IContentItem[]): IContentItem | null => {
  const withSlug = items.find(
    (i) =>
      typeof (i as { slug?: string }).slug === "string" &&
      (i as { slug: string }).slug.trim().length > 0,
  )
  return withSlug ?? items[0] ?? null
}

export const BuilderPage = () => {
  const { id } = useParams<{ id: string }>()
  const [rightPanelTabIndex, setRightPanelTabIndex] = useState(0)
  const [collections, setCollections] = useState<CollectionInfo[]>([])
  const [collectionItemsByKey, setCollectionItemsByKey] = useState<
    Record<string, IContentItem[]>
  >({})
  const [mode, setMode] = useState<MODE_TYPE.WEB | MODE_TYPE.RN>(MODE_TYPE.WEB)
  const [activeLocale, setActiveLocale] = useState<Locale>("ru")
  const [contentWeb, setContentWeb] = useState("")
  const [contentMobile, setContentMobile] = useState("")
  const [styleClassesWeb, setStyleClassesWeb] = useState<StyleClassesRegistry>({})
  const [styleClassesMobile, setStyleClassesMobile] = useState<StyleClassesRegistry>({})
  const [translateWeb, setTranslateWeb] = useState<TranslationsByLocale>(
    createEmptyTranslations(),
  )
  const [translateMobile, setTranslateMobile] = useState<TranslationsByLocale>(
    createEmptyTranslations(),
  )
  const [loaded, setLoaded] = useState(false)
  const [previewViewport, setPreviewViewport] =
    useState<PreviewViewport>(PreviewViewport.DESKTOP)
  const previewViewportRef = useRef(previewViewport)
  previewViewportRef.current = previewViewport
  const modeRef = useRef(mode)
  modeRef.current = mode
  const [templateItemPathPrefix, setTemplateItemPathPrefix] = useState("")

  const { data: pageResponse, isSuccess: pageLoadSuccess } =
    useGetExtranetPageQuery(id!, { skip: !id })
  const { data: typesData } = useGetContentTypesQuery({ limit: 200 })

  const pageMeta = pageResponse?.data
  const templateCollectionId = pageMeta?.collection_type_id ?? null
  const isTemplateWithCollection =
    pageMeta?.type === PageType.TEMPLATE && !!templateCollectionId
  const isTemplateProductsSource =
    isTemplateWithCollection &&
    !!templateCollectionId &&
    isProductsSelectedSource(templateCollectionId)

  const { data: templateItemsResponse, isSuccess: templateItemsSuccess } =
    useGetContentItemsQuery(
      { contentTypeId: templateCollectionId ?? "" },
      { skip: !isTemplateWithCollection || isTemplateProductsSource },
    )

  const {
    products: fullProducts,
    isLoading: areProductsLoading,
    isFetching: areProductsFetching,
  } = useFullProductsList({
    params: { range: [0, 0] }, //Только один продукт
    skip: !isTemplateProductsSource,
  })

  const templateProductItems = useMemo(
    () => fullProducts.map(mapFullProductToContentItem),
    [fullProducts],
  )

  useEffect(() => {
    if (!id) return
    setLoaded(false)
  }, [id])

  useEffect(() => {
    if (!pageLoadSuccess || !pageResponse?.data) return
    const page = pageResponse.data
    const webContent = parsePageCraftContent(page.content ?? "")
    const mobileContent = parsePageCraftContent(page.content_mobile ?? "")
    setContentWeb(page.content ?? "")
    setContentMobile(page.content_mobile ?? "")
    setStyleClassesWeb(webContent.styleClasses)
    setStyleClassesMobile(mobileContent.styleClasses)
    // --- TODO времено, пока храним перевод в локал сторалд, до тех пор пока сервер не предоставит поля для сохранения
    const stored = loadStoredTranslations(page.id)
    const apiTranslateWeb = normalizeTranslations(page.translate)
    const apiTranslateMobile = normalizeTranslations(page.translate_mobile)
    setTranslateWeb(
      stored ? mergeTranslations(stored.translate, apiTranslateWeb) : apiTranslateWeb,
    )
    setTranslateMobile(
      stored
        ? mergeTranslations(stored.translate_mobile, apiTranslateMobile)
        : apiTranslateMobile,
    )
    // ---
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
    const handleWindowKeyDown = (event: KeyboardEvent) => {
      const keys =
        modeRef.current === MODE_TYPE.RN
          ? PREVIEW_HOTKEY_KEYS_RN
          : PREVIEW_HOTKEY_KEYS_WEB
      if (!keys.has(event.key)) return

      if (suppressPreviewHotkey(event)) return
      const next = keyToPreviewViewport(
        event.key,
        modeRef.current === MODE_TYPE.RN,
      )
      if (!next || next === previewViewportRef.current) return
      setPreviewViewport(next)
      event.preventDefault()
      event.stopPropagation()
    }
    window.addEventListener("keydown", handleWindowKeyDown)
    return () => window.removeEventListener("keydown", handleWindowKeyDown)
  }, [])

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
          sourceKind: "content",
        }),
      ).concat([
        {
          key: PRODUCTS_SELECTED_SOURCE,
          label: "Products",
          items: [],
          fields: PRODUCT_BINDABLE_FIELDS,
          sourceKind: "products",
        },
      ]),
    )
  }, [typesData])

  useEffect(() => {
    if (!isTemplateWithCollection || !templateCollectionId) return

    if (isTemplateProductsSource) {
      if (
        !templateProductItems.length &&
        (areProductsLoading || areProductsFetching)
      ) {
        return
      }
      setCollectionItems(templateCollectionId, templateProductItems)
      return
    }

    if (!templateItemsSuccess) return
    setCollectionItems(templateCollectionId, templateItemsResponse?.data ?? [])
  }, [
    isTemplateWithCollection,
    isTemplateProductsSource,
    templateCollectionId,
    templateProductItems,
    areProductsLoading,
    areProductsFetching,
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

  const styleClasses = mode === MODE_TYPE.WEB ? styleClassesWeb : styleClassesMobile
  const setStyleClasses = mode === MODE_TYPE.WEB ? setStyleClassesWeb : setStyleClassesMobile

  const initialContent = useMemo(() => {
    if (!loaded) return null
    const raw = mode === MODE_TYPE.WEB ? contentWeb : contentMobile
    return parsePageCraftContent(raw).nodes
  }, [loaded, mode, contentWeb, contentMobile])

  const templatePreviewItem = useMemo(() => {
    if (!isTemplateWithCollection) return null

    if (isTemplateProductsSource) {
      if (
        !templateProductItems.length &&
        (areProductsLoading || areProductsFetching)
      ) {
        return null
      }
      return pickTemplatePreviewItem(templateProductItems)
    }

    if (!templateItemsSuccess || !templateItemsResponse) return null
    const items = templateItemsResponse.data ?? []
    return pickTemplatePreviewItem(items)
  }, [
    isTemplateWithCollection,
    isTemplateProductsSource,
    templateProductItems,
    areProductsLoading,
    areProductsFetching,
    templateItemsSuccess,
    templateItemsResponse,
  ])

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
      activeLocale,
      setActiveLocale,
      contentWeb,
      contentMobile,
      setContentWeb,
      setContentMobile,
      translateWeb,
      translateMobile,
      setTranslateWeb,
      setTranslateMobile,
    }),
    [
      mode,
      activeLocale,
      contentWeb,
      contentMobile,
      translateWeb,
      translateMobile,
    ],
  )

  return (
    <BuilderModeContext.Provider value={modeContextValue}>
      <PreviewViewportContext.Provider value={previewViewport}>
      <Editor
        resolver={{
          Block: CraftBlock,
          Body: CraftBody,
          Heading: CraftHeading,
          Paragraph: CraftParagraph,
          Button: CraftButton,
          LinkText: CraftLinkText,
          LinkBlock: CraftLinkBlock,
          ContentList: CraftContentList,
          ContentListCell: CraftContentListCell,
          CategoryFilter: CraftCategoryFilter, // filterScope должен совпадать с ContentList
          Image: CraftImage,
          Navbar: CraftNavbar,
          NavbarMenuButton: CraftNavbarMenuButton,
          NavbarMenu: CraftNavbarMenu,
          NavbarLinks: CraftNavbarLinks,
          Icon: CraftIcon,
          FormWrapper: CraftFormWrapper,
          FormForm: CraftFormForm,
          FormSuccessMessage: CraftFormSuccessMessage,
          FormErrorMessage: CraftFormErrorMessage,
          FormInput: CraftFormInput,
          FormBlockLabel: CraftFormBlockLabel,
          FormTextInput: CraftFormTextInput,
          FormTextarea: CraftFormTextarea,
          FormButton: CraftFormButton,
        }}
      >
        <StyleClassProvider classes={styleClasses} setClasses={setStyleClasses}>
        <CraftInlineSettingsBridgeProvider>
        <CraftGridManualEditBridgeProvider>
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
              <BuilderUploadedFontsFaceRegistry />
              <BuilderHeader
                pageId={id}
                pageName={pageMeta?.name}
                pageSlug={pageMeta?.slug}
                siteId={pageMeta?.site_id}
                directoryId={pageMeta?.directory_id ?? null}
                pageType={pageMeta?.type ?? PageType.STATIC}
                collectionTypeId={pageMeta?.collection_type_id ?? null}
                initialPageMode={pageMeta?.mode}
                initialPageVisibility={pageMeta?.visibility}
                itemPathPrefix={
                  pageMeta?.type === PageType.TEMPLATE
                    ? templateItemPathPrefix
                    : (pageMeta?.item_path_prefix ?? null)
                }
                onPreviewViewportChange={setPreviewViewport}
                pageCode={pageMeta?.code as string}
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
                  onPreviewViewportChange={setPreviewViewport}
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
        </CraftGridManualEditBridgeProvider>
        </CraftInlineSettingsBridgeProvider>
        </StyleClassProvider>
      </Editor>
      </PreviewViewportContext.Provider>
    </BuilderModeContext.Provider>
  )
}
