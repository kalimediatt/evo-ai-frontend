"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Plus, MoreHorizontal, Edit, Trash2, Search, Users } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Client = {
  id: string
  name: string
  email: string
  created_at: string
  users_count: number
  agents_count: number
}

export default function ClientsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  // Client form state
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
  })

  // Mock clients data
  const [clients, setClients] = useState<Client[]>([
    {
      id: "c1",
      name: "Empresa ABC",
      email: "contato@empresaabc.com",
      created_at: "2023-01-10T14:30:00Z",
      users_count: 5,
      agents_count: 8,
    },
    {
      id: "c2",
      name: "Tech Solutions",
      email: "admin@techsolutions.com",
      created_at: "2023-02-15T10:45:00Z",
      users_count: 3,
      agents_count: 12,
    },
    {
      id: "c3",
      name: "Global Services",
      email: "info@globalservices.com",
      created_at: "2023-03-22T09:15:00Z",
      users_count: 7,
      agents_count: 15,
    },
    {
      id: "c4",
      name: "Digital Marketing",
      email: "contact@digitalmarketing.com",
      created_at: "2023-04-05T16:20:00Z",
      users_count: 2,
      agents_count: 6,
    },
  ])

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newClient: Client = {
        id: `c${clients.length + 1}`,
        name: clientData.name,
        email: clientData.email,
        created_at: new Date().toISOString(),
        users_count: 0,
        agents_count: 0,
      }

      if (selectedClient) {
        // Update existing client
        setClients(clients.map((client) => (client.id === selectedClient.id ? { ...client, ...clientData } : client)))
        toast({
          title: "Cliente atualizado",
          description: `${clientData.name} foi atualizado com sucesso.`,
        })
      } else {
        // Add new client
        setClients([...clients, newClient])
        toast({
          title: "Cliente adicionado",
          description: `${clientData.name} foi adicionado com sucesso.`,
        })
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o cliente. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setClientData({
      name: client.name,
      email: client.email,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteClient = async () => {
    if (!selectedClient) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setClients(clients.filter((client) => client.id !== selectedClient.id))
      toast({
        title: "Cliente excluído",
        description: `${selectedClient.name} foi excluído com sucesso.`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setSelectedClient(null)
    }
  }

  const resetForm = () => {
    setClientData({
      name: "",
      email: "",
    })
    setSelectedClient(null)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gerenciamento de Clientes</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-[#333]">
            <form onSubmit={handleAddClient}>
              <DialogHeader>
                <DialogTitle className="text-white">{selectedClient ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {selectedClient
                    ? "Edite as informações do cliente existente."
                    : "Preencha as informações para criar um novo cliente."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={clientData.name}
                    onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                    className="bg-[#222] border-[#444] text-white"
                    placeholder="Nome da empresa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={clientData.email}
                    onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                    className="bg-[#222] border-[#444] text-white"
                    placeholder="contato@empresa.com"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-[#444] text-gray-300 hover:bg-[#333] hover:text-white"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]" disabled={isLoading}>
                  {isLoading ? "Salvando..." : selectedClient ? "Salvar Alterações" : "Adicionar Cliente"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-[#1a1a1a] border-[#333] text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Tem certeza que deseja excluir o cliente "{selectedClient?.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[#444] text-gray-300 hover:bg-[#333] hover:text-white">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteClient}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="bg-[#1a1a1a] border-[#333] mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Buscar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#222] border-[#444] text-white pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#333] hover:bg-[#222]">
                <TableHead className="text-gray-300">Nome</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Data de Criação</TableHead>
                <TableHead className="text-gray-300">Usuários</TableHead>
                <TableHead className="text-gray-300">Agentes</TableHead>
                <TableHead className="text-gray-300 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="border-[#333] hover:bg-[#222]">
                    <TableCell className="font-medium text-white">{client.name}</TableCell>
                    <TableCell className="text-gray-300">{client.email}</TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(client.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-[#00ff9d]" />
                        {client.users_count}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">{client.agents_count}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-gray-300 hover:bg-[#333]">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#222] border-[#444] text-white">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-[#444]" />
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-[#333]"
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit className="mr-2 h-4 w-4 text-[#00ff9d]" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-[#333] text-red-500"
                            onClick={() => handleDeleteClient(client)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
