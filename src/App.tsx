import React, { useState, useEffect } from 'react';
import './App.css';
import KifuReader from './components/KifuReader';
import SGFUploader from './components/SGFUploader';
import GameLibrary from './components/GameLibrary';
import GameViewer from './components/GameViewer';
import MusicPlayer from './components/MusicPlayer';

function App() {
  const [showLibrary, setShowLibrary] = useState(false);
  const [sgfContent, setSgfContent] = useState<string | null>(null);
  const [isFromUpload, setIsFromUpload] = useState(false);
  const [showGameViewer, setShowGameViewer] = useState(false);
  const [gameViewerContent, setGameViewerContent] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFileLoaded = (content: string) => {
    setSgfContent(content);
    setIsFromUpload(true);
    // Hide library if it's open
    if (showLibrary) {
      setShowLibrary(false);
    }
  };

  const handleGameSelected = (content: string) => {
    // Don't display the board directly, just store the content and show the game viewer
    setGameViewerContent(content);
    setShowGameViewer(true);
  };

  const handleCloseGameViewer = () => {
    setShowGameViewer(false);
  };

  // Sample SGF content
  const sampleSGF = `(;GM[1]FF[4]CA[UTF-8]AP[CGoban:3]ST[2]
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
)`;

  return (
    <div className="App" style={{ 
      background: `
        linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(240, 245, 255, 0.88)),
        url("data:image/svg+xml,%3Csvg viewBox='0 0 2000 2000' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch' seed='0'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"),
        linear-gradient(135deg, #f5f7fa, #e8ecf3)
      `,
      backgroundAttachment: 'fixed',
      backgroundBlendMode: 'soft-light, normal, normal',
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
        background: 'linear-gradient(135deg, rgba(60, 70, 90, 0.9), rgba(40, 50, 70, 0.85))',
        backdropFilter: 'blur(10px)',
        padding: '20px 0', 
        color: 'white',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ 
          maxWidth: '1250px', 
          margin: '0 auto', 
          padding: '0 20px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '32px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)'
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', gap: '10px' }}>
            <button 
              onClick={() => setShowLibrary(!showLibrary)}
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
              {showLibrary ? 'Hide Library' : 'Game Library'}
            </button>
            <button 
              onClick={() => setShowHelp(!showHelp)}
              style={{ 
                backgroundColor: showHelp ? 'rgba(100, 120, 180, 0.8)' : 'rgba(70, 90, 150, 0.6)',
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
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 17V17.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 13.5C11.9816 13.1754 12.0692 12.8536 12.2493 12.5803C12.4295 12.307 12.6933 12.0976 13 11.98C13.3759 11.8387 13.7132 11.6146 13.9856 11.3236C14.2579 11.0326 14.4577 10.6826 14.5693 10.3028C14.6809 9.92297 14.7015 9.52366 14.6292 9.13421C14.5568 8.74476 14.3937 8.37609 14.1537 8.05731C13.9138 7.73853 13.6031 7.47569 13.2457 7.28882C12.8883 7.10194 12.4934 6.99602 12.09 6.98C11.6924 6.96285 11.2961 7.03498 10.9279 7.19192C10.5597 7.34887 10.2279 7.58696 9.95462 7.89C9.68139 8.19303 9.47359 8.55392 9.34566 8.94675C9.21774 9.33958 9.17287 9.75451 9.21427 10.165" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {showHelp ? 'Hide Help' : 'Show Help'}
            </button>
          </div>
        </div>
      </header>
      
      <main style={{ 
        maxWidth: '1250px', 
        margin: '0 auto', 
        padding: '30px 20px',
        flex: '1 0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {showLibrary ? (
          <GameLibrary onSelectGame={handleGameSelected} />
        ) : (
          <>
            {sgfContent && isFromUpload ? (
              <KifuReader sgfContent={sgfContent} />
            ) : (
              <>
                <p style={{ 
                  fontSize: '17px', 
                  marginBottom: '30px',
                  color: '#333',
                  lineHeight: '1.6',
                  textShadow: '0 1px 1px rgba(255, 255, 255, 0.8)'
                }}>
                  Welcome to Gosei Kifu! An open-source application dedicated to the Go community. Upload a Go game record (SGF file), paste SGF content below, or browse the extensive game library to analyze and review games with our intuitive tools.
                </p>
                
                {showHelp && (
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    padding: '25px', 
                    borderRadius: '12px',
                    marginBottom: '30px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    width: '100%'
                  }}>
                    <h2 style={{ 
                      color: '#2a3f6a',
                      fontSize: '22px',
                      marginTop: 0,
                      marginBottom: '15px',
                      fontWeight: 600
                    }}>
                      How to Use Gosei Kifu
                    </h2>
                    <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                      Gosei Kifu supports both standard SGF files and traditional Japanese kifu format. Japanese kifu typically follow this structure:
                    </p>
                    
                    <pre style={{ 
                      background: 'rgba(245, 248, 255, 0.7)', 
                      padding: '15px', 
                      borderRadius: '10px',
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      border: '1px solid rgba(200, 210, 230, 0.5)',
                      backdropFilter: 'blur(5px)',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.03)'
                    }}>
{`# 棋譜（Japanese Kifu Format）
# 黒：Player Black
# 白：Player White
# 日付: 2023-04-06
# 結果: 黒の中押し勝ち

1. 黒: Q16
2. 白: D4
3. 黒: Q4
...`}
                    </pre>
                    
                    <h3 style={{ fontSize: '18px', marginTop: '20px', color: '#444' }}>Key elements of Japanese kifu:</h3>
                    <ul style={{ 
                      listStyleType: 'none', 
                      padding: 0, 
                      margin: '15px 0', 
                      lineHeight: '1.6' 
                    }}>
                      <li style={{ 
                        padding: '8px 0 8px 25px', 
                        position: 'relative' 
                      }}>
                        <span style={{ 
                          position: 'absolute', 
                          left: 0, 
                          top: '9px',
                          width: '12px',
                          height: '12px',
                          backgroundColor: 'black',
                          borderRadius: '50%'
                        }}></span>
                        Header information with # prefix, containing player names, date, and result
                      </li>
                      <li style={{ 
                        padding: '8px 0 8px 25px', 
                        position: 'relative' 
                      }}>
                        <span style={{ 
                          position: 'absolute', 
                          left: 0, 
                          top: '9px',
                          width: '12px',
                          height: '12px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          border: '1px solid #ddd'
                        }}></span>
                        Moves are numbered sequentially, with color (黒/白 for black/white) and coordinates
                      </li>
                      <li style={{ 
                        padding: '8px 0 8px 25px', 
                        position: 'relative' 
                      }}>
                        <span style={{ 
                          position: 'absolute', 
                          left: 0, 
                          top: '9px',
                          width: '12px',
                          height: '12px',
                          backgroundColor: '#f0f0f0',
                          borderRadius: '3px',
                          border: '1px solid #ddd'
                        }}></span>
                        Coordinates use letters (A-T, excluding I) for columns and numbers (1-19) for rows
                      </li>
                    </ul>
                    
                    <p style={{ 
                      padding: '12px', 
                      background: 'rgba(220, 240, 255, 0.6)', 
                      borderLeft: '4px solid #3498db',
                      borderRadius: '8px',
                      color: '#2a4a6a',
                      marginTop: '15px',
                      backdropFilter: 'blur(5px)'
                    }}>
                      Our parser automatically converts Japanese kifu format to SGF for rendering on the board.
                    </p>
                  </div>
                )}
                
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
                      <div className="go-image-container" style={{ 
                        marginTop: '30px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        transition: 'all 0.3s ease'
                      }}>
                        <img 
                          src="/game-of-go-2.jpg" 
                          alt="Traditional Go painting" 
                          className="go-game-image"
                          style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block'
                          }}
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            // Fallback to placeholder if image doesn't load
                            e.currentTarget.src = "https://via.placeholder.com/600x400?text=Go+Painting";
                          }}
                        />
                        <div style={{
                          padding: '10px 15px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(5px)',
                          borderTop: '1px solid rgba(200, 210, 230, 0.5)',
                          fontSize: '14px',
                          color: '#444',
                          textAlign: 'center'
                        }}>
                          Traditional Go painting showing players engaged in the ancient game
                        </div>
                      </div>
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
                      <div className="go-image-container" style={{ 
                        marginTop: '30px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        transition: 'all 0.3s ease'
                      }}>
                        <img 
                          src="/game-of-go.jpg" 
                          alt="Game of Go board with stones" 
                          className="go-game-image"
                          style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block'
                          }}
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            // Fallback to placeholder if image doesn't load
                            e.currentTarget.src = "https://via.placeholder.com/600x400?text=Game+of+Go";
                          }}
                        />
                        <div style={{
                          padding: '10px 15px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(5px)',
                          borderTop: '1px solid rgba(200, 210, 230, 0.5)',
                          fontSize: '14px',
                          color: '#444',
                          textAlign: 'center'
                        }}>
                          Game of Go - one of the oldest board games still played today
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
      
      {/* Game Viewer Modal - shows when a game is selected from library */}
      {showGameViewer && (
        <GameViewer 
          sgfContent={gameViewerContent}
          onClose={handleCloseGameViewer}
        />
      )}

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
                      href="https://github.com/shiofreecss/AI-Kifu" 
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
                Powered by <a href="https://beaver.foundation" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>Beaver Foundation</a>
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
