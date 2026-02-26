import {
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Building,
  CheckCircle2,
  Presentation,
  FileDown,
  IdCard,
} from "lucide-react";

interface BrokerDetailsViewProps {
  broker: any;
}

export default function BrokerDetailsView({ broker }: BrokerDetailsViewProps) {
  if (!broker) return null;

  const profilePic =
    broker.brokerPictures && broker.brokerPictures.length > 0
      ? `${process.env.NEXT_PUBLIC_API_URL}/${broker.brokerPictures[0].imagePath}`
      : null;

  // Simple function to export data to CSV
  const handleExportToExcel = () => {
    const rows = [
      [
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Contact",
        "License",
        "Employer",
      ],
      [
        broker.id,
        broker.firstName,
        broker.lastName,
        broker.email || "N/A",
        broker.primaryContact || "N/A",
        broker.brokersLicense || "N/A",
        broker.employerName || "N/A",
      ],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Broker_${broker.firstName}_${broker.lastName}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col relative text-slate-800 pb-4">
      {/* Top Action Bar */}
      <div className="absolute top-0 right-0 z-10">
        <button
          onClick={handleExportToExcel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-all"
          title="Export to Excel (CSV)"
        >
          <FileDown size={14} className="text-blue-600" />
          Export Info
        </button>
      </div>

      {/* 1. Header: Centered Portrait Section */}
      <div className="flex flex-col items-center pt-2 pb-6 border-b border-slate-100">
        <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-md flex items-center justify-center text-blue-600 shrink-0 overflow-hidden relative">
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) =>
                ((e.target as HTMLImageElement).style.display = "none")
              }
            />
          ) : (
            <span className="text-3xl font-bold uppercase">
              {broker.firstName?.charAt(0)}
              {broker.lastName?.charAt(0)}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-slate-900 mt-4 text-center">
          {broker.firstName} {broker.lastName}
        </h2>

        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
            <IdCard size={12} />
            {String(broker.id).padStart(4, "0")}
          </span>
          {broker.brokersLicense ? (
            <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 size={12} />
              {broker.brokersLicense}
            </span>
          ) : (
            <span className="text-xs text-slate-400 italic bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              No License
            </span>
          )}
        </div>
      </div>

      {/* Scrollable Content Area (Useful if modal gets too tall) */}
      <div className="flex flex-col gap-6 pt-6">
        {/* 2. Contact Information */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            Contact Details
          </h3>
          <div className="flex flex-col gap-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Mail size={14} />
              </div>
              <span className="truncate">
                {broker.email || "No email provided"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone size={14} />
              </div>
              <span>{broker.primaryContact || "No contact number"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Building size={14} />
              </div>
              <span className="truncate">
                {broker.employerName || "No employer listed"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Work Experience */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            Work Experience
          </h3>
          <div className="flex flex-col gap-0 bg-white border border-slate-100 rounded-xl overflow-hidden">
            {broker.salesExperiences?.length > 0 ? (
              broker.salesExperiences.map((exp: any, index: number) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 text-sm ${
                    index !== broker.salesExperiences.length - 1
                      ? "border-b border-slate-50"
                      : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Briefcase size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">
                      {exp.position}
                    </span>
                    <span className="text-slate-500 text-xs mt-0.5">
                      {exp.company} <span className="mx-1">•</span> {exp.years}{" "}
                      yrs
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-slate-400 italic text-center">
                No experience recorded
              </p>
            )}
          </div>
        </div>

        {/* 4. Education Background */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            Education
          </h3>
          <div className="flex flex-col gap-0 bg-white border border-slate-100 rounded-xl overflow-hidden">
            {broker.educBackgrounds?.length > 0 ? (
              broker.educBackgrounds.map((edu: any, index: number) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 text-sm ${
                    index !== broker.educBackgrounds.length - 1
                      ? "border-b border-slate-50"
                      : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">
                      {edu.collegeDegree || "Degree not specified"}
                    </span>
                    <span className="text-slate-500 text-xs mt-0.5">
                      Class of {edu.collegeYear || "N/A"}
                    </span>
                    {edu.highSchool && (
                      <span className="text-slate-400 text-[10px] mt-1">
                        HS: {edu.highSchool} ({edu.highSchoolYear})
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-slate-400 italic text-center">
                No education recorded
              </p>
            )}
          </div>
        </div>

        {/* 5. Seminars Attended */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            Seminars & Training
          </h3>
          <div className="flex flex-col gap-0 bg-white border border-slate-100 rounded-xl overflow-hidden">
            {broker.seminars?.length > 0 ? (
              broker.seminars.map((sem: any, index: number) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 text-sm ${
                    index !== broker.seminars.length - 1
                      ? "border-b border-slate-50"
                      : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Presentation size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">
                      {sem.seminars}
                    </span>
                    <span className="text-slate-500 text-xs mt-0.5 flex flex-wrap gap-1">
                      {sem.semDate && (
                        <span>
                          {new Date(sem.semDate).toLocaleDateString()}
                        </span>
                      )}
                      {sem.semDate && sem.venue && <span>•</span>}
                      {sem.venue && <span>{sem.venue}</span>}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-slate-400 italic text-center">
                No seminars recorded
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
