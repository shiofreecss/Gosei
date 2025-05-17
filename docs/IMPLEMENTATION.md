# Implementation Guide

## Architecture Overview

### Frontend Architecture
```
src/
├── components/         # Reusable UI components
├── pages/             # Page components
├── hooks/             # Custom React hooks
├── services/          # API and external service integrations
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
├── styles/            # Global styles and themes
└── assets/            # Static assets
```

### Core Components

1. **Go Board Component**
   - Canvas-based rendering
   - Stone placement handling
   - Coordinate system
   - Move validation
   - Animation system

2. **SGF Parser**
   - File parsing
   - Game tree construction
   - Move validation
   - Metadata extraction

3. **Game Navigation**
   - Move traversal
   - Branch handling
   - History management
   - State persistence

4. **Game Viewer Modal**
   - Overlay presentation system
   - Fullscreen management
   - Loading state handling
   - Keyboard navigation shortcuts

5. **Interactive Modes**
   - **Game Viewer Mode**: Dedicated modal overlay for viewing games
   - **Zen Mode**: Distraction-free viewing with minimized UI
   - **Test Mode**: Interactive variation testing on existing games
   - **Fullscreen Mode**: Expanded view for optimal analysis

6. **UI Components**
   - Theme system
   - Responsive layout
   - Accessibility features
   - Interactive elements

## Implementation Details

### 1. Go Board Implementation

#### Board Rendering
```typescript
interface BoardProps {
  size: number;
  theme: BoardTheme;
  coordinates: boolean;
  stones: StonePosition[];
}

interface StonePosition {
  x: number;
  y: number;
  color: 'black' | 'white';
}
```

#### Stone Placement
- Mouse/touch event handling
- Position calculation
- Move validation
- Animation system

#### Coordinate System
- Grid calculation
- Label rendering
- Responsive scaling
- Multi-language support

### 2. SGF Parsing

#### File Processing
```typescript
interface SGFNode {
  properties: Map<string, string[]>;
  children: SGFNode[];
  parent: SGFNode | null;
}

interface GameTree {
  root: SGFNode;
  current: SGFNode;
  metadata: GameMetadata;
}
```

#### Move Validation
- Rule enforcement
- Ko situation handling
- Capture detection
- Territory calculation

### 3. State Management

#### Game State
```typescript
interface GameState {
  board: BoardState;
  current: MoveNode;
  history: MoveHistory;
  metadata: GameMetadata;
}

interface BoardState {
  stones: StonePosition[];
  captures: number[];
  lastMove: Position | null;
}
```

#### Navigation State
- Move traversal
- Branch handling
- State persistence
- Undo/redo support

### 4. Performance Optimizations

#### Rendering Optimization
- Canvas optimization
- React component memoization
- Virtual list for move history
- Lazy loading for game collections

#### Memory Management
- Game tree pruning
- Cache management
- Resource cleanup
- Memory leak prevention

### 5. Game Viewer Implementation

#### Modal System
```typescript
interface GameViewerProps {
  sgfContent: string;
  onClose: () => void;
}

// Modal state management
const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
const [isLoading, setIsLoading] = useState<boolean>(true);

// Keyboard navigation
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isFullScreen) {
        setIsFullScreen(false);
      } else {
        onClose();
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isFullScreen, onClose]);
```

#### Loading State
```typescript
// Loading state management
useEffect(() => {
  const timer = setTimeout(() => {
    setIsLoading(false);
  }, 300);
  
  return () => clearTimeout(timer);
}, []);

// Loading UI rendering
{isLoading ? (
  <div className="game-viewer-loading">
    <div className="loading-spinner"></div>
    <p>Loading game...</p>
  </div>
) : (
  <KifuReader sgfContent={sgfContent} />
)}
```

### 6. Interactive Modes

