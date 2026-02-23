"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Check,
  Image as ImageIcon,
} from "lucide-react";

interface AddAgentFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface SalesExperienceEntry {
  company: string;
  position: string;
  years: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  homeAddress: string;
  email: string;
  password: string;
  employerName: string;
  position: string;
  businessAddress: string;
  brokersLicense: string;
  tin: string;
  primaryContact: string;
  viber: string;
  whatsapp: string;
  messenger: string;
  emergencyContactName: string;
  emergencyContactNo: string;
  emergencyRelationship: string;
  characterReferences: Array<{
    name: string;
    relationship: string;
    contactNo: string;
    email: string;
  }>;
  highSchool: string;
  highSchoolYear: string;
  college: string;
  collegeYear: string;
  seminars: Array<{ title: string; date: string; venue: string }>;
  salesExperience: SalesExperienceEntry[];
  picture: File | null;
  picturePreview: string | null;
}

interface Errors {
  [key: string]: string | undefined;
}

type StepType =
  | "agent"
  | "professional"
  | "references"
  | "education"
  | "sales"
  | "picture";

const STEPS: { id: StepType; title: string; description: string }[] = [
  { id: "agent", title: "Agent Info", description: "Personal details" },
  {
    id: "professional",
    title: "Professional",
    description: "Employment & contact",
  },
  {
    id: "references",
    title: "References",
    description: "Character references",
  },
  { id: "education", title: "Education", description: "Education & seminars" },
  { id: "sales", title: "Sales Experience", description: "Sales background" },
  { id: "picture", title: "Picture", description: "Profile picture" },
];

