// Importa os hooks useState e useEffect do React.
import * as React from "react"

// Define o ponto de quebra para dispositivos móveis.
const MOBILE_BREAKPOINT = 768

/**
 * Hook para verificar se o dispositivo é móvel com base na largura da tela.
 * @returns Um booleano indicando se o dispositivo é móvel.
 */
export function useIsMobile() {
  // Estado para armazenar se o dispositivo é móvel.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  // Efeito para adicionar e remover o listener de redimensionamento da janela.
  React.useEffect(() => {
    // Cria uma media query para o ponto de quebra móvel.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    // Função para atualizar o estado com base na largura da janela.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    // Adiciona o listener para a media query.
    mql.addEventListener("change", onChange)
    // Define o estado inicial.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    // Remove o listener quando o componente é desmontado.
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Retorna o estado booleano.
  return !!isMobile
}