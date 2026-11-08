import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import {
  isFirebaseConfigured,
  fsGetProjectById,
  fsGetAllProjects,
  fsSaveProject,
  fsUpdateProject,
  fsGetUserProjects,
  fsGetProjectMembers,
  fsSaveProjectMember,
  fsUpdateProjectMember,
  fsGetCommitSchedules,
  fsSaveCommitSchedule,
  fsFindUserByEmail,
  fsFindUserByGitHubUsername,
  fsFindUserById,
  fsSaveUser,
} from './firestore';
import { Project, ProjectMember, CommitSchedule, User } from './types';

// ponytail: in-memory mock store when Supabase env variables not configured -> Supabase PostgreSQL
const mockUsers: Map<string, User> = new Map();

const mockProjects: Map<string, Project> = new Map([
  [
    'demo-proyek-uas',
    {
      id: 'demo-proyek-uas',
      created_at: new Date().toISOString(),
      customer_id: null,
      buyer_email: null,
      buyer_name: 'Budi Santoso',
      buyer_whatsapp: '081234567890',
      service_type: 'project_joki',
      package_type: 'full',
      member_count: 4,
      total_price: 200000,
      payment_proof_url: '/dummy-qris.png',
      payment_status: 'paid',
      niche_input: 'Aplikasi Rekomendasi Tempat Magang Berdasarkan Portofolio GitHub',
      selected_idea: {
        id: 'idea-1',
        title: 'InternSync — AI Resume & Repo Matcher',
        description: 'Web dashboard untuk memetakan skill dari commit GitHub mahasiswa ke lowongan magang.',
        gimmick: 'Live skill radar chart dari commit history + prediksi kecocokan kultur tim magang via AI.',
        techStack: ['Next.js 15', 'Tailwind CSS', 'FastAPI', 'PostgreSQL'],
      },
      github_repo_url: 'https://github.com/kelompok-uas/intern-sync',
      readme_content: '# InternSync\n\nPlatform pencari magang berbasis portofolio GitHub otomatis.',
      ppt_addon_paid: false,
      status: 'in_progress',
    },
  ],
]);

const mockMembers: Map<string, ProjectMember[]> = new Map([
  [
    'demo-proyek-uas',
    [
      {
        id: 'mem-1',
        created_at: new Date().toISOString(),
        project_id: 'demo-proyek-uas',
        name: 'Budi Santoso',
        nim: '211401001',
        kom: 'A',
        github_username: 'budisantoso',
        github_email: 'budi@student.ac.id',
        is_connected: true,
      },
      {
        id: 'mem-2',
        created_at: new Date().toISOString(),
        project_id: 'demo-proyek-uas',
        name: 'Siti Rahma',
        nim: '211401002',
        kom: 'A',
        github_username: 'sitirahma',
        github_email: 'siti@student.ac.id',
        is_connected: true,
      },
      {
        id: 'mem-3',
        created_at: new Date().toISOString(),
        project_id: 'demo-proyek-uas',
        name: 'Dimas Aditya',
        nim: '211401003',
        kom: 'A',
        github_username: 'dimasaditya',
        github_email: 'dimas@student.ac.id',
        is_connected: true,
      },
      {
        id: 'mem-4',
        created_at: new Date().toISOString(),
        project_id: 'demo-proyek-uas',
        name: 'Fani Lestari',
        nim: '211401004',
        kom: 'A',
        github_username: 'fanilestari',
        github_email: 'fani@student.ac.id',
        is_connected: false,
      },
    ],
  ],
]);

