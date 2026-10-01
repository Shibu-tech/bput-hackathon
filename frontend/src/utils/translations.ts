import { Language } from '../types';

export interface TranslationDict {
  appName: string;
  tagline: string;
  roles: {
    student: string;
    warden: string;
    technician: string;
    guard: string;
    mess: string;
    kiosk: string;
    admin: string;
  };
  actions: {
    approve: string;
    reject: string;
    logExit: string;
    logEntry: string;
    assign: string;
    resolve: string;
    submit: string;
    cancel: string;
    scanQR: string;
    printSlip: string;
    refresh: string;
    markSafe: string;
    search: string;
    orderFood: string;
    requestPass: string;
    reportIssue: string;
    bookBed: string;
  };
  labels: {
    gatePasses: string;
    maintenanceTickets: string;
    messMenu: string;
    roomAllocation: string;
    rollCall: string;
    activePass: string;
    passCode: string;
    studentName: string;
    rollNumber: string;
    room: string;
    block: string;
    outTime: string;
    expectedReturn: string;
    status: string;
    destination: string;
    purpose: string;
    trade: string;
    priority: string;
    deduplicatedNotice: string;
    nightCurfewReport: string;
    totalStudents: string;
    insideHostel: string;
    onValidPass: string;
    overdueWarning: string;
    emergencyAlert: string;
    language: string;
    lowDataMode: string;
  };
  statuses: {
    pending: string;
    approved: string;
    rejected: string;
    checkedOut: string;
    completed: string;
    overdue: string;
    open: string;
    inProgress: string;
    resolved: string;
  };
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    appName: 'FretOps Central',
    tagline: 'Zero-Queue Campus & Hostel Operations',
    roles: {
      student: 'Student Portal',
      warden: 'Warden & Admin',
      technician: 'Technician Desk',
      guard: 'Gate Security',
      mess: 'Mess & Cafeteria',
      kiosk: 'Lobby Kiosk',
      admin: 'System Administration',
    },
    actions: {
      approve: 'Approve',
      reject: 'Reject',
      logExit: 'Log Student Exit',
      logEntry: 'Log Student Entry',
      assign: 'Assign Technician',
      resolve: 'Mark Resolved',
      submit: 'Submit Request',
      cancel: 'Cancel',
      scanQR: 'Scan Pass QR',
      printSlip: 'Print Kiosk Slip',
      refresh: 'Refresh Data',
      markSafe: 'I Am Safe (Check-in)',
      search: 'Search roll number, room or name...',
      orderFood: 'Order to Room',
      requestPass: 'Request Gate Pass',
      reportIssue: 'Log Maintenance Complaint',
      bookBed: 'Confirm Bed Booking',
    },
    labels: {
      gatePasses: 'Gate Passes',
      maintenanceTickets: 'Maintenance Tickets',
      messMenu: 'Mess & Dining',
      roomAllocation: 'Room Selection',
      rollCall: '10:30 PM Night Roll Call',
      activePass: 'Active Gate Pass',
      passCode: 'Pass Code',
      studentName: 'Student Name',
      rollNumber: 'Roll Number',
      room: 'Room',
      block: 'Hostel Block',
      outTime: 'Out Time',
      expectedReturn: 'Expected Return',
      status: 'Status',
      destination: 'Destination',
      purpose: 'Purpose',
      trade: 'Trade / Category',
      priority: 'Priority',
      deduplicatedNotice: 'AI Deduplication Grouped Tickets',
      nightCurfewReport: 'Automated Warden Night Report',
      totalStudents: 'Total Students',
      insideHostel: 'Inside Hostel',
      onValidPass: 'Out on Valid Pass',
      overdueWarning: 'Curfew Overdue Alert',
      emergencyAlert: 'Campus Emergency Override',
      language: 'Language',
      lowDataMode: '2G Low-Data Mode',
    },
    statuses: {
      pending: 'Pending Approval',
      approved: 'Approved',
      rejected: 'Rejected',
      checkedOut: 'Checked Out',
      completed: 'Completed',
      overdue: 'Curfew Overdue',
      open: 'Open',
      inProgress: 'In Progress',
      resolved: 'Resolved',
    },
  },
  hi: {
    appName: 'फ्रेटऑप्स सेंट्रल',
    tagline: 'शून्य-कतार कैंपस और हॉस्टल प्रबंधन',
    roles: {
      student: 'विद्यार्थी पोर्टल',
      warden: 'वार्डन और एडमिन',
      technician: 'तकनीशियन डेस्क',
      guard: 'गेट सुरक्षा गार्ड',
      mess: 'मेस और कैफेटेरिया',
      kiosk: 'लॉबी कियोस्क',
      admin: 'प्रणाली प्रशासन',
    },
    actions: {
      approve: 'स्वीकृत करें',
      reject: 'अस्वीकार करें',
      logExit: 'छात्र प्रस्थान दर्ज करें',
      logEntry: 'छात्र आगमन दर्ज करें',
      assign: 'तकनीशियन सौंपें',
      resolve: 'समस्या हल चिन्हित करें',
      submit: 'अनुरोध भेजें',
      cancel: 'रद्द करें',
      scanQR: 'गेट पास QR स्कैन करें',
      printSlip: 'कियोस्क रसीद प्रिंट करें',
      refresh: 'ताज़ा करें',
      markSafe: 'मैं सुरक्षित हूँ (चेक-इन)',
      search: 'रोल नंबर, कमरा या नाम खोजें...',
      orderFood: 'कमरे में भोजन मंगाएं',
      requestPass: 'गेट पास का अनुरोध करें',
      reportIssue: 'मरम्मत शिकायत दर्ज करें',
      bookBed: 'बेड बुकिंग सुरक्षित करें',
    },
    labels: {
      gatePasses: 'गेट पास',
      maintenanceTickets: 'मरम्मत टिकट',
      messMenu: 'मेस और खान-पान',
      roomAllocation: 'कमरा चयन',
      rollCall: 'रात 10:30 बजे की उपस्थिति',
      activePass: 'सक्रिय गेट पास',
      passCode: 'पास कोड',
      studentName: 'विद्यार्थी का नाम',
      rollNumber: 'रोल नंबर',
      room: 'कमरा',
      block: 'हॉस्टल ब्लॉक',
      outTime: 'बाहर जाने का समय',
      expectedReturn: 'अपेक्षित वापसी',
      status: 'स्थिति',
      destination: 'गंतव्य',
      purpose: 'कारण',
      trade: 'कार्य श्रेणी',
      priority: 'प्राथमिकता',
      deduplicatedNotice: 'समान समस्याओं का समूह',
      nightCurfewReport: 'वार्डन स्वचालित रात्रि रिपोर्ट',
      totalStudents: 'कुल विद्यार्थी',
      insideHostel: 'हॉस्टल के भीतर',
      onValidPass: 'मान्य पास पर बाहर',
      overdueWarning: 'समय सीमा उल्लंघन चेतावनी',
      emergencyAlert: 'आपातकालीन सायरन अलर्ट',
      language: 'भाषा',
      lowDataMode: '2जी लो-डेटा मोड',
    },
    statuses: {
      pending: 'स्वीकृति लंबित',
      approved: 'स्वीकृत',
      rejected: 'अस्वीकृत',
      checkedOut: 'बाहर गए हुए',
      completed: 'पूर्ण',
      overdue: 'समय समाप्त / अनुपस्थित',
      open: 'खुला हुआ',
      inProgress: 'प्रगति पर',
      resolved: 'समाधान हो चुका',
    },
  },
  or: {
    appName: 'ଫ୍ରେଟ୍‌ଅପ୍ସ ସେଣ୍ଟ୍ରାଲ୍',
    tagline: 'ଧାଡ଼ିମୁକ୍ତ କ୍ୟାମ୍ପସ୍ ଏବଂ ହଷ୍ଟେଲ୍ ପରିଚାଳନା',
    roles: {
      student: 'ଛାତ୍ର ପୋର୍ଟାଲ୍',
      warden: 'ୱାର୍ଡେନ୍ ଏବଂ ପ୍ରଶାସନ',
      technician: 'ଟେକ୍ନିସିଆନ୍ ଡେସ୍କ',
      guard: 'ଗେଟ୍ ସୁରକ୍ଷା',
      mess: 'ମେସ୍ ଏବଂ କ୍ୟାଣ୍ଟିନ୍',
      kiosk: 'ଲବି କିଓସ୍କ',
      admin: 'ସିଷ୍ଟମ୍ ପ୍ରଶାସନ',
    },
    actions: {
      approve: 'ଅନୁମୋଦନ କରନ୍ତୁ',
      reject: 'ପ୍ରତ୍ୟାଖ୍ୟାନ କରନ୍ତୁ',
      logExit: 'ଛାତ୍ର ପ୍ରସ୍ଥାନ ଲଗ୍ କରନ୍ତୁ',
      logEntry: 'ଛାତ୍ର ପ୍ରବେଶ ଲଗ୍ କରନ୍ତୁ',
      assign: 'ଟେକ୍ନିସିଆନ୍ ନିଯୁକ୍ତ କରନ୍ତୁ',
      resolve: 'ସମାଧାନ ଚିହ୍ନିତ କରନ୍ତୁ',
      submit: 'ଅନୁରୋଧ ଦାଖଲ କରନ୍ତୁ',
      cancel: 'ବାତିଲ୍ କରନ୍ତୁ',
      scanQR: 'ଗେଟ୍ ପାସ୍ QR ସ୍କାନ୍ କରନ୍ତୁ',
      printSlip: 'କିଓସ୍କ ରସିଦ ପ୍ରିଣ୍ଟ କରନ୍ତୁ',
      refresh: 'ରିଫ୍ରେସ୍ କରନ୍ତୁ',
      markSafe: 'ମୁଁ ସୁରକ୍ଷିତ ଅଛି (ଚେକ୍-ଇନ୍)',
      search: 'ରୋଲ୍ ନମ୍ବର, ରୁମ୍ କିମ୍ବା ନାମ ଖୋଜନ୍ତୁ...',
      orderFood: 'ରୁମ୍ କୁ ଖାଦ୍ୟ ଅର୍ଡର କରନ୍ତୁ',
      requestPass: 'ଗେଟ୍ ପାସ୍ ଅନୁରୋଧ କରନ୍ତୁ',
      reportIssue: 'ରକ୍ଷଣାବେକ୍ଷଣ ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ',
      bookBed: 'ବେଡ୍ ବୁକିଂ ନିଶ୍ଚିତ କରନ୍ତୁ',
    },
    labels: {
      gatePasses: 'ଗେଟ୍ ପାସ୍',
      maintenanceTickets: 'ରକ୍ଷଣାବେକ୍ଷଣ ଟିକେଟ୍',
      messMenu: 'ମେସ୍ ଏବଂ ଖାଦ୍ୟ',
      roomAllocation: 'ରୁମ୍ ଚୟନ',
      rollCall: 'ରାତି ୧୦:୩୦ ଉପସ୍ଥିତି',
      activePass: 'ସକ୍ରିୟ ଗେଟ୍ ପାସ୍',
      passCode: 'ପାସ୍ କୋଡ୍',
      studentName: 'ଛାତ୍ରଙ୍କ ନାମ',
      rollNumber: 'ରୋଲ୍ ନମ୍ବର',
      room: 'ରୁମ୍ ନମ୍ବର',
      block: 'ହଷ୍ଟେଲ୍ ବ୍ଲକ୍',
      outTime: 'ବାହାରକୁ ଯିବା ସମୟ',
      expectedReturn: 'ଫେରିବାର ସମ୍ଭାବ୍ୟ ସମୟ',
      status: 'ସ୍ଥିତି',
      destination: 'ଗନ୍ତବ୍ୟ ସ୍ଥଳ',
      purpose: 'ଉଦ୍ଦେଶ୍ୟ',
      trade: 'କାର୍ଯ୍ୟ ବର୍ଗ',
      priority: 'ପ୍ରାଥମିକତା',
      deduplicatedNotice: 'ଏକତ୍ରିତ ଅଭିଯୋଗ ସମୂହ',
      nightCurfewReport: 'ସ୍ୱୟଂଚାଳିତ ୱାର୍ଡେନ୍ ରାତ୍ରି ରିପୋର୍ଟ',
      totalStudents: 'ମୋଟ ଛାତ୍ରଛାତ୍ରୀ',
      insideHostel: 'ହଷ୍ଟେଲ୍ ଭିତରେ',
      onValidPass: 'ବୈଧ ପାସ୍ ସହିତ ବାହାରେ',
      overdueWarning: 'ସମୟ ଅତିକ୍ରାନ୍ତ ଚେତାବନୀ',
      emergencyAlert: 'କ୍ୟାମ୍ପସ୍ ଜରୁରୀକାଳୀନ ଆଲର୍ଟ',
      language: 'ଭାଷା',
      lowDataMode: '୨ଜି ଲୋ-ଡାଟା ମୋଡ୍',
    },
    statuses: {
      pending: 'ଅନୁମୋଦନ ପାଇଁ ବିଚାରାଧୀନ',
      approved: 'ଅନୁମୋଦିତ',
      rejected: 'ପ୍ରତ୍ୟାଖ୍ୟାତ',
      checkedOut: 'ବାହାରକୁ ଯାଇଛନ୍ତି',
      completed: 'ସମ୍ପୂର୍ଣ୍ଣ',
      overdue: 'କର୍ଫ୍ୟୁ ସମୟ ସମାପ୍ତ',
      open: 'ଖୋଲା ଅଛି',
      inProgress: 'କାର୍ଯ୍ୟ ଜାରି ଅଛି',
      resolved: 'ସମାଧାନ ହୋଇଛି',
    },
  },
};
