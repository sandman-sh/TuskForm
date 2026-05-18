import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { FormDefinition, FormField, ThemePreset, TextStyle } from '../store/store';
import { v4 as uuidv4 } from 'uuid';
import {
  Trash2, Save, ArrowLeft, Copy, GripVertical, Palette, Shield,
  Type, AlignLeft, AlignCenter, AlignRight, FileText, ChevronDown,
  Link2, Star, UploadCloud, CheckSquare, ToggleLeft, PenTool, Plus, X, Bold, Italic, Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentAccount, ConnectButton, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { THEME_PRESETS } from '../lib/themes';
import { WalrusStorage } from '../lib/walrus';

type FieldType = 'TEXT' | 'PARAGRAPH' | 'DROPDOWN' | 'CHECKBOX' | 'STAR_RATING' | 'URL' | 'MEDIA' | 'CONFIRMATION';

const FIELD_META: { type: FieldType; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { type: 'TEXT', label: 'Short Text', Icon: Type },
  { type: 'PARAGRAPH', label: 'Paragraph', Icon: PenTool },
  { type: 'DROPDOWN', label: 'Dropdown', Icon: ChevronDown },
  { type: 'CHECKBOX', label: 'Checkboxes', Icon: CheckSquare },
  { type: 'STAR_RATING', label: 'Star Rating', Icon: Star },
  { type: 'URL', label: 'URL Link', Icon: Link2 },
  { type: 'MEDIA', label: 'Media Upload', Icon: UploadCloud },
  { type: 'CONFIRMATION', label: 'Confirm', Icon: ToggleLeft },
];

const CATEGORIES = [
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'product_feedback', label: 'Product Feedback' },
  { value: 'survey', label: 'Survey' },
  { value: 'application', label: 'Application' },
  { value: 'other', label: 'Other' },
];