const mockSchedules: Map<string, CommitSchedule[]> = new Map([
  [
    'demo-proyek-uas',
    [
      {
        id: 'sched-1',
        created_at: new Date().toISOString(),
        project_id: 'demo-proyek-uas',
        member_id: 'mem-1',
        member_name: 'Budi Santoso',
        github_username: 'budisantoso',
        commit_message: 'feat: setup initial next.js project and tailwind layout',
        scheduled_at: '2025-03-01T10:00:00Z',
        status: 'pushed',
        commit_hash: '7fa890c',
      },
      {
        id: 'sched-2',
        created_at: new Date().toISOString(),
        project_id: 'demo-proyek-uas',
        member_id: 'mem-2',
        member_name: 'Siti Rahma',
        github_username: 'sitirahma',
        commit_message: 'feat: add user authentication and role-based middleware',
        scheduled_at: '2025-03-08T14:30:00Z',
        status: 'pushed',
        commit_hash: '3bc12de',
      },
      {
        id: 'sched-3',
        created_at: new Date().toISOString(),
        project_id: 'demo-proyek-uas',
        member_id: 'mem-3',
        member_name: 'Dimas Aditya',
        github_username: 'dimasaditya',
        commit_message: 'feat: build resume parser and github skill radar chart',
        scheduled_at: '2025-03-15T09:15:00Z',
        status: 'scheduled',
      },
      {
        id: 'sched-4',
        created_at: new Date().toISOString(),
        project_id: 'demo-proyek-uas',
        member_id: 'mem-4',
        member_name: 'Fani Lestari',
        github_username: 'fanilestari',
        commit_message: 'docs: finalize api documentation and demo seeders for uas',
        scheduled_at: '2025-03-22T16:00:00Z',
        status: 'scheduled',
      },
    ],
  ],
]);

export async function getProject(id: string): Promise<Project | null> {
  // 1. Coba Firestore jika Firebase terkonfigurasi
  if (isFirebaseConfigured) {
    const fsProject = await fsGetProjectById(id);
    if (fsProject) return fsProject;
  }

  // 2. Coba Supabase jika terkonfigurasi
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data as Project;
  }

  // 3. Fallback mock store
  return mockProjects.get(id) || null;
}

export async function getAllProjects(): Promise<Project[]> {
  // 1. Coba Firestore jika Firebase terkonfigurasi
  if (isFirebaseConfigured) {
    const fsProjects = await fsGetAllProjects();
    if (fsProjects.length > 0) return fsProjects;
  }

  // 2. Coba Supabase jika terkonfigurasi
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as Project[];
  }

  // 3. Fallback mock store
  return Array.from(mockProjects.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function createProject(payload: Partial<Project>): Promise<Project> {
  const newId = payload.id || crypto.randomUUID();
  const project: Project = {
    id: newId,
    created_at: new Date().toISOString(),
    buyer_name: payload.buyer_name || '',
    buyer_whatsapp: payload.buyer_whatsapp || '',
    buyer_email: payload.buyer_email || null,
    customer_id: payload.customer_id || null,
    service_type: payload.service_type || 'project_joki',
    package_type: payload.package_type || 'full',
    member_count: payload.member_count || 1,
    total_price: payload.total_price || (payload.member_count || 1) * 50000,
    payment_proof_url: payload.payment_proof_url || null,
    payment_status: payload.payment_status || 'pending',
    niche_input: payload.niche_input || null,
    generated_ideas: payload.generated_ideas || null,
    selected_idea: payload.selected_idea || null,
    github_repo_url: payload.github_repo_url || null,
    readme_content: payload.readme_content || null,
    ppt_addon_paid: payload.ppt_addon_paid || false,
    ppt_proof_url: payload.ppt_proof_url || null,
    ppt_file_url: payload.ppt_file_url || null,
    status: payload.status || 'waiting_payment',
  };

  // 1. Simpan ke Firestore jika Firebase terkonfigurasi
  if (isFirebaseConfigured) {
    try {
      await fsSaveProject(project);
      return project;
    } catch (err) {
      console.warn('Gagal menyimpan project ke Firestore, fallback:', err);
    }
  }

  // 2. Simpan ke Supabase jika terkonfigurasi
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert([project])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Project;
  }

  mockProjects.set(newId, project);
  return project;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  // 1. Update ke Firestore jika Firebase terkonfigurasi
  if (isFirebaseConfigured) {
    const updated = await fsUpdateProject(id, updates);
    if (updated) return updated;
  }

  // 2. Update ke Supabase jika terkonfigurasi
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) return null;
    return data as Project;
  }

  const existing = mockProjects.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  mockProjects.set(id, updated);
  return updated;
}

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  // 1. Coba Firestore
  if (isFirebaseConfigured) {
    const fsMembers = await fsGetProjectMembers(projectId);
    if (fsMembers.length > 0) return fsMembers;
  }

  // 2. Coba Supabase
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('project_members')
      .select('id, created_at, project_id, name, nim, kom, github_username, github_email, is_connected')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    if (error || !data) return [];
    return data as ProjectMember[];
  }

  return mockMembers.get(projectId) || [];
}

