'use client';

import { SpecialZoomLevel, Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { toolbarPlugin, type TransformToolbarSlot } from '@react-pdf-viewer/toolbar';

interface LibraryPdfViewerClientProps {
  fileUrl: string;
  theme?: 'light' | 'dark';
}

export default function LibraryPdfViewerClient({ fileUrl, theme = 'light' }: LibraryPdfViewerClientProps) {
  const toolbarPluginInstance = toolbarPlugin();
  const { renderDefaultToolbar } = toolbarPluginInstance;
  const transformToolbarSlot: TransformToolbarSlot = (slot) => ({
    ...slot,
    Download: () => <></>,
    DownloadMenuItem: () => <></>,
    Open: () => <></>,
    OpenMenuItem: () => <></>,
    Print: () => <></>,
    PrintMenuItem: () => <></>,
  });
  const viewerPlugin = defaultLayoutPlugin({
    renderToolbar: (Toolbar) => (
      <Toolbar>{renderDefaultToolbar(transformToolbarSlot)}</Toolbar>
    ),
  });

  return (
    <div className="er-pdf-viewer-shell">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={fileUrl}
          defaultScale={SpecialZoomLevel.PageFit}
          plugins={[viewerPlugin]}
          theme={theme}
        />
      </Worker>
    </div>
  );
}
