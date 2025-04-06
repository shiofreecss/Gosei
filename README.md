# AI-Kifu

AI-Kifu is an open-source web application dedicated to the Go community for reading, visualizing, and analyzing Go game records (kifu) in both SGF (Smart Game Format) and traditional Japanese kifu format.

## Features

- 📋 Support for both SGF and Japanese kifu formats
- 🎮 Interactive Go board visualization
- ⏩ Move-by-move navigation through games
- 📝 Display of game information and move comments
- 📤 File upload and text paste functionality
- 📚 Extensive game library with over 66,000 professional games
- 🔍 Advanced search and filtering options
- 📱 Responsive design for desktop and mobile
- ⚡ Optimized performance with caching and React memoization

## Quick Start

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/AI-Kifu/AI-Kifu.git
   cd AI-Kifu/ai-kifu
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Uploading SGF Files

1. Click on the drop area or use the file browser to select an SGF file (.sgf, .kifu, or .txt)
2. The game will be loaded and displayed on the board

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

### Navigating through the Game

- Use the navigation controls below the board to move through the game
- First/Last buttons jump to the beginning/end of the game
- Prev/Next buttons move one move at a time
- Toggle move numbers and sound in the display settings

## Game Library

The AI-Kifu game library includes thousands of professional Go games, organized into categories:

- **Major Tournaments**: Meijin, Honinbo, Judan, Tengen, Kisei, Gosei, Oza, etc.
- **International Tournaments**: Major international events and competitions
- **Player Collections**: Game collections of famous professional players
- **Special Collections**: Unusual games, different board sizes, and historical collections

## Contributing

Contributions are welcome! Whether you're fixing bugs, improving the UI, adding new features, or enhancing documentation.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgements

- The global Go/Baduk/Weiqi community
- [SGF collection](https://homepages.cwi.nl/~aeb/go/games/games/) maintained by Andries E. Brouwer for game data
