'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Project, ProjectMember } from '@/lib/types';

export default function JoinProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [githubHandle, setGithubHandle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, mRes] = await Promise.all([
          fetch(`/api/projects/${id}`),
          fetch(`/api/projects/${id}/members`),
        ]);

        if (!pRes.ok) throw new Error('Proyek tidak ditemukan');
        const pData = await pRes.json();
        setProject(pData.project);

        if (mRes.ok) {
          const mData = await mRes.json();
          setMembers(mData.members || []);
          const firstUnconnected = mData.members?.find((m: ProjectMember) => !m.is_connected);
          if (firstUnconnected) {
            setSelectedMemberId(firstUnconnected.id);
            setGithubHandle(firstUnconnected.github_username || '');
          }
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat link undangan');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleConnect = () => {
    if (!selectedMemberId) {
      alert('Pilih nama Anda dari daftar anggota terlebih dahulu');
      return;
    }

    const cleanUsername = githubHandle.trim().replace(/^@/, '');
    window.location.href = `/api/auth/github?projectId=${id}&memberId=${selectedMemberId}&username=${encodeURIComponent(cleanUsername)}`;
  };

  if (loading) {
    return (
      <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex items-center justify-center font-mono text-[14px]">
        Memuat undangan kelompok...
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-[20px] font-medium text-white">Undangan Tidak Valid</h1>
        <Link href="/" className="text-[#cbfffc] underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex flex-col selection:bg-[#00827c] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[700px] w-full mx-auto px-6 sm:px-12 py-16 flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] sm:text-[42px] font-medium leading-[1.0] text-white tracking-[-0.03em]">
            Hubungkan Akun GitHub Anda
          </h1>
          <p className="text-[15px] text-[#bbc7c6] leading-[1.4]">
            Anda diundang oleh <strong className="text-white font-medium">{project.buyer_name}</strong> untuk proyek{' '}
            <strong className="text-white font-medium">{project.selected_idea?.title || 'Proyek UAS'}</strong>. Hubungkan akun GitHub agar grafik commit tercatat atas nama Anda.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-[16px] bg-[#003734] flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <label className="text-[12px] uppercase tracking-[0.12em] text-[#edfffe] font-medium">
              Pilih Nama Anda di Kelompok Ini:
            </label>
            <div className="flex flex-col gap-3">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    if (!m.is_connected) {
                      setSelectedMemberId(m.id);
                      setGithubHandle(m.github_username || '');
                    }
                  }}
                  disabled={m.is_connected}
                  className={`p-4 rounded-[6px] border text-left flex items-center justify-between transition-all ${
                    m.is_connected
                      ? 'border-transparent bg-[#011d1c] opacity-50 cursor-not-allowed'
                      : selectedMemberId === m.id
                      ? 'border-[#cbfffc] bg-[#012624] text-white'
                      : 'border-transparent bg-[#011d1c] hover:border-[#00827c] text-[#bbc7c6]'
                  }`}
                >
                  <div>
                    <div className="text-[15px] font-medium text-white">{m.name}</div>
                    {m.github_username && (
                      <div className="text-[12px] text-[#cbfffc] font-mono mt-0.5">
                        @{m.github_username}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[11px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-[4px] ${
                      m.is_connected
                        ? 'bg-[#cbfffc] text-[#012624] font-medium'
                        : selectedMemberId === m.id
                        ? 'bg-[#cbfffc] text-[#012624] font-medium'
                        : 'bg-[#003734] text-[#bbc7c6]'
                    }`}
                  >
                    {m.is_connected ? 'Sudah Terhubung' : selectedMemberId === m.id ? 'Dipilih' : 'Pilih'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#012624] pt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] uppercase tracking-[0.08em] text-[#edfffe]">
                Username GitHub Anda
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#bbc7c6] font-mono text-[14px]">@</span>
                <input
                  type="text"
                  placeholder="ZeaLIsHere"
                  value={githubHandle}
                  onChange={(e) => setGithubHandle(e.target.value)}
                  className="w-full bg-[#011d1c] border border-[#003734] focus:border-[#cbfffc] rounded-[6px] pl-8 pr-4 py-2.5 text-[14px] font-mono text-white outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={!selectedMemberId}
              className="w-full btn-aurora text-[14px] py-4 rounded-[6px] transition-all text-center flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Hubungkan Akun GitHub (OAuth) ↗
            </button>
            <p className="text-[12px] text-[#bbc7c6] text-center font-mono">
              Scope izin terbatas: repository proyek kuliah ini. Token tersimpan aman di server.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href={`/project/${id}`} className="text-[13px] uppercase tracking-[0.12em] text-[#bbc7c6] hover:text-white">
            ← Buka Dashboard Proyek
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
