const School = require('../../models/school.model');
const Class = require('../../models/class.model');
const User = require('../../models/user.model');
const Notification = require("../../models/notification.model");
const fcmService = require('../../firebase');
const mongoose=require('mongoose');
const authMiddleware = require('../../middlewares/authMiddleware');
const path = require('path');
const { read } = require('fs');

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

exports.getCreateNotification = async (req, res) => {
    try {
      if(req.session.userRole===1){
        console.log(`userRole is ${req.session.userRole}`);
        var schools = await School.findById(req.session.schoolId);
        schools=[schools];
        console.log(`schools is ${schools}`);
        var classes = await Class.find({schoolId: req.session.schoolId});
        console.log(`classes is ${classes}`);
        var users = await User.find({role : 0,surname: { $exists: true, $ne: '' }, fcmToken: { $exists: true, $ne: '' }, schoolId: req.session.schoolId});
        console.log(`user is ${users}`);

        res.render('admin/notification/createNotification', {
            schools,
            classes,
            users,
            layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
            footer: true,
            headerTitle: `Уведомления`,
            currentPageTitle: 'notification',
            title: `Уведомления`,
            schoolId: req.session.schoolId
        });
      }else{
        console.log(`userRole2 is ${req.session.userRole}`);
        const schools = await School.find();
        const classes = await Class.find();
        const users = await User.find({role : 0,surname: { $exists: true, $ne: '' }, fcmToken: { $exists: true, $ne: '' }});

        res.render('admin/notification/createNotification', {
            schools,
            classes,
            users
        });
      }
        
    } catch (error) {
        res.render('admin/notification/createNotification', { 
            error: 'Failed to load data' 
        });
    // res.render('admin/notification/createNotification');
}}


exports.postCreateNotification = async (req, res) => {
    const { type, title, body, data, schoolId, classId, userId } = req.body;
  
  try {
    if(type=='SCHOOL'){
        const tokens = await getFcmTokensBySchool(schoolId);

          console.log(tokens);

          const result = await fcmService.sendToMultipleDevices(tokens, title, body, data);
          const newNotification = new Notification({type, title, body, schoolId})
          await newNotification.save();
          res.redirect('/admin/notification');
    }
    if(type=='CLASS'){
        const tokens = await getFcmTokensByClass(classId);

          console.log('workClass');

          const result = await fcmService.sendToMultipleDevices(tokens, title, body, data);
          const newNotification = new Notification({type, title, body, classId})
          await newNotification.save();
          res.redirect('/admin/notification');
    }
    if(type=='USER'){
        const user=await User.findById(userId);
        const token = user.fcmToken;
          console.log('workClass');
          const result = await fcmService.sendToDevice(token, title, body, data);
          const newNotification = new Notification({type, title, body, userId})
          await newNotification.save();
        //   const result = await fcmService.sendToMultipleDevices(tokens, title, body, data);
        res.redirect('/admin/notification');
    }
    
    
  } catch (error) {
    console.error('Error creating notification:', error);
        res.status(500).render('error', { message: 'Ошибка при создании уведомления' });
  }
};