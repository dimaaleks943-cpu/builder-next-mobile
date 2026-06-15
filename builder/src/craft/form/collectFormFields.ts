import { CRAFT_DISPLAY_NAME } from "../craftDisplayNames.ts"
import { resolveNodeDisplayName } from "../../utils/resolveNodeDisplayName.ts"
import { DEFAULT_FORM_FIELD_PROPS } from "./formTypes.ts"
import {
  FORM_TEXTAREA_TYPE_LABEL,
  getFormTextInputTypeLabel,
} from "./formFieldDisplayLabels.ts"
import type { FormTextInputType } from "./formTypes.ts"

export type FormFieldSummaryKind = "FormTextInput" | "FormTextarea"

export interface FormFieldSummary {
  id: string
  kind: FormFieldSummaryKind
  name: string
  typeLabel: string
}

type CraftNode = {
  data: {
    nodes?: string[]
    props?: {
      name?: string
      inputType?: FormTextInputType
    }
  }
}

type CraftNodes = Record<string, CraftNode | undefined>

const pushFieldSummary = (
  result: FormFieldSummary[],
  id: string,
  kind: FormFieldSummaryKind,
  props: CraftNode["data"]["props"],
) => {
  const name = props?.name ?? DEFAULT_FORM_FIELD_PROPS.name
  const typeLabel =
    kind === "FormTextarea"
      ? FORM_TEXTAREA_TYPE_LABEL
      : getFormTextInputTypeLabel(props?.inputType)

  result.push({ id, kind, name, typeLabel })
}

const walkFormFieldNodes = (nodeIds: string[], nodes: CraftNodes, result: FormFieldSummary[]) => {
  for (const nodeId of nodeIds) {
    const node = nodes[nodeId]
    if (!node) {
      continue
    }

    const displayName = resolveNodeDisplayName(node)

    if (displayName === CRAFT_DISPLAY_NAME.FormTextInput) {
      pushFieldSummary(result, nodeId, "FormTextInput", node.data.props)
    } else if (displayName === CRAFT_DISPLAY_NAME.FormTextarea) {
      pushFieldSummary(result, nodeId, "FormTextarea", node.data.props)
    }

    const childIds = node.data.nodes
    if (childIds?.length) {
      walkFormFieldNodes(childIds, nodes, result)
    }
  }
}

/** Collects data-entry fields under FormForm in document order. */
export const collectFormFields = (
  formFormId: string,
  nodes: CraftNodes,
): FormFieldSummary[] => {
  const formFormNode = nodes[formFormId]
  if (!formFormNode) {
    return []
  }

  const result: FormFieldSummary[] = []
  walkFormFieldNodes(formFormNode.data.nodes ?? [], nodes, result)
  return result
}
