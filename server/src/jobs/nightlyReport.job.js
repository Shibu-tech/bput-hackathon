const cron = require('node-cron');
const GatePass = require('../models/GatePass');
const User = require('../models/User');
const { emitToRole } = require('../sockets');

const schedule = '30 22 * * *';

const runNightlyReport = async () => {
  try {
    const exitedPasses = await GatePass.find({ status: 'EXITED' })
      .populate('studentId', 'fullName hostel phoneNumber batch')
      .lean();

    const groups = exitedPasses.reduce((acc, pass) => {
      const hostel = pass.studentId?.hostel || 'Unassigned';
      acc[hostel] = acc[hostel] || [];
      acc[hostel].push({
        passId: pass._id,
        studentName: pass.studentId?.fullName || 'Unknown',
        phoneNumber: pass.studentId?.phoneNumber || null,
        hostel,
        actualExitTime: pass.actualExitTime,
        actualReturnTime: pass.actualReturnTime || null
      });
      return acc;
    }, {});

    const wardenReport = {
      type: 'nightly-report',
      generatedAt: new Date().toISOString(),
      summary: Object.entries(groups).map(([hostel, students]) => ({
        hostel,
        count: students.length,
        students
      }))
    };

    const wardens = await User.find({ role: 'WARDEN' }).select('_id hostel');

    for (const warden of wardens) {
      const targetedHostel = warden.hostel || 'ALL';
      const hostelEntries = targetedHostel === 'ALL'
        ? wardenReport.summary
        : wardenReport.summary.filter(entry => entry.hostel === targetedHostel);

      emitToRole('WARDEN', 'nightly-report', {
        ...wardenReport,
        summary: hostelEntries,
        targetHostel: targetedHostel,
        wardenId: warden._id.toString()
      });
    }

    console.log('Nightly gate pass report generated for wardens');
  } catch (error) {
    console.error('Nightly report job failed:', error.message);
  }
};

const start = () => {
  const job = cron.schedule(schedule, runNightlyReport, {
    timezone: 'Asia/Kolkata'
  });

  job.start();
  console.log('Nightly report job scheduled for 10:30 PM IST');
  return job;
};

module.exports = {
  start,
  runNightlyReport
};
