import type { ReactNode } from "react";
import { Linking, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useResponsiveViewport } from "../contexts/ResponsiveViewportContext";
import { useStorefrontPage } from "../contexts/StorefrontPageContext";
import { resolveResponsiveStyle } from "../content/responsiveStyle";
import { useResolvedLinkHref } from "../hooks/useResolvedLinkHref";

interface LinkBlockProps {
  style?: unknown;
  children?: ReactNode;
  href?: string;
  linkMode?: "url" | "page" | "collectionItemPage";
  collectionItemLinkTarget?: "none" | "template";
  collectionItemTemplatePageId?: string | null;
  openInNewTab?: boolean;
  nativeID?: string;
}

export const LinkBlock = ({
  children,
  href = "http://www.google.com",
  linkMode = "url",
  collectionItemLinkTarget = "none",
  collectionItemTemplatePageId = null,
  openInNewTab: _openInNewTab,
  style,
  nativeID,
}: LinkBlockProps) => {
  const { viewport } = useResponsiveViewport();
  const rs = resolveResponsiveStyle(style, viewport);
  const navigation = useNavigation<any>();
  const { previewParams } = useStorefrontPage();

  const resolvedHref = useResolvedLinkHref({
    href,
    linkMode,
    collectionItemLinkTarget,
    collectionItemTemplatePageId,
    logTag: "LinkBlock",
  });

  const handlePress = () => {
    const target =
      typeof resolvedHref === "string" ? resolvedHref.trim() : "";
    if (!target || target === "#") return;

    if (target.startsWith("/")) {
      navigation.navigate("Page", { slug: target, previewParams });
      return;
    }

    Linking.openURL(target).catch((error) => {
      console.warn("[LinkBlock] Failed to open URL:", target, error);
    });
  };

  return (
    <Pressable nativeID={nativeID} onPress={handlePress} style={[styles.linkBlock, rs]}>
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  linkBlock: {},
});
