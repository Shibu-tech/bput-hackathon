const nightlyReportJob = require('./nightlyReport.job');
const expirePassesJob = require('./expirePasses.job');

/**
 * Register and start all scheduled jobs
 * Should be called after database connection is established
 */
const startJobs = () => {
  // Nightly report job: runs daily at 10:30 PM IST
  nightlyReportJob.start();

  // Expire passes job: runs every 15-30 minutes
  expirePassesJob.start();

  console.log('All scheduled jobs started');
};

module.exports = {
  startJobs
};