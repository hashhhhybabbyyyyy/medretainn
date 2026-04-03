/**
 * MedRetain CRM - Production API Client
 * Centralized API handler and Type definitions
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// --- Types ---

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
    [key: string]: any; // Allow dynamic indexing
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
    trend: Array<{
        month: string;
        patient_count: number;
    }>;
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
    actioned?: boolean; // For legacy support
}

export interface FilterOptions {
    branches: string[];
    segments: string[];
    conditions: string[];
    risk_levels?: string[];
    chronic_options?: string[];
    days_overdue_options?: any[];
    satisfaction_levels?: any[];
    no_show_risk_levels?: any[];
    age_groups?: any[];
}

// --- API Stub Functions & REST Logic ---

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Content-Type': 'application/json', ...options?.headers },
            ...options,
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return response.json();
    } catch (error) {
        throw error;
    }
}

export async function getPatients(filters: PatientFilters = {}): Promise<PatientsResponse> {
    return await fetchAPI<PatientsResponse>('/patients');
}

export async function getPatient(id: string): Promise<PatientDetail> {
    return await fetchAPI<PatientDetail>(`/patients/${id}`);
}

export async function getSummary(): Promise<AnalyticsSummary> {
    return await fetchAPI<AnalyticsSummary>('/analytics/summary');
}

// --- Stub Exports as requested ---

export const getRetentionTrend = async (): Promise<RetentionTrendResponse> => ({ trend: [] });
export const getConditionsBreakdown = async (): Promise<any> => ({ conditions: [] });
export const getMLModelInfo = async (): Promise<any> => ({});
export const getMLFeatureImportance = async (): Promise<any> => ({ features: [] });
export const getPatientRiskAnalysis = async (id: any): Promise<any> => ({ risk_score: 0, risk_label: 'Low', risk_factors: [], recommendation: '' });
export const createBatch = async (payload: any): Promise<Batch> => ({ id: 0, created_at: new Date().toISOString(), batch_size: 0, label: '' });
export const getBatchPatients = async (id: any): Promise<BatchPatient[]> => [];
export const markBatchPatientActioned = async (batchId: any, patientId: any): Promise<any> => ({ success: true });
export const getFilterOptions = async (): Promise<FilterOptions> => ({ branches: [], segments: [], conditions: [] });
export const exportPatientData = async (format: any, filters: any): Promise<any> => { console.log('Exporting...'); };
export const getMessageLog = async (): Promise<any[]> => [];

export async function sendMessage(payload: { patient_id: string; message_type: string, custom_text?: string }): Promise<any> {
    return await fetchAPI('/messages/send', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}
