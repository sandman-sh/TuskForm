import { useNavigate } from 'react-router-dom';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BugReportIcon, FeatureRequestIcon, FeedbackIcon,
  SurveyIcon, ApplicationIcon, CustomFormIcon,
  WalrusIcon, SealLockIcon, SuiChainIcon, DashboardIcon,
} from '../components/Icons';

const spring = { type: 'spring' as const, stiffness: 300, damping: 20 };
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
});

const useCases = [
  { Icon: BugReportIcon, title: 'Bug Reports', desc: 'Capture screenshots, videos, and reproduce steps.', bg: '#fff0f0' },
  { Icon: FeatureRequestIcon, title: 'Feature Requests', desc: 'Let users describe and vote on what they need.', bg: '#fffbe6' },
  { Icon: FeedbackIcon, title: 'Product Feedback', desc: 'Star ratings, dropdowns, and rich text responses.', bg: '#fff9e6' },
  { Icon: SurveyIcon, title: 'Surveys', desc: 'Multi-field surveys with required/optional toggles.', bg: '#e8fdf5' },
  { Icon: ApplicationIcon, title: 'Applications', desc: 'Job apps, grant proposals, onboarding flows.', bg: '#f0e6ff' },
  { Icon: CustomFormIcon, title: 'Custom Forms', desc: 'Build anything with 8 flexible field types.', bg: '#f0e6ff' },
];

const features = [
  { Icon: WalrusIcon, title: 'Walrus Storage', desc: 'Immutable blob storage on SUI Mainnet. Your submissions live permanently on-chain with full verifiability.' },
  { Icon: SealLockIcon, title: 'Seal Encryption', desc: 'Optional client-side encryption. Only you and approved admins can decrypt sensitive submissions.' },
  { Icon: SuiChainIcon, title: 'SUI Native', desc: 'Wallet-based identity on Mainnet. No passwords, no emails — your keys are your credential.' },
  { Icon: DashboardIcon, title: 'Admin Dashboard', desc: 'Filter, prioritize, annotate, tag, and export — all in one powerful command center.' },
];

