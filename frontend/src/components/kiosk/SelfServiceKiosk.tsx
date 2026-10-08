import React, { useState, useMemo } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import {
  ComplaintCategory,
  ComplaintPriority,
  ComplaintDomain,
  ClearanceItem,
  GatePass,
  isAcademicComplaint,
} from '../../types';
import {
  initialClearanceNodes,
  initialSemesterMarksheets,
} from '../../data/academicData';
import {
  Monitor,
  Printer,
  QrCode,
  Wrench,
  LogOut,
  CheckCircle2,
  Phone,
  Award,
  GraduationCap,
  Calendar,
  Building,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import kioskImg from '../../assets/images/campus_kiosk_terminal_1790190029128.jpg';

interface KioskStudent {
  name: string;
  roll: string;
  phone: string;
  fatherName: string;
  dob: string;
  branch: string;
  department: string;
  semester: string;
  academicYear: string;
  batch: string;
  room: string;
  block: string;
}

const PRELOADED_STUDENTS: Record<string, KioskStudent> = {
  '9090909090': {
    name: 'Anish Kumar Sharma',
    roll: '2024CS0842',
    phone: '9090909090',
    fatherName: 'Ramesh Chandra Sharma',
    dob: '15/08/2003',
    branch: 'B.Tech - Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    academicYear: '2024-2025',
    batch: '2022-2026',
    room: '204',
    block: 'Ramanujan Hostel (Block A)',
  },
  '5555555555': {
    name: 'Rahul Sharma',
    roll: '2024CS0102',
    phone: '5555555555',
    fatherName: 'Suresh Kumar Sharma',
    dob: '10/05/2003',
    branch: 'B.Tech - Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    academicYear: '2024-2025',
    batch: '2022-2026',
    room: '102',
    block: 'Ramanujan Hostel (Block A)',
  },
  '5555555556': {
    name: 'Priya Patel',
    roll: '2024EC0301',
    phone: '5555555556',
    fatherName: 'Mahesh Patel',
    dob: '22/11/2003',
    branch: 'B.Tech - Electronics & Communication',
    department: 'Electronics & Communication',
    semester: 'Semester 5',
    academicYear: '2024-2025',
    batch: '2022-2026',
    room: '301',
    block: 'Gargi Girls Hostel',
  },
  '9845122910': {
    name: 'Sneha Reddy',
    roll: '2024IT0215',
    phone: '9845122910',
    fatherName: 'K. V. Reddy',
    dob: '04/02/2004',
    branch: 'B.Tech - Information Technology',
    department: 'Information Technology',
    semester: 'Semester 5',
    academicYear: '2024-2025',
    batch: '2022-2026',
    room: '215',
    block: 'Aryabhatta Hostel',
  },
};

export const SelfServiceKiosk: React.FC = () => {
  const {
    gatePasses,
    requestGatePass,
    approveGatePass,
    logGateExit,
    complaints,
    createComplaint,
  } = useCampusOps();

  // Kiosk Authentication State (First step: Student enters Phone Number)
  const [inputPhone, setInputPhone] = useState('9090909090');
  const [authenticatedStudent, setAuthenticatedStudent] = useState<KioskStudent | null>(null);

  // Active Main Kiosk Tab
  const [activeKioskTab, setActiveKioskTab] = useState<'passes' | 'complaints' | 'certificates' | 'marks'>('passes');

  // Certificate sub-tab inside 'certificates'
  const [certSubTab, setCertSubTab] = useState<'bonafide' | 'nodue'>('bonafide');

  // Active Semester for Academic Marks tab
  const [selectedSemIndex, setSelectedSemIndex] = useState(0);

  // Permanent Day Pass Slip Visibility (Displayed strictly in Passes & Leave section)
  const [showPermanentPassSlip, setShowPermanentPassSlip] = useState(false);

  // Thermal Slip Dispenser State
  const [printedSlip, setPrintedSlip] = useState<{
    type: string;
    title: string;
    tokenCode: string;
    details: string;
    timestamp: string;
    isPass?: boolean;
    isCertificate?: boolean;
    certBodyHtml?: string;
  } | null>(null);

  // Notification / Alert message
  const [kioskNotice, setKioskNotice] = useState<string | null>(null);

  // -------------------------------------------------------------
  // LEAVE PASS REQUEST FORM STATE
  // -------------------------------------------------------------
  const [leaveReason, setLeaveReason] = useState('Out-of-Station Family Function & Medical Consultation');
  const [leaveDestination, setLeaveDestination] = useState('Bhubaneswar, Odisha');
  const [leaveOutTime, setLeaveOutTime] = useState('17:00');
  const [leaveInTime, setLeaveInTime] = useState('21:30');
  const [leaveDate, setLeaveDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [parentContact, setParentContact] = useState('+91 98451 22910');
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  // -------------------------------------------------------------
  // COMPLAINT LODGING STATE (Hostel vs Academic)
  // -------------------------------------------------------------
  const [complaintDomain, setComplaintDomain] = useState<ComplaintDomain>('hostel');
  const [complaintCategory, setComplaintCategory] = useState<ComplaintCategory>('electrical');
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintPriority, setComplaintPriority] = useState<ComplaintPriority>('medium');
  const [complaintSuccessNotice, setComplaintSuccessNotice] = useState('');

  // -------------------------------------------------------------
  // BONAFIDE CERTIFICATE FORM STATE
  // -------------------------------------------------------------
  const [bfFatherName, setBfFatherName] = useState('Ramesh Chandra Sharma');
  const [bfDob, setBfDob] = useState('15/08/2003');
  const [bfAcademicYear, setBfAcademicYear] = useState('2024-2025');
  const [bfSemester, setBfSemester] = useState('Semester 5');
  const [bfBatch, setBfBatch] = useState('2022-2026');
  const [bfPurpose, setBfPurpose] = useState('National Scholarship Portal (NSP) Merit Grant Application');
  const [generatedBonafide, setGeneratedBonafide] = useState<{
    certNumber: string;
    issueDate: string;
    token: string;
    studentName: string;
    fatherName: string;
    roll: string;
    branch: string;
    semester: string;
    academicYear: string;
    purpose: string;
    dob: string;
  } | null>(null);

  // -------------------------------------------------------------
  // NO DUE CERTIFICATE FORM STATE
  // -------------------------------------------------------------
  const [ndAcademicYear, setNdAcademicYear] = useState('2024-2025');
  const [ndSemester, setNdSemester] = useState('Semester 5');
  const [ndPurpose, setNdPurpose] = useState('Semester Examination Clearance & Grade Card Release');
  const [clearanceNodes] = useState<ClearanceItem[]>(initialClearanceNodes);
  const [generatedNoDue, setGeneratedNoDue] = useState<{
    certNumber: string;
    issueDate: string;
    token: string;
    studentName: string;
    roll: string;
    branch: string;
    semester: string;
    academicYear: string;
    purpose: string;
    nodes: ClearanceItem[];
  } | null>(null);

  // Keypad interaction for mobile number
  const handleKeypadPress = (val: string) => {
    if (val === 'CLEAR') {
      setInputPhone('');
    } else if (val === 'BACK') {
      setInputPhone((prev) => prev.slice(0, -1));
    } else {
      setInputPhone((prev) => (prev.length < 10 ? prev + val : prev));
    }
  };

  // Student Authentication via Phone Number
  const handleKioskLogin = (customPhone?: string) => {
    const phoneToUse = (customPhone || inputPhone).trim().replace(/\D/g, '');
    if (!phoneToUse) {
      setKioskNotice('Please enter a valid mobile number.');
      return;
    }

    if (PRELOADED_STUDENTS[phoneToUse]) {
      const stu = PRELOADED_STUDENTS[phoneToUse];
      setAuthenticatedStudent(stu);
      setBfFatherName(stu.fatherName);
      setBfDob(stu.dob);
      setBfAcademicYear(stu.academicYear);
      setBfSemester(stu.semester);
      setBfBatch(stu.batch);
      setParentContact(stu.phone.startsWith('+91') ? stu.phone : `+91 ${stu.phone}`);
    } else {
      // Dynamic profile creation for any entered phone number
      const rollSuffix = phoneToUse.slice(-4) || '1001';
      const dynStudent: KioskStudent = {
        name: `Student (${phoneToUse.slice(-4)})`,
        roll: `2024CS0${rollSuffix}`,
        phone: phoneToUse,
        fatherName: 'Guardian Name',
        dob: '01/01/2003',
        branch: 'B.Tech - Computer Science & Engineering',
        department: 'Computer Science & Engineering',
        semester: 'Semester 5',
        academicYear: '2024-2025',
        batch: '2022-2026',
        room: '204',
        block: 'Ramanujan Hostel (Block A)',
      };
      setAuthenticatedStudent(dynStudent);
      setBfFatherName(dynStudent.fatherName);
      setBfDob(dynStudent.dob);
    }
    setKioskNotice(null);
  };

  // -------------------------------------------------------------
  // PERMANENT DAY PASS HANDLERS (Displayed strictly in Passes & Leave section)
  // -------------------------------------------------------------
  const handlePrintPermanentDayPass = () => {
    if (!authenticatedStudent) return;
    setShowPermanentPassSlip(true);
    setKioskNotice('✓ Permanent Day Pass Slip generated with official gate security QR code.');
  };

  const handleDownloadPermanentPassPdf = () => {
    if (!authenticatedStudent) return;
    const qrPayload = `SAHAJ:PERMANENT_DAY_PASS:${authenticatedStudent.roll}:${authenticatedStudent.name}:${authenticatedStudent.block}:${authenticatedStudent.room}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrPayload)}`;

    const printWindow = window.open('', '_blank', 'width=620,height=820');
    if (!printWindow) {
      document.body.classList.add('printing-pass');
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-pass');
      }, 1000);
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Permanent Day Pass - ${authenticatedStudent.roll}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A5 portrait;
              margin: 6mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            body {
              background-color: #ffffff;
              color: #0f172a;
              display: flex;
              justify-content: center;
              padding: 12px;
            }
            .pass-card {
              width: 100%;
              max-width: 440px;
              border: 3px solid #0f172a;
              border-radius: 14px;
              padding: 18px;
              background: #ffffff;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }
            .inst-name {
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: #334155;
            }
            .pass-title {
              font-size: 16px;
              font-weight: 900;
              color: #047857;
              text-transform: uppercase;
              margin-top: 3px;
              letter-spacing: 0.04em;
            }
            .badge {
              display: inline-block;
              font-size: 9px;
              font-weight: 700;
              background: #ecfdf5;
              color: #065f46;
              border: 1px solid #a7f3d0;
              padding: 2px 8px;
              border-radius: 4px;
              margin-top: 4px;
              text-transform: uppercase;
            }
            .qr-section {
              text-align: center;
              background: #f8fafc;
              border: 1px dashed #cbd5e1;
              border-radius: 10px;
              padding: 12px;
              margin: 10px 0;
            }
            .qr-image {
              width: 165px;
              height: 165px;
              display: block;
              margin: 0 auto;
              border-radius: 6px;
            }
            .qr-instruction {
              font-size: 9px;
              font-weight: 700;
              color: #1e293b;
              margin-top: 6px;
              text-transform: uppercase;
              letter-spacing: 0.03em;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
              margin-top: 8px;
            }
            .details-table tr {
              border-bottom: 1px solid #e2e8f0;
            }
            .details-table td {
              padding: 5px 2px;
            }
            .label {
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              font-size: 9px;
              width: 36%;
            }
            .val {
              font-weight: 700;
              color: #0f172a;
            }
            .curfew-box {
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 6px 10px;
              margin-top: 10px;
              font-size: 10px;
              display: flex;
              justify-content: space-between;
              font-weight: 700;
            }
            .curfew-box span:last-child {
              color: #047857;
              font-family: monospace;
            }
            .barcode-section {
              text-align: center;
              border-top: 1px dashed #94a3b8;
              margin-top: 12px;
              padding-top: 8px;
            }
            .barcode-lines {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 2px;
              height: 24px;
            }
            .bar {
              background: #0f172a;
              height: 100%;
            }
            .barcode-token {
              font-family: monospace;
              font-size: 9px;
              font-weight: 700;
              color: #475569;
              margin-top: 3px;
            }
            .footer-sign {
              display: flex;
              justify-content: space-between;
              margin-top: 12px;
              padding-top: 8px;
              border-top: 1px solid #e2e8f0;
              font-size: 9px;
              color: #64748b;
            }
            .footer-sign div strong {
              display: block;
              color: #0f172a;
            }
            @media print {
              body {
                padding: 0;
              }
              .pass-card {
                border: 2px solid #000;
              }
            }
          </style>
        </head>
        <body>
          <div class="pass-card">
            <div class="header">
              <div class="inst-name">Biju Patnaik University of Technology · Campus Operations</div>
              <div class="pass-title">Official Permanent Student Day Pass</div>
              <div class="badge">Verified Admission Record · Valid All 4 Academic Years</div>
            </div>

            <div class="qr-section">
              <img src="${qrUrl}" alt="Security Guard QR Code" class="qr-image" />
              <div class="qr-instruction">Scan at Main Gate Scanner for Out/In Logging</div>
            </div>

            <table class="details-table">
              <tr>
                <td class="label">Student Name</td>
                <td class="val">${authenticatedStudent.name}</td>
              </tr>
              <tr>
                <td class="label">Roll / Reg No.</td>
                <td class="val" style="font-family: monospace; color: #4338ca;">${authenticatedStudent.roll}</td>
              </tr>
              <tr>
                <td class="label">Father / Guardian</td>
                <td class="val">${authenticatedStudent.fatherName}</td>
              </tr>
              <tr>
                <td class="label">Hostel & Room</td>
                <td class="val">${authenticatedStudent.block} · Room ${authenticatedStudent.room}</td>
              </tr>
              <tr>
                <td class="label">Branch / Dept</td>
                <td class="val">${authenticatedStudent.branch}</td>
              </tr>
              <tr>
                <td class="label">Mobile Number</td>
                <td class="val" style="font-family: monospace;">+91 ${authenticatedStudent.phone}</td>
              </tr>
            </table>

            <div class="curfew-box">
              <span>Standard Daily Curfew:</span>
              <span>06:00 AM — 10:30 PM DAILY</span>
            </div>

            <div class="barcode-section">
              <div class="barcode-lines">
                ${Array.from({ length: 32 })
                  .map((_, i) => `<div class="bar" style="width: ${(i * 3) % 2 === 0 ? '3px' : '1.5px'};"></div>`)
                  .join('')}
              </div>
              <div class="barcode-token">* PDP-${authenticatedStudent.roll}-PERM-2024 *</div>
            </div>

            <div class="footer-sign">
              <div>
                <strong>Chief Hostel Warden</strong>
                <span>Hostel Administration</span>
              </div>
              <div style="text-align: right;">
                <strong>Dean of Student Affairs</strong>
                <span>Registrar Seal Verified</span>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleSimulateGuardScan = () => {
    if (!authenticatedStudent) return;
    const qrPayload = `SAHAJ:PERMANENT_DAY_PASS:${authenticatedStudent.roll}:${authenticatedStudent.name}:${authenticatedStudent.block}:${authenticatedStudent.room}`;
    const result = logGateExit(qrPayload);
    if (result.success) {
      setKioskNotice(`✓ Gate Security Scan Verified: ${result.message}`);
    } else {
      setKioskNotice(`Gate Security Scan Notice: ${result.message}`);
    }
  };

  // -------------------------------------------------------------
  // REQUEST LEAVE PASS (Goes to Hostel Warden)
  // -------------------------------------------------------------
  const handleRequestLeavePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedStudent) return;
    setIsSubmittingPass(true);

    try {
      await requestGatePass({
        passType: 'long_leave',
        studentName: authenticatedStudent.name,
        rollNumber: authenticatedStudent.roll,
        hostelBlock: authenticatedStudent.block,
        roomNumber: authenticatedStudent.room,
        destination: leaveDestination,
        purpose: leaveReason,
        leaveDate,
        returnDate,
        outTime: leaveOutTime,
        expectedInTime: leaveInTime,
        parentPhone: parentContact,
        parentConsentVerified: true,
      });

      setKioskNotice('✓ Leave Pass Request submitted directly to Hostel Warden Desk! Status: Pending Approval.');
    } catch {
      setKioskNotice('Notice: Leave Pass recorded in local offline cache. Forwarded to Warden Desk.');
    } finally {
      setIsSubmittingPass(false);
    }
  };

  // Print Approved Leave Pass (One-Time Token with Barcode)
  const handlePrintApprovedLeaveSlip = (pass: GatePass) => {
    if (!authenticatedStudent) return;
    setPrintedSlip({
      type: 'AUTHORIZED ONE-TIME LEAVE PASS SLIP (WARDEN APPROVED)',
      title: `OUT-OF-STATION LEAVE CLEARANCE: ${pass.passCode}`,
      tokenCode: pass.passCode || `LV-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      details: `Student: ${authenticatedStudent.name} (${authenticatedStudent.roll}) · Room ${authenticatedStudent.room} · Dates: ${pass.leaveDate || 'Tomorrow'} to ${pass.returnDate || 'Next Day'} · Approved by: ${pass.approvedBy || 'Hostel Warden Office'} · Present to Gate Security Officer`,
      timestamp: new Date().toLocaleTimeString(),
      isPass: true,
    });
    setKioskNotice(`✓ Official Leave Pass ${pass.passCode} printed! Show to gate security guard.`);
  };

  // -------------------------------------------------------------
  // LODGE COMPLAINT (Hostel -> Warden vs Academic -> HOD)
  // -------------------------------------------------------------
  const handleLodgeComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedStudent || !complaintTitle.trim()) return;

    const isAcad = complaintDomain === 'academic';

    const created = createComplaint({
      domain: complaintDomain,
      category: complaintCategory,
      title: complaintTitle,
      description: complaintDesc || (isAcad ? 'Academic issue registered via lobby kiosk.' : 'Hostel maintenance issue registered via lobby kiosk.'),
      studentName: authenticatedStudent.name,
      rollNumber: authenticatedStudent.roll,
      roomNumber: isAcad ? `${authenticatedStudent.department} Dept` : authenticatedStudent.room,
      hostelBlock: isAcad ? 'Academic Complex' : authenticatedStudent.block,
      department: authenticatedStudent.department,
      priority: complaintPriority,
    });

    const successMsg = isAcad
      ? `Academic Grievance registered (${created.ticketNumber})! Forwarded directly to Head of Department (HOD) desk.`
      : `Hostel Maintenance registered (${created.ticketNumber})! Forwarded directly to Hostel Warden desk for technician dispatch.`;

    setComplaintSuccessNotice(successMsg);
    setPrintedSlip({
      type: isAcad ? 'ACADEMIC GRIEVANCE ACKNOWLEDGMENT SLIP' : 'HOSTEL REPAIR REQUISITION SLIP',
      title: `${created.ticketNumber} · ${complaintTitle}`,
      tokenCode: created.ticketNumber,
      details: `Target Desk: ${isAcad ? 'Head of Department (HOD)' : 'Hostel Warden'} · Category: ${complaintCategory} · Priority: ${complaintPriority.toUpperCase()} · Student: ${authenticatedStudent.name} (${authenticatedStudent.roll})`,
      timestamp: new Date().toLocaleTimeString(),
    });

    setComplaintTitle('');
    setComplaintDesc('');
    setTimeout(() => {
      setComplaintSuccessNotice('');
    }, 4000);
  };

  // -------------------------------------------------------------
  // GENERATE BONAFIDE CERTIFICATE
  // -------------------------------------------------------------
  const handleGenerateBonafide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedStudent) return;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const certNum = `BPUT/CERT/2024/BF-${randomNum}`;
    const token = `BPUT-VERIFIED-BF-${randomNum}-SHA256-${authenticatedStudent.roll}`;

    const certData = {
      certNumber: certNum,
      issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      token,
      studentName: authenticatedStudent.name,
      fatherName: bfFatherName || authenticatedStudent.fatherName,
      roll: authenticatedStudent.roll,
      branch: authenticatedStudent.branch,
      semester: bfSemester,
      academicYear: bfAcademicYear,
      purpose: bfPurpose,
      dob: bfDob || authenticatedStudent.dob,
    };

    setGeneratedBonafide(certData);
    setPrintedSlip({
      type: 'OFFICIAL UNIVERSITY BONAFIDE CERTIFICATE',
      title: `BONAFIDE CERTIFICATE · ${certNum}`,
      tokenCode: token,
      details: `Student: ${authenticatedStudent.name} (S/D of ${certData.fatherName}) · Reg: ${authenticatedStudent.roll} · Course: ${authenticatedStudent.branch} · Purpose: ${bfPurpose} · Validated by Office of the Registrar`,
      timestamp: new Date().toLocaleTimeString(),
      isCertificate: true,
    });
    setKioskNotice('✓ Bonafide Certificate generated and dispensed at thermal printer!');
  };

  // -------------------------------------------------------------
  // GENERATE NO DUE CERTIFICATE
  // -------------------------------------------------------------
  const handleGenerateNoDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedStudent) return;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const certNum = `BPUT/CERT/2024/ND-${randomNum}`;
    const token = `BPUT-VERIFIED-NODUE-${randomNum}-SHA256-${authenticatedStudent.roll}`;

    const certData = {
      certNumber: certNum,
      issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      token,
      studentName: authenticatedStudent.name,
      roll: authenticatedStudent.roll,
      branch: authenticatedStudent.branch,
      semester: ndSemester,
      academicYear: ndAcademicYear,
      purpose: ndPurpose,
      nodes: clearanceNodes,
    };

    setGeneratedNoDue(certData);
    setPrintedSlip({
      type: 'OFFICIAL ALL-DEPARTMENT NO DUE CERTIFICATE',
      title: `NO DUE CLEARANCE CERTIFICATE · ${certNum}`,
      tokenCode: token,
      details: `Student: ${authenticatedStudent.name} (${authenticatedStudent.roll}) · All 5 Departments Cleared (Hostel, Library, Lab, Sports, Accounts) · Authorized by Dean of Academic Affairs`,
      timestamp: new Date().toLocaleTimeString(),
      isCertificate: true,
    });
    setKioskNotice('✓ No Due Certificate generated with 5 department clearances and dispensed!');
  };

  // Print Marks Summary Slip
  const handlePrintMarksSlip = () => {
    if (!authenticatedStudent) return;
    const currentSem = initialSemesterMarksheets[selectedSemIndex] || initialSemesterMarksheets[0];
    setPrintedSlip({
      type: 'SEMESTER GRADE SUMMARY & EVALUATION REPORT',
      title: `ACADEMIC MARKSHEET: ${currentSem.semesterName}`,
      tokenCode: `GPA-SGPA-${currentSem.sgpa}-CGPA-${currentSem.cgpa}`,
      details: `Student: ${authenticatedStudent.name} (${authenticatedStudent.roll}) · Branch: ${authenticatedStudent.branch} · SGPA: ${currentSem.sgpa} · CGPA: ${currentSem.cgpa} · Total Earned Credits: ${currentSem.earnedCredits}/${currentSem.totalCredits} · Status: ${currentSem.resultStatus}`,
      timestamp: new Date().toLocaleTimeString(),
    });
    setKioskNotice(`✓ Academic Marks Summary Slip (${currentSem.semesterName}) dispensed at thermal printer.`);
  };

  // Student's leave passes
  const studentLeavePasses = useMemo(() => {
    if (!authenticatedStudent) return [];
    return gatePasses.filter(
      (p) =>
        (p.rollNumber?.toLowerCase() === authenticatedStudent.roll.toLowerCase() ||
          p.studentName?.toLowerCase() === authenticatedStudent.name.toLowerCase() ||
          (p.parentPhone && p.parentPhone.includes(authenticatedStudent.phone))) &&
        (p.passType === 'long_leave' || p.passType === 'weekend_leave')
    );
  }, [gatePasses, authenticatedStudent]);

  // Student's complaints
  const studentComplaints = useMemo(() => {
    if (!authenticatedStudent) return [];
    return complaints.filter(
      (c) =>
        c.rollNumber?.toLowerCase() === authenticatedStudent.roll.toLowerCase() ||
        c.studentName?.toLowerCase() === authenticatedStudent.name.toLowerCase()
    );
  }, [complaints, authenticatedStudent]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Airport Kiosk Outer Shell Container */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-8 shadow-2xl border-4 border-slate-700">
        {/* Kiosk Top HUD */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg ring-2 ring-indigo-400/20">
              <Monitor className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-2xs uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                HARDWARE FALLBACK SELF-SERVICE HELP DESK
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Sahaj Campus Self-Service Kiosk
              </h1>
              <p className="text-2xs text-slate-400">
                Lobby Terminal #04 · Ramanujan & Gargi Hostel Corridor · Touchscreen Enabled
              </p>
            </div>
          </div>

          <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
            <div className="text-2xs font-mono text-slate-400">STATUS: ACTIVE HARDWARE NODE</div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <Printer className="w-3.5 h-3.5" />
              Thermal Slip Printer Ready
            </div>
          </div>
        </div>

        {/* Global Kiosk Alert Banner */}
        {kioskNotice && (
          <div className="mt-4 p-3 bg-indigo-950/80 border border-indigo-500/50 rounded-xl text-indigo-200 text-xs font-medium flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{kioskNotice}</span>
            </div>
            <button
              onClick={() => setKioskNotice(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: PHONE NUMBER ENTRY LOGIN (When not authenticated) */}
        {/* ========================================================================= */}
        {!authenticatedStudent ? (
          <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Instructions and Display */}
            <div className="md:col-span-7 space-y-4">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex items-center gap-3">
                <img
                  src={kioskImg}
                  alt="Campus Kiosk Terminal"
                  className="w-16 h-16 rounded-lg object-cover border border-slate-600 shrink-0"
                />
                <div>
                  <h2 className="text-sm font-bold text-white">Student Identification</h2>
                  <p className="text-2xs text-slate-300 mt-1 leading-relaxed">
                    Forgot your smartphone or low battery? Enter your registered <strong>10-digit mobile number</strong> to access passes, lodge complaints, request certificates, and check marks.
                  </p>
                </div>
              </div>

              {/* Number Display Box */}
              <div className="bg-slate-800 p-5 rounded-2xl border-2 border-indigo-500/40 shadow-inner space-y-1">
                <div className="flex items-center justify-between text-2xs uppercase tracking-wider font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    Student Mobile Number
                  </span>
                  <span className="text-indigo-400 font-mono">{inputPhone.length}/10 Digits</span>
                </div>
                <div className="min-h-[44px] flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-indigo-400 select-none">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputPhone.length === 10) {
                        handleKioskLogin();
                      }
                    }}
                    placeholder="9090909090"
                    className="w-full bg-transparent text-2xl sm:text-3xl font-mono font-bold tracking-widest text-indigo-200 outline-none placeholder:text-slate-600 placeholder:tracking-normal placeholder:font-normal placeholder:text-xl"
                  />
                </div>
              </div>

              {/* Quick Demo Preload Buttons */}
              <div className="space-y-1.5">
                <div className="text-3xs uppercase tracking-wider text-slate-400 font-semibold">
                  Quick Demo Student Numbers (Tap to Auto-Fill):
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(PRELOADED_STUDENTS).map(([phone, stu]) => (
                    <button
                      key={phone}
                      type="button"
                      onClick={() => {
                        setInputPhone(phone);
                        handleKioskLogin(phone);
                      }}
                      className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500 rounded-lg text-left cursor-pointer transition-all"
                    >
                      <div className="font-bold text-white text-2xs truncate">{stu.name}</div>
                      <div className="text-3xs font-mono text-indigo-300">{phone} · {stu.roll}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleKioskLogin()}
                disabled={inputPhone.length < 10}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Verify Mobile & Open Kiosk Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right Column: Tactile Numeric Touch Keypad */}
            <div className="md:col-span-5 bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3">
              <div className="text-center text-2xs uppercase tracking-wider text-slate-400 font-bold pb-1 border-b border-slate-700">
                Touch Keypad
              </div>
              <div className="grid grid-cols-3 gap-2.5 text-base font-bold font-mono">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((key) => {
                  const isAction = key === 'CLEAR' || key === 'BACK';
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleKeypadPress(key)}
                      className={`h-14 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 ${isAction
                          ? key === 'CLEAR'
                            ? 'bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/60 text-xs font-sans font-bold'
                            : 'bg-amber-950/40 text-amber-300 border border-amber-800/40 hover:bg-amber-900/60 text-xs font-sans font-bold'
                          : 'bg-slate-700 hover:bg-slate-600 active:bg-indigo-600 text-white border border-slate-600'
                        }`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
              <div className="text-3xs text-center text-slate-400 pt-1">
                Touch numbers to type your mobile number · 10 digits required
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* STEP 2: AUTHENTICATED KIOSK DASHBOARD */
          /* ========================================================================= */
          <div className="py-6 space-y-6">
            {/* Student Identity Banner */}
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center font-bold text-indigo-300 text-lg">
                  {authenticatedStudent.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      VERIFIED STUDENT PROFILE
                    </span>
                    <span className="text-3xs font-mono text-slate-400">· +91 {authenticatedStudent.phone}</span>
                  </div>
                  <div className="text-lg font-bold text-white leading-tight">
                    {authenticatedStudent.name}{' '}
                    <span className="font-mono text-indigo-300 text-sm font-semibold">
                      ({authenticatedStudent.roll})
                    </span>
                  </div>
                  <div className="text-2xs text-slate-400 mt-0.5">
                    Room {authenticatedStudent.room} · {authenticatedStudent.block} · {authenticatedStudent.branch}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAuthenticatedStudent(null);
                  setShowPermanentPassSlip(false);
                  setPrintedSlip(null);
                  setKioskNotice(null);
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-rose-900/60 border border-slate-600 hover:border-rose-500/50 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Exit Kiosk Session
              </button>
            </div>

            {/* Main Navigation Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
              {[
                { id: 'passes', label: 'Passes & Leave', icon: QrCode, badge: 'Permanent + Leave' },
                { id: 'complaints', label: 'Complaints Section', icon: Wrench, badge: 'Warden / HOD' },
                { id: 'certificates', label: 'Request Certificates', icon: Award, badge: 'Bonafide & No-Due' },
                { id: 'marks', label: 'Academic Marks', icon: GraduationCap, badge: 'Faculty Uploads' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeKioskTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveKioskTab(tab.id as any);
                      setPrintedSlip(null);
                    }}
                    className={`p-3 rounded-lg text-left cursor-pointer transition-all flex flex-col justify-between ${isActive
                        ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/40'
                        : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="font-bold text-xs">{tab.label}</span>
                    </div>
                    <span className={`text-3xs mt-1 font-mono font-medium ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: PASSES & LEAVE (Permanent Day Pass Print + Request Leave Pass) */}
            {/* ========================================================================= */}
            {activeKioskTab === 'passes' && (
              <div className="space-y-6">
                {/* 1. Permanent Day Pass Section */}
                <div className="p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded">
                          Admission Entitlement
                        </span>
                        <h3 className="text-base font-bold text-white">Permanent Day Pass</h3>
                      </div>
                      <p className="text-2xs text-slate-400 mt-1">
                        Given to every student at admission time. Authorizes regular daily campus outing (06:00 to 22:30). Print a physical thermal copy anytime here without a smartphone.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePrintPermanentDayPass}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap self-start sm:self-auto"
                    >
                      <Printer className="w-4 h-4" />
                      Print Permanent Day Pass Slip
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800 font-mono">
                    <div>
                      <span className="text-3xs text-slate-500 block uppercase">Policy Validity</span>
                      <span className="text-white font-semibold">Four-Year B.Tech Tenancy</span>
                    </div>
                    <div>
                      <span className="text-3xs text-slate-500 block uppercase">Standard In/Out Window</span>
                      <span className="text-emerald-400 font-semibold">06:00 AM — 10:30 PM Daily</span>
                    </div>
                    <div>
                      <span className="text-3xs text-slate-500 block uppercase">Gate Security Scanner</span>
                      <span className="text-indigo-400 font-semibold">Barcode & QR Auto-Matched</span>
                    </div>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* EXCLUSIVE PERMANENT DAY PASS SLIP (Rendered ONLY in Passes & Leave tab) */}
                {/* ========================================================================= */}
                {showPermanentPassSlip && authenticatedStudent && (
                  <div
                    id="printable-permanent-pass"
                    className="p-6 bg-white text-slate-900 rounded-2xl shadow-2xl border-4 border-emerald-600 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 relative"
                  >
                    {/* Card Header & Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-900 pb-3">
                      <div>
                        <div className="text-2xs font-extrabold uppercase tracking-widest text-slate-600">
                          BIJU PATNAIK UNIVERSITY OF TECHNOLOGY · CAMPUS OPERATIONS
                        </div>
                        <h3 className="text-base font-extrabold text-emerald-800 tracking-tight flex items-center gap-1.5 mt-0.5">
                          <QrCode className="w-5 h-5 text-emerald-600 shrink-0" />
                          OFFICIAL PERMANENT STUDENT DAY PASS
                        </h3>
                        <span className="inline-block mt-1 text-3xs font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Verified Admission Record · Valid All 4 Academic Years
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                        <button
                          type="button"
                          onClick={handleSimulateGuardScan}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300 text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Simulate security guard scanning this QR code at the main gate"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Test Guard Scan</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDownloadPermanentPassPdf}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Download pass as PDF or print only this pass"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Download Pass (PDF)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowPermanentPassSlip(false)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 text-xs font-bold cursor-pointer"
                          title="Close Pass Slip"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Body: QR Code + Student Details */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      {/* QR Code Container */}
                      <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-center">
                        <div className="w-44 h-44 bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                              `SAHAJ:PERMANENT_DAY_PASS:${authenticatedStudent.roll}:${authenticatedStudent.name}:${authenticatedStudent.block}:${authenticatedStudent.room}`
                            )}`}
                            alt="Permanent Day Pass Security QR Code"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="mt-2 text-2xs font-extrabold uppercase tracking-wide text-slate-800">
                          Gate Security Scannable QR
                        </div>
                        <div className="text-3xs text-slate-500 mt-0.5">
                          Contains student details for gate security terminal
                        </div>
                      </div>

                      {/* Student Details Grid */}
                      <div className="md:col-span-8 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-3xs text-slate-500 uppercase font-bold block">Student Full Name</span>
                            <span className="font-bold text-slate-900 text-sm truncate block">{authenticatedStudent.name}</span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-3xs text-slate-500 uppercase font-bold block">University Registration No.</span>
                            <span className="font-mono font-bold text-indigo-700 text-sm block">{authenticatedStudent.roll}</span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-3xs text-slate-500 uppercase font-bold block">Father / Guardian</span>
                            <span className="font-semibold text-slate-800 text-xs truncate block">{authenticatedStudent.fatherName}</span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-3xs text-slate-500 uppercase font-bold block">Hostel & Room</span>
                            <span className="font-semibold text-slate-800 text-xs block">
                              {authenticatedStudent.block} · Rm {authenticatedStudent.room}
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
                            <span className="text-3xs text-slate-500 uppercase font-bold block">Branch & Department</span>
                            <span className="font-semibold text-slate-800 text-xs block">{authenticatedStudent.branch}</span>
                          </div>
                        </div>

                        {/* Curfew window */}
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs font-semibold text-emerald-900">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Curfew Outing Window:</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-800">06:00 AM — 10:30 PM DAILY</span>
                        </div>
                      </div>
                    </div>

                    {/* Barcode & Token */}
                    <div className="pt-3 border-t border-dashed border-slate-300 text-center space-y-1">
                      <div className="flex justify-center items-center gap-1 h-7 opacity-80">
                        {Array.from({ length: 38 }).map((_, i) => (
                          <div
                            key={i}
                            className={`bg-slate-900 h-full ${(i * 3) % 2 === 0 ? 'w-1.5' : (i * 5) % 3 === 0 ? 'w-1' : 'w-0.5'}`}
                          />
                        ))}
                      </div>
                      <div className="font-mono text-2xs text-slate-600 font-bold">
                        * PDP-{authenticatedStudent.roll}-PERM-2024 * (Permanent Admission Token)
                      </div>
                    </div>

                    {/* Institutional Sign-off Footer */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-3xs text-slate-500">
                      <div>
                        <span className="font-bold text-slate-800">Hostel Administration Office</span> · Chief Warden Record
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800">Registrar & Student Affairs</span> · Verified Admission Pass
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
                  <div className="border-b border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-700/40 px-2 py-0.5 rounded">
                        Requires Warden Approval
                      </span>
                      <h3 className="text-base font-bold text-white">Request Out-of-Station Leave Pass</h3>
                    </div>
                    <p className="text-2xs text-slate-400 mt-1">
                      For long leaves, overnight home visits, or weekend travel. Once submitted, your request routes directly to the <strong>Hostel Warden</strong>. Upon Warden approval, a unique one-time leave pass code is generated for gate security exit.
                    </p>
                  </div>

                  <form onSubmit={handleRequestLeavePass} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Reason / Purpose of Leave</label>
                        <input
                          type="text"
                          required
                          value={leaveReason}
                          onChange={(e) => setLeaveReason(e.target.value)}
                          placeholder="e.g. Brother's wedding, medical checkup, home visit..."
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Destination Address / City</label>
                        <input
                          type="text"
                          required
                          value={leaveDestination}
                          onChange={(e) => setLeaveDestination(e.target.value)}
                          placeholder="e.g. Cuttack, Odisha / Home Address"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Date of Leave</label>
                        <input
                          type="date"
                          required
                          value={leaveDate}
                          onChange={(e) => setLeaveDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Departure Time</label>
                        <input
                          type="text"
                          required
                          value={leaveOutTime}
                          onChange={(e) => setLeaveOutTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Date of Return</label>
                        <input
                          type="date"
                          required
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Expected In Time</label>
                        <input
                          type="text"
                          required
                          value={leaveInTime}
                          onChange={(e) => setLeaveInTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Parent / Guardian Phone (SMS Verification)
                      </label>
                      <input
                        type="text"
                        required
                        value={parentContact}
                        onChange={(e) => setParentContact(e.target.value)}
                        className="w-full sm:w-1/2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none font-mono"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                      <span className="text-3xs text-amber-400">
                        ⚡ Out-of-station leave requires Hostel Warden verification before one-time gate pass generation.
                      </span>
                      <button
                        type="submit"
                        disabled={isSubmittingPass}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>{isSubmittingPass ? 'Submitting...' : 'Submit Leave Request to Warden'}</span>
                      </button>
                    </div>
                  </form>

                  {/* List of Leave Pass Requests & Print Status */}
                  <div className="pt-4 border-t border-slate-700 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Your Leave Pass Requests & Warden Approvals
                    </h4>

                    {studentLeavePasses.length === 0 ? (
                      <div className="text-2xs text-slate-500 py-2">
                        No previous leave passes requested. Submit the form above to request leave.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {studentLeavePasses.map((pass) => {
                          const isApproved = pass.status === 'approved';
                          return (
                            <div
                              key={pass.id}
                              className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isApproved
                                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                                  : 'bg-slate-900/60 border-slate-700 text-slate-300'
                                }`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-white text-xs">{pass.passCode}</span>
                                  <span
                                    className={`text-3xs uppercase font-bold px-1.5 py-0.5 rounded ${isApproved
                                        ? 'bg-emerald-500 text-slate-950'
                                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      }`}
                                  >
                                    {isApproved ? 'Warden Approved' : 'Pending Warden Review'}
                                  </span>
                                </div>
                                <div className="text-2xs text-slate-400">
                                  {pass.purpose} · Dates: {pass.leaveDate || 'Upcoming'} to {pass.returnDate || 'Return'}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {!isApproved && (
                                  <button
                                    type="button"
                                    onClick={() => approveGatePass(pass.id, 'Hostel Warden')}
                                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-2xs font-bold rounded cursor-pointer"
                                    title="Demo: simulate warden approving request"
                                  >
                                    ⚡ Simulate Warden 1-Click Approval
                                  </button>
                                )}

                                {isApproved && (
                                  <button
                                    type="button"
                                    onClick={() => handlePrintApprovedLeaveSlip(pass)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-xs cursor-pointer"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Print One-Time Leave Pass</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: COMPLAINTS REDRESSAL (Hostel -> Warden vs Academic -> HOD) */}
            {/* ========================================================================= */}
            {activeKioskTab === 'complaints' && (
              <div className="space-y-6">
                <div className="p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
                  <div className="border-b border-slate-700 pb-3">
                    <h3 className="text-base font-bold text-white">Lodge Student Grievance or Requisition</h3>
                    <p className="text-2xs text-slate-400 mt-1">
                      Choose the issue domain below. Hostel maintenance complaints route to the <strong>Hostel Warden</strong>, while academic issues route directly to your <strong>Head of Department (HOD)</strong>.
                    </p>
                  </div>

                  {complaintSuccessNotice && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{complaintSuccessNotice}</span>
                    </div>
                  )}

                  <form onSubmit={handleLodgeComplaint} className="space-y-4 text-xs">
                    {/* Step 1: Choose Domain (Hostel vs Academic) */}
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">
                        Select Complaint Destination Desk:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setComplaintDomain('hostel');
                            setComplaintCategory('electrical');
                          }}
                          className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${complaintDomain === 'hostel'
                              ? 'border-indigo-500 bg-indigo-950/50 text-white shadow-md'
                              : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                            }`}
                        >
                          <div className="flex items-center gap-2 text-sm font-bold text-indigo-300">
                            <Building className="w-4 h-4" />
                            <span>1. Hostel Related Issue</span>
                          </div>
                          <div className="text-2xs text-slate-300 mt-1">
                            Routes to <strong>Hostel Warden Desk</strong> for electrician, plumber, carpenter, Wi-Fi or housekeeping dispatch.
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setComplaintDomain('academic');
                            setComplaintCategory('academic_lab');
                          }}
                          className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${complaintDomain === 'academic'
                              ? 'border-emerald-500 bg-emerald-950/50 text-white shadow-md'
                              : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                            }`}
                        >
                          <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                            <GraduationCap className="w-4 h-4" />
                            <span>2. Academics Related Issue</span>
                          </div>
                          <div className="text-2xs text-slate-300 mt-1">
                            Routes directly to <strong>Head of Department (HOD)</strong> for lab workstation, marksheets, timetable, notes, or attendance.
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Step 2: Specific Categories */}
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">
                        {complaintDomain === 'hostel' ? 'Hostel Maintenance Trade:' : 'Academic Grievance Category:'}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {complaintDomain === 'hostel'
                          ? [
                            { id: 'electrical', label: '⚡ Electrical (Fan, Light, Socket)' },
                            { id: 'plumbing', label: '🚰 Plumbing (Tap, Geyser, Drain)' },
                            { id: 'wifi', label: '📶 Wi-Fi / LAN Network Outage' },
                            { id: 'carpentry', label: '🪑 Carpentry (Door Lock, Bed, Table)' },
                            { id: 'ac', label: '❄️ AC / HVAC Cooling' },
                            { id: 'cleaning', label: '🧹 Housekeeping & Hygiene' },
                          ].map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setComplaintCategory(c.id as ComplaintCategory)}
                              className={`p-2 rounded-lg border text-left text-2xs cursor-pointer transition-colors ${complaintCategory === c.id
                                  ? 'border-indigo-400 bg-indigo-900/60 text-white font-bold'
                                  : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                              {c.label}
                            </button>
                          ))
                          : [
                            { id: 'academic_lab', label: '🖥️ Lab Workstations & Tools' },
                            { id: 'academic_exam', label: '📝 Exam Marks & Evaluations' },
                            { id: 'academic_faculty', label: '👨‍🏫 Timetable & Lectures' },
                            { id: 'academic_notes', label: '📚 LMS Materials & Notes' },
                            { id: 'academic_attendance', label: '⏱️ Biometric & Attendance' },
                            { id: 'academic_library', label: '📖 Library & E-Resources' },
                          ].map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setComplaintCategory(c.id as ComplaintCategory)}
                              className={`p-2 rounded-lg border text-left text-2xs cursor-pointer transition-colors ${complaintCategory === c.id
                                  ? 'border-emerald-400 bg-emerald-900/60 text-white font-bold'
                                  : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                              {c.label}
                            </button>
                          ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-300 mb-1">Issue Summary / Title</label>
                        <input
                          type="text"
                          required
                          value={complaintTitle}
                          onChange={(e) => setComplaintTitle(e.target.value)}
                          placeholder={
                            complaintDomain === 'hostel'
                              ? 'e.g. Washroom tap leaking, ceiling fan regulator stuck'
                              : 'e.g. Lab 4 Workstation #12 GPU driver failure, Midterm marks total mismatch'
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Urgency Level</label>
                        <select
                          value={complaintPriority}
                          onChange={(e) => setComplaintPriority(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
                        >
                          <option value="low">Low (Standard)</option>
                          <option value="medium">Medium (Normal SLA)</option>
                          <option value="high">High (Urgent Attention)</option>
                          <option value="critical">Critical (Immediate Action)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Detailed Description</label>
                      <textarea
                        rows={2}
                        value={complaintDesc}
                        onChange={(e) => setComplaintDesc(e.target.value)}
                        placeholder="Provide details (room number, bench, course code, error observed) so the authority can act immediately..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-3xs text-slate-400">
                        {complaintDomain === 'academic'
                          ? 'Grievance will be routed directly to HOD Computer Science with automatic receipt generation.'
                          : 'Requisition will be placed in Warden Maintenance queue for technician assignment.'}
                      </span>
                      <button
                        type="submit"
                        className={`px-5 py-2.5 text-white font-bold rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-colors ${complaintDomain === 'academic'
                            ? 'bg-emerald-600 hover:bg-emerald-500'
                            : 'bg-indigo-600 hover:bg-indigo-500'
                          }`}
                      >
                        <Wrench className="w-4 h-4" />
                        <span>
                          {complaintDomain === 'academic' ? 'Submit Academic Grievance to HOD' : 'Submit Requisition to Warden'}
                        </span>
                      </button>
                    </div>
                  </form>

                  {/* Previous Grievances History */}
                  <div className="pt-4 border-t border-slate-700 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Your Registered Complaints & Status
                    </h4>
                    {studentComplaints.length === 0 ? (
                      <div className="text-2xs text-slate-500">No active complaints logged for your roll number.</div>
                    ) : (
                      <div className="space-y-2">
                        {studentComplaints.slice(0, 5).map((c) => {
                          const isAcad = isAcademicComplaint(c);
                          return (
                            <div
                              key={c.id}
                              className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-white">{c.ticketNumber}</span>
                                  <span
                                    className={`text-3xs uppercase font-bold px-1.5 py-0.5 rounded ${isAcad
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                                        : 'bg-blue-950 text-blue-300 border border-blue-700/50'
                                      }`}
                                  >
                                    {isAcad ? 'HOD Academic' : 'Warden Hostel'}
                                  </span>
                                  <span className="text-3xs text-slate-400 uppercase">{c.category}</span>
                                </div>
                                <div className="text-2xs font-semibold text-slate-200">{c.title}</div>
                              </div>
                              <div className="text-2xs font-semibold text-amber-300 uppercase">
                                {c.status.replace('_', ' ')}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: REQUEST CERTIFICATES (Bonafide Certificate + No Due Certificate) */}
            {/* ========================================================================= */}
            {activeKioskTab === 'certificates' && (
              <div className="space-y-6">
                {/* Sub-tab Switcher: Bonafide vs No Due */}
                <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setCertSubTab('bonafide')}
                    className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${certSubTab === 'bonafide'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>1. Bonafide Certificate Generator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCertSubTab('nodue')}
                    className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${certSubTab === 'nodue'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>2. No Due Clearance Certificate</span>
                  </button>
                </div>

                {/* 1. BONAFIDE CERTIFICATE FORM */}
                {certSubTab === 'bonafide' && (
                  <div className="p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
                    <div className="border-b border-slate-700 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-700/40 px-2 py-0.5 rounded">
                          Official University Document
                        </span>
                        <h3 className="text-base font-bold text-white">Generate Bonafide Certificate</h3>
                      </div>
                      <p className="text-2xs text-slate-400 mt-1">
                        Enter required student details as mandated for official Bonafide Certificate generation. Verified directly against the university enrollment roll with cryptographic QR seal.
                      </p>
                    </div>

                    <form onSubmit={handleGenerateBonafide} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-300 mb-1">Student Full Name</label>
                          <input
                            type="text"
                            required
                            readOnly
                            value={authenticatedStudent.name}
                            className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-slate-300 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-300 mb-1">
                            Father's / Guardian's Name <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={bfFatherName}
                            onChange={(e) => setBfFatherName(e.target.value)}
                            placeholder="e.g. Ramesh Chandra Sharma"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-300 mb-1">University Roll / Reg No</label>
                          <input
                            type="text"
                            required
                            readOnly
                            value={authenticatedStudent.roll}
                            className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-indigo-300 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-300 mb-1">Branch / Degree Program</label>
                          <input
                            type="text"
                            required
                            readOnly
                            value={authenticatedStudent.branch}
                            className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-slate-300 text-2xs truncate"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-300 mb-1">
                            Date of Birth <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={bfDob}
                            onChange={(e) => setBfDob(e.target.value)}
                            placeholder="DD/MM/YYYY"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-300 mb-1">Admission Batch</label>
                          <input
                            type="text"
                            required
                            value={bfBatch}
                            onChange={(e) => setBfBatch(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-300 mb-1">Academic Year</label>
                          <select
                            value={bfAcademicYear}
                            onChange={(e) => setBfAcademicYear(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
                          >
                            <option value="2024-2025">2024-2025 (Current Session)</option>
                            <option value="2023-2024">2023-2024</option>
                            <option value="2022-2023">2022-2023</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-300 mb-1">Current Semester</label>
                          <select
                            value={bfSemester}
                            onChange={(e) => setBfSemester(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
                          >
                            <option value="Semester 5">Semester 5</option>
                            <option value="Semester 6">Semester 6</option>
                            <option value="Semester 7">Semester 7</option>
                            <option value="Semester 8">Semester 8</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">
                          Purpose of Certificate <span className="text-rose-400">*</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {[
                            'National Scholarship Portal (NSP) Grant',
                            'Bank Education Loan Disbursement',
                            'Passport & Visa Police Verification',
                            'Bus / Railway Concession Ticket',
                            'Internship & Project Training NOC',
                          ].map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setBfPurpose(p)}
                              className={`text-3xs px-2 py-1 rounded-md border cursor-pointer transition-colors ${bfPurpose === p
                                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                                }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          required
                          value={bfPurpose}
                          onChange={(e) => setBfPurpose(e.target.value)}
                          placeholder="State exact purpose..."
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-3xs text-slate-400">
                          Digital seal & Registrar sign-off applied automatically for instant kiosk dispensing.
                        </span>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Award className="w-4 h-4" />
                          <span>Generate & Print Bonafide Certificate</span>
                        </button>
                      </div>
                    </form>

                    {/* Preview Generated Bonafide Certificate Card */}
                    {generatedBonafide && (
                      <div className="mt-4 p-5 bg-white text-slate-900 rounded-xl shadow-xl space-y-4 border-2 border-indigo-600">
                        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                          <div>
                            <div className="text-xs uppercase font-extrabold tracking-wider text-slate-900">
                              BIJU PATNAIK UNIVERSITY OF TECHNOLOGY, ODISHA
                            </div>
                            <div className="text-2xs text-slate-600">OFFICE OF THE REGISTRAR & DEAN OF STUDENT AFFAIRS</div>
                          </div>
                          <div className="text-right font-mono text-2xs">
                            <div>Ref: <strong>{generatedBonafide.certNumber}</strong></div>
                            <div>Date: {generatedBonafide.issueDate}</div>
                          </div>
                        </div>

                        <div className="text-center font-bold text-sm tracking-wider uppercase underline underline-offset-4 text-slate-900">
                          BONAFIDE CERTIFICATE
                        </div>

                        <div className="text-xs leading-relaxed text-slate-800 space-y-2">
                          <p>
                            This is to certify that <strong>{generatedBonafide.studentName}</strong>, Son/Daughter of <strong>{generatedBonafide.fatherName}</strong>, bearing University Registration Number <strong>{generatedBonafide.roll}</strong> (DOB: {generatedBonafide.dob}), is a bona fide regular student of this institution pursuing <strong>{generatedBonafide.branch}</strong> ({generatedBonafide.semester}, Academic Year {generatedBonafide.academicYear}, Batch {bfBatch}).
                          </p>
                          <p>
                            According to the records available in the university registry, his/her conduct, character, and scholastic progress have been found to be <strong>Good</strong> during the period of study.
                          </p>
                          <p>
                            This certificate is issued upon the request of the student for the purpose of: <strong>{generatedBonafide.purpose}</strong>.
                          </p>
                        </div>

                        <div className="pt-4 flex items-end justify-between border-t border-slate-300 text-2xs text-slate-600 font-mono">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-10 h-10 text-slate-900" />
                            <div>
                              <div className="font-bold text-slate-900">Verified Kiosk Print</div>
                              <div className="text-3xs text-slate-500">{generatedBonafide.token}</div>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="font-bold text-slate-900">Prof. R. C. Dash</div>
                            <div className="text-3xs">Registrar, University Campus</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. NO DUE CERTIFICATE FORM & CLEARANCES */}
                {certSubTab === 'nodue' && (
                  <div className="p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
                    <div className="border-b border-slate-700 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded">
                          Institutional Clearance
                        </span>
                        <h3 className="text-base font-bold text-white">Generate No Due Certificate</h3>
                      </div>
                      <p className="text-2xs text-slate-400 mt-1">
                        Consolidated clearance record across all 5 key university divisions (Hostel, Library, Laboratory, Sports, and Accounts).
                      </p>
                    </div>

                    {/* Department Status Nodes */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Department Clearance Status (Real-Time Database Sync):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
                        {clearanceNodes.map((node, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-700 flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-white">{node.department}</div>
                              <div className="text-emerald-400 font-semibold">{node.status}</div>
                              <div className="text-slate-400 text-3xs mt-0.5">Cleared by: {node.clearedBy}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleGenerateNoDue} className="space-y-4 text-xs pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-300 mb-1">Academic Year</label>
                          <select
                            value={ndAcademicYear}
                            onChange={(e) => setNdAcademicYear(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
                          >
                            <option value="2024-2025">2024-2025</option>
                            <option value="2023-2024">2023-2024</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-300 mb-1">Semester Term</label>
                          <select
                            value={ndSemester}
                            onChange={(e) => setNdSemester(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
                          >
                            <option value="Semester 5">Semester 5 (Autumn 2024)</option>
                            <option value="Semester 6">Semester 6</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Purpose of No Due Clearance</label>
                        <input
                          type="text"
                          required
                          value={ndPurpose}
                          onChange={(e) => setNdPurpose(e.target.value)}
                          placeholder="e.g. Semester Exam Clearance, Hostel Vacating..."
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-3xs text-emerald-400">
                          ✓ All 5 university departments verified Nil Dues. Instant certificate generation permitted.
                        </span>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Generate & Print No Due Certificate</span>
                        </button>
                      </div>
                    </form>

                    {/* Preview Generated No Due Certificate Card */}
                    {generatedNoDue && (
                      <div className="mt-4 p-5 bg-white text-slate-900 rounded-xl shadow-xl space-y-4 border-2 border-emerald-600">
                        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                          <div>
                            <div className="text-xs uppercase font-extrabold tracking-wider text-slate-900">
                              INSTITUTIONAL NO DUE CLEARANCE CERTIFICATE
                            </div>
                            <div className="text-2xs text-slate-600">ACADEMIC & ADMINISTRATIVE VERIFICATION SYSTEM</div>
                          </div>
                          <div className="text-right font-mono text-2xs">
                            <div>Ref: <strong>{generatedNoDue.certNumber}</strong></div>
                            <div>Date: {generatedNoDue.issueDate}</div>
                          </div>
                        </div>

                        <div className="text-xs leading-relaxed text-slate-800 space-y-1">
                          <p>
                            Certified that <strong>{generatedNoDue.studentName}</strong>, Roll No: <strong>{generatedNoDue.roll}</strong>, Department of <strong>{generatedNoDue.branch}</strong> ({generatedNoDue.semester}, Session {generatedNoDue.academicYear}), has cleared all institutional properties and dues:
                          </p>
                        </div>

                        <table className="w-full text-xs text-left border border-slate-300">
                          <thead>
                            <tr className="bg-slate-100 text-slate-900 text-2xs uppercase font-bold">
                              <th className="p-1.5 border-r border-slate-300">Department</th>
                              <th className="p-1.5 border-r border-slate-300">Status</th>
                              <th className="p-1.5">Verified By</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {clearanceNodes.map((node, i) => (
                              <tr key={i}>
                                <td className="p-1.5 border-r border-slate-200 font-medium">{node.department}</td>
                                <td className="p-1.5 border-r border-slate-200 text-emerald-800 font-semibold">{node.status}</td>
                                <td className="p-1.5 text-slate-600 text-3xs">{node.clearedBy}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <div className="pt-2 flex items-end justify-between border-t border-slate-300 text-2xs text-slate-600 font-mono">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-9 h-9 text-slate-900" />
                            <div>
                              <div className="font-bold text-slate-900">Validated Clearance</div>
                              <div className="text-3xs text-slate-500">{generatedNoDue.token}</div>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="font-bold text-slate-900">Dr. S. K. Mohapatra</div>
                            <div className="text-3xs">Dean of Academic Affairs</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: ACADEMIC MARKS (Uploaded by Faculty) */}
            {/* ========================================================================= */}
            {activeKioskTab === 'marks' && (
              <div className="space-y-6">
                <div className="p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-700/40 px-2 py-0.5 rounded">
                          {(initialSemesterMarksheets[selectedSemIndex] || initialSemesterMarksheets[0]).semesterName.split(' ')[0]} Evaluation
                        </span>
                        <h3 className="text-base font-bold text-white">Academic Marks & Evaluations</h3>
                      </div>
                      <p className="text-2xs text-slate-400 mt-1">
                        Grades and subject-wise assessment marks uploaded by university subject faculties for this student roll.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                      <select
                        value={selectedSemIndex}
                        onChange={(e) => setSelectedSemIndex(Number(e.target.value))}
                        className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {initialSemesterMarksheets.map((m, idx) => (
                          <option key={m.semesterId} value={idx}>
                            {m.semesterName}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handlePrintMarksSlip}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                      >
                        <Printer className="w-4 h-4" />
                        Print Grade Summary Slip
                      </button>
                    </div>
                  </div>

                  {/* Top GPA Strip */}
                  {(() => {
                    const activeMarksheet = initialSemesterMarksheets[selectedSemIndex] || initialSemesterMarksheets[0];
                    return (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700">
                            <div className="text-3xs text-slate-400 uppercase font-semibold">Semester SGPA</div>
                            <div className="text-2xl font-mono font-bold text-emerald-400 mt-0.5">
                              {activeMarksheet.sgpa}
                            </div>
                            <div className="text-3xs text-slate-500">{activeMarksheet.semesterName.split(' ')[0]}</div>
                          </div>

                          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700">
                            <div className="text-3xs text-slate-400 uppercase font-semibold">Cumulative CGPA</div>
                            <div className="text-2xl font-mono font-bold text-indigo-400 mt-0.5">
                              {activeMarksheet.cgpa}
                            </div>
                            <div className="text-3xs text-slate-500">Cumulative Progress</div>
                          </div>

                          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700">
                            <div className="text-3xs text-slate-400 uppercase font-semibold">Earned Credits</div>
                            <div className="text-2xl font-mono font-bold text-white mt-0.5">
                              {activeMarksheet.earnedCredits}/{activeMarksheet.totalCredits}
                            </div>
                            <div className="text-3xs text-emerald-400">{activeMarksheet.resultStatus}</div>
                          </div>

                          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700">
                            <div className="text-3xs text-slate-400 uppercase font-semibold">Academic Standing</div>
                            <div className="text-sm font-bold text-white mt-1.5 truncate">
                              Distinction (Top 5%)
                            </div>
                            <div className="text-3xs text-slate-500">BPUT Autonomous</div>
                          </div>
                        </div>

                        {/* Subject-Wise Marks Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left text-slate-300">
                            <thead>
                              <tr className="bg-slate-900 text-slate-400 uppercase font-bold text-3xs border-b border-slate-700">
                                <th className="p-2.5">Code & Subject</th>
                                <th className="p-2.5">Uploading Faculty</th>
                                <th className="p-2.5 text-center">Quiz / Test (20)</th>
                                <th className="p-2.5 text-center">Midterm (30)</th>
                                <th className="p-2.5 text-center">Endsem (50)</th>
                                <th className="p-2.5 text-center">Total (100)</th>
                                <th className="p-2.5 text-center">Grade</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 font-sans">
                              {activeMarksheet.subjects.map((subj, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/80 transition-colors">
                                  <td className="p-2.5">
                                    <div className="font-bold text-white">{subj.subjectName}</div>
                                    <div className="font-mono text-3xs text-indigo-400">{subj.subjectCode} · {subj.credits} Credits</div>
                                  </td>
                                  <td className="p-2.5 text-slate-400 font-medium text-2xs">
                                    {subj.facultyName}
                                  </td>
                                  <td className="p-2.5 text-center font-mono">
                                    {(subj.quizScore + subj.surpriseTestScore).toFixed(1)}
                                  </td>
                                  <td className="p-2.5 text-center font-mono">
                                    {subj.internalScore.toFixed(1)}
                                  </td>
                                  <td className="p-2.5 text-center font-mono">
                                    {subj.semesterScore.toFixed(1)}
                                  </td>
                                  <td className="p-2.5 text-center font-mono font-bold text-white">
                                    {subj.totalScore.toFixed(1)}
                                  </td>
                                  <td className="p-2.5 text-center">
                                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                                      {subj.grade}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SIMULATED THERMAL PRINTER DISPENSER TRAY */}
            {/* ========================================================================= */}
            {printedSlip && (
              <div className="p-5 bg-white text-slate-900 rounded-xl shadow-2xl space-y-3 animate-in slide-in-from-top-4 duration-300 border-t-8 border-indigo-600">
                <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-2">
                  <div className="text-2xs uppercase tracking-widest font-mono font-extrabold text-indigo-700 flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5" />
                    {printedSlip.type}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xs font-mono text-slate-500">{printedSlip.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => setPrintedSlip(null)}
                      className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 cursor-pointer"
                      title="Close Slip"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="text-center space-y-1 py-1">
                  <div className="text-sm font-bold text-slate-900">{printedSlip.title}</div>
                  <div className="text-xl font-mono font-bold text-indigo-900 tracking-wider">
                    {printedSlip.tokenCode}
                  </div>
                  <div className="text-2xs text-slate-600 max-w-xl mx-auto leading-relaxed">
                    {printedSlip.details}
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="py-2 text-center border-t border-dashed border-slate-300">
                  <div className="flex justify-center items-center gap-1 h-9 opacity-85">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`bg-slate-900 h-full ${(i * 5) % 3 === 0 ? 'w-1.5' : (i * 2) % 2 === 0 ? 'w-1' : 'w-0.5'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="text-3xs font-mono text-slate-600 mt-1">
                    * {printedSlip.tokenCode} * (Authorized Official Terminal Barcode)
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div className="text-3xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded">
                    ✓ Physical Slip Dispensed at Kiosk Tray Below
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-2xs font-semibold rounded cursor-pointer transition-colors"
                  >
                    Print Document / Save PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
