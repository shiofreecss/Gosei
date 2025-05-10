const fs = require('fs-extra');
const path = require('path');

// Function to copy books from ./books to public/books
const copyBooks = async () => {
  try {
    const sourcePath = path.join(__dirname, '../books');
    const destinationPath = path.join(__dirname, 'books');
    
    // Check if source directory exists
    if (!fs.existsSync(sourcePath)) {
      console.error('Source books directory does not exist:', sourcePath);
      console.log('Creating sample books directory structure...');
      
      // If books directory doesn't exist, create it
      fs.mkdirSync(sourcePath, { recursive: true });
      
      // Create a sample README file to explain the directory purpose
      fs.writeFileSync(
        path.join(sourcePath, 'README.md'),
        '# Go Books\n\nThis directory is for storing Go game PDF books.\n\nAdd your PDF files here and they will be available in the app.'
      );
      
      console.log('Sample books directory created successfully!');
    }
    
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }
    
    // Copy books from source to destination
    await fs.copy(sourcePath, destinationPath);
    
    console.log('Books copied successfully from', sourcePath, 'to', destinationPath);
  } catch (error) {
    console.error('Error copying books:', error);
  }
};

// Execute the function
copyBooks(); 