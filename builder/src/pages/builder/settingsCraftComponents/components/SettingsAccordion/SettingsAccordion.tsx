import type { ReactNode } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import { COLORS } from "../../../../../theme/colors.ts";

interface Props {
  /** Если true — оборачиваем контент в MUI-аккордеон для правого бара. */
  asAccordion?: boolean;
  /** Заголовок секции в правом баре. */
  title: string;
  /** Содержимое настроек (inputs, селекты и т.п.). */
  children: ReactNode;
}

export const SettingsAccordion = ({ asAccordion, title, children }: Props) => {
  /** В модалке настройки отображаются в блоке, в табе настроек — в аккордионе */
  if (!asAccordion) {
    return <>{children}</>;
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
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