#### Game Viewer Mode
```typescript
// App component state
const [showGameViewer, setShowGameViewer] = useState<boolean>(false);
const [gameViewerContent, setGameViewerContent] = useState<string>('');

// Handler for opening the Game Viewer
const handleGameSelected = useCallback((content: string) => {
  setGameViewerContent(content);
  setShowGameViewer(true);
}, []);

// Handler for closing the Game Viewer
const handleCloseGameViewer = useCallback(() => {
  setShowGameViewer(false);
}, []);

// Conditional rendering
{showGameViewer && (
  <GameViewer 
    sgfContent={gameViewerContent} 
    onClose={handleCloseGameViewer} 
  />
)}
```

#### Zen Mode
```typescript
// Zen Mode state management
const [isZenMode, setIsZenMode] = useState<boolean>(false);

// Toggle Zen Mode
const toggleZenMode = () => {
  setIsZenMode(!isZenMode);
};

// Apply Zen Mode class
<div className={`kifu-reader ${isZenMode ? 'kifu-fullscreen' : ''}`}>
  {/* Board and controls */}
</div>
```

#### Test Mode
```typescript
// Test Mode state management
const [testMode, setTestMode] = useState<boolean>(false);
const [nextMoveColor, setNextMoveColor] = useState<'black' | 'white'>('black');
const [testMoveNumber, setTestMoveNumber] = useState<number>(1);

// Toggle Test Mode
const handleToggleTestMode = () => {
  if (!testMode) {
    // Save original game state
    setOriginalGame(game);
    setOriginalCurrentMove(currentMove);
    
    // Initialize test mode
    setNextMoveColor(lastMove?.color === 'black' ? 'white' : 'black');
    setTestMoveNumber(1);
  } else {
    // Restore original game
    if (originalGame) {
      setGame(originalGame);
      setCurrentMove(originalCurrentMove);
    }
  }
  
  setTestMode(!testMode);
};

// Handle stone placement in Test Mode
const handleBoardClick = (x: number, y: number) => {
  if (!testMode) return;
  
  // Create new stone and add to game
  const newStone = { x, y, color: nextMoveColor };
  
  // Add move to game with captures
  // Switch to next color
  setNextMoveColor(nextMoveColor === 'black' ? 'white' : 'black');
  
  // Increment test move number
  setTestMoveNumber(prev => prev + 1);
};
```

#### Fullscreen Mode
```typescript
// Fullscreen state in Game Viewer
const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

// Toggle fullscreen
const toggleFullScreen = () => {
  setIsFullScreen(!isFullScreen);
};

// Apply fullscreen class
<div className={`game-viewer ${isFullScreen ? 'fullscreen' : ''}`}>
  <div className="game-viewer-modal">
    {/* Content */}
  </div>
</div>
```

### 7. Theme System

#### Theme Configuration
```typescript
interface BoardTheme {
  board: {
    background: string;
    lines: string;
    coordinates: string;
  };
  stones: {
    black: string;
    white: string;
    shadow: string;
  };
}
```

#### Dynamic Theming
- Theme switching
- Custom theme support
- CSS-in-JS implementation
- Responsive design

## Testing Strategy

### Unit Tests
- Component testing
- Utility function testing
- Game logic testing
- Parser testing

### Integration Tests
- Component integration
- State management
- Event handling
- Theme system

### Performance Tests
- Rendering performance
- Memory usage
- Load time optimization
- Network optimization

### Accessibility Tests
- Screen reader compatibility
- Keyboard navigation
- Color contrast
- ARIA compliance

## Development Guidelines

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Component structure

### Performance Guidelines
- Component optimization
- Memory management
- Network optimization
- Asset optimization

### Security Guidelines
- Input validation
- XSS prevention
- CSRF protection
- Secure data handling

### Documentation
- Code documentation
- API documentation
- Component documentation
- Type documentation

## Deployment

### Build Process
```bash
# Development
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Testing
npm run test
```

### Optimization
- Code splitting
- Tree shaking
- Asset optimization
- Cache strategy

### Monitoring
- Performance monitoring
- Error tracking
- Usage analytics
- User feedback

## Maintenance

### Version Control
- Branch strategy
- Commit guidelines
- Release process
- Version tracking

### Updates
- Dependency updates
- Security patches
- Feature updates
- Bug fixes

### Support
- Issue tracking
- User support
- Documentation updates
- Community engagement 