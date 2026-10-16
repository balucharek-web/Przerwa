import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Download, Trash2, Clock, BarChart2 } from 'lucide-react';
import { BreakRecord } from '../types';

interface Props {
  records: BreakRecord[];
  onDeleteRecord: (id: number) => void;
  onClearMonth: (yearMonth: string) => void;
}

export const HistoryView: React.FC<Props> = ({
  records,
  onDeleteRecord,
  onClearMonth,
}) => {
  const getInitialYearMonth = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  const [selectedYearMonth, setSelectedYearMonth] = useState<string>(getInitialYearMonth());

  const monthNames = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień',
  ];

  const [yearStr, monthStr] = selectedYearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;
  const monthDisplayName = `${monthNames[monthIndex]} ${year}`;

  const navigateMonth = (direction: number) => {
    let nextMonth = monthIndex + direction;
    let nextYear = year;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    const formatted = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}`;
    setSelectedYearMonth(formatted);
  };

  // Filter records for this month
  const monthRecords = records.filter(r => r.dateString.startsWith(selectedYearMonth));
  const totalSec = monthRecords.reduce((acc, cur) => acc + cur.durationSeconds, 0);
  const uniqueDays = new Set(monthRecords.map(r => r.dateString));
  const activeDaysCount = uniqueDays.size;
  const avgSec = activeDaysCount > 0 ? Math.floor(totalSec / activeDaysCount) : 0;

  const formatHoursMins = (totalSeconds: number) => {
    const s = Math.max(0, totalSeconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const formatTimeString = (timestampMs: number) => {
    return new Date(timestampMs).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group records by day
  const grouped: Record<string, BreakRecord[]> = {};
  monthRecords.forEach(rec => {
    if (!grouped[rec.dateString]) grouped[rec.dateString] = [];
    grouped[rec.dateString].push(rec);
  });

  const sortedDates = Object.keys(grouped).sort().reverse();

  // CSV export
  const exportCSV = () => {
    if (monthRecords.length === 0) return;
    let csv = 'Data,Start,Koniec,Czas (minuty),Czas (sekundy),Notatka\n';
    monthRecords.forEach(r => {
      const s = new Date(r.startTimeMs).toLocaleTimeString();
      const e = new Date(r.endTimeMs).toLocaleTimeString();
      const m = (r.durationSeconds / 60).toFixed(1);
      csv += `"${r.dateString}","${s}","${e}",${m},${r.durationSeconds},"${r.note || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `przerwy_${selectedYearMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pb-12">
      {/* Month Selector Bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow my-3">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Poprzedni miesiąc"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center font-extrabold text-sm sm:text-base capitalize text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>{monthDisplayName}</span>
        </div>

        <button
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Następny miesiąc"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Monthly KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Łączny czas</div>
          <div className="text-lg font-black text-emerald-400 mt-1 tabular-nums">
            {formatHoursMins(totalSec)}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Liczba przerw</div>
          <div className="text-lg font-black text-white mt-1 tabular-nums">
            {monthRecords.length}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dni pracy</div>
          <div className="text-lg font-black text-blue-400 mt-1 tabular-nums">
            {activeDaysCount}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Średnia / dzień</div>
          <div className="text-lg font-black text-amber-400 mt-1 tabular-nums">
            {formatHoursMins(avgSec)}
          </div>
        </div>
      </div>

      {/* Action Tools */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <button
          onClick={exportCSV}
          disabled={monthRecords.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-xs font-semibold text-slate-300 border border-slate-800 transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Eksportuj CSV</span>
        </button>

        {monthRecords.length > 0 && (
          <button
            onClick={() => {
              if (confirm(`Czy na pewno usunąć wszystkie (${monthRecords.length}) wpisy z miesiąca ${monthDisplayName}?`)) {
                onClearMonth(selectedYearMonth);
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wyczyść ten miesiąc</span>
          </button>
        )}
      </div>

      {/* Days Breakdown */}
      {sortedDates.length === 0 ? (
        <div className="p-10 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center text-slate-500">
          <Clock className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
          <p className="text-sm font-semibold">Brak zarejestrowanych przerw w tym miesiącu.</p>
          <p className="text-xs text-slate-600 mt-1">Gdy zarejestrujesz przerwy, pojawią się w tym zestawieniu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDates.map(dateStr => {
            const items = grouped[dateStr];
            const daySum = items.reduce((acc, cur) => acc + cur.durationSeconds, 0);
            const dObj = new Date(dateStr + 'T12:00:00');
            const dayFormatted = dObj.toLocaleDateString('pl-PL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            });

            return (
              <div
                key={dateStr}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                  <div className="font-bold text-xs sm:text-sm text-slate-200 capitalize">
                    {dayFormatted}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Suma:</span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 font-extrabold text-xs border border-emerald-500/20 tabular-nums">
                      {formatHoursMins(daySum)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-800/50">
                  {items.map(rec => (
                    <div
                      key={rec.id}
                      className="py-2 flex items-center justify-between text-xs hover:bg-slate-800/30 px-1 rounded-lg transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="font-medium text-slate-300">
                          {formatTimeString(rec.startTimeMs)} &ndash; {formatTimeString(rec.endTimeMs)}
                        </span>
                        {rec.note && (
                          <span className="text-[11px] text-slate-400 italic">
                            ({rec.note})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300 tabular-nums text-[11px]">
                          {formatHoursMins(rec.durationSeconds)}
                        </span>
                        <button
                          onClick={() => onDeleteRecord(rec.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                          title="Usuń ten wpis"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
