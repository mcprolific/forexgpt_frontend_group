import React from 'react';

const ProfileEdit = () => {
  return (
    <div className="p-6 text-white min-h-screen bg-[#121212]"> {/* Charcoal background */}
      <h1 className="text-2xl font-bold mb-4 text-yellow-400">Edit Profile</h1>
      <p className="text-sm text-gray-300">Profile editing form will go here.</p>
      
      {/* Example form (optional) */}
      <form className="mt-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Full Name</label>
          <input 
            type="text"
            placeholder="Your Name"
            className="w-full px-4 py-2 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Email</label>
          <input 
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-2 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <button 
          type="submit"
          className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-white hover:text-black transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ProfileEdit;