import React, { useState, useRef } from 'react';
import { japaneseKifuToSGF } from '../utils/japaneseKifuParser';

interface SGFUploaderProps {
  onFileLoaded: (content: string) => void;
}

const SGFUploader: React.FC<SGFUploaderProps> = ({ onFileLoaded }) => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFileContent = (content: string, filename: string) => {
    try {
      // Check if it's a Japanese kifu format or SGF
      if (content.includes('黒:') || content.includes('黒：') || 
          (content.includes('1.') && (content.includes('黒') || content.includes('白')))) {
        // It's a Japanese kifu format, convert to SGF
        const sgfContent = japaneseKifuToSGF(content);
        onFileLoaded(sgfContent);
      } else if (content.trim().startsWith('(;')) {
        // It's already in SGF format
        onFileLoaded(content);
      } else {
        // Try to guess and convert anyway
        const sgfContent = japaneseKifuToSGF(content);
        onFileLoaded(sgfContent);
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Failed to parse the file. Make sure it\'s a valid SGF or Japanese kifu format.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    
    if (!file) {
      setFileName(null);
      return;
    }
    
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.sgf') && 
        !file.name.toLowerCase().endsWith('.kifu') && 
        !file.name.toLowerCase().endsWith('.txt')) {
      setError('Please upload a .sgf, .kifu, or .txt file');
      setFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      processFileContent(content, file.name);
    };
    
    reader.onerror = () => {
      setError('Error reading file');
    };
    
    reader.readAsText(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.sgf') && 
        !file.name.toLowerCase().endsWith('.kifu') && 
        !file.name.toLowerCase().endsWith('.txt')) {
      setError('Please upload a .sgf, .kifu, or .txt file');
      return;
    }
    
    setFileName(file.name);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      processFileContent(content, file.name);
    };
    
    reader.onerror = () => {
      setError('Error reading file');
    };
    
    reader.readAsText(file);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '25px' 
    }}>
      <div className="upload-container" style={{ 
        display: 'flex', 
        gap: '20px',
        flexDirection: 'row'
      }}>
        {/* File drop area */}
        <div 
          className="drop-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: dragActive ? '2px solid #3498db' : '2px dashed #ccc',
            borderRadius: '8px',
            padding: '30px 15px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragActive ? 'rgba(52, 152, 219, 0.05)' : 'rgba(249, 249, 249, 0.8)',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '180px',
            width: '48%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ 
              marginBottom: '12px', 
              color: dragActive ? '#3498db' : '#aaa',
              transition: 'all 0.2s ease'
            }}
          >
            <path d="M4 16L4 17C4 18.6569 5.34315 20 7 20L17 20C18.6569 20 20 18.6569 20 17L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 4L12 16M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          
          <p className="drop-area-text" style={{ 
            fontWeight: '500', 
            fontSize: 'clamp(16px, 4vw, 20px)', 
            margin: '0 0 8px', 
            color: dragActive ? '#3498db' : '#555' 
          }}>
            Drop SGF or kifu file here
          </p>
          <p style={{ 
            fontSize: 'clamp(14px, 3.5vw, 16px)', 
            color: '#777', 
            margin: '0 0 16px' 
          }}>
            or click to browse
          </p>
          
          {fileName && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              backgroundColor: '#edf8ff',
              padding: '8px 15px',
              borderRadius: '4px',
              marginTop: '10px',
              maxWidth: '100%',
              wordBreak: 'break-word',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M9 15L11 17L15 13M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2Z" stroke="#3498db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontWeight: '500', fontSize: 'clamp(13px, 3.5vw, 15px)' }}>{fileName}</span>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".sgf,.kifu,.txt"
            style={{ display: 'none' }}
          />
        </div>
        
        {/* Text paste area */}
        <div className="text-input-area" style={{ 
          width: '48%',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <label htmlFor="sgfTextInput" style={{ 
              fontWeight: '500', 
              color: '#555', 
              fontSize: '16px' 
            }}>
              Paste SGF or Japanese kifu text:
            </label>
          </div>
          
          <textarea
            id="sgfTextInput"
            className="input-textarea"
            placeholder="Paste kifu content here..."
            style={{
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              resize: 'vertical',
              minHeight: '200px',
              boxSizing: 'border-box',
              width: '100%',
              fontFamily: 'inherit',
              fontSize: '14px',
              backgroundColor: 'rgba(249, 249, 249, 0.8)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
            onChange={(e) => {
              const content = e.target.value;
              if (content.trim()) {
                processFileContent(content, 'clipboard-content.sgf');
              }
            }}
          />
          
          <p style={{ 
            fontSize: '13px',
            color: '#666',
            marginTop: '5px',
            lineHeight: '1.5'
          }}>
            Supports both SGF and Japanese kifu notation. The board will update as you type.
          </p>
        </div>
      </div>
      
      {error && (
        <div className="error" style={{ 
          color: '#e74c3c', 
          padding: '12px 15px', 
          backgroundColor: '#fdedeb', 
          borderRadius: '6px', 
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '10px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16V16.01M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default SGFUploader; 