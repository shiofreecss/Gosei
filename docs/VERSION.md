# GoSei AI-Kifu Version History

## v1.0.5 - 2025-05-22

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

## v1.0.4 - 2025-05-15

### Board Visualization Improvements
- Added customizable board themes with dropdown selector
- Implemented 4 theme options: Default Board, Dark Wood 3D, Light Wood 3D, and Universe
- Enhanced 3D stone appearance with realistic lighting and shadow effects
- Added wood grain texture to 3D board themes for increased realism
- Repositioned coordinates to appear behind stones while maintaining visibility
- Added coordinates on all four sides of the board for better reference
- Fixed issues with stone placement and coordinate visibility
- Improved visual accessibility with semi-transparent coordinates

## v1.0.3 - 2025-05-10

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

## v1.0.2 - 2025-05-06

### UI/UX Improvements
- Changed category selection buttons from green to dark grey for better visual clarity
- Changed pagination buttons from green to dark grey for consistency
- Set Game Library to show 5 results per page on mobile devices (width ≤ 768px) for better mobile experience
- Hidden the "Games per page" text on mobile screens to save space while preserving the dropdown functionality

## v1.0.1 - 2025-05-01

### Initial Release
- First public release of GoSei AI-Kifu
- Basic SGF and Japanese kifu format support
- Interactive Go board visualization
- Game library with thousands of professional games
- Responsive design for desktop and mobile 