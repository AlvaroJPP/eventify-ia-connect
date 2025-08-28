// Importa o hook useState e o tipo React do React.
import * as React from "react"

// Importa os tipos dos componentes de toast.
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

// Define o limite de toasts exibidos simultaneamente e o atraso para remoção.
const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

// Define o tipo para um toast do toaster.
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// Define os tipos de ação para o reducer de toasts.
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

// Contador para gerar IDs únicos para os toasts.
let count = 0

/**
 * Gera um ID único para um toast.
 * @returns O ID gerado.
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

// Define os tipos de ação para o reducer.
type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

// Define a interface para o estado dos toasts.
interface State {
  toasts: ToasterToast[]
}

// Mapa para armazenar os timeouts de remoção dos toasts.
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Adiciona um toast à fila de remoção.
 * @param toastId - O ID do toast a ser removido.
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

/**
 * Reducer para gerenciar o estado dos toasts.
 * @param state - O estado atual.
 * @param action - A ação a ser executada.
 * @returns O novo estado.
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Adiciona o toast à fila de remoção.
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// Array de listeners para o estado dos toasts.
const listeners: Array<(state: State) => void> = []

// Estado dos toasts em memória.
let memoryState: State = { toasts: [] }

/**
 * Dispara uma ação para o reducer de toasts.
 * @param action - A ação a ser disparada.
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// Define o tipo para um toast.
type Toast = Omit<ToasterToast, "id">

/**
 * Função para criar e exibir um toast.
 * @param props - As propriedades do toast.
 * @returns Um objeto com o ID do toast e as funções de dismiss e update.
 */
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * Hook para usar o sistema de toasts.
 * @returns O estado dos toasts e as funções de toast e dismiss.
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }