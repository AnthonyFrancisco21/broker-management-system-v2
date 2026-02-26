"use client";

import { useState, useEffect } from "react";
import {
  X,
  Home,
  Scaling,
  Layers,
  CreditCard,
  Tag,
  CheckCircle2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface UnitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: any;
}

export default function UnitDetailsModal({
  isOpen,
  onClose,
  unit,
}: UnitDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Reset the image index whenever a new unit is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
    }
  }, [isOpen, unit]);

  if (!isOpen || !unit) return null;

  const formatCurrency = (amount?: number | string) => {
    if (!amount) return "N/A";
    return `₱ ${Number(amount).toLocaleString()}`;
  };

  const isAvailable = unit.unitStatus?.toLowerCase() === "available";
  const hasImages = unit.unitPictures && unit.unitPictures.length > 0;

  // Navigation Handlers for the Slider
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasImages) {
      setCurrentImageIndex((prev) =>
        prev === unit.unitPictures.length - 1 ? 0 : prev + 1,
      );
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasImages) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? unit.unitPictures.length - 1 : prev - 1,
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 sm:p-6 transition-opacity"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="bg-white w-full max-w-6xl rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] min-h-[600px] animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Image Slider & Thumbnails Area */}
        <div className="w-full md:w-3/5 bg-slate-50 flex flex-col relative group">
          {/* Main Image */}
          <div className="relative flex-1 min-h-[350px] md:min-h-[500px] flex items-center justify-center overflow-hidden bg-slate-100">
            {hasImages ? (
              <>
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${unit.unitPictures[currentImageIndex].imagePath}`}
                  alt={`Unit Preview ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain transition-opacity duration-300 bg-black/5"
                />

                {/* Arrow Controls */}
                {unit.unitPictures.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white text-slate-800 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <ChevronLeft size={24} className="mr-0.5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white text-slate-800 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <ChevronRight size={24} className="ml-0.5" />
                    </button>

                    {/* Image Counter Pill */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium tracking-wide shadow-sm">
                      {currentImageIndex + 1} / {unit.unitPictures.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <ImageIcon size={48} className="mb-4 font-light opacity-50" />
                <p className="font-light tracking-wide text-sm">
                  No Images Uploaded
                </p>
              </div>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {hasImages && unit.unitPictures.length > 1 && (
            <div className="h-24 bg-white border-t border-slate-200 p-3 flex gap-3 overflow-x-auto custom-scrollbar">
              {unit.unitPictures.map((pic: any, index: number) => {
                const isActive = currentImageIndex === index;
                return (
                  <button
                    key={pic.id || index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`cursor-pointer relative h-full aspect-square rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                      isActive
                        ? "border-blue-500 opacity-100 shadow-sm"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${pic.imagePath}`}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-2/5 bg-white flex flex-col relative overflow-y-auto custom-scrollbar border-l border-slate-100">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="cursor-pointer absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors z-10"
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          <div className="p-8 md:p-10 flex flex-col h-full">
            {/* Header: Identity */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded border text-xs font-medium uppercase tracking-wider ${
                    isAvailable
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}
                >
                  {unit.unitStatus || "Unknown"}
                </span>
              </div>

              <h2 className="text-3xl font-normal text-slate-800 tracking-tight mb-2">
                {unit.unitType || "Property Overview"}
              </h2>
              <p className="text-base font-light text-slate-500 tracking-wide flex items-center gap-2">
                Room / Code:{" "}
                <span className="font-medium text-slate-700">
                  {unit.roomNo || unit.details || "N/A"}
                </span>
              </p>
            </div>

            {/* Financials */}
            <div className="mb-12">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
                Financial Details
              </h3>

              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-end border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Tag size={16} strokeWidth={1.5} />
                    <span className="text-sm font-light">Contract Price</span>
                  </div>
                  <span className="text-2xl font-normal text-slate-900 tracking-tight">
                    {formatCurrency(unit.price)}
                  </span>
                </div>

                <div className="flex justify-between items-end border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CreditCard size={16} strokeWidth={1.5} />
                    <span className="text-sm font-light">
                      Monthly Installment
                    </span>
                  </div>
                  <span className="text-xl font-normal text-blue-600 tracking-tight">
                    {formatCurrency(
                      unit.installmentPerMonth || unit.installment,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="mt-auto pt-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
                Specifications
              </h3>

              <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                    <Home size={16} strokeWidth={1.5} />
                    <span className="text-xs font-light tracking-wide">
                      Type
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {unit.unitType || "-"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                    <Scaling size={16} strokeWidth={1.5} />
                    <span className="text-xs font-light tracking-wide">
                      Area
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {unit.size ? `${unit.size} sqm` : "-"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                    <Layers size={16} strokeWidth={1.5} />
                    <span className="text-xs font-light tracking-wide">
                      Level
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {unit.floor ? `Floor ${unit.floor}` : "-"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                    <CheckCircle2 size={16} strokeWidth={1.5} />
                    <span className="text-xs font-light tracking-wide">
                      Status
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 capitalize">
                    {unit.unitStatus || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
