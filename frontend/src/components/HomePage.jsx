// src/components/HomePage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import Leaderboard from "./Leaderboard";

const HomePage = () => {
  const navigate = useNavigate();

  const handlePlayGameClick = () => {
    navigate("/loginpage");
  };

  return (
    <div className="min-h-screen bg-purple-800 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-white mb-8">2048 Game Leaderboard</h1>
      
      {/* Leaderboard */}
      <Leaderboard />

      {/* Play Game Button */}
      <button
        onClick={handlePlayGameClick}
        className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-purple-900 font-bold py-3 px-6 rounded-lg text-lg"
      >
        Play Game
      </button>
    </div>
  );
};

export default HomePage;
