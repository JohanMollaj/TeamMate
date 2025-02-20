import './tasks.css';
import React, { useState, useEffect } from 'react';
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

export default function(){
    return(
        <div>
            <div className="container-tasks">
                {/* Dashboard */}
                <div className="wrapper tasks">
                    <div  className='TasksHeader'>
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
                            <p>You have finished all your tasks!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}