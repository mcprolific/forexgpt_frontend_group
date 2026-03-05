import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FiSend, 
  FiThumbsUp, 
  FiThumbsDown,
  FiCopy,
  FiDownload
} from 'react-icons/fi';
import { mockMentorMessages } from '../../../data/mockData';

const MentorMessages = () => {
  const { conversationId } = useParams();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(mockMentorMessages);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      conversation_id: conversationId,
      role: 'user',
      content: newMessage,
      created_at: new Date().toISOString()
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');

    // Simulate assistant reply
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        conversation_id: conversationId,
        role: 'assistant',
        content:
          "That's a great question about forex trading. Let me help you understand this better...",
        model_used: 'gpt-4',
        tokens_used: 150,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-black">

      {/* Header */}
      <div className="bg-black border-b border-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-yellow-500">Mentor Conversation</h2>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-sm text-white">Forex Mentor</span>
              <span className="text-sm text-white">{messages.length} messages</span>
            </div>
          </div>
          <button className="flex items-center space-x-2 px-3 py-1 border border-gray-700 rounded-lg text-yellow-500 hover:bg-white hover:text-black transition">
            <FiDownload className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`min-w-[250px] max-w-4xl w-full rounded-lg p-4 border break-words
                  ${message.role === 'user'
                    ? 'bg-yellow-600 text-black border-yellow-600'
                    : 'bg-black text-white border-gray-800'}
                `}>
                  {/* Assistant header */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-black font-bold">AI</span>
                      </div>
                      <span className="text-sm font-semibold text-yellow-500">Forex Mentor</span>
                    </div>
                  )}

                  {/* Message content */}
                  <p className={`text-sm ${message.role === 'user' ? 'text-black' : 'text-white'}`}>
                    {message.content}
                  </p>

                  {/* Assistant footer */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-800">
                      <div className="flex items-center space-x-2 text-xs text-white">
                        <span>Model: {message.model_used || 'gpt-4'}</span>
                        {message.tokens_used && (
                          <>
                            <span>•</span>
                            <span>{message.tokens_used} tokens</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="p-1 rounded hover:bg-white hover:text-black transition">
                          <FiCopy className="w-4 h-4 text-yellow-500" />
                        </button>
                        <button className="p-1 rounded hover:bg-white hover:text-black transition">
                          <FiThumbsUp className="w-4 h-4 text-yellow-500" />
                        </button>
                        <button className="p-1 rounded hover:bg-white hover:text-black transition">
                          <FiThumbsDown className="w-4 h-4 text-yellow-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Input */}
      <div className="bg-black border-t border-gray-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask your forex mentor a question..."
              className="flex-1 px-5 py-3 bg-black border border-gray-700 text-yellow-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-white"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="px-5 py-3 bg-yellow-600 text-black rounded-lg hover:bg-white hover:text-black transition flex items-center space-x-2"
            >
              <FiSend className="w-4 h-4" />
              <span className="font-semibold">Send</span>
            </button>
          </div>
          <p className="text-xs text-white mt-2">
            Ask about trading strategies, market analysis, or forex concepts
          </p>
        </div>
      </div>
    </div>
  );
};

export default MentorMessages;