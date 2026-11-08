import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Project, ProjectMember, CommitSchedule, User } from './types';

// Collection references
const PROJECTS_COL = 'projects';
const MEMBERS_COL = 'project_members';
const SCHEDULES_COL = 'commit_schedules';
const USERS_COL = 'users';

// Helper to remove undefined fields because Firestore does not accept undefined values
function sanitizeForFirestore<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean;
}

// ---------------------------------------------------------------------------
// 1. Projects
// ---------------------------------------------------------------------------

export async function fsGetProjectById(id: string): Promise<Project | null> {
  try {
    const docRef = doc(db, PROJECTS_COL, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as Project;
  } catch (error) {
    console.warn('Firestore fsGetProjectById error, using fallback:', error);
    return null;
  }
}

export async function fsGetAllProjects(): Promise<Project[]> {
  try {
    const colRef = collection(db, PROJECTS_COL);
    const q = query(colRef, orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d: any) => d.data() as Project);
  } catch (error) {
    console.warn('Firestore fsGetAllProjects error:', error);
    return [];
  }
}

export async function fsSaveProject(project: Project): Promise<Project> {
  const docRef = doc(db, PROJECTS_COL, project.id);
  await setDoc(docRef, sanitizeForFirestore(project as unknown as Record<string, unknown>));
  return project;
}

export async function fsUpdateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  try {
    const docRef = doc(db, PROJECTS_COL, id);
    await updateDoc(docRef, sanitizeForFirestore(updates as unknown as Record<string, unknown>));
    const updatedSnap = await getDoc(docRef);
    if (!updatedSnap.exists()) return null;
    return updatedSnap.data() as Project;
  } catch (error) {
    console.warn('Firestore fsUpdateProject error:', error);
    return null;
  }
}

