import type { FormFieldSummary, FormFieldSummaryKind } from "../../../../../craft/form/collectFormFields.ts"
import {
  EmptyFieldsText,
  FieldIcon,
  FieldName,
  FieldRow,
  FieldsContainer,
  FieldsLabel,
  FieldsRoot,
  FieldTypeLabel,
} from "./styles.ts"

interface Props {
  fields: FormFieldSummary[]
}

const FIELD_KIND_ICONS: Record<FormFieldSummaryKind, string> = {
  FormTextInput: "T",
  FormTextarea: "¶",
}

const getFieldIcon = (field: FormFieldSummary): string => {
  if (field.kind === "FormTextarea") {
    return FIELD_KIND_ICONS.FormTextarea
  }

  if (field.typeLabel === "Email") {
    return "@"
  }

  if (field.typeLabel === "Password") {
    return "◌"
  }

  return FIELD_KIND_ICONS.FormTextInput
}

export const FormFieldsList = ({ fields }: Props) => (
  <FieldsRoot>
    <FieldsLabel>Fields</FieldsLabel>
    <FieldsContainer>
      {fields.length === 0 ? (
        <EmptyFieldsText>No fields</EmptyFieldsText>
      ) : (
        fields.map((field) => (
          <FieldRow key={field.id}>
            <FieldIcon aria-hidden>{getFieldIcon(field)}</FieldIcon>
            <FieldName>{field.name}</FieldName>
            <FieldTypeLabel>{field.typeLabel}</FieldTypeLabel>
          </FieldRow>
        ))
      )}
    </FieldsContainer>
  </FieldsRoot>
)
