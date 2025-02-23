import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const TaskCharts = () => {
  // Sample data for the donut chart
  const completionData = [
    { name: 'Completed', value: 75 },
    { name: 'Remaining', value: 25 }
  ];

  // Colors for the donut chart
  const COLORS = ['#FFF', '#2A2C32'];

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', paddingTop: '0', alignItems: 'center', textAlign: 'center' }}>
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
                      <span style={{ 
                        display: 'inline-block', 
                        width: '10px', 
                        height: '10px', 
                        backgroundColor: entry.color,
                        marginRight: '5px'
                      }}></span>
                      {entry.value}
                    </li>
                  ))}
                </ul>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TaskCharts;