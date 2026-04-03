import React, { useEffect, useState } from 'react';
import {
  getBatches,
  createBatch,
  getBatchPatients,
  markBatchPatientActioned,
  getFilterOptions,
  sendMessage,
  Batch,
  BatchPatient,
  FilterOptions,
} from '../api';
import ActionButton from '../components/ActionButton';
import RiskBadge from '../components/RiskBadge';
import BatchWhatsAppCampaign from '../components/BatchWhatsAppCampaign';

const Batches: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBatch, setExpandedBatch] = useState<number | null>(null);
  const [batchPatients, setBatchPatients] = useState<Record<number, BatchPatient[]>>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [sendingMessage, setSendingMessage] = useState<string | null>(null);

  // Form state - enhanced filters
  const [riskLevel, setRiskLevel] = useState('');
  const [segment, setSegment] = useState('');
  const [branch, setBranch] = useState('');
  const [isChronic, setIsChronic] = useState('');
  const [daysOverdue, setDaysOverdue] = useState('');
  const [satisfactionLevel, setSatisfactionLevel] = useState('');
  const [noShowRisk, setNoShowRisk] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [condition, setCondition] = useState('');
  const [whatsappOnly, setWhatsappOnly] = useState(false);
  const [batchSize, setBatchSize] = useState(25);
  const [label, setLabel] = useState('');
  const [creating, setCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBatchCampaign, setShowBatchCampaign] = useState(false);
  const [selectedBatchPatients, setSelectedBatchPatients] = useState<Array<{
    patientId: string;
    phone: string;
    name: string;
  }>>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [batchesData, options] = await Promise.all([
        getBatches(),
        getFilterOptions()
      ]);
      setBatches(batchesData);
      setFilterOptions(options);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async () => {
    if (!label.trim()) {
      alert('Please enter a batch label');
      return;
    }

    try {
      setCreating(true);
      await createBatch({
        filter_criteria: {
          risk_level: riskLevel || undefined,
          segment: segment || undefined,
          branch: branch || undefined,
          is_chronic: isChronic || undefined,
          days_overdue: daysOverdue || undefined,
          satisfaction_level: satisfactionLevel || undefined,
          no_show_risk: noShowRisk || undefined,
          age_group: ageGroup || undefined,
          condition: condition || undefined,
          whatsapp_only: whatsappOnly || undefined,
          limit: batchSize,
        },
        label: label.trim(),
      });
      resetForm();
      await loadData();
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Failed to create batch');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setRiskLevel('');
    setSegment('');
    setBranch('');
    setIsChronic('');
    setDaysOverdue('');
    setSatisfactionLevel('');
    setNoShowRisk('');
    setAgeGroup('');
    setCondition('');
    setWhatsappOnly(false);
    setBatchSize(25);
    setLabel('');
  };

  const handleExpandBatch = async (batchId: any) => {
    if (expandedBatch === batchId) {
      setExpandedBatch(null);
      return;
    }
    setExpandedBatch(batchId);
    if (!batchPatients[batchId]) {
      try {
        const patients = await getBatchPatients(batchId);
        setBatchPatients((prev: any) => ({ ...prev, [batchId]: patients }));
      } catch (err: any) {
        alert(err instanceof Error ? err.message : 'Failed to load batch patients');
      }
    }
  };

  const handleMarkActioned = async (batchId: any, patientId: any) => {
    try {
      await markBatchPatientActioned(batchId, patientId);
      setBatchPatients((prev: any) => ({
        ...prev,
        [batchId]: prev[batchId].map((p: any) =>
          p.patient_id === patientId ? { ...p, action_status: 'actioned' } : p
        ),
      }));
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Failed to mark as actioned');
    }
  };

  const handleSendMessage = async (patientId: any) => {
    try {
      setSendingMessage(patientId);
      await sendMessage({ patient_id: patientId, message_type: 'reengagement' });
      alert('Message sent successfully!');
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSendingMessage(null);
    }
  };

  const parseFilterCriteria = (filterCriteria: any): any => {
    if (!filterCriteria) return {};
    if (typeof filterCriteria === 'object') return filterCriteria;
    try {
      return JSON.parse(filterCriteria);
    } catch {
      return { legacy_label: String(filterCriteria) };
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (riskLevel) count++;
    if (segment) count++;
    if (branch) count++;
    if (isChronic) count++;
    if (daysOverdue) count++;
    if (satisfactionLevel) count++;
    if (noShowRisk) count++;
    if (ageGroup) count++;
    if (condition) count++;
    if (whatsappOnly) count++;
    return count;
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: '#0a0d12',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '6px',
    fontWeight: 500,
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Patient Batches</h1>
          <p className="text-slate-400">Targeted outreach campaigns for specific patient segments</p>
        </div>
        <div className="px-5 py-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
          <div className="text-2xl font-black text-emerald-500 leading-tight">{batches.length}</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Batches</div>
        </div>
      </div>

      {/* Create Batch Card */}
      <div className="bg-[#141921] p-8 rounded-3xl border border-white/5 mb-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Create New Outreach Batch</h2>
            <p className="text-slate-500 text-sm">Select clinical and demographic criteria for segmentation</p>
          </div>
          {getActiveFilterCount() > 0 && (
            <div className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold ring-4 ring-blue-600/5">
              {getActiveFilterCount()} Active Filters
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 relative z-10">
          <div className="space-y-1.5">
            <label style={labelStyle}>Risk Profile</label>
            <select value={riskLevel} onChange={(e: any) => setRiskLevel(e.target.value)} style={selectStyle}>
              <option value="">Any Risk Level</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label style={labelStyle}>Branch Location</label>
            <select value={branch} onChange={(e: any) => setBranch(e.target.value)} style={selectStyle}>
              <option value="">Any Branch</option>
              {filterOptions?.branches?.map((b: any) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label style={labelStyle}>Clinical Condition</label>
            <select value={condition} onChange={(e: any) => setCondition(e.target.value)} style={selectStyle}>
              <option value="">Any Condition</option>
              {filterOptions?.conditions?.map((c: any) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label style={labelStyle}>Patient Segment</label>
            <select value={segment} onChange={(e: any) => setSegment(e.target.value)} style={selectStyle}>
              <option value="">Any Segment</option>
              {filterOptions?.segments?.map((s: any) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2">
            <div className="space-y-1.5">
              <label style={labelStyle}>Chronic Status</label>
              <select value={isChronic} onChange={(e: any) => setIsChronic(e.target.value)} style={selectStyle}>
                <option value="">Any</option>
                <option value="Yes">Chronic Only</option>
                <option value="No">Non-Chronic</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label style={labelStyle}>Retention Threshold</label>
              <select value={satisfactionLevel} onChange={(e: any) => setSatisfactionLevel(e.target.value)} style={selectStyle}>
                <option value="">Any Satisfaction</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={whatsappOnly} onChange={(e: any) => setWhatsappOnly(e.target.checked)} className="w-5 h-5 rounded-lg border-white/10 bg-black/40 text-emerald-500 focus:ring-emerald-500/20 appearance-none border checked:bg-emerald-500 transition-all" />
                <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">WhatsApp Eligible Only</span>
              </label>
            </div>
          </div>
        )}

        <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-blue-400 text-xs font-bold hover:text-blue-300 transition-colors flex items-center gap-1 mb-6">
          {showAdvanced ? '─ Hide Advanced Settings' : '┼ Show Advanced Settings'}
        </button>

        <div className="flex gap-4 items-end bg-black/20 p-6 rounded-2xl border border-white/5">
          <div className="flex-1 space-y-1.5">
            <label style={labelStyle}>Batch Identifier *</label>
            <input type="text" value={label} onChange={(e: any) => setLabel(e.target.value)} placeholder="e.g. Chronic Re-engagement Q2" className="w-full bg-[#0a0d12] border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div className="w-40 space-y-1.5">
            <label style={labelStyle}>Target Size</label>
            <select value={batchSize} onChange={(e: any) => setBatchSize(Number(e.target.value))} style={selectStyle} className="!py-3.5">
              <option value={25}>25 Patients</option>
              <option value={50}>50 Patients</option>
              <option value={100}>100 Patients</option>
            </select>
          </div>
          <ActionButton onClick={handleCreateBatch} loading={creating} className="!py-3.5 !px-8">
            {creating ? 'Processing...' : 'Create Campaign'}
          </ActionButton>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {batches.map((batch: any) => {
          const patients = batchPatients[batch.id] || [];
          const actionedCount = patients.filter((p: any) => p.action_status === 'actioned').length;
          const totalCount = batch.patient_count || batch.batch_size;
          const progressPercent = (actionedCount / totalCount) * 100;
          const criteria = parseFilterCriteria(batch.filter_criteria);

          return (
            <div key={batch.id} className="bg-[#141921] rounded-3xl border border-white/5 overflow-hidden transition-all duration-300">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center font-black text-xl text-slate-400">#{batch.id}</div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{batch.label}</h3>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <span>{new Date(batch.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{totalCount} Total Patients</span>
                      {criteria.risk_level && (
                        <>
                          <span>•</span>
                          <span className={criteria.risk_level === 'High' ? 'text-rose-500' : 'text-emerald-500'}>{criteria.risk_level} Risk</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="w-48">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                  <ActionButton onClick={() => handleExpandBatch(batch.id)} variant="secondary">
                    {expandedBatch === batch.id ? 'Collapse' : 'Manage List'}
                  </ActionButton>
                </div>
              </div>

              {expandedBatch === batch.id && (
                <div className="bg-black/20 p-6 pt-0 border-t border-white/5">
                  {patients.length > 0 && (
                    <div className="flex justify-between items-center py-4 mb-4">
                      <button onClick={() => {
                        setSelectedBatchPatients(patients.filter((p: any) => p.contact_number).map((p: any) => ({ patientId: p.patient_id, phone: p.contact_number!, name: p.full_name! })));
                        setShowBatchCampaign(true);
                      }} className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20">🚀 Launch WhatsApp Campaign</button>
                    </div>
                  )}
                  <div className="space-y-3">
                    {patients.map((p: any) => (
                      <div key={p.patient_id} className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                        <div className="flex items-center gap-4">
                          <RiskBadge label={p.churn_risk_label} />
                          <div>
                            <div className="text-white font-bold">{p.full_name}</div>
                            <div className="text-slate-500 text-xs">ID: {p.patient_id} • Score: {p.churn_risk_score}%</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {p.action_status === 'actioned' ? (
                            <div className="px-5 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/20">✓ Contacted</div>
                          ) : (
                            <>
                              <button onClick={() => handleSendMessage(p.patient_id)} disabled={sendingMessage === p.patient_id} className="px-5 py-2.5 bg-blue-600/10 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-600/20 transition-all uppercase tracking-widest">{sendingMessage === p.patient_id ? 'Wait...' : 'Send'}</button>
                              <button onClick={() => handleMarkActioned(batch.id, p.patient_id)} className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all border border-white/5 uppercase tracking-widest">Mark Done</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BatchWhatsAppCampaign
        isOpen={showBatchCampaign}
        onClose={() => setShowBatchCampaign(false)}
        patients={selectedBatchPatients}
      />
    </div>
  );
};

export default Batches;
