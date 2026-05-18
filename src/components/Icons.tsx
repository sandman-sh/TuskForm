// ─── Premium Neubrutalist Icon Components ──────────────────
// Custom SVG illustrations for TuskForm landing page.
// Each icon is a unique, hand-crafted mini-illustration.
// ────────────────────────────────────────────────────────────

interface IconProps {
  size?: number;
}

export const BugReportIcon = ({ size = 56 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Bug body */}
    <ellipse cx="32" cy="38" rx="16" ry="18" fill="#ef233c" stroke="#000" strokeWidth="3"/>
    {/* Shell line */}
    <line x1="32" y1="20" x2="32" y2="56" stroke="#000" strokeWidth="2.5"/>
    <line x1="18" y1="35" x2="46" y2="35" stroke="#000" strokeWidth="2"/>
    <line x1="18" y1="44" x2="46" y2="44" stroke="#000" strokeWidth="2"/>
    {/* Head */}
    <circle cx="32" cy="19" r="8" fill="#1a1a1a" stroke="#000" strokeWidth="3"/>
    {/* Eyes */}
    <circle cx="29" cy="17" r="2" fill="#fee440"/>
    <circle cx="35" cy="17" r="2" fill="#fee440"/>
    {/* Antennae */}
    <path d="M26 12 L20 4" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M38 12 L44 4" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="20" cy="4" r="3" fill="#fee440" stroke="#000" strokeWidth="2"/>
    <circle cx="44" cy="4" r="3" fill="#fee440" stroke="#000" strokeWidth="2"/>
    {/* Legs */}
    <path d="M18 30 L8 24" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M46 30 L56 24" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M17 40 L6 40" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M47 40 L58 40" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M18 50 L10 56" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M46 50 L54 56" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export const FeatureRequestIcon = ({ size = 56 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Lightbulb glass */}
    <path d="M22 28C22 18 26 10 32 10C38 10 42 18 42 28C42 34 38 36 38 40H26C26 36 22 34 22 28Z"
      fill="#fee440" stroke="#000" strokeWidth="3"/>
    {/* Filament */}
    <path d="M28 26C28 22 32 20 32 24C32 20 36 22 36 26" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
    {/* Base */}
    <rect x="26" y="40" width="12" height="4" rx="1" fill="#c77dff" stroke="#000" strokeWidth="2.5"/>
    <rect x="27" y="44" width="10" height="3" rx="1" fill="#9d4edd" stroke="#000" strokeWidth="2.5"/>
    <rect x="28" y="47" width="8" height="3" rx="1.5" fill="#7b2cbf" stroke="#000" strokeWidth="2.5"/>
    {/* Rays */}
    <line x1="32" y1="2" x2="32" y2="6" stroke="#fee440" strokeWidth="3" strokeLinecap="round"/>
    <line x1="12" y1="14" x2="15" y2="17" stroke="#fee440" strokeWidth="3" strokeLinecap="round"/>
    <line x1="52" y1="14" x2="49" y2="17" stroke="#fee440" strokeWidth="3" strokeLinecap="round"/>
    <line x1="6" y1="30" x2="10" y2="30" stroke="#fee440" strokeWidth="3" strokeLinecap="round"/>
    <line x1="58" y1="30" x2="54" y2="30" stroke="#fee440" strokeWidth="3" strokeLinecap="round"/>
    {/* Plus spark */}
    <rect x="48" y="4" width="10" height="3" rx="1.5" fill="#00f5d4" stroke="#000" strokeWidth="1.5"/>
    <rect x="51.5" y="0.5" width="3" height="10" rx="1.5" fill="#00f5d4" stroke="#000" strokeWidth="1.5"/>
  </svg>
);

export const FeedbackIcon = ({ size = 56 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Star */}
    <path d="M32 4L38.5 22H58L42 34L48 52L32 42L16 52L22 34L6 22H25.5L32 4Z"
      fill="#fee440" stroke="#000" strokeWidth="3" strokeLinejoin="round"/>
    {/* Inner star shadow */}
    <path d="M32 14L36 24H46L38 30L41 40L32 34L23 40L26 30L18 24H28L32 14Z"
      fill="#fbbf24" stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
    {/* Sparkles */}
    <circle cx="8" cy="8" r="3" fill="#c77dff" stroke="#000" strokeWidth="2"/>
    <circle cx="56" cy="12" r="2.5" fill="#00f5d4" stroke="#000" strokeWidth="2"/>
    <circle cx="52" cy="56" r="2" fill="#c77dff" stroke="#000" strokeWidth="1.5"/>
  </svg>
);

