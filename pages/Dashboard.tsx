import React, { useState, useEffect } from 'react';
import { 
  Search, TrendingUp, Users, AlertTriangle, 
  ChevronRight, Plus, X, Upload, Edit3,
  PieChart, Download, FileText, Briefcase, School,
  BookOpen, Target, ListChecks, Crosshair
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie, Cell as PieCell, Legend,
  ScatterChart, Scatter, ZAxis, ReferenceLine, Tooltip
} from 'recharts';
import { Candidate, SkillScore, Recommendation } from '../types';
import { getRandomAvatar } from '../constants';

interface DashboardProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
  onAddCandidate: (candidate: Candidate) => void;
}

const CATEGORIES = ['安全监测', '系统加固', '应急响应', '溯源取证', '渗透测试', '业务理解'];

const TRAINING_RESOURCES: Record<string, { steps: string; resources: string }> = {
  '安全监测': { steps: '重点加强日志分析、流量监控与威胁情报解读能力的训练，建议开展定期监测演练。', resources: '《安全监测实战指南》、Elastic Stack 官方文档、阿里云安全中心最佳实践' },
  '系统加固': { steps: '深入学习操作系统（Linux/Windows）安全配置、服务硬化与基线检查标准。', resources: 'CIS Benchmarks、Linux Hardening Guide、Windows Server 安全配置手册' },
  '应急响应': { steps: '通过模拟勒索病毒、挖矿木马等常见安全事件，演练标准处置流程（PDCERF）。', resources: '《应急响应现场手册》、典型安全事件案例库、应急响应工具包' },
  '溯源取证': { steps: '掌握内存取证、磁盘镜像分析技术，学习使用各类取证工具还原攻击路径。', resources: 'Volatility 教程、Wireshark 高级流量分析、Autopsy 用户指南' },
  '渗透测试': { steps: '开展靶场实战 (HTB/VulnHub)，系统学习内网渗透、提权与免杀技术，提升攻击思维。', resources: 'OWASP Top 10、Kali Linux 工具集、《渗透测试的艺术》' },
  '业务理解': { steps: '深入分析常见业务逻辑漏洞（如越权、并发），学习业务风控策略与SDLC流程。', resources: '业务安全白皮书、企业SDLC流程规范、SRC 漏洞挖掘案例' }
};

