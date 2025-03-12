import './tasks.css';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Clock, CheckCircle, AlertCircle, AlertTriangle, X, Upload, FileText, Paperclip } from 'lucide-react';
import TaskCharts from '../components/TaskCharts';

// Modal component for task details
const TaskModal = ({ task, isOpen, onClose, onSubmit }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [comment, setComment] = useState('');
  const fileInputRef = useRef(null);
  
  // Reset state when modal opens with a new task
  useEffect(() => {
    if (isOpen) {
      setFiles([]);
      setComment('');
    }
  }, [isOpen, task]);

  if (!isOpen) return null;
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Here you would normally upload files to server
    // For now we'll just pass the information to the parent component
    onSubmit({
      taskId: task.id,
      files,
      comment
    });
    
    onClose();
  };

  // Handle click outside to close modal
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onClick={handleOutsideClick}
    >
      <div className="bg-[#2a2b31] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">{task.title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-200 mb-2">Description</h3>
            <p className="text-gray-300">{task.description}</p>
          </div>
          
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm text-gray-400 mb-1">Due Date</h4>
              <p className="text-white">
                {new Date(task.dueDate).toLocaleDateString()} at {new Date(task.dueDate).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm text-gray-400 mb-1">Assigned By</h4>
              <p className="text-white">{task.assignedBy}</p>
            </div>
          </div>
          
          {!task.completed && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-200 mb-4">Submit Assignment</h3>
              
              {/* File upload area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 ${
                  dragActive ? 'border-blue-500 bg-blue-500 bg-opacity-10' : 'border-gray-600'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  multiple 
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                <Paperclip size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-300 mb-2">
                  Drag & drop files here, or click to browse
                </p>
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center mx-auto"
                >
                  <Upload size={16} className="mr-2" />
                  Browse Files
                </button>
              </div>
              
              {/* File list */}
              {files.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Files ({files.length})</h4>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                        <div className="flex items-center">
                          <FileText size={16} className="mr-2 text-gray-400" />
                          <span className="text-sm text-gray-200">{file.name}</span>
                        </div>
                        <button 
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Comment area */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea 
                  className="w-full bg-[#3e454d] border border-gray-600 rounded-md p-3 text-white"
                  rows="3"
                  placeholder="Add any comments about your submission..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              
              {/* Submit button */}
              <div className="flex justify-end">
                <button 
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-500"
                  disabled={files.length === 0}
                >
                  Submit Assignment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Other components (GradedTasks, etc.) remain the same

const GradedTasks = () => {
    const [assignments, setAssignments] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('all');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('/GradedTasks.json');
        const data = await response.json();
        setAssignments(data.gradedAssignments);

        const sortedAssignments = data.gradedAssignments.sort((a, b) => {
            return new Date(b.dateGraded) - new Date(a.dateGraded);
          });
        
        setAssignments(sortedAssignments);
        
        // Extract unique groups from assignments
        const uniqueGroups = [...new Set(data.gradedAssignments.map(a => a.groupId))]
          .map(groupId => {
            const assignment = data.gradedAssignments.find(a => a.groupId === groupId);
            return {
              id: groupId,
              name: assignment.groupName
            };
          });
        setGroups(uniqueGroups);
      } catch (error) {
        console.error('Error fetching graded assignments:', error);
      }
    };

    fetchAssignments();
  }, []);

  const getGradeColor = (grade) => {
    if (grade >= 8) return '#4CAF50';
    if (grade >= 6) return '#FFC107';
    return '#f44336';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }) + ' at ' + date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const filteredAssignments = selectedGroup === 'all' 
    ? assignments 
    : assignments.filter(a => a.groupId === parseInt(selectedGroup));

  return (
    <div className="graded-assignments-container">
      <div className="graded-assignments-header">
        <h2 className="graded-assignments-title">Graded Tasks</h2>
        <select 
          className="group-select"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="all">All Groups</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
      <div className="assignments-scroll-container">
        <div className="assignments-row">
          {filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="assignment-card">
              <div className="assignment-info">
                <h3 className="assignment-name">{assignment.taskName}</h3>
                <p className="assignment-group">{assignment.groupName}</p>
                <p className="assignment-date">
                  Graded: {formatDate(assignment.dateGraded)}
                </p>
                <p className="assignment-feedback">{assignment.feedback}</p>
              </div>
              <div 
                className="grade-circle"
                style={{ 
                  backgroundColor: getGradeColor(assignment.grade),
                  boxShadow: `0 0 10px ${getGradeColor(assignment.grade)}`
                }}
              >
                <span className="grade-text">{assignment.grade}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Component for overdue tasks
const OverdueTasks = ({ tasks, onTaskClick }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="text-red-500" size={20} />
        <h3 className="text-lg font-semibold text-red-500">Overdue</h3>
      </div>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onTaskClick={onTaskClick} />
      ))}
    </div>
  );
};

