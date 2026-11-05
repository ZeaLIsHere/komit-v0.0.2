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

    window.location.href = `/api/auth/github?projectId=${id}&memberId=${selectedMemberId}`;
  };

  if (loading) {
    return (
      <div className="bg-[#040506] text-white min-h-screen flex items-center justify-center font-mono text-[14px]">
        Memuat undangan kelompok...
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="bg-[#040506] text-white min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-[20px] font-normal">Undangan Tidak Valid</h1>
        <Link href="/" className="text-[#9c9c9d] hover:text-white underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#040506] text-white min-h-screen flex flex-col selection:bg-[#ff6363]/30">
      <Navbar />

      <main className="flex-1 max-w-[640px] w-full mx-auto px-6 py-16 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-mono uppercase tracking-[0.05em] text-[#ff6363]">
            Undangan Kolaborator Kelompok
          </span>
          <h1 className="text-[28px] sm:text-[36px] font-normal text-white">
            Hubungkan Akun GitHub Anda
          </h1>
          <p className="text-[14px] text-[#9c9c9d] leading-relaxed">
            Anda diundang oleh <strong className="text-white font-medium">{project.buyer_name}</strong> untuk proyek{' '}
            <strong className="text-white font-medium">{project.selected_idea?.title || 'Proyek UAS'}</strong>. Hubungkan akun GitHub agar grafik commit tercatat atas nama Anda.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            <label className="text-[11px] font-mono uppercase tracking-[0.05em] text-[#9c9c9d]">
              Pilih Nama Anda di Kelompok Ini:
            </label>
            <div className="flex flex-col gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => !m.is_connected && setSelectedMemberId(m.id)}
                  disabled={m.is_connected}
                  className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                    m.is_connected
                      ? 'border-[#1b1c1e] bg-[#040506] opacity-50 cursor-not-allowed'
                      : selectedMemberId === m.id
                      ? 'border-[#ff6363]/60 bg-[#111214] key-shadow-active text-white'
                      : 'border-[#1b1c1e] bg-[#040506] hover:border-[#363739] text-[#9c9c9d]'
                  }`}
                >
                  <div>
                    <div className="text-[14px] font-medium text-white">{m.name}</div>
                    <div className="text-[11px] text-[#6a6b6c] font-mono mt-0.5">
                      NIM: {m.nim} • KOM {m.kom}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-[4px] ${
                      m.is_connected
                        ? 'bg-[#59d499]/10 text-[#59d499] border border-[#59d499]/30'
                        : selectedMemberId === m.id
                        ? 'bg-[#e6e6e6] text-[#454647]'
                        : 'bg-[#1b1c1e] text-[#6a6b6c]'
                    }`}
                  >
                    {m.is_connected ? 'Sudah Terhubung' : selectedMemberId === m.id ? 'Dipilih' : 'Pilih'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#1b1c1e] pt-5 flex flex-col gap-3">
            <button
              onClick={handleConnect}
              disabled={!selectedMemberId}
              className="w-full bg-[#e6e6e6] hover:bg-white disabled:opacity-40 text-[#454647] text-[13px] font-medium py-3 rounded-lg transition-all text-center flex items-center justify-center gap-2 shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Hubungkan Akun GitHub (OAuth)
            </button>
            <p className="text-[11px] text-[#6a6b6c] text-center font-mono">
              Scope izin terbatas: repository proyek kuliah ini. Token dienkripsi aman di server.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href={`/project/${id}`} className="text-[12px] text-[#6a6b6c] hover:text-white">
            ← Buka Dashboard Proyek
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
