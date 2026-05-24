'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
  options?: Option[];
}

interface Option {
  label: string;
  value: string;
  description?: string;
}

interface AssessmentGroup {
  code: string;
  title_en: string;
  title_cn: string;
  title_full: string;
  module_cn: string;
  module_code: number;
  measures: { name: string; code: string; desc_casual: string; desc_academic: string }[];
}

interface AssessmentData {
  original: AssessmentGroup[];
  adopted: AssessmentGroup[];
  all_groups: AssessmentGroup[];
}

type ConversationStep =
  | 'idle'
  | 'awaiting_module'
  | 'awaiting_group'
  | 'awaiting_measure'
  | 'done';

const MODULE_LABELS: Record<string, { en: string; emoji: string }> = {
  '能力与发展': { en: 'Ability & Development', emoji: '🧠' },
  '身心健康': { en: 'Health & Wellbeing', emoji: '💚' },
  '家长参与': { en: 'Parenting', emoji: '👨‍👩‍👧' },
};

// Natural language keyword → assessment codes
const KEYWORD_MAP: { keywords: string[]; codes: string[]; reply: string }[] = [
  {
    keywords: ['low mood', 'sad', 'sadness', 'depressed', 'depression', 'unhappy', 'down', 'hopeless', 'empty', 'crying', 'tearful', 'mood', 'bad mood', 'feeling low', 'feel low', 'feel sad'],
    codes: ['SSD', 'SR', 'ER_Aware', 'ER_Accept'],
    reply: "It sounds like you may be experiencing low mood or emotional difficulties. Here are the most relevant assessments:",
  },
  {
    keywords: ['anxious', 'anxiety', 'worry', 'worried', 'panic', 'stress', 'stressed', 'nervous', 'fear', 'scared', 'overwhelmed', 'tense', 'uneasy', 'overthinking'],
    codes: ['ER_Aware', 'ER_Strategy', 'Soc_Stress', 'MWI'],
    reply: "It sounds like you may be dealing with anxiety or stress. Here are relevant assessments:",
  },
  {
    keywords: ['sleep', 'insomnia', 'can\'t sleep', 'trouble sleeping', 'tired', 'fatigue', 'exhausted', 'headache', 'body pain', 'stomach', 'physical', 'somatic'],
    codes: ['SSD'],
    reply: "You may be experiencing physical or sleep-related symptoms. Here is the relevant assessment:",
  },
  {
    keywords: ['school', 'school refusal', 'hate school', 'don\'t want to go to school', 'skipping school', 'refuse school', 'school stress', 'school anxiety', 'academic pressure', 'study pressure'],
    codes: ['SR', 'Aca_Competence'],
    reply: "It sounds like there may be some challenges with school or studying. Here are relevant assessments:",
  },
  {
    keywords: ['attention', 'focus', 'concentrate', 'distracted', 'can\'t focus', 'can\'t concentrate', 'adhd', 'hyperactive', 'hyper', 'fidget', 'restless', 'impulsive', 'impulsivity', 'self-control', 'self control'],
    codes: ['ADHD_Inattention', 'ADHD_Hyperact', 'ADHD_EmoReg', 'ADHD_Motiv', 'ER_ImpulseControl'],
    reply: "You may be looking for assessments related to attention, focus, or impulse control:",
  },
  {
    keywords: ['emotion', 'emotional', 'feelings', 'regulate', 'anger', 'angry', 'rage', 'outburst', 'mood swings', 'emotional regulation', 'manage emotions', 'control emotions'],
    codes: ['ER_Aware', 'ER_Accept', 'ER_ImpulseControl', 'ER_Strategy', 'ADHD_EmoReg'],
    reply: "It sounds like you're looking for help with emotional regulation. Here are relevant assessments:",
  },
  {
    keywords: ['social', 'friendship', 'friends', 'relationships', 'bullying', 'bullied', 'peers', 'lonely', 'loneliness', 'isolation', 'social stress', 'peer pressure', 'classmates', 'teacher'],
    codes: ['Soc_Stress', 'MWI', 'SR'],
    reply: "You may be dealing with social or relationship challenges. Here are relevant assessments:",
  },
  {
    keywords: ['parenting', 'parent', 'raise kids', 'raising children', 'child rearing', 'my child', 'my kid', 'discipline', 'authoritative', 'strict parent', 'lenient parent'],
    codes: ['PS_Authoritative', 'PS_Authoritarian', 'PS_Permissive'],
    reply: "Here are assessments related to parenting styles:",
  },
  {
    keywords: ['intelligence', 'iq', 'smart', 'cognitive', 'thinking', 'wisdom', 'multiple intelligence', 'ability', 'talent', 'gifted', 'creativity', 'logic', 'problem solving'],
    codes: ['MWI'],
    reply: "Here is the assessment for intelligence and cognitive abilities:",
  },
  {
    keywords: ['academic', 'study', 'learning', 'grades', 'school work', 'homework', 'exam', 'test', 'study skills', 'motivation to study', 'learning strategies'],
    codes: ['Aca_Competence', 'SR'],
    reply: "Here are assessments related to academic performance and learning:",
  },
  {
    keywords: ['opposition', 'defiant', 'disobedient', 'rule breaking', 'authority', 'conflict', 'argumentative', 'rebellious'],
    codes: ['ADHD _Oppose', 'PS_Authoritarian'],
    reply: "Here are assessments related to oppositional behaviour and conflict:",
  },
];

