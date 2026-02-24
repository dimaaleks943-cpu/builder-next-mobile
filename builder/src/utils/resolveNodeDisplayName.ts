export const resolveNodeDisplayName = (node: any): string => {
  if (!node) {
    return "Element"
  }

  const displayName = node.data.displayName as string | undefined
  if (displayName) {
    return displayName
  }

  const type = node.data.type
  if (typeof type === "string") {
    return type
  }

  if (type && typeof (type as any).resolvedName === "string") {
    return (type as any).resolvedName as string
  }

  if (type && typeof (type as any).craft?.displayName === "string") {
    return (type as any).craft.displayName as string
  }

  return "Element"
}

