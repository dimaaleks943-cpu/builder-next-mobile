import { useEffect, useMemo, useState } from "react"
import { StatusBar } from "expo-status-bar"
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context"
import { WebView } from "react-native-webview"
import { NavigationContainer } from "@react-navigation/native"
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from "@react-navigation/native-stack"
import type { IContentItem } from "./src/api/contentTypes"
import { SITE_DOMAIN, WEB_VIEW_BASE_URL } from "./src/api/config"
import { fetchSitePages, type SitePage } from "./src/api/sitePagesApi"
import { resolveStorefrontRoute } from "./src/api/resolveStorefrontRoute"
import { isTemplateSitePage } from "./src/lib/templateRoute"
import { ContentDataProvider } from "./src/contexts/ContentDataContext"
import { CollectionFilterScopeProvider } from "./src/contexts/CollectionFilterScopeContext"
import { StorefrontPageProvider } from "./src/contexts/StorefrontPageContext"
import { SiteCollectionsProvider } from "./src/contexts/SiteCollectionsContext"
import { craftContentToComponents } from "./src/content/craftContentToComponents"
import { renderPage } from "./src/content/renderer"

type RootStackParamList = {
  Page: { slug: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

type PageScreenProps = NativeStackScreenProps<RootStackParamList, "Page">

/**
 * Загрузка страницы по slug: паритет с site-runtime-ssr [[...slug]] (статика / template / категория).
 */
const PageScreen = ({ route }: PageScreenProps) => {
  const slug = route.params?.slug ?? "/"
  const [page, setPage] = useState<SitePage | null>(null)
  const [sitePages, setSitePages] = useState<SitePage[]>([])
  const [collectionItemsByKey, setCollectionItemsByKey] = useState<
    Record<string, IContentItem[]>
  >({})
  const [templateItem, setTemplateItem] = useState<IContentItem | null>(null)
  const [pageBaseSlug, setPageBaseSlug] = useState("/")
  const [categorySlugTrailFromUrl, setCategorySlugTrailFromUrl] = useState<
    string | null
  >(null)
  const [initialCategoryIdByScope, setInitialCategoryIdByScope] = useState<
    Record<string, string | null>
  >({})
  const [initialCategorySlugByScope, setInitialCategorySlugByScope] = useState<
    Record<string, string | null>
  >({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const uri = useMemo(() => {
    const base = WEB_VIEW_BASE_URL.replace(/\/$/, "")
    const path = slug === "/" ? "" : slug.startsWith("/") ? slug : `/${slug}`
    return `${base}${path || "/"}`
  }, [slug])

  useEffect(() => {
    setLoading(true)
    setLoadError(null)
    setPage(null)
    setSitePages([])
    setCollectionItemsByKey({})
    setTemplateItem(null)
    setPageBaseSlug("/")
    setCategorySlugTrailFromUrl(null)
    setInitialCategoryIdByScope({})
    setInitialCategorySlugByScope({})

    let cancelled = false

    ;(async () => {
      const pages = await fetchSitePages(SITE_DOMAIN)
      if (cancelled) return

      if (!pages) {
        setPage(null)
        setSitePages([])
        setLoading(false)
        return
      }

      const resolved = await resolveStorefrontRoute(SITE_DOMAIN, pages, slug)
      if (cancelled) return

      if (!resolved) {
        setPage(null)
        setSitePages([])
        setLoading(false)
        return
      }

      setSitePages(resolved.sitePages)
      setPage(resolved.page)
      setCollectionItemsByKey(resolved.collectionItemsByKey)
      setPageBaseSlug(resolved.pageBaseSlug)
      setCategorySlugTrailFromUrl(resolved.categorySlugTrailFromUrl)
      setInitialCategoryIdByScope(resolved.initialSelectedCategoryIdByScope)
      setInitialCategorySlugByScope(
        resolved.initialSelectedCategorySlugByScope,
      )
      setTemplateItem(resolved.templateContentData?.itemData ?? null)
      setLoading(false)
    })().catch(() => {
      if (!cancelled) {
        setPage(null)
        setSitePages([])
        setCollectionItemsByKey({})
        setTemplateItem(null)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [slug])

  const templateNeedsItem =
    page != null &&
    isTemplateSitePage(page) &&
    Boolean(page.collection_type_id?.trim())
  const templateItemResolved = !templateNeedsItem || templateItem != null

  const showNativeContent =
    !loading &&
    page?.is_mobile_content === true &&
    page?.content != null &&
    templateItemResolved
  let nativeComponents: ReturnType<typeof craftContentToComponents> = []
  if (showNativeContent && page?.content) {
    try {
      nativeComponents = craftContentToComponents(page.content)
    } catch {
      nativeComponents = []
    }
  }
  const useNativeRender = Boolean(
    showNativeContent && nativeComponents.length > 0,
  )

  const templateTypeId = page?.collection_type_id?.trim() ?? ""
  const wrapTemplateContentData =
    Boolean(templateItem) && Boolean(templateTypeId)

  const nativeTree =
    wrapTemplateContentData && templateItem ? (
      <ContentDataProvider
        collectionKey={templateTypeId}
        itemData={templateItem}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {renderPage(nativeComponents)}
        </ScrollView>
      </ContentDataProvider>
    ) : (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {renderPage(nativeComponents)}
      </ScrollView>
    )

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark"/>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small"/>
            <Text style={styles.message}>Загружаем страницу...</Text>
          </View>
        ) : null}

        {!loading && useNativeRender ? (
          <SiteCollectionsProvider
            key={`${SITE_DOMAIN}:${slug}`}
            domain={SITE_DOMAIN}
            sitePages={sitePages}
            collectionItemsByKey={collectionItemsByKey}
          >
            <CollectionFilterScopeProvider
              initialSelectedCategoryIdByScope={initialCategoryIdByScope}
              initialSelectedCategorySlugByScope={initialCategorySlugByScope}
            >
              <StorefrontPageProvider
                pageBaseSlug={pageBaseSlug}
                categorySlugTrailFromUrl={categorySlugTrailFromUrl}
              >
                {nativeTree}
              </StorefrontPageProvider>
            </CollectionFilterScopeProvider>
          </SiteCollectionsProvider>
        ) : null}

        {!loading && !useNativeRender ? (
          <WebView
            source={{ uri }}
            style={styles.webView}
            startInLoadingState={false}
            onError={(e) => {
              const msg =
                e?.nativeEvent?.description ??
                e?.nativeEvent?.code?.toString() ??
                "Unknown WebView error"
              setLoadError(`${msg}\nURL: ${uri}`)
            }}
          />
        ) : null}

        {loadError ? (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorTitle}>Error loading page</Text>
            <Text style={styles.errorBody}>{loadError}</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="Page"
            component={PageScreen}
            initialParams={{ slug: "/" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  errorOverlay: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E0E0E0",
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D32F2F",
    marginBottom: 6,
  },
  errorBody: {
    fontSize: 12,
    color: "#333333",
  },
})