export default function AddAgentForm({
  onClose,
  onSuccess,
}: AddAgentFormProps) {
  const [currentStep, setCurrentStep] = useState<StepType>("agent");
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    middleName: "",
    birthDate: "",
    homeAddress: "",
    email: "",
    password: "",
    employerName: "",
    position: "",
    businessAddress: "",
    brokersLicense: "",
    tin: "",
    primaryContact: "",
    viber: "",
    whatsapp: "",
    messenger: "",
    emergencyContactName: "",
    emergencyContactNo: "",
    emergencyRelationship: "",
    characterReferences: [
      { name: "", relationship: "", contactNo: "", email: "" },
      { name: "", relationship: "", contactNo: "", email: "" },
      { name: "", relationship: "", contactNo: "", email: "" },
    ],
    highSchool: "",
    highSchoolYear: "",
    college: "",
    collegeYear: "",
    seminars: [
      { title: "", date: "", venue: "" },
      { title: "", date: "", venue: "" },
      { title: "", date: "", venue: "" },
    ],
    salesExperience: [{ company: "", position: "", years: "" }],
    picture: null,
    picturePreview: null,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number,
    arrayField?: string,
  ) => {
    const { name, value } = e.target;

    if (arrayField && index !== undefined) {
      setFormData((prev) => ({
        ...prev,
        [arrayField]: (prev[arrayField as keyof FormData] as any[])?.map(
          (item: any, i: number) =>
            i === index ? { ...item, [name]: value } : item,
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Sales Experience handlers
  const handleSalesExperienceChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      salesExperience: prev.salesExperience.map((exp, i) =>
        i === index ? { ...exp, [name]: value } : exp,
      ),
    }));
  };

  const addSalesExperience = () => {
    setFormData((prev) => ({
      ...prev,
      salesExperience: [
        ...prev.salesExperience,
        { company: "", position: "", years: "" },
      ],
    }));
  };

  const removeSalesExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      salesExperience: prev.salesExperience.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          picture: file,
          picturePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Errors = {};

    if (currentStep === "agent") {
      if (!formData.firstName.trim()) newErrors.firstName = "Required";
      if (!formData.lastName.trim()) newErrors.lastName = "Required";
      if (!formData.birthDate.trim()) newErrors.birthDate = "Required";
      if (!formData.homeAddress.trim()) newErrors.homeAddress = "Required";
      if (!formData.email.trim()) newErrors.email = "Required";
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "Invalid email";
      if (!formData.password.trim()) newErrors.password = "Required";
    } else if (currentStep === "professional") {
      if (!formData.employerName.trim()) newErrors.employerName = "Required";
      if (!formData.position.trim()) newErrors.position = "Required";
      if (!formData.businessAddress.trim())
        newErrors.businessAddress = "Required";
      if (!formData.brokersLicense.trim())
        newErrors.brokersLicense = "Required";
      if (!formData.primaryContact.trim())
        newErrors.primaryContact = "Required";
      if (!formData.emergencyContactName.trim())
        newErrors.emergencyContactName = "Required";
      if (!formData.emergencyContactNo.trim())
        newErrors.emergencyContactNo = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    const stepIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1].id);
      setSubmitError(null);
    }
  };

  const handlePrevious = () => {
    const stepIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].id);
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.picture) {
      setSubmitError("Please upload an agent picture");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSubmitError("Not authenticated");
        return;
      }

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || null,
        birthDate: formData.birthDate,
        homeAddress: formData.homeAddress,
        email: formData.email,
        password: formData.password,
        employerName: formData.employerName,
        position: formData.position,
        businessAddress: formData.businessAddress,
        brokersLicense: formData.brokersLicense,
        tin: formData.tin || null,
        primaryContact: formData.primaryContact,
        viber: formData.viber || null,
        whatsapp: formData.whatsapp || null,
        messenger: formData.messenger || null,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactNo: formData.emergencyContactNo,
        emergencyRelationship: formData.emergencyRelationship,
        characterReferences: formData.characterReferences.filter(
          (ref) => ref.name && ref.contactNo,
        ),
        highSchool: formData.highSchool || null,
        highSchoolYear: formData.highSchoolYear || null,
        college: formData.college || null,
        collegeYear: formData.collegeYear || null,
        seminars: formData.seminars.filter((s) => s.title && s.date),
        salesExperience: formData.salesExperience,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brokers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create agent");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const progressPercent = ((currentStepIndex + 1) / STEPS.length) * 100;

  // Replit-inspired clean input styles
  const inputClass =
    "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#1C2333] dark:border-[#2B3245] dark:text-slate-200 dark:placeholder-slate-500";
  const labelClass =
    "block text-sm font-medium text-slate-700 mb-1.5 dark:text-slate-300";
  const errorClass = "text-red-500 text-xs mt-1 font-medium";
  const sectionTitleClass =
    "text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-[#2B3245] pb-2";

  return (
    <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto bg-white dark:bg-[#0E1525] text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-[#2B3245] h-[90vh] md:h-[80vh]">
      {/* Sidebar Navigation (Desktop) */}
      <div className="hidden md:flex flex-col w-64 bg-slate-50 dark:bg-[#121927] border-r border-slate-200 dark:border-[#2B3245] py-6 px-4 shrink-0">
        <div className="mb-8 px-2">
          <h2 className="text-xl font-semibold tracking-tight">Add Agent</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete the profile setup
          </p>
        </div>
        <div className="space-y-1 flex-1 overflow-y-auto">
          {STEPS.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() =>
                  idx <= currentStepIndex && setCurrentStep(step.id)
                }
                disabled={idx > currentStepIndex}
                className={`w-full flex items-center text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-[#1E293B] dark:text-blue-400"
                    : isCompleted
                      ? "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1C2333]"
                      : "text-slate-400 dark:text-slate-600 cursor-not-allowed"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 text-[10px] ${
                    isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                      : isCompleted
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500"
                        : "bg-slate-200 text-slate-500 dark:bg-[#2B3245] dark:text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                {step.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header & Progress */}
        <div className="md:hidden border-b border-slate-200 dark:border-[#2B3245] bg-white dark:bg-[#0E1525] p-4 shrink-0">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">
              {STEPS[currentStepIndex].title}
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Step {currentStepIndex + 1} of {STEPS.length}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#1C2333] rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
          <form id="agent-form" onSubmit={handleSubmit} className="max-w-3xl">
            <div className="mb-8 hidden md:block">
              <h3 className="text-2xl font-semibold">
                {STEPS[currentStepIndex].title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {STEPS[currentStepIndex].description}
              </p>
            </div>

            {submitError && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-md text-sm text-red-600 dark:text-red-400 flex items-center">
                <span className="mr-2">⚠️</span> {submitError}
              </div>
            )}

            {/* Step 1: Agent Info */}
            {currentStep === "agent" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="John"
                      disabled={loading}
                    />
                    {errors.firstName && (
                      <p className={errorClass}>{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="M."
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Doe"
                      disabled={loading}
                    />
                    {errors.lastName && (
                      <p className={errorClass}>{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      Birth Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className={inputClass}
                      disabled={loading}
                    />
                    {errors.birthDate && (
                      <p className={errorClass}>{errors.birthDate}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="john@example.com"
                      disabled={loading}
                    />
                    {errors.email && (
                      <p className={errorClass}>{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Home Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="homeAddress"
                    value={formData.homeAddress}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="123 Main Street, City"
                    disabled={loading}
                  />
                  {errors.homeAddress && (
                    <p className={errorClass}>{errors.homeAddress}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  {errors.password && (
                    <p className={errorClass}>{errors.password}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Professional Details */}
            {currentStep === "professional" && (
              <div className="space-y-8">
                <div>
                  <h4 className={sectionTitleClass}>Employment</h4>
                  <div className="space-y-5 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>
                          Employer's Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="employerName"
                          value={formData.employerName}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Company Name"
                          disabled={loading}
                        />
                        {errors.employerName && (
                          <p className={errorClass}>{errors.employerName}</p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>
                          Position <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="position"
                          value={formData.position}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Sales Agent"
                          disabled={loading}
                        />
                        {errors.position && (
                          <p className={errorClass}>{errors.position}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Business Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Office address"
                        disabled={loading}
                      />
                      {errors.businessAddress && (
                        <p className={errorClass}>{errors.businessAddress}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>
                          Broker's License No.{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="brokersLicense"
                          value={formData.brokersLicense}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="BL-XXXXX"
                          disabled={loading}
                        />
                        {errors.brokersLicense && (
                          <p className={errorClass}>{errors.brokersLicense}</p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>TIN</label>
                        <input
                          type="text"
                          name="tin"
                          value={formData.tin}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Tax ID"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={sectionTitleClass}>Contact & Social</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-4">
                    <div className="lg:col-span-2">
                      <label className={labelClass}>
                        Primary Contact <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="primaryContact"
                        value={formData.primaryContact}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="+63 9XX XXX XXXX"
                        disabled={loading}
                      />
                      {errors.primaryContact && (
                        <p className={errorClass}>{errors.primaryContact}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Viber</label>
                      <input
                        type="text"
                        name="viber"
                        value={formData.viber}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Username"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>WhatsApp</label>
                      <input
                        type="text"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Number"
                        disabled={loading}
                      />
                    </div>
                    <div className="lg:col-span-4">
                      <label className={labelClass}>Messenger</label>
                      <input
                        type="text"
                        name="messenger"
                        value={formData.messenger}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Username / Link"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={sectionTitleClass}>Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                    <div>
                      <label className={labelClass}>
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Full Name"
                        disabled={loading}
                      />
                      {errors.emergencyContactName && (
                        <p className={errorClass}>
                          {errors.emergencyContactName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        Contact No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="emergencyContactNo"
                        value={formData.emergencyContactNo}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Phone number"
                        disabled={loading}
                      />
                      {errors.emergencyContactNo && (
                        <p className={errorClass}>
                          {errors.emergencyContactNo}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Relationship</label>
                      <input
                        type="text"
                        name="emergencyRelationship"
                        value={formData.emergencyRelationship}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="e.g., Sibling"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Character References */}
            {currentStep === "references" && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  List up to 3 character references (optional).
                </p>
                <div className="space-y-6">
                  {formData.characterReferences.map((ref, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-lg border border-slate-200 dark:border-[#2B3245] bg-slate-50/50 dark:bg-[#121927]"
                    >
                      <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                        Reference {idx + 1}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="name"
                          placeholder="Full Name"
                          value={ref.name}
                          onChange={(e) =>
                            handleChange(e, idx, "characterReferences")
                          }
                          className={inputClass}
                          disabled={loading}
                        />
                        <input
                          type="text"
                          name="relationship"
                          placeholder="Relationship"
                          value={ref.relationship}
                          onChange={(e) =>
                            handleChange(e, idx, "characterReferences")
                          }
                          className={inputClass}
                          disabled={loading}
                        />
                        <input
                          type="tel"
                          name="contactNo"
                          placeholder="Contact No."
                          value={ref.contactNo}
                          onChange={(e) =>
                            handleChange(e, idx, "characterReferences")
                          }
                          className={inputClass}
                          disabled={loading}
                        />
                        <input
                          type="email"
                          name="email"
                          placeholder="Email Address"
                          value={ref.email}
                          onChange={(e) =>
                            handleChange(e, idx, "characterReferences")
                          }
                          className={inputClass}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Education */}
            {currentStep === "education" && (
              <div className="space-y-8">
                <div>
                  <h4 className={sectionTitleClass}>Academic Background</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                    <div className="md:col-span-2">
                      <label className={labelClass}>High School</label>
                      <input
                        type="text"
                        name="highSchool"
                        placeholder="School Name"
                        value={formData.highSchool}
                        onChange={handleChange}
                        className={inputClass}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Year Graduated</label>
                      <input
                        type="number"
                        name="highSchoolYear"
                        placeholder="YYYY"
                        value={formData.highSchoolYear}
                        onChange={handleChange}
                        className={inputClass}
                        disabled={loading}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>College</label>
                      <input
                        type="text"
                        name="college"
                        placeholder="University/College Name"
                        value={formData.college}
                        onChange={handleChange}
                        className={inputClass}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Year Graduated</label>
                      <input
                        type="number"
                        name="collegeYear"
                        placeholder="YYYY"
                        value={formData.collegeYear}
                        onChange={handleChange}
                        className={inputClass}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={sectionTitleClass}>Seminars Attended</h4>
                  <div className="space-y-5 mt-4">
                    {formData.seminars.map((seminar, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col md:flex-row gap-4"
                      >
                        <input
                          type="text"
                          name="title"
                          placeholder={`Seminar ${idx + 1} Title`}
                          value={seminar.title}
                          onChange={(e) => handleChange(e, idx, "seminars")}
                          className={`${inputClass} flex-1`}
                          disabled={loading}
                        />
                        <input
                          type="date"
                          name="date"
                          value={seminar.date}
                          onChange={(e) => handleChange(e, idx, "seminars")}
                          className={`${inputClass} md:w-40`}
                          disabled={loading}
                        />
                        <input
                          type="text"
                          name="venue"
                          placeholder="Venue/Organizer"
                          value={seminar.venue}
                          onChange={(e) => handleChange(e, idx, "seminars")}
                          className={`${inputClass} flex-1`}
                          disabled={loading}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Sales Experience */}
            {currentStep === "sales" && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  List your sales experience (e.g., Company, Position, Years).
                  You can add multiple entries.
                </p>
                <div className="space-y-5">
                  {formData.salesExperience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-4 items-end"
                    >
                      <div className="col-span-5">
                        <label className={labelClass}>Company</label>
                        <input
                          type="text"
                          name="company"
                          value={exp.company}
                          onChange={(e) => handleSalesExperienceChange(idx, e)}
                          className={inputClass}
                          placeholder="e.g., Company Name"
                          disabled={loading}
                        />
                      </div>
                      <div className="col-span-4">
                        <label className={labelClass}>Position/Title</label>
                        <input
                          type="text"
                          name="position"
                          value={exp.position}
                          onChange={(e) => handleSalesExperienceChange(idx, e)}
                          className={inputClass}
                          placeholder="e.g., Sales Agent"
                          disabled={loading}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className={labelClass}>Years</label>
                        <input
                          type="number"
                          name="years"
                          value={exp.years}
                          onChange={(e) => handleSalesExperienceChange(idx, e)}
                          className={inputClass}
                          placeholder="e.g., 4"
                          disabled={loading}
                          min={0}
                        />
                      </div>
                      <div className="col-span-1 flex items-center">
                        {formData.salesExperience.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSalesExperience(idx)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1"
                            disabled={loading}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSalesExperience}
                    className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded font-medium text-xs hover:bg-blue-200 transition-colors"
                    disabled={loading}
                  >
                    + Add Experience
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Picture */}
            {currentStep === "picture" && (
              <div className="flex justify-center mt-4">
                <div className="w-full max-w-md">
                  <div
                    onClick={() =>
                      document.getElementById("picture-input")?.click()
                    }
                    className="border-2 border-dashed border-slate-300 dark:border-[#2B3245] hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-[#121927]"
                  >
                    {formData.picturePreview ? (
                      <div className="flex flex-col items-center text-center">
                        <div className="relative group rounded-lg overflow-hidden mb-4 border border-slate-200 dark:border-[#2B3245]">
                          <img
                            src={formData.picturePreview}
                            alt="Preview"
                            className="w-40 h-40 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ImageIcon className="text-white w-8 h-8" />
                          </div>
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-50">
                          {formData.picture?.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Click to replace image
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 text-blue-500">
                          <Upload className="w-8 h-8" />
                        </div>
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                          Upload Profile Picture
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Drag and drop or click to browse
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    )}
                    <input
                      id="picture-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 dark:border-[#2B3245] bg-slate-50 dark:bg-[#121927] p-4 shrink-0 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0 || loading}
              className="px-4 py-2 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1C2333] border border-slate-200 dark:border-[#2B3245] rounded-md hover:bg-slate-50 dark:hover:bg-[#2B3245] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {currentStepIndex === STEPS.length - 1 ? (
              <button
                type="submit"
                form="agent-form"
                disabled={loading}
                className="px-6 py-2 flex items-center gap-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Complete Setup
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2 flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