export async function saveProjectMembers(
  projectId: string,
  members: Array<{ name: string; nim?: string; kom?: string; github_username?: string }>
): Promise<ProjectMember[]> {
  const memberRecords: ProjectMember[] = members.map((m) => ({
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    project_id: projectId,
    name: m.name,
    nim: m.nim || '-',
    kom: m.kom || '-',
    github_username: m.github_username?.trim().replace(/^@/, '') || null,
    github_email: null,
    github_access_token: null,
    is_connected: false,
  }));

  // 1. Simpan ke Firestore
  if (isFirebaseConfigured) {
    try {
      for (const m of memberRecords) {
        await fsSaveProjectMember(m);
      }
      return memberRecords;
    } catch (err) {
      console.warn('Gagal menyimpan project members ke Firestore:', err);
    }
  }

  // 2. Simpan ke Supabase
  if (isSupabaseConfigured && supabaseAdmin) {
    await supabaseAdmin.from('project_members').delete().eq('project_id', projectId);
    const { data, error } = await supabaseAdmin
      .from('project_members')
      .insert(memberRecords)
      .select('id, created_at, project_id, name, nim, kom, github_username, github_email, is_connected');
    if (error) throw new Error(error.message);

    return data as ProjectMember[];
  }

  mockMembers.set(projectId, memberRecords);
  return memberRecords;
}

export async function updateProjectMember(
  memberId: string,
  updates: Partial<ProjectMember>
): Promise<ProjectMember | null> {
  // 1. Update ke Firestore
  if (isFirebaseConfigured) {
    const updated = await fsUpdateProjectMember(memberId, updates);
    if (updated) return updated;
  }

  // 2. Update ke Supabase
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('project_members')
      .update(updates)
      .eq('id', memberId)
      .select('id, created_at, project_id, name, nim, kom, github_username, github_email, is_connected')
      .single();
    if (error || !data) return null;
    return data as ProjectMember;
  }

  for (const [projId, list] of mockMembers.entries()) {
    const index = list.findIndex((m) => m.id === memberId);
    if (index !== -1) {
      const updated = { ...list[index], ...updates };
      list[index] = updated;
      mockMembers.set(projId, [...list]);
      return updated;
    }
  }
  return null;
}

export async function getCommitSchedules(projectId: string): Promise<CommitSchedule[]> {
  // 1. Coba Firestore
  if (isFirebaseConfigured) {
    const fsSchedules = await fsGetCommitSchedules(projectId);
    if (fsSchedules.length > 0) return fsSchedules;
  }

  // 2. Coba Supabase
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('commit_schedules')
      .select('*, project_members(name, github_username)')
      .eq('project_id', projectId)
      .order('scheduled_at', { ascending: true });
    if (error || !data) return [];
    return data.map((item: any) => ({
      id: item.id,
      created_at: item.created_at,
      project_id: item.project_id,
      member_id: item.member_id,
      member_name: item.project_members?.name,
      github_username: item.project_members?.github_username,
      commit_message: item.commit_message,
      scheduled_at: item.scheduled_at,
      status: item.status,
      commit_hash: item.commit_hash,
    })) as CommitSchedule[];
  }

  return mockSchedules.get(projectId) || [];
}

export async function createCommitSchedule(
  schedule: Partial<CommitSchedule>
): Promise<CommitSchedule> {
  const newSchedule: CommitSchedule = {
    id: schedule.id || crypto.randomUUID(),
    created_at: new Date().toISOString(),
    project_id: schedule.project_id!,
    member_id: schedule.member_id!,
    commit_message: schedule.commit_message || '',
    scheduled_at: schedule.scheduled_at || new Date().toISOString(),
    status: schedule.status || 'scheduled',
    commit_hash: schedule.commit_hash || null,
  };

  // 1. Simpan ke Firestore
  if (isFirebaseConfigured) {
    try {
      await fsSaveCommitSchedule(newSchedule);
      return newSchedule;
    } catch (err) {
      console.warn('Gagal menyimpan commit schedule ke Firestore:', err);
    }
  }

  // 2. Simpan ke Supabase
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('commit_schedules')
      .insert([newSchedule])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as CommitSchedule;
  }

  const list = mockSchedules.get(newSchedule.project_id) || [];
  list.push(newSchedule);
  mockSchedules.set(newSchedule.project_id, list);
  return newSchedule;
}

