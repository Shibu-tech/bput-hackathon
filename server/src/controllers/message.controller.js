const Message = require('../models/Message');

let socketIO = null;
const setSocketIO = (io) => {
  socketIO = io;
};

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const {
      complaintId,
      complaintTitle,
      studentId,
      studentName,
      studentRoll,
      roomNumber,
      senderRole,
      senderName,
      text
    } = req.body;

    if (!studentId || !text || !senderRole) {
      return res.status(400).json({ success: false, msg: 'Missing required message fields' });
    }

    const message = await Message.create({
      complaintId: complaintId || '',
      complaintTitle: complaintTitle || '',
      studentId,
      studentName: studentName || 'Student',
      studentRoll: studentRoll || '',
      roomNumber: roomNumber || '101',
      senderRole,
      senderName: senderName || (senderRole === 'warden' ? 'Hostel Warden' : studentName),
      text: text.trim()
    });

    // Broadcast in real-time to both student room and warden room
    if (global.chatIO) {
      global.chatIO.to(`chat:${studentId}`).emit('chat:receive', message);
      global.chatIO.to('warden-room').emit('chat:receive', message);
      global.chatIO.emit('chat:receive', message); // broadcast to all active listeners
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get messages for a student conversation
const getMessages = async (req, res) => {
  try {
    const { studentId, complaintId } = req.query;

    let query = {};
    if (studentId) {
      query.$or = [{ studentId: studentId }, { studentRoll: studentId }];
    }
    if (complaintId) {
      query.complaintId = complaintId;
    }

    const messages = await Message.find(query).sort({ createdAt: 1 }).limit(200);
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get list of active student conversations for Warden
const getConversations = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });

    const convMap = new Map();
    for (const msg of messages) {
      if (!convMap.has(msg.studentId)) {
        convMap.set(msg.studentId, {
          studentId: msg.studentId,
          studentName: msg.studentName,
          studentRoll: msg.studentRoll,
          roomNumber: msg.roomNumber,
          lastMessage: msg.text,
          lastSenderRole: msg.senderRole,
          lastMessageTime: msg.createdAt,
          complaintId: msg.complaintId,
          complaintTitle: msg.complaintTitle
        });
      }
    }

    const conversations = Array.from(convMap.values());
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
  setSocketIO
};
