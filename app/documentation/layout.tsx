// app/layout.tsx (ou app/documentation/layout.tsx)
import { ReactNode } from 'react'

export const metadata = {
  title: 'Evo AI',
  description: 'Documentação e laboratório de testes da plataforma Evo AI',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Carrega as variáveis de ambiente em tempo de execução */}
        <script src="/__ENV.js" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
