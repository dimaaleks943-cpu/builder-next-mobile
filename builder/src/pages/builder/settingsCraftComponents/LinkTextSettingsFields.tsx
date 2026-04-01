import type { ChangeEvent } from "react";
import { useMemo } from "react";
import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { useEditor } from "@craftjs/core";
import { useParams } from "react-router-dom";
import { COLORS } from "../../../theme/colors";
import { useCollectionsContext } from "../context/CollectionsContext.tsx";
import { SettingsAccordion } from "./components/SettingsAccordion/SettingsAccordion.tsx";
import { CraftSettingsButtonGroup } from "../components/craftSettingsControls/CraftSettingsButtonGroup.tsx";
import { CraftSettingsInput } from "../components/craftSettingsControls/CraftSettingsInput.tsx";
import { CraftSettingsSelect } from "../components/craftSettingsControls/CraftSettingsSelect.tsx";
import {
  useCreateExtranetPageMutation,
  useGetExtranetPageQuery,
  useGetExtranetPagesQuery,
} from "../../../store/extranetApi.ts";
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts";
import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts";
import { EMPTY_SERIALIZED_NODES } from "../BuilderPage.tsx";
import { normalizeItemPathPrefix } from "../../../utils/normalizeItemPathPrefix.ts";

type LinkMode = "url" | "page" | "collectionItemPage";

const COLLECTION_ITEM_SELECT_NONE = "__collection_item_none__";
const COLLECTION_ITEM_SELECT_CURRENT = "__collection_item_current__";

export { normalizeItemPathPrefix };

interface SelectedLinkProps {
  href?: string;
  linkMode?: LinkMode;
  openInNewTab?: boolean;
  collectionItemLinkTarget?: "none" | "template";
  collectionItemTemplatePageId?: string | null;
}

interface EditorSelection {
  selectedId: string | null;
  /** Сериализованные пропсы узла; для выбранного узла всегда объект (в т.ч. `{}`), чтобы не зависеть от наличия `href`. */
  selectedProps: SelectedLinkProps | null;
  isLinkTextNode: boolean;
  isInsideContentList: boolean;
  /** `content_type_id` из ближайшего предка ContentList (`selectedSource`); null если коллекция в списке не выбрана. */
  contentListContentTypeId: string | null;
}

interface Props {
  /** Если true — рендерится как аккордеон в правой панели, иначе — как простой блок в модалке. */
  asAccordion?: boolean;
}