const DueSoonTasks = ({ tasks, onTaskClick }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <AlertCircle className="text-orange-400" size={20} />
        <h3 className="text-lg font-semibold text-orange-400">Due Soon</h3>
      </div>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onTaskClick={onTaskClick} />
      ))}
    </div>
  );
};

// Component for tasks in progress
const InProgressTasks = ({ tasks, onTaskClick }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <Clock className="text-blue-400" size={20} />
        <h3 className="text-lg font-semibold text-blue-400">In Progress</h3>
      </div>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onTaskClick={onTaskClick} />
      ))}
    </div>
  );
};

// Component for completed tasks with dropdown
const CompletedTasks = ({ tasks, onTaskClick }) => {
  const [showCompleted, setShowCompleted] = useState(false);

  if (tasks.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setShowCompleted(!showCompleted)}
        className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
      >
        <CheckCircle size={20} />
        <h3 className="text-lg font-semibold">Completed</h3>
        {showCompleted ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {showCompleted && (
        <div>
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} onTaskClick={onTaskClick} />
          ))}
        </div>
      )}
    </div>
  );
};

// Shared TaskItem component updated to be a button
const TaskItem = ({ task, onTaskClick }) => (
  <button 
    className="bg-[var(--bg-tertiary)] rounded-lg p-4 mb-2 w-full text-left hover:bg-[#4a4b55] transition-colors cursor-pointer"
    onClick={() => onTaskClick(task)}
  >
    <div className="flex justify-between items-start">
      <div>
        <h4 className="text-lg font-medium">{task.title}</h4>
        <p className="text-sm text-gray-300 line-clamp-2">{task.description}</p>
        <div className="mt-2 text-sm text-gray-400">
          Due: {new Date(task.dueDate).toLocaleDateString()} at {new Date(task.dueDate).toLocaleTimeString()}
        </div>
        <div className="text-sm text-gray-400">
          Assigned by: {task.assignedBy}
        </div>
      </div>
    </div>
  </button>
);

export default function(){
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/tasks.json');
        const data = await response.json();
        setTasks(data.tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    
    fetchTasks();
  }, []);

  // Get current date for calculations
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

  // Filter tasks for each section
  const pendingTasks = tasks.filter(task => 
    !task.completed && 
    new Date(task.dueDate) > threeDaysFromNow
  );
  
  const dueSoonTasks = tasks.filter(task => 
    !task.completed && 
    new Date(task.dueDate) <= threeDaysFromNow &&
    new Date(task.dueDate) > now
  );
  
  const overdueTasks = tasks.filter(task => 
    !task.completed && 
    new Date(task.dueDate) < now
  );
  
  const completedTasks = tasks.filter(task => task.completed);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSubmitTask = (submission) => {
    console.log('Task submitted:', submission);
    
    // Here you would typically send this to your API
    // For now, let's just mark it as completed in the local state
    const updatedTasks = tasks.map(task => 
      task.id === submission.taskId 
        ? { ...task, completed: true, submissionDate: new Date().toISOString() } 
        : task
    );
    
    setTasks(updatedTasks);
    
    // Optional: Save to localStorage or send to API
    // localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  return(
    <div>
      <div className="container-tasks">
        {/* Dashboard */}
        <div className="wrapper tasks">
          <div className='TasksHeader'>
            <h1>Tasks</h1>
          </div>
          <div className='sections'>
            <div className="section overview">
              <h2>Overview</h2>

              <div className='donutChartDiv'>
                <TaskCharts tasks={tasks} />
              </div>

              <div className='subsection'>
                <GradedTasks />
              </div>
            </div>

            <div className="section assignments">
              <h2>Assignments</h2>
              {tasks.length === 0 ? (
                <p className="text-gray-400">You have no tasks assigned!</p>
              ) : (
                <>
                  {overdueTasks.length > 0 && (
                    <div className='assignments-container'>
                      <OverdueTasks tasks={overdueTasks} onTaskClick={handleTaskClick} />
                    </div>
                  )}
                  {dueSoonTasks.length > 0 && (
                    <div className='assignments-container'>
                      <DueSoonTasks tasks={dueSoonTasks} onTaskClick={handleTaskClick} />
                    </div>
                  )}
                  <div className='assignments-container'>
                    <InProgressTasks tasks={pendingTasks} onTaskClick={handleTaskClick} />
                  </div>
                  <div className='assignments-container'>
                    <CompletedTasks tasks={completedTasks} onTaskClick={handleTaskClick} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          onSubmit={handleSubmitTask}
        />
      )}
    </div>
  );
}