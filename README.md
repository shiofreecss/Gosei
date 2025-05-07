# GoSei | AI-Kifu - Go Game Analysis Tool

GoSei | AI-Kifu is an open-source web application dedicated to the Go community for reading, visualizing, and analyzing Go game records (kifu) in both SGF (Smart Game Format) and traditional Japanese kifu format.

## Latest Updates (v1.0.5)

- Added advanced game analysis features with AI-powered insights:
  - **Liberty Analysis**: Shows stone liberties and group counts with win probability estimation
  - **Win Rate Chart**: Visualizes game progression with analysis based on either liberties or influence
  - **Influence Heatmap**: Displays territorial influence with a color-coded heatmap
- Improved player information display with stone icons and optimized for all screen sizes
- Enhanced responsive design for mobile devices
- See [VERSION.md](VERSION.md) for complete version history

## Live Demo

Check out the live deployment of GoSei | AI-Kifu at [https://kifu.gosei.xyz/](https://kifu.gosei.xyz/)

## About the Project

GoSei | AI-Kifu is built as a contribution to the Go community, providing free access to both game visualization tools and an extensive library of historical games. The application features thousands of professional games sourced from the [comprehensive SGF collection](https://homepages.cwi.nl/~aeb/go/games/games/) maintained by Andries E. Brouwer.

The project is powered by the [Beaver Foundation](https://beaver.foundation), supporting open-source development for the Go community.

## Features

- 🧠 Advanced AI analysis features:
  - Liberty analysis with win probability estimation
  - Win rate charts based on either liberty or influence metrics
  - Influence heatmap visualization for territorial analysis
- 🎨 Modern UI with high-resolution noise texture and dynamic gradients
- 📋 Support for both SGF and Japanese kifu formats
- 🎮 Interactive Go board visualization
  - Multiple board themes (Default, Dark Wood 3D, Light Wood 3D, Universe)
  - Realistic 3D stone rendering with proper lighting and shadows
  - Coordinates visible on all four sides of the board for better reference
- ⏩ Move-by-move navigation through games
- 📝 Display of game information and move comments
- 📤 File upload and text paste functionality
- 📚 Extensive game library with over 66,000 professional games
- 🔍 Advanced search and filtering options
- 📱 Responsive design for desktop and mobile
  - Optimized UI for small screens with appropriate game results pagination
  - Mobile-friendly navigation and hidden UI elements to save space
- ⚡ Optimized performance with caching and React memoization

## Screenshots

![Main Interface](/Examples/1-Main-page.png)
*The main interface featuring our modern design with high-resolution noise background and clean UI*

![Information and Music Player](/Examples/2-Information-Music-player.png)
*Interactive information display and integrated music player for an enhanced experience*

![Game Library Interface](/Examples/3-Go-Library.png)
*Browse thousands of professional games with our intuitive game library interface*

![Kifu Reader with Heatmap](/Examples/4-Kifu-Reader-heatmap.png)
*Advanced Kifu reader featuring move analysis and heatmap visualization*

![Win Rate Analysis](/Examples/5-Win-Rate-Chart.png)
*Win rate chart showing game progression with significant move highlights*

![Liberty Analysis](/Examples/6-Liberty-Analysis.png)
*Liberty analysis showing stone liberties, group counts, and win probability*

## Game Library

The GoSei | AI-Kifu game library includes thousands of professional Go games, organized into categories:

- **Major Tournaments**: Meijin, Honinbo, Judan, Tengen, Kisei, Gosei, Oza, and historical title matches
- **Other Japanese Tournaments**: Fast games, women's tournaments, special formats, and sponsored events
- **International Tournaments**: Major international events and cross-country competitions
- **Player Collections**: Game collections of famous professional players like Cho Chikun, Go Seigen, and more
- **Special Collections**: Unusual games, different board sizes, and historical collections

All game data is sourced from the [SGF collection](https://homepages.cwi.nl/~aeb/go/games/games/) maintained by Andries E. Brouwer at CWI.

## AI Analysis Features

GoSei | AI-Kifu includes advanced analysis features that help players understand game dynamics:

### Liberty Analysis
- Shows liberty counts and group counts for both players
- Calculates liberty advantage and estimates win probability
- Provides visual indicators of which player is favored

### Win Rate Chart
- Visualizes win probability changes throughout the game
- Supports both liberty-based and influence-based analysis modes
- Highlights significant moves that change the game's trajectory
- Provides expandable view for detailed examination

### Influence Heatmap
- Displays territorial influence with red (black) and blue (white) coloring
- Shows which areas of the board are controlled by each player
- Updates dynamically as the game progresses

For more details on these features, see [AI-ANALYSIS.md](docs/AI-ANALYSIS.md).

## Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: CSS
- **Deployment**: Netlify
- **Testing**: Jest, React Testing Library

## Performance Optimizations

GoSei | AI-Kifu includes several performance optimizations to ensure smooth and responsive user experience:

### Game Library Organization
- Hierarchical category structure for intuitive navigation
- Games organized into subcategories for easier browsing
- Efficient search across the entire game database

### Caching Mechanisms
- SGF files are cached after first load to prevent redundant network requests
- Game lists are cached by tournament to reduce API calls
- Preloading of game data for faster navigation

### React Optimizations
- Component memoization using React.memo to prevent unnecessary re-renders
- useCallback and useMemo hooks for optimized rendering of the Go board
- Efficient state management for smooth interaction

## Getting Started

### Prerequisites

- Node.js (v16 or later recommended)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/AI-Kifu.git
   cd AI-Kifu
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up game data:
   ```
   npm run setup
   ```

4. Start the development server:
   ```
   npm start
   ```
   
   Or to run setup and start in one command:
   ```
   npm run start-with-copy
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Building for Production

To build the application for production:

```
npm run build-with-copy
```

The build artifacts will be stored in the `build/` directory.

## Usage

### Uploading SGF Files

1. Click on the drop area or use the file browser to select an SGF file
2. The game will be loaded and displayed on the board

### Browsing the Game Library

1. Click on "Game Library" in the header
2. Browse games by category, subcategory, or tournament
3. Use pagination controls to navigate through multiple games
4. Search for specific games using the search bar
5. Click on a game to load and display it in the viewer

### Using AI Analysis Features

1. Load a game from the library or upload your own SGF file
2. In the display settings panel, toggle the analysis features you want to use:
   - Win Rate Chart
   - Liberty Analysis
   - Influence Heatmap
3. For the Win Rate Chart, select your preferred analysis method:
   - Liberty Analysis: Based on stone liberties and group connections
   - Influence Analysis: Based on territorial control and board position
4. Use the navigation controls to see how these metrics change during the game

### Using Japanese Kifu Format

You can paste traditional Japanese kifu format directly into the text area. Example format:

```
# 棋譜（Japanese Kifu Format）
# 黒：Takemiya Masaki
# 白：Cho Chikun
# 日付: 1986-02-27
# 結果: 黒の中押し勝ち

1. 黒: Q16
2. 白: D4
3. 黒: Q4
...
```

The application will automatically convert this to SGF format for visualization.

### Navigating through the Game

- Use the navigation controls below the board to move through the game
- First/Last buttons jump to the beginning/end of the game
- Prev/Next buttons move one move at a time
- Comments for moves will be displayed when available

## Contributing

GoSei | AI-Kifu is an open-source project, and contributions are warmly welcomed! Whether you're fixing bugs, improving the UI, adding new features, or enhancing documentation, your help is appreciated.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Beaver Foundation](https://beaver.foundation) for supporting this open-source project
- [SGF collection](https://homepages.cwi.nl/~aeb/go/games/games/) maintained by Andries E. Brouwer for providing the game data
- [Netlify](https://www.netlify.com/) for their generous hosting and continuous deployment platform that powers our application
- The global Go/Baduk/Weiqi community that continues to preserve and share the rich history of this beautiful game
- Copyright © GoSei
