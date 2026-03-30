import type { ChangeEvent } from "react";
import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { useEditor } from "@craftjs/core";
import { COLORS } from "../../../theme/colors";
import { SettingsAccordion } from "./components/SettingsAccordion/SettingsAccordion.tsx";
import { CraftSettingsButtonGroup } from "../components/craftSettingsControls/CraftSettingsButtonGroup.tsx";
import { CraftSettingsInput } from "../components/craftSettingsControls/CraftSettingsInput.tsx";
import { CraftSettingsSelect } from "../components/craftSettingsControls/CraftSettingsSelect.tsx";
import { useGetExtranetPagesQuery } from "../../../store/extranetApi.ts";
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts";

type LinkMode = "url" | "page" | "collectionItemPage";

interface SelectedLinkProps {
  href?: string;
  linkMode?: LinkMode;
  openInNewTab?: boolean;
}

interface EditorSelection {
  selectedId: string | null;
  selectedProps: SelectedLinkProps | null;
  isInsideContentList: boolean;
}

interface Props {
  /** Если true — рендерится как аккордеон в правой панели, иначе — как простой блок в модалке. */
  asAccordion?: boolean;
}

export const LinkTextSettingsFields = ({ asAccordion }: Props) => {
  const { actions } = useEditor();
  const { data: pages, isError: isPagesError } = useGetExtranetPagesQuery();
  const { selectedId, selectedProps, isInsideContentList } = useEditor(
    (state, query): EditorSelection => {
      const [id] = Array.from(state.events.selected);
      const node = id ? state.nodes[id] : null;
      let foundContentListAncestor = false;

      if (id) {
        const ancestors = query.node(id).ancestors(true) as string[];
        for (const ancestorId of ancestors) {
          const ancestorNode = query.node(ancestorId).get();
          if (resolveNodeDisplayName(ancestorNode) === "ContentList") {
            foundContentListAncestor = true;
            break;
          }
        }
      }

      return {
        selectedId: id ?? null,
        selectedProps: (node?.data.props as SelectedLinkProps) ?? null,
        isInsideContentList: foundContentListAncestor,
      };
    },
  );

  if (!selectedId || !selectedProps || selectedProps.href === undefined) {
    return null;
  }

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
    });
  };
  const handlePageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const slug = event.target.value;
    actions.setProp(selectedId, (props: any) => {
      props.href = slug;
    });
  };

  const linkMode: LinkMode = selectedProps.linkMode ?? "url";
  const pageOptions = (pages?.data ?? []).map((page) => ({
    id: page.slug || page.id,
    value: page.name,
  }));
  const hasPageOptions = pageOptions.length > 0;
  const safePageOptions = hasPageOptions
    ? pageOptions
    : [{ id: "", value: isPagesError ? "Не удалось загрузить страницы" : "Нет доступных страниц" }];
  const pageValue = hasPageOptions
    ? (pageOptions.some((option) => option.id === selectedProps.href)
      ? selectedProps.href
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
        <Box>
          <Typography
            sx={{ color: COLORS.gray600, marginBottom: "4px", display: "block", fontSize: "12px" }}
          >
            CollectionPage
          </Typography>
          <Box
            sx={{
              width: "100%",
              boxSizing: "border-box",
              padding: "8px 12px",
              borderRadius: "4px",
              border: `1px solid ${COLORS.gray300}`,
              backgroundColor: COLORS.gray100,
              fontSize: "12px",
              color: COLORS.gray600,
            }}
          >
            collectionItemPage
          </Box>
        </Box>
      )}

      {linkMode === "url" && (
        <>
          <CraftSettingsInput
            label="URL"
            value={selectedProps.href ?? ""}
            onChange={handleUrlChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(selectedProps.openInNewTab)}
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
                checked={Boolean(selectedProps.openInNewTab)}
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

