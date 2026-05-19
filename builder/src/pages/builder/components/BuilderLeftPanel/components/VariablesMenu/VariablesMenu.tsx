import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useTheme } from "@mui/material"
import { AddIcon } from "../../../../../../icons/AddIcon.tsx"
import { COLORS } from "../../../../../../theme/colors.ts"
import { CollectionRow } from "./components/CollectionRow/CollectionRow.tsx"
import { useDesignVariables } from "./hooks/useDesignVariables.ts"
import {
  CollectionList,
  VariablesMenuAddButton,
  VariablesMenuHeader,
  VariablesMenuLoading,
  VariablesMenuRoot,
  VariablesMenuTitle
} from "./styles.ts";

interface Props {
  onClose: () => void
}

export const VariablesMenu = (_props: Props) => {
  const theme = useTheme()
  const menuZIndex = theme.zIndex.modal + 1
  const {
    collections,
    selectedCollectionId,
    isLoading,
    setSelectedCollectionId,
    reorderCollections,
    renameCollection,
    duplicateCollection,
    deleteCollection,
  } = useDesignVariables()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor),
  )

  const handleAddCollection = () => {}

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    reorderCollections(String(active.id), String(over.id))
  }

  return (
    <VariablesMenuRoot>
      <VariablesMenuHeader>
        <VariablesMenuTitle>Переменные</VariablesMenuTitle>
        <VariablesMenuAddButton size="small" onClick={handleAddCollection}>
          <AddIcon height={16} width={16} fill={COLORS.gray700} />
        </VariablesMenuAddButton>
      </VariablesMenuHeader>

      {isLoading ? (
        <VariablesMenuLoading>Загрузка…</VariablesMenuLoading>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={collections.map((collection) => collection.id)}
            strategy={verticalListSortingStrategy}
          >
            <CollectionList>
              {collections.map((collection) => (
                <CollectionRow
                  key={collection.id}
                  id={collection.id}
                  name={collection.name}
                  isSelected={selectedCollectionId === collection.id}
                  menuZIndex={menuZIndex}
                  canDelete={collections.length > 1}
                  onSelect={setSelectedCollectionId}
                  onRename={renameCollection}
                  onDuplicate={duplicateCollection}
                  onDelete={deleteCollection}
                />
              ))}
            </CollectionList>
          </SortableContext>
        </DndContext>
      )}
    </VariablesMenuRoot>
  )
}
