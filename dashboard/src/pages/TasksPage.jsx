import { useState } from 'react'
import { useTasks } from '../context/TaskContext'
import { useAgents } from '../context/AgentContext'

const statusLabel = { completed: 'Concluída', running: 'Executando', pending: 'Pendente', failed: 'Falha' }
const priorityLabel = { critical: 'Crítica', high: 'Alta', medium: 'Média', low: 'Baixa' }

export default function TasksPage() {
    const { tasks, createTask, executeTask, deleteTask, tasksByStatus, workflows } = useTasks()
    const { agents } = useAgents()
    const [showCreate, setShowCreate] = useState(false)
    const [filter, setFilter] = useState('all')
    const [activeTab, setActiveTab] = useState('tasks')
    const [form, setForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium' })

    const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

    const handleCreate = () => {
        if (!form.title.trim()) return
        createTask(form)
        setForm({ title: '', description: '', assignedTo: '', priority: 'medium' })
        setShowCreate(false)
    }

    const formatDate = (iso) => {
        if (!iso) return '—'
        return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    }

    return (
        <>
            <div className="page-header fade-in-up">
                <h2>Tarefas & Workflows</h2>
                <p>Gerenciamento de tarefas em execução, pendentes e automatizações.</p>
            </div>

            {/* Tabs */}
            <div className="tasks-tabs fade-in-up">
                <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
                    Tarefas <span className="tab-count">({tasks.length})</span>
                </button>
                <button className={`tab-btn ${activeTab === 'workflows' ? 'active' : ''}`} onClick={() => setActiveTab('workflows')}>
                    Workflows <span className="tab-count">({workflows.length})</span>
                </button>
            </div>

            {activeTab === 'tasks' && (
                <>
                    {/* Stats Row */}
                    <div className="task-stats fade-in-up fade-in-up-delay-1">
                        <div className={`task-stat-card ${filter === 'all' ? '' : ''}`} onClick={() => setFilter('all')}>
                            <div className="task-stat-value" style={{ color: 'var(--text-primary)' }}>{tasks.length}</div>
                            <div className="task-stat-label">Total</div>
                        </div>
                        <div className="task-stat-card running" onClick={() => setFilter('running')}>
                            <div className="task-stat-value" style={{ color: 'var(--blue)' }}>{tasksByStatus.running.length}</div>
                            <div className="task-stat-label">Executando</div>
                        </div>
                        <div className="task-stat-card pending" onClick={() => setFilter('pending')}>
                            <div className="task-stat-value" style={{ color: 'var(--amber)' }}>{tasksByStatus.pending.length}</div>
                            <div className="task-stat-label">Pendentes</div>
                        </div>
                        <div className="task-stat-card completed" onClick={() => setFilter('completed')}>
                            <div className="task-stat-value" style={{ color: 'var(--green)' }}>{tasksByStatus.completed.length}</div>
                            <div className="task-stat-label">Concluídas</div>
                        </div>
                    </div>

                    {/* Action bar */}
                    <div className="task-action-bar fade-in-up fade-in-up-delay-2">
                        <div className="task-filter-group">
                            {['all', 'running', 'pending', 'completed'].map(f => (
                                <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                    {f === 'all' ? 'Todas' : statusLabel[f]}
                                </button>
                            ))}
                        </div>
                        <button className="btn-primary" onClick={() => setShowCreate(true)}>
                            + Nova Tarefa
                        </button>
                    </div>

                    {/* Task Grid */}
                    <div className="task-grid-modern fade-in-up fade-in-up-delay-3">
                        {filteredTasks.map((task) => {
                            const agent = agents.find(a => a.id === task.assignedTo)
                            return (
                                <div key={task.id} className="task-card-premium">
                                    <div className="task-header-row">
                                        <span className={`priority-indicator ${task.priority}`} />
                                        <span className="task-id">{task.id}</span>
                                        <span className={`status-pill ${task.status}`}>
                                            {statusLabel[task.status]}
                                        </span>
                                    </div>

                                    <div className="task-title-text">{task.title}</div>
                                    <div className="task-desc-text">{task.description}</div>

                                    {agent && (
                                        <div className="task-assignment">
                                            <div className={`agent-mini-avatar ${agent.iconClass}`}>
                                                {agent.icon === 'zap' ? '⚡' : agent.icon === 'gem' ? '💎' : agent.icon === 'database' ? '🗄️' : '🤖'}
                                            </div>
                                            <div className="assignment-info">
                                                <div className="assignee-name">{agent.name}</div>
                                                <div className="assignee-role">{agent.role}</div>
                                            </div>
                                        </div>
                                    )}

                                    {task.progress !== undefined && (
                                        <div className="task-progress-section">
                                            <div className="progress-labels">
                                                <span>Progresso</span>
                                                <span>{task.progress}%</span>
                                            </div>
                                            <div className="progress-track-premium">
                                                <div className="progress-fill-premium" style={{ width: `${task.progress}%` }} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="task-footer-premium">
                                        <div className="task-times">
                                            <div className="time-item">
                                                <span className="time-label">Criada</span>
                                                <span className="time-value">{formatDate(task.createdAt)}</span>
                                            </div>
                                            {task.completedAt && (
                                                <div className="time-item">
                                                    <span className="time-label">Concluída</span>
                                                    <span className="time-value">{formatDate(task.completedAt)}</span>
                                                </div>
                                            )}
                                            {task.duration && (
                                                <div className="time-item">
                                                    <span className="time-label">Duração</span>
                                                    <span className="time-value">{task.duration}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="task-actions-premium">
                                            {task.status === 'pending' && (
                                                <button className="icon-btn-action" title="Executar" onClick={() => executeTask(task.id)}>▶</button>
                                            )}
                                            <button className="icon-btn-danger" title="Excluir" onClick={() => deleteTask(task.id)}>🗑</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            {activeTab === 'workflows' && (
                <div className="workflow-list fade-in-up">
                    {workflows.map((wf) => (
                        <div key={wf.id} className="workflow-card">
                            <div className="workflow-card-header">
                                <div>
                                    <h4>{wf.name}</h4>
                                    <p>{wf.description}</p>
                                </div>
                                <span className={`wf-status-badge wf-${wf.status}`}>
                                    {wf.status === 'active' ? 'Ativo' : wf.status === 'paused' ? 'Pausado' : 'Inativo'}
                                </span>
                            </div>
                            <div className="workflow-card-meta">
                                <span>🕐 Schedule: <code>{wf.schedule}</code></span>
                                <span>📋 {wf.tasks.length} tarefas vinculadas</span>
                                {wf.lastRun && <span>🔄 Última: {formatDate(wf.lastRun)}</span>}
                            </div>
                            {wf.executionHistory && wf.executionHistory.length > 0 && (
                                <div className="workflow-history">
                                    <div className="workflow-history-title">Histórico Recente</div>
                                    {wf.executionHistory.map((exec, i) => (
                                        <div key={i} className="wf-history-item">
                                            <span>{formatDate(exec.date)}</span>
                                            <span>{exec.duration.toFixed(1)} min</span>
                                            <span className={`wf-exec-status ${exec.status}`}>{exec.status === 'success' ? '✓ Sucesso' : '✗ Falha'}</span>
                                            {exec.records && <span>{exec.records} registros</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Nova Tarefa</h3>
                        <div className="modal-form">
                            <div className="form-group">
                                <label>Título</label>
                                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Extração SCI Semanal" />
                            </div>
                            <div className="form-group">
                                <label>Descrição</label>
                                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descreva a tarefa..." />
                            </div>
                            <div className="form-group">
                                <label>Atribuir a</label>
                                <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                                    <option value="">Selecionar agente...</option>
                                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Prioridade</label>
                                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                    <option value="low">Baixa</option>
                                    <option value="medium">Média</option>
                                    <option value="high">Alta</option>
                                    <option value="critical">Crítica</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancelar</button>
                            <button className="btn-primary" onClick={handleCreate}>Criar Tarefa</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
