"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/components/sidebar"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"
  const isVerifyEmailPage = pathname.startsWith("/security/verify-email")
  const isResetPasswordPage = pathname.startsWith("/security/reset-password")

  if (isLoginPage || isVerifyEmailPage || isResetPasswordPage) {
    return children
  }

  return (
    <div className="flex h-screen bg-[#121212]">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
