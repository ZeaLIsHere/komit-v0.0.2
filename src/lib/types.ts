export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  whatsapp?: string;
  github_username?: string;
  role: UserRole;
  password?: string;
  created_at: string;
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

export interface Project {
  id: string;
  created_at: string;
  buyer_name: string;
  buyer_whatsapp: string;
  buyer_email?: string | null;
  customer_id?: string | null;
  service_type: ServiceType;
  package_type: PackageType;
  member_count: number;
  total_price: number;
  payment_proof_url?: string | null;
  payment_status: PaymentStatus;
  niche_input?: string | null;
  generated_ideas?: IdeaItem[] | null;
  selected_idea?: IdeaItem | null;
  github_repo_url?: string | null;
  readme_content?: string | null;
  ppt_addon_paid: boolean;
  ppt_proof_url?: string | null;
  ppt_file_url?: string | null;
  status: ProjectStatus;
}

export interface ProjectMember {
  id: string;
  created_at: string;
  project_id: string;
  name: string;
  nim: string;
  kom: string;
  github_username?: string | null;
  github_email?: string | null;
  github_access_token?: string | null; // Server-only
  is_connected: boolean;
}

export interface CommitSchedule {
  id: string;
  created_at: string;
  project_id: string;
  member_id: string;
  member_name?: string;
  github_username?: string;
  commit_message: string;
  scheduled_at: string;
  status: CommitStatus;
  commit_hash?: string | null;
}
