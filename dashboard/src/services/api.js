/**
 * Caio Corp — Operations Intelligence Center API v4.1
 * 
 * LIVE DATA: fetches real agent data from Gateway API (port 18795).
 * AUTHORITATIVE METADATA: All names, roles, and UI properties are defined here.
 */

// Fallback no modo DEV local. Na VPS (Produção), usa o próprio domínio para o Traefik rotear
const BASE_URL = import.meta.env.VITE_API_URL || ''

// ─── UTILS ─────────────────────────────────────────────────────────

async function fetchAPI(endpoint, options = {}) {
    try {
        const headers = {
            ...options.headers,
        };

        if (options.body && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
            signal: options._chatRequest ? AbortSignal.timeout(90000) : AbortSignal.timeout(30000),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API ${response.status}`);
        }

        return await response.json()
    } catch (err) {
        console.error(`API Error [${endpoint}]:`, err);
        return { status: 'error', message: err.message };
    }
}

// ─── CLIENT-SIDE TTL CACHE ─────────────────────────────────────────
// Avoids blank screens when navigating between pages.
// Agent data (agents, events, status) is cached for 10s.
// Slow endpoints like email inbox cached for 30s.
const _cache = new Map()

function _isCacheValid(entry, ttlMs) {
    return entry && (Date.now() - entry.ts) < ttlMs
}

async function cachedFetch(key, fetcher, ttlMs = 10000) {
    const entry = _cache.get(key)
    if (_isCacheValid(entry, ttlMs)) {
        // Return cached data immediately, refresh in background
        fetcher().then(fresh => _cache.set(key, { ts: Date.now(), data: fresh })).catch(() => { })
        return entry.data
    }
    const data = await fetcher()
    if (data) _cache.set(key, { ts: Date.now(), data })
    return data
}

// ─── STATUS SYSTEM ─────────────────────────────────────────────────

export const STATUS_CONFIG = {
    online: { label: 'Online', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', dot: '#22c55e', pulse: false },
    executando: { label: 'Executando', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', dot: '#3b82f6', pulse: true },
    running: { label: 'Executando', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', dot: '#3b82f6', pulse: true },
    aguardando: { label: 'Aguardando', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b', pulse: false },
    erro: { label: 'Erro', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', dot: '#ef4444', pulse: true },
    error: { label: 'Erro', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', dot: '#ef4444', pulse: true },
    offline: { label: 'Offline', color: '#52525b', bg: 'rgba(82,82,91,0.12)', dot: '#52525b', pulse: false },
}

// ─── EVENT TYPES ───────────────────────────────────────────────────

export const EVENT_TYPES = {
    agent_started: { label: 'Iniciado', icon: '▶', color: '#3b82f6' },
    agent_stopped: { label: 'Parado', icon: '⏹', color: '#52525b' },
    start: { label: 'Iniciado', icon: '▶', color: '#3b82f6' },
    task_running: { label: 'Executando', icon: '⟳', color: '#06b6d4' },
    running: { label: 'Executando', icon: '⟳', color: '#06b6d4' },
    task_completed: { label: 'Concluído', icon: '✓', color: '#22c55e' },
    completed: { label: 'Concluído', icon: '✓', color: '#22c55e' },
    task_failed: { label: 'Falhou', icon: '✗', color: '#ef4444' },
    failed: { label: 'Falhou', icon: '✗', color: '#ef4444' },
    alert: { label: 'Alerta', icon: '⚠', color: '#f59e0b' },
    heartbeat: { label: 'Heartbeat', icon: '💓', color: '#a78bfa' },
}

// ─── AGENT REGISTRY (METADATA & FALLBACK) ─────────────────────────

const AGENT_UI_META = {
    // ── Tier 0: CEO ────────────────────────────────────
    'caio-ceo': {
        name: 'Caio (CEO)', role: 'Orquestrador Principal', iconEmoji: '🧠', iconClass: 'ceo', type: 'orchestrator', tier: 0, parentId: null,
        description: 'Coordena todos os agentes, delega tarefas, recebe relatórios e centraliza notificações.',
        capabilities: ['Orquestração', 'Delegação', 'Relatórios', 'Notificações']
    },

    // ── Tier 1: Agentes (Infraestrutura & Monitoramento) ──
    'agent-token': {
        name: 'Agente Token', role: 'Auditor de Consumo', iconEmoji: '💎', iconClass: 'token', type: 'agent', tier: 1, parentId: 'caio-ceo',
        description: 'Análise de consumo de tokens por agente e global. Detecta tendências e alerta limites.',
        capabilities: ['Consumo Total', 'Por Agente', 'Tendências', 'Alertas de Limite']
    },
    'agent-bd': {
        name: 'Agente BD', role: 'Monitor de Dados', iconEmoji: '🗄️', iconClass: 'bd', type: 'agent', tier: 1, parentId: 'caio-ceo',
        description: 'Monitora Banco de Dados Supabase — queries, escritas, leituras, falhas e tempo de resposta.',
        capabilities: ['Queries', 'Escritas', 'Leituras', 'Health Check']
    },
    'agent-life': {
        name: 'Agente Life', role: 'Supervisor do Sistema', iconEmoji: '❤️', iconClass: 'life', type: 'agent', tier: 1, parentId: 'caio-ceo',
        description: 'Observabilidade geral: monitora todos os agentes, detecta erros, identifica falhas e gera alertas.',
        capabilities: ['Health Overview', 'Error Detection', 'Alert Feed', 'Auto-Recovery']
    },
    'agent-sso': {
        name: 'Agente SSO', role: 'Infra & Saúde VPS', iconEmoji: '🖥️', iconClass: 'sso', type: 'agent', tier: 1, parentId: 'caio-ceo',
        description: 'Monitora infraestrutura da VPS: CPU, Memória, Disco, Ping e Uptime.',
        capabilities: ['CPU', 'Memória', 'Disco', 'Ping', 'Uptime']
    },

    // ── Tier 2: Especialistas (Execução de Tarefas) ────
    'spec-pendencias': {
        name: 'Especialista em Pendências', role: 'Data Extractor', iconEmoji: '⚡', iconClass: 'pendencias', type: 'specialist', tier: 2, parentId: 'agent-bd',
        description: 'Monitoramento e extração de pendências (Vazamento, Pavimento, Falta d\'água) com upload ao Supabase.',
        capabilities: ['SCI Web', 'Supabase', 'Alertas Telegram', 'Automação Selenium']
    },
    'spec-email': {
        name: 'Especialista em Email', role: 'Security Guard', iconEmoji: '📧', iconClass: 'email', type: 'specialist', tier: 2, parentId: 'agent-life',
        description: 'Monitoramento 24h de e-mails com análise e resumos automáticos.',
        capabilities: ['IMAP/SMTP', 'Resumo IA', 'Inbox Inteligente', 'Alertas Urgentes']
    },
    'spec-schedule': {
        name: 'Especialista dos Schedule', role: 'Time Keeper', iconEmoji: '📅', iconClass: 'schedule', type: 'specialist', tier: 2, parentId: 'caio-ceo',
        description: 'Gerencia agendamentos CRON e Google Calendar.',
        capabilities: ['CRON Monitor', 'Google Calendar', 'Alertas', 'Sincronização']
    },
    'spec-docs': {
        name: 'Especialista em Documentos', role: 'Document Creator', iconEmoji: '📄', iconClass: 'docs', type: 'specialist', tier: 2, parentId: 'caio-ceo',
        description: 'Geração inteligente de documentos: relatórios, contratos, apresentações e planilhas via IA.',
        capabilities: ['Geração IA', 'Templates Legais', 'PDF/PPTX/XLSX/DOCX', 'Download']
    },
    'spec-almox': {
        name: 'Esp. Almoxarifado', role: 'Logistics Analyst', iconEmoji: '📦', iconClass: 'almox', type: 'specialist', tier: 2, parentId: 'agent-bd',
        description: 'Monitoramento de sistema externo de almoxarifado.',
        capabilities: ['Monitor Externo', 'Detecção de Alterações', 'Notificações'], comingSoon: true
    },
}

// Static specialist data (not served by backend agents yet)
const SPECIALIST_DEFAULTS = {
    'spec-pendencias': {
        status: 'offline', statusDetail: 'Parado', monitorProject: '@extracao_pendencias',
        metrics: { totalDownloads: 0, lastRun: null, uploadsOk: 0, uploadsError: 0 },
        monitorData: {
            lastRun: null,
            nextRun: null,
            metrics: { total_downloads: 0, uploads_ok: 0, uploads_error: 0, last_duration: null }
        },
    },
    'spec-email': {
        status: 'online', statusDetail: 'ATIVO',
        metrics: { emailsProcessed: 47, unread: 3, urgentAlerts: 1, lastCheck: '2026-02-24T13:44:00' },
        monitorData: {
            inbox: [
                { from: 'contato@embasa.ba.gov.br', subject: '[URGENTE] Relatório trimestral solicitado', priority: 'urgent', time: '10:32', read: false },
                { from: 'noreply@vivo.com.br', subject: 'Fatura Vivo — R$ 189,90 vencendo 25/02', priority: 'normal', time: '08:15', read: false },
                { from: 'calendar@google.com', subject: 'Reunião de alinhamento confirmada', priority: 'info', time: '07:00', read: true },
            ],
        },
    },
    'spec-schedule': {
        status: 'online', statusDetail: 'ATIVO',
        metrics: { activeCrons: 0, nextEvent: null, eventsToday: 0, alertsPending: 0 },
        monitorData: {
            crons: [],
            upcomingEvents: [],
        },
    },
    'spec-docs': { status: 'online', statusDetail: 'ATIVO', monitorProject: 'nanobot/documentos', metrics: { docsGenerated: 0, lastGeneration: null, successRate: 100 } },
    'spec-almox': { status: 'offline', statusDetail: 'FUTURO', metrics: {}, comingSoon: true },
}

// ─── MERGE HELPERS ─────────────────────────────────────────────────

function normalizeStatus(status) {
    if (!status) return 'offline'
    const map = { 'running': 'executando', 'error': 'erro' }
    return map[status] || status
}

/** Map snake_case backend metrics → camelCase for dashboard components */
function normalizeMetrics(raw) {
    if (!raw) return {}
    return {
        // Token Agent
        tokensToday: raw.tokens_total_today ?? raw.tokensToday ?? 0,
        callsToday: raw.calls_today ?? raw.callsToday ?? 0,
        tokensTrend: raw.trend ?? raw.tokensTrend ?? '—',
        alertsActive: raw.alerts_active ?? raw.alertsActive ?? 0,
        // BD Agent
        queriesTotal: raw.total_queries ?? raw.queriesTotal ?? 0,
        failedQueries: raw.failed_queries ?? raw.failedQueries ?? 0,
        avgResponseMs: raw.avg_response_ms ?? raw.avgResponseMs ?? 0,
        connectionsTotal: raw.connections_total ?? raw.connectionsTotal ?? 0,
        connectionsOnline: raw.connections_online ?? raw.connectionsOnline ?? 0,
        totalTables: raw.total_tables ?? raw.totalTables ?? 0,
        // Life Agent
        agentsCount: raw.agents_count ?? raw.agentsCount ?? 0,
        specialistsCount: raw.specialists_count ?? raw.specialistsCount ?? 0,
        agentsMonitored: raw.agents_monitored ?? raw.agentsMonitored ?? 0,
        agentsHealthy: raw.agents_healthy ?? raw.agentsHealthy ?? 0,
        errorsLast24h: raw.agents_errored ?? raw.errorsLast24h ?? 0,
        alertsLast24h: raw.alerts_total ?? raw.alertsLast24h ?? 0,
        uptimePercent: raw.uptime_percent ?? raw.uptimePercent ?? 0,
        // SSO Agent
        cpu: raw.cpu ?? 0,
        memory: raw.memory ?? 0,
        disk: raw.disk ?? 0,
        uptime: raw.uptime ?? '—',
        hostname: raw.hostname ?? '',
        os: raw.os ?? '',
        netSentMb: raw.net_sent_mb ?? 0,
        netRecvMb: raw.net_recv_mb ?? 0,
        // pass-through anything else
        ...raw,
    }
}

function enrichAgent(liveAgent) {
    const id = liveAgent.agent || liveAgent.id
    const ui = AGENT_UI_META[id] || {}
    const specialist = SPECIALIST_DEFAULTS[id] || {}

    const liveMetrics = normalizeMetrics(liveAgent.metrics)
    const specMetrics = normalizeMetrics(specialist.metrics)
    // Merge: fallback metrics first, then live API metrics override
    const mergedMetrics = { ...specMetrics, ...liveMetrics }

    // Destructure specialist to exclude metrics (prevents re-override)
    const { metrics: _specM, ...specialistWithoutMetrics } = specialist

    return {
        id,
        ...ui,
        name: ui.name || liveAgent.name || id,
        role: ui.role || liveAgent.role || '',
        status: normalizeStatus(liveAgent.status || specialist.status || 'offline'),
        ...specialistWithoutMetrics,
        // Override with live status if available
        ...(liveAgent.status ? { status: normalizeStatus(liveAgent.status) } : {}),
        uptime: liveAgent.uptime || '',
        // Merged metrics LAST — always wins
        metrics: mergedMetrics,
    }
}

// ─── API EXPORT ────────────────────────────────────────────────────

export const api = {
    // ── Agents (LIVE + Fallback) ────────────────────────
    async getScheduleData() {
        try {
            console.log("Fetching schedule data...");
            return await fetchAPI('/api/agent/schedule/data');
        } catch (e) {
            console.error("Error in getScheduleData fetch:", e);
            return null;
        }
    },

    async getPendenciasStatus() {
        try {
            return await fetchAPI('/api/agent/pendencias/status');
        } catch (e) {
            console.error("Failed to fetch pendencias status", e);
            return null;
        }
    },

    async controlPendencias(command) {
        try {
            return await fetchAPI('/api/agent/pendencias/control', {
                method: 'POST',
                body: JSON.stringify({ command })
            });
        } catch (e) {
            console.error("Failed to control pendencias", e);
            return { status: "error", message: e.message };
        }
    },


    async getAgents() {
        return cachedFetch('agents:all', async () => {
            const liveAgents = await fetchAPI('/api/agents')

            // Build base list from UI meta (ensure all expected agents exist)
            const agentsMap = {}
            Object.entries(AGENT_UI_META).forEach(([id, ui]) => {
                agentsMap[id] = enrichAgent({ id, ...ui, status: 'offline' })
            })

            if (liveAgents && Array.isArray(liveAgents)) {
                liveAgents.forEach(la => {
                    const id = la.agent || la.id
                    agentsMap[id] = enrichAgent(la)
                })
            }

            // Run all specialist data fetches IN PARALLEL (was sequential = 4s+)
            const [inbox, schedule, pendStatus] = await Promise.all([
                api.getEmailInbox().catch(() => null),
                api.getScheduleData().catch(() => null),
                api.getPendenciasStatus().catch(() => null),
            ])

            if (inbox && agentsMap['spec-email']) {
                agentsMap['spec-email'].monitorData = { ...agentsMap['spec-email'].monitorData, inbox };
                agentsMap['spec-email'].metrics.unread = inbox.filter(i => !i.read).length;
                agentsMap['spec-email'].status = 'online';
                agentsMap['spec-email'].statusDetail = 'Ativo (Live IMAP)';
                agentsMap['spec-email'].metrics.emailsProcessed = inbox.length;
                agentsMap['spec-email'].metrics.urgentAlerts = inbox.filter(i => i.priority === 'urgent').length;
            }

            if (schedule && agentsMap['spec-schedule']) {
                agentsMap['spec-schedule'].monitorData = {
                    crons: schedule.crons || [],
                    upcomingEvents: schedule.upcomingEvents || []
                };
                agentsMap['spec-schedule'].metrics = {
                    ...agentsMap['spec-schedule'].metrics,
                    ...schedule.metrics
                };
                agentsMap['spec-schedule'].status = 'online';
                agentsMap['spec-schedule'].statusDetail = 'Ativo (Sincronizado)';
            }

            if (pendStatus && agentsMap['spec-pendencias']) {
                agentsMap['spec-pendencias'].status = pendStatus.status;
                agentsMap['spec-pendencias'].statusDetail = pendStatus.status_detail;
                agentsMap['spec-pendencias'].status_detail = pendStatus.status_detail;
                agentsMap['spec-pendencias'].metrics = {
                    ...agentsMap['spec-pendencias'].metrics,
                    totalDownloads: pendStatus.metrics?.total_downloads ?? 0,
                    uploadsOk: pendStatus.metrics?.uploads_ok ?? 0,
                    uploadsError: pendStatus.metrics?.uploads_error ?? 0,
                    lastDuration: pendStatus.metrics?.last_duration ?? null
                };
                agentsMap['spec-pendencias'].monitorData = {
                    ...agentsMap['spec-pendencias'].monitorData,
                    ...pendStatus
                };
            }

            return Object.values(agentsMap)
        }, 10000) // 10s TTL — stale-while-revalidate
    },


    async getAgentById(id) {
        const agents = await this.getAgents()
        return agents.find(a => a.id === id) || null
    },

    // ── Dashboard Metrics (LIVE) ────────────────────────
    async getDashboardMetrics() {
        const liveStatus = await fetchAPI('/api/status')
        if (liveStatus) {
            return {
                agentsOnline: liveStatus.agents_online || 0,
                totalAgents: liveStatus.agents_total || 0,
                tokensToday: liveStatus.tokens_today || 0,
                alertsToday: liveStatus.alerts || 0,
                gatewayConnected: true,
                source: 'live',
                uptime: liveStatus.uptime || '',
            }
        }
        return {
            agentsOnline: 0, totalAgents: Object.keys(AGENT_UI_META).length,
            tokensToday: 0, alertsToday: 0,
            gatewayConnected: false, source: 'offline',
        }
    },

    // ── Token Agent (LIVE) ──────────────────────────────
    async getTokenStats() { return await fetchAPI('/api/agent/token/stats') },
    async getTokenRanking() { return await fetchAPI('/api/agent/token/ranking') },

    // ── BD Agent (LIVE) ─────────────────────────────────
    async getDbStatus() { return await fetchAPI('/api/agent/db/status') },
    async getDbMetrics() { return await fetchAPI('/api/agent/db/metrics') },
    async getDbConnections() { return await fetchAPI('/api/agent/db/connections') },
    async getLifeHealth() { return await fetchAPI('/api/agent/life/health') },

    // ── Email Agent (LIVE) ──────────────────────────────
    async getEmailInbox() {
        const data = await fetchAPI('/api/agent/email/inbox');
        return data?.inbox || [];
    },

    // ── Life Agent (LIVE) ───────────────────────────────
    async getLifeAlerts() { return await fetchAPI('/api/agent/life/alerts') },

    // ── SSO Agent (LIVE) ────────────────────────────────
    async getServerMetrics() { return await fetchAPI('/api/agent/server/metrics') },

    // ── Extraction Status ──────────────────────────────
    async getExtractionStatus() {
        return SPECIALIST_DEFAULTS['spec-pendencias']?.extractionData || null
    },

    // ── Events (LIVE) ──────────────────────────────────
    async getEvents(limit = 50) {
        const liveEvents = await fetchAPI(`/events?limit=${limit}`)
        if (liveEvents && Array.isArray(liveEvents)) {
            return liveEvents.map(e => ({
                id: e.id,
                time: e.created_at ? new Date(e.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
                agentId: e.agent,
                agent: AGENT_UI_META[e.agent]?.name || e.agent,
                type: e.event,
                msg: e.message,
                ts: e.created_at,
            }))
        }
        return []
    },

    async getEventsByAgent(agentId) {
        const liveEvents = await fetchAPI(`/events?agent_id=${agentId}&limit=20`)
        if (liveEvents && Array.isArray(liveEvents)) {
            return liveEvents.map(e => ({
                id: e.id,
                time: e.created_at ? new Date(e.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
                agentId: e.agent,
                type: e.event,
                msg: e.message,
                ts: e.created_at,
            }))
        }
        return []
    },

    // ── Tasks ──────────────────────────────────────────
    async getTasks() { return [] },
    async createTask(data) { return { ...data, id: 'task-new' } },
    async deleteTask(id) { return true },
    async executeTask(id) { return { id, status: 'completed' } },

    // ── Services ───────────────────────────────────────
    async getServices() {
        const real = await fetchAPI('/api/status')
        const defaults = [
            { id: 'gateway', name: 'Gateway API', status: 'online', port: 18795, response: '12ms' },
            { id: 'tg', name: 'Telegram Bot', status: 'online', uptime: '2h 15m', response: '120ms' },
            { id: 'email', name: 'Email (IMAP)', status: 'online', uptime: '2h 15m', response: '4.2s' },
            { id: 'supabase', name: 'Supabase', status: 'online', uptime: '99.9%', response: '180ms' },
            { id: 'sciweb', name: 'SCI Web', status: 'online', uptime: '—', response: '2.1s' },
        ]
        if (real?.services) {
            const liveIds = new Set(real.services.map(s => s.id))
            const merged = [...real.services]
            defaults.forEach(s => { if (!liveIds.has(s.id)) merged.push(s) })
            return merged
        }
        return defaults
    },

    // ── Settings ───────────────────────────────────────
    async getSettings() {
        return {
            model: 'gemini/gemini-2.0-flash', maxTokens: 8192, temperature: 0.7,
            telegramEnabled: true, emailEnabled: true, whatsappEnabled: false,
            botName: 'CaioAgent',
        }
    },
    async updateSettings(data) { return data },

    // ── Actions ────────────────────────────────────────
    async generateExtra(type) { return await fetchAPI(`/api/extras/generate/${type}`, { method: 'POST' }) },
    async sendNotification(title, message) {
        return await fetchAPI('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, message, type: 'info' }),
        })
    },

    // ── Chat (LIVE) ──────────────────────────────────
    async sendChatMessage(message, sessionId = 'dashboard-default') {
        const res = await fetchAPI('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, session_id: sessionId }),
            _chatRequest: true // use 120s timeout for AI responses with tool calls
        })
        return res
    },

    async getChatHistory(sessionId = 'dashboard-default') {
        const res = await fetchAPI(`/api/chat/history/${sessionId}`)
        return res?.messages || []
    },

    // ── Tasks (LIVE BACKEND) ─────────────────────────────
    async getTasks() {
        const data = await fetchAPI('/api/tasks')
        // CRITICAL: throw on error so TaskContext catch block doesn't setTasks([])
        // The fetchAPI returns {status:'error',...} on failure — never []
        if (data && data.status === 'error') {
            throw new Error(data.message || 'Tasks API error')
        }
        return Array.isArray(data) ? data : []
    },

    async createTask(taskData) {
        return await fetchAPI('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
        })
    },

    async executeTask(taskId) {
        return await fetchAPI(`/api/tasks/${taskId}/execute`, {
            method: 'POST',
        })
    },

    async deleteTask(taskId) {
        return await fetchAPI(`/api/tasks/${taskId}`, {
            method: 'DELETE',
        })
    },

    async getWorkflows() {
        // Workflows future feature — return empty for now to prevent crashes
        return []
    },
    async getEvents(limit = 50) {
        const data = await fetchAPI(`/events?limit=${limit}`)
        return Array.isArray(data) ? data : (data?.events || [])
    },

    // ── Documents API ────────────────────────────────────
    async listDocuments() {
        const data = await fetchAPI('/api/documents')
        return Array.isArray(data) ? data : []
    },

    async getTemplates() {
        const data = await fetchAPI('/api/documents/templates')
        return Array.isArray(data) ? data : []
    },

    async getTemplateContent(templateId) {
        return await fetchAPI(`/api/documents/templates/${templateId}`)
    },

    async generateDocument(type, title = '', description = '') {
        return await fetchAPI('/api/documents/generate', {
            method: 'POST',
            body: JSON.stringify({ type, title, description }),
        })
    },

    async aiGenerateDocument(prompt, format = 'docx') {
        return await fetchAPI('/api/documents/ai-generate', {
            method: 'POST',
            body: JSON.stringify({ prompt, format }),
        })
    },

    async downloadDocument(filename) {
        const url = `${BASE_URL}/api/documents/${encodeURIComponent(filename)}/download`
        window.open(url, '_blank')
    },

    async deleteDocument(filename) {
        return await fetchAPI(`/api/documents/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
        })
    },

    async generateFromTemplate(templateId, format = 'docx') {
        return await fetchAPI('/api/documents/from-template', {
            method: 'POST',
            body: JSON.stringify({ template_id: templateId, format }),
        })
    },
}