export async function fsGetUserProjects(customerIdOrEmail: string): Promise<Project[]> {
  try {
    const normalized = customerIdOrEmail.trim().toLowerCase();
    const colRef = collection(db, PROJECTS_COL);

    // Query by customer_id
    const q1 = query(colRef, where('customer_id', '==', customerIdOrEmail));
    const snap1 = await getDocs(q1);

    // Query by buyer_email
    const q2 = query(colRef, where('buyer_email', '==', normalized));
    const snap2 = await getDocs(q2);

    const map = new Map<string, Project>();
    snap1.docs.forEach((d: any) => map.set(d.id, d.data() as Project));
    snap2.docs.forEach((d: any) => map.set(d.id, d.data() as Project));

    return Array.from(map.values()).sort(
      (a: Project, b: Project) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.warn('Firestore fsGetUserProjects error:', error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 2. Project Members
// ---------------------------------------------------------------------------

export async function fsGetProjectMembers(projectId: string): Promise<ProjectMember[]> {
  try {
    const colRef = collection(db, MEMBERS_COL);
    const q = query(colRef, where('project_id', '==', projectId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d: any) => d.data() as ProjectMember)
      .sort((a: ProjectMember, b: ProjectMember) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } catch (error) {
    console.warn('Firestore fsGetProjectMembers error:', error);
    return [];
  }
}

export async function fsSaveProjectMember(member: ProjectMember): Promise<ProjectMember> {
  const docRef = doc(db, MEMBERS_COL, member.id);
  await setDoc(docRef, sanitizeForFirestore(member as unknown as Record<string, unknown>));
  return member;
}

export async function fsGetProjectMemberById(memberId: string): Promise<ProjectMember | null> {
  try {
    const docRef = doc(db, MEMBERS_COL, memberId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as ProjectMember;
  } catch (error) {
    console.warn('Firestore fsGetProjectMemberById error:', error);
    return null;
  }
}

export async function fsDeleteProjectMembers(projectId: string): Promise<void> {
  try {
    const colRef = collection(db, MEMBERS_COL);
    const q = query(colRef, where('project_id', '==', projectId));
    const snap = await getDocs(q);
    const deletes = snap.docs.map((d: any) => deleteDoc(d.ref));
    await Promise.all(deletes);
  } catch (error) {
    console.warn('Firestore fsDeleteProjectMembers error:', error);
  }
}

export async function fsUpdateProjectMember(
  memberId: string,
  updates: Partial<ProjectMember>
): Promise<ProjectMember | null> {
  try {
    const docRef = doc(db, MEMBERS_COL, memberId);
    await updateDoc(docRef, sanitizeForFirestore(updates as unknown as Record<string, unknown>));
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as ProjectMember;
  } catch (error) {
    console.warn('Firestore fsUpdateProjectMember error:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 3. Commit Schedules
// ---------------------------------------------------------------------------

export async function fsGetCommitSchedules(projectId: string): Promise<CommitSchedule[]> {
  try {
    const colRef = collection(db, SCHEDULES_COL);
    const q = query(colRef, where('project_id', '==', projectId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d: any) => d.data() as CommitSchedule)
      .sort((a: CommitSchedule, b: CommitSchedule) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  } catch (error) {
    console.warn('Firestore fsGetCommitSchedules error:', error);
    return [];
  }
}

export async function fsSaveCommitSchedule(schedule: CommitSchedule): Promise<CommitSchedule> {
  const docRef = doc(db, SCHEDULES_COL, schedule.id);
  await setDoc(docRef, sanitizeForFirestore(schedule as unknown as Record<string, unknown>));
  return schedule;
}

export async function fsUpdateCommitSchedule(
  scheduleId: string,
  updates: Partial<CommitSchedule>
): Promise<CommitSchedule | null> {
  try {
    const docRef = doc(db, SCHEDULES_COL, scheduleId);
    await updateDoc(docRef, sanitizeForFirestore(updates as unknown as Record<string, unknown>));
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as CommitSchedule;
  } catch (error) {
    console.warn('Firestore fsUpdateCommitSchedule error:', error);
    return null;
  }
}

export async function fsGetDueCommitSchedules(forceNow = false): Promise<CommitSchedule[]> {
  try {
    const colRef = collection(db, SCHEDULES_COL);
    const q = query(colRef, where('status', '==', 'scheduled'));
    const snap = await getDocs(q);
    const all = snap.docs.map((d: any) => d.data() as CommitSchedule);
    if (forceNow) return all;
    const now = new Date();
    return all.filter((s: CommitSchedule) => new Date(s.scheduled_at) <= now);
  } catch (error) {
    console.warn('Firestore fsGetDueCommitSchedules error:', error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 4. Users & Authentication
// ---------------------------------------------------------------------------

export async function fsFindUserByEmail(email: string): Promise<User | null> {
  try {
    const normalized = email.trim().toLowerCase();
    const colRef = collection(db, USERS_COL);
    const q = query(colRef, where('email', '==', normalized));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as User;
  } catch (error) {
    console.warn('Firestore fsFindUserByEmail error:', error);
    return null;
  }
}

export async function fsFindUserByGitHubUsername(username: string): Promise<User | null> {
  try {
    const normalized = username.trim().toLowerCase();
    const colRef = collection(db, USERS_COL);
    const q = query(colRef, where('github_username', '==', normalized));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as User;
  } catch (error) {
    console.warn('Firestore fsFindUserByGitHubUsername error:', error);
    return null;
  }
}

export async function fsFindUserById(id: string): Promise<User | null> {
  try {
    const docRef = doc(db, USERS_COL, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as User;
  } catch (error) {
    console.warn('Firestore fsFindUserById error:', error);
    return null;
  }
}

export async function fsSaveUser(user: User): Promise<User> {
  const docRef = doc(db, USERS_COL, user.id);
  await setDoc(docRef, sanitizeForFirestore(user as unknown as Record<string, unknown>));
  return user;
}

export { isFirebaseConfigured };
