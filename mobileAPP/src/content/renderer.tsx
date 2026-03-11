/**
 * Рендер контента страницы: маппинг имён компонентов (Body, Block, Text, Image, LinkText, ContentList)
 * на RN-компоненты и отрисовка страницы из массива узлов (ComponentNode[]).
 */

import React from "react";
import { View, Text as RNText } from "react-native";
import type { ComponentNode } from "./interface";
import { Body } from "../components/Body";
import { Block } from "../components/Block";
import { Text } from "../components/Text";
import { Image } from "../components/Image";
import { LinkText } from "../components/LinkText";
import { ContentList } from "../components/ContentList";

const componentMap = {
  Body,
  Block,
  Text,
  Image,
  LinkText,
  ContentList,
} as Record<string, React.ComponentType<any>>;

export const renderComponent = (node: ComponentNode): React.ReactElement => {
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

  /**
   *  Для ContentList нужно передать внутрь "сырые" ComponentNode-дети (шаблон ячейки из конструктора),
   *  а не уже отрендеренные React-элементы.
   *  */
  if (componentType === "ContentList") {
    const templateChildren = (node as any).children as ComponentNode[] | undefined;
    return (
      <ContentList {...(node as any).props} children={templateChildren}/>
    );
  }

  const childrenNodes = (node as any).children as ComponentNode[] | undefined;

  const children = childrenNodes
    ? childrenNodes.map((child, index) => (
      <React.Fragment key={index}>{renderComponent(child)}</React.Fragment>
    ))
    : undefined;

  /** узлы-обёртки React.Fragment из сериализованного дерева просто разворачиваем, не пытаясь искать их в componentMap. */
  if (componentType.toLowerCase().includes("fragment")) {
    return <>{children}</>;
  }

  const Component = componentMap[componentType];

  if (!Component) {
    /**
     * Если мы не знаем компонент, но у него есть дети — считаем обёрткой и рендерим только детей.
     *  В идеале мы должны знать все комопоенты, сделано только для того что не ломать при добавление новых комп. в констркутор
     *  */
    if (children) {
      return <>{children}</>;
    }

    return (
      <View>
        <RNText>{`Unknown component: ${componentType}`}</RNText>
      </View>
    );
  }

  return <Component {...(node as any).props}>{children}</Component>;
}

export const renderPage = (components: ComponentNode[]): React.ReactElement => {
  return (
    <>
      {components.map((component, index) => (
        <React.Fragment key={index}>
          {renderComponent(component)}
        </React.Fragment>
      ))}
    </>
  );
}
