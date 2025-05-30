# GoSei AI-Kifu Version History

## v1.0.8 - 2025-05-25

### Book Library and PDF Viewer Improvements
- Enhanced Book Library functionality:
  - Added sorting capabilities (Name A-Z/Z-A, Size, Date Added, Last Modified)
  - Implemented real-time search functionality
  - Added date-based filtering using file metadata
  - Default sorting set to alphabetical (A-Z)
  - Improved mobile responsiveness
- PDF Viewer enhancements:
  - Added mobile-friendly navigation controls
  - Improved touch interaction for page navigation
  - Enhanced mobile layout with better button placement
  - Added swipe gestures for page navigation
  - Optimized controls layout for different screen sizes
  - Updated keyboard navigation:
    - Left Arrow: Previous page
    - Right Arrow: Next page
    - Space: Disabled (no action)
- Game Viewer keyboard controls:
  - Left Arrow: Previous move
  - Right Arrow: Next move
  - Space: Toggle autoplay

## v1.0.7 - 2025-05-18

### Player Information Improvements
- Enhanced player information display:
  - Added handicap information directly with Black player name (e.g., "Player (H5)" for 5-stone handicap)
  - Removed redundant handicap display in game metadata section
  - Streamlined game details presentation for better readability
- Technical improvements:
  - Fixed TypeScript interface syntax in SGF parser module
  - Improved code organization for better maintainability
  - Enhanced error handling in game metadata processing

## v1.0.6 - 2025-04-28

### Game Viewing Improvements
- Added dedicated Game Viewer modal for viewing SGF files without navigating away from the current page
- Modified SGF file loading behavior to open files in the Game Viewer overlay instead of replacing main page content
- Enhanced Game Viewer with responsive loading animation and improved fullscreen controls
- Added keyboard shortcuts for easier navigation (ESC to close or exit fullscreen)
- Improved transitions and visual feedback in the Game Viewer for a smoother experience

### Interactive Mode Enhancements 
- Added clear visual indicators for all interactive modes
- Improved visibility of the Zen Mode button for distraction-free game viewing
- Enhanced Test Mode with clearer move numbering and color indicators
- Optimized Fullscreen Mode with improved controls and transition animations
- Added helpful tooltips and instructions for all interactive modes

## v1.0.5 - 2025-04-22

### AI Analysis Features
- Added Liberty Analysis component showing:
  - Liberty counts for black and white stones
  - Group counts for connected stones
  - Liberty advantage calculation
  - Win probability estimation based on liberty advantage
  - Visual indicators showing which player is favored
- Added Win Rate Chart showing:
  - Game progression visualization with black and white territories
  - Win probability changes throughout the game
  - Significant move markers for moves that shift win probability
  - Current move indicator
  - Expandable/collapsible view for detailed analysis
- Added ability to switch between two analysis methods:
  - Liberty-based analysis (tactical strength)
  - Influence-based analysis (territorial control)
- Added Analysis Type selector in settings panel
- Enhanced player information display:
  - Replaced "Black:" and "White:" text with stone icons
  - Improved responsive design for player names
  - Better handling of long player names

## v1.0.4 - 2025-04-15

### Board Visualization Improvements
- Added customizable board themes with dropdown selector
- Implemented 4 theme options: Default Board, Dark Wood 3D, Light Wood 3D, and Universe
- Enhanced 3D stone appearance with realistic lighting and shadow effects
- Added wood grain texture to 3D board themes for increased realism
- Repositioned coordinates to appear behind stones while maintaining visibility
- Added coordinates on all four sides of the board for better reference
- Fixed issues with stone placement and coordinate visibility
- Improved visual accessibility with semi-transparent coordinates

## v1.0.3 - 2025-04-10

### UI/UX Improvements
- Modernized the application theme with transparent glass-morphism design
- Added subtle noise gradient background for visual interest
- Improved color scheme for better readability and visual hierarchy
- Implemented consistent hover animations for interactive elements
- Enhanced text readability with optimized contrast and subtle text shadows
- Replaced solid backgrounds with semi-transparent panels with backdrop-filter blur effects
- Added interactive Go game image with subtle hover effects in the History section
- Added traditional Go painting image to the Rules section for visual enhancement
- Improved layout with centered headings and left-aligned bullet points
- Repositioned images to bottom of their respective sections for better content flow

## v1.0.2 - 2025-04-06

### UI/UX Improvements
- Changed category selection buttons from green to dark grey for better visual clarity
- Changed pagination buttons from green to dark grey for consistency
- Set Game Library to show 5 results per page on mobile devices (width ≤ 768px) for better mobile experience
- Hidden the "Games per page" text on mobile screens to save space while preserving the dropdown functionality

## v1.0.1 - 2025-04-01

### Initial Release
- First public release of GoSei AI-Kifu
- Basic SGF and Japanese kifu format support
- Interactive Go board visualization
- Game library with thousands of professional games
- Responsive design for desktop and mobile 