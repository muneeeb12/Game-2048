import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(isRegistering ? 'http://localhost:5000/auth/register' : 'http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isRegistering
            ? { name, email, password } // Send name, email, and password for registration
            : { email, password } // Send email and password for login
        ),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.message || 'An error occurred');
        return;
      }

      const data = await response.json();
      if (isRegistering) {
        alert('Registration successful');
        setIsRegistering(false); // Switch to login view after successful registration
      } else {
        sessionStorage.setItem('name', data.user.name);
        sessionStorage.setItem('email', data.user.email);
        sessionStorage.setItem('highScore', data.user.highscore);
        navigate('/game'); // Navigate to the game page after successful login
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-purple-800 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-white mb-8">{isRegistering ? 'Register' : 'Login'}</h1>
      <form onSubmit={handleSubmit} className="bg-violet-600 text-white p-8 rounded-lg shadow-lg w-80 md:w-96">
        {isRegistering && (
          <div className="mb-4">
            <label htmlFor="name" className="block text-lg">Name:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full p-2 rounded-md bg-white text-purple-900"
              required={isRegistering}
            />
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="email" className="block text-lg">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full p-2 rounded-md bg-white text-purple-900"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-lg">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full p-2 rounded-md bg-white text-purple-900"
            required
          />
        </div>
        <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 font-bold py-3 px-6 rounded-lg text-lg w-full mb-4">
          {isRegistering ? 'Register' : 'Login'}
        </button>
        <div className="flex justify-between">
          {!isRegistering && (
            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 font-bold py-3 px-6 rounded-lg text-lg w-full"
            >
              Register
            </button>
          )}
          {isRegistering && (
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 font-bold py-3 px-6 rounded-lg text-lg w-full"
            >
              Login
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
