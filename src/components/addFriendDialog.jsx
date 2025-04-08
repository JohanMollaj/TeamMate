import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const AddFriendDialog = ({ isOpen, onClose, onSendRequest }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [username, setUsername] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setShowConfirmation(false);
      setUsername('');
      setError(null);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setUsername('');
      setShowConfirmation(false);
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Show confirmation message
    setShowConfirmation(true);
    // Reset form after 2 seconds and close dialog
    setError(null);

    try {
      // When you add backend integration, replace this with actual API call
      await onSendRequest(username);
      
      console.log(`Friend request sent to: ${username}`, {
        timestamp: new Date().toISOString(),
        action: 'friend_request_sent',
        target_user: username,
        status: 'success'
      });

      setShowConfirmation(true);
      
      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Failed to send friend request:', error);
      setError('Failed to send friend request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200
        ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200
          ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Dialog */}
      <div 
        className={`bg-[var(--bg-primary)] rounded-xl w-full max-w-md p-6 relative shadow-2xl
          transform transition-all duration-200 ease-out
          ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-shadow`}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Add Friend</h2>
          <button 
            onClick={handleClose}
            className="text-[var(--text-primary)] hover:text-white transition-colors duration-200
              transform hover:scale-110 transition-transform"
          >
            <X size={20} />
          </button>
        </div>

        {showConfirmation ? (
          // Confirmation Message
          <div className="flex flex-col items-center py-4">
            <div className="bg-green-500/20 p-3 rounded-full mb-4">
              <Check size={24} className="text-green-500" />
            </div>
            <p className="text-[var(--friend-confirmation)] text-center">
              Friend request sent to @{username}!
            </p>
          </div>
        ) : (
          // Add Friend Form
          <>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              Enter a username to send them a friend request.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="transform transition-all duration-200 ease-out hover:translate-x-1">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1 ">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1 text-[var(--text-secondary)]">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[var(--bg-input)] border border-gray-600 rounded-lg text-[var(--text-primary)] 
                      focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700
                      transition-all duration-200 ease-out"
                    placeholder="username"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] 
                    transition-colors duration-200 hover:scale-105 transform"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg 
                    hover:bg-green-800 transition-all duration-200 ease-out
                    hover:scale-105 transform hover:shadow-lg"
                >
                  Send Request
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AddFriendDialog;