'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import type { ExpertReport, LibraryFolder } from '@/app/data/expertReports';

interface LibrarySidebarProps {
  folders: LibraryFolder[];
  reportsByFolder: Record<string, ExpertReport[]>;
  selectedId: string | null;
  openFolderIds: Set<string>;
  selectedFolderId: string;
  onSelectReport: (report: ExpertReport) => void;
  onToggleFolder: (folderId: string) => void;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onRenameFolder: (folderId: string, name: string) => Promise<void>;
  onMoveReport: (reportId: string, folderId: string) => Promise<void>;
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M9.7 2.3a1.1 1.1 0 0 1 1.6 0l.4.4a1.1 1.1 0 0 1 0 1.6L5.5 10.5 3 11l.5-2.5 6.2-6.2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="m8.8 3.2 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function LibrarySidebar({
  folders,
  reportsByFolder,
  selectedId,
  openFolderIds,
  selectedFolderId,
  onSelectReport,
  onToggleFolder,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onMoveReport,
}: LibrarySidebarProps) {
  const { lang } = useLanguage();
  const [isCreating, setIsCreating] = useState(false);
  const [createName, setCreateName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [draggingReportId, setDraggingReportId] = useState<string | null>(null);
  const [dropTargetFolderId, setDropTargetFolderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const labels = {
    title: { zh: 'Folders', en: 'Folders' },
    addFolder: { zh: '新增 folder', en: 'Add folder' },
    createPlaceholder: { zh: '輸入 folder 名稱', en: 'Enter folder name' },
    renameFolder: { zh: '編輯 folder 名稱', en: 'Edit folder name' },
    allReports: { zh: 'All Reports', en: 'All Reports' },
    folderNameRequired: { zh: 'Folder name 不可為空白', en: 'Folder name is required' },
  };

  useEffect(() => {
    if (editingFolderId && !folders.some((folder) => folder.id === editingFolderId)) {
      setEditingFolderId(null);
      setEditingName('');
    }
  }, [editingFolderId, folders]);

  async function handleCreateFolder() {
    const nextName = createName.trim();
    if (!nextName) {
      setErrorMessage(labels.folderNameRequired[lang]);
      return;
    }

    try {
      await onCreateFolder(nextName);
      setCreateName('');
      setIsCreating(false);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : labels.folderNameRequired[lang]);
    }
  }

  function handleStartEditing(folder: LibraryFolder) {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
    setErrorMessage(null);
  }

  async function handleRenameFolder(folderId: string) {
    const nextName = editingName.trim();
    if (!nextName) {
      setErrorMessage(labels.folderNameRequired[lang]);
      return;
    }

    try {
      await onRenameFolder(folderId, nextName);
      setEditingFolderId(null);
      setEditingName('');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : labels.folderNameRequired[lang]);
    }
  }

  function handleDragStart(reportId: string, event: React.DragEvent<HTMLButtonElement>) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', reportId);
    setDraggingReportId(reportId);
  }

  async function handleDrop(folderId: string, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const reportId = event.dataTransfer.getData('text/plain') || draggingReportId;
    setDropTargetFolderId(null);
    setDraggingReportId(null);
    if (!reportId) return;
    try {
      await onMoveReport(reportId, folderId);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : labels.folderNameRequired[lang]);
    }
  }

  return (
    <div
      className="er-lib-sidebar"
      onDragEnd={() => {
        setDraggingReportId(null);
        setDropTargetFolderId(null);
      }}
    >
      <div className="er-lib-sidebar-top">
        <div className="er-lib-sidebar-title">{labels.title[lang]}</div>
        <button
          className="er-lib-icon-btn"
          type="button"
          aria-label={labels.addFolder[lang]}
          title={labels.addFolder[lang]}
          onClick={() => {
            setIsCreating((current) => !current);
            setCreateName('');
            setErrorMessage(null);
          }}
        >
          <PlusIcon />
        </button>
      </div>

      {isCreating && (
        <div className="er-lib-folder-editor">
          <input
            className="er-lib-folder-input"
            type="text"
            value={createName}
            placeholder={labels.createPlaceholder[lang]}
            autoFocus
            onChange={(event) => setCreateName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void handleCreateFolder();
              if (event.key === 'Escape') {
                setIsCreating(false);
                setCreateName('');
              }
            }}
          />
        </div>
      )}

      {errorMessage && <div className="er-lib-error">{errorMessage}</div>}

      <button
        className={`er-lib-all-btn${selectedFolderId === '__all__' ? ' er-lib-all-btn--active' : ''}`}
        onClick={() => onSelectFolder('__all__')}
      >
        {labels.allReports[lang]}
      </button>

      {folders.map((folder) => {
        const isOpen = openFolderIds.has(folder.id);
        const isEditing = editingFolderId === folder.id;
        const isDropTarget = dropTargetFolderId === folder.id;
        const folderReports = reportsByFolder[folder.id] ?? [];

        return (
          <div
            key={folder.id}
            className={`er-lib-section${isDropTarget ? ' er-lib-section--drop' : ''}`}
            onDragOver={(event) => {
              event.preventDefault();
              if (!draggingReportId) return;
              if (dropTargetFolderId !== folder.id) setDropTargetFolderId(folder.id);
            }}
            onDrop={(event) => void handleDrop(folder.id, event)}
          >
            <div className="er-lib-section-header">
              <button
                className="er-lib-section-toggle"
                type="button"
                onClick={() => onToggleFolder(folder.id)}
                aria-label={isOpen ? 'Collapse folder' : 'Expand folder'}
              >
                <span className="er-lib-section-chevron">{isOpen ? '▾' : '▸'}</span>
              </button>

              {isEditing ? (
                <input
                  className="er-lib-folder-input er-lib-folder-input--inline"
                  type="text"
                  value={editingName}
                  autoFocus
                  aria-label={labels.renameFolder[lang]}
                  onChange={(event) => setEditingName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void handleRenameFolder(folder.id);
                    if (event.key === 'Escape') {
                      setEditingFolderId(null);
                      setEditingName('');
                    }
                  }}
                />
              ) : (
                <button
                  className={`er-lib-section-title${selectedFolderId === folder.id ? ' er-lib-section-title--active' : ''}`}
                  type="button"
                  onClick={() => onSelectFolder(folder.id)}
                >
                  {folder.name}
                </button>
              )}

              <span className="er-lib-section-count">{folderReports.length}</span>

              <button
                className="er-lib-icon-btn"
                type="button"
                aria-label={labels.renameFolder[lang]}
                title={labels.renameFolder[lang]}
                onClick={() => handleStartEditing(folder)}
              >
                <PencilIcon />
              </button>
            </div>

            {isOpen && (
              <div className="er-lib-section-items">
                {folderReports.map((report) => (
                  <button
                    key={report.id}
                    className={`er-lib-section-item${report.id === selectedId ? ' er-lib-section-item--active' : ''}`}
                    onClick={() => {
                      onSelectFolder(folder.id);
                      onSelectReport(report);
                    }}
                    title={report.headline}
                    draggable
                    onDragStart={(event) => handleDragStart(report.id, event)}
                  >
                    {report.headline}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
