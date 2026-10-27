import React, { useState } from 'react';
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Download,
  Database,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { useFilters } from '../context/FilterContext';
import { DataQualityReport } from '../types/analytics';

export const DataManagementPage: React.FC = () => {
  const { metadata, refreshMetadata } = useFilters();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validating, setValidating] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setStatusMessage(null);
      setReport(null);
      await runValidation(file);
    }
  };

  const runValidation = async (file: File) => {
    try {
      setValidating(true);
      const res = await api.validateFile(file);
      setReport(res);
      setMapping(res.suggested_mapping || {});
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Validation failed' });
    } finally {
      setValidating(false);
    }
  };

  const handleApplyUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      const res = await api.uploadFile(selectedFile, mapping);
      setStatusMessage({ type: 'success', text: res.message });
      await refreshMetadata();
      setReport(null);
      setSelectedFile(null);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset dataset back to the default canonical 1992-2026 Olympic data?')) {
      try {
        const res = await api.resetData();
        setStatusMessage({ type: 'success', text: res.message });
        await refreshMetadata();
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err.message || 'Reset failed' });
      }
    }
  };

  const downloadErrorReport = () => {
    if (!report || !report.quality_summary.errors) return;
    const errors = report.quality_summary.errors;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Row,Column,Value,Reason\n' +
      errors.map((e) => `${e.row_number},"${e.column}","${e.invalid_value || ''}","${e.reason}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'validation_errors.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <UploadCloud className="w-6 h-6 text-yellow-400" />
            Dataset Management & Quality Assurance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload custom Olympic athlete, medal, or investment CSVs with column mapping and validation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
            Reset to Canonical Data
          </button>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Current Active Dataset Status */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-sky-400" />
          Active Dataset Metadata
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Active File</span>
            <p className="text-sm font-bold text-white mt-1 truncate">{metadata?.dataset_name}</p>
            <span className="text-[10px] text-yellow-400 mt-0.5 block">{metadata?.is_custom ? 'User Upload' : 'Built-in Canonical'}</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Records Loaded</span>
            <p className="text-sm font-bold text-white mt-1">{metadata?.total_records.toLocaleString()}</p>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Athlete-Event rows</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Time Range</span>
            <p className="text-sm font-bold text-white mt-1">{metadata?.year_min} – {metadata?.year_max}</p>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Verified Editions</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Investment Data</span>
            <p className="text-sm font-bold text-white mt-1">{metadata?.investment_data_available ? (metadata.is_investment_demo ? 'Demo Benchmark' : 'Verified') : 'Unavailable'}</p>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Scenario B Support</span>
          </div>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-yellow-400" />
            Upload New Dataset (.CSV)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload custom athlete results or sports investment data. The validation engine will verify schema integrity before applying changes.
          </p>
        </div>

        <div className="border-2 border-dashed border-slate-700 hover:border-yellow-500/60 rounded-2xl p-8 text-center transition-colors bg-slate-950/40">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-file-input"
          />
          <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-slate-800 text-yellow-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-white">Click to select CSV file or drag & drop</p>
            <p className="text-[11px] text-slate-500">Supports athlete-event, medal results, or sports investment schemas</p>
          </label>
          {selectedFile && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-300 font-mono">
              <FileText className="w-3.5 h-3.5" />
              <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>

        {validating && (
          <div className="p-4 rounded-xl bg-slate-800/80 text-center text-xs text-slate-300 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <span>Analyzing dataset quality and running validation rules...</span>
          </div>
        )}

        {/* Validation Quality Report */}
        {report && (
          <div className="space-y-4 pt-2 border-t border-slate-800 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {report.quality_summary.passed_validation ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                <h3 className="text-sm font-bold text-white">
                  {report.quality_summary.passed_validation ? 'Validation Passed' : 'Validation Warnings Identified'}
                </h3>
              </div>
              {report.quality_summary.errors.length > 0 && (
                <button
                  onClick={downloadErrorReport}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg transition-colors border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-yellow-400" />
                  Download Error Report
                </button>
              )}
            </div>

            {/* Quality Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Total Rows</span>
                <p className="text-sm font-bold text-white mt-1">{report.quality_summary.total_rows.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Detected Type</span>
                <p className="text-sm font-bold text-yellow-400 mt-1 capitalize">{report.quality_summary.detected_dataset_type.replace('_', ' ')}</p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Invalid Rows</span>
                <p className={`text-sm font-bold mt-1 ${report.quality_summary.invalid_rows === 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {report.quality_summary.invalid_rows}
                </p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Duplicates</span>
                <p className="text-sm font-bold text-white mt-1">{report.quality_summary.duplicate_rows}</p>
              </div>
            </div>

            {/* Column Mapping Interface */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Column Header Mapping (Map CSV to Canonical Fields)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(mapping).map(([originalCol, targetCol]) => (
                  <div key={originalCol} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <span className="font-mono text-slate-300 truncate max-w-[120px]" title={originalCol}>
                      {originalCol}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-500 shrink-0 mx-1" />
                    <input
                      type="text"
                      value={targetCol}
                      onChange={(e) => setMapping({ ...mapping, [originalCol]: e.target.value })}
                      className="w-28 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-yellow-400 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Apply dataset button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleApplyUpload}
                disabled={uploading}
                className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2"
              >
                {uploading ? 'Activating Dataset...' : 'Activate Validated Dataset'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
