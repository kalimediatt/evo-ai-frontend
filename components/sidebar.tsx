"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { MessageSquare, Grid3X3, Server, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export default function Sidebar() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user")
      if (user) {
        try {
          const parsed = JSON.parse(user)
          setIsAdmin(!!parsed.is_admin)
        } catch {}
      }
    }
  }, [])

  const menuItems = [
    ...(!isAdmin
      ? [
          {
            name: "Agentes",
            href: "/agentes",
            icon: Grid3X3,
          },
          {
            name: "Chat AI",
            href: "/chat",
            icon: MessageSquare,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            name: "Servidores MCP",
            href: "/servidores-mcp",
            icon: Server,
          },
          {
            name: "Clientes",
            href: "/clientes",
            icon: Users,
          },
        ]
      : []),
    {
      name: "Perfil",
      href: "/perfil",
      icon: User,
    },
  ]

  return (
    <div className="w-64 bg-[#121212] text-white p-4 flex flex-col h-full">
      <div className="mb-8 flex justify-center">
        <Link href="/" className="flex items-center">
          <Image src="/images/evolution-api-logo.png" alt="Evolution API" width={180} height={40} className="mt-2" />
        </Link>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-[#1a1a1a] text-[#00ff9d] border-l-2 border-[#00ff9d]"
                  : "text-gray-400 hover:text-[#00ff9d] hover:bg-[#1a1a1a]",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-800 pt-4 mt-4">
        <div className="text-sm text-gray-400">Evo AI</div>
        <div className="text-xs text-gray-500 mt-1">© 2024 Evolution API</div>
      </div>
    </div>
  )
}
