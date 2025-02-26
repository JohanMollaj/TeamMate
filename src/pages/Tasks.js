import './tasks.css';
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import TaskCharts from '../components/TaskCharts';

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
const OverdueTasks = ({ tasks }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="text-red-500" size={20} />
        <h3 className="text-lg font-semibold text-red-500">Overdue</h3>
      </div>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};

const DueSoonTasks = ({ tasks }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <AlertCircle className="text-orange-400" size={20} />
        <h3 className="text-lg font-semibold text-orange-400">Due Soon</h3>
      </div>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};

// Component for tasks in progress
const InProgressTasks = ({ tasks }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <Clock className="text-blue-400" size={20} />
        <h3 className="text-lg font-semibold text-blue-400">In Progress</h3>
      </div>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};

// Component for completed tasks with dropdown
const CompletedTasks = ({ tasks }) => {
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
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

// Shared TaskItem component used by all sections
const TaskItem = ({ task }) => (
  <div className="bg-[#3f414a] rounded-lg p-4 mb-2">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="text-lg font-medium">{task.title}</h4>
        <p className="text-sm text-gray-300">{task.description}</p>
        <div className="mt-2 text-sm text-gray-400">
          Due: {new Date(task.dueDate).toLocaleDateString()} at {new Date(task.dueDate).toLocaleTimeString()}
        </div>
        <div className="text-sm text-gray-400">
          Assigned by: {task.assignedBy}
        </div>
      </div>
    </div>
  </div>
);

export default function(){
  const [tasks, setTasks] = useState([]);
  
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
                <TaskCharts />
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
                      <OverdueTasks tasks={overdueTasks} />
                    </div>
                  )}
                  {dueSoonTasks.length > 0 && (
                    <div className='assignments-container'>
                      <DueSoonTasks tasks={dueSoonTasks} />
                    </div>
                  )}
                  <div className='assignments-container'>
                    <InProgressTasks tasks={pendingTasks} />
                  </div>
                  <div className='assignments-container'>
                    <CompletedTasks tasks={completedTasks} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}