import React, { useState, useEffect } from 'react';
import './BookLibrary.css';
import PDFViewer from './PDFViewer';

interface Book {
  name: string;
  path: string;
  size: string;
  dateAdded: Date;
  lastModified: Date;
}

interface SortOption {
  id: string;
  label: string;
  sortFn: (a: Book, b: Book) => number;
}

const BookLibrary: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<string>('name_asc');

  // Sort options
  const sortOptions: SortOption[] = [
    {
      id: 'name_asc',
      label: 'Name (A-Z)',
      sortFn: (a, b) => a.name.localeCompare(b.name)
    },
    {
      id: 'name_desc',
      label: 'Name (Z-A)',
      sortFn: (a, b) => b.name.localeCompare(a.name)
    },
    {
      id: 'date_newest',
      label: 'Date Added (Newest)',
      sortFn: (a, b) => b.dateAdded.getTime() - a.dateAdded.getTime()
    },
    {
      id: 'date_oldest',
      label: 'Date Added (Oldest)',
      sortFn: (a, b) => a.dateAdded.getTime() - b.dateAdded.getTime()
    },
    {
      id: 'modified_newest',
      label: 'Last Modified (Newest)',
      sortFn: (a, b) => b.lastModified.getTime() - a.lastModified.getTime()
    },
    {
      id: 'modified_oldest',
      label: 'Last Modified (Oldest)',
      sortFn: (a, b) => a.lastModified.getTime() - b.lastModified.getTime()
    },
    {
      id: 'size_asc',
      label: 'Size (Smallest)',
      sortFn: (a, b) => {
        const sizeA = parseFloat(a.size);
        const sizeB = parseFloat(b.size);
        return sizeA - sizeB;
      }
    },
    {
      id: 'size_desc',
      label: 'Size (Largest)',
      sortFn: (a, b) => {
        const sizeA = parseFloat(a.size);
        const sizeB = parseFloat(b.size);
        return sizeB - sizeA;
      }
    }
  ];

  useEffect(() => {
    // Fetch book list from the books directory
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        
        // Get base path - empty for relative paths, add PUBLIC_URL for Netlify
        const basePath = process.env.PUBLIC_URL || '';
        
        // Function to get file stats
        const getFileStats = async (path: string): Promise<{ dateAdded: Date; lastModified: Date }> => {
          try {
            const response = await fetch(path, { method: 'HEAD' });
            const lastModified = new Date(response.headers.get('last-modified') || '');
            // Since we can't get creation date from HTTP headers, we'll use last modified as date added
            // In a real application, you might want to store this information in a database
            return {
              dateAdded: lastModified,
              lastModified: lastModified
            };
          } catch (error) {
            console.error('Error getting file stats:', error);
            return {
              dateAdded: new Date(),
              lastModified: new Date()
            };
          }
        };
        
        // Updated book list with dates
        const bookList: Book[] = await Promise.all([
          { name: 'Shape Up', path: `${basePath}/books/01 - Shape_up_v1.2.pdf`, size: '10MB' },
          { name: 'Lessons in the Fundamentals of Go - Toshiro Kageyama', path: `${basePath}/books/02 - Toshiro Kageyama - Lessons in the Fundamentals of Go.pdf`, size: '4.6MB' },
          { name: 'Cho Chikun - All about life and death - Volume 1', path: `${basePath}/books/03.1 - Cho Chikun - All about life and death - Volume 1.pdf`, size: '1.7MB' },
          { name: 'Cho Chikun - All about life and death - Volume 2', path: `${basePath}/books/03.2 - Cho Chikun - All about life and death - Volume 2.pdf`, size: '3.3MB' },
          { name: 'Elementary Go Series Vol. 1 - In The Beginning', path: `${basePath}/books/04 - Elementary Go Series Vol. 1 - In The Beginning.pdf`, size: '8.5MB' },
          { name: 'Elementary Go Series Vol. 2 - 38 Basic Joseki', path: `${basePath}/books/04 - Elementary Go Series Vol. 2 - 38 Basic Joseki.pdf`, size: '8.3MB' },
          { name: 'Elementary Go Series Vol. 3 - Tesuji', path: `${basePath}/books/04 - Elementary Go Series Vol. 3 - Tesuji.pdf`, size: '15MB' },
          { name: 'Elementary Go Series Vol. 5 - Attack And Defense', path: `${basePath}/books/04 - Elementary Go Series Vol. 5 - Attack And Defense.pdf`, size: '30MB' },
          { name: 'Elementary Go Series Vol. 6 - Endgame', path: `${basePath}/books/04 - Elementary Go Series Vol. 6 - Endgame.pdf`, size: '4.8MB' },
          { name: 'Elementary Go Series Vol. 7 - Handicap Go', path: `${basePath}/books/04 - Elementary Go Series Vol. 7 - Handicap Go.pdf`, size: '13MB' },
          { name: 'Nhap Mon Co Vay', path: `${basePath}/books/V01 - Nhap Mon Co Vay.pdf`, size: '2.9MB' },
          { name: 'Beyond Forcing Move - Shoichi Takashi', path: `${basePath}/books/V02 - Beyond Forcing Move - Shoichi Takashi.pdf`, size: '9.1MB' },
          { name: 'Go Game - Cho Chikun', path: `${basePath}/books/V03 - Go Game -ChoChikun.pdf`, size: '828KB' },
          { name: '501 Bai tap khai cuoc 1', path: `${basePath}/books/V04.1 - 501 Bai tap khai cuoc 1.pdf`, size: '1.1MB' },
          { name: '501 Bai tap khai cuoc 2', path: `${basePath}/books/V04.2 - 501 Bai tap khai cuoc 2.pdf`, size: '1.6MB' },
        ].map(async (book) => {
          const stats = await getFileStats(book.path);
          return {
            ...book,
            dateAdded: stats.dateAdded,
            lastModified: stats.lastModified
          };
        }));
        
        setBooks(bookList);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching books:', error);
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const openBook = (book: Book) => {
    setSelectedBook(book);
    setShowPdfViewer(true);
  };

  const closePdfViewer = () => {
    setShowPdfViewer(false);
  };

  // Filter and sort books based on search term and sort option
  const filteredAndSortedBooks = books
    .filter(book => 
      book.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const selectedSortOption = sortOptions.find(option => option.id === sortOption);
      return selectedSortOption ? selectedSortOption.sortFn(a, b) : 0;
    });

  return (
    <div className="book-library">
      <div className="book-library-header">
        <h2>Go Books Library</h2>
        <p>Click on a book to open it in the viewer</p>
      </div>

      <div className="book-controls">
        {/* Search input */}
        <div className="search-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Sort dropdown */}
        <div className="sort-control">
          <label htmlFor="sort-books">Sort:</label>
          <select
            id="sort-books"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="book-loading">
          <div className="book-loading-spinner"></div>
          <p>Loading books...</p>
        </div>
      ) : (
        <div className="book-grid">
          {filteredAndSortedBooks.map((book, index) => (
            <div 
              key={index} 
              className="book-card" 
              onClick={() => openBook(book)}
            >
              <div className="book-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M7 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M7 15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="book-info">
                <h3>{book.name}</h3>
                <p className="book-size">{book.size}</p>
                <p className="book-date">Added: {book.dateAdded.toLocaleDateString()}</p>
                <p className="book-date">Modified: {book.lastModified.toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render PDF Viewer when a book is selected */}
      {showPdfViewer && selectedBook && (
        <PDFViewer 
          pdfPath={selectedBook.path}
          onClose={closePdfViewer}
        />
      )}
    </div>
  );
};

export default BookLibrary; 