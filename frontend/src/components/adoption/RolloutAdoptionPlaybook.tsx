import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Calendar,
  CheckCircle2,
  Users,
  QrCode,
  ArrowRight,
  Shield,
  FileSpreadsheet,
  Download,
  Building,
} from 'lucide-react';

export const RolloutAdoptionPlaybook: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'adoption_note' | 'migration_tool' | 'training' | 'posters'>('adoption_note');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSimulateCSVImport = () => {
    setImportStatus('Validating 856 rows from "Campus_Roster_2024_Legacy.xlsx"...');
    setTimeout(() => {
      setImportStatus('Successfully normalized and imported 856 student profiles, 428 hostel rooms, and 4 trade dispatch queues into FretOps Central!');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Playbook Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xs uppercase tracking-widest text-indigo-600 font-semibold">
              Institutional Strategy Deliverable
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">PRD Section 6 Compliance</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Campus Rollout & Legacy Migration Playbook
          </h1>
          <p className="text-xs text-slate-500">
            Strategy for shifting university habits from Excel registers and WhatsApp groups into an automated zero-queue platform.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {[
            { id: 'adoption_note', label: 'Adoption Note', icon: FileText },
            { id: 'migration_tool', label: 'Legacy Data Ingestion', icon: FileSpreadsheet },
            { id: 'training', label: 'Staff Training Syllabus', icon: Calendar },
            { id: 'posters', label: 'Hostel Door QR Kits', icon: QrCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: THE FORMAL ADOPTION NOTE */}
      {activeSection === 'adoption_note' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Institutional Adoption Note: Decommissioning WhatsApp & Excel Registers
              </h2>
              <div className="text-xs text-slate-500 mt-1">
                Author: Campus Operations Architecture Team · Target: Vice Chancellors, Deans & Chief Wardens
              </div>
            </div>

            <section className="space-y-2 text-xs leading-relaxed text-slate-700">
              <h3 className="font-bold text-sm text-slate-900">1. The Root Behavioral Challenge</h3>
              <p>
                Universities do not fail to adopt software because the software lacks features; they fail because legacy habits (informal WhatsApp broadcast groups, handwritten paper gate registers, and fragmented Excel spreadsheets) provide immediate, albeit chaotic, comfort. A warden can write a note in 5 seconds; a student can post a complaint on a 500-person WhatsApp group.
              </p>
              <p>
                However, this creates severe institutional failure modes: tickets get lost in WhatsApp chatter, wardens spend 24/7 answering repetitive calls, emergency alerts get muted in group spam, and students wait in 45-minute physical queues during semester admissions and evening gate curfews.
              </p>
            </section>

            <section className="space-y-3 text-xs leading-relaxed text-slate-700">
              <h3 className="font-bold text-sm text-slate-900">2. The 4-Phase Migration Roadmap</h3>
              <div className="space-y-2">
                {[
                  {
                    phase: 'Phase 1: Automated Legacy Data Ingestion (Days 1–3)',
                    desc: 'Export existing registrar student rolls and hostel allocations into standardized CSV formats. Upload into FretOps with zero manual re-entry.',
                  },
                  {
                    phase: 'Phase 2: Grassroots Staff Onboarding with Regional UI (Days 4–7)',
                    desc: 'Train security guards and technicians using their native language interfaces (Hindi, Telugu, Tamil, Marathi). Remove all typing—actions are strictly 1-touch QR scans or code verifications.',
                  },
                  {
                    phase: 'Phase 3: Physical Friction Removal via Door QR Kits (Week 2)',
                    desc: 'Deploy printable smart QR stickers on all 428 hostel bedroom doors. Students scan their room sticker to report broken fans or check mess tokens, eliminating the need to look up portal URLs.',
                  },
                  {
                    phase: 'Phase 4: Official Cutover & WhatsApp Group Sunsetting (Week 3)',
                    desc: 'Deactivate chat permissions on legacy WhatsApp broadcast groups. Official circulars, leave approvals, and night curfew roll calls are routed exclusively through FretOps.',
                  },
                ].map((p, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="font-bold text-slate-900">{p.phase}</div>
                    <div className="text-slate-600 mt-0.5">{p.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-2 text-xs leading-relaxed text-slate-700">
              <h3 className="font-bold text-sm text-slate-900">3. Incentive Alignment: Why Each Persona Adopts FretOps</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>
                  <strong>For Wardens:</strong> The automated 10:30 PM Night Report confirms all students have eaten and checked in, eliminating nighttime door-to-door roll calls so wardens can rest.
                </li>
                <li>
                  <strong>For Technicians:</strong> Issue deduplication combines 14 repetitive Wi-Fi complaints into 1 master job, preventing duplicate visits to the same floor.
                </li>
                <li>
                  <strong>For Students:</strong> Zero queues. Gate passes, room choices, and mess tokens are processed on their phone in under 15 seconds.
                </li>
              </ul>
            </section>
          </div>

          {/* Quick Metrics & Highlights */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Projected Institutional Impact
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold font-mono text-white tabular-nums">0 Minutes</div>
                  <div className="text-xs text-slate-400">Physical gate pass queue wait time (down from 45 min)</div>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">100%</div>
                  <div className="text-xs text-slate-400">Student safety accountability at 10:30 PM curfew</div>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-2xl font-bold font-mono text-indigo-300 tabular-nums">72%</div>
                  <div className="text-xs text-slate-400">Reduction in repetitive maintenance ticket volume via deduplication</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">Download Official Policy Draft</h4>
              <p className="text-slate-500">
                Download the standardized institutional circular announcing the transition from WhatsApp to FretOps.
              </p>
              <button
                onClick={() => alert('Campus Migration Policy Circular PDF generated and saved.')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Adoption Circular (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LEGACY DATA INGESTION TOOL */}
      {activeSection === 'migration_tool' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Legacy Excel / CSV Roster Ingestion Engine
            </h2>
            <p className="text-xs text-slate-500">
              Bulk upload legacy admission files, room registers, and staff directory into FretOps schema with automated deduplication.
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center space-y-3 bg-slate-50">
            <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
            <div className="text-xs font-semibold text-slate-800">
              Drag and drop legacy "Hostel_Roster_2024.csv" or click to browse
            </div>
            <div className="text-2xs text-slate-500">
              Supports .XLSX, .CSV with columns: RollNumber, StudentName, Block, Room, ParentContact, Trade
            </div>
            <button
              onClick={handleSimulateCSVImport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-md shadow-xs cursor-pointer transition-colors"
            >
              Load Sample Legacy University Roster (856 records)
            </button>
          </div>

          {importStatus && (
            <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Legacy vs Modern Schema Comparison */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Automated Schema Normalization
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="font-bold text-slate-700">Legacy Physical Register Columns</span>
                <p className="text-2xs text-slate-500 font-mono">
                  `Student_Name`, `Room_No`, `Out_Sign`, `In_Sign`, `Parent_Mob`, `Mess_Card_No`
                </p>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg space-y-1">
                <span className="font-bold text-indigo-900">FretOps Normalized Target Schema</span>
                <p className="text-2xs text-indigo-700 font-mono">
                  `rollNumber`, `hostelBlock`, `roomNumber`, `dynamicQRHash`, `nightCurfewStatus`, `smsConsentToken`
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: STAFF TRAINING SYLLABUS */}
      {activeSection === 'training' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              5-Day Campus Staff Adaptation Workshop Curriculum
            </h2>
            <p className="text-xs text-slate-500">
              Practical, hands-on training to guarantee 100% operational readiness across all campus support staff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {[
              {
                day: 'Day 1: Security Guards',
                focus: 'Gate Verification & Offline Scanning',
                topics: [
                  'Using native language interface (Hindi / Telugu / Tamil)',
                  'One-touch Exit and Entry logging',
                  'Handling students with uncharged phones via Kiosk Slip',
                ],
              },
              {
                day: 'Day 2: Technicians & Trades',
                focus: 'Direct Routing & Deduplication',
                topics: [
                  'Receiving work orders directly without warden delay',
                  'Resolving master clustered tickets (Wi-Fi outages)',
                  'Updating repair notes with spare parts logged',
                ],
              },
              {
                day: 'Day 3: Mess & Cafeteria',
                focus: 'Token Validation & Meal Waste',
                topics: [
                  'Fast dining hall QR scan to confirm student presence',
                  'Managing late-night cafeteria in-room delivery orders',
                  'Viewing live student dietary satisfaction sentiment',
                ],
              },
              {
                day: 'Day 4: Hostel Wardens',
                focus: '10:30 PM Curfew & Night Peace',
                topics: [
                  'Interpreting automated night roll call dashboard',
                  'Targeted circular broadcasts vs WhatsApp spam',
                  '1-click digital gate pass approval workflow',
                ],
              },
              {
                day: 'Day 5: Students & Kiosk',
                focus: 'Campus-Wide Zero-Queue Launch',
                topics: [
                  'Room booking & roommate preference matching',
                  'Submitting maintenance issues with upvoting',
                  'Testing emergency loud siren override drill',
                ],
              },
            ].map((d, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{d.day}</div>
                <div className="font-semibold text-slate-900 text-sm">{d.focus}</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-2xs pt-1">
                  {d.topics.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: HOSTEL DOOR QR POSTER KITS */}
      {activeSection === 'posters' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Hostel Room Door QR Kit Generator
              </h2>
              <p className="text-xs text-slate-500">
                Physical printed posters affixed to bedroom doors, allowing students to report issues or check mess menus in 3 seconds.
              </p>
            </div>
            <button
              onClick={() => alert('Print job sent to campus network printer for Block A (Rooms 301-340)!')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              Print Door Posters (PDF)
            </button>
          </div>

          {/* Simulated Printed Door Poster Preview */}
          <div className="max-w-md mx-auto p-6 bg-white border-2 border-slate-900 rounded-2xl shadow-xl text-center space-y-4">
            <div className="text-2xs uppercase tracking-widest font-bold text-indigo-600">
              FRETOPS DIGITAL CAMPUS · RAMANUJAN HOSTEL
            </div>

            <div className="py-1">
              <div className="text-3xl font-bold text-slate-900 font-mono">ROOM 304</div>
              <div className="text-xs text-slate-500">Block A · 3rd Floor · 2-Bed Residence</div>
            </div>

            {/* Smart Room QR Code */}
            <div className="mx-auto w-44 h-44 bg-slate-900 p-3 rounded-xl flex items-center justify-center">
              <div className="grid grid-cols-5 gap-1.5 w-full h-full p-2 bg-white rounded-lg">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      (i * 3 + 1) % 2 === 0 || i === 0 || i === 4 || i === 20 || i === 24
                        ? 'bg-slate-900'
                        : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-700">
              <div className="font-bold">Scan with any phone camera to:</div>
              <div className="text-2xs text-slate-500 space-y-0.5">
                <div>⚡ Log direct electrical / plumbing repair (Auto-fills Room 304)</div>
                <div>🍲 Order midnight cafeteria food delivery</div>
                <div>📋 Check current mess menu & rate food</div>
              </div>
            </div>

            <div className="text-3xs text-slate-400 font-mono pt-2 border-t border-slate-100">
              Zero Queues · Official University Operations System
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
