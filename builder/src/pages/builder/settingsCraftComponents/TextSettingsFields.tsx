import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import { useEditor } from "@craftjs/core";
import { COLORS } from "../../../theme/colors";
import { useContentListData } from "../../../craft/ContentListDataContext";
import { useCollectionsContext } from "../CollectionsContext";
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName";

interface SelectedTextProps {
  text?: string;
  collectionField?: string | null;
}

interface EditorSelection {
  selectedId: string | null;
  selectedProps: SelectedTextProps | null;
  parentCollectionKey: string | null;
}

interface Props {
  /** Если true — рендерится как аккордеон в правой панели, иначе — как простой блок в модалке. */
  asAccordion?: boolean;
}

export const TextSettingsFields = ({ asAccordion }: Props) => {
  const { actions } = useEditor();
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

            if (displayName === "ContentList") {
              const selectedSource = (ancestorNode.data.props as any)
                ?.selectedSource as string | undefined;
              if (selectedSource) {
                foundCollectionKey = selectedSource;
              }
              break;
            }
          }
        } catch {
          // пока игнор
        }
      }

      return {
        selectedId: id ?? null,
        selectedProps: (node?.data.props as SelectedTextProps) ?? null,
        parentCollectionKey: foundCollectionKey,
      };
    },
  );

  const contentListData = useContentListData();
  const collectionsContext = useCollectionsContext();

  const [textDraft, setTextDraft] = useState<string>(selectedProps?.text ?? "");

  /** Синхронизируем локальный стейт с актуальными пропсами текста */
  useEffect(() => {
    setTextDraft(selectedProps?.text ?? "");
  }, [selectedProps?.text]);

  const effectiveCollectionKey =
    contentListData?.collectionKey ?? parentCollectionKey;

  /** Получаем список полей коллекции, когда текст находится внутри ContentList */
  const collectionFields = useMemo(() => {
    if (!effectiveCollectionKey || !collectionsContext) {
      return [];
    }

    const collection = collectionsContext.collections.find(
      (c) => c.key === effectiveCollectionKey,
    );

    if (!collection || !collection.items || collection.items.length === 0) {
      return [];
    }

    const firstItem = collection.items[0];
    if (!firstItem || typeof firstItem !== "object") {
      return [];
    }

    return Object.keys(firstItem).filter((key) => {
      const value = (firstItem as any)[key];
      return typeof value !== "function";
    });
  }, [effectiveCollectionKey, collectionsContext]);

  const isCollectionAvailable = Boolean(
    effectiveCollectionKey && collectionFields.length > 0,
  );

  const inputMode: "manual" | "collection" =
    isCollectionAvailable && selectedProps?.collectionField ? "collection" : "manual";

  if (!selectedId || !selectedProps) {
    return null;
  }

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setTextDraft(value);
    actions.setProp(selectedId, (props: any) => {
      props.text = value;
      /** При ручном вводе текста сбрасываем привязку к коллекции */
      props.collectionField = null;
    });
  };

  const handleCollectionFieldChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value || null;
    actions.setProp(selectedId, (props: any) => {
      props.collectionField = value;

      if (value && contentListData?.itemData) {
        const fieldValue = contentListData.itemData[value];
        if (fieldValue !== null && fieldValue !== undefined) {
          if (typeof fieldValue === "object") {
            props.text = JSON.stringify(fieldValue);
          } else {
            props.text = String(fieldValue);
          }
        }
      }
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
          props.collectionField = firstField ?? null;

          if (props.collectionField && contentListData?.itemData) {
            const fieldValue = contentListData.itemData[props.collectionField];
            if (fieldValue !== null && fieldValue !== undefined) {
              if (typeof fieldValue === "object") {
                props.text = JSON.stringify(fieldValue);
              } else {
                props.text = String(fieldValue);
              }
            }
          }
        }
      }
    });
  };

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* TODO переключатель режимов, вынести */}
      {isCollectionAvailable && (
        <Box
          sx={{
            display: "flex",
            gap: "4px",
            marginBottom: "12px",
            backgroundColor: COLORS.gray100,
            padding: "4px",
            borderRadius: "4px",
          }}
        >
          <Box
            component="button"
            type="button"
            onClick={() => handleModeSwitch("manual")}
            sx={{
              flex: 1,
              padding: "6px 8px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: inputMode === "manual" ? COLORS.white : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontSize: "12px",
              color: inputMode === "manual" ? COLORS.gray800 : COLORS.gray600,
              boxShadow:
                inputMode === "manual" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
            }}
          >
            <span>✏️</span>
            <span>Manual</span>
          </Box>

          <Box
            component="button"
            type="button"
            onClick={() => handleModeSwitch("collection")}
            sx={{
              flex: 1,
              padding: "6px 8px",
              border: "none",
              borderRadius: "4px",
              backgroundColor:
                inputMode === "collection" ? COLORS.white : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontSize: "12px",
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
            sx={{
              display: "block",
              marginBottom: "4px",
              fontSize: "12px",
              color: COLORS.gray700,
            }}
          >
            Text
          </Typography>
          <Box
            component="textarea"
            value={textDraft}
            onChange={handleTextChange}
            sx={{
              width: "100%",
              minHeight: "80px",
              borderRadius: "4px",
              border: `1px solid ${COLORS.gray300}`,
              backgroundColor: COLORS.white,
              padding: "8px",
              fontSize: "12px",
              fontFamily: "inherit",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              cursor: "text",
              "&:focus": {
                borderColor: COLORS.purple400,
              },
            }}
          />
        </Box>
      )}

      {inputMode === "collection" && isCollectionAvailable && (
        <Box>
          <Typography
            sx={{
              display: "block",
              marginBottom: "4px",
              fontSize: "12px",
              color: COLORS.gray700,
            }}
          >
            Collection Field
          </Typography>
          <Box
            component="select"
            value={selectedProps.collectionField ?? ""}
            onChange={handleCollectionFieldChange}
            sx={{
              width: "100%",
              boxSizing: "border-box",
              padding: "6px 8px",
              fontSize: "13px",
              borderRadius: "4px",
              border: `1px solid ${COLORS.gray300}`,
              backgroundColor: COLORS.white,
              cursor: "pointer",
            }}
          >
            <option value="">Select field...</option>
            {collectionFields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );

  /** В модалке настройки отображаются в блоке, в табе настроек — в аккордионе */
  if (!asAccordion) {
    return content;
  }

  return (
    <Accordion defaultExpanded disableGutters>
      <AccordionSummary
        sx={{
          minHeight: "40px",
          "& .MuiAccordionSummary-content": { margin: 0 },
        }}
      >
        <Typography sx={{ color: COLORS.gray700, fontSize: "12px" }}>
          Text settings
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{content}</AccordionDetails>
    </Accordion>
  );
};

