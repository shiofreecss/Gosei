# AI Analysis Features in GoSei | AI-Kifu

GoSei | AI-Kifu offers advanced AI-powered analysis features that help players understand the dynamics of Go games. This document explains how these features work and how to use them effectively.

## Table of Contents

1. [Influence Heatmap](#influence-heatmap)
2. [Liberty Analysis](#liberty-analysis)
3. [Win Rate Chart](#win-rate-chart)
   - [Liberty-based Analysis](#liberty-based-analysis)
   - [Influence-based Analysis](#influence-based-analysis)
4. [Using Multiple Analysis Tools Together](#using-multiple-analysis-tools-together)

## Influence Heatmap

The Influence Heatmap provides a visual representation of each player's territorial influence across the board.

### How It Works

The heatmap uses a color-coded overlay to show which areas of the board are under the influence of black (red) or white (blue) stones:

1. **Calculation Method**:
   - For each stone on the board, the algorithm calculates its influence in surrounding areas
   - Influence decreases with distance from the stone
   - Connected stones have stronger influence than isolated stones
   - Stones with more liberties project stronger influence

2. **Color Representation**:
   - **Red areas**: Influenced by black stones
   - **Blue areas**: Influenced by white stones
   - **Purple areas**: Contested territories with similar influence from both players
   - **Intensity**: Stronger color indicates stronger influence

3. **Updates During Play**:
   - The heatmap updates dynamically as moves are played
   - You can see how each move shifts the territorial balance

### How to Enable

1. In the Display Settings panel, toggle the "Show Influence Heatmap" switch
2. The heatmap will appear as an overlay on the Go board
3. You can toggle it on/off at any time to compare the board with and without the heatmap

## Liberty Analysis

The Liberty Analysis component provides a quantitative assessment of each player's tactical position based on stone liberties and group connections.

### How It Works

The Liberty Analysis panel shows several metrics:

1. **Liberty Count**:
   - The total number of liberties for each player's stones
   - Displayed as a horizontal bar chart showing the relative balance
   - Numerical values shown beside the chart

2. **Group Count**:
   - The number of connected stone groups for each player
   - Generally, fewer groups with more liberties indicates a stronger position

3. **Liberty Advantage**:
   - The difference in liberty count between the players
   - Shows which player has the tactical advantage and by how much

4. **Win Probability**:
   - Estimated win probability based on liberty advantage
   - Calculated using a statistical model derived from professional games
   - Shown as a horizontal bar with percentages for each player

5. **Advantage Indicator**:
   - Visual indicator showing which player is favored
   - "Black favored", "White favored", or "Even chances"

### How to Enable

1. In the Display Settings panel, toggle the "Liberty Analysis" switch
2. The Liberty Analysis panel will appear below the Go board
3. The analysis updates automatically as you navigate through the game moves

## Win Rate Chart

The Win Rate Chart visualizes the estimated win probability throughout the game, showing how each move affects the overall game balance.

### How It Works

The Win Rate Chart provides a graphical representation of game progress:

1. **Chart Layout**:
   - Horizontal axis: Move number
   - Vertical axis: Win probability (0-100%)
   - Middle line (50%): Equal chances
   - Top section (white/gray): White's winning chances
   - Bottom section (black): Black's winning chances

2. **Current Position**:
   - Blue vertical line indicates the current move
   - Current win probabilities for both players shown at the top

3. **Significant Moves**:
   - Red markers highlight moves that significantly shifted the win rate
   - These indicate potential turning points in the game

4. **Interactive Features**:
   - Expandable view for more detailed analysis
   - Tooltips showing exact win probabilities at each move
   - Animation when navigating between moves

### Analysis Methods

The Win Rate Chart offers two different methods for calculating win probabilities:

#### Liberty-based Analysis

Liberty-based analysis focuses on the tactical strength of stone positions:

1. **Calculation Basis**:
   - Liberty counts for each player's stones
   - Group formations and connections
   - Tactical advantage based on stone safety and freedom

2. **Strengths**:
   - Good at identifying immediate tactical advantages
   - Highlights moves that capture stones or threaten captures
   - Reflects the safety of stone groups and risk of capture

3. **Best Used For**:
   - Understanding tactical aspects of the game
   - Identifying strong or weak stone formations
   - Analyzing fighting sequences

#### Influence-based Analysis

Influence-based analysis focuses on territorial control and board position:

1. **Calculation Basis**:
   - Influence projection of stones across the board
   - Territorial control and potential territory
   - Global position strength rather than immediate tactics

2. **Strengths**:
   - Better at assessing the overall strategic position
   - Highlights moves that build strong territorial frameworks
   - Reflects how moves affect the global board position

3. **Best Used For**:
   - Understanding strategic aspects of the game
   - Evaluating territorial balance
   - Analyzing whole-board position

### How to Enable

1. In the Display Settings panel, toggle the "Win Rate Chart" switch
2. The Win Rate Chart will appear below the Go board
3. Select your preferred analysis method:
   - In the settings panel under "Analysis Method" dropdown
   - Directly in the Win Rate Chart header using the toggle buttons
4. Use the expand/collapse button to toggle between compact and detailed views

## Using Multiple Analysis Tools Together

For the most comprehensive analysis, you can use all three tools together:

1. **Combined Insights**:
   - Liberty Analysis provides tactical assessment
   - Influence Heatmap shows territorial control
   - Win Rate Chart visualizes the game's progression

2. **Recommended Workflow**:
   - Start with the Win Rate Chart to identify critical moments
   - When you find interesting points, examine the Liberty Analysis for tactical details
   - Use the Influence Heatmap to understand the territorial implications
   - Compare liberty-based and influence-based analyses to get a complete picture

3. **Mobile Considerations**:
   - On smaller screens, consider enabling one analysis tool at a time
   - Use the toggle switches to switch between different views as needed

By understanding and using these AI analysis features effectively, players can gain deeper insights into their games and improve their understanding of Go strategy and tactics. 