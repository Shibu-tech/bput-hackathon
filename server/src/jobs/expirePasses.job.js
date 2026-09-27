const cron = require('node-cron');
const GatePass = require('../models/GatePass');
const { emitToRole, emitToUser } = require('../sockets');

const schedule = '*/15 * * * *';

const runExpirePasses = async () => {
  try {
    const now = new Date();
    const result = await GatePass.updateMany(
      {
        status: 'APPROVED',
        expectedReturnTime: { $lt: now }
      },
      {
        status: 'EXPIRED',
        $set: {
          updatedAt: now
        }
      }
    );

    if (result.modifiedCount > 0) {
      const expiredPasses = await GatePass.find({
        status: 'EXPIRED',
        expectedReturnTime: { $lt: now }
      }).populate('studentId', 'fullName hostel');

      for (const pass of expiredPasses) {
        emitToUser(pass.studentId?._id?.toString(), 'gate:expired', {
          gatePassId: pass._id,
          status: 'EXPIRED'
        });
        emitToRole('WARDEN', 'gate:expired', {
          gatePassId: pass._id,
          student: pass.studentId,
          hostel: pass.hostel
        });
      }
    }

    console.log(`Expired pass check completed: ${result.modifiedCount} pass(es) updated`);
  } catch (error) {
    console.error('Expire passes job failed:', error.message);
  }
};

const start = () => {
  const job = cron.schedule(schedule, runExpirePasses, {
    timezone: 'Asia/Kolkata'
  });

  job.start();
  console.log('Gate pass expiry job scheduled every 15 minutes');
  return job;
};

module.exports = {
  start,
  runExpirePasses
};
