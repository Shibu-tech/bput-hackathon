const webpush = require('web-push');

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:you@example.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
} else {
  console.warn('VAPID keys not set. Web push notifications will not work.');
}

module.exports = webpush;