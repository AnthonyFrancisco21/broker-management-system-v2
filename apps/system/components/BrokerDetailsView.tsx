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
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import Modal from "./Modal";

interface BrokerDetailsViewProps {
  broker: any;
}

export default function BrokerDetailsView({ broker }: BrokerDetailsViewProps) {
  if (!broker) return null;

  const profilePic =
    broker.brokerPictures && broker.brokerPictures.length > 0
      ? `${process.env.NEXT_PUBLIC_API_URL}/${broker.brokerPictures[0].imagePath}`
      : null;

  const pdfRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Custom Alert Modal State
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: "", message: "" });

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ title, message });
    setAlertOpen(true);
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsExporting(true);

    try {
      // Temporarily override scroll behavior to capture full content
      const rightColumn = pdfRef.current.querySelector('.custom-scrollbar') as HTMLElement;
      let originalMaxHeight = '';
      let originalOverflow = '';
      
      // Calculate exact A4 aspect ratio height based on current width
      const originalMinHeight = pdfRef.current.style.minHeight;
      const targetMinHeight = pdfRef.current.clientWidth * 1.4142;
      pdfRef.current.style.minHeight = `${targetMinHeight}px`;

      // Remove borders, rounding, and shadow for a clean PDF look
      const classesToToggle = ['rounded-xl', 'border', 'border-slate-200', 'shadow-sm', 'mt-2'];
      pdfRef.current.classList.remove(...classesToToggle);
      
      if (rightColumn) {
        originalMaxHeight = rightColumn.style.maxHeight;
        originalOverflow = rightColumn.style.overflow;
        rightColumn.style.maxHeight = 'none';
        rightColumn.style.overflow = 'visible';
      }

      // Small delay to allow DOM to recalculate layouts
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(pdfRef.current, {
        quality: 1,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      if (rightColumn) {
        rightColumn.style.maxHeight = originalMaxHeight;
        rightColumn.style.overflow = originalOverflow;
      }
      
      // Restore original styles
      pdfRef.current.style.minHeight = originalMinHeight;
      pdfRef.current.classList.add(...classesToToggle);

      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // We need to calculate height based on the image's aspect ratio
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => { img.onload = resolve; });
      
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Broker_${broker.firstName}_${broker.lastName}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      showAlert("Download Failed", "There was an error generating the PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col relative text-slate-800 bg-white">
      {/* Top Action Bar */}
      <div className="absolute top-4 right-4 z-10 ">
        <button
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-all disabled:opacity-50"
          title="Download PDF Resume"
        >
          {isExporting ? (
            <Loader2 size={16} className="text-blue-600 animate-spin" />
          ) : (
            <FileDown size={16} className="text-blue-600" />
          )}
          {isExporting ? "Generating..." : "Download"}
        </button>
      </div>

      <div ref={pdfRef} className="flex flex-col md:flex-row min-h-[600px] border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-2 bg-white">
        {/* Left Column: Sidebar / Profile Info */}
        <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 p-8 flex flex-col gap-8">
          {/* Profile Picture & Identity */}
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-white border-4 border-slate-200 shadow-sm flex items-center justify-center text-blue-600 shrink-0 overflow-hidden relative mb-4">
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
                <span className="text-4xl font-bold uppercase">
                  {broker.firstName?.charAt(0)}
                  {broker.lastName?.charAt(0)}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              {broker.firstName} <br /> {broker.lastName}
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-2">
              {broker.position || "Real Estate Broker"}
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-mono text-slate-600 shadow-sm">
              <IdCard size={14} className="text-slate-400" />
              Agent ID: {String(broker.id).padStart(4, "0")}
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">
              Contact Details
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                  <Mail size={14} />
                </div>
                <span className="mt-1 break-all">
                  {broker.email || "No email provided"}
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                  <Phone size={14} />
                </div>
                <span className="mt-1">
                  {broker.primaryContact || "No contact number"}
                </span>
              </div>
              {broker.homeAddress && (
                <div className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                    <MapPin size={14} />
                  </div>
                  <span className="mt-1 leading-relaxed">
                    {broker.homeAddress}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Professional Credentials */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">
              Credentials
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                  <CheckCircle2 size={14} />
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className="font-medium">Broker's License</span>
                  <span className="text-slate-500 text-xs">
                    {broker.brokersLicense || "No License"}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                  <Building size={14} />
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className="font-medium">Employer</span>
                  <span className="text-slate-500 text-xs">
                    {broker.employerName || "No employer listed"}
                  </span>
                </div>
              </div>
              {broker.tin && (
                <div className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                    <IdCard size={14} />
                  </div>
                  <div className="flex flex-col mt-0.5">
                    <span className="font-medium">TIN</span>
                    <span className="text-slate-500 text-xs">{broker.tin}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          {(broker.emergencyContactName || broker.emergencyContactNo) && (
            <div className="flex flex-col gap-4 mt-auto">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">
                Emergency Contact
              </h3>
              <div className="bg-red-50/50 border border-red-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-1">
                  <AlertCircle size={14} />
                  {broker.emergencyContactName}
                </div>
                <div className="text-slate-600 text-xs pl-6">
                  <div>{broker.emergencyRelationship}</div>
                  <div className="font-mono mt-0.5">
                    {broker.emergencyContactNo}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Main Content */}
        <div className="w-full md:w-2/3 p-8 flex flex-col gap-8 bg-white overflow-y-auto max-h-[75vh] custom-scrollbar">
          {/* Work Experience */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Briefcase className="text-blue-600" size={20} />
              <h3 className="text-lg font-bold text-slate-900">
                Work Experience
              </h3>
            </div>

            <div className="flex flex-col gap-4 pl-3 border-l-2 border-slate-100 ml-2">
              {broker.salesExperiences?.length > 0 ? (
                broker.salesExperiences.map((exp: any, index: number) => (
                  <div key={index} className="relative pl-4 pb-2">
                    {/* Timeline dot */}
                    <div className="absolute w-3 h-3 bg-blue-100 border-2 border-blue-500 rounded-full -left-[23.5px] top-1.5" />

                    <div className="flex flex-col">
                      <h4 className="font-semibold text-slate-900 text-base">
                        {exp.position}
                      </h4>
                      <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                        <span className="font-medium text-slate-700">
                          {exp.company}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {exp.years} years
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic pl-4">
                  No experience recorded
                </p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="flex flex-col gap-5 mt-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-indigo-600" size={20} />
              <h3 className="text-lg font-bold text-slate-900">Education</h3>
            </div>

            <div className="flex flex-col gap-4 pl-3 border-l-2 border-slate-100 ml-2">
              {broker.educBackgrounds?.length > 0 ? (
                broker.educBackgrounds.map((edu: any, index: number) => (
                  <div key={index} className="relative pl-4 pb-2">
                    <div className="absolute w-3 h-3 bg-indigo-100 border-2 border-indigo-500 rounded-full -left-[23.5px] top-1.5" />

                    <div className="flex flex-col gap-3">
                      {edu.collegeDegree && (
                        <div>
                          <h4 className="font-semibold text-slate-900 text-base">
                            {edu.collegeDegree}
                          </h4>
                          <div className="flex items-center gap-2 text-slate-500 text-sm mt-0.5">
                            <span className="font-medium text-slate-700">
                              College Degree
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              Class of {edu.collegeYear || "N/A"}
                            </span>
                          </div>
                        </div>
                      )}

                      {edu.highSchool && (
                        <div>
                          <h4 className="font-semibold text-slate-900 text-base">
                            {edu.highSchool}
                          </h4>
                          <div className="flex items-center gap-2 text-slate-500 text-sm mt-0.5">
                            <span className="font-medium text-slate-700">
                              High School
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              Class of {edu.highSchoolYear || "N/A"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic pl-4">
                  No education recorded
                </p>
              )}
            </div>
          </div>

          {/* Seminars & Training */}
          <div className="flex flex-col gap-5 mt-4">
            <div className="flex items-center gap-2">
              <Presentation className="text-orange-600" size={20} />
              <h3 className="text-lg font-bold text-slate-900">
                Seminars & Training
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {broker.seminars?.length > 0 ? (
                broker.seminars.map((sem: any, index: number) => (
                  <div
                    key={index}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-orange-200 hover:bg-orange-50/30 transition-colors"
                  >
                    <h4 className="font-semibold text-slate-900 text-sm mb-2">
                      {sem.seminars}
                    </h4>
                    <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                      {sem.semDate && (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-400" />
                          {new Date(sem.semDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      )}
                      {sem.venue && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-400" />
                          {sem.venue}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">
                  No seminars recorded
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <Modal 
        isOpen={alertOpen} 
        onClose={() => setAlertOpen(false)} 
        title={alertConfig.title} 
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <p className="text-slate-600 mb-6">{alertConfig.message}</p>
          <button 
            onClick={() => setAlertOpen(false)}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors w-full"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
