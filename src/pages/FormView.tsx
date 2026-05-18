import { useState, useEffect, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { WalrusStorage } from '../lib/walrus';
import { MystenSealEncryption } from '../lib/seal_sdk';
import { THEME_PRESETS } from '../lib/themes';
import { UploadCloud, Star, CheckCircle, AlertCircle, Loader, Shield, Database, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSuiClient, useCurrentAccount, ConnectButton, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const spring = { type: 'spring' as const, stiffness: 300, damping: 20 };

export const FormView = () => {
  const { id } = useParams<{ id: string }>();
  const suiClient = useSuiClient();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [form, setForm] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [walrusBlobId, setWalrusBlobId] = useState('');
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, string>>({});

  // 1. Fetch Form from SUI & Walrus
  useEffect(() => {
    const fetchForm = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const obj = await suiClient.getObject({
          id,
          options: { showContent: true }
        });

        const content = obj.data?.content as any;
        if (!content || !content.fields || !content.fields.form_blob_id) {
          throw new Error('Invalid form object');
        }

        const formBlobId = content.fields.form_blob_id;

        // Fetch from Walrus
        const formDefinition = await WalrusStorage.download(formBlobId);
        setForm({ ...formDefinition, id });
      } catch (e: any) {
        console.error(e);
        setLoadError(e.message || 'Form not found');
      } finally {
        setIsLoading(false);
      }
    };
    fetchForm();
  }, [id, suiClient]);


  // ── Not found / Loading ──
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={48} className="anim-spin" color="var(--primary)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px' }}>Loading form from blockchain...</h2>
        </div>
      </div>
    );
  }

  if (loadError || !form) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        <div className="nb-box anim-pop" style={{ padding: '60px', textAlign: 'center', maxWidth: '500px' }}>
          <AlertCircle size={56} color="var(--error)" style={{ marginBottom: '16px' }} />
          <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>Form Not Found</h1>
          <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>This form link may be invalid or the form has been deleted.</p>
        </div>
      </div>
    );
  }

  // ── Theme setup ──
  const theme = form.theme || { preset: 'clean' as const };
  const preset = THEME_PRESETS[theme.preset as keyof typeof THEME_PRESETS] || THEME_PRESETS.clean;
  const isDark = ['midnight', 'ocean', 'sunset', 'aurora', 'neon', 'forest'].includes(theme.preset);
  const showParticles = theme.preset !== 'clean' && theme.preset !== 'custom' && theme.preset !== 'lavender';

  const pageBgClass = `theme-bg-${theme.preset}`;
  const animClass = preset.animClass || '';
  const textColor = theme.textColor || preset.textColor;
  const accentColor = theme.accentColor || preset.accentColor;
  const cardBg = theme.cardBg || preset.cardBg;

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    padding: '40px 20px',
    color: textColor,
    position: 'relative',
    transition: 'color 0.3s ease',
  };

  if (theme.bgImage) {
    pageStyle.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${theme.bgImage})`;
    pageStyle.backgroundSize = 'cover';
    pageStyle.backgroundPosition = 'center';
    pageStyle.backgroundAttachment = 'fixed';
  }

  const cardStyle: React.CSSProperties = {
    background: cardBg,
    borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#000',
    boxShadow: isDark ? '6px 6px 0px rgba(255,255,255,0.08)' : '4px 4px 0px #000',
    backdropFilter: isDark ? 'blur(12px)' : undefined,
  };

  const inputClass = isDark ? 'nb-input' : 'nb-input';

  // ── Handlers ──
  const handleChange = (fieldId: string, value: any) => setFormData((p) => ({ ...p, [fieldId]: value }));

  const handleCheckboxMulti = (fieldId: string, option: string, checked: boolean) => {
    const current: string[] = formData[fieldId] || [];
    handleChange(fieldId, checked ? [...current, option] : current.filter((o: string) => o !== option));
  };

  const handleFileChange = async (fieldId: string, file: File | null) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('File too large. Max 10 MB.'); return; }
    try {
      setUploadProgress((p) => ({ ...p, [fieldId]: 'uploading' }));
      const blobId = await WalrusStorage.uploadFile(file);
      handleChange(fieldId, { name: file.name, blobId, type: file.type, size: file.size });
      setUploadProgress((p) => ({ ...p, [fieldId]: 'done' }));
    } catch (err: any) {
      console.error(err);
      setUploadProgress((p) => ({ ...p, [fieldId]: 'error' }));
      setError(`File upload failed: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!account) {
      setError('Please connect your SUI wallet to submit.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    try {
      let payload = { ...formData };
      if (form.isEncrypted) {
        try {
          const encrypted = await MystenSealEncryption.encrypt(payload, form.adminAddress, suiClient);
          payload = { _sealed: true, ciphertext: encrypted };
        } catch (encErr: any) {
          throw new Error('Seal encryption failed. The form admin may need to configure Seal API keys. ' + (encErr.message || ''));
        }
      }
      
      // 1. Upload to Walrus
      const submissionBlobId = await WalrusStorage.upload({
        formId: form.id, 
        formTitle: form.title, 
        submittedAt: Date.now(),
        encrypted: form.isEncrypted, 
        data: payload,
      });
      setWalrusBlobId(submissionBlobId);

      // 2. Add to SUI Blockchain
      const packageId = import.meta.env.VITE_SEAL_PACKAGE_ID || '0x2cd53cd2943ae126a56dc94542036128c7e8b01d13c6e3ca5db0878effdbf59c';
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::form_registry::add_submission`,
        arguments: [tx.object(form.id), tx.pure.string(submissionBlobId)],
      });

      const response = await signAndExecuteTransaction({
        transaction: tx,
      });

      await suiClient.waitForTransaction({ digest: response.digest });
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to submit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Category labels ──
  const catLabels: Record<string, string> = {
    bug_report: 'Bug Report', feature_request: 'Feature Request',
    product_feedback: 'Feedback', survey: 'Survey',
    application: 'Application', other: 'Other',
  };

  const titleAlign = theme.titleAlign || 'left';
  const descAlign = theme.descAlign || 'left';

  // ── Success ──
  if (submitted) {
    return (
      <div className={`${pageBgClass} ${animClass} ${isDark ? 'theme-dark' : ''}`}
        style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {showParticles && <div className="theme-particles"><div className="p" /><div className="p" /><div className="p" /><div className="p" /></div>}
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="nb-box" style={{ ...cardStyle, padding: '50px', textAlign: 'center', maxWidth: '540px', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, ...spring }}>
            <CheckCircle size={64} strokeWidth={3} color={accentColor} style={{ marginBottom: '20px' }} />
          </motion.div>
          <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Thank You!</h1>
          <p style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>
            Your response has been permanently stored on Walrus and registered on the SUI blockchain.
          </p>
          {form.isEncrypted && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>
              <Shield size={16} color={accentColor} /> Encrypted via Seal
            </div>
          )}
          {walrusBlobId && (
            <div style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '8px', border: isDark ? '2px solid rgba(255,255,255,0.1)' : '2px solid #000', marginTop: '8px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Database size={12} /> Walrus Blob ID:
              </p>
              <code style={{ fontSize: '11px', wordBreak: 'break-all', opacity: 0.8 }}>{walrusBlobId}</code>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className={`${pageBgClass} ${animClass} ${isDark ? 'theme-dark' : ''}`} style={pageStyle}>
      {showParticles && (
        <div className="theme-particles">
          <div className="p" /><div className="p" /><div className="p" /><div className="p" />
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="nb-box" style={{ ...cardStyle, padding: '40px', overflow: 'hidden', border: `3px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#000'}` }}>

          {/* Accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: accentColor }} />

          {/* ── Header ── */}
          <div style={{ marginBottom: '32px', borderBottom: `3px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#000'}`, paddingBottom: '20px', paddingTop: '8px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
              <span className="nb-badge purple">{catLabels[form.category] || form.category}</span>
              {form.isEncrypted && (
                <span className="nb-badge green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={10} /> Seal Encrypted
                </span>
              )}
            </div>
            <h1 style={{ 
              fontSize: `${theme.titleStyle?.fontSize || 36}px`, 
              color: theme.titleStyle?.color || accentColor, 
              fontWeight: theme.titleStyle?.bold ? 'bold' : '800',
              fontStyle: theme.titleStyle?.italic ? 'italic' : 'normal',
              textShadow: isDark ? '2px 2px 0px rgba(0,0,0,0.5)' : '3px 3px 0px #000', 
              marginBottom: '10px', textAlign: titleAlign 
            }}>
              {form.title}
            </h1>
            {form.description && (
              <p style={{ 
                fontSize: `${theme.descStyle?.fontSize || 16}px`, 
                color: theme.descStyle?.color || (isDark ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'),
                fontWeight: theme.descStyle?.bold ? 'bold' : '600',
                fontStyle: theme.descStyle?.italic ? 'italic' : 'normal',
                whiteSpace: 'pre-wrap', textAlign: descAlign 
              }}>
                {form.description}
              </p>
            )}
          </div>

          {/* ── SEAL Encryption Banner ── */}
          {form.isEncrypted && (
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                border: isDark ? '3px solid rgba(0,0,0,0.5)' : '3px solid #000',
                boxShadow: isDark ? '4px 4px 0px rgba(0,0,0,0.5)' : '4px 4px 0px #000',
                marginBottom: '32px',
                display: 'flex',
                gap: '14px',
                alignItems: 'center'
              }}>
              <div style={{ background: '#fff', padding: '10px', borderRadius: '50%', border: '2px solid #000', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '2px', textShadow: '1px 1px 0px rgba(0,0,0,0.3)' }}>Secured by Seal Protocol</h3>
                <p style={{ fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>Your responses are end-to-end encrypted. Only the form owner can decrypt your data.</p>
              </div>
            </motion.div>
          )}

          {/* ── Error ── */}
          {error && (
            <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              style={{ background: 'rgba(239,35,60,0.1)', border: '3px solid var(--error)', borderRadius: '10px', padding: '14px', marginBottom: '20px', fontWeight: 700, color: 'var(--error)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={20} /> {error}
            </motion.div>
          )}

          {/* ── Form Fields ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {form.fields.map((field: any, fi: number) => (
              <motion.div key={field.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: fi * 0.05 }}>
                <label className="nb-label" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : undefined }}>
                  {field.label || 'Untitled Field'}{' '}
                  {field.required && <span style={{ color: 'var(--error)' }}>*</span>}
                </label>

                {field.type === 'TEXT' && (
                  <input type="text" className={inputClass} required={field.required}
                    value={formData[field.id] || ''} onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder || 'Your answer'} />
                )}

                {field.type === 'URL' && (
                  <input type="url" className={inputClass} required={field.required}
                    value={formData[field.id] || ''} onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder || 'https://example.com'} />
                )}

                {field.type === 'PARAGRAPH' && (
                  <textarea className={inputClass} rows={4} required={field.required}
                    value={formData[field.id] || ''} 
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                    placeholder={field.placeholder || 'Write your detailed response...'} 
                    style={{ resize: 'none', overflow: 'hidden' }} />
                )}

                {field.type === 'DROPDOWN' && (
                  <select className="nb-select" required={field.required}
                    value={formData[field.id] || ''} onChange={(e) => handleChange(field.id, e.target.value)}>
                    <option value="" disabled>Select an option</option>
                    {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                )}

                {field.type === 'CHECKBOX' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {field.options?.map((opt: string) => {
                      const isChecked = (formData[field.id] || []).includes(opt);
                      return (
                        <motion.label key={opt} whileHover={{ x: 3 }} style={{
                          display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, cursor: 'pointer',
                          padding: '10px 14px', background: isChecked ? (isDark ? 'rgba(157,78,221,0.3)' : 'var(--primary-light)') : (isDark ? 'rgba(255,255,255,0.04)' : 'var(--bg-color)'),
                          border: `2px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#000'}`, borderRadius: '10px', transition: 'all 0.15s',
                          color: isChecked && !isDark ? '#fff' : undefined,
                        }}>
                          <input type="checkbox" checked={isChecked}
                            onChange={(e) => handleCheckboxMulti(field.id, opt, e.target.checked)}
                            style={{ width: '20px', height: '20px', accentColor: accentColor }} />
                          {opt}
                        </motion.label>
                      );
                    })}
                  </div>
                )}

                {field.type === 'STAR_RATING' && (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.div key={star} whileHover={{ scale: 1.3, rotate: -8 }} whileTap={{ scale: 0.9 }}
                        transition={spring} style={{ cursor: 'pointer' }}
                        onClick={() => handleChange(field.id, star)}>
                        <Star size={38} color={isDark ? 'rgba(255,255,255,0.3)' : '#000'}
                          fill={(formData[field.id] || 0) >= star ? '#fee440' : 'transparent'}
                          style={{ filter: (formData[field.id] || 0) >= star ? 'drop-shadow(2px 2px 0px rgba(0,0,0,0.3))' : 'none' }} />
                      </motion.div>
                    ))}
                    <span style={{ marginLeft: '10px', fontWeight: 800, fontSize: '20px', color: accentColor }}>
                      {formData[field.id] ? `${formData[field.id]}/5` : ''}
                    </span>
                    {field.required && !formData[field.id] && (
                      <input type="number" required style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} value="" readOnly tabIndex={-1} />
                    )}
                  </div>
                )}

                {field.type === 'MEDIA' && (
                  <div className="nb-box" style={{
                    ...cardStyle, padding: '28px', borderStyle: 'dashed', textAlign: 'center',
                    background: uploadProgress[field.id] === 'done' ? (isDark ? 'rgba(6,214,160,0.1)' : '#e8fdf5') : cardBg,
                  }}>
                    <input type="file" id={`file-${field.id}`} style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)} accept="image/*,video/*" />
                    <label htmlFor={`file-${field.id}`} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      {uploadProgress[field.id] === 'uploading' ? (
                        <><Loader size={44} color={accentColor} className="anim-float" /><span style={{ fontWeight: 700 }}>Uploading to Walrus...</span></>
                      ) : uploadProgress[field.id] === 'done' ? (
                        <><CheckCircle size={44} color="var(--success)" /><span style={{ fontWeight: 700 }}>{formData[field.id]?.name} — stored on Walrus</span></>
                      ) : uploadProgress[field.id] === 'error' ? (
                        <><AlertCircle size={44} color="var(--error)" /><span style={{ fontWeight: 700 }}>Upload failed — click to retry</span></>
                      ) : (
                        <><UploadCloud size={44} color={accentColor} /><span style={{ fontWeight: 700 }}>Click to upload screenshot or video</span></>
                      )}
                      <span style={{ fontSize: '12px', opacity: 0.5 }}>Max 10 MB · Images & Videos · Walrus Storage</span>
                    </label>
                  </div>
                )}

                {field.type === 'CONFIRMATION' && (
                  <motion.label whileHover={{ x: 3 }} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px',
                    background: formData[field.id] ? (isDark ? 'rgba(6,214,160,0.1)' : '#e8fdf5') : (isDark ? 'rgba(255,255,255,0.04)' : 'var(--bg-color)'),
                    border: `3px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#000'}`, borderRadius: '10px',
                    cursor: 'pointer', fontWeight: 600, lineHeight: 1.5, transition: 'all 0.15s',
                  }}>
                    <input type="checkbox" required={field.required} checked={formData[field.id] || false}
                      onChange={(e) => handleChange(field.id, e.target.checked)}
                      style={{ width: '24px', height: '24px', accentColor, marginTop: '2px', flexShrink: 0 }} />
                    {field.confirmationText || 'I confirm that all information provided is accurate.'}
                  </motion.label>
                )}
              </motion.div>
            ))}

            {/* Submit */}
            {!account ? (
              <div style={{ marginTop: '20px', padding: '24px', background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', borderRadius: '12px', border: `2px dashed ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`, textAlign: 'center' }}>
                <Lock size={32} color={accentColor} style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Wallet Required</h3>
                <p style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>
                  To securely submit your response to the SUI blockchain, please connect your wallet.
                </p>
                <div style={{ display: 'inline-block' }}><ConnectButton /></div>
              </div>
            ) : (
              <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="nb-button lg" style={{ width: '100%', background: accentColor, color: '#fff', marginTop: '20px' }}>
                {isSubmitting ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Loader size={18} className="anim-spin" /> Submitting to Blockchain...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {form.isEncrypted && <Shield size={16} />} 
                    {form.isEncrypted ? 'Securely Submit' : 'Submit Response'}
                  </span>
                )}
              </motion.button>
            )}
          </form>
        </motion.div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', fontWeight: 700, opacity: 0.5 }}>
          Powered by TuskForm — Walrus Storage · SUI Mainnet
        </p>
      </div>
    </div>
  );
};
