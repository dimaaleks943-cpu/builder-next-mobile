import type { ChangeEvent } from "react";
import { useMemo } from "react";
import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { useEditor } from "@craftjs/core";
import { COLORS } from "../../../theme/colors";
import { SettingsAccordion } from "./components/SettingsAccordion/SettingsAccordion.tsx";
import { CraftSettingsButtonGroup } from "../components/craftSettingsControls/CraftSettingsButtonGroup.tsx";
import { CraftSettingsInput } from "../components/craftSettingsControls/CraftSettingsInput.tsx";
import { CraftSettingsSelect } from "../components/craftSettingsControls/CraftSettingsSelect.tsx";
import { useGetExtranetPagesQuery } from "../../../store/extranetApi.ts";
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts";
import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts";
import { PageType } from "../../../api/extranet.ts";
import { PRODUCTS_SELECTED_SOURCE } from "../../../constants/contentListSources.ts";
import { Link2Icon } from "../../../icons/Link2Icon.tsx";
import { FileIcon } from "../../../icons/FileIcon.tsx";
import { FileOutlineIcon } from "../../../icons/FileOutlineIcon.tsx";

type LinkMode = "url" | "page" | "collectionItemPage";

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
  const { data: pages, isError: isPagesError } = useGetExtranetPagesQuery();
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

  const templatePagesForCollection = useMemo(() => {
    if (!contentListContentTypeId || !pages?.data?.length) return [];

    //TODO костыль! мы ищем страницы шаблоны по ид коллекции, продукт коллекции нету, соответсвтено нет ид,
    // поэтому присвоили фейк ид PRODUCTS_SELECTED_SOURCE дефолтной странице p.slug === "/products"
    // в будущем либо коллекция с продуктами существует либо если мы работаем на странице с продуктом то поиск
    // template продукт осуществляет по  p.slug === "/products"
    if (contentListContentTypeId === PRODUCTS_SELECTED_SOURCE) {
      return pages.data.filter((p) => p.slug === "/products" && !p.version);
    }

    return pages.data
      .filter(
        (p) =>
          p.type === PageType.TEMPLATE &&
          p.collection_type_id === contentListContentTypeId &&
          !p.version,
      )
      .slice()
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }, [contentListContentTypeId, pages?.data]);

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
        return;
      }

      const firstPage = templatePagesForCollection.find(() => true);
      if (firstPage) {
        props.collectionItemLinkTarget = "template";
        props.collectionItemTemplatePageId = firstPage.id;
        props.href = "";
        return;
      }

      props.collectionItemLinkTarget = "none";
      props.collectionItemTemplatePageId = null;
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
  const pageOptions = (pages?.data ?? [])
    .filter(p => [PageType.SYSTEM_PAGE, PageType.STATIC].includes(p.type))
    .map((page) => ({
    id: page.slug || page.id,
    value: page.name,
  }));
  const hasPageOptions = pageOptions.length > 0;
  const safePageOptions = hasPageOptions
    ? pageOptions
    : [{ id: "", value: isPagesError ? "Не удалось загрузить страницы" : "Нет доступных страниц" }];
  const hrefForPageMode = linkProps.href ?? "";
  const pageValue = hasPageOptions
    ? pageOptions.some((option) => option.id === hrefForPageMode)
      ? hrefForPageMode
      : pageOptions[0].id
    : "";

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <CraftSettingsButtonGroup
        withoutLabel
        label="Mode"
        value={linkMode}
        options={[
          { id: "url", content: <Link2Icon size={16}  /> },
          { id: "page", content: <FileIcon size={16} /> },
          ...(isInsideContentList
            ? [{ id: "collectionItemPage", content: <FileOutlineIcon size={16}  /> }]
            : []),
        ]}
        onChange={(modeId) => handleLinkModeChange(modeId as LinkMode)}
      />

      {linkMode === "url" && (
        <CraftSettingsInput
          label="URL"
          value={linkProps.href ?? ""}
          onChange={handleUrlChange}
        />
      )}

      {linkMode === "page" && (
        <CraftSettingsSelect
          label="Page"
          value={pageValue}
          onChange={handlePageChange}
          options={safePageOptions}
        />
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={Boolean(linkProps.openInNewTab)}
            onChange={handleOpenInNewTabChange}
            size="small"
            sx={{
              padding: 0,
              color: COLORS.gray600,
              marginLeft: "11px",

              "&.Mui-checked": {
                color: COLORS.purple400,
              },
            }}
          />
        }
        label={
          <Typography sx={{ color: COLORS.gray700, fontSize: "12px", marginLeft: "4px" }}>
            Открыть в новой вкладке
          </Typography>
        }
      />
    </Box>
  );

  return (
    <SettingsAccordion asAccordion={asAccordion} title="Ссылка">
      {content}
    </SettingsAccordion>
  );
};
