import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Box, Typography } from "@mui/material";
import { useEditor } from "@craftjs/core";
import { COLORS } from "../../../theme/colors.ts";
import { useContentListData } from "../context/ContentListDataContext.tsx";
import { useBuilderTemplatePage } from "../context/BuilderTemplatePageContext.tsx";
import { useCollectionsContext } from "../context/CollectionsContext.tsx";
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts";
import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts";
import { SettingsAccordion } from "./components/SettingsAccordion/SettingsAccordion.tsx";
import { usePreviewViewport } from "../context/PreviewViewportContext.tsx";
import {
  resolveResponsiveStyle,
  setResponsiveStyleProp,
  type ResponsiveStyle,
} from "../responsiveStyle.ts";

interface SelectedImageProps {
  src?: string;
  width?: number;
  height?: number;
  collectionField?: string | null;
}

interface EditorSelection {
  selectedId: string | null;
  selectedProps: SelectedImageProps | null;
  parentCollectionKey: string | null;
}

interface ImageSettingsFieldsProps {
  /** Если true — рендерится как аккордеон в правой панели, иначе — как простой блок в модалке. */
  asAccordion?: boolean;
}

export const ImageSettingsFields = ({ asAccordion }: ImageSettingsFieldsProps) => {
  const { actions } = useEditor();
  const viewport = usePreviewViewport();
  const { selectedId, selectedProps, parentCollectionKey } = useEditor(
    (state, query): EditorSelection => {
      const [id] = Array.from(state.events.selected);
      const node = id ? state.nodes[id] : null;

      let foundCollectionKey: string | null = null;

      if (id) {
        try {
          const ancestors: string[] = query.node(id).ancestors(true) as string[];
          for (const ancestorId of ancestors) {
            const ancestorNode = query.node(ancestorId).get();
            const displayName = resolveNodeDisplayName(ancestorNode);

            if (displayName === CRAFT_DISPLAY_NAME.ContentList) {
              const selectedSource = (ancestorNode.data.props as any)
                ?.selectedSource as string | undefined;
              if (selectedSource) {
                foundCollectionKey = selectedSource;
              }
              break;
            }
          }
        } catch {
          // ignore
        }
      }

      const raw = node?.data.props as Record<string, unknown> | undefined;
      const resolved = resolveResponsiveStyle(raw?.style as ResponsiveStyle | undefined, viewport);
      const width = resolved.width as number | undefined;
      const height = resolved.height as number | undefined;

      return {
        selectedId: id ?? null,
        selectedProps: raw
          ? {
              src: raw.src as string | undefined,
              width,
              height,
              collectionField: (raw.collectionField as string | null | undefined) ?? null,
            }
          : null,
        parentCollectionKey: foundCollectionKey,
      };
    },
  );

  const contentListData = useContentListData();
  const { templatePageCollectionKey } = useBuilderTemplatePage();
  const collectionsContext = useCollectionsContext();

  const [urlDraft, setUrlDraft] = useState<string>(selectedProps?.src ?? "");
  const [widthMode, setWidthMode] = useState<"auto" | "px">(
    typeof selectedProps?.width === "number" ? "px" : "auto",
  );
  const [widthValue, setWidthValue] = useState<string>(
    typeof selectedProps?.width === "number" ? String(selectedProps.width) : "",
  );
  const [heightMode, setHeightMode] = useState<"auto" | "px">(
    typeof selectedProps?.height === "number" ? "px" : "auto",
  );
  const [heightValue, setHeightValue] = useState<string>(
    typeof selectedProps?.height === "number" ? String(selectedProps.height) : "",
  );

  // Синхронизируем локальный стейт с актуальными пропсами,
  // чтобы значения совпадали между модалкой и правым табом.
  useEffect(() => {
    setUrlDraft(selectedProps?.src ?? "");
    setWidthMode(typeof selectedProps?.width === "number" ? "px" : "auto");
    setWidthValue(
      typeof selectedProps?.width === "number" ? String(selectedProps.width) : "",
    );
    setHeightMode(typeof selectedProps?.height === "number" ? "px" : "auto");
    setHeightValue(
      typeof selectedProps?.height === "number" ? String(selectedProps.height) : "",
    );
  }, [selectedProps?.src, selectedProps?.width, selectedProps?.height]);

  const effectiveCollectionKey =
    contentListData?.collectionKey ??
    parentCollectionKey ??
    templatePageCollectionKey;

  const collectionFields = useMemo(() => {
    if (!effectiveCollectionKey || !collectionsContext) {
      return [] as { id: string; label: string }[];
    }
    const collection = collectionsContext.collections.find(
      (c) => c.key === effectiveCollectionKey,
    );
    if (!collection?.fields?.length) {
      return [];
    }
    return collection.fields.map((f) => ({ id: f.id, label: f.name }));
  }, [effectiveCollectionKey, collectionsContext]);

  const isCollectionAvailable = Boolean(
    effectiveCollectionKey && collectionFields.length > 0,
  );

  const inputMode: "manual" | "collection" =
    isCollectionAvailable && selectedProps?.collectionField ? "collection" : "manual";

  if (!selectedId || !selectedProps) {
    return null;
  }

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setUrlDraft(value);
    actions.setProp(selectedId, (props: any) => {
      props.src = value;
      // При ручном вводе URL сбрасываем привязку к коллекции
      props.collectionField = null;
    });
  };

  const handleCollectionFieldChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value || null;
    actions.setProp(selectedId, (props: any) => {
      props.collectionField = value;
    });
  };

  const handleModeSwitch = (mode: "manual" | "collection") => {
    actions.setProp(selectedId, (props: any) => {
      if (mode === "manual") {
        props.collectionField = null;
      } else {
        if (!isCollectionAvailable) {
          return;
        }

        if (!props.collectionField) {
          const [firstField] = collectionFields;
          props.collectionField = firstField?.id ?? null;
        }
      }
    });
  };

  const handleWidthModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const mode = event.target.value as "auto" | "px";
    setWidthMode(mode);
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      if (mode === "auto") {
        setResponsiveStyleProp(props, "width", undefined, viewport);
      } else {
        const parsed = parseInt(widthValue || "0", 10);
        setResponsiveStyleProp(
          props,
          "width",
          Number.isNaN(parsed) ? undefined : parsed,
          viewport,
        );
      }
    });
  };

  const handleWidthValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setWidthValue(value);
    const parsed = parseInt(value, 10);
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(
        props,
        "width",
        Number.isNaN(parsed) ? undefined : parsed,
        viewport,
      );
    });
  };

  const handleHeightModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const mode = event.target.value as "auto" | "px";
    setHeightMode(mode);
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      if (mode === "auto") {
        setResponsiveStyleProp(props, "height", undefined, viewport);
      } else {
        const parsed = parseInt(heightValue || "0", 10);
        setResponsiveStyleProp(
          props,
          "height",
          Number.isNaN(parsed) ? undefined : parsed,
          viewport,
        );
      }
    });
  };

  const handleHeightValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setHeightValue(value);
    const parsed = parseInt(value, 10);
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(
        props,
        "height",
        Number.isNaN(parsed) ? undefined : parsed,
        viewport,
      );
    });
  };

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {isCollectionAvailable && (
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            mb: 1.5,
            backgroundColor: COLORS.gray100,
            p: 0.5,
            borderRadius: 1,
          }}
        >
          <Box
            component="button"
            type="button"
            onClick={() => handleModeSwitch("manual")}
            sx={{
              flex: 1,
              p: "6px 8px",
              border: "none",
              borderRadius: 1,
              backgroundColor: inputMode === "manual" ? COLORS.white : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.75,
              fontSize: 12,
              color: inputMode === "manual" ? COLORS.gray800 : COLORS.gray600,
              boxShadow:
                inputMode === "manual" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
            }}
          >
            <span>🔗</span>
            <span>Manual</span>
          </Box>

          <Box
            component="button"
            type="button"
            onClick={() => handleModeSwitch("collection")}
            sx={{
              flex: 1,
              p: "6px 8px",
              border: "none",
              borderRadius: 1,
              backgroundColor: inputMode === "collection" ? COLORS.white : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.75,
              fontSize: 12,
              color: inputMode === "collection" ? COLORS.gray800 : COLORS.gray600,
              boxShadow:
                inputMode === "collection" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
            }}
          >
            <span>🗄️</span>
            <span>Collection</span>
          </Box>
        </Box>
      )}

      {(inputMode === "manual" || !isCollectionAvailable) && (
        <Box>
          <Typography
            variant="caption"
            sx={{ display: "block", mb: 0.5, fontSize: 12, color: COLORS.gray700 }}
          >
            URL изображения
          </Typography>
          <Box
            component="input"
            type="text"
            value={urlDraft}
            onChange={handleUrlChange}
            placeholder="https://..."
            sx={{
              width: "100%",
              boxSizing: "border-box",
              p: "6px 8px",
              fontSize: 13,
              borderRadius: 1,
              border: `1px solid ${COLORS.gray300}`,
              backgroundColor: COLORS.white,
            }}
          />
        </Box>
      )}

      {inputMode === "collection" && isCollectionAvailable && (
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1,
              mb: 0.5,
              fontSize: 12,
              color: COLORS.gray700,
            }}
          >
            Поле коллекции (URL изображения)
          </Typography>
          <Box
            component="select"
            value={selectedProps.collectionField ?? ""}
            onChange={handleCollectionFieldChange}
            sx={{
              width: "100%",
              boxSizing: "border-box",
              p: "6px 8px",
              fontSize: 13,
              borderRadius: 1,
              border: `1px solid ${COLORS.gray300}`,
              backgroundColor: COLORS.white,
            }}
          >
            <option value="">Select field...</option>
            {collectionFields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.label}
              </option>
            ))}
          </Box>
        </Box>
      )}

      <Box
        sx={{
          mt: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{ display: "block", mb: 0.5, fontSize: 12, color: COLORS.gray700 }}
          >
            Width
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              component="select"
              value={widthMode}
              onChange={handleWidthModeChange}
              sx={{
                p: "4px 8px",
                fontSize: 12,
                borderRadius: 1,
                border: `1px solid ${COLORS.gray300}`,
                backgroundColor: COLORS.white,
              }}
            >
              <option value="auto">Auto</option>
              <option value="px">px</option>
            </Box>
            {widthMode === "px" && (
              <Box
                component="input"
                type="number"
                min={0}
                value={widthValue}
                onChange={handleWidthValueChange}
                placeholder="Width in px"
                sx={{
                  flex: 1,
                  p: "6px 8px",
                  fontSize: 13,
                  borderRadius: 1,
                  border: `1px solid ${COLORS.gray300}`,
                  backgroundColor: COLORS.white,
                  boxSizing: "border-box",
                }}
              />
            )}
          </Box>
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{ display: "block", mb: 0.5, fontSize: 12, color: COLORS.gray700 }}
          >
            Height
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              component="select"
              value={heightMode}
              onChange={handleHeightModeChange}
              sx={{
                p: "4px 8px",
                fontSize: 12,
                borderRadius: 1,
                border: `1px solid ${COLORS.gray300}`,
                backgroundColor: COLORS.white,
              }}
            >
              <option value="auto">Auto</option>
              <option value="px">px</option>
            </Box>
            {heightMode === "px" && (
              <Box
                component="input"
                type="number"
                min={0}
                value={heightValue}
                onChange={handleHeightValueChange}
                placeholder="Height in px"
                sx={{
                  flex: 1,
                  p: "6px 8px",
                  fontSize: 13,
                  borderRadius: 1,
                  border: `1px solid ${COLORS.gray300}`,
                  backgroundColor: COLORS.white,
                  boxSizing: "border-box",
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <SettingsAccordion asAccordion={asAccordion} title="Image">
      {content}
    </SettingsAccordion>
  );
};

