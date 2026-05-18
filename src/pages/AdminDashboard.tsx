import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, ExternalLink, Download, Lock, Copy, Trash2, Send,
  FileText, Shield, BarChart3, Loader, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentAccount, ConnectButton, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { THEME_PRESETS } from '../lib/themes';
import { MystenSealEncryption } from '../lib/seal_sdk';
import { WalrusStorage } from '../lib/walrus';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { KimoChatbox } from '../components/KimoChatbox';

const spring = { type: 'spring' as const, stiffness: 300, damping: 20 };

export const AdminDashboard = () => {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [view, setView] = useState<'forms' | 'submissions'>('forms');
  const [submissionsViewType, setSubmissionsViewType] = useState<'individual' | 'summary'>('summary');
  const [copied, setCopied] = useState(false);

  const [blockchainForms, setBlockchainForms] = useState<any[]>([]);
  const [blockchainSubmissions, setBlockchainSubmissions] = useState<any[]>([]);
  const [isLoadingForms, setIsLoadingForms] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [decryptedPayloads, setDecryptedPayloads] = useState<Record<string, Record<string, any>>>({});
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // ─── Review & Prioritization State ───
  const [reviewData, setReviewData] = useState<Record<string, { status: string, priority: string }>>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tuskform_review_data');
      if (saved) setReviewData(JSON.parse(saved));
    } catch(e){}
  }, []);

  const updateReviewData = (blobId: string, updates: { status?: string, priority?: string }) => {
    setReviewData(prev => {
      const next = { ...prev, [blobId]: { ...(prev[blobId] || { status: 'new', priority: 'none' }), ...updates } };
      localStorage.setItem('tuskform_review_data', JSON.stringify(next));
      return next;
    });
  };

  // ─── Form Status & Prioritization State ───
  const [formReviewData, setFormReviewData] = useState<Record<string, { status: string, priority: string }>>({});
  const [formStatusFilter, setFormStatusFilter] = useState<string>('all');
  const [formPriorityFilter, setFormPriorityFilter] = useState<string>('all');

  useEffect(() => {
    try {
      const savedForms = localStorage.getItem('tuskform_form_review_data');
      if (savedForms) setFormReviewData(JSON.parse(savedForms));
    } catch(e){}
  }, []);

  const updateFormReviewData = (formId: string, updates: { status?: string, priority?: string }) => {
    setFormReviewData(prev => {
      const next = { ...prev, [formId]: { ...(prev[formId] || { status: 'new', priority: 'none' }), ...updates } };
      localStorage.setItem('tuskform_form_review_data', JSON.stringify(next));
      return next;
    });
  };

  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const deleteForm = async (capId: string) => {
    if (!confirm('Are you sure you want to delete this form? It will be permanently removed from your dashboard.')) return;
    setIsDeleting(capId);
    try {
      const tx = new Transaction();
      // Burn the capability by sending it to 0x0
      tx.transferObjects([tx.object(capId)], tx.pure.address('0x0000000000000000000000000000000000000000000000000000000000000000'));
      
      const response = await signAndExecuteTransaction({
        transaction: tx as any,
      });
      await suiClient.waitForTransaction({ digest: response.digest });
      
      // Remove from UI
      setBlockchainForms(prev => prev.filter(f => f.capId !== capId));
      if (activeFormId === capId) setActiveFormId(null);
    } catch (e) {
      console.error('Failed to delete form', e);
      alert('Failed to delete form. Make sure you have enough SUI for gas fees.');
    } finally {
      setIsDeleting(null);
    }
  };

  const [isTransferring, setIsTransferring] = useState<string | null>(null);

  const transferForm = async (capId: string) => {
    const destination = prompt('Enter the SUI wallet address to transfer this form to:');
    if (!destination) return;
    if (!destination.startsWith('0x') || destination.length !== 66) {
      alert('Invalid SUI address format. Must start with 0x and be 66 characters long.');
      return;
    }
    if (!confirm(`Are you sure you want to transfer this form? You will lose all admin access to it.`)) return;

    setIsTransferring(capId);
    try {
      const tx = new Transaction();
      tx.transferObjects([tx.object(capId)], tx.pure.address(destination));
      
      const response = await signAndExecuteTransaction({
        transaction: tx as any,
      });
      await suiClient.waitForTransaction({ digest: response.digest });
      
      // Remove from UI since we no longer own it
      setBlockchainForms(prev => prev.filter(f => f.capId !== capId));
      if (activeFormId === capId) setActiveFormId(null);
      alert('Form successfully transferred!');
    } catch (e) {
      console.error('Failed to transfer form', e);
      alert('Failed to transfer form. Make sure you have enough SUI for gas fees.');
    } finally {
      setIsTransferring(null);
    }
  };

  // 1. Load Forms from SUI & Walrus
  useEffect(() => {
    if (!account?.address) return;
    const loadForms = async () => {
      setIsLoadingForms(true);
      try {
        const packageId = import.meta.env.VITE_SEAL_PACKAGE_ID || '0x2cd53cd2943ae126a56dc94542036128c7e8b01d13c6e3ca5db0878effdbf59c';
        const caps = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: { StructType: `${packageId}::form_registry::FormAdminCap` },
          options: { showContent: true }
        });
        
        const formIdToCapId: Record<string, string> = {};
        const formObjectIds = caps.data.map(cap => {
          const content = cap.data?.content as any;
          const formId = content?.fields?.form_id;
          if (formId) formIdToCapId[formId] = cap.data?.objectId as string;
          return formId;
        }).filter(Boolean);

        if (formObjectIds.length === 0) {
          setBlockchainForms([]);
          return;
        }

        const formObjects = await suiClient.multiGetObjects({
          ids: formObjectIds,
          options: { showContent: true }
        });

        const loadedForms = [];
        for (const obj of formObjects) {
          const content = obj.data?.content as any;
          if (!content?.fields) continue;
          
          const formBlobId = content.fields.form_blob_id;
          const submissionsArray = content.fields.submissions || [];
          
          // Fetch from Walrus
          try {
            const formDefinition = await WalrusStorage.download(formBlobId);
            loadedForms.push({
              ...formDefinition,
              id: obj.data?.objectId, // SUI Object ID
              capId: formIdToCapId[obj.data?.objectId as string],
              blobId: formBlobId,
              submissionsList: submissionsArray
            });
          } catch (e) {
            console.error("Failed to load Walrus form data", e);
          }
        }
        setBlockchainForms(loadedForms);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingForms(false);
      }
    };
    loadForms();
  }, [account?.address, suiClient]);

  // 2. Load Submissions for active form from Walrus
  useEffect(() => {
    if (!activeFormId) return;
    const loadSubmissions = async () => {
      setIsLoadingSubmissions(true);
      try {
        const activeForm = blockchainForms.find(f => f.id === activeFormId);
        if (!activeForm || !activeForm.submissionsList.length) {
          setBlockchainSubmissions([]);
          return;
        }

        const loadedSubs = [];
        for (const blobId of activeForm.submissionsList) {
          try {
            const subData = await WalrusStorage.download(blobId);
            loadedSubs.push({ ...subData, blobId });
          } catch (e) {
            console.error("Failed to load submission", e);
          }
        }
        setBlockchainSubmissions(loadedSubs.sort((a, b) => b.submittedAt - a.submittedAt));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingSubmissions(false);
      }
    };
    loadSubmissions();
  }, [activeFormId, blockchainForms]);

  // 3. Decrypt Sealed Submissions
  useEffect(() => {
    if (!account?.address) return;
    const decryptAll = async () => {
      const newDecrypted: Record<string, Record<string, any>> = {};
      let changed = false;
      for (const sub of blockchainSubmissions) {
        if (sub.encrypted && sub.data?._sealed && sub.data.ciphertext && !decryptedPayloads[sub.blobId]) {
          try {
            // Note: Official Seal requires the admin to sign a SessionKey and a PTB.
            const plain = await MystenSealEncryption.decrypt(
              sub.data.ciphertext, 
              {} as any, // Mock SessionKey
              new Uint8Array(), // Mock txBytes
              {} as any // Mock suiClient
            );
            if (plain) {
              newDecrypted[sub.blobId] = plain;
              changed = true;
            }
          } catch (err) {
            newDecrypted[sub.blobId] = { 
              error: 'Seal Encryption requires API keys and a signed wallet transaction to decrypt.' 
            };
            changed = true;
          }
        }
      }
      if (changed) {
        setDecryptedPayloads((prev) => ({ ...prev, ...newDecrypted }));
      }
    };
    decryptAll();
  }, [blockchainSubmissions, account?.address]);

  if (!account) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', textAlign: 'center' }}>
        <div className="nb-box anim-pop" style={{ padding: '60px', maxWidth: '450px' }}>
          <Lock size={56} color="var(--primary)" style={{ marginBottom: '16px' }} />
          <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>Connect Your Wallet</h1>
          <p style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '24px' }}>
            You must connect your SUI wallet to access your on-chain forms.
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  const activeForm = activeFormId ? blockchainForms.find((f) => f.id === activeFormId) : null;

  const exportCSV = () => {
    if (!activeForm || !blockchainSubmissions.length) return;
    const fieldLabels = activeForm.fields.map((f: any) => f.label || f.id);
    const headers = ['Submitted At', 'Walrus Blob ID', ...fieldLabels];
    const rows = blockchainSubmissions.map((sub) => [
      new Date(sub.submittedAt).toLocaleString(),
      sub.blobId,
      ...activeForm.fields.map((f: any) => {
        const payload = decryptedPayloads[sub.blobId] || sub.data;
        const v = payload[f.id];
        return typeof v === 'object' ? JSON.stringify(v) : String(v ?? '');
      }),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeForm.title.replace(/\s+/g, '_')}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyLink = (formId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${formId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <motion.h1 whileHover={{ scale: 1.02 }} style={{ fontSize: '36px', color: 'var(--primary)', textShadow: '3px 3px 0px #000', margin: 0 }}>
              TuskForm
            </motion.h1>
          </Link>
          <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Decentralized Admin Dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <ConnectButton />
          <Link to="/build" className="nb-button"><Plus size={18} /> New Form</Link>
        </div>
      </div>

      <div className="nb-tabs" style={{ marginBottom: '24px', maxWidth: '400px' }}>
        <button className={`nb-tab ${view === 'forms' ? 'active' : ''}`} onClick={() => { setView('forms'); setActiveFormId(null); }}>
          <FileText size={14} style={{ marginRight: '6px' }} /> My Forms
        </button>
        <button className={`nb-tab ${view === 'submissions' ? 'active' : ''}`} onClick={() => setView('submissions')} disabled={!activeFormId}>
          <BarChart3 size={14} style={{ marginRight: '6px' }} /> Submissions
        </button>
      </div>

      {view === 'forms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="nb-box" style={{ padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', background: '#f9f9f9' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="nb-label">Form Status Filter</label>
              <select className="nb-select" value={formStatusFilter} onChange={(e) => setFormStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="nb-label">Form Priority Filter</label>
              <select className="nb-select" value={formPriorityFilter} onChange={(e) => setFormPriorityFilter(e.target.value)}>
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          <div className="card-grid stagger">
            {isLoadingForms ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
                <Loader className="anim-spin" size={48} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
                <h3>Syncing from SUI Blockchain...</h3>
              </div>
            ) : blockchainForms.filter(form => {
              const meta = formReviewData[form.id] || { status: 'new', priority: 'none' };
              if (formStatusFilter !== 'all' && meta.status !== formStatusFilter) return false;
              if (formPriorityFilter !== 'all' && meta.priority !== formPriorityFilter) return false;
              return true;
            }).map((form) => {
              const count = form.submissionsList.length;
              const themePreview = THEME_PRESETS[(form.theme?.preset as keyof typeof THEME_PRESETS) || 'clean']?.preview || THEME_PRESETS.clean.preview;
              const meta = formReviewData[form.id] || { status: 'new', priority: 'none' };
              return (
                <motion.div key={form.id} className={`nb-box anim-slide-up status-${meta.status} priority-${meta.priority}`}
                  style={{ padding: '0', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
                  whileHover={{ y: -5, rotate: -0.3 }} transition={spring}>
                  <div style={{ height: '8px', background: themePreview, borderBottom: '3px solid #000' }} />
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.85)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <span className="nb-badge ghost" style={{ marginBottom: '8px' }}>{form.category}</span>
                        <h3 style={{ fontSize: '22px', marginTop: '8px', color: '#101010' }}>{form.title}</h3>
                      </div>
                      {form.isEncrypted && (
                        <span className="nb-badge green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Shield size={10} /> Seal
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      <select className="nb-select" style={{ padding: '4px 8px', fontSize: '11px', width: 'auto', flex: 1, background: 'var(--white)', color: '#000' }}
                        value={meta.status}
                        onChange={(e) => updateFormReviewData(form.id, { status: e.target.value })}>
                        <option value="new">Status: New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                        <option value="archived">Archived</option>
                      </select>
                      <select className="nb-select" style={{ padding: '4px 8px', fontSize: '11px', width: 'auto', flex: 1, background: 'var(--white)', color: '#000' }}
                        value={meta.priority}
                        onChange={(e) => updateFormReviewData(form.id, { priority: e.target.value })}>
                        <option value="none">Priority: None</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <p style={{ flex: 1, marginBottom: '16px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
                      {form.description || 'No description.'}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      <div className="nb-badge yellow" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Database size={10} /> {count} Responses
                      </div>
                    </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => { setActiveFormId(form.id); setView('submissions'); }} className="nb-button sm secondary" style={{ width: '100%' }}>
                      <BarChart3 size={16} /> View Responses
                    </motion.button>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => copyLink(form.id)} className="nb-button sm ghost" style={{ flex: 1 }}>
                        <Copy size={14} /> {copied ? 'Copied' : 'Link'}
                      </button>
                      <a href={`/f/${form.id}`} target="_blank" rel="noreferrer" className="nb-button sm ghost" title="Open Form">
                        <ExternalLink size={14} />
                      </a>
                      <button 
                        onClick={() => transferForm(form.capId)} 
                        disabled={isTransferring === form.capId}
                        className="nb-button sm ghost" 
                        style={{ color: '#ff9800', borderColor: '#ff9800' }}
                        title="Transfer Ownership"
                      >
                        {isTransferring === form.capId ? <Loader size={14} className="anim-spin" /> : <Send size={14} />} Transfer
                      </button>
                      <button 
                        onClick={() => deleteForm(form.capId)} 
                        disabled={isDeleting === form.capId}
                        className="nb-button sm ghost" 
                        style={{ color: '#ff4444', borderColor: '#ff4444' }}
                        title="Delete Form"
                      >
                        {isDeleting === form.capId ? <Loader size={14} className="anim-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {!isLoadingForms && blockchainForms.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', border: '3px dashed #000', borderRadius: '10px' }}>
              <h3 style={{ fontSize: '22px', marginBottom: '10px' }}>No Forms Yet</h3>
              <p style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '20px' }}>Create your first decentralized form on SUI!</p>
              <Link to="/build" className="nb-button"><Plus size={18} /> Create Form</Link>
            </div>
          )}
        </div>
      </div>
      )}
      {view === 'submissions' && activeForm && (
        <div>
          <div className="nb-box" style={{ padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '24px' }}>{activeForm.title}</h2>
                <p style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '14px' }}>{activeForm.fields.length} fields · {activeForm.submissionsList.length} responses</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={exportCSV} className="nb-button sm secondary"><Download size={14} /> Export CSV</motion.button>
                <a href={`/f/${activeForm.id}`} target="_blank" rel="noreferrer" className="nb-button sm"><ExternalLink size={14} /> Open Form</a>
              </div>
            </div>
          </div>

          <div className="nb-tabs" style={{ marginBottom: '20px' }}>
            <button className={`nb-tab ${submissionsViewType === 'summary' ? 'active' : ''}`} onClick={() => setSubmissionsViewType('summary')}>
              <BarChart3 size={14} style={{ marginRight: '6px' }} /> Summary Charts
            </button>
            <button className={`nb-tab ${submissionsViewType === 'individual' ? 'active' : ''}`} onClick={() => setSubmissionsViewType('individual')}>
              <FileText size={14} style={{ marginRight: '6px' }} /> Individual Responses
            </button>
          </div>

          {submissionsViewType === 'summary' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {activeForm.fields.length === 0 ? null : activeForm.fields.map((field: any) => {
                if (['SHORT_TEXT', 'LONG_TEXT', 'MEDIA', 'EMAIL', 'URL'].includes(field.type)) return null;
                
                const dataMap: Record<string, number> = {};
                blockchainSubmissions.forEach(sub => {
                  const val = (decryptedPayloads[sub.blobId] || sub.data)[field.id];
                  if (val !== undefined && val !== null && val !== '') {
                    if (Array.isArray(val)) {
                      val.forEach(v => { dataMap[v] = (dataMap[v] || 0) + 1; });
                    } else {
                      dataMap[String(val)] = (dataMap[String(val)] || 0) + 1;
                    }
                  }
                });
                const chartData = Object.keys(dataMap).map(k => ({ name: k, count: dataMap[k] }));
                if (chartData.length === 0) return null;

                const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#FFB6C1', '#DDA0DD'];

                return (
                  <div key={field.id} className="nb-box anim-slide-up" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '18px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>{field.label || field.id}</h3>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        {field.type === 'STAR_RATING' || field.type === 'NUMBER' ? (
                          <BarChart data={chartData}>
                            <XAxis dataKey="name" stroke="#000" style={{ fontWeight: 600 }} />
                            <YAxis allowDecimals={false} stroke="#000" style={{ fontWeight: 600 }} />
                            <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: '3px solid #000', fontWeight: 600 }} />
                            <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        ) : (
                          <PieChart>
                            <Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent = 0 }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                              {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth={2} />)}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '3px solid #000', fontWeight: 600 }} />
                          </PieChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}
              {blockchainSubmissions.length === 0 && (
                <div className="nb-box" style={{ padding: '50px', textAlign: 'center', borderStyle: 'dashed' }}>
                  <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>No responses to summarize yet.</p>
                </div>
              )}
            </div>
          ) : (
            <>

          <div className="nb-box" style={{ padding: '16px', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', background: '#f9f9f9' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="nb-label">Status Filter</label>
              <select className="nb-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="nb-label">Priority Filter</label>
              <select className="nb-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isLoadingSubmissions ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <Loader className="anim-spin" size={48} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
                <h3>Loading Blobs from Walrus...</h3>
              </div>
            ) : (
              <AnimatePresence>
                {blockchainSubmissions.filter(sub => {
                  const meta = reviewData[sub.blobId] || { status: 'new', priority: 'none' };
                  if (statusFilter !== 'all' && meta.status !== statusFilter) return false;
                  if (priorityFilter !== 'all' && meta.priority !== priorityFilter) return false;
                  return true;
                }).map((sub) => {
                  const meta = reviewData[sub.blobId] || { status: 'new', priority: 'none' };
                  return (
                  <motion.div key={sub.blobId} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`nb-box status-${meta.status} priority-${meta.priority}`} style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                        <code style={{ fontSize: '11px', background: '#eee', padding: '2px 6px', borderRadius: '4px', color: '#333' }}>Blob: {sub.blobId}</code>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select className="nb-select" style={{ padding: '6px', fontSize: '12px', width: '130px', background: 'var(--white)', color: '#000' }}
                          value={meta.status}
                          onChange={(e) => updateReviewData(sub.blobId, { status: e.target.value })}>
                          <option value="new">Wait: New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="resolved">Resolved</option>
                          <option value="archived">Archived</option>
                        </select>
                        <select className="nb-select" style={{ padding: '6px', fontSize: '12px', width: '130px', background: 'var(--white)', color: '#000' }}
                          value={meta.priority}
                          onChange={(e) => updateReviewData(sub.blobId, { priority: e.target.value })}>
                          <option value="none">Priority: None</option>
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {activeForm.fields.map((field: any) => {
                        const value = (decryptedPayloads[sub.blobId] || sub.data)[field.id];
                        return (
                          <div key={field.id} style={{ display: 'flex', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.8)', borderRadius: '8px', border: '2px solid #e0e0e0' }}>
                            <span style={{ fontWeight: 700, fontSize: '13px', minWidth: '120px', color: 'var(--text-muted)' }}>{field.label || field.id}:</span>
                            <span style={{ fontWeight: 600, fontSize: '14px', wordBreak: 'break-word', color: '#101010' }}>
                              {value === undefined || value === null || value === '' ? <em style={{ color: '#aaa' }}>—</em> :
                                field.type === 'STAR_RATING' ? '★'.repeat(value) + '☆'.repeat(5 - value) :
                                  field.type === 'CHECKBOX' ? (Array.isArray(value) ? value.join(', ') : String(value)) :
                                    field.type === 'CONFIRMATION' ? (value ? 'Confirmed' : 'Not confirmed') :
                                      field.type === 'MEDIA' ? (value?.name || 'File uploaded') :
                                        String(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )})}
                {blockchainSubmissions.length === 0 && (
                  <div className="nb-box" style={{ padding: '50px', textAlign: 'center', borderStyle: 'dashed' }}>
                    <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>No responses found on Walrus.</p>
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>
          </>
          )}
        </div>
      )}

      <KimoChatbox forms={blockchainForms} />
    </div>
  );
};
