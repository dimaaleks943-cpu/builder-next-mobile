import {
  Image as RNImage,
  StyleSheet,
  View,
  type ImageStyle,
  type ViewStyle,
} from "react-native";
import { useContentData } from "../contexts/ContentDataContext";
import { findContentItemField } from "../content/contentFieldValue";
import { resolveCraftVisualEffectsRnStyle } from "../lib/craftVisualEffectsRn";
import { withOpacityHex } from "../lib/withOpacityHex";

interface ImageProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderColor?: string;
  borderStyle?: "none" | "solid" | "dotted";
  borderOpacity?: number;
  /** todo кол-во полей для коллекций пока не поддерживаем в мобилке */
  collectionField?: string | null;
  backgroundColor?: string;
  opacityPercent?: number;
}

export const Image = ({
  src,
  alt = "Изображение",
  width,
  height,
  borderRadius = 8,
  borderTopWidth = 0,
  borderRightWidth = 0,
  borderBottomWidth = 0,
  borderLeftWidth = 0,
  borderColor = "#CBD5E0",
  borderStyle = "solid",
  borderOpacity = 1,
  collectionField = null,
  backgroundColor = "#F9F9F9",
  opacityPercent,
}: ImageProps) => {
  const contentData = useContentData();

  let effectiveSrc: string | null = null;

  if (collectionField && contentData?.itemData) {
    const field = findContentItemField(contentData.itemData, collectionField);
    const fieldValue = field?.value_text ?? field?.value;
    if (fieldValue !== null && fieldValue !== undefined) {
      if (typeof fieldValue === "string") {
        effectiveSrc = fieldValue;
      } else if (typeof fieldValue === "object") {
        const asAny = fieldValue as any;
        const fromDirectUrl = asAny.url as string | undefined;
        const fromSmall = asAny.urls?.small?.url as string | undefined;
        const fromOriginal = asAny.urls?.original?.url as string | undefined;
        const candidate = fromDirectUrl ?? fromSmall ?? fromOriginal;
        if (candidate && typeof candidate === "string") {
          effectiveSrc = candidate;
        }
      }
    }
  }

  if (!effectiveSrc) {
    effectiveSrc =
      src && src.trim().length > 0
        ? src
        : "https://cdn-icons-png.flaticon.com/128/17807/17807769.png";  //TODO заменить на дефолт
  }

  const hasCustomBorder =
    borderTopWidth > 0 ||
    borderRightWidth > 0 ||
    borderBottomWidth > 0 ||
    borderLeftWidth > 0;

  const showBorder = hasCustomBorder && borderStyle !== "none";

  const effectiveBorderColor = showBorder
    ? withOpacityHex(borderColor ?? "#CBD5E0", borderOpacity ?? 1)
    : "transparent";

  const frameStyle: ViewStyle | undefined = showBorder
    ? {
        borderRadius,
        borderStyle: borderStyle === "dotted" ? "dotted" : "solid",
        borderColor: effectiveBorderColor,
        borderTopWidth,
        borderRightWidth,
        borderBottomWidth,
        borderLeftWidth,
        overflow: "hidden",
      }
    : undefined;

  const imageStyle: ImageStyle = {
    width: width ?? "100%",
    height: height ?? undefined,
    minHeight: height ?? 140,
    borderRadius: showBorder ? 0 : borderRadius,
    resizeMode: "cover",
    backgroundColor,
    ...resolveCraftVisualEffectsRnStyle({ opacityPercent }),
  };

  return (
    <View style={[styles.wrapper, frameStyle]}>
      <RNImage
        source={{ uri: effectiveSrc }}
        accessibilityLabel={alt}
        style={imageStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
});

