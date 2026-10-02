import { useEffect, useRef } from 'react';
import { Language } from '../types';

/**
 * Comprehensive bilingual dictionary for Odia ('or') and Hindi ('hi')
 * Covering all dashboard portals: Student, Warden, Technician, Security Guard, Mess, Kiosk, Admin, and Emergency.
 */
export const dashboardTranslations: Record<'or' | 'hi', Record<string, string>> = {
  or: {
    // Brand & Header
    'FretOps Central': 'ଫ୍ରେଟ୍‌ଅପ୍ସ ସେଣ୍ଟ୍ରାଲ୍',
    'FretOps': 'ଫ୍ରେଟ୍‌ଅପ୍ସ',
    'Central': 'ସେଣ୍ଟ୍ରାଲ୍',
    'Zero-Queue Campus & Hostel Operations': 'ଧାଡ଼ିମୁକ୍ତ କ୍ୟାମ୍ପସ୍ ଏବଂ ହଷ୍ଟେଲ୍ ପରିଚାଳନା',
    'Zero-Queue Campus & Hostel Operations Platform': 'ଧାଡ଼ିମୁକ୍ତ କ୍ୟାମ୍ପସ୍ ଏବଂ ହଷ୍ଟେଲ୍ ପରିଚାଳନା ପ୍ଲାଟଫର୍ମ',
    'Admin Switcher:': 'ଆଡମିନ୍ ସୁଇଚର୍:',
    'Admin Switcher': 'ଆଡମିନ୍ ସୁଇଚର୍',
    'Rollout Playbook': 'ରୋଲ୍ ଆଉଟ୍ ପ୍ଲେବୁକ୍',
    'Emergency Siren': 'ଜରୁରୀକାଳୀନ ସାଇରନ୍',
    '2G Mode': '୨ଜି ମୋଡ୍',
    '2G Mode On': '୨ଜି ମୋଡ୍ ଚାଲୁ',
    'Toggle low-bandwidth lightweight mode': '୨ଜି ଲୋ-ବ୍ୟାଣ୍ଡୱିଡଥ୍ ମୋଡ୍ ବଦଳାନ୍ତୁ',
    'Logout': 'ଲଗ୍ ଆଉଟ୍',
    'Sign Out': 'ଲଗ୍ ଆଉଟ୍',
    'Sign out of your account': 'ଆପଣଙ୍କ ଆକାଉଣ୍ଟରୁ ଲଗ୍ ଆଉଟ୍ କରନ୍ତୁ',
    'Logged in as': 'ଭାବରେ ଲଗ୍ ଇନ୍ ହୋଇଛି',
    'Role': 'ଭୂମିକା',
    'Phone': 'ଫୋନ୍',
    'Hostel': 'ହଷ୍ଟେଲ୍',
    'Room': 'ରୁମ୍',
    'Staff Verification': 'କର୍ମଚାରୀ ଯାଞ୍ଚ',
    'Notifications': 'ବିଜ୍ଞପ୍ତି',
    'Mark all as read': 'ସମସ୍ତ ପଢ଼ାଯାଇଛି ଚିହ୍ନିତ କରନ୍ତୁ',
    'No unread notifications': 'କୌଣସି ନୂତନ ବିଜ୍ଞପ୍ତି ନାହିଁ',
    'Reset Demo State': 'ଡେମୋ ରିସେଟ୍ କରନ୍ତୁ',
    'Reset demo data to initial mock state?': 'ଡେମୋ ତଥ୍ୟକୁ ପୂର୍ବ ସ୍ଥିତିକୁ ଫେରାଇବେ କି?',
    'Problem Statement 7 Implementation': 'ପ୍ରବ୍ଲେମ୍ ଷ୍ଟେଟମେଣ୍ଟ୍ ୭ କାର୍ଯ୍ୟାନ୍ୱୟନ',

    // Role Names
    'Student Portal': 'ଛାତ୍ର ପୋର୍ଟାଲ୍',
    'Warden & Admin': 'ୱାର୍ଡେନ୍ ଏବଂ ପ୍ରଶାସନ',
    'Technician Desk': 'ଟେକ୍ନିସିଆନ୍ ଡେସ୍କ',
    'Gate Security': 'ଗେଟ୍ ସୁରକ୍ଷା',
    'Mess & Cafeteria': 'ମେସ୍ ଏବଂ କ୍ୟାଣ୍ଟିନ୍',
    'Lobby Kiosk': 'ଲବି କିଓସ୍କ',
    'System Administration': 'ସିଷ୍ଟମ୍ ପ୍ରଶାସନ',

    // Emergency Alert & Siren
    'EMERGENCY SIREN BROADCAST ACTIVE:': 'ଜରୁରୀକାଳୀନ ସାଇରନ୍ ପ୍ରସାରଣ ସକ୍ରିୟ:',
    'Open Emergency HUD': 'ଜରୁରୀକାଳୀନ HUD ଖୋଲନ୍ତୁ',
    'CRITICAL CAMPUS EMERGENCY ALERT': 'ଜରୁରୀକାଳୀନ କ୍ୟାମ୍ପସ୍ ସତର୍କତା',
    'Emergency Siren & Evacuation Console': 'ଜରୁରୀକାଳୀନ ସାଇରନ୍ ଏବଂ ଖାଲି କରିବା କନସୋଲ୍',
    'Loud ambulance override siren (6s audio burst) · Mute bypass protocol': 'ଶକ୍ତିଶାଳୀ ଆମ୍ବୁଲାନ୍ସ ସାଇରନ୍ (୬ ସେକେଣ୍ଡ) · ମ୍ୟୁଟ୍ ବାଇପାସ୍ ପ୍ରୋଟୋକଲ୍',
    'Campus-Wide Mandatory Fire Evacuation Drill': 'କ୍ୟାମ୍ପସ୍ ସ୍ତରୀୟ ବାଧ୍ୟତାମୂଳକ ଅଗ୍ନି ନିର୍ବାପକ ଡ୍ରିଲ୍',
    'All hostel residents, staff, and faculty must immediately proceed to designated assembly areas via fire exit stairwells.': 'ସମସ୍ତ ହଷ୍ଟେଲ୍ ଅନ୍ତେବାସୀ, କର୍ମଚାରୀ ଓ ଅଧ୍ୟାପକ ତୁରନ୍ତ ନିର୍ଦ୍ଧାରିତ ଏକତ୍ରିକରଣ ସ୍ଥାନକୁ ପ୍ରସ୍ଥାନ କରନ୍ତୁ।',
    'Designated Muster Assembly Point:': 'ନିର୍ଦ୍ଧାରିତ ଏକତ୍ରିକରଣ ସ୍ଥାନ:',
    'Designated Muster Assembly Point': 'ନିର୍ଦ୍ଧାରିତ ଏକତ୍ରିକରଣ ସ୍ଥାନ',
    'Main Athletics Track & Football Field (Zone A)': 'ମୁଖ୍ୟ ଖେଳ ପଡ଼ିଆ ଏବଂ ଫୁଟବଲ୍ ଗ୍ରାଉଣ୍ଡ୍ (ଜୋନ୍ A)',
    'Main Athletics Track & Football Field': 'ମୁଖ୍ୟ ଖେଳ ପଡ଼ିଆ ଏବଂ ଫୁଟବଲ୍ ଗ୍ରାଉଣ୍ଡ୍',
    'Safe Check-In Headcount': 'ସୁରକ୍ଷିତ ଯାଞ୍ଚ ହୋଇଥିବା ସଂଖ୍ୟା',
    '/ 856 students verified': '/ ୮୫୬ ଛାତ୍ର ଯାଞ୍ଚ ସମ୍ପନ୍ନ',
    'students verified': 'ଛାତ୍ର ଯାଞ୍ଚ ସମ୍ପନ୍ନ',
    'I Am Safe (Muster Check-in)': 'ମୁଁ ସୁରକ୍ଷିତ ଅଛି (ଚେକ୍-ଇନ୍)',
    'You are registered SAFE at muster point': 'ଆପଣ ଏକତ୍ରିକରଣ ସ୍ଥାନରେ ସୁରକ୍ଷିତ ଭାବେ ପଞ୍ଜୀକୃତ ହୋଇଛନ୍ତି',
    'Replay Siren (6s)': 'ସାଇରନ୍ ପୁନଃ ବଜାନ୍ତୁ (୬ ସେକେଣ୍ଡ)',
    'Test Siren Audio (6s)': 'ସାଇରନ୍ ଅଡିଓ ପରୀକ୍ଷା (୬ ସେକେଣ୍ଡ)',
    'Stop Siren Audio': 'ସାଇରନ୍ ବନ୍ଦ କରନ୍ତୁ',
    'Close Console': 'କନସୋଲ୍ ବନ୍ଦ କରନ୍ତୁ',
    'Turn Off Alert Message': 'ଆଲର୍ଟ ବାର୍ତ୍ତା ବନ୍ଦ କରନ୍ତୁ',
    'Turn Off Alert': 'ଆଲର୍ଟ ବନ୍ଦ କରନ୍ତୁ',
    'Emergency Alert is currently active across the campus.': 'ଜରୁରୀକାଳୀନ ଆଲର୍ଟ ବର୍ତ୍ତମାନ କ୍ୟାମ୍ପସ୍ ରେ ସକ୍ରିୟ ଅଛି।',
    'Turn off emergency alert across campus': 'କ୍ୟାମ୍ପସ୍ ରେ ଜରୁରୀକାଳୀନ ଆଲର୍ଟ ବନ୍ଦ କରନ୍ତୁ',
    'Turn off this emergency alert broadcast': 'ଏହି ଜରୁରୀକାଳୀନ ଆଲର୍ଟ ପ୍ରସାରଣ ବନ୍ଦ କରନ୍ତୁ',
    'All-Clear / End Emergency': 'ସବୁ ସୁରକ୍ଷିତ / ଜରୁରୀକାଳୀନ ସମାପ୍ତ',
    'Emergency Incident Type': 'ଜରୁରୀକାଳୀନ ଘଟଣା ପ୍ରକାର',
    'Fire Drill': 'ଅଗ୍ନି ଡ୍ରିଲ୍',
    'Severe Storm': 'ପ୍ରବଳ ଝଡ଼',
    'Lockdown': 'ଲକଡାଉନ୍',
    'Medical Code': 'ଚିକିତ୍ସା ଜରୁରୀକାଳୀନ',
    'Severe Thunderstorm & High-Wind Warning': 'ପ୍ରବଳ ବଜ୍ରପାତ ଓ ଝଡ଼ ସତର୍କତା',
    'Remain inside hostel rooms; close balcony doors': 'ହଷ୍ଟେଲ୍ ରୁମ୍ ଭିତରେ ରୁହନ୍ତୁ; ବାଲକୋନି କବାଟ ବନ୍ଦ ରଖନ୍ତୁ',
    'Alert Headline': 'ସତର୍କତା ଶୀର୍ଷକ',
    'Urgent Student Instructions': 'ଛାତ୍ରଛାତ୍ରୀଙ୍କ ପାଇଁ ଜରୁରୀ ନିର୍ଦ୍ଦେଶାବଳୀ',
    'Broadcast Campus Siren': 'କ୍ୟାମ୍ପସ୍ ସାଇରନ୍ ପ୍ରସାରଣ କରନ୍ତୁ',

    // Student Portal Tabs & General
    'Welcome back,': 'ସ୍ୱାଗତ,',
    'Hostel Resident Portal': 'ହଷ୍ଟେଲ୍ ନିବାସୀ ପୋର୍ଟାଲ୍',
    'Active Student': 'ସକ୍ରିୟ ଛାତ୍ର',
    'Gate Passes': 'ଗେଟ୍ ପାସ୍',
    'Room Selection': 'ରୁମ୍ ଚୟନ',
    'Complaints & Maintenance': 'ଅଭିଯୋଗ ଓ ରକ୍ଷଣାବେକ୍ଷଣ',
    'Mess & Dining': 'ମେସ୍ ଏବଂ ଖାଦ୍ୟ',
    'Academic Verification': 'ଏକାଡେମିକ୍ ଯାଞ୍ଚ',
    'Active Gate Pass': 'ସକ୍ରିୟ ଗେଟ୍ ପାସ୍',
    'Digital Out-Pass': 'ଡିଜିଟାଲ୍ ଆଉଟ୍-ପାସ୍',
    'Request Gate Pass': 'ଗେଟ୍ ପାସ୍ ଅନୁରୋଧ କରନ୍ତୁ',
    'Request Hostel Gate Pass': 'ହଷ୍ଟେଲ୍ ଗେଟ୍ ପାସ୍ ଅନୁରୋଧ କରନ୍ତୁ',
    'Pass Code': 'ପାସ୍ କୋଡ୍',
    'Pass Type': 'ପାସ୍ ପ୍ରକାର',
    'Day Pass': 'ଦିବା ପାସ୍',
    'Late Night Pass': 'ରାତ୍ରିକାଳୀନ ପାସ୍',
    'Weekend Leave': 'ସପ୍ତାହାନ୍ତ ଛୁଟି',
    'Emergency Leave': 'ଜରୁରୀକାଳୀନ ଛୁଟି',
    'Destination': 'ଗନ୍ତବ୍ୟ ସ୍ଥଳ',
    'Purpose': 'ଉଦ୍ଦେଶ୍ୟ',
    'Departure Time': 'ବାହାରିବା ସମୟ',
    'Out Time': 'ବାହାରକୁ ଯିବା ସମୟ',
    'Expected In-Time': 'ଫେରିବାର ସମ୍ଭାବ୍ୟ ସମୟ',
    'Expected Return': 'ଫେରିବାର ସମୟ',
    'Parent Contact': 'ଅଭିଭାବକଙ୍କ ସମ୍ପର୍କ',
    'Parent Contact Verified': 'ଅଭିଭାବକଙ୍କ ଯାଞ୍ଚ ସମ୍ପନ୍ନ',
    'Parent Phone Number': 'ଅଭିଭାବକଙ୍କ ଫୋନ୍ ନମ୍ବର',
    'Download Pass PDF': 'ପାସ୍ PDF ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
    'View QR Code': 'QR କୋଡ୍ ଦେଖନ୍ତୁ',
    'Gate Pass History': 'ଗେଟ୍ ପାସ୍ ଇତିହାସ',
    'Recent Gate Passes': 'ସାମ୍ପ୍ରତିକ ଗେଟ୍ ପାସ୍',
    'No active gate passes': 'କୌଣସି ସକ୍ରିୟ ଗେଟ୍ ପାସ୍ ନାହିଁ',
    'Submit Gate Pass Request': 'ଗେଟ୍ ପାସ୍ ଅନୁରୋଧ ଦାଖଲ କରନ୍ତୁ',

    // Room Selection
    'Hostel Room Allocation': 'ହଷ୍ଟେଲ୍ ରୁମ୍ ଆବଣ୍ଟନ',
    'Book Bed': 'ବେଡ୍ ବୁକ୍ କରନ୍ତୁ',
    'Confirm Bed Booking': 'ବେଡ୍ ବୁକିଂ ନିଶ୍ଚିତ କରନ୍ତୁ',
    'Hostel Block A': 'ହଷ୍ଟେଲ୍ ବ୍ଲକ୍ A',
    'Hostel Block B': 'ହଷ୍ଟେଲ୍ ବ୍ଲକ୍ B',
    'Hostel Block C': 'ହଷ୍ଟେଲ୍ ବ୍ଲକ୍ C',
    'Floor': 'ମହଲା',
    'Floor 1': 'ପ୍ରଥମ ମହଲା',
    'Floor 2': 'ଦ୍ୱିତୀୟ ମହଲା',
    'Floor 3': 'ତୃତୀୟ ମହଲା',
    'Available Beds': 'ଉପଲବ୍ଧ ବେଡ୍',
    'Occupied': 'ଅଧିକୃତ',
    'Vacant': 'ଖାଲି',
    'Selected': 'ମନୋନୀତ',
    'Bed': 'ବେଡ୍',
    'Bed A': 'ବେଡ୍ A',
    'Bed B': 'ବେଡ୍ B',
    'Bed C': 'ବେଡ୍ C',
    'Room Details': 'ରୁମ୍ ବିବରଣୀ',
    'Facilities': 'ସୁବିଧାସୁଯୋଗ',
    'Attached Washroom': 'ସଂଲଗ୍ନ ଶୌଚାଳୟ',
    'Balcony': 'ବାଲକୋନି',
    'Study Table': 'ପଢ଼ା ଟେବୁଲ୍',
    'High-Speed Wi-Fi': 'ହାଇ-ସ୍ପିଡ୍ ୱାଇ-ଫାଇ',

    // Maintenance Complaints
    'Hostel Complaints & Maintenance': 'ହଷ୍ଟେଲ୍ ଅଭିଯୋଗ ଓ ରକ୍ଷଣାବେକ୍ଷଣ',
    'Log Maintenance Complaint': 'ମରାମତି ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ',
    'Trade / Category': 'କାର୍ଯ୍ୟ ବର୍ଗ',
    'Category': 'ବର୍ଗ',
    'Electrical': 'ବିଦ୍ୟୁତ୍',
    'Plumbing': 'ପାଇପ୍ / ପ୍ଲମ୍ବିଂ',
    'Carpentry': 'କାଠ କାମ / କାର୍ପେଣ୍ଟ୍ରି',
    'Wi-Fi': 'ୱାଇ-ଫାଇ',
    'Wi-Fi / Internet': 'ୱାଇ-ଫାଇ / ଇଣ୍ଟରନେଟ୍',
    'Air Conditioning': 'ଏୟାର କଣ୍ଡିସନର',
    'Appliance': 'ଉପକରଣ',
    'Cleaning': 'ସଫେଇ',
    'Priority': 'ପ୍ରାଥମିକତା',
    'Low': 'କମ୍',
    'Medium': 'ମଧ୍ୟମ',
    'High': 'ଉଚ୍ଚ',
    'Critical': 'ଜରୁରୀ / ଗୁରୁତର',
    'Title': 'ଶୀର୍ଷକ',
    'Description': 'ବିବରଣୀ',
    'Assigned Technician': 'ନିଯୁକ୍ତ ଟେକ୍ନିସିଆନ୍',
    'Resolution Status': 'ସମାଧାନ ସ୍ଥିତି',
    'Submit Ticket': 'ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ',
    'Submit Complaint': 'ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ',

    // Mess & Cafeteria Ordering
    'Hostel Mess & Cafeteria': 'ହଷ୍ଟେଲ୍ ମେସ୍ ଓ କ୍ୟାଣ୍ଟିନ୍',
    'Order to Room': 'ରୁମ୍ କୁ ଅର୍ଡର କରନ୍ତୁ',
    'Today\'s Specials': 'ଆଜିର ସ୍ପେଶାଲ୍',
    'Daily Menu': 'ଦୈନିକ ମେନୁ',
    'Breakfast': 'ପ୍ରାତଃରାଶ',
    'Lunch': 'ମଧ୍ୟାହ୍ନ ଭୋଜନ',
    'Snacks': 'ଜଳଖିଆ',
    'Dinner': 'ରାତ୍ରି ଭୋଜନ',
    'Cart': 'କାର୍ଟ',
    'Item': 'ଖାଦ୍ୟ ସାମଗ୍ରୀ',
    'Price': 'ମୂଲ୍ୟ',
    'Qty': 'ପରିମାଣ',
    'Quantity': 'ପରିମାଣ',
    'Total Amount': 'ମୋଟ ରାଶି',
    'Place Order': 'ଅର୍ଡର ଦିଅନ୍ତୁ',
    'Delivery to Room': 'ରୁମ୍ କୁ ଡେଲିଭରୀ',
    'Order Status': 'ଅର୍ଡର ସ୍ଥିତି',
    'Preparing': 'ପ୍ରସ୍ତୁତ ହେଉଛି',
    'Out for Delivery': 'ଡେଲିଭରୀ ପାଇଁ ବାହାରିଛି',
    'In Transit': 'ବାଟରେ ଅଛି',
    'Delivered': 'ଡେଲିଭର୍ ହୋଇଛି',
    'Cancelled': 'ବାତିଲ୍ ହୋଇଛି',
    'Add to Cart': 'କାର୍ଟରେ ଯୋଡନ୍ତୁ',
    'Items in Cart': 'କାର୍ଟରେ ଥିବା ସାମଗ୍ରୀ',

    // Warden Dashboard
    'Warden & Administration Console': 'ୱାର୍ଡେନ୍ ଏବଂ ପ୍ରଶାସନ କନସୋଲ୍',
    'Campus Safety & Hostel Oversight': 'କ୍ୟାମ୍ପସ୍ ସୁରକ୍ଷା ଓ ହଷ୍ଟେଲ୍ ନିରୀକ୍ଷଣ',
    '10:30 PM Night Roll Call': 'ରାତି ୧୦:୩୦ ଉପସ୍ଥିତି',
    'Night Roll Call': 'ରାତ୍ରିକାଳୀନ ଉପସ୍ଥିତି',
    'Gate Pass Approvals': 'ଗେଟ୍ ପାସ୍ ଅନୁମୋଦନ',
    'Hostel Occupancy & Bed Allocation': 'ହଷ୍ଟେଲ୍ ଅଧିକୃତି ଓ ବେଡ୍ ଆବଣ୍ଟନ',
    'Analytics & AI Deduplication': 'ବିଶ୍ଳେଷଣ ଏବଂ AI ଡିଡୁପ୍ଲିକେସନ୍',
    'Total Residents': 'ମୋଟ ଅନ୍ତେବାସୀ',
    'Present in Hostel': 'ହଷ୍ଟେଲ୍ ରେ ଉପସ୍ଥିତ',
    'Inside Hostel': 'ହଷ୍ଟେଲ୍ ଭିତରେ',
    'Out on Valid Pass': 'ବୈଧ ପାସ୍ ରେ ବାହାରେ',
    'Curfew Overdue Alert': 'କର୍ଫ୍ୟୁ ସମୟ ଚେତାବନୀ',
    'Overdue Alert': 'ସମୟ ଅତିକ୍ରାନ୍ତ ସତର୍କତା',
    'Pending Passes': 'ବିଚାରାଧୀନ ପାସ୍',
    'Pending Approvals': 'ବିଚାରାଧୀନ ଅନୁମୋଦନ',
    'Night Roll Call - Attendance Roster': 'ରାତ୍ରିକାଳୀନ ଉପସ୍ଥିତି ତାଲିକା',
    'Mark All Present': 'ସମସ୍ତଙ୍କୁ ଉପସ୍ଥିତ ଚିହ୍ନିତ କରନ୍ତୁ',
    'Search student by name, roll, or room...': 'ଛାତ୍ରଙ୍କ ନାମ, ରୋଲ୍ କିମ୍ବା ରୁମ୍ ଦ୍ୱାରା ଖୋଜନ୍ତୁ...',
    'Mark Present': 'ଉପସ୍ଥିତ ଚିହ୍ନିତ କରନ୍ତୁ',
    'Mark Late / Absent': 'ଅନୁପସ୍ଥିତ ଚିହ୍ନିତ କରନ୍ତୁ',
    'Mark Absent': 'ଅନୁପସ୍ଥିତ ଚିହ୍ନିତ କରନ୍ତୁ',
    'Student Name': 'ଛାତ୍ରଙ୍କ ନାମ',
    'Roll Number': 'ରୋଲ୍ ନମ୍ବର',
    'Action': 'କାର୍ଯ୍ୟ',
    'Actions': 'କାର୍ଯ୍ୟାନୁଷ୍ଠାନ',
    'Pending Gate Pass Requests': 'ବିଚାରାଧୀନ ଗେଟ୍ ପାସ୍ ଅନୁରୋଧ',
    'Approve': 'ଅନୁମୋଦନ',
    'Reject': 'ପ୍ରତ୍ୟାଖ୍ୟାନ',
    'Approve All': 'ସମସ୍ତ ଅନୁମୋଦନ କରନ୍ତୁ',
    'Reject All': 'ସମସ୍ତ ପ୍ରତ୍ୟାଖ୍ୟାନ କରନ୍ତୁ',
    'Quick Actions': 'ଦ୍ରୁତ କାର୍ଯ୍ୟାନୁଷ୍ଠାନ',
    'Parent Verified': 'ଅଭିଭାବକ ଯାଞ୍ଚ ହୋଇଛି',
    'Rejection Reason': 'ପ୍ରତ୍ୟାଖ୍ୟାନର କାରଣ',
    'AI Deduplication Grouped Tickets': 'AI ସମାନ ଅଭିଯୋଗ ଗୋଷ୍ଠୀ',
    'Cluster': 'କ୍ଲଷ୍ଟର୍',
    'Similar Complaints': 'ସମାନ ଅଭିଯୋଗ',
    'Assign Plumber': 'ପ୍ଲମ୍ବର ନିଯୁକ୍ତ କରନ୍ତୁ',
    'Assign Electrician': 'ଇଲେକ୍ଟ୍ରିସିଆନ୍ ନିଯୁକ୍ତ କରନ୍ତୁ',
    'Automated Warden Night Report': 'ୱାର୍ଡେନ୍ ସ୍ୱୟଂଚାଳିତ ରାତ୍ରି ରିପୋର୍ଟ',

    // Technician Desk
    'Technician Service Desk': 'ଟେକ୍ନିସିଆନ୍ ସେବା ଡେସ୍କ',
    'Campus Facility Maintenance & Repairs': 'କ୍ୟାମ୍ପସ୍ ରକ୍ଷଣାବେକ୍ଷଣ ଓ ମରାମତି',
    'All Tickets': 'ସମସ୍ତ ଟିକେଟ୍',
    'Open Tickets': 'ଖୋଲା ଟିକେଟ୍',
    'Assigned to Me': 'ମୋତେ ନ୍ୟସ୍ତ ଟିକେଟ୍',
    'In Progress': 'କାର୍ଯ୍ୟ ଚାଲୁଅଛି',
    'Resolved Tickets': 'ସମାଧାନ ହୋଇଥିବା ଟିକେଟ୍',
    'Start Work': 'କାମ ଆରମ୍ଭ କରନ୍ତୁ',
    'Mark Resolved': 'ସମାଧାନ ଚିହ୍ନିତ କରନ୍ତୁ',
    'Add Remarks': 'ମନ୍ତବ୍ୟ ଯୋଡନ୍ତୁ',
    'Resolution Notes': 'ସମାଧାନ ଟିପ୍ପଣୀ',
    'Upload Proof': 'ପ୍ରମାଣ ଅପଲୋଡ୍ କରନ୍ତୁ',
    'Ticket ID': 'ଟିକେଟ୍ ID',
    'Room Number': 'ରୁମ୍ ନମ୍ବର',
    'Reported By': 'ଅଭିଯୋଗକାରୀ',
    'Time Logged': 'ଦାଖଲ ସମୟ',
    'Urgent': 'ଜରୁରୀ',
    'Task Activity Timestamps': 'କାର୍ଯ୍ୟ ସମୟରେଖା ଓ ସ୍ଥିତି',
    'Task Created': 'କାର୍ଯ୍ୟ ସୃଷ୍ଟି ହୋଇଛି',
    'Task Assigned': 'କାର୍ଯ୍ୟ ନ୍ୟସ୍ତ ହୋଇଛି',
    'Task Resolved': 'କାର୍ଯ୍ୟ ସମାଧାନ ହୋଇଛି',
    'Task Rejected': 'କାର୍ଯ୍ୟ ପ୍ରତ୍ୟାଖ୍ୟାନ ହୋଇଛି',
    'Open Requisition': 'ଖୋଲା ଅନୁରୋଧ',
    'Pending Assignment': 'ନ୍ୟସ୍ତ ହେବା ବାକି',
    'Pending Resolution': 'ସମାଧାନ ବାକି',
    'Pending Action': 'କାର୍ଯ୍ୟାନୁଷ୍ଠାନ ବାକି',
    'Awaiting Warden': 'ୱାର୍ଡେନ୍ ଅନୁମୋଦନ ବାକି',
    'Awaiting Action': 'କାର୍ଯ୍ୟାନୁଷ୍ଠାନ ବାକି',
    'Awaiting Fix': 'ମରାମତି ବାକି',
    'Resolution': 'ସମାଧାନ',

    // Security Guard Terminal
    'Gate Security Terminal': 'ଗେଟ୍ ସୁରକ୍ଷା ଟର୍ମିନାଲ୍',
    'Authorized In/Out Movement Monitor': 'ଅନୁମୋଦିତ ପ୍ରବେଶ/ପ୍ରସ୍ଥାନ ନିରୀକ୍ଷଣ',
    'Scan Pass QR': 'ପାସ୍ QR ସ୍କାନ୍ କରନ୍ତୁ',
    'Scan Pass QR Code': 'ପାସ୍ QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ',
    'Passcode Search': 'ପାସକୋଡ୍ ସନ୍ଧାନ',
    'Student Exit Logger': 'ଛାତ୍ର ପ୍ରସ୍ଥାନ ଲଗର୍',
    'Student Entry Logger': 'ଛାତ୍ର ପ୍ରବେଶ ଲଗର୍',
    'Log Student Exit': 'ଛାତ୍ର ପ୍ରସ୍ଥାନ ଲଗ୍ କରନ୍ତୁ',
    'Log Student Entry': 'ଛାତ୍ର ପ୍ରବେଶ ଲଗ୍ କରନ୍ତୁ',
    'Log Exit': 'ପ୍ରସ୍ଥାନ ଲଗ୍ କରନ୍ତୁ',
    'Log Entry': 'ପ୍ରବେଶ ଲଗ୍ କରନ୍ତୁ',
    'Recent Gate Logs': 'ସାମ୍ପ୍ରତିକ ଗେଟ୍ ଲଗ୍',
    'Authorized Passes': 'ଅନୁମୋଦିତ ପାସ୍',
    'Enter Pass Code': 'ପାସ୍ କୋଡ୍ ପ୍ରବେଶ କରନ୍ତୁ',
    'Verify Pass': 'ପାସ୍ ଯାଞ୍ଚ କରନ୍ତୁ',
    'Authorized Until': 'ବୈଧ ସମୟ ସୀମା',
    'Curfew Overdue Warning': 'କର୍ଫ୍ୟୁ ସମୟ ସମାପ୍ତ ଚେତାବନୀ',

    // Mess Management
    'Mess & Dining Operations': 'ମେସ୍ ଓ ଖାଦ୍ୟ ପରିଚାଳନା',
    'Cafeteria Management & Order Fulfillment': 'କ୍ୟାଣ୍ଟିନ୍ ପରିଚାଳନା ଓ ଅର୍ଡର ଯୋଗାଣ',
    'Live Kitchen Orders': 'ଲାଇଭ୍ ରୋଷେଇ ଅର୍ଡର',
    'Daily Mess Menu': 'ଦୈନିକ ମେସ୍ ମେନୁ',
    'Inventory & Stocks': 'ଷ୍ଟକ୍ ଓ ସାମଗ୍ରୀ',
    'Feedback & Ratings': 'ମତାମତ ଓ ମୂଲ୍ୟାଙ୍କନ',
    'Order ID': 'ଅର୍ଡର ID',
    'Delivery Room': 'ଡେଲିଭରୀ ରୁମ୍',
    'Items': 'ସାମଗ୍ରୀ',
    'Mark Preparing': 'ପ୍ରସ୍ତୁତି ଚିହ୍ନିତ କରନ୍ତୁ',
    'Mark Out for Delivery': 'ଡେଲିଭରୀ ପାଇଁ ବାହାରିଛି',
    'Mark Delivered': 'ଡେଲିଭର୍ ହୋଇଛି',
    'Cancel Order': 'ଅର୍ଡର ବାତିଲ୍ କରନ୍ତୁ',

    // Self-Service Kiosk
    'Campus Self-Service Kiosk': 'କ୍ୟାମ୍ପସ୍ ସ୍ୱୟଂସେବା କିଓସ୍କ',
    'Touch to Begin': 'ଆରମ୍ଭ କରିବା ପାଇଁ ସ୍ପର୍ଶ କରନ୍ତୁ',
    'Print Kiosk Slip': 'କିଓସ୍କ ସ୍ଲିପ୍ ପ୍ରିଣ୍ଟ କରନ୍ତୁ',
    'Print Gate Pass Slip': 'ଗେଟ୍ ପାସ୍ ସ୍ଲିପ୍ ପ୍ରିଣ୍ଟ କରନ୍ତୁ',
    'Quick Complaint': 'ଦ୍ରୁତ ଅଭିଯୋଗ',
    'Log Quick Complaint': 'ଦ୍ରୁତ ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ',
    'Express Attendance Check-in': 'ଦ୍ରୁତ ଉପସ୍ଥିତି ଚେକ୍-ଇନ୍',
    'Night Curfew Check-in': 'ରାତ୍ରିକାଳୀନ କର୍ଫ୍ୟୁ ଚେକ୍-ଇନ୍',
    'Mess Menu Today': 'ଆଜିର ମେସ୍ ମେନୁ',

    // Admin Portal
    'System Administration Portal': 'ସିଷ୍ଟମ୍ ପ୍ରଶାସନ ପୋର୍ଟାଲ୍',
    'Central Operations Management': 'କେନ୍ଦ୍ରୀୟ ପରିଚାଳନା ବ୍ୟବସ୍ଥା',
    'Overview': 'ସମୀକ୍ଷା',
    'User Management': 'ୟୁଜର୍ ପରିଚାଳନା',
    'Campus Operations': 'କ୍ୟାମ୍ପସ୍ ପରିଚାଳନା',
    'Reports & Analytics': 'ରିପୋର୍ଟ ଏବଂ ବିଶ୍ଳେଷଣ',
    'System Settings': 'ସିଷ୍ଟମ୍ ସେଟିଂସ୍',
    'Total Students': 'ମୋଟ ଛାତ୍ରଛାତ୍ରୀ',
    'Total Staff': 'ମୋଟ କର୍ମଚାରୀ',
    'Active Gate Passes': 'ସକ୍ରିୟ ଗେଟ୍ ପାସ୍',
    'Open Maintenance Tickets': 'ଖୋଲା ମରାମତି ଟିକେଟ୍',
    'Total Cafeteria Revenue': 'କ୍ୟାଣ୍ଟିନ୍ ର ମୋଟ ଆୟ',
    'Pending Staff Requests': 'ବିଚାରାଧୀନ କର୍ମଚାରୀ ଅନୁରୋଧ',
    'General Settings': 'ସାଧାରଣ ସେଟିଂସ୍',
    'System Notifications': 'ସିଷ୍ଟମ୍ ବିଜ୍ଞପ୍ତି',
    'Language': 'ଭାଷା',
    'Timezone': 'ସମୟ ମଣ୍ଡଳ',
    'Date Format': 'ତାରିଖ ଫର୍ମାଟ୍',
    'Feature Flags': 'ଫିଚର୍ ଫ୍ଲାଗ୍',
    'Save Settings': 'ସେଟିଂସ୍ ସଂରକ୍ଷଣ କରନ୍ତୁ',
    'Export Report': 'ରିପୋର୍ଟ ଏକ୍ସପୋର୍ଟ କରନ୍ତୁ',
    'Search roll number, room or name...': 'ରୋଲ୍ ନମ୍ବର, ରୁମ୍ କିମ୍ବା ନାମ ଖୋଜନ୍ତୁ...',
    'Approve Staff': 'କର୍ମଚାରୀ ଅନୁମୋଦନ କରନ୍ତୁ',
    'Reject Staff': 'କର୍ମଚାରୀ ପ୍ରତ୍ୟାଖ୍ୟାନ କରନ୍ତୁ',

    // Statuses & Actions
    'Approved': 'ଅନୁମୋଦିତ',
    'Rejected': 'ପ୍ରତ୍ୟାଖ୍ୟାତ',
    'Pending': 'ବିଚାରାଧୀନ',
    'Pending Approval': 'ଅନୁମୋଦନ ପାଇଁ ବିଚାରାଧୀନ',
    'Checked Out': 'ବାହାରକୁ ଯାଇଛନ୍ତି',
    'Completed': 'ସମ୍ପୂର୍ଣ୍ଣ',
    'Overdue': 'ସମୟ ଅତିକ୍ରାନ୍ତ',
    'Curfew Overdue': 'କର୍ଫ୍ୟୁ ସମୟ ସମାପ୍ତ',
    'Open': 'ଖୋଲା ଅଛି',
    'Resolved': 'ସମାଧାନ ହୋଇଛି',
    'Submit': 'ଦାଖଲ କରନ୍ତୁ',
    'Cancel': 'ବାତିଲ୍ କରନ୍ତୁ',
    'Save': 'ସଂରକ୍ଷଣ କରନ୍ତୁ',
    'Close': 'ବନ୍ଦ କରନ୍ତୁ',
    'Close Modal': 'ବନ୍ଦ କରନ୍ତୁ',
    'Search': 'ଖୋଜନ୍ତୁ',
    'Refresh': 'ରିଫ୍ରେସ୍ କରନ୍ତୁ',
    'Delete': 'ମିଟାନ୍ତୁ',
    'Edit': 'ସଂପାଦନ କରନ୍ତୁ',
    'View': 'ଦେଖନ୍ତୁ',
    'Download': 'ଡାଉନଲୋଡ୍',
    'Print': 'ପ୍ରିଣ୍ଟ',
    'Success': 'ସଫଳତା',
    'Error': 'ତ୍ରୁଟି',
    'Warning': 'ଚେତାବନୀ',
    'Loading...': 'ଲୋଡ୍ ହେଉଛି...',
    'No records found': 'କୌଣସି ତଥ୍ୟ ମିଳିଲା ନାହିଁ',
    'All': 'ସମସ୍ତ',
    'Active': 'ସକ୍ରିୟ',
    'Inactive': 'ନିଷ୍କ୍ରିୟ',
    'Date': 'ତାରିଖ',
    'Time': 'ସମୟ',
    'Name': 'ନାମ',
    'Email': 'ଇମେଲ୍',
    'Status': 'ସ୍ଥିତି',
  },
  hi: {
    // Brand & Header
    'FretOps Central': 'फ्रेटऑप्स सेंट्रल',
    'FretOps': 'फ्रेटऑप्स',
    'Central': 'सेंट्रल',
    'Zero-Queue Campus & Hostel Operations': 'शून्य-कतार कैंपस और हॉस्टल प्रबंधन',
    'Zero-Queue Campus & Hostel Operations Platform': 'शून्य-कतार कैंपस और हॉस्टल प्रबंधन मंच',
    'Admin Switcher:': 'एडमिन स्विचर:',
    'Admin Switcher': 'एडमिन स्विचर',
    'Rollout Playbook': 'रोलआउट प्लेबुक',
    'Emergency Siren': 'आपातकालीन सायरन',
    '2G Mode': '2जी मोड',
    '2G Mode On': '2जी मोड चालू',
    'Toggle low-bandwidth lightweight mode': '2जी कम डेटा मोड बदलें',
    'Logout': 'लॉग आउट',
    'Sign Out': 'लॉग आउट',
    'Sign out of your account': 'अपने खाते से लॉग आउट करें',
    'Logged in as': 'के रूप में लॉग इन',
    'Role': 'भूमिका',
    'Phone': 'फोन',
    'Hostel': 'हॉस्टल',
    'Room': 'कमरा',
    'Staff Verification': 'कर्मचारी सत्यापन',
    'Notifications': 'सूचनाएं',
    'Mark all as read': 'सभी पढ़ा हुआ चिन्हित करें',
    'No unread notifications': 'कोई नई सूचना नहीं है',
    'Reset Demo State': 'डेमो रीसेट करें',
    'Reset demo data to initial mock state?': 'क्या आप डेमो डेटा को प्रारंभिक स्थिति में रीसेट करना चाहते हैं?',
    'Problem Statement 7 Implementation': 'समस्या विवरण 7 कार्यान्वयन',

    // Role Names
    'Student Portal': 'विद्यार्थी पोर्टल',
    'Warden & Admin': 'वार्डन और एडमिन',
    'Technician Desk': 'तकनीशियन डेस्क',
    'Gate Security': 'गेट सुरक्षा गार्ड',
    'Mess & Cafeteria': 'मेस और कैफेटेरिया',
    'Lobby Kiosk': 'लॉबी कियोस्क',
    'System Administration': 'प्रणाली प्रशासन',

    // Emergency Alert & Siren
    'EMERGENCY SIREN BROADCAST ACTIVE:': 'आपातकालीन सायरन प्रसारण सक्रिय:',
    'Open Emergency HUD': 'आपातकालीन HUD खोलें',
    'CRITICAL CAMPUS EMERGENCY ALERT': 'गंभीर कैंपस आपातकालीन चेतावनी',
    'Emergency Siren & Evacuation Console': 'आपातकालीन सायरन एवं निकासी कंसोल',
    'Loud ambulance override siren (6s audio burst) · Mute bypass protocol': 'तेज़ एम्बुलेंस सायरन (6 सेकंड) · म्यूट बाईपास प्रोटोकॉल',
    'Campus-Wide Mandatory Fire Evacuation Drill': 'कैंपस-व्यापी अनिवार्य अग्नि निकासी ड्रिल',
    'All hostel residents, staff, and faculty must immediately proceed to designated assembly areas via fire exit stairwells.': 'सभी हॉस्टल निवासी, कर्मचारी व प्राध्यापक तुरंत आपातकालीन सीढ़ियों से निर्धारित सभा स्थल पर पहुंचें।',
    'Designated Muster Assembly Point:': 'निर्धारित सभा स्थल:',
    'Designated Muster Assembly Point': 'निर्धारित सभा स्थल',
    'Main Athletics Track & Football Field (Zone A)': 'मुख्य खेल मैदान और फुटबॉल ग्राउंड (ज़ोन A)',
    'Main Athletics Track & Football Field': 'मुख्य खेल मैदान और फुटबॉल ग्राउंड',
    'Safe Check-In Headcount': 'सुरक्षित उपस्थिति गणना',
    '/ 856 students verified': '/ 856 छात्र सत्यापित',
    'students verified': 'छात्र सत्यापित',
    'I Am Safe (Muster Check-in)': 'मैं सुरक्षित हूँ (चेक-इन)',
    'You are registered SAFE at muster point': 'आप सभा स्थल पर सुरक्षित रूप से पंजीकृत हैं',
    'Replay Siren (6s)': 'सायरन पुनः बजाएं (6 सेकंड)',
    'Test Siren Audio (6s)': 'सायरन ऑडियो टेस्ट (6 सेकंड)',
    'Stop Siren Audio': 'सायरन ऑडियो रोकें',
    'Close Console': 'कंसोल बंद करें',
    'Turn Off Alert Message': 'अलर्ट संदेश बंद करें',
    'Turn Off Alert': 'अलर्ट बंद करें',
    'Emergency Alert is currently active across the campus.': 'इमरजेंसी अलर्ट वर्तमान में पूरे परिसर में सक्रिय है।',
    'Turn off emergency alert across campus': 'परिसर में आपातकालीन अलर्ट बंद करें',
    'Turn off this emergency alert broadcast': 'इस आपातकालीन अलर्ट प्रसारण को बंद करें',
    'All-Clear / End Emergency': 'ऑल-क्लियर / इमरजेंसी समाप्त',
    'Emergency Incident Type': 'आपातकाल घटना प्रकार',
    'Fire Drill': 'अग्नि ड्रिल',
    'Severe Storm': 'भीषण आंधी-तूफान',
    'Lockdown': 'लॉकडाउन',
    'Medical Code': 'चिकित्सा आपातकाल',
    'Severe Thunderstorm & High-Wind Warning': 'भारी बारिश व तेज़ हवा की चेतावनी',
    'Remain inside hostel rooms; close balcony doors': 'हॉस्टल कमरों में ही रहें; बालकनी के दरवाजे बंद रखें',
    'Alert Headline': 'अलर्ट शीर्षक',
    'Urgent Student Instructions': 'छात्रों के लिए आवश्यक निर्देश',
    'Broadcast Campus Siren': 'कैंपस सायरन बजाएं',

    // Student Portal Tabs & General
    'Welcome back,': 'स्वागत है,',
    'Hostel Resident Portal': 'छात्रावास निवासी पोर्टल',
    'Active Student': 'सक्रिय छात्र',
    'Gate Passes': 'गेट पास',
    'Room Selection': 'कमरा चयन',
    'Complaints & Maintenance': 'शिकायत व रखरखाव',
    'Mess & Dining': 'मेस और खान-पान',
    'Academic Verification': 'शैक्षणिक सत्यापन',
    'Active Gate Pass': 'सक्रिय गेट पास',
    'Digital Out-Pass': 'डिजिटल आउट-पास',
    'Request Gate Pass': 'गेट पास का अनुरोध करें',
    'Request Hostel Gate Pass': 'हॉस्टल गेट पास अनुरोध',
    'Pass Code': 'पास कोड',
    'Pass Type': 'पास प्रकार',
    'Day Pass': 'डे पास',
    'Late Night Pass': 'लेट नाइट पास',
    'Weekend Leave': 'वीकेंड अवकाश',
    'Emergency Leave': 'आपातकालीन छुट्टी',
    'Destination': 'गंतव्य',
    'Purpose': 'कारण',
    'Departure Time': 'प्रस्थान समय',
    'Out Time': 'बाहर जाने का समय',
    'Expected In-Time': 'अपेक्षित वापसी समय',
    'Expected Return': 'अपेक्षित वापसी',
    'Parent Contact': 'अभिभावक संपर्क',
    'Parent Contact Verified': 'अभिभावक संपर्क सत्यापित',
    'Parent Phone Number': 'अभिभावक का फोन नंबर',
    'Download Pass PDF': 'पास PDF डाउनलोड करें',
    'View QR Code': 'QR कोड देखें',
    'Gate Pass History': 'गेट पास इतिहास',
    'Recent Gate Passes': 'हाल के गेट पास',
    'No active gate passes': 'कोई सक्रिय गेट पास नहीं है',
    'Submit Gate Pass Request': 'गेट पास अनुरोध जमा करें',

    // Room Selection
    'Hostel Room Allocation': 'हॉस्टल कमरा आवंटन',
    'Book Bed': 'बेड बुक करें',
    'Confirm Bed Booking': 'बेड बुकिंग सुरक्षित करें',
    'Hostel Block A': 'हॉस्टल ब्लॉक A',
    'Hostel Block B': 'हॉस्टल ब्लॉक B',
    'Hostel Block C': 'हॉस्टल ब्लॉक C',
    'Floor': 'मंजिल',
    'Floor 1': 'पहली मंजिल',
    'Floor 2': 'दूसरी मंजिल',
    'Floor 3': 'तीसरी मंजिल',
    'Available Beds': 'उपलब्ध बेड',
    'Occupied': 'भरा हुआ',
    'Vacant': 'खाली',
    'Selected': 'चुना गया',
    'Bed': 'बेड',
    'Bed A': 'बेड A',
    'Bed B': 'बेड B',
    'Bed C': 'बेड C',
    'Room Details': 'कमरे का विवरण',
    'Facilities': 'सुविधाएं',
    'Attached Washroom': 'अटैच्ड बाथरूम',
    'Balcony': 'बालकनी',
    'Study Table': 'स्टडी टेबल',
    'High-Speed Wi-Fi': 'हाई-स्पीड वाई-फाई',

    // Maintenance Complaints
    'Hostel Complaints & Maintenance': 'हॉस्टल मरम्मत व शिकायतें',
    'Log Maintenance Complaint': 'मरम्मत शिकायत दर्ज करें',
    'Trade / Category': 'कार्य श्रेणी',
    'Category': 'श्रेणी',
    'Electrical': 'विद्युत',
    'Plumbing': 'नलसाजी / प्लंबिंग',
    'Carpentry': 'बढ़ईगीरी / लकड़ी का काम',
    'Wi-Fi': 'वाई-फाई',
    'Wi-Fi / Internet': 'वाई-फाई / इंटरनेट',
    'Air Conditioning': 'एयर कंडीशनिंग',
    'Appliance': 'उपकरण',
    'Cleaning': 'सफाई',
    'Priority': 'प्राथमिकता',
    'Low': 'निम्न',
    'Medium': 'मध्यम',
    'High': 'उच्च',
    'Critical': 'गंभीर / अति-आवश्यक',
    'Title': 'शीर्षक',
    'Description': 'विवरण',
    'Assigned Technician': 'नियुक्त तकनीशियन',
    'Resolution Status': 'समाधान स्थिति',
    'Submit Ticket': 'शिकायत दर्ज करें',
    'Submit Complaint': 'शिकायत दर्ज करें',

    // Mess & Cafeteria Ordering
    'Hostel Mess & Cafeteria': 'हॉस्टल मेस व कैफेटेरिया',
    'Order to Room': 'कमरे में भोजन मंगाएं',
    'Today\'s Specials': 'आज का विशेष',
    'Daily Menu': 'दैनिक मेनू',
    'Breakfast': 'नाश्ता',
    'Lunch': 'दोपहर का भोजन',
    'Snacks': 'जलपान',
    'Dinner': 'रात का भोजन',
    'Cart': 'कार्ट',
    'Item': 'व्यंजन',
    'Price': 'मूल्य',
    'Qty': 'मात्रा',
    'Quantity': 'मात्रा',
    'Total Amount': 'कुल राशि',
    'Place Order': 'ऑर्डर दें',
    'Delivery to Room': 'कमरे में डिलीवरी',
    'Order Status': 'ऑर्डर स्थिति',
    'Preparing': 'तैयार हो रहा है',
    'Out for Delivery': 'डिलीवरी के लिए निकला है',
    'In Transit': 'मार्ग में है',
    'Delivered': 'डिलीवर हो चुका',
    'Cancelled': 'रद्द किया गया',
    'Add to Cart': 'कार्ट में जोड़ें',
    'Items in Cart': 'कार्ट में व्यंजन',

    // Warden Dashboard
    'Warden & Administration Console': 'वार्डन और प्रशासन कंसोल',
    'Campus Safety & Hostel Oversight': 'परिसर सुरक्षा एवं हॉस्टल निगरानी',
    '10:30 PM Night Roll Call': 'रात 10:30 बजे की उपस्थिति',
    'Night Roll Call': 'रात्रि उपस्थिति',
    'Gate Pass Approvals': 'गेट पास अनुमोदन',
    'Hostel Occupancy & Bed Allocation': 'हॉस्टल अधिभोग और बेड आवंटन',
    'Analytics & AI Deduplication': 'एनालिटिक्स व AI डुप्लीकेट छँटाई',
    'Total Residents': 'कुल निवासी',
    'Present in Hostel': 'हॉस्टल में उपस्थित',
    'Inside Hostel': 'हॉस्टल के भीतर',
    'Out on Valid Pass': 'मान्य पास पर बाहर',
    'Curfew Overdue Alert': 'समय सीमा उल्लंघन चेतावनी',
    'Overdue Alert': 'समय समाप्ति चेतावनी',
    'Pending Passes': 'लंबित पास',
    'Pending Approvals': 'लंबित अनुमोदन',
    'Night Roll Call - Attendance Roster': 'रात्रि उपस्थिति पंजी',
    'Mark All Present': 'सभी को उपस्थित चिन्हित करें',
    'Search student by name, roll, or room...': 'छात्र का नाम, रोल नंबर या कमरा खोजें...',
    'Mark Present': 'उपस्थित चिन्हित करें',
    'Mark Late / Absent': 'अनुपस्थित चिन्हित करें',
    'Mark Absent': 'अनुपस्थित चिन्हित करें',
    'Student Name': 'विद्यार्थी का नाम',
    'Roll Number': 'रोल नंबर',
    'Action': 'कार्य',
    'Actions': 'कार्रवाइयां',
    'Pending Gate Pass Requests': 'लंबित गेट पास अनुरोध',
    'Approve': 'स्वीकृत करें',
    'Reject': 'अस्वीकार करें',
    'Approve All': 'सभी स्वीकृत करें',
    'Reject All': 'सभी अस्वीकार करें',
    'Quick Actions': 'त्वरित कार्रवाई',
    'Parent Verified': 'अभिभावक सत्यापित',
    'Rejection Reason': 'अस्वीकृति का कारण',
    'AI Deduplication Grouped Tickets': 'समान शिकायतों का AI समूह',
    'Cluster': 'समूह',
    'Similar Complaints': 'समान शिकायतें',
    'Assign Plumber': 'प्लंबर नियुक्त करें',
    'Assign Electrician': 'इलेक्ट्रीशियन नियुक्त करें',
    'Automated Warden Night Report': 'वार्डन स्वचालित रात्रि रिपोर्ट',

    // Technician Desk
    'Technician Service Desk': 'तकनीशियन सेवा डेस्क',
    'Campus Facility Maintenance & Repairs': 'परिसर सुविधा रखरखाव व मरम्मत',
    'All Tickets': 'सभी टिकट',
    'Open Tickets': 'खुली शिकायतें',
    'Assigned to Me': 'मुझे सौंपे गए',
    'In Progress': 'प्रगति पर',
    'Resolved Tickets': 'हल की गई शिकायतें',
    'Start Work': 'काम शुरू करें',
    'Mark Resolved': 'हल चिन्हित करें',
    'Add Remarks': 'टिप्पणी जोड़ें',
    'Resolution Notes': 'समाधान विवरण',
    'Upload Proof': 'प्रमाण अपलोड करें',
    'Ticket ID': 'टिकट आईडी',
    'Room Number': 'कमरा नंबर',
    'Reported By': 'शिकायतकर्ता',
    'Time Logged': 'दर्ज समय',
    'Urgent': 'अति-आवश्यक',

    // Security Guard Terminal
    'Gate Security Terminal': 'गेट सुरक्षा टर्मिनल',
    'Authorized In/Out Movement Monitor': 'अधिकृत आवागमन निगरानी',
    'Scan Pass QR': 'गेट पास QR स्कैन करें',
    'Scan Pass QR Code': 'गेट पास QR कोड स्कैन करें',
    'Passcode Search': 'पासकोड खोज',
    'Student Exit Logger': 'छात्र प्रस्थान लॉगर',
    'Student Entry Logger': 'छात्र आगमन लॉगर',
    'Log Student Exit': 'छात्र प्रस्थान दर्ज करें',
    'Log Student Entry': 'छात्र आगमन दर्ज करें',
    'Log Exit': 'प्रस्थान दर्ज करें',
    'Log Entry': 'आगमन दर्ज करें',
    'Recent Gate Logs': 'हाल के गेट लॉग्स',
    'Authorized Passes': 'अधिकृत पास',
    'Enter Pass Code': 'पास कोड दर्ज करें',
    'Verify Pass': 'पास सत्यापित करें',
    'Authorized Until': 'मान्य समय तक',
    'Curfew Overdue Warning': 'कर्फ्यू समय समाप्त चेतावनी',

    // Mess Management
    'Mess & Dining Operations': 'मेस और भोजन प्रबंधन',
    'Cafeteria Management & Order Fulfillment': 'कैफेटेरिया प्रबंधन व ऑर्डर पूर्ति',
    'Live Kitchen Orders': 'रसोई के लाइव ऑर्डर',
    'Daily Mess Menu': 'दैनिक मेस मेनू',
    'Inventory & Stocks': 'इन्वेंटरी और स्टॉक',
    'Feedback & Ratings': 'प्रतिक्रिया व रेटिंग',
    'Order ID': 'ऑर्डर आईडी',
    'Delivery Room': 'डिलीवरी कमरा',
    'Items': 'व्यंजन',
    'Mark Preparing': 'तैयारी में चिन्हित करें',
    'Mark Out for Delivery': 'डिलीवरी के लिए रवाना',
    'Mark Delivered': 'डिलीवर चिन्हित करें',
    'Cancel Order': 'ऑर्डर रद्द करें',

    // Self-Service Kiosk
    'Campus Self-Service Kiosk': 'परिसर स्व-सेवा कियोस्क',
    'Touch to Begin': 'शुरू करने के लिए स्पर्श करें',
    'Print Kiosk Slip': 'कियोस्क रसीद प्रिंट करें',
    'Print Gate Pass Slip': 'गेट पास रसीद प्रिंट करें',
    'Quick Complaint': 'त्वरित शिकायत',
    'Log Quick Complaint': 'त्वरित शिकायत दर्ज करें',
    'Express Attendance Check-in': 'त्वरित उपस्थिति चेक-इन',
    'Night Curfew Check-in': 'रात्रि कर्फ्यू चेक-इन',
    'Mess Menu Today': 'आज का मेस मेनू',

    // Admin Portal
    'System Administration Portal': 'प्रणाली प्रशासन पोर्टल',
    'Central Operations Management': 'केंद्रीय संचालन प्रबंधन',
    'Overview': 'अवलोकन',
    'User Management': 'उपयोगकर्ता प्रबंधन',
    'Campus Operations': 'कैंपस संचालन',
    'Reports & Analytics': 'रिपोर्ट और एनालिटिक्स',
    'System Settings': 'सिस्टम सेटिंग्स',
    'Total Students': 'कुल विद्यार्थी',
    'Total Staff': 'कुल कर्मचारी',
    'Active Gate Passes': 'सक्रिय गेट पास',
    'Open Maintenance Tickets': 'खुले मरम्मत टिकट',
    'Total Cafeteria Revenue': 'कैफेटेरिया का कुल राजस्व',
    'Pending Staff Requests': 'लंबित कर्मचारी अनुरोध',
    'General Settings': 'सामान्य सेटिंग्स',
    'System Notifications': 'सिस्टम सूचनाएं',
    'Language': 'भाषा',
    'Timezone': 'समय क्षेत्र',
    'Date Format': 'दिनांक प्रारूप',
    'Feature Flags': 'फ़ीचर फ़्लैग',
    'Save Settings': 'सेटिंग्स सहेजें',
    'Export Report': 'रिपोर्ट निर्यात करें',
    'Search roll number, room or name...': 'रोल नंबर, कमरा या नाम खोजें...',
    'Approve Staff': 'कर्मचारी स्वीकृत करें',
    'Reject Staff': 'कर्मचारी अस्वीकार करें',

    // Statuses & Actions
    'Approved': 'स्वीकृत',
    'Rejected': 'अस्वीकृत',
    'Pending': 'लंबित',
    'Pending Approval': 'स्वीकृति लंबित',
    'Checked Out': 'बाहर गए हुए',
    'Completed': 'पूर्ण',
    'Overdue': 'समय समाप्त',
    'Curfew Overdue': 'कर्फ्यू समय समाप्त',
    'Open': 'खुला हुआ',
    'Resolved': 'समाधान हो चुका',
    'Task Activity Timestamps': 'कार्य गतिविधि और समयरेखा',
    'Task Created': 'कार्य बनाया गया',
    'Task Assigned': 'कार्य सौंपा गया',
    'Task Resolved': 'कार्य हल किया गया',
    'Task Rejected': 'कार्य अस्वीकृत किया गया',
    'Open Requisition': 'खुला अनुरोध',
    'Pending Assignment': 'असाइनमेंट लंबित',
    'Pending Resolution': 'समाधान लंबित',
    'Pending Action': 'कार्रवाई लंबित',
    'Awaiting Warden': 'वार्डन प्रतीक्षा में',
    'Awaiting Action': 'कार्रवाई की प्रतीक्षा',
    'Awaiting Fix': 'मरम्मत की प्रतीक्षा',
    'Resolution': 'समाधान',
    'Submit': 'जमा करें',
    'Cancel': 'रद्द करें',
    'Save': 'सहेजें',
    'Close': 'बंद करें',
    'Close Modal': 'बंद करें',
    'Search': 'खोजें',
    'Refresh': 'ताज़ा करें',
    'Delete': 'हटाएं',
    'Edit': 'संपादित करें',
    'View': 'देखें',
    'Download': 'डाउनलोड',
    'Print': 'प्रिंट',
    'Success': 'सफल',
    'Error': 'त्रुटि',
    'Warning': 'चेतावनी',
    'Loading...': 'लोड हो रहा है...',
    'No records found': 'कोई रिकॉर्ड नहीं मिला',
    'All': 'सभी',
    'Active': 'सक्रिय',
    'Inactive': 'निष्क्रिय',
    'Date': 'तारीख',
    'Time': 'समय',
    'Name': 'नाम',
    'Email': 'ईमेल',
    'Status': 'स्थिति',
  },
};