export const FormBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [copied, setCopied] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<Partial<FormDefinition>>({
    title: '',
    description: '',
    category: 'other',
    isEncrypted: false,
    fields: [],
    approvedAdmins: [],
    theme: { preset: 'clean', titleAlign: 'left', descAlign: 'left', titleStyle: {}, descStyle: {} },
  });

  // ─── Wallet Gate ───
  if (!account) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="nb-box"
          style={{ padding: '50px', textAlign: 'center', maxWidth: '480px' }}>
          <Shield size={52} color="var(--primary)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '26px', marginBottom: '12px' }}>Wallet Required</h2>
          <p style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
            Connect your SUI Mainnet wallet to create and manage forms. Your wallet address is your identity.
          </p>
          <div className="wallet-btn-wrap" style={{ display: 'inline-block' }}>
            <ConnectButton />
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!form.title) { alert('Form title is required'); return; }
    if (!form.fields?.length) { alert('Add at least one field'); return; }

    setIsSaving(true);
    try {
      const formPayload = {
        ...form,
        adminAddress: account.address,
        createdAt: Date.now(),
      };

      const formBlobId = await WalrusStorage.upload(formPayload);

      const packageId = import.meta.env.VITE_SEAL_PACKAGE_ID || '0x2cd53cd2943ae126a56dc94542036128c7e8b01d13c6e3ca5db0878effdbf59c';
      const tx = new Transaction();
      const blobArg = tx.pure.string(formBlobId);

      tx.moveCall({
        target: `${packageId}::form_registry::create_form`,
        arguments: [blobArg],
      });

      const response = await signAndExecuteTransaction({ transaction: tx });
      await suiClient.waitForTransaction({ digest: response.digest });

      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.message || String(err);
      alert(`Failed to save form to blockchain: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };


  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: uuidv4(),
      type: type as any,
      label: '',
      required: false,
      placeholder: '',
      options: type === 'DROPDOWN' ? ['Option 1', 'Option 2'] : type === 'CHECKBOX' ? ['Choice 1', 'Choice 2'] : undefined,
      confirmationText: type === 'CONFIRMATION' ? 'I confirm that the information provided is accurate.' : undefined,
    };
    setForm({ ...form, fields: [...(form.fields || []), newField] });
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm({ ...form, fields: form.fields?.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)) });
  };

  const removeField = (fieldId: string) => {
    setForm({ ...form, fields: form.fields?.filter((f) => f.id !== fieldId) });
  };

  const moveField = (index: number, dir: -1 | 1) => {
    const fields = [...(form.fields || [])];
    const target = index + dir;
    if (target < 0 || target >= fields.length) return;
    [fields[index], fields[target]] = [fields[target], fields[index]];
    setForm({ ...form, fields });
  };

  const shareableUrl = id ? `${window.location.origin}/f/${id}` : null;
  const copyLink = () => {
    if (shareableUrl) {
      navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentTheme = form.theme || { preset: 'clean' as ThemePreset };

  const updateTitleStyle = (updates: Partial<TextStyle>) => {
    setForm({
      ...form,
      theme: { ...currentTheme, titleStyle: { ...currentTheme.titleStyle, ...updates } }
    });
  };

  const updateDescStyle = (updates: Partial<TextStyle>) => {
    setForm({
      ...form,
      theme: { ...currentTheme, descStyle: { ...currentTheme.descStyle, ...updates } }
    });
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/dashboard')} className="nb-button ghost">
          <ArrowLeft size={18} /> Dashboard
        </button>
        {shareableUrl && (
          <button onClick={copyLink} className="nb-button secondary">
            <Copy size={16} /> {copied ? 'Copied!' : 'Copy Share Link'}
          </button>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="nb-box"
        style={{ padding: '36px', background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '32px', color: '#fff', textShadow: '3px 3px 0px #000', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={32} /> {id ? 'Edit Form' : 'Create Form'}
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowThemePicker(!showThemePicker)} className="nb-button accent">
              <Palette size={18} /> Theme
            </button>
            <button onClick={handleSave} disabled={isSaving} className="nb-button lg" style={{ background: '#fff', color: '#000' }}>
              {isSaving ? <Loader size={20} className="anim-spin" /> : <Save size={20} />} 
              {isSaving ? 'Deploying to SUI...' : 'Save to Blockchain'}
            </button>
          </div>
        </div>

        {/* ─── Theme Picker ─── */}
        <AnimatePresence>
          {showThemePicker && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="nb-box" style={{ padding: '24px', marginBottom: '24px', overflow: 'hidden' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={18} /> Choose Form Theme
              </h3>
              <div className="theme-grid">
                {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((key) => {
                  const theme = THEME_PRESETS[key];
                  return (
                    <div key={key}
                      className={`theme-swatch ${currentTheme.preset === key ? 'active' : ''}`}
                      style={{ background: theme.preview, color: ['midnight', 'ocean', 'sunset', 'aurora', 'neon', 'forest'].includes(key) ? '#fff' : '#000' }}
                      onClick={() => setForm({ ...form, theme: { ...currentTheme, preset: key } })}>
                      {theme.label}
                    </div>
                  );
                })}
              </div>

              {/* Custom colors */}
              {currentTheme.preset === 'custom' && (
                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="nb-label">Background</label>
                    <input type="color" value={currentTheme.bgColor || '#ffffff'}
                      onChange={(e) => setForm({ ...form, theme: { ...currentTheme, bgColor: e.target.value } })}
                      style={{ width: '100%', height: '40px', border: '3px solid #000', borderRadius: '8px', cursor: 'pointer' }} />
                  </div>
                  <div>
                    <label className="nb-label">Accent</label>
                    <input type="color" value={currentTheme.accentColor || '#9d4edd'}
                      onChange={(e) => setForm({ ...form, theme: { ...currentTheme, accentColor: e.target.value } })}
                      style={{ width: '100%', height: '40px', border: '3px solid #000', borderRadius: '8px', cursor: 'pointer' }} />
                  </div>
                  <div>
                    <label className="nb-label">Text</label>
                    <input type="color" value={currentTheme.textColor || '#101010'}
                      onChange={(e) => setForm({ ...form, theme: { ...currentTheme, textColor: e.target.value } })}
                      style={{ width: '100%', height: '40px', border: '3px solid #000', borderRadius: '8px', cursor: 'pointer' }} />
                  </div>
                </div>
              )}

              {/* Background image URL */}
              <div style={{ marginTop: '12px' }}>
                <label className="nb-label">Background Image URL (optional)</label>
                <input className="nb-input" value={currentTheme.bgImage || ''}
                  onChange={(e) => setForm({ ...form, theme: { ...currentTheme, bgImage: e.target.value } })}
                  placeholder="https://images.unsplash.com/..." />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          
          {/* Main Form Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* ─── Meta Fields ─── */}
            <div className="nb-box" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Title Editor */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                    <label className="nb-label" style={{ marginBottom: 0 }}>Form Title *</label>
                    <div style={{ display: 'flex', gap: '4px', background: '#f5f5f5', padding: '4px', borderRadius: '8px', border: '2px solid #000' }}>
                      <button className={`nb-button sm ghost`} style={{ padding: '4px', background: currentTheme.titleStyle?.bold ? '#ddd' : 'transparent' }} onClick={() => updateTitleStyle({ bold: !currentTheme.titleStyle?.bold })}><Bold size={14} /></button>
                      <button className={`nb-button sm ghost`} style={{ padding: '4px', background: currentTheme.titleStyle?.italic ? '#ddd' : 'transparent' }} onClick={() => updateTitleStyle({ italic: !currentTheme.titleStyle?.italic })}><Italic size={14} /></button>
                      <div style={{ width: '1px', background: '#ccc', margin: '0 4px' }} />
                      <input type="color" value={currentTheme.titleStyle?.color || '#000000'} onChange={(e) => updateTitleStyle({ color: e.target.value })} style={{ width: '24px', height: '24px', padding: 0, border: '1px solid #000', borderRadius: '4px', cursor: 'pointer' }} title="Text Color" />
                      <div style={{ width: '1px', background: '#ccc', margin: '0 4px' }} />
                      {(['left', 'center', 'right'] as const).map((a) => (
                        <button key={a} className={`nb-button sm ghost`} style={{ padding: '4px', background: currentTheme.titleAlign === a ? '#ddd' : 'transparent' }} onClick={() => setForm({ ...form, theme: { ...currentTheme, titleAlign: a } })}>
                          {a === 'left' && <AlignLeft size={14} />}
                          {a === 'center' && <AlignCenter size={14} />}
                          {a === 'right' && <AlignRight size={14} />}
                        </button>
                      ))}
                      <div style={{ width: '1px', background: '#ccc', margin: '0 4px' }} />
                      <input type="number" value={currentTheme.titleStyle?.fontSize || 36} onChange={(e) => updateTitleStyle({ fontSize: parseInt(e.target.value) })} style={{ width: '50px', border: 'none', background: 'transparent', fontWeight: 600, padding: '0 4px' }} title="Font Size (px)" />
                    </div>
                  </div>
                  <input className="nb-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Bug Report Form"
                    style={{ 
                      fontSize: `${currentTheme.titleStyle?.fontSize || 36}px`, 
                      fontWeight: currentTheme.titleStyle?.bold ? 'bold' : 'normal',
                      fontStyle: currentTheme.titleStyle?.italic ? 'italic' : 'normal',
                      textAlign: currentTheme.titleAlign || 'left',
                      color: currentTheme.titleStyle?.color || '#000000'
                    }} />
                </div>

                {/* Description Editor */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                    <label className="nb-label" style={{ marginBottom: 0 }}>Description</label>
                    <div style={{ display: 'flex', gap: '4px', background: '#f5f5f5', padding: '4px', borderRadius: '8px', border: '2px solid #000' }}>
                      <button className={`nb-button sm ghost`} style={{ padding: '4px', background: currentTheme.descStyle?.bold ? '#ddd' : 'transparent' }} onClick={() => updateDescStyle({ bold: !currentTheme.descStyle?.bold })}><Bold size={14} /></button>
                      <button className={`nb-button sm ghost`} style={{ padding: '4px', background: currentTheme.descStyle?.italic ? '#ddd' : 'transparent' }} onClick={() => updateDescStyle({ italic: !currentTheme.descStyle?.italic })}><Italic size={14} /></button>
                      <div style={{ width: '1px', background: '#ccc', margin: '0 4px' }} />
                      <input type="color" value={currentTheme.descStyle?.color || '#000000'} onChange={(e) => updateDescStyle({ color: e.target.value })} style={{ width: '24px', height: '24px', padding: 0, border: '1px solid #000', borderRadius: '4px', cursor: 'pointer' }} title="Text Color" />
                      <div style={{ width: '1px', background: '#ccc', margin: '0 4px' }} />
                      {(['left', 'center', 'right'] as const).map((a) => (
                        <button key={a} className={`nb-button sm ghost`} style={{ padding: '4px', background: currentTheme.descAlign === a ? '#ddd' : 'transparent' }} onClick={() => setForm({ ...form, theme: { ...currentTheme, descAlign: a } })}>
                          {a === 'left' && <AlignLeft size={14} />}
                          {a === 'center' && <AlignCenter size={14} />}
                          {a === 'right' && <AlignRight size={14} />}
                        </button>
                      ))}
                      <div style={{ width: '1px', background: '#ccc', margin: '0 4px' }} />
                      <input type="number" value={currentTheme.descStyle?.fontSize || 16} onChange={(e) => updateDescStyle({ fontSize: parseInt(e.target.value) })} style={{ width: '50px', border: 'none', background: 'transparent', fontWeight: 600, padding: '0 4px' }} title="Font Size (px)" />
                    </div>
                  </div>
                  <textarea className="nb-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Explain the purpose of this form..." rows={3} 
                    style={{ 
                      fontSize: `${currentTheme.descStyle?.fontSize || 16}px`, 
                      fontWeight: currentTheme.descStyle?.bold ? 'bold' : 'normal',
                      fontStyle: currentTheme.descStyle?.italic ? 'italic' : 'normal',
                      textAlign: currentTheme.descAlign || 'left',
                      color: currentTheme.descStyle?.color || '#000000'
                    }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="nb-label">Category</label>
                    <select className="nb-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as FormDefinition['category'] })}>
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div 
                    onClick={() => {
                      if (!form.isEncrypted) {
                        alert("Seal keys not set. Please wait, this feature will be available soon!");
                        return;
                      }
                      setForm({ ...form, isEncrypted: false });
                    }}
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', 
                      padding: '8px 12px', 
                      background: form.isEncrypted ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'var(--bg-color)',
                      color: form.isEncrypted ? '#fff' : 'inherit',
                      borderRadius: '8px', border: '3px solid #000',
                      cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: form.isEncrypted ? '3px 3px 0px rgba(0,0,0,1)' : '3px 3px 0px transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        background: form.isEncrypted ? '#fff' : 'transparent', 
                        color: form.isEncrypted ? '#10b981' : 'inherit',
                        padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        <Shield size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13px', textShadow: form.isEncrypted ? '1px 1px 0px rgba(0,0,0,0.2)' : 'none' }}>Seal Protocol Encryption</div>
                        <div style={{ fontSize: '11px', fontWeight: 600, opacity: form.isEncrypted ? 0.9 : 0.6 }}>End-to-end responses</div>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <div style={{ 
                      width: '36px', height: '20px', borderRadius: '10px', flexShrink: 0,
                      background: form.isEncrypted ? '#fff' : '#ccc',
                      border: '2px solid #000', position: 'relative', transition: 'all 0.2s'
                    }}>
                      <div style={{ 
                        width: '12px', height: '12px', borderRadius: '50%', 
                        background: form.isEncrypted ? '#059669' : '#fff', border: '2px solid #000',
                        position: 'absolute', top: '2px', left: form.isEncrypted ? '18px' : '2px', transition: 'all 0.2s'
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Fields ─── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <AnimatePresence>
                {form.fields?.map((field, index) => {
                  const meta = FIELD_META.find((f) => f.type === field.type);
                  return (
                    <motion.div key={field.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="nb-box" style={{ padding: '18px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '4px' }}>
                        <button onClick={() => moveField(index, -1)} disabled={index === 0}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: index === 0 ? 0.3 : 1 }}>▲</button>
                        <GripVertical size={16} color="#aaa" />
                        <button onClick={() => moveField(index, 1)} disabled={index === (form.fields?.length || 0) - 1}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: index === (form.fields?.length || 0) - 1 ? 0.3 : 1 }}>▼</button>
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className="nb-badge yellow" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {meta && <meta.Icon size={12} />} {field.type.replace('_', ' ')}
                          </span>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                            <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              style={{ accentColor: 'var(--error)' }} />
                            Required
                          </label>
                        </div>

                        <input className="nb-input" value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} placeholder="Field label / question" />

                        {(field.type === 'TEXT' || field.type === 'URL') && (
                          <input className="nb-input" value={field.placeholder || ''} onChange={(e) => updateField(field.id, { placeholder: e.target.value })} placeholder="Placeholder text (optional)" style={{ fontSize: '13px' }} />
                        )}
                        {field.type === 'PARAGRAPH' && (
                          <textarea className="nb-input" value={field.placeholder || ''} onChange={(e) => updateField(field.id, { placeholder: e.target.value })} placeholder="Placeholder text (optional) - Multi-line supported" rows={4} style={{ fontSize: '13px', resize: 'vertical' }} />
                        )}

                        {(field.type === 'DROPDOWN' || field.type === 'CHECKBOX') && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                            <label className="nb-label">Options</label>
                            <AnimatePresence>
                              {field.options?.map((opt, i) => (
                                <motion.div key={i} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <div style={{ width: '18px', height: '18px', borderRadius: field.type === 'CHECKBOX' ? '4px' : '50%', border: '2px solid #ccc', flexShrink: 0 }} />
                                  <input className="nb-input" value={opt} onChange={(e) => {
                                    const newOpts = [...(field.options || [])];
                                    newOpts[i] = e.target.value;
                                    updateField(field.id, { options: newOpts });
                                  }} style={{ flex: 1, padding: '8px 12px' }} placeholder={`Option ${i + 1}`} />
                                  <button onClick={() => {
                                    if (field.options && field.options.length <= 1) return; // Prevent deleting last option
                                    const newOpts = [...(field.options || [])];
                                    newOpts.splice(i, 1);
                                    updateField(field.id, { options: newOpts });
                                  }} className="nb-button ghost sm" style={{ padding: '8px' }} disabled={field.options?.length === 1}>
                                    <X size={16} />
                                  </button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                            <button onClick={() => updateField(field.id, { options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] })} 
                              className="nb-button ghost sm" style={{ alignSelf: 'flex-start', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Plus size={14} /> Add Option
                            </button>
                          </div>
                        )}

                        {field.type === 'CONFIRMATION' && (
                          <div>
                            <label className="nb-label">Confirmation Text</label>
                            <input className="nb-input" value={field.confirmationText || ''} onChange={(e) => updateField(field.id, { confirmationText: e.target.value })} />
                          </div>
                        )}
                      </div>

                      <button onClick={() => removeField(field.id)} className="nb-button danger sm">
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {!form.fields?.length && (
                <div className="nb-box" style={{ padding: '60px 40px', textAlign: 'center', borderStyle: 'dashed' }}>
                  <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>No fields yet — add one from the menu to get started.</p>
                </div>
              )}
            </div>
            
          </div>

          {/* ─── Floating Sidebar (Add Field) ─── */}
          <div style={{ position: 'sticky', top: '24px', width: '280px', flexShrink: 0 }}>
            <div className="nb-box" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> Add Field
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {FIELD_META.map((t) => (
                  <motion.button key={t.type} whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
                    onClick={() => addField(t.type)} className="nb-button ghost"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px', padding: '12px' }}>
                    <t.Icon size={16} /> {t.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
