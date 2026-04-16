import { Image as RNImage, StyleSheet, View, type ImageStyle } from "react-native";
import { useContentData } from "../contexts/ContentDataContext";
import { findContentItemField } from "../content/contentFieldValue";

interface ImageProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  /** todo кол-во полей для коллекций пока не поддерживаем в мобилке */
  collectionField?: string | null;
  backgroundColor?: string;
}

export const Image = ({
  src,
  alt = "Изображение",
  width,
  height,
  borderRadius = 8,
  collectionField = null,
  backgroundColor = "#F9F9F9",
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

  const imageStyle: ImageStyle = {
    width: width ?? "100%",
    height: height ?? undefined,
    minHeight: height ?? 140,
    borderRadius,
    resizeMode: "cover",
    backgroundColor,
  };

  return (
    <View style={styles.wrapper}>
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