export const LandingPage = () => {
  const account = useCurrentAccount();
  const navigate = useNavigate();

  const marqueeText = '  ✦ DECENTRALIZED  ✦ ENCRYPTED  ✦ IMMUTABLE  ✦ SUI MAINNET  ✦ WALRUS STORAGE  ✦ SEAL ENCRYPTION  ✦ OPEN SOURCE  ✦ TUSKFORM  ';

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* ─── Navbar ─── */}
      <motion.nav initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 40px', maxWidth: '1300px', margin: '0 auto',
        }}>
        <motion.h2 whileHover={{ scale: 1.05, rotate: -1 }} transition={spring}
          style={{ fontSize: '28px', color: 'var(--primary)', textShadow: '2px 2px 0px #000', cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          TUSKFORM
        </motion.h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {account && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')} className="nb-button ghost sm">
              Dashboard
            </motion.button>
          )}
          <div className="wallet-btn-wrap">
            <ConnectButton />
          </div>
        </div>
      </motion.nav>

      {/* ─── Marquee Banner ─── */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {marqueeText.repeat(4)}
        </div>
      </div>

      {/* ─── Hero ─── */}
      <section style={{ textAlign: 'center', padding: '80px 20px 60px', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
        {/* Floating decorative elements */}
        <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '20px', left: '10%', width: '60px', height: '60px', background: 'var(--accent)', border: '3px solid #000', borderRadius: '50%', boxShadow: '3px 3px 0px #000', opacity: 0.6 }} />
        <motion.div animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ position: 'absolute', top: '60px', right: '8%', width: '45px', height: '45px', background: 'var(--secondary)', border: '3px solid #000', borderRadius: '10px', boxShadow: '3px 3px 0px #000', opacity: 0.5 }} />
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          style={{ position: 'absolute', bottom: '40px', left: '5%', width: '35px', height: '35px', background: 'var(--primary-light)', border: '3px solid #000', borderRadius: '8px', boxShadow: '3px 3px 0px #000', opacity: 0.4, transform: 'rotate(15deg)' }} />

        <motion.div {...fadeUp(0)}>
          <motion.div whileHover={{ scale: 1.05, rotate: -1 }} transition={spring}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', padding: '10px 24px',
              border: '3px solid #000', borderRadius: '50px', fontWeight: 'bold',
              boxShadow: '4px 4px 0px #000', marginBottom: '28px', fontSize: '14px', color: '#fff',
            }}>
            <Sparkles size={16} /> SUI Mainnet · Walrus Storage · Seal Encryption
          </motion.div>
        </motion.div>

        <motion.h1 {...fadeUp(0.1)} style={{
          fontSize: 'clamp(44px, 8vw, 84px)', lineHeight: 1.05,
          marginBottom: '28px', textShadow: '5px 5px 0px #000',
        }}>
          THE DECENTRALIZED<br />
          <motion.span
            animate={{ color: ['#00f5d4', '#00bbf9', '#00f5d4'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ WebkitTextStroke: '2px #000', display: 'inline-block' }}>
            FEEDBACK ENGINE
          </motion.span>
        </motion.h1>

        <motion.p {...fadeUp(0.2)} style={{
          fontSize: '20px', fontWeight: 600, maxWidth: '700px',
          margin: '0 auto 44px', color: 'var(--text-muted)', lineHeight: 1.7,
        }}>
          Build custom forms for bug reports, feature requests, surveys & more.
          Encrypt sensitive data with Seal. Store everything permanently on Walrus.
          <strong style={{ color: 'var(--text-main)' }}> Your data, your keys, your control.</strong>
        </motion.p>

        <motion.div {...fadeUp(0.3)} style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {account ? (
            <>
              <motion.button whileHover={{ scale: 1.06, rotate: -1 }} whileTap={{ scale: 0.96 }} transition={spring}
                onClick={() => navigate('/dashboard')} className="nb-button lg secondary">
                Go to Dashboard <ArrowRight size={22} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.06, rotate: 1 }} whileTap={{ scale: 0.96 }} transition={spring}
                onClick={() => navigate('/build')} className="nb-button lg">
                Create a Form <FileText size={22} />
              </motion.button>
            </>
          ) : (
            <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <div className="wallet-btn-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <ConnectButton />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  ↑ Connect your SUI wallet to get started
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ─── Use Cases Grid ─── */}
      <section style={{ padding: '40px 40px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.h2 {...fadeUp(0.1)} style={{ textAlign: 'center', fontSize: '36px', marginBottom: '48px' }}>
          Built For Every Use Case
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {useCases.map((uc, i) => (
            <motion.div key={uc.title} {...fadeUp(0.15 + i * 0.08)}
              className="nb-box card-hover"
              style={{ padding: '28px', cursor: 'default', background: uc.bg }}
              whileHover={{ y: -6, rotate: i % 2 === 0 ? -0.8 : 0.8 }} transition={spring}>
              <motion.div whileHover={{ scale: 1.15, rotate: 5 }} transition={spring}
                style={{ marginBottom: '16px', display: 'inline-block' }}>
                <uc.Icon size={56} />
              </motion.div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{uc.title}</h3>
              <p style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>{uc.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Features Strip ─── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
        borderTop: '3px solid #000', borderBottom: '3px solid #000',
        padding: '60px 40px', color: '#fff',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '36px' }}>
          {features.map((f, i) => (
            <motion.div key={f.title} {...fadeUp(0.1 + i * 0.1)}
              whileHover={{ y: -4 }} transition={spring}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={spring}
                style={{
                  width: '76px', height: '76px',
                  background: 'rgba(255,255,255,0.12)',
                  border: '3px solid rgba(255,255,255,0.3)', borderRadius: '18px',
                  boxShadow: '3px 3px 0px rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <f.Icon size={48} />
              </motion.div>
              <h3 style={{ fontSize: '22px' }}>{f.title}</h3>
              <p style={{ fontWeight: 600, opacity: 0.85, fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Bottom Marquee ─── */}
      <div className="marquee-wrap" style={{ background: 'var(--secondary)' }}>
        <div className="marquee-track">
          {('  ✦ TUSKFORM  ✦ WALRUS  ✦ SEAL  ✦ SUI MAINNET  ✦ BUILD  ✦ COLLECT  ✦ ANALYZE  ✦ EXPORT  ').repeat(4)}
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer style={{
        textAlign: 'center', padding: '36px 20px',
        fontWeight: 700, fontSize: '14px', color: 'var(--text-muted)',
      }}>
        <motion.p whileHover={{ scale: 1.02 }} transition={spring}>
          TuskForm © {new Date().getFullYear()} — Built on SUI Mainnet & Walrus
        </motion.p>
      </footer>
    </div>
  );
};
