import { useMemo, useState } from "react"
import { StatusBar } from "expo-status-bar"
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { WebView } from "react-native-webview"
import { NavigationContainer } from "@react-navigation/native"
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from "@react-navigation/native-stack"
import { SITE_WEB_BASE_URL } from "./src/api/config"

type RootStackParamList = {
  Page: { slug: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

type PageScreenProps = NativeStackScreenProps<RootStackParamList, "Page">

const PageScreen = ({ route }: PageScreenProps) => {
  const slug = route.params?.slug ?? "/"
  const [loadError, setLoadError] = useState<string | null>(null)

  const uri = useMemo(() => {
    const base = SITE_WEB_BASE_URL.replace(/\/$/, "")
    const path = slug === "/" ? "" : slug.startsWith("/") ? slug : `/${slug}`
    return `${base}${path || "/"}`
  }, [slug])

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <WebView
          source={{ uri }}
          style={styles.webView}
          startInLoadingState
          onError={(e) => {
            const msg =
              e?.nativeEvent?.description ??
              e?.nativeEvent?.code?.toString() ??
              "Unknown WebView error"
            setLoadError(`${msg}\nURL: ${uri}`)
          }}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" />
              <Text style={styles.message}>Загружаем страницу...</Text>
            </View>
          )}
        />

        {loadError && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorTitle}>Error loading page</Text>
            <Text style={styles.errorBody}>{loadError}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Page"
          component={PageScreen}
          initialParams={{ slug: "/" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
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
