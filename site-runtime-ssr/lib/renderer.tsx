import React from "react"
import { Block } from "@/components/Block"
import { Body } from "@/components/Body"
import { Text } from "@/components/Text"
import { LinkText } from "@/components/LinkText"
import { ContentList } from "@/components/ContentList"
import type { ComponentNode } from "./interface"

const componentMap: Record<string, React.ComponentType<any>> = {
  Block,
  Body,
  Text,
  LinkText,
  ContentList,
}

export function renderComponent(
  node: ComponentNode,
): React.ReactElement {
  // В рантайме Craft/SSR сюда иногда попадает либо строковое имя компонента,
  // либо сам React-компонент (function). Если обрабатывать только строку,
  // часть узлов (например, потомков ContentList) рендерится неправильно,
  // поэтому здесь сознательно поддерживаем оба варианта и для функции
  // вытаскиваем имя через displayName/name.
  const rawType: any = (node as any).type
  let componentType: string

  if (typeof rawType === "string") {
    componentType = rawType
  } else if (typeof rawType === "function") {
    const fn = rawType as { displayName?: string; name?: string }
    componentType = fn.displayName ?? fn.name ?? "Unknown"
    // eslint-disable-next-line no-console
    console.warn(
      "[renderer] Component type is function, extracted name:",
      componentType,
    )
  } else {
    componentType = String(rawType)
    // eslint-disable-next-line no-console
    console.warn(
      "[renderer] Component type is not a string:",
      typeof rawType,
      rawType,
      "converted to:",
      componentType,
    )
  }

  const Component = componentMap[componentType]

  if (!Component) {
    return React.createElement(
      "div",
      null,
      `Unknown component: ${componentType}`,
    )
  }

  const children = node.children
    ? node.children.map((child, index) =>
        renderComponent(child),
      )
    : undefined

  return React.createElement(
    Component,
    { ...node.props, key: componentType },
    children,
  )
}

export function renderPage(
  components: ComponentNode[],
): React.ReactElement {
  return (
    <>
      {components.map((component, index) => (
        <React.Fragment key={index}>
          {renderComponent(component)}
        </React.Fragment>
      ))}
    </>
  )
}
