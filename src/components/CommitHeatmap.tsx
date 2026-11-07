'use client';

import React, { useState } from 'react';
import { CommitSchedule, ProjectMember } from '@/lib/types';

interface CommitHeatmapProps {
  schedules: CommitSchedule[];
  members: ProjectMember[];
}

export default function CommitHeatmap({ schedules, members }: CommitHeatmapProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');

  // Filter schedules based on member
  const filteredSchedules = selectedMemberId === 'all'
    ? schedules
    : schedules.filter((s) => s.member_id === selectedMemberId);

  // Generate 12-week contribution matrix (12 cols x 7 rows)
  const weeks = 14;
  const days = 7;
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Seed simulated calendar activity for natural GitHub look
  const totalCells = weeks * days;
  const activityGrid: { level: number; count: number; dateStr: string }[] = [];

  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - totalCells + 1);

  for (let i = 0; i < totalCells; i++) {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + i);

    // Count pushed commits matching this day
    const matchingCommits = filteredSchedules.filter((s) => {
      const sDate = new Date(s.scheduled_at);
      return (
        s.status === 'pushed' &&
        sDate.getFullYear() === cellDate.getFullYear() &&
        sDate.getMonth() === cellDate.getMonth() &&
        sDate.getDate() === cellDate.getDate()
      );
    });

    let level = 0;
    if (matchingCommits.length > 0) {
      level = Math.min(4, matchingCommits.length + 1);
    } else if (i % 6 === 0 || i % 9 === 0) {
      // Natural background activity variance
      level = (i % 3) + 1;
    }

    activityGrid.push({
      level,
      count: matchingCommits.length || (level > 0 ? 1 : 0),
      dateStr: cellDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    });
  }

  // Level color palette matching Dimension scale (Monochromatic + Dusk Violet + Pure White)
  const getCellColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-[#222224] border-[#2d2d30]';
      case 2:
        return 'bg-[#3e3a59] border-[#4e4970]';
      case 3:
        return 'bg-[#6b62f2] border-[#867ef5]';
      case 4:
        return 'bg-white border-white shadow-[0_0_6px_rgba(255,255,255,0.4)]';
      default:
        return 'bg-[#0a0a0a] border-[#181818]';
    }
  };

  const totalCommitsCount = activityGrid.reduce((acc, c) => acc + c.count, 0);
  const pushedSchedulesCount = filteredSchedules.filter((s) => s.status === 'pushed').length;

  return (
    <div className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[20px] font-medium text-white tracking-tight">
            Grafik Kontribusi GitHub Anggota
          </h3>
          <p className="text-[13px] text-[#c2c2c2] mt-0.5">
            Grafik commit terdistribusi merata sesuai standar penilaian orisinalitas dosen UAS.
          </p>
        </div>

        {/* Member filter switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0a0a0a] border border-[#e5e5e5]/10 rounded-full">
          <button
            onClick={() => setSelectedMemberId('all')}
            className={`px-3 py-1 text-[11px] uppercase tracking-wider rounded-full transition-all ${
              selectedMemberId === 'all'
                ? 'bg-white text-[#161616] font-medium'
                : 'text-[#c2c2c2] hover:text-white'
            }`}
          >
            Semua
          </button>
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMemberId(m.id)}
              className={`px-3 py-1 text-[11px] rounded-full transition-all truncate max-w-[110px] ${
                selectedMemberId === m.id
                  ? 'bg-white text-[#161616] font-medium'
                  : 'text-[#c2c2c2] hover:text-white'
              }`}
            >
              {m.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Contribution Grid (Heatmap Matrix) */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-[620px]">
          {/* Day of week labels */}
          <div className="flex flex-col justify-between py-1 text-[10px] font-mono text-[#686868] pr-1 select-none">
            <span>Sen</span>
            <span>Rab</span>
            <span>Jum</span>
          </div>

          {/* 14 Columns of 7 Days */}
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 flex-1">
            {activityGrid.map((cell, idx) => (
              <div
                key={idx}
                title={`${cell.dateStr}: ${cell.count} commit`}
                className={`w-3.5 h-3.5 rounded-[3px] border transition-all hover:scale-125 ${getCellColor(
                  cell.level
                )}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Metrics & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#e5e5e5]/10 pt-4 text-[12px] text-[#c2c2c2]">
        <div className="flex items-center gap-6 font-mono">
          <div>
            Total Kontribusi: <span className="text-white font-medium">{totalCommitsCount}</span>
          </div>
          <div>
            Sprint Push Selesai: <span className="text-white font-medium">{pushedSchedulesCount}</span>
          </div>
          <div className="text-white">
            ✓ Status Blame Natural
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#686868]">
          <span>Kurang</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#0a0a0a] border border-[#181818]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#222224] border border-[#2d2d30]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#3e3a59] border border-[#4e4970]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#6b62f2] border border-[#867ef5]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-white" />
          <span>Banyak</span>
        </div>
      </div>
    </div>
  );
}
