import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface EditAgentFormProps {
  broker: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditAgentForm({
  broker,
  onClose,
  onSuccess,
}: EditAgentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form state with existing broker data
  const [formData, setFormData] = useState({
    firstName: broker.firstName || "",
    lastName: broker.lastName || "",
    email: broker.email || "",
    primaryContact: broker.primaryContact || "",
    brokersLicense: broker.brokersLicense || "",
    employerName: broker.employerName || "",
  });

  // Handle Image Preview
  const existingPic =
    broker.brokerPictures?.length > 0
      ? `${process.env.NEXT_PUBLIC_API_URL}/${broker.brokerPictures[0].imagePath}`
      : null;

  const [previewImage, setPreviewImage] = useState<string | null>(existingPic);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file)); // Create a local preview
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      // We use FormData because we might be sending a file
      const submitData = new FormData();
      submitData.append("firstName", formData.firstName);
      submitData.append("lastName", formData.lastName);
      submitData.append("email", formData.email);
      submitData.append("primaryContact", formData.primaryContact);
      submitData.append("brokersLicense", formData.brokersLicense);
      submitData.append("employerName", formData.employerName);

      if (selectedFile) {
        submitData.append("profilePicture", selectedFile); // Ensure this matches your backend multer key!
      }

      // Using PUT or PATCH to update
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/brokers/${broker.id}`,
        {
          method: "PUT", // Change to PATCH if your backend uses PATCH for updates
          headers: {
            Authorization: `Bearer ${token}`,
            // Note: DO NOT set 'Content-Type': 'application/json' when sending FormData.
            // The browser will automatically set 'multipart/form-data' with the correct boundary.
          },
          body: submitData,
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update agent");
      }

      onSuccess(); // Close modal and refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
          {error}
        </div>
      )}

      {/* Profile Picture Upload Section */}
      <div className="flex flex-col items-center gap-3 pb-4 border-b border-slate-100">
        <div className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <Upload className="text-slate-400" size={24} />
          )}

          {/* Hover Overlay */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <span className="text-xs text-white font-medium">Change</span>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        <p className="text-xs text-slate-500">
          Click image to upload new profile photo
        </p>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Contact Number
          </label>
          <input
            type="text"
            name="primaryContact"
            value={formData.primaryContact}
            onChange={handleInputChange}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            License No. (PRC)
          </label>
          <input
            type="text"
            name="brokersLicense"
            value={formData.brokersLicense}
            onChange={handleInputChange}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Employer Name
          </label>
          <input
            type="text"
            name="employerName"
            value={formData.employerName}
            onChange={handleInputChange}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}
