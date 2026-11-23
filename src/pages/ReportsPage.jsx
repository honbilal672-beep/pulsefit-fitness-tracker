import { useState } from "react";
import {
  FileDown,
  FileText,
  Calendar,
  Download,
  Dumbbell,
  Apple,
  Scale
} from "lucide-react";
import { useToast } from "../context/ToastContext";
const ReportsPage = () => {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [downloading, setDownloading] = useState(null);
  const { showToast } = useToast();
  const handleExportCSV = async (type) => {
    try {
      setDownloading(`csv-${type}`);
      const token = localStorage.getItem("pulsefit_token");
      const response = await fetch(
        `/api/reports/csv?type=${type}&startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pulsefit-${type}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast(`${type.toUpperCase()} CSV export downloaded!`, "success");
    } catch {
      showToast("Could not download CSV export.", "error");
    } finally {
      setDownloading(null);
    }
  };
  const handleExportPDF = async () => {
    try {
      setDownloading("pdf");
      const token = localStorage.getItem("pulsefit_token");
      const response = await fetch(
        `/api/reports/pdf?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (!response.ok) throw new Error("PDF Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pulsefit-summary-report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast("PDF summary report generated & downloaded!", "success");
    } catch {
      showToast("Could not generate PDF report.", "error");
    } finally {
      setDownloading(null);
    }
  };
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <FileDown className="w-7 h-7 text-blue-500" /> Reports & Data Export
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Generate comprehensive PDF documentation and tabular CSV spreadsheets for evaluation
        </p>
      </div>

      {
    /* Date Range Config */
  }
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" /> Select Report Timeframe
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Start Date</label>
            <input
    type="date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">End Date</label>
            <input
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
          </div>
        </div>
      </div>

      {
    /* Export Cards */
  }
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {
    /* PDF Document Card */
  }
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-900 border border-blue-500/30 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Comprehensive Fitness Report (PDF)</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              A formatted executive summary document built with <code className="text-blue-300 font-mono">pdfkit</code> containing athlete biometrics, total workout volume, nutrition intake breakdown, and strength progression.
            </p>
          </div>

          <button
    type="button"
    onClick={handleExportPDF}
    disabled={downloading === "pdf"}
    className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
  >
            <Download className="w-4 h-4" />
            {downloading === "pdf" ? "Generating PDF..." : "Download PDF Report"}
          </button>
        </div>

        {
    /* Tabular CSV Exports */
  }
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4">
              <FileDown className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Spreadsheet Raw Data (CSV)</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Download standard RFC 4180 comma-separated spreadsheets generated with <code className="text-emerald-300 font-mono">json2csv</code> for Excel or Google Sheets analysis.
            </p>

            <div className="space-y-2.5">
              <button
    type="button"
    onClick={() => handleExportCSV("workouts")}
    disabled={downloading === "csv-workouts"}
    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
  >
                <span className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-blue-400" /> Workouts & Exercise History
                </span>
                <span className="text-[11px] text-blue-400 flex items-center gap-1">
                  Export CSV <Download className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
    type="button"
    onClick={() => handleExportCSV("nutrition")}
    disabled={downloading === "csv-nutrition"}
    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
  >
                <span className="flex items-center gap-2">
                  <Apple className="w-4 h-4 text-emerald-400" /> Nutrition Logs & Macro Summary
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  Export CSV <Download className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
    type="button"
    onClick={() => handleExportCSV("progress")}
    disabled={downloading === "csv-progress"}
    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
  >
                <span className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-400" /> Body Measurements & Max Lifts
                </span>
                <span className="text-[11px] text-purple-400 flex items-center gap-1">
                  Export CSV <Download className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export {
  ReportsPage
};
