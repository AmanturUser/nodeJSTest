const User = require('../models/user.model');
const School = require('../models/school.model');
const Class = require('../models/class.model');
const AdminLog = require('../models/adminLog.model');
const path = require('path');

exports.getDashboard = async (req, res) => {
  try {
    if(req.session.userRole===1){
      const schoolId = req.session.schoolId;
        const school = await School.findById(schoolId);
        
        if (!school) {
            return res.status(404).render('404', { message: 'Школа не найдена' });
        }

        const classes = await Class.find({ schoolId: school._id });
            const classIds = classes.map(c => c._id);

            const [studentCount, teacherCount] = await Promise.all([
                User.countDocuments({ classId: { $in: classIds }, role: 0 }),
                User.countDocuments({ classId: { $in: classIds }, role: 1 })
            ]);

        // Получаем список администраторов школы
        const schoolAdmins = await User.find({ classId: { $in: classIds }, role: 1}).select('name email');

        
            res.render('admin/school', { 
                school, 
                classCount: classes.length,
                studentCount, 
                teacherCount, 
                schoolAdmins,
                layout: path.join(__dirname, "../views/layouts/schoolAdmin"),
                footer: true,
                headerTitle: `Школа`,
                currentPageTitle: 'home',
                schoolId: schoolId
            });
    }else{
      const schoolCount = await School.countDocuments();
      const classCount = await Class.countDocuments();
      const teacherCount = await User.countDocuments({ role: 1 });
      const pupilCount = await User.countDocuments({ role: 0 });
  
      res.render('admin/dashboard', {
        schoolCount,
        classCount,
        teacherCount,
        pupilCount
      });
    }
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).render('error', { message: 'Ошибка при загрузке данных панели управления' });
  }
};

exports.getDashboardSchool = async (req, res) => {
  try {
    const user=await User.findById(req.session.userId);
    const classCount = await Class.countDocuments({schoolId: user.schoolId});
    const pupilCount = await User.countDocuments({ role: 0 });

    res.render('admin/dashboardSchool', {
      classCount,
      pupilCount,
      layout: path.join(__dirname, "../views/layouts/schoolAdmin"),
     }
    );
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).render('error', { message: 'Ошибка при загрузке данных панели управления' });
  }
};

exports.getSchoolAdmins = async (req, res) => {
  try {
    const schoolAdmins = await User.find({ role: 1 }).populate('schoolId');
    res.render('admin/schoolAdmins', { title: 'School Admins', schoolAdmins });
  } catch (error) {
    res.status(500).render('error', { message: 'Error loading school admins' });
  }
};

exports.getCreateSchoolAdmin = async (req, res) => {
  try {
    const schools = await School.find();
    res.render('admin/createSchoolAdmin', { title: 'Create School Admin', schools });
  } catch (error) {
    res.status(500).render('error', { message: 'Error loading create school admin form' });
  }
};

exports.postCreateSchoolAdmin = async (req, res) => {
  try {
    const { name, email, password, schoolId } = req.body;
    // Здесь должна быть логика создания/обновления школьного администратора
    // Используйте код из предыдущего примера

    res.redirect('/admin/school-admins');
  } catch (error) {
    res.status(400).render('admin/createSchoolAdmin', {
      title: 'Create School Admin',
      error: error.message,
      schools: await School.find()
    });
  }
};