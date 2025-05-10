import React, { useState, useEffect } from 'react';
import './BookLibrary.css';
import PDFViewer from './PDFViewer';

interface Book {
  name: string;
  path: string;
  size: string;
}

const BookLibrary: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  useEffect(() => {
    // Fetch book list from the books directory
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        
        // Get base path - empty for relative paths, add PUBLIC_URL for Netlify
        const basePath = process.env.PUBLIC_URL || '';
        
        // In a production environment, we would use a server API call
        // For this demo, we'll hard-code the books we know exist
        const bookList: Book[] = [
          { name: 'Learn to Play Go Volume 1', path: `${basePath}/books/00 - Learn-to-Play-Go-Volume-1-Masters-Guide.pdf`, size: '68MB' },
          { name: 'Nhap Mon Co Vay', path: `${basePath}/books/01 - Nhap Mon Co Vay.pdf`, size: '2.9MB' },
          { name: 'Beyond Forcing Move - Shoichi Takashi', path: `${basePath}/books/02 - Beyond Forcing Move - Shoichi Takashi.pdf`, size: '9.1MB' },
          { name: 'Go Game - Cho Chikun', path: `${basePath}/books/03 - Go Game -ChoChikun.pdf`, size: '828KB' },
          { name: '501 Bai tap khai cuoc 1', path: `${basePath}/books/04 - 501 Bai tap khai cuoc 1.pdf`, size: '1.1MB' },
          { name: '501 Bai tap khai cuoc 2', path: `${basePath}/books/04 - 501 Bai tap khai cuoc 2.pdf`, size: '1.6MB' },
          { name: 'Shape Up', path: `${basePath}/books/05 - shape_up_v1.2.pdf`, size: '10MB' },
          { name: 'Lessons in the Fundamentals of Go - Toshiro Kageyama', path: `${basePath}/books/06 - Toshiro Kageyama - Lessons in the Fundamentals of Go.pdf`, size: '4.6MB' },
        ];
        
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

  return (
    <div className="book-library">
      <div className="book-library-header">
        <h2>Go Books Library</h2>
        <p>Click on a book to open it in the viewer</p>
      </div>

      {isLoading ? (
        <div className="book-loading">
          <div className="book-loading-spinner"></div>
          <p>Loading books...</p>
        </div>
      ) : (
        <div className="book-grid">
          {books.map((book, index) => (
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