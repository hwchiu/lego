'use client';

import { useState } from 'react';
import type { Canvas, Task, Member, TaskStatus, TaskPriority } from '@/app/data/collaboration';

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: '待處理',
  'in-progress': '進行中',
  done: '已完成',
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  todo: '#6b7280',
  'in-progress': '#2563eb',
  done: '#16a34a',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  high: '#dc2626',
  medium: '#d97706',
  low: '#6b7280',
};

interface TaskPanelProps {
  canvas: Canvas;
  onClose: () => void;
}

export function TaskPanel({ canvas, onClose }: TaskPanelProps) {
  const [tasks, setTasks] = useState<Task[]>(canvas.tasks);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState(canvas.members[0]?.id ?? '');
  const [newDue, setNewDue] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');

  const filtered = filterStatus === 'all' ? tasks : tasks.filter((t) => t.status === filterStatus);

  function addTask() {
    if (!newTitle.trim()) return;
    const member = canvas.members.find((m) => m.id === newAssigneeId) ?? canvas.members[0];
    const task: Task = {
      id: `t-${Date.now()}`,
      title: newTitle.trim(),
      status: 'todo',
      assignee: member,
      due: newDue || '—',
      priority: newPriority,
    };
    setTasks([task, ...tasks]);
    setNewTitle('');
    setNewDue('');
    setNewPriority('medium');
    setShowForm(false);
  }

  function cycleStatus(id: string) {
    const order: TaskStatus[] = ['todo', 'in-progress', 'done'];
    setTasks(
      tasks.map((t) => {
        if (t.id !== id) return t;
        const next = order[(order.indexOf(t.status) + 1) % order.length];
        return { ...t, status: next };
      }),
    );
  }

  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;

  return (
    <aside className="pg-task-panel">
      {/* Header */}
      <div className="pg-task-header">
        <div className="pg-task-header-left">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
            <path
              d="M7 3H3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1h-4"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <rect x="7" y="1" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 9l2 2 4-4" stroke="#4fc3f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>任務追蹤</span>
          <span className="pg-task-badge-slack">Slack</span>
        </div>
        <button className="pg-task-close" onClick={onClose} aria-label="關閉任務面板">
          ✕
        </button>
      </div>

      {/* Summary bar */}
      <div className="pg-task-summary">
        <span className="pg-task-stat">
          <span className="pg-task-stat-num" style={{ color: '#dc2626' }}>
            {todoCount}
          </span>{' '}
          待處理
        </span>
        <span className="pg-task-stat-sep" />
        <span className="pg-task-stat">
          <span className="pg-task-stat-num" style={{ color: '#2563eb' }}>
            {inProgressCount}
          </span>{' '}
          進行中
        </span>
        <span className="pg-task-stat-sep" />
        <span className="pg-task-stat">
          <span className="pg-task-stat-num" style={{ color: '#16a34a' }}>
            {tasks.length - todoCount - inProgressCount}
          </span>{' '}
          已完成
        </span>
      </div>

      {/* Filter tabs */}
      <div className="pg-task-filter-row">
        {(['all', 'todo', 'in-progress', 'done'] as const).map((s) => (
          <button
            key={s}
            className={`pg-task-filter-btn${filterStatus === s ? ' active' : ''}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === 'all' ? '全部' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="pg-task-list">
        {filtered.map((task) => (
          <div key={task.id} className={`pg-task-item${task.status === 'done' ? ' done' : ''}`}>
            <button
              className="pg-task-status-btn"
              style={{ background: STATUS_COLOR[task.status] }}
              onClick={() => cycleStatus(task.id)}
              title="點擊切換狀態"
            >
              {task.status === 'done' ? '✓' : task.status === 'in-progress' ? '⟳' : '○'}
            </button>
            <div className="pg-task-content">
              <div className="pg-task-title">{task.title}</div>
              <div className="pg-task-meta">
                <span
                  className="pg-task-priority"
                  style={{ background: PRIORITY_COLOR[task.priority] + '22', color: PRIORITY_COLOR[task.priority] }}
                >
                  {PRIORITY_LABEL[task.priority]}優先
                </span>
                <img
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  title={task.assignee.name}
                  width={18}
                  height={18}
                  style={{ borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #e5e7eb' }}
                />
                <span className="pg-task-assignee">{task.assignee.name}</span>
                {task.due !== '—' && (
                  <span className="pg-task-due">
                    📅 {task.due}
                  </span>
                )}
                {task.slackRef && (
                  <span className="pg-task-slack-ref">{task.slackRef}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="pg-task-empty">目前沒有符合條件的任務</div>
        )}
      </div>

      {/* Add task form / button */}
      {showForm ? (
        <div className="pg-task-form">
          <div className="pg-form-row">
            <label className="pg-form-label">任務名稱</label>
            <input
              className="pg-form-input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="輸入任務描述..."
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
          </div>
          <div className="pg-form-row">
            <label className="pg-form-label">指派成員</label>
            <select
              className="pg-form-select"
              value={newAssigneeId}
              onChange={(e) => setNewAssigneeId(e.target.value)}
            >
              {canvas.members.map((m: Member) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.role}
                </option>
              ))}
            </select>
          </div>
          <div className="pg-form-row-2col">
            <div className="pg-form-row">
              <label className="pg-form-label">到期日</label>
              <input
                className="pg-form-input"
                type="date"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
              />
            </div>
            <div className="pg-form-row">
              <label className="pg-form-label">優先度</label>
              <select
                className="pg-form-select"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
          <div className="pg-form-actions">
            <button className="pg-btn-primary" onClick={addTask}>
              新增任務
            </button>
            <button className="pg-btn-ghost" onClick={() => setShowForm(false)}>
              取消
            </button>
          </div>
        </div>
      ) : (
        <button className="pg-add-task-btn" onClick={() => setShowForm(true)}>
          <span>＋</span> 新增任務
        </button>
      )}
    </aside>
  );
}