/**
 * Pure translation function for any English text string into current target language
 */
export function translateText(text: string, lang: Language): string {
  if (lang === 'en' || !text) return text;

  const dict = dashboardTranslations[lang as 'or' | 'hi'];
  if (!dict) return text;

  const trimmed = text.trim();
  if (!trimmed) return text;

  // Direct exact match
  if (dict[trimmed]) {
    const translated = dict[trimmed];
    const leadingWs = text.match(/^\s*/)?.[0] || '';
    const trailingWs = text.match(/\s*$/)?.[0] || '';
    return leadingWs + translated + trailingWs;
  }

  // Case insensitive match
  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(dict)) {
    if (key.toLowerCase() === lower) {
      const leadingWs = text.match(/^\s*/)?.[0] || '';
      const trailingWs = text.match(/\s*$/)?.[0] || '';
      return leadingWs + val + trailingWs;
    }
  }

  return text;
}

/**
 * React Hook that automatically translates all rendered DOM text nodes, placeholders,
 * titles, and select options across the entire dashboard to Odia ('or') or Hindi ('hi').
 * When 'en' is chosen, it seamlessly restores the original English text.
 */
export function useAutoTranslate(lang: Language) {
  const originalTexts = useRef<WeakMap<Node, string>>(new WeakMap());
  const originalPlaceholders = useRef<WeakMap<Element, string>>(new WeakMap());
  const originalTitles = useRef<WeakMap<Element, string>>(new WeakMap());
  const isTranslating = useRef<boolean>(false);

  useEffect(() => {
    const root = document.getElementById('dashboard-root') || document.body;
    if (!root) return;

    const translateDom = () => {
      if (isTranslating.current) return;
      isTranslating.current = true;

      try {
        const walker = document.createTreeWalker(
          root,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode(node) {
              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              const tag = parent.tagName.toUpperCase();
              if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE' || tag === 'SVG' || tag === 'PATH') {
                return NodeFilter.FILTER_REJECT;
              }
              // Skip if text is purely whitespace or single punctuation
              const content = node.nodeValue?.trim();
              if (!content || /^[\d\s.,:;/\-–—_()%$#@!*+=[\]{}|\\^&~`]+$/.test(content)) {
                return NodeFilter.FILTER_SKIP;
              }
              return NodeFilter.FILTER_ACCEPT;
            },
          }
        );

        let currentNode = walker.nextNode();
        while (currentNode) {
          let orig = originalTexts.current.get(currentNode);
          if (orig === undefined) {
            orig = currentNode.nodeValue || '';
            originalTexts.current.set(currentNode, orig);
          }

          if (lang === 'en') {
            if (currentNode.nodeValue !== orig) {
              currentNode.nodeValue = orig;
            }
          } else {
            const translated = translateText(orig, lang);
            if (translated && currentNode.nodeValue !== translated) {
              currentNode.nodeValue = translated;
            }
          }
          currentNode = walker.nextNode();
        }

        // Translate placeholders
        const inputs = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[placeholder], textarea[placeholder]');
        inputs.forEach((input) => {
          let orig = originalPlaceholders.current.get(input);
          if (orig === undefined) {
            orig = input.placeholder;
            originalPlaceholders.current.set(input, orig);
          }

          if (lang === 'en') {
            if (input.placeholder !== orig) input.placeholder = orig;
          } else {
            const translated = translateText(orig, lang);
            if (translated && input.placeholder !== translated) {
              input.placeholder = translated;
            }
          }
        });

        // Translate titles & aria-labels
        const titledElements = root.querySelectorAll<HTMLElement>('[title]');
        titledElements.forEach((el) => {
          let orig = originalTitles.current.get(el);
          if (orig === undefined) {
            orig = el.title;
            originalTitles.current.set(el, orig);
          }

          if (lang === 'en') {
            if (el.title !== orig) el.title = orig;
          } else {
            const translated = translateText(orig, lang);
            if (translated && el.title !== translated) {
              el.title = translated;
            }
          }
        });
      } finally {
        isTranslating.current = false;
      }
    };

    // Initial translation pass
    translateDom();

    // Set up MutationObserver to translate any dynamically rendered elements (modals, new tabs, dynamic tables)
    let animationFrameId: number | null = null;
    const observer = new MutationObserver(() => {
      if (isTranslating.current) return;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        translateDom();
      });
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [lang]);
}
