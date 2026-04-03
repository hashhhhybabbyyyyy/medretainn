/**
 * Tathya CRM - Production API Client
 * All calls go to VITE_API_URL (FastAPI backend)
 */

const BASE = (import.meta as any).env.VITE_API_URL || '/api';

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
    return localStorage.getItem('tathya_token');
}
export function setToken(token: string) {
    localStorage.setItem('tathya_token', token);
}
export function clearToken() {
    localStorage.removeItem('tathya_token');
    localStorage.removeItem('tathya_user');
}
export function getUser(): any {
    const u = localStorage.getItem('tathya_user');
    return u ? JSON.parse(u) : null;
}
export function saveUser(user: any) {
    localStorage.setItem('tathya_user', JSON.stringify(user));
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
        clearToken();
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
    }
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail || `API Error ${res.status}`);
    }
    return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginPayload { username: string; password: string; }
export interface LoginResponse { access_token: string; token_type: string; user: any; }

export interface Patient {
    patient_id: string;
    full_name: string | null;
    age: number | null;
    gender: string | null;
    contact_number: string | null;
    email: string | null;
    primary_condition: string | null;
    is_chronic: string | null;
    churn_risk_score: number | null;
    churn_risk_label: string | null;
    days_since_last_visit: number | null;
    whatsapp_opt_in: string | null;
    crm_action_required: string | null;
    patient_segment: string | null;
    hospital_branch: string | null;
    satisfaction_score: number | null;
    no_show_rate: number | null;
}

export interface PatientDetail extends Patient {
    primary_doctor_name: string | null;
    last_visit_date: string | null;
    total_appointments: number | null;
    completed_visits: number | null;
    medical_record_number?: string | null;
    visit_frequency_per_year?: number | null;
    total_billed?: number | null;
    total_paid?: number | null;
    outstanding_balance?: number | null;
    insurance_provider?: string | null;
    last_whatsapp_message_date?: string | null;
    last_whatsapp_message_status?: string | null;
    nps_score?: number | null;
}

export interface PatientsResponse {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    patients: Patient[];
}

export interface PatientFilters {
    page?: number;
    page_size?: number;
    churn_risk_label?: string;
    is_chronic?: string;
    hospital_branch?: string;
    patient_segment?: string;
    search?: string;
    [key: string]: any;
}

export interface AnalyticsSummary {
    total_patients: number;
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
    avg_churn_score: number;
    whatsapp_opt_in_percentage?: number;
}

export interface RetentionTrendResponse {
    trend: Array<{ month: string; patient_count: number }>;
}

export interface Batch {
    id: number;
    created_at: string;
    batch_size: number;
    label: string;
    patient_count?: number;
    filter_criteria?: any;
}

export interface BatchPatient extends Patient {
    action_status: 'pending' | 'actioned';
    actioned_at?: string;
}

export interface FilterOptions {
    branches: string[];
    segments: string[];
    conditions: string[];
    risk_levels?: string[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<LoginResponse> {
    // FastAPI OAuth2 form submit
    const form = new URLSearchParams();
    form.append('username', payload.username);
    form.append('password', payload.password);
    const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail || 'Invalid credentials');
    }
    const data = await res.json();
    return data;
}

export async function logout(): Promise<void> {
    clearToken();
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export async function getPatients(filters: PatientFilters = {}): Promise<PatientsResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.append(k, String(v)); });
    return api<PatientsResponse>(`/patients?${params.toString()}`);
}

export async function getPatient(id: string): Promise<PatientDetail> {
    return api<PatientDetail>(`/patients/${id}`);
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getSummary(): Promise<AnalyticsSummary> {
    return api<AnalyticsSummary>('/analytics/summary');
}

export async function getRetentionTrend(): Promise<RetentionTrendResponse> {
    return api<RetentionTrendResponse>('/analytics/retention-trend');
}

export async function getConditionsBreakdown(): Promise<any> {
    return api<any>('/analytics/conditions');
}

export async function getMLModelInfo(): Promise<any> {
    return api<any>('/analytics/ml-model-info');
}

export async function getMLFeatureImportance(): Promise<any> {
    return api<any>('/analytics/feature-importance');
}

export async function getPatientRiskAnalysis(patientId: string): Promise<any> {
    return api<any>(`/analytics/patient-risk/${patientId}`);
}

// ─── Batches ──────────────────────────────────────────────────────────────────

export async function getBatches(): Promise<Batch[]> {
    return api<Batch[]>('/batches');
}

export async function createBatch(payload: any): Promise<Batch> {
    return api<Batch>('/batches', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getBatchPatients(batchId: number): Promise<BatchPatient[]> {
    return api<BatchPatient[]>(`/batches/${batchId}/patients`);
}

export async function markBatchPatientActioned(batchId: number, patientId: string): Promise<any> {
    return api<any>(`/batches/${batchId}/patients/${patientId}/action`, { method: 'POST' });
}

// ─── Filters / Export ─────────────────────────────────────────────────────────

export async function getFilterOptions(): Promise<FilterOptions> {
    return api<FilterOptions>('/patients/filter-options');
}

export async function exportPatientData(format: string, filters: any): Promise<any> {
    const params = new URLSearchParams({ format, ...filters });
    return api<any>(`/patients/export?${params.toString()}`);
}

// ─── Messaging ────────────────────────────────────────────────────────────────

export async function getMessageLog(): Promise<any[]> {
    return api<any[]>('/messages');
}

export async function sendMessage(payload: any): Promise<any> {
    return api<any>('/messages/send', { method: 'POST', body: JSON.stringify(payload) });
}

export async function sendBatchMessages(payload: any): Promise<any> {
    return api<any>('/messages/send-batch', { method: 'POST', body: JSON.stringify(payload) });
}

// ─── HIMS Connection ──────────────────────────────────────────────────────────

export async function checkHIMSConnection(): Promise<any> {
    return api<any>('/hims/status');
}

export async function connectHIMS(payload: any): Promise<any> {
    return api<any>('/hims/connect', { method: 'POST', body: JSON.stringify(payload) });
}

export async function disconnectHIMS(id: any): Promise<any> {
    return api<any>(`/hims/disconnect/${id}`, { method: 'POST' });
}
