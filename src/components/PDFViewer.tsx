import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './PDFViewer.css';

// Set up the worker for PDF.js
// Using CDN path for Netlify compatibility
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfPath: string;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfPath, onClose }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [scale, setScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pageInput, setPageInput] = useState<string>('');
  const [displayMode, setDisplayMode] = useState<'single' | 'double'>('double');
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  
  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousPage();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          toggleFullscreen();
        } else {
          onClose();
        }
      } else if (e.key === '+') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === 'f') {
        toggleFullscreen();
      } else if (e.key === 'd') {
        toggleDisplayMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, numPages, isMobile, isFullscreen, displayMode]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
      }
    };

    const containerElement = containerRef.current;
    if (containerElement) {
      containerElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (containerElement) {
        containerElement.removeEventListener('wheel', handleWheel);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle touch events for swipe navigation
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Horizontal swipe if X movement is greater than Y movement
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Minimum swipe distance threshold
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          goToPreviousPage();
        } else {
          goToNextPage();
        }
      }
    }
    
    setTouchStartX(null);
    setTouchStartY(null);
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  function handlePageChange(newPage: number) {
    if (newPage < 1 || (numPages && newPage > numPages)) return;
    
    // Set new page immediately without animation
    setCurrentPage(newPage);
  }

  function goToNextPage() {
    if (!numPages) return;
    const increment = isMobile || displayMode === 'single' ? 1 : 2;
    // Ensure we don't exceed the total number of pages
    const nextPage = Math.min(currentPage + increment, numPages);
    if (nextPage !== currentPage) {
      handlePageChange(nextPage);
    }
  }

  function goToPreviousPage() {
    const decrement = isMobile || displayMode === 'single' ? 1 : 2;
    const prevPage = Math.max(currentPage - decrement, 1);
    if (prevPage !== currentPage) {
      handlePageChange(prevPage);
    }
  }

  function toggleDisplayMode() {
    setDisplayMode(prev => prev === 'single' ? 'double' : 'single');
  }

  function handlePageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPageInput(e.target.value);
  }

  function handlePageInputSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pageNumber = parseInt(pageInput);
    if (!isNaN(pageNumber) && pageNumber >= 1 && numPages && pageNumber <= numPages) {
      handlePageChange(pageNumber);
    }
    setPageInput('');
  }

  function handleZoomIn() {
    setScale(prev => Math.min(prev + 0.1, 2.5));
  }

  function handleZoomOut() {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  }

  function handleZoomReset() {
    setScale(1.0);
  }

  function toggleFullscreen() {
    if (!viewerRef.current) return;
    
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  function getFileName() {
    // Clean up and extract just the filename part from the path
    return pdfPath.split('/').pop()?.replace(/^[0-9]+\s-\s/, '') || 'PDF Document';
  }

  function renderPages() {
    if (!numPages) return null;
    
    if (isMobile || displayMode === 'single') {
      // Mobile or single page view
      return (
        <div 
          className="pdf-page"
          key={currentPage}
          style={{ transform: `scale(${scale})` }}
        >
          <Page 
            pageNumber={currentPage} 
            width={containerRef.current?.clientWidth ? containerRef.current.clientWidth * 0.9 : undefined}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </div>
      );
    } else {
      // Desktop double page view
      const leftPage = currentPage;
      const rightPage = currentPage + 1;
      const containerWidth = containerRef.current?.clientWidth || 800;
      const pageWidth = (containerWidth * 0.9) / 2;
      
      return (
        <div 
          className="pdf-spread"
          key={`${leftPage}-${rightPage}`}
          style={{ transform: `scale(${scale})` }}
        >
          {leftPage <= numPages && (
            <div className="pdf-page left-page">
              <Page 
                pageNumber={leftPage} 
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          )}
          
          {rightPage <= numPages && (
            <div className="pdf-page right-page">
              <Page 
                pageNumber={rightPage} 
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          )}
        </div>
      );
    }
  }

  function getPageInfo() {
    if (!numPages) return '';
    
    if (isMobile || displayMode === 'single') {
      return `Page ${currentPage} of ${numPages}`;
    } else {
      const rightPage = currentPage + 1;
      if (rightPage <= numPages) {
        return `Pages ${currentPage}-${rightPage} of ${numPages}`;
      } else {
        return `Page ${currentPage} of ${numPages}`;
      }
    }
  }

  // Make sure pdfPath is properly encoded and prefixed if needed
  const fileUrl = pdfPath.startsWith('http') ? 
    pdfPath : 
    // For relative paths, ensure they work with Netlify's base path
    pdfPath.startsWith('/') ? pdfPath : `/${pdfPath.replace(/^\.\//, '')}`;

  return (
    <div className={`pdf-viewer-overlay ${isFullscreen ? 'fullscreen' : ''}`} ref={viewerRef}>
      <div className="pdf-viewer-container" ref={containerRef}>
        <div className="pdf-viewer-header">
          <h2>{getFileName()}</h2>
          <div className="pdf-header-controls">
            <button 
              className="header-button" 
              onClick={toggleDisplayMode}
              title={displayMode === 'single' ? "Switch to double page view" : "Switch to single page view"}
            >
              {displayMode === 'single' ? "⫸⫷" : "⫸"}
            </button>
            <button 
              className="header-button" 
              onClick={toggleFullscreen} 
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? "⤦" : "⤢"}
            </button>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>
        
        <div 
          className="pdf-document-container" 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {isLoading && (
            <div className="pdf-loading">
              <div className="pdf-loading-spinner"></div>
              <p>Loading document...</p>
            </div>
          )}
          
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="pdf-loading">Loading...</div>}
            error={<div className="pdf-error">Failed to load PDF. Please try again.</div>}
          >
            {renderPages()}
          </Document>
          
          <div className="zoom-controls">
            <button className="zoom-button" onClick={handleZoomOut} title="Zoom Out">−</button>
            <button className="zoom-button" onClick={handleZoomReset} title="Reset Zoom">⟲</button>
            <button className="zoom-button" onClick={handleZoomIn} title="Zoom In">+</button>
          </div>
        </div>
        
        <div className="pdf-controls">
          <button 
            onClick={goToPreviousPage} 
            disabled={currentPage <= 1}
            className="pdf-nav-button"
          >
            ← Previous
          </button>
          
          <span className="pdf-page-info">{getPageInfo()}</span>
          
          <form onSubmit={handlePageInputSubmit} className="go-to-page-form">
            <input
              type="number"
              placeholder="Page..."
              value={pageInput}
              onChange={handlePageInputChange}
              min={1}
              max={numPages || undefined}
              className="page-input"
            />
            <button type="submit" className="go-button">Go</button>
          </form>
          
          <button 
            onClick={goToNextPage} 
            disabled={!numPages || currentPage >= numPages}
            className="pdf-nav-button"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer; 