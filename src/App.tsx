import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './App.css';
import KifuReader from './components/KifuReader';
import SGFUploader from './components/SGFUploader';
import GameLibrary from './components/GameLibrary';
import GameViewer from './components/GameViewer';
import MusicPlayer from './components/MusicPlayer';
import BookLibrary from './components/BookLibrary';
import OptimizedImage from './components/OptimizedImage';

function App() {
  const [showLibrary, setShowLibrary] = useState(false);
  const [showBookLibrary, setShowBookLibrary] = useState(false);
  const [sgfContent, setSgfContent] = useState<string | null>(null);
  const [isFromUpload, setIsFromUpload] = useState(false);
  const [showGameViewer, setShowGameViewer] = useState(false);
  const [gameViewerContent, setGameViewerContent] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleFileLoaded = useCallback((content: string) => {
    // When a file is loaded, open it in the GameViewer and store the content
    setGameViewerContent(content);
    setSgfContent(content); // Store the content for potential future use
    setShowGameViewer(true); // Show the game viewer immediately
    setIsFromUpload(true);   // Mark that this content came from an upload
    
    // If user is viewing the library, keep it open behind the GameViewer
    // This allows them to go back to the library after closing the viewer
  }, []);

  const handleGameSelected = useCallback((content: string) => {
    setGameViewerContent(content);
    setShowGameViewer(true);
  }, []);

  const handleCloseGameViewer = useCallback(() => {
    setShowGameViewer(false);
  }, []);

  const handleShowBookLibrary = useCallback(() => {
    setShowBookLibrary(true);
    // Hide other components when showing book library
    if (showLibrary) setShowLibrary(false);
    if (showGameViewer) setShowGameViewer(false);
  }, [showLibrary, showGameViewer]);
  
  const handleCloseBookLibrary = useCallback(() => {
    setShowBookLibrary(false);
  }, []);

  const handleShowGameLibrary = useCallback(() => {
    setShowLibrary(!showLibrary);
    // Hide book library when showing game library
    if (showBookLibrary) setShowBookLibrary(false);
  }, [showLibrary, showBookLibrary]);

  // Memoize the sample SGF content since it never changes
  const sampleSGF = useMemo(() => `(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]
RU[Japanese]SZ[19]KM[6.50]
PW[White Player]PB[Black Player]
;B[pd]C[This is the first move.]
;W[dp]
;B[pp]
;W[dd]
;B[fc]
;W[cf]
;B[jd]
;W[qf]
;B[qh]
;W[qc]
;B[pc]
;W[qd]
;B[pe]
;W[pf]
;B[qj]
)`, []);

  // Memoize style objects to prevent unnecessary re-renders
  const containerStyle = useMemo(() => ({
    maxWidth: '1250px', 
    margin: '0 auto', 
    padding: '0 20px',
    width: '100%',
    boxSizing: 'border-box' as const
  }), []);

  const mainStyle = useMemo(() => ({
    maxWidth: '1250px', 
    margin: '0 auto', 
    padding: '30px 20px',
    flex: '1 0 auto',
    width: '100%',
    boxSizing: 'border-box' as const
  }), []);

  return (
    <div className="App" style={{ 
      background: windowWidth <= 768 ? 
        'linear-gradient(135deg, #f5f7fa, #e8ecf3)' : 
        `
        linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(240, 245, 255, 0.88)),
        url("data:image/svg+xml,%3Csvg viewBox='0 0 2000 2000' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch' seed='0'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"),
        linear-gradient(135deg, #f5f7fa, #e8ecf3)
      `,
      backgroundAttachment: windowWidth <= 768 ? 'initial' : 'fixed',
      backgroundBlendMode: windowWidth <= 768 ? 'normal' : 'soft-light, normal, normal',
      minHeight: '100vh',
      fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      color: '#2a2a2a'
    }}>
      <header style={{ 
        background: windowWidth <= 768 ? 
          'rgba(40, 50, 70, 0.95)' : 
          'linear-gradient(135deg, rgba(60, 70, 90, 0.9), rgba(40, 50, 70, 0.85))',
        backdropFilter: windowWidth <= 768 ? 'none' : 'blur(10px)',
        padding: '20px 0', 
        color: 'white',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          ...containerStyle,
          display: 'flex',
          flexDirection: windowWidth <= 768 ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '32px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer'
          }}
          onClick={() => {
            setShowBookLibrary(false);
            setShowLibrary(false);
            setShowGameViewer(false);
          }}>
            <span style={{ 
              display: 'inline-block', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: '#000', 
              border: '2px solid #fff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}></span>
            Gosei
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'normal', 
              opacity: 0.9, 
              marginLeft: '10px' 
            }}>
              Go Game Analysis Tool
            </span>
          </h1>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '10px',
            marginTop: windowWidth <= 768 ? '10px' : '0',
            flexWrap: 'wrap' 
          }}>
            <button 
              onClick={() => {
                setShowBookLibrary(false);
                setShowLibrary(false);
                setShowGameViewer(false);
              }}
              style={{ 
                backgroundColor: (!showBookLibrary && !showLibrary && !showGameViewer) ? 'rgba(100, 120, 180, 0.8)' : 'rgba(70, 90, 150, 0.6)',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '8px 15px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: windowWidth <= 768 ? 'none' : 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12h6v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Home
            </button>
            <button 
              onClick={() => {
                if (showLibrary) setShowLibrary(false);
                setShowBookLibrary(!showBookLibrary);
              }}
              style={{ 
                backgroundColor: showBookLibrary ? 'rgba(100, 120, 180, 0.8)' : 'rgba(70, 90, 150, 0.6)',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '8px 15px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H8V20H4V4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H12V4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Book Library
            </button>
            <button 
              onClick={() => {
                if (showBookLibrary) setShowBookLibrary(false);
                setShowLibrary(!showLibrary);
              }}
              style={{ 
                backgroundColor: showLibrary ? 'rgba(100, 120, 180, 0.8)' : 'rgba(70, 90, 150, 0.6)',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '8px 15px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Game Library
            </button>
          </div>
        </div>
      </header>
      
      <main style={mainStyle}>
        {/* Conditional rendering for Book Library */}
        {showBookLibrary && <BookLibrary />}

        {/* Conditional rendering for Game Library */}
        {showLibrary && <GameLibrary onSelectGame={handleGameSelected} />}

        {/* Conditional rendering for Game Viewer */}
        {showGameViewer && (
          <GameViewer 
            sgfContent={gameViewerContent} 
            onClose={handleCloseGameViewer} 
          />
        )}
        
        {!showLibrary && !showBookLibrary && (
          <>
            <div className="uploader-section" style={{ marginBottom: '40px' }}>
              <p style={{ 
                fontSize: '17px', 
                marginBottom: '30px',
                color: '#333',
                lineHeight: '1.6',
                textShadow: '0 1px 1px rgba(255, 255, 255, 0.8)'
              }}>
                Welcome to Gosei Kifu! An open-source application dedicated to the Go community. Upload a Go game record (SGF file), paste SGF content below, or browse the extensive game library to analyze and review games with our intuitive tools.
              </p>
              
              <div style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '12px',
                marginBottom: '30px',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.6)'
              }}>
                <h3 style={{ 
                  color: '#2a3f6a',
                  fontSize: '20px',
                  marginTop: 0,
                  marginBottom: '15px',
                  fontWeight: 600
                }}>
                  Instructions
                </h3>
                <ul style={{ 
                  lineHeight: '1.6', 
                  listStyleType: 'none',
                  padding: 0, 
                  margin: '0',
                  color: '#333' 
                }}>
                  <li style={{ marginBottom: '10px' }}>Upload your SGF file using the form below</li>
                  <li style={{ marginBottom: '10px' }}>
                    Use the <button 
                      onClick={() => {
                        if (showLibrary) setShowLibrary(false);
                        setShowBookLibrary(true);
                      }}
                      style={{
                        backgroundColor: 'rgba(70, 90, 150, 0.6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'inline-block'
                      }}
                    >Book Library</button> to access study materials
                  </li>
                  <li style={{ marginBottom: '10px' }}>
                    Browse the <button 
                      onClick={() => {
                        if (showBookLibrary) setShowBookLibrary(false);
                        setShowLibrary(true);
                      }}
                      style={{
                        backgroundColor: 'rgba(70, 90, 150, 0.6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'inline-block'
                      }}
                    >Game Library</button> for professional games to study
                  </li>
                  <li style={{ marginBottom: '10px' }}>Navigate moves using arrow keys or the control panel</li>
                  <li>View variations and comments when available</li>
                </ul>
              </div>
              
              <h2 style={{ 
                fontSize: '24px', 
                color: '#2a3f6a', 
                marginBottom: '20px', 
                marginTop: '40px',
                fontWeight: '600',
                textShadow: '0 1px 1px rgba(255, 255, 255, 0.8)'
              }}>
                Upload SGF File
              </h2>
              <SGFUploader onFileLoaded={handleFileLoaded} />
              
              {/* Go Game Instructions and History Section */}
              <div style={{
                marginTop: '60px',
                borderTop: '1px solid rgba(200, 210, 230, 0.5)',
                paddingTop: '30px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  color: '#2a3f6a',
                  marginBottom: '20px',
                  fontWeight: '600',
                  textShadow: '0 1px 1px rgba(255, 255, 255, 0.8)'
                }}>
                  About the Game of Go
                </h2>
                
                <div style={{
                  display: 'flex',
                  flexDirection: windowWidth <= 768 ? 'column' : 'row',
                  gap: '30px',
                  marginBottom: '40px'
                }}>
                  <div style={{
                    flex: '1',
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    padding: '25px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.6)'
                  }}>
                    <h3 style={{ fontSize: '20px', marginTop: 0, marginBottom: '15px', color: '#2a3f6a', fontWeight: '600', textAlign: 'center' }}>
                      The Rules of Go
                    </h3>
                    
                    <p style={{ lineHeight: '1.6', marginBottom: '15px', color: '#333', textAlign: 'center' }}>
                      Go is played on a grid of black lines (usually 19×19). Game pieces, called stones, are played on the intersections of the lines.
                    </p>
                    
                    <h4 style={{ fontSize: '17px', marginBottom: '10px', marginTop: '20px', color: '#2a3f6a', textAlign: 'center' }}>Basic Rules:</h4>
                    <ul style={{ lineHeight: '1.6', paddingLeft: '20px', color: '#333', textAlign: 'left' }}>
                      <li>Players take turns placing stones on the board</li>
                      <li>Black plays first, then White</li>
                      <li>Stones cannot be moved once placed</li>
                      <li>Stones are captured when completely surrounded by opponent's stones</li>
                      <li>The goal is to control more territory than your opponent</li>
                      <li>The game ends when both players pass their turn</li>
                    </ul>
                    
                    <h4 style={{ fontSize: '17px', marginBottom: '10px', marginTop: '20px', color: '#2a3f6a', textAlign: 'center' }}>Key Concepts:</h4>
                    <ul style={{ lineHeight: '1.6', paddingLeft: '20px', color: '#333', textAlign: 'left' }}>
                      <li><strong>Liberty:</strong> An empty adjacent point next to a stone</li>
                      <li><strong>Capture:</strong> Removing opponent's stones that have no liberties</li>
                      <li><strong>Territory:</strong> Empty intersections surrounded by your stones</li>
                      <li><strong>Ko rule:</strong> Prevents infinite capturing cycles</li>
                    </ul>
                    
                    {/* Go Painting Image - moved to bottom */}
                    <OptimizedImage 
                      src="/game-of-go-2.jpg"
                      alt="Traditional Go painting"
                      caption="Traditional Go painting showing players engaged in the ancient game"
                      isMobile={windowWidth <= 768}
                      fallbackSrc="https://via.placeholder.com/600x400?text=Go+Painting"
                    />
                  </div>
                  
                  <div style={{
                    flex: '1',
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    padding: '25px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.6)'
                  }}>
                    <h3 style={{ fontSize: '20px', marginTop: 0, marginBottom: '15px', color: '#2a3f6a', fontWeight: '600', textAlign: 'center' }}>
                      History of Go
                    </h3>
                    
                    <p style={{ lineHeight: '1.6', marginBottom: '15px', color: '#333', textAlign: 'center' }}>
                      Go originated in China more than 2,500 years ago and is believed to be the oldest board game continuously played today.
                    </p>
                    
                    <h4 style={{ fontSize: '17px', marginBottom: '10px', marginTop: '20px', color: '#2a3f6a', textAlign: 'center' }}>Historical Timeline:</h4>
                    <ul style={{ lineHeight: '1.6', paddingLeft: '20px', color: '#333', textAlign: 'left' }}>
                      <li><strong>500-300 BCE:</strong> Earliest evidence of Go in China</li>
                      <li><strong>7th Century:</strong> Introduced to Japan, where it flourished</li>
                      <li><strong>17th Century:</strong> Development of the four major Go schools in Japan</li>
                      <li><strong>1920s:</strong> First international Go tournaments</li>
                      <li><strong>1990s:</strong> Growing popularity in Western countries</li>
                      <li><strong>2016:</strong> AlphaGo defeats world champion Lee Sedol</li>
                    </ul>
                    
                    <p style={{ lineHeight: '1.6', marginTop: '20px', color: '#333', textAlign: 'center' }}>
                      Go has been considered not just a game, but an art form and martial art of the mind. It has been the subject of countless books, poems, and philosophical discussions throughout Asian history.
                      The elegant simplicity of its rules contrasted with the profound strategic depth has made Go a metaphor for life in many Eastern philosophical traditions.
                    </p>

                    {/* Go Game Image - moved to bottom */}
                    <OptimizedImage 
                      src="/game-of-go.jpg"
                      alt="Game of Go board with stones"
                      caption="Game of Go - one of the oldest board games still played today"
                      isMobile={windowWidth <= 768}
                      fallbackSrc="https://via.placeholder.com/600x400?text=Game+of+Go"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      
      {/* Music Player floating button */}
      <MusicPlayer />
      
      <footer style={{
        background: 'linear-gradient(135deg, rgba(60, 70, 90, 0.9), rgba(40, 50, 70, 0.85))',
        backdropFilter: 'blur(10px)',
        color: 'white',
        padding: '25px 0',
        marginTop: 'auto',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        flexShrink: 0,
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '0 20px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '15px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: '500', textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)' }}>Gosei Kifu</p>
                <p style={{ margin: '0', opacity: '0.9', maxWidth: '500px' }}>
                  An open-source application dedicated to the Go community. Built to provide free access to Go game analysis and a comprehensive SGF library.
                </p>
              </div>
              <div style={{ minWidth: '200px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: '500', textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)' }}>Resources</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 auto', opacity: '0.9' }}>
                  <li style={{ marginBottom: '5px' }}>
                    <a 
                      href="https://homepages.cwi.nl/~aeb/go/games/games/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ 
                        color: 'white', 
                        textDecoration: 'none', 
                        transition: 'opacity 0.2s ease'
                      }}
                      className="hover-link"
                    >
                      SGF Game Collection
                    </a>
                  </li>
                  <li style={{ marginBottom: '5px' }}>
                    <a 
                      href="https://github.com/shiofreecss/Gosei-Kifu" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ 
                        color: 'white', 
                        textDecoration: 'none', 
                        transition: 'opacity 0.2s ease'
                      }}
                      className="hover-link"
                    >
                      GitHub Repository
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div style={{ 
              borderTop: '1px solid rgba(255,255,255,0.2)', 
              paddingTop: '15px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <p style={{ margin: '0', opacity: '0.9' }}>
                © {new Date().getFullYear()} Gosei Kifu
              </p>
              <p style={{ margin: '0', opacity: '0.9' }}>
                Developed by <a href="https://hello.shiodev.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>Shiodev</a>
              </p>
              <p style={{ margin: '0', opacity: '0.9', fontSize: '12px' }}>
                Game data sourced from <a href="https://homepages.cwi.nl/~aeb/go/games/games/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>homepages.cwi.nl/~aeb/go/games/games</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
