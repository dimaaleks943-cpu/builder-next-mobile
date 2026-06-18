import { useMemo } from "react";
import { useContentData } from "../contexts/ContentDataContext";
import { usePageLocale } from "../contexts/PageLocaleContext";
import {
  evaluateConditionalVisibility,
  resolveConditionalVisibilitySourceValue,
  type ConditionalVisibilityConfig,
  type ConditionalVisibilityEvaluationResult,
} from "../lib/conditionalVisibility";

interface Props {
  rawConfig: ConditionalVisibilityConfig | null | undefined;
  componentProps: Record<string, unknown> | null;
}

export const useConditionalVisibilityRuntime = ({
  rawConfig,
  componentProps,
}: Props): ConditionalVisibilityEvaluationResult => {
  const { itemData } = useContentData();
  const { locale } = usePageLocale();

  return useMemo(
    () =>
      evaluateConditionalVisibility({
        rawConfig,
        context: {
          resolveSourceValue: (source) =>
            resolveConditionalVisibilitySourceValue(source, {
              collectionItem: itemData ?? null,
              locale: locale ?? null,
              componentProps,
            }),
        },
      }),
    [componentProps, itemData, locale, rawConfig],
  );
};
