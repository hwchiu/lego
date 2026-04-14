'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import rawContent from '@/content/chatbot.md';
import { extractJson } from '@/app/lib/parseContent';
import { BASE_PATH } from '@/app/lib/basePath';
import { useLanguage } from '@/app/contexts/LanguageContext';

// ── Types ──────────────────────────────────────────────────────────────────────

interface PageLink {
  label: string;
  href: string;
}

interface ScenarioData {
  id: string;
  label: string;
  summary: string;
  steps: string[];
  links: PageLink[];
}

interface RoleData {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  scenarios: ScenarioData[];
}

interface ChatbotKnowledge {
  greeting: string;
  roles: RoleData[];
}

interface ChatMessage {
  id: number;
  role: 'bot' | 'user';
  text: string;
  options?: Array<{ id: string; label: string; icon?: string }>;
  links?: PageLink[];
  steps?: string[];
}

// ── Load knowledge base ────────────────────────────────────────────────────────

const knowledge = extractJson<ChatbotKnowledge>(rawContent);
const BOT_GREETING = knowledge.greeting;
const ROLES = knowledge.roles;

const BOT_AVATAR_URL = `${BASE_PATH}/images/bot-avatar.svg`;

// ── AI preset question — entering this exact text triggers AI simulation ──────
const AI_PRESET_QUESTION_ZH = 'T Company 近期的供應鏈風險有哪些？';
const AI_PRESET_QUESTION_EN = "What are T Company's recent supply chain risks?";

function isPresetQuestion(text: string): boolean {
  const t = text.trim();
  return t === AI_PRESET_QUESTION_ZH || t === AI_PRESET_QUESTION_EN;
}

// Simulated AI-calculated amount for the task
const AI_SIMULATED_AMOUNT = 15000;

type FlowStep = 'role' | 'scenario' | 'guide' | 'done';

