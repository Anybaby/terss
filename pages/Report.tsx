import React, { useState } from 'react';
import { ArrowLeft, Download, Share2, Printer, Target, BookOpen, ExternalLink, Activity, Code, X, Copy, Check } from 'lucide-react';
import { Candidate } from '../types';
import { CapabilityRadar, SkillBarChart } from '../components/Charts';

interface ReportProps {
  candidate: Candidate;
  onBack: () => void;
}

const Report: React.FC<ReportProps> = ({ candidate, onBack }) => {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  // Helper to color score text
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(candidate, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in print:p-0 print:max-w-none">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden no-print">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          返回仪表盘
        </button>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowJson(true)}
             className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 shadow-sm transition-all text-sm font-medium"
           >
            <Code className="w-4 h-4 mr-2" />
            查看数据
          </button>
           <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 shadow-sm transition-all text-sm font-medium">
            <Share2 className="w-4 h-4 mr-2" />
            分享
          </button>
          <button 
            onClick={() => window.print()} 
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all text-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            导出 PDF
          </button>
        </div>
      </div>

      {/* Page 1: Header & Summary & Radar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-0 print:shadow-none">
        <div className="p-8 border-b border-slate-100 print:border-0">
          <div className="flex justify-between items-start mb-6">
            <div>
               <h1 className="text-3xl font-bold text-slate-900 mb-2">{candidate.name} - 能力画像</h1>
               <div className="flex items-center gap-4 text-sm text-slate-500">
                 <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium print:border print:border-slate-300">{candidate.role}</span>
                 <span>报告生成时间: {candidate.updatedAt}</span>
               </div>
            </div>
            <img src={candidate.avatar} alt={candidate.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md print:shadow-none" />
          </div>

          <div className="bg-blue-50/50 rounded-lg p-6 border border-blue-100 text-slate-700 leading-relaxed mb-6 print:bg-white print:border print:border-slate-200">
             <div className="flex gap-3 mb-4">
               <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
               <p className="font-medium">{candidate.summary}</p>
             </div>
             <p className="pl-8 text-sm text-slate-600">{candidate.detailedAnalysis}</p>
          </div>

          <div className="mt-8 break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-1 h-6 bg-indigo-600 rounded-full mr-3 print:bg-black"></div>
              能力雷达图 (Capability Radar)
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 print:bg-white print:border-slate-200">
              <CapabilityRadar scores={candidate.scores} />
            </div>
          </div>
        </div>
      </div>

      {/* Page 2: Scores & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:space-y-8">
        {/* Bar Chart Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 break-inside-avoid print:border print:border-slate-200 print:shadow-none">
           <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-1 h-6 bg-indigo-600 rounded-full mr-3 print:bg-black"></div>
              能力分布 (Distribution)
            </h3>
            <SkillBarChart scores={candidate.scores} />
        </div>

        {/* Detailed Score List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 break-inside-avoid print:border print:border-slate-200 print:shadow-none">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <div className="w-1 h-6 bg-indigo-600 rounded-full mr-3 print:bg-black"></div>
              详细评分 (Detailed Scores)
            </h3>
            <div className="space-y-4">
              {candidate.scores.map((score, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-100 last:border-0 print:border-b print:border-slate-200">
                  <span className="text-slate-600 font-medium">{score.category}{score.type === 'Theory' ? '理论' : '实操'}</span>
                  <span className={`text-lg font-bold ${getScoreColorClass(score.score)}`}>
                    {score.score}
                  </span>
                </div>
              ))}
            </div>
        </div>
      </div>

      {/* Page 3: Learning Path */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 break-inside-avoid print:border print:border-slate-200 print:shadow-none">
        <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center">
          <div className="w-1 h-6 bg-indigo-600 rounded-full mr-3 print:bg-black"></div>
          学习路线 (Learning Path)
        </h3>
        
        <div className="space-y-6">
          {candidate.recommendations.map((rec, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-6 p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors print:bg-white print:border-slate-300">
              <div className="md:w-1/4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-indigo-600 print:text-black" />
                  <span className="text-xs font-bold uppercase text-indigo-600 tracking-wider print:text-black">方向</span>
                </div>
                <h4 className="font-bold text-slate-900">{rec.direction}</h4>
              </div>
              
              <div className="md:w-1/3">
                 <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-amber-600 print:text-black" />
                  <span className="text-xs font-bold uppercase text-amber-600 tracking-wider print:text-black">步骤/练习</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{rec.steps}</p>
              </div>

              <div className="md:w-1/3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                 <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-emerald-600 print:text-black" />
                  <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider print:text-black">资源</span>
                </div>
                <p className="text-sm text-slate-600 italic">{rec.resources}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* JSON Modal */}
      {showJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm no-print" onClick={() => setShowJson(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">原始数据 (JSON)</h3>
              <button onClick={() => setShowJson(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-900 p-6 relative group">
              <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap break-all">
                {JSON.stringify(candidate, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
               <span className="text-xs text-slate-500">可将此数据复制并在“仪表盘”中通过“批量导入”功能恢复。</span>
               <button 
                 onClick={handleCopy}
                 className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    copied 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                 }`}
               >
                 {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                 {copied ? '已复制' : '复制 JSON'}
               </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Report;