export const LinkTextSettingsFields = ({ asAccordion }: Props) => {
  const { actions } = useEditor();
  const { id: editorPageId } = useParams<{ id: string }>();
  const { data: pages, isError: isPagesError } = useGetExtranetPagesQuery();
  const {
    data: editorPageResponse,
  } = useGetExtranetPageQuery(editorPageId!, { skip: !editorPageId });
  const [createExtranetPage, { isLoading: isCreatingCollectionTemplate }] =
    useCreateExtranetPageMutation();
  const collectionsContext = useCollectionsContext();
  const { selectedId, selectedProps, isLinkTextNode, isInsideContentList, contentListContentTypeId } =
    useEditor((state, query): EditorSelection => {
      const [id] = Array.from(state.events.selected);
      const node = id ? state.nodes[id] : null;
      const isLinkText =
        Boolean(node) && resolveNodeDisplayName(node) === CRAFT_DISPLAY_NAME.LinkText;
      let foundContentListAncestor = false;
      let nearestListContentTypeId: string | null = null;

      if (id) {
        try {
          const ancestors = query.node(id).ancestors(true) as string[];
          for (const ancestorId of ancestors) {
            const ancestorNode = query.node(ancestorId).get();
            if (resolveNodeDisplayName(ancestorNode) === CRAFT_DISPLAY_NAME.ContentList) {
              foundContentListAncestor = true;
              const raw = (ancestorNode.data.props as { selectedSource?: string })
                ?.selectedSource;
              const trimmed = typeof raw === "string" ? raw.trim() : "";
              nearestListContentTypeId = trimmed.length > 0 ? trimmed : null;
              break;
            }
          }
        } catch {
          // как в TextSettingsFields: Craft query может быть недоступен на раннем этапе
        }
      }

      return {
        selectedId: id ?? null,
        selectedProps: node
          ? ((node.data.props as SelectedLinkProps | undefined) ?? {})
          : null,
        isLinkTextNode: isLinkText,
        isInsideContentList: foundContentListAncestor,
        contentListContentTypeId: nearestListContentTypeId,
      };
    });

  const contentListCollectionLabel = useMemo(() => {
    if (!contentListContentTypeId || !collectionsContext) {
      return null;
    }
    return (
      collectionsContext.collections.find((c) => c.key === contentListContentTypeId)?.label ??
      null
    );
  }, [contentListContentTypeId, collectionsContext]);

  const templatePagesForCollection = useMemo(() => {
    if (!contentListContentTypeId || !pages?.data?.length) return [];
    return pages.data
      .filter(
        (p) =>
          p.type === "template" && p.collection_type_id === contentListContentTypeId,
      )
      .slice()
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }, [contentListContentTypeId, pages?.data]);

  /** Старые узлы без `collectionItemLinkTarget` (в т.ч. в `collectionItemPage`) — без привязки к шаблону. */
  const collectionItemTargetResolved =
    selectedProps?.collectionItemLinkTarget ?? "none";
  const collectionItemTemplateId =
    collectionItemTargetResolved === "template"
      ? (selectedProps?.collectionItemTemplatePageId ?? null)
      : null;

  const orphanTemplateOption = useMemo(() => {
    if (
      collectionItemTargetResolved !== "template" ||
      !collectionItemTemplateId ||
      templatePagesForCollection.some((p) => p.id === collectionItemTemplateId)
    ) {
      return null;
    }
    const fromAll = pages?.data?.find((p) => p.id === collectionItemTemplateId);
    return {
      id: collectionItemTemplateId,
      value: fromAll?.name ?? `Шаблон (${collectionItemTemplateId.slice(0, 8)}…)`,
    };
  }, [
    collectionItemTargetResolved,
    collectionItemTemplateId,
    templatePagesForCollection,
    pages?.data,
  ]);

  const collectionItemPageSelectOptions = useMemo(() => {
    const base: { id: string; value: string }[] = [
      { id: COLLECTION_ITEM_SELECT_NONE, value: "Нет" },
    ];
    if (templatePagesForCollection.length === 0) {
      const currentLabel = contentListCollectionLabel ?? "Шаблон"
      base.push({ id: COLLECTION_ITEM_SELECT_CURRENT, value: currentLabel });
    }
    base.push(...templatePagesForCollection.map((p) => ({ id: p.id, value: p.name })));
    if (orphanTemplateOption) {
      base.push(orphanTemplateOption);
    }
    return base;
  }, [contentListCollectionLabel, templatePagesForCollection, orphanTemplateOption]);

  const collectionItemPageSelectValue = useMemo(() => {
    if (collectionItemTargetResolved !== "template" || !collectionItemTemplateId) {
      return COLLECTION_ITEM_SELECT_NONE;
    }
    return collectionItemTemplateId;
  }, [collectionItemTargetResolved, collectionItemTemplateId]);

  if (!selectedId || !isLinkTextNode) {
    return null;
  }

  const linkProps: SelectedLinkProps = selectedProps ?? {};

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    actions.setProp(selectedId, (props: any) => {
      props.href = value;
    });
  };

  const handleOpenInNewTabChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    actions.setProp(selectedId, (props: any) => {
      props.openInNewTab = checked;
    });
  };

  const handleLinkModeChange = (mode: LinkMode) => {
    actions.setProp(selectedId, (props: any) => {
      props.linkMode = mode;
      if (mode !== "collectionItemPage") {
        props.collectionItemLinkTarget = "none";
        props.collectionItemTemplatePageId = null;
      }
    });
  };

  /** Обработчик селекта для  collectionItemPage*/
  const handleCollectionItemPageSelectChange = async (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    if (!selectedId) return;
    const value = event.target.value;

    if (value === COLLECTION_ITEM_SELECT_NONE) {
      actions.setProp(selectedId, (props: any) => {
        props.collectionItemLinkTarget = "none";
        props.collectionItemTemplatePageId = null;
        props.href = "";
      });
      return;
    }

    /**
     * Если для текущего content_type_id списка уже есть шаблоны в ответе API (templatePagesForCollection), берётся первая после сортировки TODO
     * по sort и её id записывается в пропсы — без запроса на создание.
     *
     * если шаблонов нет, создаем его с type: "template" и пустым контентом
     * */
    if (value === COLLECTION_ITEM_SELECT_CURRENT) {
      if (templatePagesForCollection.length > 0) {
        const pick = templatePagesForCollection[0];
        actions.setProp(selectedId, (props: any) => {
          props.collectionItemLinkTarget = "template";
          props.collectionItemTemplatePageId = pick.id;
          props.href = "";
        });
        return;
      }

      const current = editorPageResponse?.data;
      const safeSlugPart = contentListContentTypeId?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12); //TODO
      const slug = `item-${safeSlugPart || "tpl"}-${Date.now()}`;

      const siteId = current?.site_id
      if (siteId == null) {
        console.error(
          "Невозможно создать шаблон коллекции: у текущей страницы не задан site_id",
        )
        return
      }

      try {
        const created = await createExtranetPage({
          directory_id: current?.directory_id ?? null,
          name: `Шаблон: ${contentListCollectionLabel}`,
          slug,
          type: "template",
          collection_type_id: contentListContentTypeId,
          item_path_prefix: normalizeItemPathPrefix(current?.slug),
          content: JSON.stringify(EMPTY_SERIALIZED_NODES),
          content_mobile: null,
          sort: 0,
          site_id: siteId,
        }).unwrap();

        actions.setProp(selectedId, (props: any) => {
          props.collectionItemLinkTarget = "template";
          props.collectionItemTemplatePageId = created.id;
          props.href = "";
        });
      } catch {

      }
      return;
    }

    actions.setProp(selectedId, (props: any) => {
      props.collectionItemLinkTarget = "template";
      props.collectionItemTemplatePageId = value;
      props.href = "";
    });
  };
  const handlePageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const slug = event.target.value;
    actions.setProp(selectedId, (props: any) => {
      props.href = slug;
    });
  };

  const linkMode: LinkMode = linkProps.linkMode ?? "url";
  const pageOptions = (pages?.data ?? []).map((page) => ({
    id: page.slug || page.id,
    value: page.name,
  }));
  const hasPageOptions = pageOptions.length > 0;
  const safePageOptions = hasPageOptions
    ? pageOptions
    : [{ id: "", value: isPagesError ? "Не удалось загрузить страницы" : "Нет доступных страниц" }];
  const hrefForPageMode = linkProps.href ?? "";
  const pageValue = hasPageOptions
    ? (pageOptions.some((option) => option.id === hrefForPageMode)
      ? hrefForPageMode
      : pageOptions[0].id)
    : "";

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <CraftSettingsButtonGroup
        withoutLabel
        label="Mode"
        value={linkMode}
        options={[
          { id: "url", content: "Link URL" },
          { id: "page", content: "Page" },
          ...(isInsideContentList
            ? [{ id: "collectionItemPage", content: "CollectionPage" }]
            : []),
        ]}
        onChange={(modeId) => handleLinkModeChange(modeId as LinkMode)}
      />

      {linkMode === "collectionItemPage" && (
        <>
          <CraftSettingsSelect
            label="Page"
            value={collectionItemPageSelectValue}
            onChange={(e) => {
              void handleCollectionItemPageSelectChange(e);
            }}
            options={collectionItemPageSelectOptions}
            disabled={isCreatingCollectionTemplate}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(linkProps.openInNewTab)}
                onChange={handleOpenInNewTabChange}
                size="small"
                sx={{
                  color: COLORS.gray600,
                  "&.Mui-checked": {
                    color: COLORS.purple400,
                  },
                }}
              />
            }
            label={
              <Typography sx={{ color: COLORS.gray700, fontSize: "12px" }}>
                Открыть в новой вкладке
              </Typography>
            }
          />
        </>
      )}

      {linkMode === "url" && (
        <>
          <CraftSettingsInput
            label="URL"
            value={linkProps.href ?? ""}
            onChange={handleUrlChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(linkProps.openInNewTab)}
                onChange={handleOpenInNewTabChange}
                size="small"
                sx={{
                  color: COLORS.gray600,
                  "&.Mui-checked": {
                    color: COLORS.purple400,
                  },
                }}
              />
            }
            label={
              <Typography sx={{ color: COLORS.gray700, fontSize: "12px" }}>
                Открыть в новой вкладке
              </Typography>
            }
          />
        </>
      )}

      {linkMode === "page" && (
        <>
          <CraftSettingsSelect
            label="Page"
            value={pageValue}
            onChange={handlePageChange}
            options={safePageOptions}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(linkProps.openInNewTab)}
                onChange={handleOpenInNewTabChange}
                size="small"
                sx={{
                  color: COLORS.gray600,
                  "&.Mui-checked": {
                    color: COLORS.purple400,
                  },
                }}
              />
            }
            label={
              <Typography sx={{ color: COLORS.gray700, fontSize: "12px" }}>
                Открыть в новой вкладке
              </Typography>
            }
          />
        </>
      )}
    </Box>
  );

  return (
    <SettingsAccordion asAccordion={asAccordion} title="Ссылка">
      {content}
    </SettingsAccordion>
  );
};

