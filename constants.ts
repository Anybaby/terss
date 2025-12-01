import { Candidate } from './types';

// Professional Flat Avatars (SVG Data URIs)
const AVATAR_SVGS = [
  // Male 1
  `data:image/svg+xml;utf8,${encodeURIComponent('<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="36" height="36" rx="18" fill="#EBF4FF"/><path d="M18 19C20.2091 19 22 17.2091 22 15C22 12.7909 20.2091 11 18 11C15.7909 11 14 12.7909 14 15C14 17.2091 15.7909 19 18 19Z" fill="#4F46E5"/><path d="M9 28C9 24.6863 13.0294 22 18 22C22.9706 22 27 24.6863 27 28" stroke="#4F46E5" stroke-width="2" stroke-linecap="round"/></svg>')}`,
  // Female 1
  `data:image/svg+xml;utf8,${encodeURIComponent('<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="36" height="36" rx="18" fill="#FDF2F8"/><path d="M18 19C20.2091 19 22 17.2091 22 15C22 12.7909 20.2091 11 18 11C15.7909 11 14 12.7909 14 15C14 17.2091 15.7909 19 18 19Z" fill="#DB2777"/><path d="M9 28C9 24.6863 13.0294 22 18 22C22.9706 22 27 24.6863 27 28" stroke="#DB2777" stroke-width="2" stroke-linecap="round"/></svg>')}`,
  // Male 2
  `data:image/svg+xml;utf8,${encodeURIComponent('<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="36" height="36" rx="18" fill="#ECFDF5"/><path d="M18 19C20.2091 19 22 17.2091 22 15C22 12.7909 20.2091 11 18 11C15.7909 11 14 12.7909 14 15C14 17.2091 15.7909 19 18 19Z" fill="#059669"/><path d="M9 28C9 24.6863 13.0294 22 18 22C22.9706 22 27 24.6863 27 28" stroke="#059669" stroke-width="2" stroke-linecap="round"/></svg>')}`,
  // Female 2
  `data:image/svg+xml;utf8,${encodeURIComponent('<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="36" height="36" rx="18" fill="#FFFBEB"/><path d="M18 19C20.2091 19 22 17.2091 22 15C22 12.7909 20.2091 11 18 11C15.7909 11 14 12.7909 14 15C14 17.2091 15.7909 19 18 19Z" fill="#D97706"/><path d="M9 28C9 24.6863 13.0294 22 18 22C22.9706 22 27 24.6863 27 28" stroke="#D97706" stroke-width="2" stroke-linecap="round"/></svg>')}`,
  // Male 3
  `data:image/svg+xml;utf8,${encodeURIComponent('<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="36" height="36" rx="18" fill="#F5F3FF"/><path d="M18 19C20.2091 19 22 17.2091 22 15C22 12.7909 20.2091 11 18 11C15.7909 11 14 12.7909 14 15C14 17.2091 15.7909 19 18 19Z" fill="#7C3AED"/><path d="M9 28C9 24.6863 13.0294 22 18 22C22.9706 22 27 24.6863 27 28" stroke="#7C3AED" stroke-width="2" stroke-linecap="round"/></svg>')}`,
];

export const getRandomAvatar = () => {
  return AVATAR_SVGS[Math.floor(Math.random() * AVATAR_SVGS.length)];
};

export const LI_BAI_DATA: Candidate = {
  id: 'c-001',
  name: '李白',
  role: '高级安全工程师',
  avatar: AVATAR_SVGS[0], // Consistent Male Style
  updatedAt: '2025/12/1 12:18',
  summary: '候选人实操能力在系统加固和应急响应表现突出，但溯源取证与渗透测试实操能力薄弱。理论基础较均衡，业务理解较强，但安全监测理论需提升。',
  detailedAnalysis: '实操能力权重较高，系统加固满分、应急响应得分71%，但溯源取证和渗透测试实操为零，需重点加强。理论方面，业务理解达80%，应急响应理论85%，但安全监测理论仅65%，建议针对性补足。',
  scores: [
    { category: '安全监测', score: 65, type: 'Theory' },
    { category: '系统加固', score: 87, type: 'Theory' },
    { category: '应急响应', score: 85, type: 'Theory' },
    { category: '溯源取证', score: 87, type: 'Theory' },
    { category: '渗透测试', score: 70, type: 'Theory' },
    { category: '业务理解', score: 80, type: 'Theory' },
    { category: '安全监测', score: 33, type: 'Practice' },
    { category: '系统加固', score: 100, type: 'Practice' },
    { category: '应急响应', score: 71, type: 'Practice' },
    { category: '溯源取证', score: 0, type: 'Practice' },
    { category: '渗透测试', score: 0, type: 'Practice' },
  ],
  recommendations: [
    {
      direction: '提升渗透测试实操能力',
      steps: '通过CTF实战练习，学习渗透测试工具与方法',
      resources: '《渗透测试的艺术》、CTFtime在线平台'
    },
    {
      direction: '加强溯源取证技能',
      steps: '学习日志分析技术，掌握取证工具（如Autopsy）',
      resources: '《计算机取证与调查》、Autopsy官方教程'
    },
    {
      direction: '强化安全监测理论与实操结合',
      steps: '分析典型安全事件案例，模拟监测场景演练',
      resources: '《网络安全事件应急响应指南》、阿里云安全监测课程'
    },
    {
      direction: '提高安全监测实操水平',
      steps: '配置IDS/IPS系统，参与漏洞扫描实践',
      resources: '《入侵检测技术与实践》、Kali Linux实操手册'
    }
  ]
};

export const MOCK_CANDIDATES: Candidate[] = [
  LI_BAI_DATA,
  {
    ...LI_BAI_DATA,
    id: 'c-002',
    name: '杜甫',
    role: '安全架构师',
    avatar: AVATAR_SVGS[2],
    summary: '理论体系非常扎实，架构设计能力强。实操方面偏向防御体系建设，渗透测试能力一般。',
    scores: LI_BAI_DATA.scores.map(s => ({ ...s, score: Math.min(100, Math.max(40, s.score + (Math.random() * 40 - 20))) }))
  },
  {
    ...LI_BAI_DATA,
    id: 'c-003',
    name: '王维',
    role: '初级安全分析师',
    avatar: AVATAR_SVGS[3],
    summary: '潜力股，基础知识牢固，缺乏实战经验，需要更多项目历练。',
    scores: LI_BAI_DATA.scores.map(s => ({ ...s, score: Math.min(100, Math.max(20, s.score - 20)) }))
  }
];