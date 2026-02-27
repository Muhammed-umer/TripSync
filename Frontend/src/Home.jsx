import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-80 text-center">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Welcome to TripSync
        </h1>
        <p className="text-gray-500 mb-8">
          Choose an option to continue
        </p>

        <div className="flex flex-col gap-4">
          <button className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 text-white py-3 rounded-lg font-medium shadow-md hover:scale-105">
            💬 Chat
          </button>

          <button className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 text-white py-3 rounded-lg font-medium shadow-md hover:scale-105">
            📩 Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;