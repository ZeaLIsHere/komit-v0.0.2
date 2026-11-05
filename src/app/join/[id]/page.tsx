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

    // Redirect to GitHub OAuth initiation endpoint
    window.location.href = `/api/auth/github?projectId=${id}&memberId=${selectedMemberId}`;
  };

  if (loading) {
    return (
      <div className="bg-[#000000] text-[#ffffff] min-h-screen flex items-center justify-center font-extralight text-[16px]">
        Memuat undangan kelompok...
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="bg-[#000000] text-[#ffffff] min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-[24px]">Undangan Tidak Valid</h1>
        <Link href="/" className="text-[#8052ff] underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#000000] text-[#ffffff] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[680px] w-full mx-auto px-6 py-16 flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <span className="text-[12px] uppercase tracking-[0.2em] text-[#ffb829]">
            Undangan Kolaborator Kelompok
          </span>
          <h1 className="text-[32px] md:text-[42px] font-normal tracking-[-0.03em] text-white">
            Hubungkan Akun GitHub Anda
          </h1>
          <p className="text-[16px] text-[#9a9a9a] font-extralight leading-relaxed">
            Anda diundang oleh <strong className="text-white font-normal">{project.buyer_name}</strong> untuk bergabung ke proyek{' '}
            <strong className="text-white font-normal">{project.selected_idea?.title || 'Proyek UAS'}</strong>. Hubungkan akun GitHub Anda agar grafik commit tercatat atas nama Anda.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-white/10 bg-[#060606] flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <label className="text-[13px] uppercase tracking-wider text-[#bdbdbd]">
              Pilih Nama Anda di Kelompok Ini:
            </label>
            <div className="flex flex-col gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => !m.is_connected && setSelectedMemberId(m.id)}
                  disabled={m.is_connected}
                  className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                    m.is_connected
                      ? 'border-white/5 bg-white/5 opacity-60 cursor-not-allowed'
                      : selectedMemberId === m.id
                      ? 'border-[#8052ff] bg-[#8052ff]/10 text-white'
                      : 'border-white/10 hover:border-white/20 text-[#9a9a9a]'
                  }`}
                >
                  <div>
                    <div className="text-[15px] font-normal text-white">{m.name}</div>
                    <div className="text-[12px] text-[#9a9a9a] font-mono tabular-nums">
                      NIM: {m.nim} • KOM {m.kom}
                    </div>
                  </div>
                  <span
                    className={`text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      m.is_connected
                        ? 'bg-[#15846e]/20 text-[#15846e] border border-[#15846e]/40'
                        : selectedMemberId === m.id
                        ? 'bg-[#8052ff] text-white'
                        : 'bg-white/5 text-[#9a9a9a]'
                    }`}
                  >
                    {m.is_connected ? 'Sudah Terhubung' : selectedMemberId === m.id ? 'Dipilih' : 'Pilih'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
            <button
              onClick={handleConnect}
              disabled={!selectedMemberId}
              className="w-full bg-[#8052ff] hover:bg-[#7042ef] disabled:opacity-40 text-white text-[14px] font-normal uppercase tracking-[0.025em] py-3.5 rounded-full transition-all text-center flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Hubungkan Akun GitHub (OAuth)
            </button>
            <p className="text-[12px] text-[#9a9a9a] text-center font-extralight">
              Scope izin hanya untuk repository proyek kuliah ini. Token disimpan aman di server terisolasi.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href={`/project/${id}`} className="text-[13px] text-[#9a9a9a] hover:text-white">
            ← Buka Dashboard Proyek
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