function findByKeywords(input: string, data: AssessmentData): { matches: AssessmentGroup[]; reply: string } | null {
  const lower = input.toLowerCase();
  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      const matches = entry.codes
        .map((code) => data.original.find((g) => g.code.trim() === code.trim()))
        .filter((g): g is AssessmentGroup => !!g);
      if (matches.length > 0) return { matches, reply: entry.reply };
    }
  }
  return null;
}

interface ChatBoxProps {
  variant?: 'floating' | 'inline';
}

export default function ChatBox({ variant = 'floating' }: ChatBoxProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hi! I can help you find the right assessment. What would you like to explore today?',
      sender: 'assistant',
      options: [
        { label: '🔍 Find an assessment', value: 'find_assessment' },
        { label: '📋 Browse all assessments', value: 'browse_all' },
        { label: '❓ What is EQAI?', value: 'what_is_eqai' },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState<ConversationStep>('idle');
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [assessmentSlug, setAssessmentSlug] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<AssessmentGroup | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug') ?? params.get('assessmentSlug');
    const url = slug ? `/api/assessments?slug=${encodeURIComponent(slug)}` : '/api/assessments';

    setAssessmentSlug(slug);
    fetch(url)
      .then((r) => r.json())
      .then((d) => setAssessmentData(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const addMessage = (msg: Omit<Message, 'id'>) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), ...msg }]);
  };

  const handleOption = (option: Option) => {
    addMessage({ text: option.label, sender: 'user' });

    if (option.value === 'find_assessment' || option.value === 'browse_all') {
      if (!assessmentData) {
        addMessage({ text: 'Loading assessment data, please wait a moment...', sender: 'assistant' });
        return;
      }
      const modules = [...new Set(assessmentData.original.map((g) => g.module_cn))];
      const moduleOptions: Option[] = modules.map((m) => ({
        label: `${MODULE_LABELS[m]?.emoji ?? '📌'} ${MODULE_LABELS[m]?.en ?? m} (${m})`,
        value: m,
      }));
      addMessage({
        text: assessmentSlug
          ? `Using **${assessmentSlug}** assessment data. Which area are you interested in assessing?`
          : 'Which area are you interested in assessing?',
        sender: 'assistant',
        options: moduleOptions,
      });
      setStep('awaiting_module');

    } else if (option.value === 'what_is_eqai') {
      addMessage({
        text: 'EQAI is a comprehensive psychological and capability assessment platform. It offers science-backed tools to measure emotional intelligence, cognitive abilities, mental health, and parenting styles — available in both English and Chinese.',
        sender: 'assistant',
        options: [
          { label: '🔍 Find an assessment', value: 'find_assessment' },
          { label: '🏠 Go back', value: 'restart' },
        ],
      });

    } else if (option.value === 'restart') {
      setStep('idle');
      setSelectedModule(null);
      setSelectedGroup(null);
      addMessage({
        text: 'How else can I help you?',
        sender: 'assistant',
        options: [
          { label: '🔍 Find an assessment', value: 'find_assessment' },
          { label: '📋 Browse all assessments', value: 'browse_all' },
          { label: '❓ What is EQAI?', value: 'what_is_eqai' },
        ],
      });

    } else if (step === 'awaiting_module') {
      setSelectedModule(option.value);
      const groups = assessmentData!.original.filter((g) => g.module_cn === option.value);
      const groupOptions: Option[] = groups.map((g) => ({
        label: `${g.title_cn} — ${g.title_en}`,
        value: g.code,
        description: g.title_full,
      }));
      addMessage({
        text: `Great! Here are the assessment groups in **${option.value}**. Which one interests you?`,
        sender: 'assistant',
        options: groupOptions,
      });
      setStep('awaiting_group');

    } else if (step === 'awaiting_group') {
      const group = assessmentData!.original.find((g) => g.code === option.value);
      if (!group) return;
      setSelectedGroup(group);
      const measureOptions: Option[] = group.measures.map((m) => ({
        label: m.name,
        value: `${group.code}||${m.code}`,
        description: m.desc_casual ? m.desc_casual.slice(0, 80) + '…' : undefined,
      }));
      addMessage({
        text: `**${group.title_cn}** (${group.title_en}) has ${group.measures.length} dimensions. Which one would you like to learn about?`,
        sender: 'assistant',
        options: measureOptions,
      });
      setStep('awaiting_measure');

    } else if (step === 'awaiting_measure') {
      const [groupCode, measureCode] = option.value.split('||');
      const group = selectedGroup ?? assessmentData!.original.find((g) => g.code === groupCode);
      const measure = group?.measures.find((m) => m.code === measureCode);

      if (measure) {
        const desc = measure.desc_casual || measure.desc_academic || 'No description available.';
        addMessage({
          text: `**${measure.name}**\n\n${desc}`,
          sender: 'assistant',
          options: [
            { label: '🔄 Explore more dimensions', value: `back_to_group_${group?.code}` },
            { label: '📂 Choose a different group', value: `back_to_module_${selectedModule}` },
            { label: '🏠 Start over', value: 'restart' },
          ],
        });
        setStep('done');
      }

    } else if (option.value.startsWith('back_to_group_')) {
      const groupCode = option.value.replace('back_to_group_', '');
      const group = assessmentData!.original.find((g) => g.code === groupCode);
      if (!group) return;
      setSelectedGroup(group);
      const measureOptions: Option[] = group.measures.map((m) => ({
        label: m.name,
        value: `${group.code}||${m.code}`,
      }));
      addMessage({
        text: `Which dimension of **${group.title_cn}** would you like to explore?`,
        sender: 'assistant',
        options: measureOptions,
      });
      setStep('awaiting_measure');

    } else if (option.value.startsWith('back_to_module_')) {
      const moduleName = option.value.replace('back_to_module_', '');
      const groups = assessmentData!.original.filter((g) => g.module_cn === moduleName);
      const groupOptions: Option[] = groups.map((g) => ({
        label: `${g.title_cn} — ${g.title_en}`,
        value: g.code,
      }));
      addMessage({
        text: `Which assessment group in **${moduleName}** interests you?`,
        sender: 'assistant',
        options: groupOptions,
      });
      setStep('awaiting_group');
    }
  };

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setInputValue('');
    addMessage({ text: trimmed, sender: 'user' });

    if (!assessmentData) {
      addMessage({ text: 'Still loading data, please try in a moment.', sender: 'assistant' });
      return;
    }

    const lower = trimmed.toLowerCase();

    // 1. Check natural language keyword map first
    const keywordResult = findByKeywords(trimmed, assessmentData);
    if (keywordResult) {
      const options: Option[] = keywordResult.matches.map((g) => ({
        label: `${g.title_cn} — ${g.title_en}`,
        value: g.code,
        description: g.title_full,
      }));
      addMessage({ text: keywordResult.reply, sender: 'assistant', options });
      setStep('awaiting_group');
      return;
    }

    // 2. Fallback: exact text search across groups and measures
    const matches = assessmentData.original.filter(
      (g) =>
        g.title_en.toLowerCase().includes(lower) ||
        g.title_cn.includes(trimmed) ||
        g.module_cn.includes(trimmed) ||
        g.measures.some((m) => m.name.includes(trimmed) || m.desc_casual.includes(trimmed))
    );

    if (matches.length > 0) {
      const options: Option[] = matches.slice(0, 5).map((g) => ({
        label: `${g.title_cn} — ${g.title_en}`,
        value: g.code,
      }));
      addMessage({
        text: `I found ${matches.length} matching assessment group${matches.length > 1 ? 's' : ''}. Which would you like to explore?`,
        sender: 'assistant',
        options,
      });
      setStep('awaiting_group');
    } else if (lower.includes('help') || lower.includes('what') || lower.includes('how')) {
      addMessage({
        text: 'I can help you browse and understand our assessment library. Try selecting an area below:',
        sender: 'assistant',
        options: [
          { label: '🔍 Find an assessment', value: 'find_assessment' },
          { label: '📋 Browse all assessments', value: 'browse_all' },
        ],
      });
    } else {
      addMessage({
        text: `I didn't find an exact match for "${trimmed}". Try browsing by category:`,
        sender: 'assistant',
        options: [
          { label: '🧠 Ability & Development (能力与发展)', value: '能力与发展' },
          { label: '💚 Health & Wellbeing (身心健康)', value: '身心健康' },
          { label: '👨‍👩‍👧 Parenting (家长参与)', value: '家长参与' },
        ],
      });
      setStep('awaiting_module');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---- Styles ----
  const containerStyle: React.CSSProperties = variant === 'inline'
    ? {
        width: '100%',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }
    : {
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      };

  const chatWindowStyle: React.CSSProperties = variant === 'inline'
    ? {
        width: '100%',
        height: '520px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        border: '2px solid #0ea5e9',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }
    : {
        marginBottom: '12px',
        width: '380px',
        maxWidth: 'calc(100vw - 32px)',
        height: '520px',
        maxHeight: 'calc(100vh - 100px)',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        border: '2px solid #0ea5e9',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      };

  const headerStyle: React.CSSProperties = {
    padding: '14px 16px',
    background: 'linear-gradient(to right, #0ea5e9, #14b8a6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  };

  const messagesAreaStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  };

  const userBubbleStyle: React.CSSProperties = {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '18px 18px 4px 18px',
    backgroundColor: '#0ea5e9',
    color: '#ffffff',
    fontSize: '13px',
    alignSelf: 'flex-end',
  };

  const assistantBubbleStyle: React.CSSProperties = {
    maxWidth: '88%',
    padding: '10px 14px',
    borderRadius: '18px 18px 18px 4px',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    fontSize: '13px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    alignSelf: 'flex-start',
    whiteSpace: 'pre-wrap',
  };

  const optionButtonStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '8px 12px',
    marginTop: '6px',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#0369a1',
    transition: 'all 0.15s',
    lineHeight: '1.4',
  };

  const inputAreaStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px 16px',
    fontSize: '13px',
    border: '2px solid #e5e7eb',
    borderRadius: '24px',
    outline: 'none',
  };

  const sendButtonStyle: React.CSSProperties = {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: inputValue.trim() ? '#0ea5e9' : '#d1d5db',
    border: 'none',
    cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const toggleButtonStyle: React.CSSProperties = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(to right, #0ea5e9, #14b8a6)',
    border: 'none',
    boxShadow: '0 4px 20px rgba(14,165,233,0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Format message text (bold via **)
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  if (variant === 'inline') {
    return (
      <div style={containerStyle}>
        <div style={chatWindowStyle} role="region" aria-labelledby="chat-title-inline">
          {/* Header */}
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px'
              }}>🧠</div>
              <div>
                <h2 id="chat-title-inline" style={{ color: '#fff', fontWeight: 600, fontSize: '14px', margin: 0 }}>
                  Assessment Guide
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', margin: 0 }}>
                  Find the right assessment for you
                </p>
              </div>
            </div>
          </div>
          {/* Messages */}
          <div style={messagesAreaStyle} role="log" aria-live="polite">
            {messages.map((msg) => (
              <div key={msg.id} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                <div style={msg.sender === 'user' ? userBubbleStyle : assistantBubbleStyle}>
                  {formatText(msg.text)}
                </div>
                {msg.options && msg.sender === 'assistant' && (
                  <div style={{ marginTop: '4px' }}>
                    {msg.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleOption(opt)}
                        style={optionButtonStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; e.currentTarget.style.borderColor = '#7dd3fc'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f0f9ff'; e.currentTarget.style.borderColor = '#bae6fd'; }}
                      >
                        {opt.label}
                        {opt.description && (
                          <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{opt.description}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <div style={inputAreaStyle}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search assessments or ask a question..."
              style={inputStyle}
              aria-label="Type your message"
            />
            <button onClick={handleSend} disabled={!inputValue.trim()} style={sendButtonStyle} aria-label="Send">
              <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {isOpen && (
        <div style={chatWindowStyle} role="dialog" aria-labelledby="chat-title" aria-modal="true">
          {/* Header */}
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px'
              }}>🧠</div>
              <div>
                <h2 id="chat-title" style={{ color: '#fff', fontWeight: 600, fontSize: '14px', margin: 0 }}>
                  Assessment Guide
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', margin: 0 }}>
                  Find the right assessment for you
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
              aria-label="Close chat"
            >
              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={messagesAreaStyle} role="log" aria-live="polite">
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}
              >
                <div style={msg.sender === 'user' ? userBubbleStyle : assistantBubbleStyle}>
                  {formatText(msg.text)}
                </div>
                {msg.options && msg.sender === 'assistant' && (
                  <div style={{ marginTop: '4px' }}>
                    {msg.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleOption(opt)}
                        style={optionButtonStyle}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#e0f2fe';
                          e.currentTarget.style.borderColor = '#7dd3fc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f9ff';
                          e.currentTarget.style.borderColor = '#bae6fd';
                        }}
                      >
                        {opt.label}
                        {opt.description && (
                          <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                            {opt.description}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={inputAreaStyle}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search assessments or ask a question..."
              style={inputStyle}
              aria-label="Type your message"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              style={sendButtonStyle}
              aria-label="Send"
            >
              <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={toggleButtonStyle}
        aria-label={isOpen ? 'Close chat' : 'Open assessment guide'}
        aria-expanded={isOpen}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(14,165,233,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(14,165,233,0.4)';
        }}
      >
        {isOpen ? (
          <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
