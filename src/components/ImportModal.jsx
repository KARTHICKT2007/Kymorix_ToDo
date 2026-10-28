import { useState, useRef } from 'react';
import { useTasks } from '../context/useTasks';
import { parseTasksJSON } from '../utils/exportImport';

export const ImportModal = ({ isOpen, onClose }) => {
  const { importTasks } = useTasks();
  const [jsonInput, setJsonInput] = useState('');
  const [mode, setMode] = useState('merge'); // 'merge' or 'replace'
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        setJsonInput(content);
        setError('');
      } catch (err) {
        setError('Failed to read file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!jsonInput.trim()) {
      setError('Please provide JSON data or select a file.');
      return;
    }

    try {
      const parsedTasks = parseTasksJSON(jsonInput);
      if (parsedTasks.length === 0) {
        setError('No valid tasks found in JSON.');
        return;
      }
      importTasks(parsedTasks, mode);
      onClose();
    } catch (err) {
      setError('Invalid JSON format: ' + err.message);
    }
  };

  return (
    <div
      className="modal fade show d-block modal-animated-backdrop"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-animated-dialog"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-content shadow-lg border-0 rounded-4">
          <div className="modal-header border-bottom">
            <h5 id="import-modal-title" className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-cloud-arrow-up text-primary"></i>
              Import Tasks Data
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-4">
            {error && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span>{error}</span>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-semibold">Choose Backup JSON File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="form-control"
                onChange={handleFileUpload}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Or Paste JSON Data Directly</label>
              <textarea
                className="form-control font-monospace small"
                rows="5"
                placeholder='[ { "title": "Example Task", "completed": false } ]'
                value={jsonInput}
                onChange={e => {
                  setJsonInput(e.target.value);
                  setError('');
                }}
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold d-block">Import Strategy</label>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="importMode"
                  id="modeMerge"
                  checked={mode === 'merge'}
                  onChange={() => setMode('merge')}
                />
                <label className="form-check-label" htmlFor="modeMerge">
                  <strong>Merge</strong> (keep existing tasks)
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="importMode"
                  id="modeReplace"
                  checked={mode === 'replace'}
                  onChange={() => setMode('replace')}
                />
                <label className="form-check-label text-danger" htmlFor="modeReplace">
                  <strong>Replace All</strong> (overwrites existing tasks)
                </label>
              </div>
            </div>
          </div>
          <div className="modal-footer border-top-0 pt-0">
            <button
              type="button"
              className="btn btn-secondary rounded-3"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary rounded-3 px-4 fw-semibold"
              onClick={handleImport}
            >
              Import Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
