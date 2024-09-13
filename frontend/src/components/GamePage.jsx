import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Tile from './Tile';

const initializeGrid = () => {
  let grid = Array(4).fill(null).map(() => Array(4).fill(0));
  addRandomTile(grid);
  addRandomTile(grid);
  return grid;
};

const addRandomTile = (grid) => {
  let emptyCells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) emptyCells.push({ r, c });
    }
  }
  if (emptyCells.length === 0) return;
  const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  grid[r][c] = Math.random() < 0.1 ? 4 : 2;
};

const slideAndMerge = (line) => {
  let newLine = line.filter(tile => tile !== 0);
  let mergedLine = [];
  let skip = false;

  for (let i = 0; i < newLine.length; i++) {
    if (skip) {
      skip = false;
      continue;
    }

    if (i < newLine.length - 1 && newLine[i] === newLine[i + 1]) {
      mergedLine.push(newLine[i] * 2);
      skip = true;
    } else {
      mergedLine.push(newLine[i]);
    }
  }

  return [...mergedLine, ...Array(4 - mergedLine.length).fill(0)];
};

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

const isGameOver = (grid) => {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return false;
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
    }
  }
  return true;
};

const GamePage = () => {
  const [grid, setGrid] = useState(initializeGrid());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(sessionStorage.getItem('highScore'), 10) || 0);
  const [gameOver, setGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const username = sessionStorage.getItem('name');
  const userEmail = sessionStorage.getItem('email');
  console.log(username)
  console.log(highScore)
  console.log(userEmail);
  const navigate = useNavigate();

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      updateHighScore();
    }
  }, [score]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:5000/user/leaderboard');
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data);
        } else {
          const errorData = await response.json();
          console.error('Error fetching leaderboard:', errorData.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleMove = (direction) => {
    if (gameOver) return;

    const { grid: newGrid, moved } = moveTiles([...grid], direction);

    if (moved) {
      addRandomTile(newGrid);
      setGrid(newGrid);
      const newScore = calculateScore(newGrid);
      setScore(newScore);

      if (isGameOver(newGrid)) {
        setGameOver(true);
        updateLeaderboard();  // Update leaderboard when game is over
      }
    }
  };

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

  const calculateScore = (grid) => {
    return grid.flat().reduce((total, value) => value > 0 ? total + value : total, 0);
  };

  const updateHighScore = async () => {
    if (!userEmail) {
      return; 
     } // Ensure email is available

    try {
      const response = await fetch('http://localhost:5000/user/update-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, highscore: score }),
      });

      if (response.ok) {
        const data = await response.json();
        setHighScore(data.highscore);
        sessionStorage.setItem('highScore', data.highscore);
      } else {
        const errorData = await response.json();
        console.error('Error updating high score:', errorData.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateLeaderboard = async () => {
    if (!username || score === 0) return;  // Ensure username and score are valid

    try {
      const response = await fetch('http://localhost:5000/user/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, highscore:score }),
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      } else {
        const errorData = await response.json();
        console.error('Error updating leaderboard:', errorData.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetGame = () => {
    setGrid(initializeGrid());
    setScore(0);
    setGameOver(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('name');
    sessionStorage.removeItem('email');
    navigate('/');
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <button onClick={resetGame}>New Game</button>
        <button onClick={handleLogout}>Logout</button>
        <h1>2048 Game</h1>
        <h2>Score: {score}</h2>
        <h2>Email: {userEmail}</h2>
        <h2>High Score: {highScore}</h2>
      </header>
      <div className="grid-container">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((tile, colIndex) => (
              <Tile key={colIndex} value={tile} />
            ))}
          </div>
        ))}
      </div>
      {gameOver && <div className="game-over">Game Over</div>}
      <div className="leaderboard">
        <h2>Leaderboard</h2>
        <ul>
          {leaderboard.map((entry, index) => (
            <li key={index}>{entry.username}: {entry.highscore}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GamePage;
