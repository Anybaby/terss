import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend
} from 'recharts';
import { SkillScore } from '../types';

// --- Radar Chart ---

interface CapabilityRadarProps {
  scores: SkillScore[];
}

export const CapabilityRadar: React.FC<CapabilityRadarProps> = ({ scores }) => {
  // Transform data to separate Theory and Practice for comparison
  // From: [{category: 'A', type: 'Theory', score: 80}, ...]
  // To: [{ subject: 'A', theory: 80, practice: 50, fullMark: 100 }]
  
  const categories = Array.from(new Set(scores.map(s => s.category)));
  
  const data = categories.map(cat => {
    const theoryScore = scores.find(s => s.category === cat && s.type === 'Theory')?.score || 0;
    const practiceScore = scores.find(s => s.category === cat && s.type === 'Practice')?.score || 0;
    
    return {
      subject: cat,
      理论: theoryScore,
      实操: practiceScore,
      fullMark: 100,
    };
  });

  return (
    <div className="w-full h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          <Radar
            name="理论基础 (Theory)"
            dataKey="理论"
            stroke="#0ea5e9" 
            strokeWidth={2}
            fill="#0ea5e9"
            fillOpacity={0.3}
          />
          <Radar
            name="实操能力 (Practice)"
            dataKey="实操"
            stroke="#8b5cf6" 
            strokeWidth={2}
            fill="#8b5cf6"
            fillOpacity={0.3}
          />
          
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Tooltip 
             contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             itemStyle={{ fontSize: '12px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Bar Chart ---

interface SkillBarChartProps {
  scores: SkillScore[];
}

export const SkillBarChart: React.FC<SkillBarChartProps> = ({ scores }) => {
  const data = scores.map(s => ({
    name: s.category + (s.type === 'Theory' ? ' (理论)' : ' (实操)'),
    score: s.score
  }));

  // Sort by score descending for better readability
  // data.sort((a, b) => b.score - a.score);

  const getColor = (score: number) => {
    if (score === 0) return '#cbd5e1'; // Grey for zero
    if (score < 60) return '#ef4444'; // Red
    if (score < 80) return '#f59e0b'; // Amber
    if (score < 90) return '#10b981'; // Green
    return '#059669'; // Dark Green
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f1f5f9" />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={110} 
            tick={{ fill: '#64748b', fontSize: 11 }}
            interval={0}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18} label={{ position: 'right', fill: '#64748b', fontSize: 12 }}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};