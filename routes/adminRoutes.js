const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../controllers/adminAuthController');
const schoolController = require('../controllers/adminWeb/school.controller');
const projectController = require('../controllers/adminWeb/project.controller');
const notificationController = require('../controllers/adminWeb/notification.controller');
const Class = require('../models/class.model');
const User = require('../models/user.model');

router.get('/', adminAuth.isAuthenticated,adminAuth.isSuperAdmin,adminController.getDashboard);

router.get('/privacy-policy', adminAuth.getPrivacy);

router.get('/login', adminAuth.getLoginPage);
router.post('/login', adminAuth.postLogin);
router.get('/logout', adminAuth.getLogout);
router.get('/enter-otp', adminAuth.getEnterOtpPage);
router.post('/enter-otp', adminAuth.postEnterOtp);


router.get('/dashboard',adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin, adminController.getDashboard);

router.get('/dashboardSchool',adminAuth.isAuthenticated,adminAuth.isSchoolAdmin, adminController.getDashboardSchool);


router.get('/list',adminAuth.isAuthenticated,adminAuth.isSuperAdmin, schoolController.getAdmins);
router.get('/create', adminAuth.isAuthenticated,adminAuth.isSuperAdmin,schoolController.getCreateAdmin);
router.post('/create', adminAuth.isAuthenticated,adminAuth.isSuperAdmin,schoolController.postCreateAdmin);
router.delete('/:id', adminAuth.isAuthenticated,adminAuth.isSuperAdmin,schoolController.deleteAdmin);
router.get('/:id/edit', adminAuth.isAuthenticated,adminAuth.isSuperAdmin,schoolController.getEditAdmin);
router.post('/:id/edit', adminAuth.isAuthenticated,adminAuth.isSuperAdmin,schoolController.postEditAdmin);


router.get('/schools',adminAuth.isAuthenticated,adminAuth.isSuperAdmin, schoolController.getSchools);
router.get('/schools/create', adminAuth.isAuthenticated,adminAuth.isSuperAdmin,schoolController.getCreateSchool);
router.post('/schools/create', adminAuth.isAuthenticated,adminAuth.isSuperAdmin,schoolController.postCreateSchool);

router.get('/schools/:id',adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin, schoolController.getSchoolById);
router.get('/schools/:id/edit', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,schoolController.getEditSchool);
router.post('/schools/:id/edit', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,schoolController.postEditSchool);
router.delete('/schools/:id', adminAuth.isAuthenticated,adminAuth.isSuperAdmin,schoolController.deleteSchool);
router.get('/schools/:id/classes',adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,schoolController.getSchoolClasses);
router.get('/schools/:id/classes/create', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,schoolController.getCreateClass);


router.get('/classes',adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin, schoolController.getClassesList);
router.get('/classes/create', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,schoolController.getCreateClass);

router.post('/classes/create', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdminCRUD,schoolController.postCreateClass);
router.get('/classes/:id', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdminCRUD,schoolController.getClass);
router.get('/classes/:id/edit', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdminCRUD,schoolController.getEditClass);
router.post('/classes/:id/edit', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdminCRUD,schoolController.postEditClass);
router.delete('/classes/:id', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdminCRUD,schoolController.deleteClass);

router.get('/pupils',adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin, schoolController.getPupils);
router.delete('/pupils/:id', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,schoolController.deletePupil);
// router.get('/pupils/:id/edit', adminAuth.isAuthenticated,adminAuth.isSuperAdmin,schoolController.getEditPupil);
// router.post('/pupils/:id/edit', adminAuth.isAuthenticated,adminAuth.isSuperAdmin,schoolController.postEditPupil);


router.get('/surveys',adminAuth.isAuthenticated, adminAuth.isSuperAdminAndSchoolAdmin,schoolController.getSurveys);
router.get('/surveys/create',adminAuth.isAuthenticated, adminAuth.isSuperAdminAndSchoolAdmin,schoolController.createSurvey);
router.delete('/surveys/:id', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,schoolController.deleteSurvey);
router.post('/surveys/create', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,schoolController.postCreateSurvey);
router.get('/admin/surveys/:id/edit', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin, schoolController.showEditForm);
router.post('/admin/surveys/:id/edit', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin, schoolController.updateSurvey);
router.get('/surveys/:id', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin, schoolController.showInfoSurvey);

router.get('/schools/:id/pupils', adminAuth.isAuthenticated,adminAuth.isSuperAdmin,schoolController.getSchoolStudents);
router.get('/schools/:id/admins', adminAuth.isAuthenticated,adminAuth.isSuperAdmin,schoolController.getSchoolAdmins);

// router.get('/users', adminController.getSchoolAdmins);
// router.get('/create-school-admin', adminController.getCreateSchoolAdmin);
// router.post('/create-school-admin', adminController.postCreateSchoolAdmin);

//events
router.get('/events',adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin, schoolController.eventsGet);
router.get('/events/create', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,schoolController.createEvent);
router.post('/events/create', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,schoolController.createEventPost);
router.delete('/events/:id', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,schoolController.deleteEvent);
router.get('/events/edit/:id', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin, schoolController.editEvent);
router.post('/events/edit/:id', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin, schoolController.editEventPost);


//discussions
router.get('/discussions',adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin, schoolController.discussionList);
router.get('/discussions/create', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,schoolController.createDiscussion);
router.post('/discussions/create', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,schoolController.createDiscussionPost);
router.delete('/discussions/:id', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,schoolController.deleteDiscussion);
router.get('/discussions/edit/:id', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin, schoolController.editDiscussion);
router.post('/discussions/edit/:id', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin, schoolController.editDiscussionPost);

//project
router.get('/projects',adminAuth.isAuthenticated, adminAuth.isSuperAdminAndSchoolAdmin,projectController.getProjectList);
router.delete('/projects/:id', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,projectController.deleteProject);
router.get('/projects/:id/edit', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,projectController.editProject);
router.post('/projects/:id/edit', adminAuth.isAuthenticated,adminAuth.isSuperAdminAndSchoolAdmin,projectController.updateProject);
router.get('/projects/create',adminAuth.isAuthenticated, adminAuth.isSuperAdminAndSchoolAdmin,projectController.createProject);
router.post('/projects/create',adminAuth.isAuthenticated, adminAuth.isSuperAdminAndSchoolAdmin,projectController.postCreateProject);

//notification
router.get('/notification',adminAuth.isAuthenticated, adminAuth.isSuperAdminAndSchoolAdmin,notificationController.getCreateNotification);
router.post('/notification', adminAuth.isAuthenticated,adminAuth.isSuperAdmin,notificationController.postCreateNotification);

// Загрузка классов школы
router.get('/api/schools/:schoolId/classes', async (req, res) => {
    try {
        const classes = await Class.find({ schoolId: req.params.schoolId });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при загрузке классов' });
    }
});

// Загрузка учеников класса
router.get('/api/classes/:classId/students', async (req, res) => {
    try {
        const students = await User.find({ classId: req.params.classId, role: 0 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при загрузке учеников' });
    }
});

module.exports = router;