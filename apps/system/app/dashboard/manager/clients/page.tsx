"use client";

import { useEffect, useState } from "react";
import { Users, Pencil, Trash2, Plus, User, Home } from "lucide-react";
import RoleGuard from "../../../../components/RoleGuard";
import DashboardLayout from "../../../../components/DashboardLayout";
import Modal from "../../../../components/Modal";
import ConfirmDeleteModal from "../../../../components/ConfirmDeleteModal";
import { managerNavItems } from "../../../../lib/navigation";

// ACTUAL COMPONENTS INTEGRATED HERE:
import AddClientForm from "../../../../components/AddClientForm";
import EditClientForm from "../../../../components/EditClientForm";
import ClientDetailsView from "../../../../components/ClientDetailsView";

export interface ClientRow {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  clientStatus: string;
  unitId?: number;
  unit?: {
    unitType?: string;
    roomNo?: string;
  };
  createdAt?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [editingClient, setEditingClient] = useState<ClientRow | null>(null);
  const [deletingClient, setDeletingClient] = useState<ClientRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadClients = async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        setError("Unauthorized");
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch clients");

      const data = await res.json();
      const rows: ClientRow[] = data.map((c: any) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        clientStatus: c.clientStatus || "prospect",
        unitId: c.unitId,
        unit: c.unit,
        createdAt: c.createdAt,
      }));

      setClients(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleAddClientSuccess = () => {
    setIsAddModalOpen(false);
    loadClients();
  };

  const handleEditSuccess = () => {
    setEditingClient(null);
    loadClients();
  };

  const handleRowClick = (client: ClientRow) => {
    setSelectedClient(client);
  };

  const handleConfirmDelete = async () => {
    if (!deletingClient) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/clients/${deletingClient.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete client");
      }

      setDeletingClient(null);
      loadClients();
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "An error occurred while deleting.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "reserved":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "undernego":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "viewing":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      case "prospect":
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const formatStatus = (status: string) => {
    if (status === "underNego") return "Under Negotiation";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <RoleGuard allowedRoles={["MANAGER", "ADMIN"]}>
      <DashboardLayout navItems={managerNavItems} roleTitle="Broker Dashboard">
        <div className="flex flex-col h-full relative">
          {/* ADD CLIENT MODAL */}
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title="Add New Client"
          >
            <AddClientForm
              onSuccess={handleAddClientSuccess}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </Modal>

          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Client Management
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage your prospects, viewings, and successful deals
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Add Client
            </button>
          </div>

          {/* VIEW DETAILS MODAL */}
          <Modal
            isOpen={!!selectedClient}
            onClose={() => setSelectedClient(null)}
            title="Client Details"
            maxWidth="max-w-md"
          >
            {selectedClient && <ClientDetailsView client={selectedClient} />}
          </Modal>

          {/* EDIT CLIENT MODAL */}
          <Modal
            isOpen={!!editingClient}
            onClose={() => setEditingClient(null)}
            title="Edit Client Information"
          >
            {editingClient && (
              <EditClientForm
                client={editingClient}
                onClose={() => setEditingClient(null)}
                onSuccess={handleEditSuccess}
              />
            )}
          </Modal>

          {/* DELETE MODAL */}
          <ConfirmDeleteModal
            isOpen={!!deletingClient}
            onClose={() => setDeletingClient(null)}
            onConfirm={handleConfirmDelete}
            itemName={
              deletingClient
                ? `${deletingClient.firstName} ${deletingClient.lastName}`
                : ""
            }
            loading={isDeleting}
          />

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm font-medium">Loading clients...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex-1 p-8 text-center">
                <p className="text-red-500 font-medium">{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-240px)] w-full custom-scrollbar">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                    <tr className="text-slate-600 border-b border-slate-200">
                      <th className="py-4 px-6 font-semibold w-1/3">
                        Client Details
                      </th>
                      <th className="py-4 px-6 font-semibold">Contact Info</th>
                      <th className="py-4 px-6 font-semibold">Status</th>
                      <th className="py-4 px-6 font-semibold">Linked Unit</th>
                      <th className="py-4 px-6 font-semibold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clients.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-12 px-6 text-center text-slate-500"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Users size={32} className="text-slate-300" />
                            <p className="text-sm font-medium">
                              No clients found
                            </p>
                            <p className="text-xs text-slate-400">
                              Click "Add Client" to get started.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      clients.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => handleRowClick(c)}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        >
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <User size={18} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-900">
                                  {c.firstName} {c.lastName}
                                </span>
                                <span className="text-xs text-slate-500 font-mono">
                                  ID: {String(c.id).padStart(4, "0")}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <span className="text-slate-700">
                              {c.email || "-"}
                            </span>
                          </td>
                          <td className="py-3 px-6">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-md border text-xs font-medium ${getStatusColor(
                                c.clientStatus,
                              )}`}
                            >
                              {formatStatus(c.clientStatus)}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-slate-700">
                            {c.unitId ? (
                              <div className="flex items-center gap-2">
                                <Home size={14} className="text-slate-400" />
                                <div className="flex flex-col">
                                  <span className="font-medium text-slate-800">
                                    {c.unit?.roomNo || `Unit ID: ${c.unitId}`}
                                  </span>
                                  {c.unit?.unitType && (
                                    <span className="text-xs text-slate-500">
                                      {c.unit.unitType}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                No unit assigned
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingClient(c);
                                }}
                                className="cursor-pointer p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingClient(c);
                                }}
                                className="cursor-pointer p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
