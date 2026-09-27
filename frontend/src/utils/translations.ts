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
  te: {
    appName: 'ఫ్రెట్ఆప్స్ సెంట్రల్',
    tagline: 'క్యూ రహిత క్యాంపస్ & హాస్టల్ నిర్వహణ',
    roles: {
      student: 'విద్యార్థి పోర్టల్',
      warden: 'వార్డెన్ & అడ్మిన్',
      technician: 'టెక్నీషియన్ డెస్క్',
      guard: 'గేట్ సెక్యూరిటీ',
      mess: 'మెస్ & కేఫెటీరియా',
      kiosk: 'లాబీ కియోస్క్',
      admin: 'సిస్టమ్ నిర్వహణ',
    },
    actions: {
      approve: 'ఆమోదించు',
      reject: 'తిరస్కరించు',
      logExit: 'నిష్క్రమణ నమోదు',
      logEntry: 'ప్రవేశం నమోదు',
      assign: 'టెక్నీషియన్‌ను కేటాయించు',
      resolve: 'పరిష్కరించబడింది',
      submit: 'సమర్పించు',
      cancel: 'రద్దు చేయి',
      scanQR: 'QR కోడ్ స్కాన్ చేయి',
      printSlip: 'రసీదు ప్రింట్ చేయి',
      refresh: 'రిఫ్రెష్',
      markSafe: 'నేను క్షేమంగా ఉన్నాను',
      search: 'రోల్ నంబర్, గది లేదా పేరు శోధించండి...',
      orderFood: 'గదికి భోజనం ఆర్డర్ చేయండి',
      requestPass: 'గేట్ పాస్ అభ్యర్థన',
      reportIssue: 'ఫిర్యాదు నమోదు చేయండి',
      bookBed: 'బెడ్ బుకింగ్ ఖరారు చేయండి',
    },
    labels: {
      gatePasses: 'గేట్ పాస్‌లు',
      maintenanceTickets: 'నిర్వహణ ఫిర్యాదులు',
      messMenu: 'మెస్ మెనూ',
      roomAllocation: 'గది ఎంపిక',
      rollCall: 'రాత్రి 10:30 హాజరు నివేదిక',
      activePass: 'యాక్టివ్ పాస్',
      passCode: 'పాస్ కోడ్',
      studentName: 'విద్యార్థి పేరు',
      rollNumber: 'రోల్ నంబర్',
      room: 'గది సంఖ్య',
      block: 'హాస్టల్ బ్లాక్',
      outTime: 'బయటకు వెళ్లే సమయం',
      expectedReturn: 'తిరిగి వచ్చే సమయం',
      status: 'స్థితి',
      destination: 'గమ్యస్థానం',
      purpose: 'కారణం',
      trade: 'విభాగం',
      priority: 'ప్రాధాన్యత',
      deduplicatedNotice: 'సారూప్య ఫిర్యాదుల సమూహం',
      nightCurfewReport: 'స్వయంచాలక వార్డెన్ నివేదిక',
      totalStudents: 'మొత్తం విద్యార్థులు',
      insideHostel: 'హాస్టల్ లోపల ఉన్నారు',
      onValidPass: 'పాస్‌తో బయట ఉన్నారు',
      overdueWarning: 'సమయం మించిన హెచ్చరిక',
      emergencyAlert: 'అత్యవసర సైరన్ హెచ్చరిక',
      language: 'భాష',
      lowDataMode: 'తక్కువ డేటా మోడ్',
    },
    statuses: {
      pending: 'పరిశీలనలో ఉంది',
      approved: 'ఆమోదించబడింది',
      rejected: 'తిరస్కరించబడింది',
      checkedOut: 'బయటకు వెళ్లారు',
      completed: 'పూర్తయింది',
      overdue: 'గడువు మించింది',
      open: 'తెరిచి ఉంది',
      inProgress: 'పురోగతిలో ఉంది',
      resolved: 'పరిష్కరించబడింది',
    },
  },
  ta: {
    appName: 'ப்ரெட்ஆப்ஸ் சென்ட்ரல்',
    tagline: 'வரிசையற்ற வளாகம் மற்றும் விடுதி நிர்வாகம்',
    roles: {
      student: 'மாணவர் தளம்',
      warden: 'வார்டன் & நிர்வாகம்',
      technician: 'தொழில்நுட்ப பணியாளர்',
      guard: 'நுழைவாயில் பாதுகாப்பு',
      mess: 'உணவுக்கூடம்',
      kiosk: 'கியோஸ்க் திரை',
      admin: 'முதன்மை நிர்வாகம்',
    },
    actions: {
      approve: 'ஒப்புதல் அளி',
      reject: 'நிராகரி',
      logExit: 'வெளியேறுவதை பதிவு செய்',
      logEntry: 'உள்நுழைவை பதிவு செய்',
      assign: 'பணியாளரை நியமி',
      resolve: 'தீர்க்கப்பட்டது என குறி',
      submit: 'சமர்ப்பி',
      cancel: 'ரத்து செய்',
      scanQR: 'QR குறியீட்டை ஸ்கேன் செய்',
      printSlip: 'சீட்டு அச்சிடு',
      refresh: 'புதுப்பி',
      markSafe: 'நான் பாதுகாப்பாக உள்ளேன்',
      search: 'எண், அறை அல்லது பெயர் தேடுக...',
      orderFood: 'அறைக்கு உணவு ஆர்டர் செய்',
      requestPass: 'கேட் பாஸ் விண்ணப்பி',
      reportIssue: 'பழுது புகார் செய்',
      bookBed: 'படுக்கை முன்பதிவு உறுதி செய்',
    },
    labels: {
      gatePasses: 'கேட் பாஸ்கள்',
      maintenanceTickets: 'பராமரிப்பு புகார்கள்',
      messMenu: 'உணவு பட்டியல்',
      roomAllocation: 'அறை தேர்வு',
      rollCall: 'இரவு 10:30 வருகை அறிக்கை',
      activePass: 'செயலில் உள்ள பாஸ்',
      passCode: 'பாஸ் குறியீடு',
      studentName: 'மாணவர் பெயர்',
      rollNumber: 'பதிவு எண்',
      room: 'அறை',
      block: 'விடுதி வளாகம்',
      outTime: 'வெளியேறும் நேரம்',
      expectedReturn: 'திரும்பும் நேரம்',
      status: 'நிலை',
      destination: 'செல்லும் இடம்',
      purpose: 'நோக்கம்',
      trade: 'பிரிவு',
      priority: 'முன்னுரிமை',
      deduplicatedNotice: 'ஒருங்கிணைக்கப்பட்ட புகார்கள்',
      nightCurfewReport: 'வார்டன் இரவு நேர அறிக்கை',
      totalStudents: 'மொத்த மாணவர்கள்',
      insideHostel: 'விடுதிக்குள் உள்ளோர்',
      onValidPass: 'அனுமதியுடன் வெளியே',
      overdueWarning: 'நேரம் கடந்த எச்சரிக்கை',
      emergencyAlert: 'அவசரகால எச்சரிக்கை சங்கு',
      language: 'மொழி',
      lowDataMode: 'குறைந்த தரவு பயன்முறை',
    },
    statuses: {
      pending: 'நிலுவையில்',
      approved: 'ஒப்புதல் அளிக்கப்பட்டது',
      rejected: 'நிராகரிக்கப்பட்டது',
      checkedOut: 'வெளியேறிவிட்டார்',
      completed: 'முடிவடைந்தது',
      overdue: 'நேரம் கடந்தது',
      open: 'திறந்துள்ளது',
      inProgress: 'நடைமுறையில்',
      resolved: 'தீர்க்கப்பட்டது',
    },
  },
  mr: {
    appName: 'फ्रेटऑप्स सेंट्रल',
    tagline: 'रांगेविना कॅम्पस व वसतिगृह कामकाज',
    roles: {
      student: 'विद्यार्थी पोर्टल',
      warden: 'वॉर्डन आणि प्रशासन',
      technician: 'तंत्रज्ञ कक्ष',
      guard: 'सुरक्षा रक्षक',
      mess: 'मेस आणि कॅन्टीन',
      kiosk: 'लॉबी किओस्क',
      admin: 'प्रणाली प्रशासन',
    },
    actions: {
      approve: 'मंजूर करा',
      reject: 'नाकारा',
      logExit: 'बाहेर जाणे नोंदवा',
      logEntry: 'आत येणे नोंदवा',
      assign: 'तंत्रज्ञ नियुक्त करा',
      resolve: 'निवारण झाले',
      submit: 'सादर करा',
      cancel: 'रद्द करा',
      scanQR: 'QR कोड स्कॅन करा',
      printSlip: 'पावती प्रिंट करा',
      refresh: 'ताजे करा',
      markSafe: 'मी सुरक्षित आहे (चेक-इन)',
      search: 'रोल नंबर, खोली किंवा नाव शोधा...',
      orderFood: 'खोलीत जेवण मागवा',
      requestPass: 'गेट पास मागवा',
      reportIssue: 'दुरुस्ती तक्रार नोंदवा',
      bookBed: 'बेड बुकिंग निश्चित करा',
    },
    labels: {
      gatePasses: 'गेट पासेस',
      maintenanceTickets: 'दुरुस्ती तक्रारी',
      messMenu: 'मेस मेनू',
      roomAllocation: 'खोली निवड',
      rollCall: 'रात्री १०:३० उपस्थिती',
      activePass: 'सक्रिय गेट पास',
      passCode: 'पास कोड',
      studentName: 'विद्यार्थ्याचे नाव',
      rollNumber: 'रोल नंबर',
      room: 'खोली क्र.',
      block: 'वसतिगृह ब्लॉक',
      outTime: 'बाहेर जाण्याची वेळ',
      expectedReturn: 'परतीची अपेक्षित वेळ',
      status: 'स्थिती',
      destination: 'ठिकाण',
      purpose: 'कारण',
      trade: 'काम प्रकार',
      priority: 'प्राधान्य',
      deduplicatedNotice: 'एकत्रित तक्रारी गट',
      nightCurfewReport: 'वॉर्डन स्वयंचलित अहवाल',
      totalStudents: 'एकूण विद्यार्थी',
      insideHostel: 'वसतिगृहात हजर',
      onValidPass: 'पास घेऊन बाहेर',
      overdueWarning: 'वेळ संपल्याचा इशारा',
      emergencyAlert: 'आपत्कालीन सायरन अलर्ट',
      language: 'भाषा',
      lowDataMode: '२जी कमी डेटा मोड',
    },
    statuses: {
      pending: 'प्रलंबित',
      approved: 'मंजूर',
      rejected: 'नाकारले',
      checkedOut: 'बाहेर पडले',
      completed: 'पूर्ण',
      overdue: 'वेळ संपली / गैरहजर',
      open: 'उघडले',
      inProgress: 'काम चालू आहे',
      resolved: 'निवारण झाले',
    },
  },
};
