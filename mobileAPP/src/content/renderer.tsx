/**
 * Рендер контента страницы: маппинг имён компонентов (Body, Block, Heading, Paragraph, Image, LinkText, CategoryFilter, ContentList)
 * на RN-компоненты и отрисовка страницы из массива узлов (ComponentNode[]).
 */

import React from "react";
import { View, Text as RNText } from "react-native";
import type { ComponentNode } from "./interface";
import { useResponsiveViewport } from "../contexts/ResponsiveViewportContext";
import type { Viewport } from "./responsiveStyle";
import { Body } from "../components/Body";
import { Block } from "../components/Block";
import { Heading } from "../components/Heading";
import { Paragraph } from "../components/Paragraph";
import { Image } from "../components/Image";
import { LinkText } from "../components/LinkText";
import { LinkBlock } from "../components/LinkBlock";
import { Button } from "../components/Button";
import { CategoryFilter } from "../components/CategoryFilter";
import { ContentList } from "../components/ContentList";
import { Navbar } from "../components/Navbar/Navbar";
import { NavbarLinks } from "../components/Navbar/components/NavbarLinks/NavbarLinks";
import { NavbarMenuButton } from "../components/Navbar/components/NavbarMenuButton/NavbarMenuButton";
import { NavbarMenu } from "../components/Navbar/components/NavbarMenu/NavbarMenu";
import { Icon } from "../components/Icon/Icon";
import { ConditionalVisibilityGate } from "../components/ConditionalVisibilityGate/ConditionalVisibilityGate";
import type { ConditionalVisibilityConfig } from "../lib/conditionalVisibility";

const componentMap = {
  Body,
  Block,
  Heading,
  Paragraph,
  Image,
  LinkText,
  LinkBlock,
  Button,
  CategoryFilter, // связка с ContentList по `filterScope` через CollectionFilterScope
  ContentList,
  Navbar,
  NavbarLinks,
  NavbarMenuButton,
  NavbarMenu,
  Icon,
} as Record<string, React.ComponentType<any>>;

const nodeViewIds = (nodeId: string | undefined,): { nativeID?: string } => nodeId ? { nativeID: nodeId } : {};

export const renderComponent = (
  node: ComponentNode,
  viewport: Viewport,
): React.ReactElement => {
  const rawType: any = (node as any).type;
  let componentType: string;

  if (typeof rawType === "string") {
    componentType = rawType;
  } else if (typeof rawType === "function") {
    const fn = rawType as { displayName?: string; name?: string };
    componentType = fn.displayName ?? fn.name ?? "Unknown";
  } else if (typeof rawType === "symbol") {
    const sym = rawType as symbol;
    componentType =
      sym.description !== undefined ? sym.description : String(sym);
  } else {
    componentType = String(rawType);
  }

  const rawProps = ((node as any).props ?? {}) as Record<string, unknown> & {
    children?: unknown;
    conditionalVisibility?: unknown;
  };

  /**
   *  Для ContentList нужно передать внутрь "сырые" ComponentNode-дети (шаблон ячейки из конструктора),
   *  а не уже отрендеренные React-элементы.
   *  */
  if (componentType === "ContentList") {
    const templateChildren = (node as any).children as ComponentNode[] | undefined;
    const {
      children: _omitChildrenFromProps,
      conditionalVisibility: rawConfig,
      ...contentListProps
    } = rawProps;

    const renderedContentList = (
      <ContentList
        {...(contentListProps as Omit<
          React.ComponentProps<typeof ContentList>,
          "children"
        >)}
        {...nodeViewIds(node.nodeId)}
        children={templateChildren}
      />
    );

    return (
      <ConditionalVisibilityGate
        rawConfig={rawConfig as ConditionalVisibilityConfig | null | undefined}
        componentProps={contentListProps}
      >
        {renderedContentList}
      </ConditionalVisibilityGate>
    );
  }

  const childrenNodes = (node as any).children as ComponentNode[] | undefined;

  const children = childrenNodes
    ? childrenNodes.map((child, index) => (
      <React.Fragment key={index}>
        {renderComponent(child, viewport)}
      </React.Fragment>
    ))
    : undefined;

  /** узлы-обёртки React.Fragment из сериализованного дерева просто разворачиваем, не пытаясь искать их в componentMap. */
  if (componentType.toLowerCase().includes("fragment")) {
    const { conditionalVisibility: rawConfig, ...componentProps } = rawProps;
    return (
      <ConditionalVisibilityGate
        rawConfig={rawConfig as ConditionalVisibilityConfig | null | undefined}
        componentProps={componentProps}
      >
        <>{children}</>
      </ConditionalVisibilityGate>
    );
  }

  const Component = componentMap[componentType];

  if (!Component) {
    /**
     * Если мы не знаем компонент, но у него есть дети — считаем обёрткой и рендерим только детей.
     *  В идеале мы должны знать все комопоенты, сделано только для того что не ломать при добавление новых комп. в констркутор
     *  */
    if (children) {
      const { conditionalVisibility: rawConfig, ...componentProps } = rawProps;
      return (
        <ConditionalVisibilityGate
          rawConfig={rawConfig as ConditionalVisibilityConfig | null | undefined}
          componentProps={componentProps}
        >
          <>{children}</>
        </ConditionalVisibilityGate>
      );
    }

    const unknownComponent = (
      <View>
        <RNText>{`Unknown component: ${componentType}`}</RNText>
      </View>
    );

    const { conditionalVisibility: rawConfig, ...componentProps } = rawProps;

    return (
      <ConditionalVisibilityGate
        rawConfig={rawConfig as ConditionalVisibilityConfig | null | undefined}
        componentProps={componentProps}
      >
        {unknownComponent}
      </ConditionalVisibilityGate>
    );
  }

  const { conditionalVisibility: rawConfig, ...componentProps } = rawProps;

  return (
    <ConditionalVisibilityGate
      rawConfig={rawConfig as ConditionalVisibilityConfig | null | undefined}
      componentProps={componentProps}
    >
      <Component
        {...componentProps}
        {...nodeViewIds(node.nodeId)}
      >
        {children}
      </Component>
    </ConditionalVisibilityGate>
  );
};

/**
 * Renders decoded page nodes; must be mounted under `ResponsiveViewportProvider`.
 */
export const RenderPage = ({
  components,
}: {
  components: ComponentNode[];
}): React.ReactElement => {
  const { viewport } = useResponsiveViewport();
  return (
    <>
      {components.map((component, index) => (
        <React.Fragment key={index}>
          {renderComponent(component, viewport)}
        </React.Fragment>
      ))}
    </>
  );
};

export const renderPage = (components: ComponentNode[]): React.ReactElement => (
  <RenderPage components={components}/>
);
