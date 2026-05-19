import { useMemo, useState } from "react"
import { AddIcon } from "../../../../../../../../icons/AddIcon.tsx"
import { COLORS } from "../../../../../../../../theme/colors.ts"
import { filterVariablesByQuery } from "../../utils/collectionVariables.ts"
import { VariableRow } from "../VariableRow/VariableRow.tsx"
import {
  AddVariableButton,
  CollectionDetailEmpty,
  CollectionDetailHeader,
  CollectionDetailHeaderActions,
  CollectionDetailRoot,
  CollectionDetailSearch,
  CollectionDetailSearchInput,
  CollectionDetailTitle,
  VariablesTable,
  VariablesTableBody,
  VariablesTableEmpty,
  VariablesTableHeader,
  VariablesTableHeaderCell,
} from "./styles.ts"
import type { DesignVariable, DesignVariableCollection } from "../../../../../../variables/types.ts";

interface Props {
  collection: DesignVariableCollection | undefined
  variables: DesignVariable[]
}

export const CollectionDetail = ({ collection, variables }: Props) => {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredVariables = useMemo(
    () => filterVariablesByQuery(variables, searchQuery),
    [variables, searchQuery],
  )

  const handleAddVariable = () => {}

  if (!collection) {
    return (
      <CollectionDetailRoot>
        <CollectionDetailEmpty>Выберите коллекцию</CollectionDetailEmpty>
      </CollectionDetailRoot>
    )
  }

  return (
    <CollectionDetailRoot>
      <CollectionDetailHeader>
        <CollectionDetailTitle>{collection.name}</CollectionDetailTitle>

        <CollectionDetailHeaderActions>
          <CollectionDetailSearch>
            <CollectionDetailSearchInput
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Поиск переменных..."
            />
          </CollectionDetailSearch>

          <AddVariableButton role="button" tabIndex={0} onClick={handleAddVariable}>
            <AddIcon height={12} width={12} fill={COLORS.white} />
            Новая переменная
          </AddVariableButton>
        </CollectionDetailHeaderActions>
      </CollectionDetailHeader>

      <VariablesTable>
        <VariablesTableHeader>
          <VariablesTableHeaderCell>Наименование</VariablesTableHeaderCell>
          <VariablesTableHeaderCell>Значение</VariablesTableHeaderCell>
        </VariablesTableHeader>

        <VariablesTableBody>
          {filteredVariables.length === 0 ? (
            <VariablesTableEmpty>
              {searchQuery.trim()
                ? "Переменные не найдены"
                : "В коллекции пока нет переменных"}
            </VariablesTableEmpty>
          ) : (
            filteredVariables.map((variable) => (
              <VariableRow key={variable.id} variable={variable} />
            ))
          )}
        </VariablesTableBody>
      </VariablesTable>
    </CollectionDetailRoot>
  )
}
