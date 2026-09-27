const webpush = require('../config/webpush');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Add push subscription for a user
 */
const addSubscription = async (userId, endpoint, keys) => {
  // Validate subscription data
  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    throw new ApiError(400, 'Invalid push subscription data');
  }

  // Find user to ensure exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if subscription already exists
  const exists = user.pushSubscriptions.some(sub => sub.endpoint === endpoint);
  if (exists) {
    return user;
  }

  // Use updateOne to add subscription with explicit createdAt
  await User.updateOne(
    { _id: userId },
    { $push: { pushSubscriptions: { endpoint, keys, createdAt: new Date() } } }
  );

  // Return the updated user
  return await User.findById(userId);
};

/**
 * Send push notification to users
 */
const sendNoticePush = async (users, notice, isEmergency = false) => {
  if (!users || users.length === 0) return;

  const notificationPayload = {
    title: notice.title,
    body: notice.body,
    icon: '/icon.png', // You would need to add an icon
    data: {
      noticeId: notice._id.toString(),
      url: '/notices' // URL to open when clicked
    }
  };

  const pushOptions = isEmergency ? {
    urgency: 'high',
    TTL: 24 * 60 * 60 // 24 hours
  } : {
    urgency: 'normal',
    TTL: 24 * 60 * 60 // 24 hours
  };

  // Send to each user
  for (const user of users) {
    for (const subscription of user.pushSubscriptions) {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify(notificationPayload),
          pushOptions
        );
      } catch (error) {
        // If we get a 404 or 410, the subscription is invalid
        if (error.statusCode === 404 || error.statusCode === 410) {
          // Remove dead subscription
          await User.updateOne(
            { _id: user._id },
            { $pull: { pushSubscriptions: { endpoint: subscription.endpoint } } }
          );
        }
        // Log other errors but continue
        console.error('Push notification error:', error);
      }
    }
  }
};

module.exports = {
  addSubscription,
  sendNoticePush
};