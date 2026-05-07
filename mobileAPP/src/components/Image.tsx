import {
  Image as RNImage,
  View,
  type ViewStyle, StyleProp,
} from "react-native";
import { useContentData } from "../contexts/ContentDataContext";
import { useResponsiveViewport } from "../contexts/ResponsiveViewportContext";
import {
  pickResolvedNumber,
  resolveResponsiveStyle,
} from "../content/responsiveStyle";
import { findContentItemField } from "../content/contentFieldValue";
import { resolveCraftVisualEffectsRnStyle } from "../lib/craftVisualEffectsRn";
import { borderColorHasIntrinsicAlpha, withOpacityHex } from "../lib/withOpacityHex";

interface ImageProps {
  style?: unknown;
  src?: string;
  alt?: string;
  /** todo кол-во полей для коллекций пока не поддерживаем в мобилке */
  collectionField?: string | null;
}

export const Image = ({
  src,
  alt = "Изображение",
  collectionField = null,
  style,
}: ImageProps) => {
  const { viewport } = useResponsiveViewport();
  const rs = resolveResponsiveStyle(style, viewport);
  const contentData = useContentData();
  //TODO need refactor
  const width = rs.width as number | undefined;
  const height = rs.height as number | undefined;
  const borderRadius = pickResolvedNumber(rs, "borderRadius", 8);
  const borderTopWidth = pickResolvedNumber(rs, "borderTopWidth", 0);
  const borderRightWidth = pickResolvedNumber(rs, "borderRightWidth", 0);
  const borderBottomWidth = pickResolvedNumber(rs, "borderBottomWidth", 0);
  const borderLeftWidth = pickResolvedNumber(rs, "borderLeftWidth", 0);
  const borderColor =
    rs.borderColor != null && rs.borderColor !== ""
      ? String(rs.borderColor)
      : "#CBD5E0";
  const borderStyle = (rs.borderStyle as "none" | "solid" | "dotted" | undefined) ?? "solid";
  const borderOpacity = pickResolvedNumber(rs, "borderOpacity", 1);
  const backgroundColor =
    rs.backgroundColor != null && rs.backgroundColor !== ""
      ? String(rs.backgroundColor)
      : "#F9F9F9";
  const rawOpacity = rs.opacityPercent;
  const opacityPercent =
    typeof rawOpacity === "number" && Number.isFinite(rawOpacity)
      ? rawOpacity
      : typeof rawOpacity === "string" && rawOpacity.trim() !== ""
        ? Number(rawOpacity)
        : undefined;

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

  const baseBorderColor = borderColor ?? "#CBD5E0";
  const effectiveBorderColor = showBorder
    ? borderColorHasIntrinsicAlpha(baseBorderColor)
      ? baseBorderColor
      : withOpacityHex(baseBorderColor, borderOpacity ?? 1)
    : "transparent";

  const frameStyle: StyleProp<ViewStyle> = showBorder
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

  const opacityEffects =
    opacityPercent !== undefined && Number.isFinite(opacityPercent)
      ? resolveCraftVisualEffectsRnStyle({ opacityPercent })
      : {};

  const imageStyle: React.ComponentProps<typeof RNImage>["style"] = {
    width: width ?? "100%",
    height: height ?? undefined,
    minHeight: height ?? 140,
    borderRadius: showBorder ? 0 : borderRadius,
    backgroundColor,
    ...opacityEffects,
  };


  return (
    <View style={frameStyle}>
      <RNImage
        source={{ uri: effectiveSrc }}
        accessibilityLabel={alt}
        resizeMode="cover"
        style={imageStyle}
      />
    </View>
  );
};
