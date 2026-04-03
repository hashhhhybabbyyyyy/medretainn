import React, { useEffect, useState } from 'react';
import { getSummary, AnalyticsSummary } from '../api';

const KPICards: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [animatedValues, setAnimatedValues] = useState({
    totalPatients: 0,
    highRisk: 0,
    whatsappEligible: 0,
    avgChurnScore: 0
  });

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await getSummary();
      setSummary(data);
      animateNumbers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  const animateNumbers = (data: AnalyticsSummary) => {
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;

    const targets = {
      totalPatients: data.total_patients,
      highRisk: data.high_risk_count,
      whatsappEligible: data.whatsapp_opt_in_percentage,
      avgChurnScore: data.avg_churn_score
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        totalPatients: Math.round(targets.totalPatients * easeProgress),
        highRisk: Math.round(targets.highRisk * easeProgress),
        whatsappEligible: targets.whatsappEligible * easeProgress,
        avgChurnScore: targets.avgChurnScore * easeProgress
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues(targets);
      }
    }, stepDuration);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-[#141921] rounded-3xl border border-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) return <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl mb-8">Error: {error}</div>;
  if (!summary) return null;

  const cards = [
    { label: 'Total Patients', value: animatedValues.totalPatients.toLocaleString(), color: '#4cc9f0', animate: false },
    { label: 'High Risk', value: animatedValues.highRisk.toLocaleString(), color: '#ff6b6b', animate: true },
    { label: 'Opt-in Status', value: `${Math.round(animatedValues.whatsappEligible)}%`, color: '#00d4a8', animate: false },
    { label: 'System Retention', value: (100 - animatedValues.avgChurnScore).toFixed(1) + '%', color: '#ffd166', animate: false }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-[#141921] p-6 rounded-3xl border border-white/5 relative group transition-all hover:scale-105 duration-500">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{card.label}</div>
          <div className={`text-3xl font-black transition-all ${card.animate ? 'animate-pulse' : ''}`} style={{ color: card.color }}>
            {card.value}
          </div>
          <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: card.color }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