// User & Role Management
export async function findUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();

  // 1. Coba Firestore
  if (isFirebaseConfigured) {
    const fsUser = await fsFindUserByEmail(normalized);
    if (fsUser) return fsUser;
  }

  // 2. Coba Supabase
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data } = await supabaseAdmin
        .from('users')
        .select('*')
        .ilike('email', normalized)
        .maybeSingle();
      if (data) return data as User;
    } catch {
      // Fallback
    }
  }

  // 3. Fallback mock store
  for (const user of mockUsers.values()) {
    if (user.email.toLowerCase() === normalized) {
      return user;
    }
  }
  return null;
}

export async function findUserByGitHubUsername(username: string): Promise<User | null> {
  const normalized = username.trim().toLowerCase();

  // 1. Coba Firestore
  if (isFirebaseConfigured) {
    const fsUser = await fsFindUserByGitHubUsername(normalized);
    if (fsUser) return fsUser;
  }

  // 2. Coba Supabase
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data } = await supabaseAdmin
        .from('users')
        .select('*')
        .ilike('github_username', normalized)
        .maybeSingle();
      if (data) return data as User;
    } catch {
      // Fallback
    }
  }

  // 3. Fallback mock store
  for (const user of mockUsers.values()) {
    if (user.github_username && user.github_username.toLowerCase() === normalized) {
      return user;
    }
  }
  return null;
}

export async function findUserById(id: string): Promise<User | null> {
  // 1. Coba Firestore
  if (isFirebaseConfigured) {
    const fsUser = await fsFindUserById(id);
    if (fsUser) return fsUser;
  }

  // 2. Coba Supabase
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (data) return data as User;
    } catch {
      // Fallback
    }
  }

  return mockUsers.get(id) || null;
}

export async function createUser(payload: Omit<User, 'id' | 'created_at'>): Promise<User> {
  const id = `usr-${crypto.randomUUID().slice(0, 8)}`;
  const newUser: User = {
    id,
    email: payload.email.trim().toLowerCase(),
    name: payload.name.trim(),
    whatsapp: payload.whatsapp?.trim() || '',
    github_username: payload.github_username?.trim() || undefined,
    role: payload.role || 'customer',
    password: payload.password,
    created_at: new Date().toISOString(),
  };

  // 1. Simpan ke Firestore
  if (isFirebaseConfigured) {
    try {
      await fsSaveUser(newUser);
      return newUser;
    } catch (err) {
      console.warn('Gagal menyimpan user ke Firestore:', err);
    }
  }

  // 2. Simpan ke Supabase
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert([newUser])
        .select()
        .maybeSingle();
      if (!error && data) {
        return data as User;
      }
    } catch {
      // Fallback
    }
  }

  mockUsers.set(id, newUser);
  return newUser;
}

export async function getUserProjects(customerIdOrEmail: string): Promise<Project[]> {
  const normalized = customerIdOrEmail.trim().toLowerCase();

  // 1. Coba Firestore
  if (isFirebaseConfigured) {
    const fsProjects = await fsGetUserProjects(customerIdOrEmail);
    if (fsProjects.length > 0) return fsProjects;
  }

  // 2. Coba Supabase
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .or(`customer_id.eq.${customerIdOrEmail},buyer_email.ilike.${normalized}`)
        .order('created_at', { ascending: false });
      if (!error && data) return data as Project[];
    } catch {
      // Fallback
    }
  }

  const all = await getAllProjects();
  return all.filter(
    (p) =>
      p.customer_id === customerIdOrEmail ||
      (p.buyer_email && p.buyer_email.toLowerCase() === normalized)
  );
}
