"use client";
import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, ImageIcon } from "lucide-react";

interface UnitFormProps {
  initialData?: any;
  unitId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UnitForm({
  initialData,
  unitId,
  onClose,
  onSuccess,
}: UnitFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State (safely reading raw data from initialData)
  const [formData, setFormData] = useState({
    unitType: initialData?.unitType || "",
    roomNo: initialData?.roomNo || "",
    size: initialData?.size || "",
    floor: initialData?.floor || "",
    installmentPerMonth: initialData?.installmentPerMonth || "",
    price: initialData?.price || "",
    unitStatus: initialData?.unitStatus || "available",
  });

  // Multiple Images State (New uploads)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Existing Images State (For Update Mode)
  const [existingImages, setExistingImages] = useState<any[]>(
    initialData?.unitPictures || [],
  );

  // Track images the user wants to delete
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeSelectedFile = (indexToRemove: number) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
    setPreviewUrls((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const removeExistingImage = (imageId: number) => {
    // Remove from UI immediately
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    // Add to deletion list to send to backend on save
    setDeletedImageIds((prev) => [...prev, imageId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const submitData = new FormData();

      // Append standard text fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, String(value));
      });

      // Append new files
      selectedFiles.forEach((file) => {
        submitData.append("unitImages", file);
      });

      // Append IDs of images the user wants to delete
      if (deletedImageIds.length > 0) {
        submitData.append("deletedImages", JSON.stringify(deletedImageIds));
      }

      const isEditing = !!unitId;
      const endpoint = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/units/${unitId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/units`;

      const res = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        // Do NOT set Content-Type to application/json when sending FormData
        body: submitData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error || errData.message || "Failed to save unit",
        );
      }

      onSuccess(); // Close modal and refresh table
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
          {error}
        </div>
      )}

      {/* Basic Information Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
          {unitId ? "Update Unit Details" : "New Unit Details"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Unit Type
            </label>
            <input
              type="text"
              name="unitType"
              value={formData.unitType}
              onChange={handleInputChange}
              placeholder="e.g. Studio, 1BR"
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Room No / Code
            </label>
            <input
              type="text"
              name="roomNo"
              value={formData.roomNo}
              onChange={handleInputChange}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              name="unitStatus"
              value={formData.unitStatus}
              onChange={handleInputChange}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Floor</label>
            <input
              type="number"
              name="floor"
              value={formData.floor}
              onChange={handleInputChange}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Size (sqm)
            </label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Financials Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
          Financials
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Total Price (PHP)
            </label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Installment per Month (PHP)
            </label>
            <input
              type="number"
              step="0.01"
              name="installmentPerMonth"
              value={formData.installmentPerMonth}
              onChange={handleInputChange}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Multi-Image Upload Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
          Unit Gallery (Multiple Images)
        </h2>

        {/* Upload Trigger Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex flex-col items-center justify-center py-10 gap-3"
        >
          <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-500">
            <UploadCloud size={28} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">
              Click to upload images
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PNG, JPG or WEBP (Max 5MB per file)
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Previews Grid */}
        {(existingImages.length > 0 || previewUrls.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {/* 1. Existing Images (If Editing) */}
            {existingImages.map((img) => (
              <div
                key={img.id}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-100"
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${img.imagePath}`}
                  alt="Existing Unit"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-red-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete image"
                >
                  <X size={14} />
                </button>
                <div className="absolute top-2 left-2 bg-slate-800/80 text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 font-medium shadow-sm">
                  <ImageIcon size={10} /> Existing
                </div>
              </div>
            ))}

            {/* 2. New Image Previews */}
            {previewUrls.map((url, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-blue-400 bg-slate-100 shadow-sm"
              >
                <img
                  src={url}
                  alt="New Upload Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeSelectedFile(index)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-red-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={14} />
                </button>
                <div className="absolute top-2 left-2 bg-blue-600/90 text-white text-[10px] px-2 py-1 rounded-md font-medium shadow-sm">
                  New Upload
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-sm"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : unitId ? (
            "Save Changes"
          ) : (
            "Create Unit"
          )}
        </button>
      </div>
    </form>
  );
}
