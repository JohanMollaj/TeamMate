import React from 'react';
import { Lia500Px } from 'react-icons/lia';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const TaskCharts = ({ tasks = [] }) => {
  // Calculate completion statistics
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  
  // Calculate percentages
  const completedPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;
  const remainingPercentage = totalTasks > 0 
    ? Math.round(((totalTasks - completedTasks) / totalTasks) * 100) 
    : 0;

  // Data for the donut chart
  const completionData = [
    { name: 'Completed', value: completedPercentage },
    { name: 'Remaining', value: remainingPercentage }
  ];

  // Calculate task status breakdown
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
  
  const overdueCount = tasks.filter(task => 
    !task.completed && new Date(task.dueDate) < now
  ).length;
  
  const dueSoonCount = tasks.filter(task => 
    !task.completed && 
    new Date(task.dueDate) <= threeDaysFromNow &&
    new Date(task.dueDate) > now
  ).length;
  
  const upcomingCount = tasks.filter(task => 
    !task.completed && new Date(task.dueDate) > threeDaysFromNow
  ).length;

  // Data for the status breakdown chart (could add this as a second chart)
  const statusData = [
    { name: 'Overdue', value: overdueCount, color: '#FF5252' },
    { name: 'Due Soon', value: dueSoonCount, color: '#FFA726' },
    { name: 'Upcoming', value: upcomingCount, color: '#64B5F6' },
    { name: 'Completed', value: completedTasks, color: '#66BB6A' }
  ].filter(item => item.value > 0);

  // Colors for the donut chart
  const COLORS = ['#66BB6A', '#2A2C32']; // Green for completed, dark for remaining

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#1C1D20',
          padding: '10px',
          border: 'none',
          borderRadius: '8px',
          color: 'white'
        }}>
          <p>{`${payload[0].name}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Format completion rate for center display
  const completionRate = totalTasks > 0 
    ? completedPercentage 
    : 0;

  // No tasks message
  if (totalTasks === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px', 
        padding: '20px', 
        paddingTop: '0', 
        alignItems: 'center', 
        textAlign: 'center' 
      }}>
        <div style={{ 
          backgroundColor: '#3f414a',
          padding: '20px',
          paddingTop: '0', 
          borderRadius: '15px',
          height: '400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h2 style={{ color: 'white', fontSize: '20px' }}>Task Completion Rate</h2>
          <p style={{ color: 'white', marginTop: '20px' }}>No tasks assigned yet</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '50px', 
      padding: '20px', 
      paddingTop: '0', 
      alignItems: 'center', 
      textAlign: 'center' 
    }}>
      {/* Task Completion Donut Chart */}
      <div style={{ 
        backgroundColor: '#3f414a',
        padding: '20px',
        paddingTop: '0', 
        borderRadius: '15px',
        height: '300px'
      }}>
        <h2 style={{ color: 'white', fontSize: '20px' }}>Task Completion Rate</h2>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={completionData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                if (index === 0) { // Only display in center for first slice (completed)
                  return (
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      style={{ fontSize: '24px', fontWeight: 'bold' }}
                    >
                      {completionRate}%
                    </text>
                  );
                }
                return null;
              }}
            >
              {completionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              content={({ payload }) => (
                <ul style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  listStyle: 'none',
                  padding: 0,
                  color: 'white'
                }}>
                  {payload.map((entry, index) => (
                    <li key={`item-${index}`} style={{ margin: '0 10px' }}>
                      <li className='chartLegend' style={{ 
                        display: 'inline-block', 
                        width: '10px', 
                        height: '10px', 
                        backgroundColor: entry.color,
                        marginRight: '5px'
                      }}></li>
                      {entry.value} ({index === 0 ? 
                        `${completedTasks} of ${totalTasks}` : 
                        `${totalTasks - completedTasks} of ${totalTasks}`})
                    </li>
                  ))}
                </ul>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{ 
        backgroundColor: '#3f414a',
        padding: '20px',
        paddingTop: '0', 
        borderRadius: '15px',
        height: '400px'
      }}>
        <h2 style={{ color: 'white', fontSize: '20px' }}>Task Status Breakdown</h2>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
    </div>
  );
};

export default TaskCharts;