import React, { useState, useEffect } from 'react';
import { 
  mainCategories, 
  Tournament, 
  getTournamentsByCategory, 
  getAllTournaments,
  GameInfo, 
  parseGameIndex,
  loadSgfByPath,
  preloadTournamentGames,
  TournamentCategory,
  TournamentSubcategory,
  getTournamentsBySubcategory,
  getAllSubcategories
} from '../utils/gameLibrary';

interface GameLibraryProps {
  onSelectGame: (sgfContent: string) => void;
}

const GameLibrary: React.FC<GameLibraryProps> = ({ onSelectGame }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<Record<string, Tournament[]>>({});
  const [subcategoryTournaments, setSubcategoryTournaments] = useState<Record<string, Tournament[]>>({});
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGames, setFilteredGames] = useState<GameInfo[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage, setGamesPerPage] = useState(20);
  const [cachedGamesByTournament, setCachedGamesByTournament] = useState<Record<string, GameInfo[]>>({});
  
  // Load all tournaments on component mount
  useEffect(() => {
    const loadAllTournaments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load all tournaments
        const allTournamentsData = await getAllTournaments();
        setAllTournaments(allTournamentsData);
        
        // Load tournaments by category
        const tournamentsByCategory: Record<string, Tournament[]> = {};
        
        // Initialize with empty arrays for each category
        mainCategories.forEach(category => {
          tournamentsByCategory[category.id] = [];
        });
        
        // Load each category's tournaments
        for (const category of mainCategories) {
          const categoryTournaments = await getTournamentsByCategory(category.id);
          tournamentsByCategory[category.id] = categoryTournaments;
        }
        
        setTournaments(tournamentsByCategory);
        
        // Initialize subcategory tournaments
        const subcategoryTours: Record<string, Tournament[]> = {};
        for (const category of mainCategories) {
          if (category.subcategories) {
            for (const subcategory of category.subcategories) {
              const subcatId = `${category.id}_${subcategory.id}`;
              const subcatTournaments = await getTournamentsBySubcategory(category.id, subcategory.id);
              subcategoryTours[subcatId] = subcatTournaments;
              
              // Initialize this subcategory as expanded
              setExpandedSubcategories(prev => ({
                ...prev,
                [subcatId]: false
              }));
            }
          }
        }
        
        setSubcategoryTournaments(subcategoryTours);
        
        // Initialize all categories as expanded
        const initialExpandedState: Record<string, boolean> = {};
        mainCategories.forEach(category => {
          initialExpandedState[category.id] = true;
        });
        setExpandedCategories(initialExpandedState);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading tournaments:', error);
        setError('Failed to load tournaments. Please try again later.');
        setLoading(false);
      }
    };
    
    loadAllTournaments();
  }, []);
  
  // Load games when tournament changes
  useEffect(() => {
    const loadGames = async () => {
      if (!selectedTournament) {
        setGames([]);
        setFilteredGames([]);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Reset to first page when changing tournaments
        setCurrentPage(1);
        
        // Check if games for this tournament are already cached
        if (cachedGamesByTournament[selectedTournament.id]) {
          setGames(cachedGamesByTournament[selectedTournament.id]);
          setFilteredGames(cachedGamesByTournament[selectedTournament.id]);
          setLoading(false);
          
          // Preload SGF files in the background for this tournament
          preloadTournamentGames(selectedTournament.path).catch(console.error);
          return;
        }
        
        const gameList = await parseGameIndex(selectedTournament.path);
        setGames(gameList);
        setFilteredGames(gameList);
        
        // Cache the game list for this tournament
        setCachedGamesByTournament(prev => ({
          ...prev,
          [selectedTournament.id]: gameList
        }));
        
        setLoading(false);
        
        // Preload SGF files in the background
        preloadTournamentGames(selectedTournament.path).catch(console.error);
      } catch (error) {
        console.error('Error loading games:', error);
        setError(`Failed to load games for ${selectedTournament.name}. Please try again later.`);
        setLoading(false);
      }
    };
    
    loadGames();
  }, [selectedTournament]);
  
  // Filter games when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGames(games);
    } else {
      const search = searchTerm.toLowerCase();
      const filtered = games.filter(game => 
        game.title.toLowerCase().includes(search) ||
        game.players.some(player => player.toLowerCase().includes(search)) ||
        game.date.toLowerCase().includes(search) ||
        game.result.toLowerCase().includes(search)
      );
      
      setFilteredGames(filtered);
    }
    
    // Reset to first page when filtering changes
    setCurrentPage(1);
  }, [searchTerm, games]);
  
  // Get current games to display based on pagination
  const getCurrentPageGames = () => {
    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    return filteredGames.slice(indexOfFirstGame, indexOfLastGame);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  
  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  // Handle tournament selection
  const handleTournamentSelect = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setSearchTerm(''); // Clear search term when changing tournaments
  };
  
  // Handle game selection
  const handleGameSelect = async (game: GameInfo) => {
    try {
      setLoading(true);
      setError(null);
      
      const sgfContent = await loadSgfByPath(game.path);
      onSelectGame(sgfContent);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading SGF file:', error);
      setError(`Failed to load game file. Please try again later.`);
      setLoading(false);
    }
  };
  
  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  // Toggle subcategory expansion
  const toggleSubcategoryExpansion = (subcategoryId: string) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setSelectedTournament(null);
  };
  
  // Handle subcategory selection
  const handleSubcategorySelect = (categoryId: string, subcategoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId);
    setSelectedTournament(null);
  };
  
  // Filtered tournaments based on selected category and subcategory
  const filteredTournaments = selectedSubcategory 
    ? subcategoryTournaments[`${selectedCategory}_${selectedSubcategory}`] || []
    : selectedCategory === 'all'
      ? allTournaments
      : tournaments[selectedCategory] || [];
  
  // Get games for current page
  const currentGames = getCurrentPageGames();
  
  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '20px',
        marginBottom: '15px',
        gap: '10px'
      }}>
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          style={{
            padding: '5px 10px',
            backgroundColor: currentPage === 1 ? '#f0f0f0' : '#4CAF50',
            color: currentPage === 1 ? '#999' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentPage === 1 ? 'default' : 'pointer',
            fontSize: '14px'
          }}
        >
          &laquo; Prev
        </button>
        
        <span style={{ fontSize: '14px' }}>
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          style={{
            padding: '5px 10px',
            backgroundColor: currentPage === totalPages ? '#f0f0f0' : '#4CAF50',
            color: currentPage === totalPages ? '#999' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentPage === totalPages ? 'default' : 'pointer',
            fontSize: '14px'
          }}
        >
          Next &raquo;
        </button>
        
        <div style={{
          marginLeft: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span style={{ fontSize: '14px' }}>Games per page:</span>
          <select
            value={gamesPerPage}
            onChange={(e) => {
              setGamesPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    );
  };
  
  // Render game list
  const renderGameList = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading games...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div style={{ 
          backgroundColor: '#ffebee', 
          padding: '20px', 
          borderRadius: '4px',
          color: '#c62828'
        }}>
          <p>{error}</p>
        </div>
      );
    }
    
    if (currentGames.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No games found. {searchTerm ? 'Try a different search term.' : ''}</p>
        </div>
      );
    }
    
    return (
      <div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr',
          gap: '10px',
          marginBottom: '20px'
        }}>
          {currentGames.map(game => (
            <div 
              key={game.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '4px',
                padding: '15px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                border: '1px solid #e0e0e0'
              }}
              onClick={() => handleGameSelect(game)}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center', 
                marginBottom: '8px' 
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  {game.title}
                </h3>
                <span style={{ 
                  fontSize: '14px',
                  color: '#777',
                  fontWeight: '500'
                }}>
                  {game.date}
                </span>
              </div>
              
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '5px',
                fontSize: '14px'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span style={{ 
                    width: '12px',
                    height: '12px',
                    backgroundColor: 'black',
                    borderRadius: '50%',
                    display: 'inline-block'
                  }}></span>
                  <span>{game.players[0] || 'Unknown'}</span>
                </div>
                <span style={{ color: '#999' }}>vs</span>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span style={{ 
                    width: '12px',
                    height: '12px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    border: '1px solid #ddd',
                    display: 'inline-block'
                  }}></span>
                  <span>{game.players[1] || 'Unknown'}</span>
                </div>
              </div>
              
              {game.result && (
                <div style={{ 
                  color: '#555',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ fontWeight: '500' }}>Result:</span>
                  <span>{game.result}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        {renderPagination()}
      </div>
    );
  };
  
  return (
    <div className="game-library" style={{ 
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '25px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        fontSize: '24px', 
        marginTop: 0, 
        marginBottom: '20px',
        fontWeight: '600',
        color: '#333'
      }}>
        Game Library
      </h2>
      
      {error && (
        <div style={{ 
          color: '#e74c3c', 
          padding: '12px 15px', 
          backgroundColor: '#fdedeb', 
          borderRadius: '6px', 
          fontSize: '14px',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16V16.01M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {error}
        </div>
      )}
      
      <div className="game-library-container" style={{ 
        display: 'flex', 
        gap: '25px',
        flexDirection: 'row'
      }}>
        {/* LEFT COLUMN - Categories and Tournaments */}
        <div className="category-list" style={{ 
          width: '30%', 
          borderRight: '1px solid #eee',
          paddingRight: '20px',
          overflowY: 'auto',
          maxHeight: '75vh'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            marginTop: 0, 
            fontWeight: '500',
            marginBottom: '15px',
            color: '#444'
          }}>
            Tournament Categories
          </h3>
          
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0 
          }}>
            <li style={{ marginBottom: '15px' }}>
              <button
                onClick={() => handleCategorySelect('all')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: selectedCategory === 'all' ? '#f0f8ff' : 'transparent',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  fontWeight: selectedCategory === 'all' ? '600' : '400',
                  color: selectedCategory === 'all' ? '#3498db' : '#444',
                  fontSize: '16px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6H20M4 12H20M4 18H20" stroke={selectedCategory === 'all' ? '#3498db' : '#666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                All Tournaments
              </button>
            </li>
            
            {/* ... existing category rendering code ... */}
          </ul>
        </div>
        
        {/* RIGHT COLUMN - Game List */}
        <div className="game-list" style={{ 
          width: '70%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Game List Header and Search */}
          <div className="game-browser-filters" style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
            gap: '15px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              margin: 0, 
              fontWeight: '500',
              color: '#444',
              flex: '1'
            }}>
              {selectedTournament ? selectedTournament.name : 'All Games'}
              {filteredGames.length > 0 && 
                <span style={{ 
                  fontSize: '14px', 
                  color: '#888', 
                  fontWeight: 'normal',
                  marginLeft: '8px'
                }}>
                  ({filteredGames.length} games)
                </span>
              }
            </h3>
            
            <div className="search-input" style={{ 
              position: 'relative',
              width: '250px'
            }}>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#888'
                }}
              >
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 35px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          
          {/* Games Table */}
          {renderGameList()}
          
          {/* Pagination Controls */}
          {filteredGames.length > gamesPerPage && renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default GameLibrary; 