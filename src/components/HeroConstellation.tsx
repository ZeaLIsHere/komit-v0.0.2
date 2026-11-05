'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HeroConstellation() {
  const [activeTab, setActiveTab] = useState<'all' | 'commits' | 'gimmick'>('commits');

  const commitMockups = [
    {
      author: 'budisantoso',
      role: 'Lead Architect',
      message: 'feat: setup next.js app router & supabase connection',
      time: 'Senin, 09:30',
      hash: '7fa890c',
      status: 'pushed',
    },
    {
      author: 'sitirahma',
      role: 'Auth Specialist',
      message: 'feat: role-based auth middleware & session handler',
      time: 'Rabu, 14:15',
      hash: '3bc12de',
      status: 'pushed',
    },
    {
      author: 'dimasaditya',
      role: 'Backend Dev',
      message: 'feat: transaction query optimization & aggregate reports',
      time: 'Sabtu, 11:00',
      hash: '9e2114a',
      status: 'scheduled',
    },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#040506] border border-[#1b1c1e] p-4 sm:p-8">
      {/* Raycast signature atmospheric red/blue gradient geometry */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,_rgba(4,63,150,0.45)_0%,_rgba(6,18,37,0)_70%)] blur-[40px] opacity-75" />
      <div className="pointer-events-none absolute -top-12 right-1/4 w-[280px] h-[180px] bg-[#ff6363] blur-[70px] opacity-25" />

      {/* App Window Mockup */}
      <div className="relative z-10 max-w-[760px] mx-auto bg-[#07080a] border border-[#363739] rounded-xl key-shadow overflow-hidden">
        {/* Command Window Bar */}
        <div className="h-12 border-b border-[#1b1c1e] px-4 flex items-center justify-between bg-[#040506]">
          <div className="flex items-center gap-3 flex-1">
            <svg className="w-4 h-4 text-[#6a6b6c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="text-[14px] text-[#9c9c9d] font-normal">
              Cari jadwal commit kelompok, aksi joki, atau bahan UAS...
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#6a6b6c] bg-[#111214] border border-[#1b1c1e] px-2 py-0.5 rounded-[6px]">
              ⌘K
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 border-b border-[#111214] bg-[#07080a] flex items-center gap-2 text-[12px]">
          <button
            onClick={() => setActiveTab('commits')}
            className={`px-2.5 py-1 rounded-[6px] transition-all ${
              activeTab === 'commits'
                ? 'bg-[#1b1c1e] text-white font-medium border border-[#363739]'
                : 'text-[#6a6b6c] hover:text-[#9c9c9d]'
            }`}
          >
            Antrean Cicil Commit
          </button>
          <button
            onClick={() => setActiveTab('gimmick')}
            className={`px-2.5 py-1 rounded-[6px] transition-all ${
              activeTab === 'gimmick'
                ? 'bg-[#1b1c1e] text-white font-medium border border-[#363739]'
                : 'text-[#6a6b6c] hover:text-[#9c9c9d]'
            }`}
          >
            Gimmick Pemikat Dosen
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-[6px] transition-all ${
              activeTab === 'all'
                ? 'bg-[#1b1c1e] text-white font-medium border border-[#363739]'
                : 'text-[#6a6b6c] hover:text-[#9c9c9d]'
            }`}
          >
            Info Paket
          </button>
        </div>

        {/* Interactive List Content */}
        <div className="p-3 flex flex-col gap-1.5 font-sans">
          {activeTab === 'commits' &&
            commitMockups.map((c, i) => (
              <div
                key={c.hash}
                className={`p-3 rounded-lg flex items-center justify-between text-[13px] transition-all ${
                  i === 0
                    ? 'bg-[#111214] border border-[#ff6363]/40'
                    : 'hover:bg-[#111214]/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      c.status === 'pushed' ? 'bg-[#59d499]' : 'bg-[#ff6363]'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">@{c.author}</span>
                      <span className="text-[11px] text-[#6a6b6c]">({c.role})</span>
                    </div>
                    <div className="text-[12px] text-[#9c9c9d] font-mono mt-0.5">
                      {c.message}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right">
                  <span className="text-[11px] font-mono text-[#6a6b6c] hidden sm:inline">
                    {c.time}
                  </span>
                  <span className="text-[11px] font-mono text-[#e6e6e6] bg-[#1b1c1e] px-2 py-0.5 rounded-[6px] border border-[#363739]">
                    #{c.hash}
                  </span>
                </div>
              </div>
            ))}

          {activeTab === 'gimmick' && (
            <div className="p-4 rounded-lg bg-[#111214] border border-[#ff6363]/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#ff6363]">
                  Fitur Pemikat Nilai A Dosen
                </span>
                <span className="text-[11px] text-[#6a6b6c]">Demo Ready</span>
              </div>
              <p className="text-[14px] text-white font-normal leading-relaxed">
                Live radar chart keselarasan skill dari commit GitHub + Generator test-fixtures otomatis untuk demonstrasi langsung saat sesi tanya jawab UAS.
              </p>
            </div>
          )}

          {activeTab === 'all' && (
            <div className="p-4 rounded-lg bg-[#111214] flex flex-col gap-2 text-[13px] text-[#9c9c9d]">
              <div>Paket Full: Ide AI + Gimmick + Koding + Cicil Commit + Bahan README.</div>
              <div className="text-white font-mono">Formula Biaya: N x Rp 50.000 (Adil per anggota)</div>
            </div>
          )}
        </div>

        {/* Window Footer */}
        <div className="h-9 px-4 bg-[#040506] border-t border-[#111214] flex items-center justify-between text-[11px] text-[#6a6b6c] font-mono">
          <span>Kelompok UAS: 4 Anggota Terhubung</span>
          <Link href="/project/demo-proyek-uas" className="hover:text-white transition-colors">
            Lihat Dashboard Lengkap ↵
          </Link>
        </div>
      </div>
    </div>
  );
}
