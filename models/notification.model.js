const mongoose=require('mongoose');
// Notification Model (MongoDB)
const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['SCHOOL', 'CLASS', 'USER'], 
      required: true 
    },
    schoolId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School' 
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: { type: Date, default: Date.now }
  });

  const NotificationModel = mongoose.model('notification', notificationSchema);

module.exports = NotificationModel;