export const SurveyIcon = ({ size = 56 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Clipboard body */}
    <rect x="12" y="10" width="40" height="50" rx="4" fill="#fff" stroke="#000" strokeWidth="3"/>
    {/* Clipboard clip */}
    <rect x="22" y="4" width="20" height="12" rx="3" fill="#c77dff" stroke="#000" strokeWidth="3"/>
    <circle cx="32" cy="10" r="3" fill="#fff" stroke="#000" strokeWidth="2"/>
    {/* Checkbox rows */}
    <rect x="18" y="22" width="8" height="8" rx="2" fill="#00f5d4" stroke="#000" strokeWidth="2.5"/>
    <path d="M20 26L22.5 28.5L26 23" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="30" y="24" width="16" height="3" rx="1.5" fill="#e0e0e0"/>
    <rect x="18" y="34" width="8" height="8" rx="2" fill="#00f5d4" stroke="#000" strokeWidth="2.5"/>
    <path d="M20 38L22.5 40.5L26 35" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="30" y="36" width="12" height="3" rx="1.5" fill="#e0e0e0"/>
    <rect x="18" y="46" width="8" height="8" rx="2" fill="#fee440" stroke="#000" strokeWidth="2.5"/>
    <rect x="30" y="48" width="18" height="3" rx="1.5" fill="#e0e0e0"/>
  </svg>
);

