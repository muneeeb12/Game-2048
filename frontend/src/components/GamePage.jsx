import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router for navigation
import Tile from './Tile'; // Tile component for individual tiles

// Function to initialize the grid with two random tiles
const initializeGrid = () => {
  let grid = Array(4).fill(null).map(() => Array(4).fill(0));
  addRandomTile(grid);
  addRandomTile(grid);
  return grid;
};

// Function to add a new tile (2 or 4) to a random empty cell
const addRandomTile = (grid) => {
  let emptyCells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) emptyCells.push({ r, c });
    }
  }
  if (emptyCells.length === 0) return;
  const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  grid[r][c] = Math.random() < 0.1 ? 4 : 2; // 10% chance of 4, 90% chance of 2
};

// Helper function to slide tiles in a row or column and merge them
const slideAndMerge = (line) => {
  let newLine = line.filter(tile => tile !== 0); // Remove all zeros
  let mergedLine = [];
  let skip = false;

  for (let i = 0; i < newLine.length; i++) {
    if (skip) {
      skip = false;
      continue;
    }

    // Merge tiles if two adjacent tiles are equal
    if (i < newLine.length - 1 && newLine[i] === newLine[i + 1]) {
      mergedLine.push(newLine[i] * 2);
      skip = true; // Skip the next tile because it was merged
    } else {
      mergedLine.push(newLine[i]);
    }
  }

  // Add zeros to the end of the array to maintain grid size
  return [...mergedLine, ...Array(4 - mergedLine.length).fill(0)];
};

// Function to move tiles based on direction
const moveTiles = (grid, direction) => {
  let newGrid = [...grid];
  let moved = false;

  switch (direction) {
    case 'up':
      for (let col = 0; col < 4; col++) {
        let column = [newGrid[0][col], newGrid[1][col], newGrid[2][col], newGrid[3][col]];
        let newColumn = slideAndMerge(column);
        for (let row = 0; row < 4; row++) {
          if (newGrid[row][col] !== newColumn[row]) moved = true;
          newGrid[row][col] = newColumn[row];
        }
      }
      break;
    case 'down':
      for (let col = 0; col < 4; col++) {
        let column = [newGrid[3][col], newGrid[2][col], newGrid[1][col], newGrid[0][col]];
        let newColumn = slideAndMerge(column).reverse();
        for (let row = 0; row < 4; row++) {
          if (newGrid[row][col] !== newColumn[row]) moved = true;
          newGrid[row][col] = newColumn[row];
        }
      }
      break;
    case 'left':
      for (let row = 0; row < 4; row++) {
        let newRow = slideAndMerge(newGrid[row]);
        if (JSON.stringify(newGrid[row]) !== JSON.stringify(newRow)) moved = true;
        newGrid[row] = newRow;
      }
      break;
    case 'right':
      for (let row = 0; row < 4; row++) {
        let newRow = slideAndMerge(newGrid[row].reverse()).reverse();
        if (JSON.stringify(newGrid[row]) !== JSON.stringify(newRow)) moved = true;
        newGrid[row] = newRow;
      }
      break;
    default:
      break;
  }

  return { grid: newGrid, moved };
};

// Function to check if any moves are possible
const isGameOver = (grid) => {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return false; // Empty cell exists
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return false; // Vertical merge possible
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return false; // Horizontal merge possible
    }
  }
  return true; // No moves possible
};

const GamePage = () => {
  const [grid, setGrid] = useState(initializeGrid());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(sessionStorage.getItem('highScore') || 0);
  const [gameOver, setGameOver] = useState(false);
  const username = sessionStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      // Update high score in backend
      fetch('http://localhost:5000/update-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, highScore: score }),
      });
    }
  }, [score, highScore, username]);

  const handleMove = (direction) => {
    if (gameOver) return; // Disable moves when game is over

    const { grid: newGrid, moved } = moveTiles([...grid], direction);

    // If a move was made, update the grid and add a new tile
    if (moved) {
      addRandomTile(newGrid);
      setGrid(newGrid);

      // Update the score and high score
      const newScore = calculateScore(newGrid);
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
      }

      if (isGameOver(newGrid)) {
        setGameOver(true); // Trigger Game Over
      }
    }
  };

  // Handle key presses for tile movement
  const handleKeyPress = useCallback((event) => {
    switch (event.key) {
      case 'ArrowUp':
        handleMove('up');
        break;
      case 'ArrowDown':
        handleMove('down');
        break;
      case 'ArrowLeft':
        handleMove('left');
        break;
      case 'ArrowRight':
        handleMove('right');
        break;
      default:
        break;
    }
  }, [grid, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Calculate the score based on the grid values
  const calculateScore = (grid) => {
    return grid.flat().reduce((total, value) => value > 0 ? total + value : total, 0);
  };

  const updateHighScore = async () => {
    try {
      const response = await fetch('http://localhost:5000/update-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, highScore: score }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('High score updated:', data.highScore);
        setHighScore(data.highScore);
      } else {
        const errorData = await response.json();
        console.error('Error updating high score:', errorData.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };  
  
  const resetGame = () => {
    console.log('Resetting game and updating high score...');
    setGrid(initializeGrid());
    setScore(0);
    setGameOver(false);
  
    // Update high score in backend
    fetch('http://localhost:5000/update-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, highScore: score }),
    })
    .then(response => response.json())
    .then(data => console.log('High score update response:', data))
    .catch(error => console.error('Error updating high score:', error));
  };

  // "Play Again" logic: similar to reset but appears only after Game Over
  const playAgain = () => {
    resetGame();
  };

  // Logout function (navigates to home page)
  const handleLogout = () => {
    sessionStorage.clear(); // Clear the session
    navigate('/'); // Navigate to home page
  };

  return (
    <div className="min-h-screen bg-purple-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm mb-4 p-4 bg-violet-800 rounded-lg shadow-lg">
        <div className="text-center mb-4 text-white">
          <div className="text-xl font-bold mb-2">Username: {username}</div>
          <div className="text-lg mb-2">Score: {score}</div>
          <div className="text-lg">High Score: {highScore}</div>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {grid.map((row, rowIndex) => (
            row.map((tile, colIndex) => (
              <Tile key={`${rowIndex}-${colIndex}`} value={tile} />
            ))
          ))}
        </div>
        {gameOver && (
          <div className="mt-4">
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 font-bold py-3 px-6 rounded-lg text-lg"
              onClick={playAgain}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
  
      {/* Buttons Container */}
      <div className="mt-4 flex space-x-4">
        {/* Reset Button */}
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 font-bold py-3 px-6 rounded-lg text-lg"
          onClick={resetGame}
        >
          Reset
        </button>
  
        {/* Exit Button */}
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 font-bold py-3 px-6 rounded-lg text-lg"
          onClick={handleLogout}
        >
          Exit
        </button>
      </div>
    </div>
  );
};

export default GamePage;
