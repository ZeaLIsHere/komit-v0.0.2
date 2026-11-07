import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import { Project, ProjectMember, CommitSchedule, User } from './types';

// ponytail: in-memory mock store when Supabase env variables not configured -> Supabase PostgreSQL
const mockUsers: Map<string, User> = new Map([
  [
    'usr-admin',
    {
      id: 'usr-admin',
      email: 'admin@komit.id',
      name: 'Admin Tim Joki Komit',
      whatsapp: '081299990000',
      role: 'admin',
      password: 'admin123',
      created_at: new Date().toISOString(),
    },
  ],
  [
    'usr-customer-demo',
    {
      id: 'usr-customer-demo',
      email: 'fadhil@student.ac.id',
      name: 'Fadhil Pratama',
      whatsapp: '081234567890',
      role: 'customer',
      password: 'customer123',
      created_at: new Date().toISOString(),
    },
  ],
]);

const mockProjects: Map<string, Project> = new Map([
  [
    'demo-proyek-uas',
    {
      id: 'demo-proyek-uas',
      created_at: new Date().toISOString(),
      customer_id: 'usr-customer-demo',
      buyer_email: 'fadhil@student.ac.id',
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
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data as Project;
  }
  return mockProjects.get(id) || null;
}

export async function getAllProjects(): Promise<Project[]> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as Project[];
  }
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
  if (isSupabaseConfigured && supabaseAdmin) {
    // Note: Do not select github_access_token to keep it server-only
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
  members: Array<{ name: string; nim: string; kom: string; github_username?: string }>
): Promise<ProjectMember[]> {
  const memberRecords: ProjectMember[] = members.map((m) => ({
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    project_id: projectId,
    name: m.name,
    nim: m.nim,
    kom: m.kom,
    github_username: m.github_username || null,
    github_email: null,
    github_access_token: null,
    is_connected: false,
  }));

  if (isSupabaseConfigured && supabaseAdmin) {
    // Delete existing members for this project first
    await supabaseAdmin.from('project_members').delete().eq('project_id', projectId);
    const { data, error } = await supabaseAdmin
      .from('project_members')
      .insert(memberRecords)
      .select('id, created_at, project_id, name, nim, kom, github_username, github_email, is_connected');
    if (error) throw new Error(error.message);

    // Auto-generate initial commit schedule roadmap if none exists
    const { data: existingSchedules } = await supabaseAdmin
      .from('commit_schedules')
      .select('id')
      .eq('project_id', projectId);

    if (!existingSchedules || existingSchedules.length === 0) {
      const commitMessages = [
        'feat: initialize project scaffolding and routing structure',
        'feat: implement authentication flow and middleware guards',
        'feat: build core business logic and database queries',
        'refactor: optimize response payload and error handling',
        'docs: finalize api documentation and demo seeders for uas',
      ];
      const newSchedules = memberRecords.map((m, idx) => ({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        project_id: projectId,
        member_id: m.id,
        commit_message: commitMessages[idx % commitMessages.length],
        scheduled_at: new Date(Date.now() + 86400000 * (idx + 1) * 3).toISOString(),
        status: idx === 0 ? 'pushed' : 'scheduled',
        commit_hash: idx === 0 ? Math.random().toString(16).substring(2, 9) : null,
      }));
      await supabaseAdmin.from('commit_schedules').insert(newSchedules);
    }

    return data as ProjectMember[];
  }

  mockMembers.set(projectId, memberRecords);

  // Auto-scaffold initial schedules in mock store if none exist
  if (!mockSchedules.has(projectId) || mockSchedules.get(projectId)!.length === 0) {
    const commitMessages = [
      'feat: initialize project scaffolding and routing structure',
      'feat: implement authentication flow and middleware guards',
      'feat: build core business logic and database queries',
      'refactor: optimize response payload and error handling',
      'docs: finalize api documentation and demo seeders for uas',
    ];
    const newMockSchedules: CommitSchedule[] = memberRecords.map((m, idx) => ({
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      project_id: projectId,
      member_id: m.id,
      member_name: m.name,
      github_username: m.github_username || `contributor-${idx + 1}`,
      commit_message: commitMessages[idx % commitMessages.length],
      scheduled_at: new Date(Date.now() + 86400000 * (idx + 1) * 3).toISOString(),
      status: idx === 0 ? 'pushed' : 'scheduled',
      commit_hash: idx === 0 ? Math.random().toString(16).substring(2, 9) : undefined,
    }));
    mockSchedules.set(projectId, newMockSchedules);
  }

  return memberRecords;
}

export async function updateProjectMember(
  memberId: string,
  updates: Partial<ProjectMember>
): Promise<ProjectMember | null> {
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
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('commit_schedules')
      .select('*')
      .eq('project_id', projectId)
      .order('scheduled_at', { ascending: true });
    if (error || !data) return [];
    return data as CommitSchedule[];
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
  for (const user of mockUsers.values()) {
    if (user.email.toLowerCase() === normalized) {
      return user;
    }
  }
  // Allow 'admin' shorthand for admin@komit.id
  if (normalized === 'admin') {
    return mockUsers.get('usr-admin') || null;
  }
  return null;
}

export async function findUserById(id: string): Promise<User | null> {
  return mockUsers.get(id) || null;
}

export async function createUser(payload: Omit<User, 'id' | 'created_at'>): Promise<User> {
  const id = `usr-${crypto.randomUUID().slice(0, 8)}`;
  const newUser: User = {
    id,
    email: payload.email.trim().toLowerCase(),
    name: payload.name.trim(),
    whatsapp: payload.whatsapp?.trim() || '',
    role: payload.role || 'customer',
    password: payload.password,
    created_at: new Date().toISOString(),
  };

  mockUsers.set(id, newUser);
  return newUser;
}

export async function getUserProjects(customerIdOrEmail: string): Promise<Project[]> {
  const all = await getAllProjects();
  const normalized = customerIdOrEmail.trim().toLowerCase();
  return all.filter(
    (p) =>
      p.customer_id === customerIdOrEmail ||
      (p.buyer_email && p.buyer_email.toLowerCase() === normalized)
  );
}