const Dashboard: React.FC<DashboardProps> = ({ candidates, onSelectCandidate, onAddCandidate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'manual' | 'import'>('manual');
  
  // Analytics State
  const [analyticsView, setAnalyticsView] = useState<'enterprise' | 'training' | 'review'>('enterprise');
  const [trainingTab, setTrainingTab] = useState<'analysis' | 'plan'>('analysis');

  // Manual Form state
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [scoreInputs, setScoreInputs] = useState<Record<string, { theory: number; practice: number }>>({});

  // Import Form state
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');

  // Initialize scores
  useEffect(() => {
    if (isModalOpen) {
      const initialScores: Record<string, { theory: number; practice: number }> = {};
      CATEGORIES.forEach(cat => {
        initialScores[cat] = { theory: 60, practice: 60 };
      });
      setScoreInputs(initialScores);
      setNewName('');
      setNewRole('');
      setNewAvatar('');
      setImportJson('');
      setImportError('');
    }
  }, [isModalOpen]);

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCandidates = candidates.length;
  const avgSystemHardening = totalCandidates > 0 
    ? Math.round(candidates.reduce((acc, c) => acc + (c.scores.find(s => s.category === '系统加固' && s.type === 'Practice')?.score || 0), 0) / totalCandidates) 
    : 0;
  const needsImprovementCount = candidates.filter(c => c.scores.some(s => s.score < 60)).length;

  // --- Analytics Data Generation ---
  
  // 1. Enterprise View Data (Talent Distribution)
  const getTalentDistribution = () => {
    let elite = 0; // > 80 avg
    let qualified = 0; // 60-80 avg
    let developing = 0; // < 60 avg

    candidates.forEach(c => {
      const avg = c.scores.reduce((a, b) => a + b.score, 0) / c.scores.length;
      if (avg >= 80) elite++;
      else if (avg >= 60) qualified++;
      else developing++;
    });

    return [
      { name: '高潜人才 (>80分)', value: elite, color: '#4f46e5' },
      { name: '胜任骨干 (60-80分)', value: qualified, color: '#10b981' },
      { name: '待培养 (<60分)', value: developing, color: '#f59e0b' },
    ].filter(d => d.value > 0);
  };

  // 2. Training View Data (Skill Weakness Heatmap)
  const getSkillWeaknessData = () => {
    return CATEGORIES.map(cat => {
      const totalScore = candidates.reduce((sum, c) => {
        const catScores = c.scores.filter(s => s.category === cat);
        const subAvg = catScores.reduce((a, b) => a + b.score, 0) / (catScores.length || 1);
        return sum + subAvg;
      }, 0);
      
      const avg = Math.round(totalScore / (candidates.length || 1));
      return { name: cat, score: avg };
    }).sort((a, b) => a.score - b.score);
  };

  // 3. Talent Review View Data (Matrix: Theory vs Practice)
  const getTalentMatrixData = () => {
    return candidates.map(c => {
        const theoryScores = c.scores.filter(s => s.type === 'Theory');
        const practiceScores = c.scores.filter(s => s.type === 'Practice');
        
        const avgTheory = Math.round(theoryScores.reduce((a, b) => a + b.score, 0) / (theoryScores.length || 1));
        const avgPractice = Math.round(practiceScores.reduce((a, b) => a + b.score, 0) / (practiceScores.length || 1));
        
        // Quadrant Logic (Threshold: 70)
        let type = '';
        if (avgTheory >= 70 && avgPractice >= 70) type = '卓越专家';
        else if (avgTheory < 70 && avgPractice >= 70) type = '实战能手';
        else if (avgTheory >= 70 && avgPractice < 70) type = '理论强人';
        else type = '待激活者';

        return {
            id: c.id,
            name: c.name,
            x: avgTheory, // Theory
            y: avgPractice, // Practice
            type,
            role: c.role
        };
    });
  };

  const getMatrixInsights = () => {
      const data = getTalentMatrixData();
      const stars = data.filter(d => d.type === '卓越专家');
      const practitioners = data.filter(d => d.type === '实战能手');
      const theorists = data.filter(d => d.type === '理论强人');
      
      return { stars, practitioners, theorists };
  };


  // Improved Avatar logic using consistent built-in SVG generator if no URL provided
  const getAvatar = (name: string, url?: string) => {
      if (url && url.trim() !== '') return url;
      return getRandomAvatar();
  };

  const StatCard = ({ label, value, icon: Icon, colorClass, trend }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm no-print">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        {trend && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+4.5%</span>}
      </div>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scores: SkillScore[] = [];
    Object.entries(scoreInputs).forEach(([category, values]) => {
      const scoreValues = values as { theory: number; practice: number };
      scores.push({ category, score: scoreValues.theory, type: 'Theory' });
      if (category !== '业务理解' || scoreValues.practice > 0) {
          scores.push({ category, score: scoreValues.practice, type: 'Practice' });
      }
    });

    const newCandidate: Candidate = {
        id: `c-${Date.now()}`,
        name: newName,
        role: newRole,
        avatar: getAvatar(newName, newAvatar),
        updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        summary: '手动录入的候选人数据。',
        detailedAnalysis: '基于手动录入的各项评分生成的能力画像。',
        scores: scores,
        recommendations: [{
            direction: '能力提升建议',
            steps: '根据当前评分，建议加强薄弱环节的理论学习与实操训练。',
            resources: '内部知识库、在线CTF靶场'
        }]
    };
    onAddCandidate(newCandidate);
    setIsModalOpen(false);
  };

  const handleImportSubmit = () => {
    try {
      const parsed = JSON.parse(importJson);
      const candidatesToAdd = Array.isArray(parsed) ? parsed : [parsed];
      candidatesToAdd.forEach((c: any, index: number) => {
        if (!c.name || !c.role || !c.scores) throw new Error(`第 ${index + 1} 条数据缺失必要字段`);
        onAddCandidate({
          id: c.id || `c-import-${Date.now()}-${index}`,
          name: c.name,
          role: c.role,
          avatar: getAvatar(c.name, c.avatar),
          updatedAt: c.updatedAt || new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
          summary: c.summary || '批量导入数据',
          detailedAnalysis: c.detailedAnalysis || '暂无详细分析',
          scores: c.scores,
          recommendations: c.recommendations || []
        });
      });
      setIsModalOpen(false);
    } catch (e: any) {
      setImportError(e.message);
    }
  };

  const handleExport = (format: 'word' | 'pdf') => {
    if (format === 'pdf') {
        window.print();
        return;
    } 
    
    // Construct a Word-friendly HTML string with tables instead of complex divs
    const date = new Date().toLocaleDateString();
    
    // Enterprise Data
    const talentDist = getTalentDistribution();
    // Training Data
    const skillWeakness = getSkillWeaknessData();
    // Review Data
    const matrixData = getTalentMatrixData();

    const tableStyle = "width: 100%; border-collapse: collapse; margin-bottom: 20px;";
    const thStyle = "border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;";
    const tdStyle = "border: 1px solid #ddd; padding: 8px;";
    const titleStyle = "font-family: 'SimSun', serif; font-size: 24px; text-align: center; margin-bottom: 20px;";
    const h2Style = "font-family: 'SimHei', sans-serif; font-size: 18px; color: #333; margin-top: 20px; border-left: 5px solid #4f46e5; padding-left: 10px;";

    let content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>分析报告</title></head>
      <body style="font-family: 'SimSun', serif;">
        <h1 style="${titleStyle}">人才盘点分析报告</h1>
        <p style="text-align: center; color: #666;">生成日期: ${date}</p>
        
        <h2 style="${h2Style}">一、总体概览</h2>
        <table style="${tableStyle}">
          <tr>
            <td style="${tdStyle}"><strong>候选人总数</strong></td>
            <td style="${tdStyle}">${totalCandidates} 人</td>
          </tr>
           <tr>
            <td style="${tdStyle}"><strong>平均系统加固实操分</strong></td>
            <td style="${tdStyle}">${avgSystemHardening} 分</td>
          </tr>
           <tr>
            <td style="${tdStyle}"><strong>待提升项总数</strong></td>
            <td style="${tdStyle}">${needsImprovementCount} 项</td>
          </tr>
        </table>
    `;

    if (analyticsView === 'enterprise') {
        content += `
            <h2 style="${h2Style}">二、企业视角分析 - 人才梯队</h2>
            <table style="${tableStyle}">
              <thead>
                <tr>
                   <th style="${thStyle}">梯队分类</th>
                   <th style="${thStyle}">人数</th>
                   <th style="${thStyle}">占比</th>
                </tr>
              </thead>
              <tbody>
                ${talentDist.map(d => `
                    <tr>
                        <td style="${tdStyle}">${d.name}</td>
                        <td style="${tdStyle}">${d.value}</td>
                        <td style="${tdStyle}">${Math.round((d.value / totalCandidates) * 100)}%</td>
                    </tr>
                `).join('')}
              </tbody>
            </table>
            
            <h3 style="font-size: 16px; font-weight: bold; margin-top: 10px;">企业洞察 (Insights):</h3>
            <ul>
                <li>目前团队中 <strong>${talentDist.find(d => d.name.includes('高潜'))?.value || 0}</strong> 名高潜人才，建议纳入核心项目组。</li>
                <li>待培养人员占比 <strong>${Math.round((talentDist.find(d => d.name.includes('待培养'))?.value || 0) / totalCandidates * 100)}%</strong>，需制定基础提升计划。</li>
                <li>整体梯队结构${talentDist.find(d => d.name.includes('胜任'))?.value! > (totalCandidates * 0.5) ? '健康，中坚力量充足' : '呈两极分化，需加强腰部力量'}。</li>
            </ul>
        `;
    } else if (analyticsView === 'training') {
         content += `
            <h2 style="${h2Style}">二、培训视角分析 - 技能短板</h2>
             <table style="${tableStyle}">
              <thead>
                <tr>
                   <th style="${thStyle}">技能维度</th>
                   <th style="${thStyle}">平均得分</th>
                   <th style="${thStyle}">状态</th>
                </tr>
              </thead>
              <tbody>
                ${skillWeakness.map(d => `
                    <tr>
                        <td style="${tdStyle}">${d.name}</td>
                        <td style="${tdStyle}">${d.score}</td>
                        <td style="${tdStyle}; color: ${d.score < 60 ? 'red' : 'green'}">${d.score < 60 ? '需提升' : '良好'}</td>
                    </tr>
                `).join('')}
              </tbody>
            </table>

            <h3 style="font-size: 16px; font-weight: bold; margin-top: 10px;">教学建议 (Suggestions):</h3>
            <ul>
                <li>全体学员在 <strong>${skillWeakness[0]?.name}</strong> 方面表现最弱 (平均 ${skillWeakness[0]?.score} 分)。</li>
                <li>建议增加 <strong>${skillWeakness[0]?.name}</strong> 和 <strong>${skillWeakness[1]?.name}</strong> 的实战演练课时。</li>
            </ul>
            
            <h3 style="font-size: 16px; font-weight: bold; margin-top: 20px;">专项提升计划:</h3>
             <table style="${tableStyle}">
              <thead>
                <tr>
                   <th style="${thStyle}">技能项</th>
                   <th style="${thStyle}">建议步骤</th>
                   <th style="${thStyle}">推荐资源</th>
                </tr>
              </thead>
              <tbody>
                ${skillWeakness.slice(0, 3).map(d => `
                    <tr>
                        <td style="${tdStyle}"><strong>${d.name}</strong></td>
                        <td style="${tdStyle}">${TRAINING_RESOURCES[d.name]?.steps || ''}</td>
                        <td style="${tdStyle}">${TRAINING_RESOURCES[d.name]?.resources || ''}</td>
                    </tr>
                `).join('')}
              </tbody>
            </table>
        `;
    } else {
        // Review View Word Export
        content += `
            <h2 style="${h2Style}">二、人才盘点视角 - 知行矩阵分析</h2>
            <p>基于“理论基础”与“实操能力”双维坐标的人才分类盘点。</p>
             <table style="${tableStyle}">
              <thead>
                <tr>
                   <th style="${thStyle}">姓名</th>
                   <th style="${thStyle}">职位</th>
                   <th style="${thStyle}">理论平均分</th>
                   <th style="${thStyle}">实操平均分</th>
                   <th style="${thStyle}">盘点分类</th>
                </tr>
              </thead>
              <tbody>
                ${matrixData.map(d => `
                    <tr>
                        <td style="${tdStyle}">${d.name}</td>
                        <td style="${tdStyle}">${d.role}</td>
                        <td style="${tdStyle}">${d.x}</td>
                        <td style="${tdStyle}">${d.y}</td>
                        <td style="${tdStyle}"><strong>${d.type}</strong></td>
                    </tr>
                `).join('')}
              </tbody>
            </table>
            
             <h3 style="font-size: 16px; font-weight: bold; margin-top: 10px;">管理建议 (Strategies):</h3>
             <ul>
                 <li><strong>卓越专家:</strong> ${matrixData.filter(d => d.type === '卓越专家').map(d => d.name).join('、') || '暂无'} —— 建议作为内部导师，进行经验萃取与传承。</li>
                 <li><strong>实战能手:</strong> ${matrixData.filter(d => d.type === '实战能手').map(d => d.name).join('、') || '暂无'} —— 建议补充系统化理论培训，提升架构思维。</li>
                 <li><strong>理论强人:</strong> ${matrixData.filter(d => d.type === '理论强人').map(d => d.name).join('、') || '暂无'} —— 建议安排高难度项目实战，或进行轮岗锻炼。</li>
             </ul>
        `;
    }

    content += "</body></html>";
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(content);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `人才盘点分析报告_${date}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handleScoreChange = (category: string, type: 'theory' | 'practice', value: string) => {
    const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
    setScoreInputs(prev => ({
      ...prev,
      [category]: { ...prev[category], [type]: numValue }
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Modal Code */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto no-print">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900">添加候选人</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex border-b border-slate-200">
                  <button onClick={() => setAddMode('manual')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${addMode === 'manual' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700'}`}><Edit3 className="w-4 h-4" /> 手动录入</button>
                  <button onClick={() => setAddMode('import')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${addMode === 'import' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700'}`}><Upload className="w-4 h-4" /> 批量导入</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {addMode === 'manual' ? (
                    <form onSubmit={handleManualSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="block text-sm font-medium mb-1">姓名 *</label><input required type="text" className="w-full px-3 py-2 border rounded-lg" value={newName} onChange={e => setNewName(e.target.value)} /></div>
                          <div><label className="block text-sm font-medium mb-1">职位 *</label><input required type="text" className="w-full px-3 py-2 border rounded-lg" value={newRole} onChange={e => setNewRole(e.target.value)} /></div>
                        </div>
                        <div><label className="block text-sm font-medium mb-1">头像链接</label><input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="留空则自动生成" value={newAvatar} onChange={e => setNewAvatar(e.target.value)} /></div>
                        <div>
                          <label className="block text-sm font-medium mb-3 border-b pb-2">能力评分 (0-100)</label>
                          <div className="space-y-3">{CATEGORIES.map((cat) => (
                              <div key={cat} className="flex items-center gap-4 bg-slate-50 p-2 rounded border">
                                <span className="w-24 text-sm font-medium">{cat}</span>
                                <input type="number" className="w-full px-2 py-1 border rounded text-sm" placeholder="理论" value={scoreInputs[cat]?.theory} onChange={e => handleScoreChange(cat, 'theory', e.target.value)} />
                                <input type="number" className="w-full px-2 py-1 border rounded text-sm" placeholder="实操" value={scoreInputs[cat]?.practice} onChange={e => handleScoreChange(cat, 'practice', e.target.value)} />
                              </div>
                            ))}</div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">取消</button><button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">确认添加</button></div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <textarea className="w-full h-64 p-4 border rounded-lg font-mono text-xs bg-slate-50" placeholder="[{ 'name': '...', ... }]" value={importJson} onChange={(e) => setImportJson(e.target.value)} />
                      {importError && <div className="text-red-600 text-sm">{importError}</div>}
                      <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">取消</button><button type="button" onClick={handleImportSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">导入</button></div>
                    </div>
                  )}
                </div>
            </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">仪表盘 (Dashboard)</h1>
        <p className="text-slate-500">人才能力评估与数据洞察</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="候选人总数" value={totalCandidates} icon={Users} colorClass="bg-indigo-600 text-indigo-600" trend />
        <StatCard label="平均系统加固实操分" value={`${avgSystemHardening}%`} icon={TrendingUp} colorClass="bg-emerald-600 text-emerald-600" />
        <StatCard label="待提升项" value={needsImprovementCount} icon={AlertTriangle} colorClass="bg-amber-600 text-amber-600" />
      </div>

      {/* Analytics Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden break-inside-avoid">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <h2 className="text-lg font-bold text-slate-900">统计分析</h2>
             <div className="flex bg-slate-100 p-1 rounded-lg no-print overflow-x-auto">
               <button 
                 onClick={() => setAnalyticsView('enterprise')}
                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${analyticsView === 'enterprise' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <Briefcase className="w-4 h-4" />
                 企业视角
               </button>
               <button 
                 onClick={() => setAnalyticsView('training')}
                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${analyticsView === 'training' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <School className="w-4 h-4" />
                 培训视角
               </button>
               <button 
                 onClick={() => setAnalyticsView('review')}
                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${analyticsView === 'review' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <Crosshair className="w-4 h-4" />
                 人才盘点视角
               </button>
             </div>
          </div>
          
          <div className="flex items-center gap-2 no-print">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider hidden md:block">导出分析结果:</span>
            <button onClick={() => handleExport('word')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
              <FileText className="w-4 h-4" /> Word
            </button>
            <button onClick={() => handleExport('pdf')} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50/50 min-h-[300px] flex flex-col items-center justify-start">
           {/* Sub-tabs for Training View */}
           {analyticsView === 'training' && (
              <div className="w-full flex justify-center mb-6 no-print">
                  <div className="flex p-1 bg-slate-200/60 rounded-lg">
                       <button
                           onClick={() => setTrainingTab('analysis')}
                           className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${trainingTab === 'analysis' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                           <PieChart className="w-4 h-4" />
                           技能短板分析
                       </button>
                       <button
                           onClick={() => setTrainingTab('plan')}
                           className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${trainingTab === 'plan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                           <ListChecks className="w-4 h-4" />
                           培训学习计划
                       </button>
                  </div>
              </div>
           )}

           {totalCandidates === 0 ? (
             <p className="text-slate-400">暂无数据进行分析</p>
           ) : (
             <>
               {analyticsView === 'enterprise' ? (
                  <div className="w-full flex flex-col md:flex-row items-center gap-8">
                     <div className="flex-1 w-full h-64">
                        <h4 className="text-center font-bold text-slate-700 mb-4">人才梯队分布图</h4>
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={getTalentDistribution()}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {getTalentDistribution().map((entry, index) => (
                                <PieCell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                          </RePieChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="flex-1 space-y-4 text-sm text-slate-600 bg-white p-6 rounded-lg border border-slate-100 shadow-sm w-full">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-indigo-500" />
                          企业洞察 (Insights)
                        </h4>
                        <ul className="space-y-3 list-disc pl-4">
                            <li>目前团队中 <span className="font-bold text-indigo-600">{getTalentDistribution().find(d => d.name.includes('高潜'))?.value || 0}</span> 名高潜人才，建议纳入核心项目组。</li>
                            <li>待培养人员占比 <span className="font-bold">{Math.round((getTalentDistribution().find(d => d.name.includes('待培养'))?.value || 0) / totalCandidates * 100)}%</span>，需制定基础提升计划。</li>
                            <li>整体梯队结构{getTalentDistribution().find(d => d.name.includes('胜任'))?.value! > (totalCandidates * 0.5) ? '健康，中坚力量充足' : '呈两极分化，需加强腰部力量'}。</li>
                        </ul>
                     </div>
                  </div>
               ) : analyticsView === 'training' ? (
                  // Training View
                  trainingTab === 'analysis' ? (
                    <div className="w-full flex flex-col md:flex-row items-center gap-8">
                       <div className="flex-1 w-full h-64">
                           <h4 className="text-center font-bold text-slate-700 mb-4">学员技能短板排行 (平均分)</h4>
                           <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={getSkillWeaknessData()}
                              layout="vertical"
                              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                              <XAxis type="number" domain={[0, 100]} hide />
                              <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                              <RechartsTooltip cursor={{fill: 'transparent'}} />
                              <Bar dataKey="score" barSize={20} radius={[0, 4, 4, 0]}>
                                {getSkillWeaknessData().map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.score < 60 ? '#ef4444' : '#6366f1'} />
                                ))}
                              </Bar>
                            </BarChart>
                           </ResponsiveContainer>
                       </div>
                       <div className="flex-1 space-y-4 text-sm text-slate-600 bg-white p-6 rounded-lg border border-slate-100 shadow-sm w-full">
                          <h4 className="font-bold text-slate-900 flex items-center gap-2">
                             <School className="w-4 h-4 text-indigo-500" />
                             教学建议 (Suggestions)
                          </h4>
                          <ul className="space-y-3 list-disc pl-4">
                            <li>全体学员在 <span className="font-bold text-red-500">{getSkillWeaknessData()[0]?.name}</span> 方面表现最弱 (平均 {getSkillWeaknessData()[0]?.score} 分)。</li>
                            <li>建议增加 <span className="font-bold">{getSkillWeaknessData()[0]?.name}</span> 和 <span className="font-bold">{getSkillWeaknessData()[1]?.name}</span> 的实战演练课时。</li>
                            <li>{getSkillWeaknessData().some(d => d.score > 80) ? `学员在 ${getSkillWeaknessData().filter(d => d.score > 80).map(d => d.name).join('、')} 方面掌握较好，可适当减少理论授课。` : '所有模块均需加强基础巩固。'}</li>
                          </ul>
                       </div>
                    </div>
                  ) : (
                    // Training Learning Plan View
                    <div className="w-full max-w-5xl mx-auto space-y-4 animate-fade-in">
                        {getSkillWeaknessData().map((item, index) => (
                            <div key={item.name} className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                                <div className="min-w-[140px] flex flex-col items-start border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${index < 2 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                            TOP {index + 1} 需提升
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-lg mb-1">{item.name}</h4>
                                    <span className={`text-sm font-medium ${item.score < 60 ? 'text-red-500' : 'text-slate-500'}`}>平均分: {item.score}</span>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div className={`h-full rounded-full ${item.score < 60 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{width: `${item.score}%`}}></div>
                                    </div>
                                </div>
                                
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100/50">
                                        <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-sm">
                                            <Target className="w-4 h-4" /> 建议步骤
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed">{TRAINING_RESOURCES[item.name]?.steps || '建议加强基础理论学习与实操。'}</p>
                                    </div>
                                    <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100/50">
                                        <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-sm">
                                            <BookOpen className="w-4 h-4" /> 推荐资源
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed">{TRAINING_RESOURCES[item.name]?.resources || '内部培训文档'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                  )
               ) : (
                  // Review View (Talent Matrix)
                  <div className="w-full flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-1 w-full h-80 bg-white p-4 rounded-lg border border-slate-100 relative">
                           <h4 className="text-center font-bold text-slate-700 mb-2">人才盘点知行矩阵 (Theory vs Practice)</h4>
                           <div className="absolute top-4 right-4 text-xs text-slate-400">
                               <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-1"></span>候选人
                           </div>
                           <ResponsiveContainer width="100%" height="100%">
                              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid />
                                <XAxis type="number" dataKey="x" name="理论平均分" unit="分" domain={[0, 100]} label={{ value: '理论基础 (Potential)', position: 'bottom', offset: 0 }} />
                                <YAxis type="number" dataKey="y" name="实操平均分" unit="分" domain={[0, 100]} label={{ value: '实操能力 (Performance)', angle: -90, position: 'left' }} />
                                <ZAxis type="category" dataKey="name" name="姓名" />
                                <ReferenceLine x={70} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'insideTopRight',  value: '70分', fill: '#94a3b8', fontSize: 10 }} />
                                <ReferenceLine y={70} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'insideTopRight',  value: '70分', fill: '#94a3b8', fontSize: 10 }} />
                                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
                                          <p className="font-bold text-slate-800">{data.name}</p>
                                          <p className="text-xs text-slate-500 mb-2">{data.role}</p>
                                          <div className="space-y-1 text-sm">
                                              <p className="text-indigo-600">理论: {data.x}分</p>
                                              <p className="text-emerald-600">实操: {data.y}分</p>
                                              <p className="font-bold mt-1 text-slate-700">类型: {data.type}</p>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                }} />
                                <Scatter name="候选人" data={getTalentMatrixData()} fill="#6366f1">
                                    {getTalentMatrixData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.type === '卓越专家' ? '#4f46e5' : entry.type === '实战能手' ? '#10b981' : entry.type === '理论强人' ? '#f59e0b' : '#ef4444'} />
                                    ))}
                                </Scatter>
                              </ScatterChart>
                           </ResponsiveContainer>
                           {/* Quadrant Labels */}
                           <div className="absolute top-[20%] right-[10%] text-xs font-bold text-indigo-600 opacity-50 pointer-events-none">卓越专家</div>
                           <div className="absolute top-[20%] left-[10%] text-xs font-bold text-emerald-600 opacity-50 pointer-events-none">实战能手</div>
                           <div className="absolute bottom-[20%] right-[10%] text-xs font-bold text-amber-600 opacity-50 pointer-events-none">理论强人</div>
                           <div className="absolute bottom-[20%] left-[10%] text-xs font-bold text-red-600 opacity-50 pointer-events-none">待激活</div>
                      </div>
                      
                      <div className="flex-1 space-y-4 text-sm text-slate-600 bg-white p-6 rounded-lg border border-slate-100 shadow-sm w-full">
                          <h4 className="font-bold text-slate-900 flex items-center gap-2">
                             <Crosshair className="w-4 h-4 text-indigo-500" />
                             管理建议 (Strategy)
                          </h4>
                          <div className="space-y-4">
                              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                  <div className="font-bold text-indigo-800 mb-1 flex justify-between">
                                      卓越专家 (Stars)
                                      <span className="bg-white px-2 rounded text-xs py-0.5 border border-indigo-200">{getMatrixInsights().stars.length}人</span>
                                  </div>
                                  <p className="text-xs text-indigo-700">建议作为内部导师，进行经验萃取与传承。</p>
                              </div>
                              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                  <div className="font-bold text-emerald-800 mb-1 flex justify-between">
                                      实战能手 (Practitioners)
                                      <span className="bg-white px-2 rounded text-xs py-0.5 border border-emerald-200">{getMatrixInsights().practitioners.length}人</span>
                                  </div>
                                  <p className="text-xs text-emerald-700">建议补充系统化理论培训，提升架构思维。</p>
                              </div>
                              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                  <div className="font-bold text-amber-800 mb-1 flex justify-between">
                                      理论强人 (Theorists)
                                      <span className="bg-white px-2 rounded text-xs py-0.5 border border-amber-200">{getMatrixInsights().theorists.length}人</span>
                                  </div>
                                  <p className="text-xs text-amber-700">建议安排高难度项目实战，或进行轮岗锻炼。</p>
                              </div>
                          </div>
                       </div>
                  </div>
               )}
             </>
           )}
        </div>
      </div>

      {/* Candidates List Section (Existing code) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden break-inside-avoid">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">近期评估列表</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto no-print">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索候选人..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm whitespace-nowrap"
            >
                <Plus className="w-4 h-4" />
                添加候选人
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredCandidates.map((candidate) => {
            const avgScore = Math.round(candidate.scores.reduce((a, b) => a + b.score, 0) / candidate.scores.length);
            return (
              <div key={candidate.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-6 group cursor-pointer" onClick={() => onSelectCandidate(candidate)}>
                <div className="flex items-center gap-4 min-w-[200px]">
                  <img src={candidate.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{candidate.name}</h4>
                    <p className="text-sm text-slate-500">{candidate.role}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex gap-2 mt-2 flex-wrap">
                     {candidate.scores.slice(0, 3).map((s, i) => (
                       <span key={i} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                         {s.category}: {s.score}
                       </span>
                     ))}
                  </div>
                </div>
                <div className="flex items-center gap-6 sm:justify-end min-w-[150px]">
                   <div className="text-right">
                      <span className="block text-2xl font-bold text-slate-900">{avgScore}</span>
                      <span className="text-xs text-slate-500 uppercase tracking-wide">综合得分</span>
                   </div>
                   <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;