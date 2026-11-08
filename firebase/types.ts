/**
 * Firebase Firestore Types & Data Models
 * Komit-V2 Platform
 */

export type FirestoreDate = string | { seconds: number; nanoseconds: number };

export type UserRole = 'customer' | 'admin';

export interface FirestoreUser {
  id: string; // matches Firebase Auth UID
  email: string;
  name: string;
  role: UserRole;
  whatsapp?: string;
  github_username?: string;
  photo_url?: string;
  created_at: FirestoreDate;
  updated_at: FirestoreDate;
}

export type ServiceType = 'project_joki' | 'makalah' | 'ppt' | 'tugas_ringan';
export type PackageType = 'full' | 'code_only' | 'idea_only';
export type PaymentStatus = 'pending' | 'paid' | 'rejected';
export type ProjectStatus = 'waiting_payment' | 'setup' | 'in_progress' | 'completed';
export type CommitStatus = 'scheduled' | 'pushed' | 'failed';

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  gimmick: string; // Gimmick Pemikat Dosen
  techStack: string[];
}

export interface FirestoreProject {
  id: string; // Document ID / UUID
  customer_id?: string | null; // FK -> users.id
  buyer_name: string;
  buyer_email?: string | null;
  buyer_whatsapp: string;
  service_type: ServiceType;
  package_type: PackageType;
  member_count: number;
  total_price: number;
  payment_proof_url?: string | null;
  payment_status: PaymentStatus;
  payment_verified_at?: FirestoreDate | null;
  payment_verified_by?: string | null; // FK -> users.id (admin)
  niche_input?: string | null;
  generated_ideas?: IdeaItem[] | null;
  selected_idea?: IdeaItem | null;
  github_repo_url?: string | null;
  github_email?: string | null;
  github_password?: string | null;
  readme_content?: string | null;
  ppt_addon_paid: boolean;
  ppt_proof_url?: string | null;
  ppt_file_url?: string | null;
  status: ProjectStatus;
  created_at: FirestoreDate;
  updated_at: FirestoreDate;
}

export interface FirestoreProjectMember {
  id: string; // Document ID / UUID
  project_id: string; // FK -> projects.id
  name: string;
  nim: string;
  kom: string;
  github_username?: string | null;
  github_email?: string | null;
  is_connected: boolean;
  connected_at?: FirestoreDate | null;
  created_at: FirestoreDate;
  updated_at: FirestoreDate;
}

/**
 * Server-only sensitive credentials collection: member_secrets/{memberId}
 * NEVER exposed to client. Access via Firebase Admin SDK only.
 */
export interface FirestoreMemberSecret {
  id: string; // same as memberId
  project_id: string; // FK -> projects.id
  github_access_token: string; // OAuth Access Token (scope: repo, workflow)
  token_type?: string;
  scope?: string;
  updated_at: FirestoreDate;
}

export interface FirestoreCommitSchedule {
  id: string; // Document ID / UUID
  project_id: string; // FK -> projects.id
  member_id: string; // FK -> project_members.id
  member_name?: string; // Denormalized for rapid dashboard rendering
  github_username?: string; // Denormalized for rapid dashboard rendering
  commit_message: string;
  scheduled_at: FirestoreDate;
  status: CommitStatus;
  commit_hash?: string | null;
  error_message?: string | null;
  pushed_at?: FirestoreDate | null;
  created_at: FirestoreDate;
}
