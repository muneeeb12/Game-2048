import React, { useState, useEffect } from "react";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // Fetch leaderboard data from the server
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:5000/user/leaderboard');
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data);
        } else {
          console.error('Failed to fetch leaderboard');
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="bg-violet-600 text-white rounded-lg shadow-lg p-8 w-80 md:w-96">
      <h2 className="text-3xl font-bold text-center mb-6">Top 5 Scores</h2>
      <ul className="space-y-4">
        {leaderboard.map((player, index) => (
          <li key={index} className="flex justify-between text-lg">
            <span>{index + 1}. {player.username}</span>
            <span>{player.highScore}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
