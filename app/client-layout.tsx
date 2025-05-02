"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/components/sidebar"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Atualizar a verificação de página de login para incluir a página inicial redirecionada
  const isLoginPage = pathname === "/login"

  if (isLoginPage) {
    return children
  }

  return (
    <div className="flex h-screen bg-[#121212]">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
