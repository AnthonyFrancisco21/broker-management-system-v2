"use client";
import { useEffect, useState } from "react";
import { User, Pencil, Trash2, Plus, CheckCircle2 } from "lucide-react";
import RoleGuard from "../../../../components/RoleGuard";
import DashboardLayout from "../../../../components/DashboardLayout";
import Modal from "../../../../components/Modal";
import AddAgentForm from "../../../../components/AddAgentForm";
import BrokerDetailsView from "../../../../components/BrokerDetailsView";
import EditAgentForm from "../../../../components/EditAgentForm";
import ConfirmDeleteModal from "../../../../components/ConfirmDeleteModal";

export interface BrokerRow {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  primaryContact?: string;
  brokersLicense?: string;
  employerName?: string;
  brokerPictures: any[];
  educBackgrounds: any[];
  salesExperiences: any[];
}

export default function BrokersPage() {
  const managerNavItems = [
    { label: "Dashboard", href: "/dashboard/manager" },
    { label: "Brokers/Agent List", href: "/dashboard/manager/brokers" },
    { label: "Statistics", href: "/dashboard/manager/statistics" },
    { label: "Unit Management", href: "/dashboard/manager/units" },
  ];

  const [brokers, setBrokers] = useState<BrokerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<BrokerRow | null>(null); // For viewing
  const [editingBroker, setEditingBroker] = useState<BrokerRow | null>(null); // For editing
  const [deletingBroker, setDeletingBroker] = useState<BrokerRow | null>(null); // For deleting
  const [isDeleting, setIsDeleting] = useState(false); // Delete loading state

  // Reusable fetch function
  const loadBrokers = async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brokers`, {
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

      if (!res.ok) throw new Error("Failed to fetch brokers");

      const data = await res.json();
      const rows: BrokerRow[] = data.map((b: any) => ({
        id: b.id,
        firstName: b.firstName,
        lastName: b.lastName,
        email: b.email,
        primaryContact: b.primaryContact || "-",
        brokersLicense: b.brokersLicense,
        employerName: b.employerName,
        brokerPictures: b.brokerPictures || [],
        educBackgrounds: b.educBackgrounds || [],
        salesExperiences: b.salesExperiences || [],
      }));

      setBrokers(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrokers();
  }, []);

  const handleAddAgentSuccess = () => {
    setIsAddModalOpen(false);
    loadBrokers();
  };

  const handleEditSuccess = () => {
    setEditingBroker(null);
    loadBrokers();
  };

  const handleRowClick = (broker: BrokerRow) => {
    setSelectedBroker(broker);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBroker) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/brokers/${deletingBroker.id}`,
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
        throw new Error(data.message || "Failed to delete broker");
      }

      // Success
      setDeletingBroker(null);
      loadBrokers(); // Refresh the list
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

  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <DashboardLayout navItems={managerNavItems} roleTitle="Manager Dashboard">
        <div className="flex flex-col h-full relative">
          {/* Add Agent Overlay Container (Replaces Modal) */}
          {isAddModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
              <AddAgentForm
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddAgentSuccess}
              />
            </div>
          )}

          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Brokers/Agent List
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage your team of agents and brokers
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Add Agent
            </button>
          </div>

          {/* View Details Modal */}
          <Modal
            isOpen={!!selectedBroker}
            onClose={() => setSelectedBroker(null)}
            title="Agent Details"
            maxWidth="max-w-md"
          >
            <BrokerDetailsView broker={selectedBroker} />
          </Modal>

          {/* Edit Agent Modal */}
          <Modal
            isOpen={!!editingBroker}
            onClose={() => setEditingBroker(null)}
            title="Edit Agent Information"
          >
            <EditAgentForm
              broker={editingBroker}
              onClose={() => setEditingBroker(null)}
              onSuccess={handleEditSuccess}
            />
          </Modal>

          {/* Confirm Delete Modal */}
          <ConfirmDeleteModal
            isOpen={!!deletingBroker}
            onClose={() => setDeletingBroker(null)}
            onConfirm={handleConfirmDelete}
            itemName={
              deletingBroker
                ? `${deletingBroker.firstName} ${deletingBroker.lastName}`
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
                  <p className="text-sm font-medium">Loading brokers...</p>
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
                        Agent Details
                      </th>
                      <th className="py-4 px-6 font-semibold">Contact Info</th>
                      <th className="py-4 px-6 font-semibold">License No.</th>
                      <th className="py-4 px-6 font-semibold">
                        Employer / Company
                      </th>
                      <th className="py-4 px-6 font-semibold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {brokers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-12 px-6 text-center text-slate-500"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <User size={32} className="text-slate-300" />
                            <p className="text-sm font-medium">
                              No brokers found
                            </p>
                            <p className="text-xs text-slate-400">
                              Click "Add Agent" to get started.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      brokers.map((b) => (
                        <tr
                          key={b.id}
                          onClick={() => handleRowClick(b)}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        >
                          {/* Name, ID, and Icon */}
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 overflow-hidden">
                                {b.brokerPictures &&
                                b.brokerPictures.length > 0 ? (
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${b.brokerPictures[0].imagePath}`}
                                    alt={`${b.firstName}'s profile`}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <User size={18} />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-900">
                                  {b.firstName} {b.lastName}
                                </span>
                                <span className="text-xs text-slate-500 font-mono">
                                  ID: {String(b.id).padStart(4, "0")}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="py-3 px-6">
                            <div className="flex flex-col">
                              <span className="text-slate-700">
                                {b.email || "-"}
                              </span>
                              <span className="text-xs text-slate-500 mt-0.5">
                                {b.primaryContact || "No contact no."}
                              </span>
                            </div>
                          </td>

                          {/* License */}
                          <td className="py-3 px-6 text-slate-700">
                            {b.brokersLicense ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
                                <CheckCircle2 size={12} />
                                {b.brokersLicense}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                No License
                              </span>
                            )}
                          </td>

                          {/* Employer */}
                          <td className="py-3 px-6 text-slate-700">
                            {b.employerName || "-"}
                          </td>

                          {/* Icon Actions */}
                          <td className="py-3 px-6">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingBroker(b);
                                }}
                                className="cursor-pointer p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                                title="Edit Agent"
                              >
                                <Pencil size={18} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingBroker(b);
                                }}
                                className="cursor-pointer p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                title="Delete Agent"
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
