/**
 * SendWhatsAppButton Component
 */

import React, { useState } from 'react';
import { sendMessage } from '../api';
import { Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface SendWhatsAppButtonProps {
  patientId: string;
  patientPhone?: string; // Added as requested
  patientName?: string; // Added as requested
  messageType?: 'reminder' | 'reengagement' | 'followup' | 'default';
  reason?: string;
  customText?: string;
  onSuccess?: (sid: string) => void;
  onError?: (error: string) => void;
  variant?: 'primary' | 'secondary' | 'success';
}

const SendWhatsAppButton: React.FC<SendWhatsAppButtonProps> = ({
  patientId,
  patientName = 'Patient',
  messageType = 'reminder',
  customText,
  onSuccess,
  onError,
  variant = 'primary'
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendMessage = async () => {
    setLoading(true);
    setStatus('loading');
    setErrorMsg(null);

    try {
      const apiMessageType = messageType === 'default' ? 'reminder' : messageType;

      const data = await sendMessage({
        patient_id: patientId,
        message_type: apiMessageType,
        custom_text: customText
      });

      if (data.success || data.sid) {
        setStatus('success');
        if (onSuccess) onSuccess(data.sid || 'success');
        setTimeout(() => setStatus('idle'), 4000);
      } else {
        throw new Error(data.error || 'Failed to send');
      }
    } catch (err: any) {
      const msg = err.message || 'Unknown error';
      setStatus('error');
      setErrorMsg(msg);
      if (onError) onError(msg);
      setTimeout(() => setStatus('idle'), 6000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleSendMessage}
        disabled={loading || status === 'success'}
        className={`font-bold text-sm px-5 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-[0.98] ${variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-500' :
            variant === 'secondary' ? 'bg-slate-800 text-slate-300' :
              'bg-emerald-500 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={`Send WhatsApp message to ${patientName}`}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        {loading ? "Sending..." : messageType === 'reminder' ? "Send Reminder" : "Message Patient"}
      </button>

      {status === 'error' && errorMsg && (
        <div className="absolute top-full mt-2 left-0 w-64 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs shadow-2xl z-50">
          <b>Error:</b> {errorMsg}
        </div>
      )}
    </div>
  );
};

export default SendWhatsAppButton;