// Chat bubble icon
function ChatBubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(255,255,255,0.12)"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="10" height="10" aria-hidden="true">
      <path d="M6 3H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M9 2h3v3M12 2L8 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AIChatbot() {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>('role');
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const msgIdRef = useRef(1);

  // Task input & amount fields
  const [taskInput, setTaskInput] = useState('');
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [amountValue, setAmountValue] = useState('');

  const presetQuestion = lang === 'zh' ? AI_PRESET_QUESTION_ZH : AI_PRESET_QUESTION_EN;

  function nextId() {
    msgIdRef.current += 1;
    return msgIdRef.current;
  }

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: 'bot',
      text: BOT_GREETING,
      options: ROLES.map((r) => ({ id: r.id, label: r.label, icon: r.icon })),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const [dialogPos, setDialogPos] = useState<{ top: number; left: number } | null>(null);
  const dragState = useRef<{
    mouseStartX: number;
    mouseStartY: number;
    dialogStartTop: number;
    dialogStartLeft: number;
  } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [open, messages]);

  // Reset on close
  function handleClose() {
    setOpen(false);
  }

  function handleOpen() {
    setOpen(true);
  }

  function resetFlow() {
    setFlowStep('role');
    setSelectedRole(null);
    msgIdRef.current = 1;
    setTaskInput('');
    setShowAmountInput(false);
    setAmountValue('');
    setMessages([
      {
        id: 0,
        role: 'bot',
        text: BOT_GREETING,
        options: ROLES.map((r) => ({ id: r.id, label: r.label, icon: r.icon })),
      },
    ]);
  }

  function addBotMessage(msg: Omit<ChatMessage, 'id' | 'role'>) {
    setMessages((prev) => [...prev, { ...msg, id: nextId(), role: 'bot' }]);
  }

  function addUserMessage(text: string) {
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }]);
  }

  function handleRoleSelect(roleId: string) {
    const role = ROLES.find((r) => r.id === roleId);
    if (!role) return;
    setSelectedRole(role);
    setFlowStep('scenario');
    addUserMessage(`${role.icon} ${role.label}`);
    setTimeout(() => {
      addBotMessage({
        text: role.prompt,
        options: role.scenarios.map((s) => ({ id: s.id, label: s.label })),
      });
    }, 500);
  }

  function handleScenarioSelect(scenarioId: string) {
    if (!selectedRole) return;
    const scenario = selectedRole.scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;
    setFlowStep('guide');
    addUserMessage(scenario.label);
    setTimeout(() => {
      addBotMessage({
        text: `Great choice! Here's how to "${scenario.label}" as a ${selectedRole.label}:\n\n${scenario.summary}`,
        steps: scenario.steps,
        links: scenario.links,
      });
      setTimeout(() => {
        addBotMessage({
          text: 'Would you like to explore another scenario or switch roles?',
          options: [
            { id: '__another', label: `More ${selectedRole.label} scenarios` },
            { id: '__switch', label: 'Switch role' },
          ],
        });
        setFlowStep('done');
      }, 600);
    }, 500);
  }

  function handleOptionClick(optionId: string) {
    if (flowStep === 'role') {
      handleRoleSelect(optionId);
    } else if (flowStep === 'scenario') {
      handleScenarioSelect(optionId);
    } else if (flowStep === 'done') {
      if (optionId === '__another' && selectedRole) {
        setFlowStep('scenario');
        addUserMessage(`More ${selectedRole.label} scenarios`);
        setTimeout(() => {
          addBotMessage({
            text: selectedRole.prompt,
            options: selectedRole.scenarios.map((s) => ({ id: s.id, label: s.label })),
          });
        }, 400);
      } else if (optionId === '__switch') {
        addUserMessage('Switch role');
        setTimeout(() => resetFlow(), 400);
      }
    }
  }

  // ── Start task: check preset question → AI sim or billing amount ──────────────
  function handleStartTask() {
    const text = taskInput.trim();
    if (!text) return;
    if (isPresetQuestion(text)) {
      // Trigger AI simulation — show the guided flow result inline
      addUserMessage(text);
      setTaskInput('');
      setShowAmountInput(false);
      setTimeout(() => {
        addBotMessage({
          text: `AI Analysis: Based on "${text}", here are T Company's recent supply chain risks:\n\n• Over-concentration on a single advanced-node foundry partner\n• Geopolitical tension affecting cross-strait logistics\n• Rare earth material shortages impacting CoWoS packaging capacity\n• Lead-time extension for HBM memory stacks from key suppliers`,
          steps: [
            'Review Supply Chain Maps → Supplier for Tier 1 & Tier 2 exposure.',
            'Check Market News for latest disruption signals.',
            'Visit Company Profile → Supply Chain tab for real-time risk scores.',
          ],
          links: [
            { label: 'Supplier Map', href: '/supply-chain-maps/supplier' },
            { label: 'Market News', href: '/market-news' },
          ],
        });
      }, 600);
    } else {
      // Non-preset question — show amount input for billing
      addUserMessage(text);
      setTaskInput('');
      setShowAmountInput(true);
      setAmountValue('');
      setTimeout(() => {
        addBotMessage({
          text: 'Please enter the amount for this task, or select "AI Estimate" to use the AI-calculated total.',
        });
      }, 400);
    }
  }

  function handleAmountSubmit() {
    const num = parseFloat(amountValue);
    if (isNaN(num)) return;
    const formatted = num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    addUserMessage(`Task submitted — Amount: $${formatted}`);
    setShowAmountInput(false);
    setAmountValue('');
    setTimeout(() => {
      addBotMessage({ text: `✓ Task recorded with amount $${formatted}. Is there anything else I can help you with?` });
    }, 400);
  }

  // Drag support
  const handleHeaderMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dialogRef.current) return;
    const rect = dialogRef.current.getBoundingClientRect();
    dragState.current = {
      mouseStartX: e.clientX,
      mouseStartY: e.clientY,
      dialogStartTop: rect.top,
      dialogStartLeft: rect.left,
    };
    e.preventDefault();
  }, []);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragState.current || !dialogRef.current) return;
      const dx = e.clientX - dragState.current.mouseStartX;
      const dy = e.clientY - dragState.current.mouseStartY;
      const dialogW = dialogRef.current.offsetWidth;
      const dialogH = dialogRef.current.offsetHeight;
      setDialogPos({
        top: Math.max(0, Math.min(window.innerHeight - dialogH, dragState.current.dialogStartTop + dy)),
        left: Math.max(0, Math.min(window.innerWidth - dialogW, dragState.current.dialogStartLeft + dx)),
      });
    }
    function onMouseUp() {
      dragState.current = null;
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <>
      <button
        className={`chatbot-fab${open ? ' chatbot-fab--open' : ''}`}
        onClick={() => (open ? handleClose() : handleOpen())}
        aria-label="AI Chatbot"
        title="AI Chatbot — guided navigation"
      >
        <ChatBubbleIcon />
      </button>

      {open && (
        <div
          ref={dialogRef}
          className="chatbot-dialog"
          role="dialog"
          aria-label="AI Chatbot Mic"
          style={
            dialogPos
              ? { top: dialogPos.top, left: dialogPos.left, right: 'auto', transform: 'none' }
              : undefined
          }
        >
          {/* Header */}
          <div
            className="chatbot-dialog-header chatbot-dialog-header--draggable"
            onMouseDown={handleHeaderMouseDown}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BOT_AVATAR_URL} alt="Mic avatar" className="chatbot-dialog-avatar" />
            <div>
              <div className="chatbot-dialog-name">Mic</div>
              <div className="chatbot-dialog-status">AI Guide · Guided Navigation</div>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
              <button
                className="chatbot-dialog-reset"
                onClick={(e) => { e.stopPropagation(); resetFlow(); }}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label="Restart"
                title="Start over"
              >
                <svg viewBox="0 0 16 16" fill="none" width="13" height="13" aria-hidden="true">
                  <path d="M2.5 8A5.5 5.5 0 1 0 4 4.5L2 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 3v3h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="chatbot-dialog-close"
                onClick={() => setOpen(false)}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label="Close"
              >
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                  <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-dialog-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-bubble-wrap${msg.role === 'user' ? ' chatbot-bubble-wrap--user' : ''}`}
              >
                {msg.role === 'bot' && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={BOT_AVATAR_URL} alt="Mic" className="chatbot-bot-avatar" />
                )}
                <div className="chatbot-bubble-col">
                  <div className={`chatbot-bubble${msg.role === 'user' ? ' chatbot-bubble--user' : ''}`}>
                    {msg.text}
                  </div>

                  {/* Step list */}
                  {msg.steps && msg.steps.length > 0 && (
                    <ol className="chatbot-step-list">
                      {msg.steps.map((step, i) => (
                        <li key={i} className="chatbot-step-item">
                          <span className="chatbot-step-num">{i + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  {/* Page links */}
                  {msg.links && msg.links.length > 0 && (
                    <div className="chatbot-links-row">
                      {msg.links.map((link) => (
                        <Link
                          key={link.href + link.label}
                          href={link.href}
                          className="chatbot-page-link"
                          onClick={() => setOpen(false)}
                        >
                          {link.label}
                          <ExternalLinkIcon />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Option buttons */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="chatbot-options-row">
                      {msg.options.map((opt) => (
                        <button
                          key={opt.id}
                          className="chatbot-option-btn"
                          onClick={() => handleOptionClick(opt.id)}
                        >
                          {opt.icon && <span>{opt.icon}</span>}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Task input row */}
          <div className="chatbot-dialog-input-row">
            <input
              className="chatbot-input"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder={presetQuestion}
              onKeyDown={(e) => e.key === 'Enter' && handleStartTask()}
              aria-label="Enter question or task"
              disabled={showAmountInput}
            />
            <button
              className="chatbot-start-task-btn"
              onClick={handleStartTask}
              disabled={!taskInput.trim() || showAmountInput}
              title="Start task"
            >
              Start task
            </button>
          </div>

          {/* Amount input row — shown when non-preset question entered */}
          {showAmountInput && (
            <div className="chatbot-amount-row">
              <input
                className="chatbot-amount-input"
                type="number"
                min="0"
                step="0.01"
                value={amountValue}
                onChange={(e) => setAmountValue(e.target.value)}
                placeholder="Enter amount…"
                aria-label="Task amount"
              />
              <button
                className="chatbot-amount-ai-btn"
                onClick={() => setAmountValue(String(AI_SIMULATED_AMOUNT))}
                title="Fill in AI-calculated amount"
              >
                AI Estimate
              </button>
              <button
                className="chatbot-amount-submit-btn"
                onClick={handleAmountSubmit}
                disabled={!amountValue || isNaN(parseFloat(amountValue))}
              >
                Submit
              </button>
            </div>
          )}

          {/* Footer hint */}
          <div className="chatbot-dialog-footer-hint">
            Type a question above or select an option · <button className="chatbot-restart-link" onClick={resetFlow}>Restart</button>
          </div>
        </div>
      )}
    </>
  );
}
