import type { ChangeEvent } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { useEditor } from "@craftjs/core";
import { COLORS } from "../../../theme/colors";

interface SelectedLinkProps {
  href?: string;
  openInNewTab?: boolean;
}

interface EditorSelection {
  selectedId: string | null;
  selectedProps: SelectedLinkProps | null;
}

interface Props {
  /** Если true — рендерится как аккордеон в правой панели, иначе — как простой блок в модалке. */
  asAccordion?: boolean;
}

export const LinkTextSettingsFields = ({ asAccordion }: Props) => {
  const { actions } = useEditor();
  const { selectedId, selectedProps } = useEditor(
    (state): EditorSelection => {
      const [id] = Array.from(state.events.selected);
      const node = id ? state.nodes[id] : null;
      return {
        selectedId: id ?? null,
        selectedProps: (node?.data.props as SelectedLinkProps) ?? null,
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

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Box>
        <Typography
          sx={{ color: COLORS.gray600, marginBottom: "4px", display: "block", fontSize: "12px" }}
        >
          URL
        </Typography>
        <Box
          component="input"
          type="text"
          value={selectedProps.href ?? ""}
          onChange={handleUrlChange}
          placeholder="http://www.google.com"
          sx={{
            width: "100%",
            boxSizing: "border-box",
            padding: "8px 12px",
            borderRadius: "4px",
            border: `1px solid ${COLORS.gray300}`,
            backgroundColor: COLORS.gray100,
            fontSize: "12px",
            fontFamily: "inherit",
            outline: "none",
            "&:focus": {
              borderColor: COLORS.purple400,
            },
          }}
        />
      </Box>
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
          Ссылка
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{content}</AccordionDetails>
    </Accordion>
  );
};

