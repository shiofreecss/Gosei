import React, { useState, useEffect, useRef } from 'react';
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
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [scale, setScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [animationStyle, setAnimationStyle] = useState<'fade' | 'slide' | 'flip' | 'book'>('fade');
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, numPages, isMobile, isFullscreen]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  function handlePageChange(newPage: number) {
    if (newPage < 1 || (numPages && newPage > numPages)) return;
    
    setDirection(newPage > currentPage ? 'forward' : 'backward');
    setIsAnimating(true);
    
    // Wait for animation to start
    setTimeout(() => {
      setCurrentPage(newPage);
      
      // Reset animation after it completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 500); // Match this with CSS animation duration
    }, 50);
  }

  function goToNextPage() {
    if (!numPages) return;
    const increment = isMobile ? 1 : 2;
    // Ensure we don't exceed the total number of pages
    const nextPage = Math.min(currentPage + increment, numPages);
    if (nextPage !== currentPage) {
      handlePageChange(nextPage);
    }
  }

  function goToPreviousPage() {
    const decrement = isMobile ? 1 : 2;
    const prevPage = Math.max(currentPage - decrement, 1);
    if (prevPage !== currentPage) {
      handlePageChange(prevPage);
    }
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
  
  function changeAnimationStyle(style: 'fade' | 'slide' | 'flip' | 'book') {
    setAnimationStyle(style);
  }

  function getFileName() {
    // Clean up and extract just the filename part from the path
    return pdfPath.split('/').pop()?.replace(/^[0-9]+\s-\s/, '') || 'PDF Document';
  }

  function renderPages() {
    if (!numPages) return null;
    
    if (isMobile) {
      // Mobile view: Single page
      return (
        <div 
          className={`pdf-page animation-${animationStyle} ${isAnimating ? `animate-${direction}` : ''}`}
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
      // Desktop view: Two pages side by side
      const leftPage = currentPage;
      const rightPage = currentPage + 1;
      const containerWidth = containerRef.current?.clientWidth || 800;
      const pageWidth = (containerWidth * 0.9) / 2;
      
      return (
        <div 
          className={`pdf-spread animation-${animationStyle} ${isAnimating ? `animate-${direction}` : ''}`}
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
    
    if (isMobile) {
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
              onClick={toggleFullscreen} 
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? "⤦" : "⤢"}
            </button>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>
        
        <div className="pdf-document-container">
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
          
          <div className="animation-controls">
            <button 
              className={`animation-button ${animationStyle === 'fade' ? 'active' : ''}`}
              onClick={() => changeAnimationStyle('fade')} 
              title="Fade Animation"
            >
              Fade
            </button>
            <button 
              className={`animation-button ${animationStyle === 'slide' ? 'active' : ''}`}
              onClick={() => changeAnimationStyle('slide')} 
              title="Slide Animation"
            >
              Slide
            </button>
            <button 
              className={`animation-button ${animationStyle === 'flip' ? 'active' : ''}`}
              onClick={() => changeAnimationStyle('flip')} 
              title="Flip Animation"
            >
              Flip
            </button>
            <button 
              className={`animation-button ${animationStyle === 'book' ? 'active' : ''}`}
              onClick={() => changeAnimationStyle('book')} 
              title="Book Animation"
            >
              Book
            </button>
          </div>
        </div>
        
        <div className="pdf-controls">
          <button 
            onClick={goToPreviousPage} 
            disabled={currentPage <= 1 || isAnimating}
            className="pdf-nav-button"
          >
            ← Previous
          </button>
          
          <span className="pdf-page-info">{getPageInfo()}</span>
          
          <button 
            onClick={goToNextPage} 
            disabled={!numPages || currentPage >= numPages || isAnimating}
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