export const ApplicationIcon = ({ size = 56 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Document back */}
    <rect x="16" y="6" width="36" height="48" rx="3" fill="#e0e0e0" stroke="#000" strokeWidth="2.5" transform="rotate(3 34 30)"/>
    {/* Document front */}
    <rect x="12" y="8" width="36" height="48" rx="3" fill="#fff" stroke="#000" strokeWidth="3"/>
    {/* Avatar circle */}
    <circle cx="30" cy="22" r="8" fill="#c77dff" stroke="#000" strokeWidth="2.5"/>
    <circle cx="30" cy="20" r="3" fill="#fff"/>
    <path d="M24 28C24 25 27 24 30 24C33 24 36 25 36 28" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    {/* Text lines */}
    <rect x="18" y="36" width="24" height="3" rx="1.5" fill="#000" opacity="0.15"/>
    <rect x="18" y="42" width="18" height="3" rx="1.5" fill="#000" opacity="0.15"/>
    <rect x="18" y="48" width="20" height="3" rx="1.5" fill="#000" opacity="0.15"/>
    {/* Stamp */}
    <circle cx="46" cy="48" r="9" fill="#00f5d4" stroke="#000" strokeWidth="2.5"/>
    <path d="M42 48L45 51L51 45" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CustomFormIcon = ({ size = 56 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Gear */}
    <path d="M32 12L35 8H29L32 12ZM32 52L29 56H35L32 52ZM12 32L8 29V35L12 32ZM52 32L56 35V29L52 32Z
             M18 18L14 16L12 20L18 18ZM46 46L50 48L52 44L46 46ZM46 18L52 20L50 16L46 18ZM18 46L12 44L14 48L18 46Z"
      fill="#c77dff" stroke="#000" strokeWidth="1.5"/>
    <circle cx="32" cy="32" r="14" fill="#9d4edd" stroke="#000" strokeWidth="3"/>
    <circle cx="32" cy="32" r="8" fill="#c77dff" stroke="#000" strokeWidth="2.5"/>
    {/* Wrench cross */}
    <rect x="29" y="26" width="6" height="12" rx="1" fill="#fff" stroke="#000" strokeWidth="1.5"/>
    <rect x="26" y="29" width="12" height="6" rx="1" fill="#fff" stroke="#000" strokeWidth="1.5"/>
    {/* Sparks */}
    <circle cx="10" cy="10" r="3" fill="#fee440" stroke="#000" strokeWidth="2"/>
    <circle cx="54" cy="10" r="2.5" fill="#00f5d4" stroke="#000" strokeWidth="2"/>
    <circle cx="10" cy="54" r="2" fill="#fee440" stroke="#000" strokeWidth="1.5"/>
  </svg>
);

// ─── Feature Section Icons ─────────────────────────────────

export const WalrusIcon = ({ size = 48 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <ellipse cx="28" cy="34" rx="20" ry="16" fill="#00f5d4" stroke="#000" strokeWidth="3"/>
    {/* Head */}
    <circle cx="28" cy="18" r="14" fill="#c77dff" stroke="#000" strokeWidth="3"/>
    {/* Eyes */}
    <circle cx="22" cy="16" r="3" fill="#fff" stroke="#000" strokeWidth="2"/>
    <circle cx="34" cy="16" r="3" fill="#fff" stroke="#000" strokeWidth="2"/>
    <circle cx="23" cy="15.5" r="1.5" fill="#000"/>
    <circle cx="35" cy="15.5" r="1.5" fill="#000"/>
    {/* Tusks */}
    <path d="M22 24L19 36" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M22 24L19 36" stroke="#000" strokeWidth="4.5" strokeLinecap="round" opacity="0.15"/>
    <path d="M34 24L37 36" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M34 24L37 36" stroke="#000" strokeWidth="4.5" strokeLinecap="round" opacity="0.15"/>
    {/* Nose dots */}
    <circle cx="26" cy="22" r="1.5" fill="#9d4edd"/>
    <circle cx="30" cy="22" r="1.5" fill="#9d4edd"/>
  </svg>
);

export const SealLockIcon = ({ size = 48 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Shield */}
    <path d="M28 4L6 14V28C6 42 16 50 28 54C40 50 50 42 50 28V14L28 4Z"
      fill="#9d4edd" stroke="#000" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M28 10L12 18V28C12 38 20 44 28 48C36 44 44 38 44 28V18L28 10Z"
      fill="#c77dff" stroke="#000" strokeWidth="2"/>
    {/* Lock body */}
    <rect x="20" y="26" width="16" height="14" rx="3" fill="#fee440" stroke="#000" strokeWidth="2.5"/>
    {/* Lock shackle */}
    <path d="M23 26V22C23 18 25 16 28 16C31 16 33 18 33 22V26" stroke="#000" strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* Keyhole */}
    <circle cx="28" cy="32" r="2.5" fill="#000"/>
    <rect x="27" y="33" width="2" height="4" rx="1" fill="#000"/>
  </svg>
);

export const SuiChainIcon = ({ size = 48 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Hexagon */}
    <path d="M28 4L50 16V40L28 52L6 40V16L28 4Z"
      fill="#00bbf9" stroke="#000" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M28 10L44 20V36L28 46L12 36V20L28 10Z"
      fill="#00f5d4" stroke="#000" strokeWidth="2" strokeLinejoin="round"/>
    {/* SUI "S" shape */}
    <path d="M22 22C22 19 25 17 28 17C31 17 34 19 34 22C34 25 28 26 28 28C28 30 28 31 28 31"
      stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
    <circle cx="28" cy="37" r="2.5" fill="#fff"/>
    {/* Spark */}
    <circle cx="48" cy="6" r="3" fill="#fee440" stroke="#000" strokeWidth="2"/>
  </svg>
);

export const DashboardIcon = ({ size = 48 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Monitor */}
    <rect x="4" y="4" width="48" height="36" rx="4" fill="#1a1a1a" stroke="#000" strokeWidth="3"/>
    <rect x="8" y="8" width="40" height="28" rx="2" fill="#2a2a3a"/>
    {/* Bars chart */}
    <rect x="12" y="24" width="6" height="10" rx="1" fill="#ef233c"/>
    <rect x="20" y="18" width="6" height="16" rx="1" fill="#fee440"/>
    <rect x="28" y="14" width="6" height="20" rx="1" fill="#00f5d4"/>
    <rect x="36" y="20" width="6" height="14" rx="1" fill="#c77dff"/>
    {/* Stand */}
    <rect x="22" y="40" width="12" height="4" rx="1" fill="#555" stroke="#000" strokeWidth="2"/>
    <rect x="18" y="44" width="20" height="4" rx="2" fill="#777" stroke="#000" strokeWidth="2"/>
    {/* Notification dot */}
    <circle cx="46" cy="10" r="4" fill="#ef233c" stroke="#000" strokeWidth="2"/>
  </svg>
);
