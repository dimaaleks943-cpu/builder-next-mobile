import React, { useMemo } from "react";
import { DEFAULT_LOCALE, type SsrLocale } from "../lib/localeFromPath";

export interface PageLocaleContextValue {
  locale: SsrLocale;
}

interface Props {
  children: React.ReactNode;
  locale: SsrLocale;
}

const defaultValue: PageLocaleContextValue = {
  locale: DEFAULT_LOCALE,
};

const PageLocaleContext = React.createContext<PageLocaleContextValue>(
  defaultValue,
);

export const PageLocaleProvider = ({
  children,
  locale,
}: Props): React.ReactElement => {
  const value = useMemo(
    () => ({
      locale,
    }),
    [locale],
  );

  return (
    <PageLocaleContext.Provider value={value}>
      {children}
    </PageLocaleContext.Provider>
  );
};

export const usePageLocale = (): PageLocaleContextValue =>
  React.useContext(PageLocaleContext);
