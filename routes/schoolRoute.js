const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const schoolController = require('../controllers/schoolController');

router.post('/', authMiddleware.auth, schoolController.createSchool);

router.get('/', authMiddleware.auth, schoolController.getAllSchools);

router.get('/:id', authMiddleware.auth, schoolController.getSchoolById);

router.put('/:id', authMiddleware.auth, schoolController.updateSchool);

router.delete('/:id', authMiddleware.auth, schoolController.deleteSchool);

module.exports = router;
