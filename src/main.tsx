// Importa a função para criar a raiz da aplicação React.
import { createRoot } from 'react-dom/client'
// Importa o componente principal da aplicação.
import App from './App.tsx'
// Importa o arquivo de estilos CSS principal.
import './index.css'

/**
 * Ponto de entrada da aplicação.
 * Cria a raiz da aplicação React e renderiza o componente App dentro dela.
 */
createRoot(document.getElementById("root")!).render(<App />);