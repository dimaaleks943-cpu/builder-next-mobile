import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { FormState } from "../../../craft/form/formTypes.ts"

const FormPreviewContext = createContext<FormState | null>(null)

interface FormPreviewSessionContextValue {
  getPreviewState: (wrapperId: string) => FormState
  setPreviewState: (wrapperId: string, state: FormState) => void
}

const FormPreviewSessionContext = createContext<FormPreviewSessionContextValue | null>(
  null,
)

interface FormPreviewSessionProviderProps {
  resetKey?: string
  children: ReactNode
}

export const FormPreviewSessionProvider = ({
  resetKey,
  children,
}: FormPreviewSessionProviderProps) => {
  const [states, setStates] = useState<Record<string, FormState>>({})

  useEffect(() => {
    setStates({})
  }, [resetKey])

  const getPreviewState = useCallback(
    (wrapperId: string): FormState => states[wrapperId] ?? "normal",
    [states],
  )

  const setPreviewState = useCallback((wrapperId: string, state: FormState) => {
    setStates((prev) => ({ ...prev, [wrapperId]: state }))
  }, [])

  const value = useMemo(
    () => ({ getPreviewState, setPreviewState }),
    [getPreviewState, setPreviewState],
  )

  return (
    <FormPreviewSessionContext.Provider value={value}>
      {children}
    </FormPreviewSessionContext.Provider>
  )
}

export const useFormPreviewSession = (): FormPreviewSessionContextValue => {
  const context = useContext(FormPreviewSessionContext)
  if (!context) {
    throw new Error("useFormPreviewSession must be used within FormPreviewSessionProvider")
  }
  return context
}

interface FormPreviewProviderProps {
  state: FormState
  children: ReactNode
}

export const FormPreviewProvider = ({ state, children }: FormPreviewProviderProps) => (
  <FormPreviewContext.Provider value={state}>{children}</FormPreviewContext.Provider>
)

export const useFormPreviewState = (): FormState => {
  const context = useContext(FormPreviewContext)
  return context ?? "normal"
}
