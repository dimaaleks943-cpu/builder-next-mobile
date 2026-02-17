import React from "react"
import { Block } from "@/components/Block"
import { Body } from "@/components/Body"
import { Text } from "@/components/Text"
import { LinkText } from "@/components/LinkText"
import type { ComponentNode } from "./siteConfig"

const componentMap: Record<string, React.ComponentType<any>> = {
  Block,
  Body,
  Text,
  LinkText,
}

export function renderComponent(
  node: ComponentNode,
): React.ReactElement {
  const Component = componentMap[node.type]

  if (!Component) {
    return React.createElement(
      "div",
      null,
      `Unknown component: ${node.type}`,
    )
  }

  const children = node.children
    ? node.children.map((child, index) =>
        renderComponent(child),
      )
    : undefined

  return React.createElement(
    Component,
    { ...node.props, key: node.type },
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
