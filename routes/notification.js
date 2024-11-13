const express = require('express');
const router = express.Router();
const fcmService = require('../firebase');
const mongoose=require('mongoose');
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const authMiddleware = require('../middlewares/authMiddleware');



async function getFcmTokensBySchool(schoolId) {
    try {
      const users = await User.aggregate([
        // Фильтруем по школе и непустому fcmToken
        {
          $match: { 
            schoolId: new mongoose.Types.ObjectId(schoolId),
            fcmToken: { 
              $exists: true, 
              $ne: null,
              $ne: "" 
            }
          } 
        },
        
        // Выбираем только fcmToken
        { 
          $project: { 
            _id: 0, 
            fcmToken: 1 
          } 
        }
      ]);
  
      // Преобразуем в простой массив токенов
      const uniqueTokens = [...new Set(users.map(user => user.fcmToken))];
    
    return uniqueTokens;
    } catch (error) {
      console.error('Error getting FCM tokens:', error);
      throw error;
    }
  }


  async function getFcmTokensByClass(classId) {
    try {
      const users = await User.aggregate([
        // Фильтруем по школе и непустому fcmToken
        {
          $match: { 
            classId: new mongoose.Types.ObjectId(classId),
            fcmToken: { 
              $exists: true, 
              $ne: null,
              $ne: "" 
            }
          } 
        },
        
        // Выбираем только fcmToken
        { 
          $project: { 
            _id: 0, 
            fcmToken: 1 
          } 
        }
      ]);

      const uniqueTokens = [...new Set(users.map(user => user.fcmToken))];
    
    return uniqueTokens;
    } catch (error) {
      console.error('Error getting FCM tokens:', error);
      throw error;
    }
  }


// Отправка уведомления на конкретное устройство
router.post('/send', async (req, res) => {
  const { type, title, body, data, schoolId, classId, userId } = req.body;
  
  try {
    if(type=='SCHOOL'){
        const tokens = await getFcmTokensBySchool(schoolId);

          console.log(tokens);

          const result = await fcmService.sendToMultipleDevices(tokens, title, body, data);
          const newNotification = new Notification({type, title, body, schoolId})
          await newNotification.save();
          res.json(result);
    }
    if(type=='CLASS'){
        const tokens = await getFcmTokensByClass(classId);

          console.log('workClass');

          const result = await fcmService.sendToMultipleDevices(tokens, title, body, data);
          const newNotification = new Notification({type, title, body, classId})
          await newNotification.save();
          res.json(result);
    }
    if(type=='USER'){
        const user=await User.findById(userId);
        const token = user.fcmToken;
          console.log('workClass');
          const result = await fcmService.sendToDevice(token, title, body, data);
          const newNotification = new Notification({type, title, body, userId})
          await newNotification.save();
        //   const result = await fcmService.sendToMultipleDevices(tokens, title, body, data);
          res.json(result);
    }
    
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



async function getUserNotificationsWithPagination(user, page = 1, limit = 20) {
    try {
  
      const conditions = [
        { 
          type: 'USER',
          userId: user._id 
        },
        user.classId ? {
          type: 'CLASS',
          classId: user.classId
        } : null,
        user.schoolId ? {
          type: 'SCHOOL',
          schoolId: user.schoolId
        } : null
      ].filter(Boolean);
  
      // Получаем общее количество уведомлений
      const total = await Notification.countDocuments({
        $or: conditions
      });
  
      // Получаем уведомления с пагинацией
      const notifications = await Notification.find({
        $or: conditions
      })
      .select('title body createdAt type')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  
      return {
        notifications,
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

router.get('/getNotifications', authMiddleware.auth, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const result = await getUserNotificationsWithPagination(req.user, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Вариант с агрегацией (если нужна дополнительная информация):
 

// Отправка уведомлений нескольким устройствам
router.post('/send-multiple', async (req, res) => {
  const { tokens, title, body, data } = req.body;
  
  try {
    const result = await fcmService.sendToMultipleDevices(tokens, title, body, data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отправка уведомления в топик
router.post('/send-topic', async (req, res) => {
  const { topic, title, body, data } = req.body;
  
  try {
    const result = await fcmService.sendToTopic(topic, title, body, data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Подписка на топик
router.post('/subscribe', async (req, res) => {
  const { tokens, topic } = req.body;
  
  try {
    const result = await fcmService.subscribeToTopic(tokens, topic);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отписка от топика
router.post('/unsubscribe', async (req, res) => {
  const { tokens, topic } = req.body;
  
  try {
    const result = await fcmService.unsubscribeFromTopic(tokens, topic);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;