import React, { useEffect, useState } from 'react';
import { getPatient, sendMessage, PatientDetail } from '../api';
import PatientNotes from './PatientNotes';
import ActionButton from './ActionButton';
import RiskBadge from './RiskBadge';
import SendWhatsAppButton from './SendWhatsAppButton';

interface PatientDrawerProps {
    patientId: string | null;
    onClose: () => void;
}

const PatientDrawer: React.FC<PatientDrawerProps> = ({ patientId, onClose }) => {
    const [patient, setPatient] = useState<PatientDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageType, setMessageType] = useState('reminder');
    const [sending, setSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    useEffect(() => {
        if (patientId) {
            loadPatient();
        }
    }, [patientId]);

    const loadPatient = async () => {
        if (!patientId) return;
        try {
            setLoading(true);
            setError(null);
            const data = await getPatient(patientId);
            setPatient(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load patient');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!patient) return;
        try {
            setSending(true);
            setSendError(null);
            await sendMessage({
                patient_id: patient.patient_id,
                message_type: messageType,
            });
            setSendSuccess(true);
            setTimeout(() => {
                setSendSuccess(false);
                setShowMessageModal(false);
                loadPatient();
            }, 2000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
            setSendError(errorMessage);
        } finally {
            setSending(false);
        }
    };

    if (!patientId) return null;

    return (
        <>
            <div onClick={onClose} className="fixed inset-0 bg-black/70 z-[999] animate-in fade-in duration-300" />

            <div className="fixed top-0 right-0 bottom-0 w-[600px] bg-[#0a0d12] border-l border-white/10 z-[1000] overflow-y-auto animate-in slide-in-from-right duration-300">
                {loading ? (
                    <div className="p-10 text-center text-slate-400">Loading patient details...</div>
                ) : error ? (
                    <div className="p-10 text-center">
                        <div className="text-rose-500 mb-6">Error: {error}</div>
                        <ActionButton onClick={onClose}>Close</ActionButton>
                    </div>
                ) : patient ? (
                    <>
                        <div className="p-6 border-b border-white/5 sticky top-0 bg-[#0a0d12] z-10 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">{patient.full_name}</h2>
                                <p className="text-slate-500 text-sm">ID: {patient.patient_id}</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors text-2xl">×</button>
                        </div>

                        <div className="p-6 space-y-8">
                            <Section title="Demographics">
                                <InfoRow label="Age" value={patient.age} />
                                <InfoRow label="Gender" value={patient.gender} />
                                <InfoRow label="Contact" value={patient.contact_number} />
                                <InfoRow label="Email" value={patient.email} />
                                <InfoRow label="Branch" value={patient.hospital_branch} />
                                <InfoRow label="Segment" value={patient.patient_segment} />
                            </Section>

                            <Section title="Clinical Information">
                                <InfoRow label="Primary Condition" value={patient.primary_condition} />
                                <InfoRow label="Chronic Condition" value={patient.is_chronic} />
                                <InfoRow label="Primary Doctor" value={patient.primary_doctor_name} />
                                <InfoRow label="Medical Record #" value={patient.medical_record_number} />
                            </Section>

                            <Section title="Visit History">
                                <InfoRow label="Last Visit" value={patient.days_since_last_visit ? `${patient.days_since_last_visit} days ago` : null} />
                                <InfoRow label="Total Appointments" value={patient.total_appointments} />
                                <InfoRow label="Completed Visits" value={patient.completed_visits} />
                                <InfoRow label="No-Show Rate" value={patient.no_show_rate ? `${(patient.no_show_rate * 100).toFixed(1)}%` : null} />
                            </Section>

                            <Section title="Financial Summary">
                                <InfoRow label="Total Billed" value={patient.total_billed ? `$${patient.total_billed.toLocaleString()}` : null} />
                                <InfoRow label="Total Paid" value={patient.total_paid ? `$${patient.total_paid.toLocaleString()}` : null} />
                                <InfoRow label="Outstanding Balance" value={patient.outstanding_balance ? `$${patient.outstanding_balance.toLocaleString()}` : null} />
                            </Section>

                            <Section title="CRM Signals">
                                <div className="mb-6">
                                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">Retention Risk</div>
                                    <div className="flex items-center gap-4">
                                        <div className={`text-5xl font-black ${patient.churn_risk_score && patient.churn_risk_score >= 70 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {patient.churn_risk_score?.toFixed(0) || 0}
                                        </div>
                                        <RiskBadge label={patient.churn_risk_label} />
                                    </div>
                                </div>
                                <InfoRow label="Action Required" value={patient.crm_action_required} />
                                <InfoRow label="WhatsApp Opt-in" value={patient.whatsapp_opt_in} />
                                {patient.last_whatsapp_message_date && (
                                    <InfoRow label="Last Message Sent" value={new Date(patient.last_whatsapp_message_date).toLocaleDateString()} />
                                )}
                                <InfoRow label="Satisfaction Score" value={patient.satisfaction_score ? `${patient.satisfaction_score.toFixed(1)}/5` : null} />
                            </Section>

                            <div className="mb-10">
                                <PatientNotes patientId={patient.patient_id} />
                            </div>

                            {patient.whatsapp_opt_in === 'Yes' && (
                                <div className="mt-10 pt-8 border-t border-white/5">
                                    <h4 className="text-white font-bold mb-6 flex items-center gap-2">📱 WhatsApp Interventions</h4>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <SendWhatsAppButton
                                            patientId={patient.patient_id}
                                            patientPhone={patient.contact_number || undefined}
                                            patientName={patient.full_name || 'Patient'}
                                            messageType="default"
                                            variant="primary"
                                        />
                                        <button onClick={() => setShowMessageModal(true)} className="py-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-400 font-bold text-sm hover:bg-blue-600/20 transition-all">✏️ Custom Text</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <SendWhatsAppButton
                                            patientId={patient.patient_id}
                                            patientPhone={patient.contact_number || undefined}
                                            patientName={patient.full_name || 'Patient'}
                                            messageType="followup"
                                            reason="missed_appointment"
                                            variant="secondary"
                                        />
                                        <SendWhatsAppButton
                                            patientId={patient.patient_id}
                                            patientPhone={patient.contact_number || undefined}
                                            patientName={patient.full_name || 'Patient'}
                                            messageType="followup"
                                            reason="pending_results"
                                            variant="secondary"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
            </div>

            {showMessageModal && patient && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
                    <div onClick={() => setShowMessageModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <div className="relative bg-[#141921] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-white mb-6">Send Custom WhatsApp</h3>
                        {sendSuccess ? (
                            <div className="text-emerald-400 py-10 font-bold text-center text-lg">✓ Message sent successfully!</div>
                        ) : (
                            <div className="space-y-6">
                                {sendError && <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">{sendError}</div>}
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold mb-2 ml-1 uppercase">Intervention Type</label>
                                    <select value={messageType} onChange={(e) => setMessageType(e.target.value)} className="w-full bg-[#0a0d12] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                                        <option value="reminder">Appointment Reminder</option>
                                        <option value="reengagement">Re-engagement</option>
                                        <option value="followup">Follow-up Check</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 justify-end pt-2">
                                    <button onClick={() => setShowMessageModal(false)} className="px-6 py-3 text-slate-400 hover:text-white font-bold transition-colors">Cancel</button>
                                    <ActionButton onClick={handleSendMessage} loading={sending}>{sending ? 'Sending...' : 'Send Message'}</ActionButton>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 opacity-70">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const InfoRow: React.FC<{ label: string; value: any }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm py-1 border-b border-white/[0.02]">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-100 font-medium">{value ?? '—'}</span>
    </div>
);

export default PatientDrawer;
