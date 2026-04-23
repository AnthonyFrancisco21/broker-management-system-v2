"use client";

import { useState, useEffect } from "react";

interface Unit {
  id: number;
  roomNo: string;
  unitType: string;
  unitStatus: string;
}

interface AddClientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddClientForm({
  onSuccess,
  onCancel,
}: AddClientFormProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    clientStatus: "prospect",
    unitId: "",
  });

  // Fetch units for the dropdown
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // STRICT FILTER: Only show units that are explicitly 'available'
          const availableUnits = data.filter(
            (u: Unit) => u.unitStatus === "available",
          );
          setUnits(availableUnits);
        }
      } catch (err) {
        console.error("Failed to fetch units", err);
      }
    };
    fetchUnits();
  }, []);

  const isUnitRequired = formData.clientStatus !== "prospect";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Frontend Validation
    if (isUnitRequired && !formData.unitId) {
      setError(
        `A unit must be selected when status is ${formData.clientStatus}.`,
      );
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        unitId: formData.unitId ? parseInt(formData.unitId) : null,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.error || data.message || "Failed to create client",
        );
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            required
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            required
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Client Status
          </label>
          <select
            className="w-full p-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            value={formData.clientStatus}
            onChange={(e) => {
              const newStatus = e.target.value;
              setFormData({
                ...formData,
                clientStatus: newStatus,
                // Reset unitId if going back to prospect to avoid accidental attachments
                unitId: newStatus === "prospect" ? "" : formData.unitId,
              });
            }}
          >
            <option value="prospect">Prospect</option>
            <option value="reserved">Reserved</option>
            <option value="underNego">Under Negotiation</option>
            <option value="rejected">Rejected</option>
            <option value="success">Success</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Assign Unit{" "}
            {isUnitRequired && <span className="text-red-500">*</span>}
          </label>
          <select
            required={isUnitRequired}
            className="w-full p-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:bg-slate-50"
            value={formData.unitId}
            disabled={!isUnitRequired}
            onChange={(e) =>
              setFormData({ ...formData, unitId: e.target.value })
            }
          >
            <option value="">
              {isUnitRequired
                ? "Select an available unit"
                : "None required for Prospect"}
            </option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                Room {unit.roomNo} - {unit.unitType}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors shadow-sm"
        >
          {loading ? "Saving..." : "Add Client"}
        </button>
      </div>
    </form>
  );
}
