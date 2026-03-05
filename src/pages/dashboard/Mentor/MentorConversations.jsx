import React from "react";
import { Link } from "react-router-dom";
import { FiMessageCircle, FiPlus } from "react-icons/fi";
import { mockMentorConversations } from "../../../data/mockData";

const MentorConversations = () => {
  return (
    <div className="min-h-screen bg-black p-6">

      {/* Header */}
      <div className="flex items-center justify-center mb-6 relative">
        <h1 className="text-2xl font-bold text-yellow-500">
          Mentor Conversations
        </h1>
      </div>

      {/* New Conversation Button */}
      <div className="flex justify-center mb-6">
        <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-black rounded-lg hover:bg-white hover:text-black transition-all duration-200">
          <FiPlus className="w-4 h-4" />
          <span className="font-semibold">New Conversation</span>
        </button>
      </div>

      {/* Conversation List */}
      <div className="space-y-4">
        {mockMentorConversations.length > 0 ? (
          mockMentorConversations.map((conversation) => (
            <Link
              key={conversation.id}
              to={`/mentor/conversations/${conversation.id}`}
              className="block bg-black border border-gray-800 rounded-lg p-4 hover:bg-white hover:text-black transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">

                {/* Left Side */}
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center group-hover:bg-black transition-all duration-200">
                    <FiMessageCircle className="w-5 h-5 text-black group-hover:text-yellow-500" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-yellow-500 group-hover:text-black truncate">
                      {conversation.title}
                    </h2>
                    <p className="text-xs text-white group-hover:text-black truncate">
                      {conversation.last_message}
                    </p>
                  </div>
                </div>

                {/* Right Side */}
                <div className="text-right">
                  <p className="text-xs text-white group-hover:text-black">
                    {conversation.updated_at}
                  </p>
                </div>

              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-20">
            <FiMessageCircle className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
            <p className="text-white text-sm">
              No conversations yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorConversations;