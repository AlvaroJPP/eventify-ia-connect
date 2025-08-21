// Importa os hooks createContext, useContext, useEffect e useState do React.
import { createContext, useContext, useEffect, useState } from 'react';

// Define os tipos de tema possíveis.
type Theme = 'dark' | 'light' | 'system';

// Define a interface para o contexto do tema.
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Cria o contexto do tema.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Hook para acessar o contexto do tema.
 * @returns O contexto do tema.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Provedor do contexto do tema.
 * @param children - Os componentes filhos que terão acesso ao contexto.
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Estado para armazenar o tema atual.
  const [theme, setTheme] = useState<Theme>(() => {
    // Obtém o tema armazenado no localStorage ou usa 'system' como padrão.
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  // Efeito para aplicar a classe do tema ao elemento raiz do HTML.
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Armazena o tema selecionado no localStorage.
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Retorna o provedor do contexto com os valores do tema.
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};