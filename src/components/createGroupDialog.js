import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CreateGroupDialog = ({ isOpen, onClose, onCreateGroup }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setShowJoinDialog(false);
    setTimeout(() => {
      onClose();
      setGroupName('');
      setGroupDescription('');
      setInviteCode('');
    }, 200);
  };

  if (!isOpen && !isAnimating) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showJoinDialog) {
      onCreateGroup({ type: 'join', inviteCode });
    } else {
      onCreateGroup({ 
        type: 'create', 
        name: groupName, 
        description: groupDescription,
        // By default, we'll add the current user as a member
        // This can be expanded later when you want to add the member selection feature
        members: ["1"] 
      });
    }
    handleClose();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200"
      style={{ opacity: isAnimating ? 1 : 0 }}
    >
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: isAnimating ? 1 : 0 }}
        onClick={handleClose}
      />

      <div 
        className="bg-[#1C1D20] rounded-xl w-full max-w-md p-6 relative shadow-2xl
          transform transition-all duration-200 ease-out
          hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-shadow"
        style={{ 
          transform: isAnimating ? 'translateY(0)' : 'translateY(4px)',
          opacity: isAnimating ? 1 : 0
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            {showJoinDialog ? 'Join group' : 'Create group'}
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors duration-200
              transform hover:scale-110 transition-transform"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          {showJoinDialog 
            ? 'Enter an invite code to join an existing group.'
            : 'Create a new group to chat and collaborate with others.'}
        </p>

        <form onSubmit={handleSubmit}>
          {!showJoinDialog ? (
            <div className="space-y-4">
              <div className="transform transition-all duration-200 ease-out hover:translate-x-1">
                <label className="block text-sm font-medium text-white mb-1">
                  Group name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2A2C32] border border-gray-600 rounded-lg text-white 
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                    transition-all duration-200 ease-out"
                  placeholder="Enter group name"
                  required
                />
              </div>

              <div className="transform transition-all duration-200 ease-out hover:translate-x-1">
                <label className="block text-sm font-medium text-white mb-1">
                  Description
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2A2C32] border border-gray-600 rounded-lg text-white 
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                    resize-none transition-all duration-200 ease-out"
                  placeholder="Enter group description"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="transform transition-all duration-200 ease-out hover:translate-x-1">
              <label className="block text-sm font-medium text-white mb-1">
                Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-3 py-2 bg-[#2A2C32] border border-gray-600 rounded-lg text-white 
                  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                  transition-all duration-200 ease-out"
                placeholder="Enter invite code"
                required
              />
            </div>
          )}

          <div className="flex justify-end mt-6 gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white 
                transition-colors duration-200 hover:scale-105 transform"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!showJoinDialog && (groupName.trim() === '')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg 
                hover:bg-blue-700 transition-all duration-200 ease-out
                hover:scale-105 transform hover:shadow-lg
                disabled:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showJoinDialog ? 'Join group' : 'Create group'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm mb-2">
            {showJoinDialog 
              ? "Want to create a new group instead?"
              : "Have an invite already?"}
          </p>
          <button
            onClick={() => setShowJoinDialog(!showJoinDialog)}
            className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors duration-200"
          >
            {showJoinDialog ? 'Create a group' : 'Join Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupDialog;