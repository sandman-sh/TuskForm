import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// ─── Field Types ───────────────────────────────────────────
export type FieldType =
  | 'TEXT'
  | 'PARAGRAPH'
  | 'DROPDOWN'
  | 'CHECKBOX'
  | 'STAR_RATING'
  | 'URL'
  | 'MEDIA'
  | 'CONFIRMATION';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // For dropdowns / checkboxes
  confirmationText?: string; // For confirmation checkbox
}

// ─── Theme System ──────────────────────────────────────────
export type ThemePreset =
  | 'clean'
  | 'midnight'
  | 'ocean'
  | 'sunset'
  | 'aurora'
  | 'neon'
  | 'forest'
  | 'lavender'
  | 'custom';

export interface TextStyle {
  fontSize?: number;
  color?: string;
  italic?: boolean;
  bold?: boolean;
}

export interface FormTheme {
  preset: ThemePreset;
  bgColor?: string;
  accentColor?: string;
  textColor?: string;
  cardBg?: string;
  bgImage?: string;
  titleAlign?: 'left' | 'center' | 'right';
  descAlign?: 'left' | 'center' | 'right';
  titleStyle?: TextStyle;
  descStyle?: TextStyle;
}

// ─── Form Definition ───────────────────────────────────────
export interface FormDefinition {
  id: string;
  title: string;
  description: string;
  category: 'bug_report' | 'feature_request' | 'product_feedback' | 'survey' | 'application' | 'other';
  fields: FormField[];
  isEncrypted: boolean;
  createdAt: number;
  adminAddress: string;
  approvedAdmins: string[];
  theme: FormTheme;
}

// ─── Submission ────────────────────────────────────────────
export type SubmissionStatus = 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'archived';
export type SubmissionPriority = 'critical' | 'high' | 'medium' | 'low' | 'none';

export interface InternalNote {
  id: string;
  text: string;
  author: string; // wallet address
  createdAt: number;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: number;
  blobId?: string;
  status: SubmissionStatus;
  priority: SubmissionPriority;
  notes: InternalNote[];
  tags: string[];
}

// ─── Store Shape ───────────────────────────────────────────
interface AppState {
  forms: FormDefinition[];
  submissions: FormSubmission[];

  // Form CRUD
  addForm: (form: Omit<FormDefinition, 'id' | 'createdAt'>) => string;
  updateForm: (id: string, form: Partial<FormDefinition>) => void;
  deleteForm: (id: string) => void;

  // Submission CRUD
  addSubmission: (submission: Omit<FormSubmission, 'id' | 'submittedAt' | 'status' | 'priority' | 'notes' | 'tags'>) => void;
  updateSubmissionStatus: (id: string, status: SubmissionStatus) => void;
  updateSubmissionPriority: (id: string, priority: SubmissionPriority) => void;
  addNote: (submissionId: string, text: string, author: string) => void;
  deleteNote: (submissionId: string, noteId: string) => void;
  addTag: (submissionId: string, tag: string) => void;
  removeTag: (submissionId: string, tag: string) => void;
}

export const useStore = create<AppState>((set) => ({
  forms: [],
  submissions: [],

  // ── Form CRUD ──────────────────────────────
  addForm: (form) => {
    const id = uuidv4();
    set((state) => ({
      forms: [...state.forms, { ...form, id, createdAt: Date.now() }],
    }));
    return id;
  },
  updateForm: (id, formUpdate) => {
    set((state) => ({
      forms: state.forms.map((f) =>
        f.id === id ? { ...f, ...formUpdate } : f
      ),
    }));
  },
  deleteForm: (id) => {
    set((state) => ({
      forms: state.forms.filter((f) => f.id !== id),
      submissions: state.submissions.filter((s) => s.formId !== id),
    }));
  },

  // ── Submission CRUD ────────────────────────
  addSubmission: (submission) => {
    set((state) => ({
      submissions: [
        ...state.submissions,
        {
          ...submission,
          id: uuidv4(),
          submittedAt: Date.now(),
          status: 'new',
          priority: 'none',
          notes: [],
          tags: [],
        },
      ],
    }));
  },
  updateSubmissionStatus: (id, status) => {
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === id ? { ...s, status } : s
      ),
    }));
  },
  updateSubmissionPriority: (id, priority) => {
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === id ? { ...s, priority } : s
      ),
    }));
  },
  addNote: (submissionId, text, author) => {
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              notes: [
                ...s.notes,
                { id: uuidv4(), text, author, createdAt: Date.now() },
              ],
            }
          : s
      ),
    }));
  },
  deleteNote: (submissionId, noteId) => {
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === submissionId
          ? { ...s, notes: s.notes.filter((n) => n.id !== noteId) }
          : s
      ),
    }));
  },
  addTag: (submissionId, tag) => {
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === submissionId && !s.tags.includes(tag)
          ? { ...s, tags: [...s.tags, tag] }
          : s
      ),
    }));
  },
  removeTag: (submissionId, tag) => {
    set((state) => ({
      submissions: state.submissions.map((s) =>
        s.id === submissionId
          ? { ...s, tags: s.tags.filter((t) => t !== tag) }
          : s
      ),
    }));
  },
}));
