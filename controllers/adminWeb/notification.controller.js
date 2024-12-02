const School = require('../../models/school.model');
const Class = require('../../models/class.model');
const User = require('../../models/user.model');

exports.getCreateNotification = async (req, res) => {
    try {
        const schools = await School.find();
        const classes = await Class.find();
        const users = await User.find({role : 0,surname: { $exists: true, $ne: '' }, fcmToken: { $exists: true, $ne: '' }});

        res.render('admin/notification/createNotification', {
            schools,
            classes,
            users
        });
    } catch (error) {
        res.render('admin/notification/createNotification', { 
            error: 'Failed to load data' 
        });
    // res.render('admin/notification/createNotification');
}}


// exports.postCreateNotification = async (req, res) => {
//     try {
//         const { name, description } = req.body;
//         const existingSchool = await School.findOne({ name: name });
        
//         if (existingSchool) {
//             return res.status(404).render('error', { message: 'Школа с таким названием уже существует' });
//         }

//         const newSchool = new School({ name, description });
//         await newSchool.save();
//         res.redirect('/admin/schools');
//     } catch (error) {
//         console.error('Error creating school:', error);
//         res.status(500).render('error', { message: 'Ошибка при создании школы' });
//     }
// };