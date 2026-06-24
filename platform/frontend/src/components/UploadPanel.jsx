export default function UploadPanel({ onUpload, loading, accept = ".csv,.h5ad", hint }) {
  return (
    <div className="card">
      <h3 className="mb-2 text-lg font-semibold text-white">Upload expression matrix</h3>
      <p className="mb-4 text-sm text-slate-400">
        {hint ??
          "CSV (cells × genes) or h5ad. Include gene columns: APOE, CLU, CST3, AQP4, SLC1A2, SPARCL1."}
      </p>
      <input
        type="file"
        accept={accept}
        disabled={loading}
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-500"
      />
    </div>
  );
}
