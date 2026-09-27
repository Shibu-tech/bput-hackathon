const Notice = require('../models/Notice');
const User = require('../models/User');
const { emitToRole, emitToHostel } = require('../sockets');
const pushService = require('./push.service');

/**
 * Create a new notice
 */
const createNotice = async (noticeData) => {
  const {
    title,
    body,
    isEmergency = false,
    targetAudience = {},
    createdBy
  } = noticeData;

  const notice = await Notice.create({
    title,
    body,
    isEmergency,
    targetAudience: {
      hostel: targetAudience.hostel || null,
      batch: targetAudience.batch || null
    },
    createdBy
  });

  // Send notifications after notice is created
  await sendNoticeNotifications(notice);

  return notice;
};

/**
 * Send notifications for a notice via Socket.io and Web Push
 */
const sendNoticeNotifications = async (notice) => {
  const { _id, title, body, isEmergency, targetAudience, createdAt } = notice;

  // Determine recipients based on targetAudience
  const recipientQuery = {};

  if (targetAudience.hostel && targetAudience.hostel !== 'ALL') {
    recipientQuery.hostel = targetAudience.hostel;
  }

  if (targetAudience.batch && targetAudience.batch !== 'ALL') {
    recipientQuery.batch = targetAudience.batch;
  }

  // Find recipient users
  const recipients = await User.find(recipientQuery);

  // Send Socket.io notifications
  recipients.forEach(recipient => {
    // Join user to their specific rooms for notification
    // Emit to user's personal room
    emitToUser(recipient._id.toString(), 'notice:new', {
      noticeId: _id,
      title,
      body,
      isEmergency,
      createdAt
    });

    // Emit to hostel room if notice is hostel-specific
    if (targetAudience.hostel && targetAudience.hostel !== 'ALL') {
      emitToHostel(targetAudience.hostel, 'notice:new', {
        noticeId: _id,
        title,
        body,
        isEmergency,
        createdAt
      });
    }

    // Emit to WARDEN role for all notices (wardens need to see all notices)
    if (recipient.role !== 'WARDEN') {
      emitToRole('WARDEN', 'notice:new', {
        noticeId: _id,
        title,
        body,
        isEmergency,
        createdAt,
        recipientId: recipient._id.toString()
      });
    }
  });

  // Send Web Push notifications
  await pushService.sendNoticePush(recipients, notice, isEmergency);
};

/**
 * Get notices for a user (with role-based filtering)
 */
const getNoticesForUser = async (user) => {
  const query = {};

  // Role-based filtering
  switch (user.role) {
    case 'STUDENT':
      // Students see notices for their hostel and batch
      if (user.hostel) query['targetAudience.hostel'] = { $in: [user.hostel, 'ALL', null] };
      if (user.batch) query['targetAudience.batch'] = { $in: [user.batch, 'ALL', null] };
      break;
    case 'WARDEN':
      // Wardens see notices for their hostel (if assigned) or all notices
      if (user.hostel) query['targetAudience.hostel'] = { $in: [user.hostel, 'ALL', null] };
      break;
    case 'TECHNICIAN':
    case 'SECURITY':
    case 'ADMIN':
      // These roles see all notices (no filtering)
      break;
    default:
      break;
  }

  // Only show notices that are not expired (if we had expiry logic)
  // For now, show all notices ordered by creation date (newest first)

  const notices = await Notice.find(query)
    .populate('createdBy', 'fullName role')
    .sort({ createdAt: -1 });

  return notices;
};

module.exports = {
  createNotice,
  getNoticesForUser
};

// Helper function for Socket.io emission to user
function emitToUser(userId, event, data) {
  // This would be implemented in the actual sockets service
  // For now, we'll rely on the imported emitToUser from sockets
}