const express = require('express');
const router = express.Router();
const fcmService = require('../firebase');
const mongoose=require('mongoose');
const User = require("../models/user.model");


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
          res.json(result);
    }
    if(type=='CLASS'){
        const tokens = await getFcmTokensByClass(classId);

          console.log('workClass');

          const result = await fcmService.sendToMultipleDevices(tokens, title, body, data);
          res.json(result);
    }
    if(type=='USER'){
        const user=await User.findById(userId);
        const token = user.fcmToken;
          console.log('workClass');
          const result = await fcmService.sendToDevice(token, title, body, data);

        //   const result = await fcmService.sendToMultipleDevices(tokens, title, body, data);
          res.json(result);
    }
    
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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