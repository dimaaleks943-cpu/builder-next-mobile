import React from "react"
import { Block } from "@/components/Block"
import { Body } from "@/components/Body"
import { Heading } from "@/components/Heading"
import { Paragraph } from "@/components/Paragraph"
import { LinkText } from "@/components/LinkText"
import { LinkBlock } from "@/components/LinkBlock"
import { Button } from "@/components/Button"
import { Image } from "@/components/Image"
import { ContentList } from "@/components/ContentList"
import { CategoryFilter } from "@/components/CategoryFilter"
import { Navbar } from "@/components/Navbar/Navbar"
import { NavbarMenuButton } from "@/components/Navbar/components/NavbarMenuButton/NavbarMenuButton"
import { NavbarLinks } from "@/components/Navbar/components/NavbarLinks/NavbarLinks"
import { NavbarMenu } from "@/components/Navbar/components/NavbarMenu/NavbarMenu"
import { Icon } from "@/components/Icon/Icon"
import { ConditionalVisibilityGate } from "@/components/ConditionalVisibilityGate/ConditionalVisibilityGate"
import type { ComponentNode } from "./interface"

const componentMap: Record<string, React.ComponentType<any>> = {
  Block,
  Body,
  Heading,
  Paragraph,
  LinkText,
  LinkBlock,
  Button,
  Image,
  ContentList,
  CategoryFilter, // выбор категории в контексте для ContentList с тем же filterScope
  Navbar,
  NavbarMenuButton,
  NavbarLinks,
  NavbarMenu,
  Icon,
}

export const renderComponent = (
  node: ComponentNode,
): React.ReactElement => {
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
  const {
    conditionalVisibility: rawConfig,
    ...componentProps
  } = node.props

  const children = node.children
    ? node.children.map((child) => renderComponent(child))
    : undefined

  const renderedNode = Component
    ? React.createElement(
        Component,
        {
          ...componentProps,
          ...(node.className ? { className: node.className } : {}),
          "data-craft-node-id": node.nodeId,
        },
        children,
      )
    : React.createElement("div", null, `Unknown component: ${componentType}`)

  return (
    <ConditionalVisibilityGate
      key={node.nodeId}
      rawConfig={rawConfig}
      componentProps={componentProps}
    >
      {renderedNode}
    </ConditionalVisibilityGate>
  )
}

export const renderPage = (components: ComponentNode[]): React.ReactElement => {
  return (
    <>
      {components.map((component, index) => (
        <React.Fragment key={component.nodeId || index}>
          {renderComponent(component)}
        </React.Fragment>
      ))}
    </>
  )
}
