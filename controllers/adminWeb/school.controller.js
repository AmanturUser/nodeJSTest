const School = require('../../models/school.model');
const User = require('../../models/user.model');
const path = require('path');
const Class = require('../../models/class.model');
const Event = require('../../models/event.model');
const Survey = require('../../models/survey.model');
const Discussion = require('../../models/discussion.model');
const SurveyResponse = require('../../models/surveyResponse.model');
const mongoose=require('mongoose');


exports.getSchools = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 1000; // Количество школ на странице
        const skip = (page - 1) * limit;

        const searchQuery = req.query.search || '';
        const searchRegex = new RegExp(searchQuery, 'i');

        const schoolsQuery = School.find({ name: searchRegex })
            .select('name description') // Выбираем имя и описание
            .skip(skip)
            .limit(limit)
            .lean();

        const [schools, totalSchools] = await Promise.all([
            schoolsQuery.exec(),
            School.countDocuments({ name: searchRegex })
        ]);

        // Получаем количество учеников и учителей для каждой школы
        const schoolsWithStats = await Promise.all(schools.map(async (school) => {
            const classes = await Class.find({ schoolId: school._id });
            const classIds = classes.map(c => c._id);

            const [studentCount, teacherCount] = await Promise.all([
                User.countDocuments({ classId: { $in: classIds }, role: 0 }),
                User.countDocuments({ classId: { $in: classIds }, role: 1 })
            ]);

            return {
                ...school,
                studentCount,
                teacherCount,
                classCount: classes.length
            };
        }));

        const totalPages = Math.ceil(totalSchools / limit);

        res.render('admin/schools-list', {
            schools: schoolsWithStats,
            currentPage: page,
            totalPages,
            totalSchools,
            searchQuery,
            limit
        });
    } catch (error) {
        console.error('Error fetching schools:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке списка школ' });
    }
};

exports.getCreateSchool = async (req, res) => {
    res.render('admin/school-create');
};

exports.getCreateClass = async (req, res) => {
    try {
        let schools
        const schoolId=req.params.id;
        if(req.params.id){
            const school=await School.findById(schoolId);
            schools=[school];
        }else if(req.session.userRole===1){
            const school=await School.findById(req.session.schoolId);
            schools=[school];
        }else{
            schools=await School.find();
        }
        
        
        if (!schools) {
            return res.status(404).render('error', { message: 'Школ не найдено' });
        }

        if(req.session.userRole===1){
            res.render('admin/class-create', { 
                schools,
                layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                footer: true,
                headerTitle: `Создать класс`,
                currentPageTitle: 'classes',
                schoolId: req.session.schoolId
            });
        }else{
            res.render('admin/class-create', { 
                schools
            });
        }
        
    } catch (error) {
        console.error('Error fetching school data:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке данных школ' });
    }
};

exports.postCreateSchool = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existingSchool = await School.findOne({ name: name });
        
        if (existingSchool) {
            return res.status(404).render('error', { message: 'Школа с таким названием уже существует' });
        }

        const newSchool = new School({ name, description });
        await newSchool.save();
        res.redirect('/admin/schools');
    } catch (error) {
        console.error('Error creating school:', error);
        res.status(500).render('error', { message: 'Ошибка при создании школы' });
    }
};

exports.postCreateClass = async (req, res) => {
    try {
        const { name, description, schoolId } = req.body;
        const existingClass = await Class.findOne({ name: name });
        
        if (existingClass) {
            return res.status(404).render('error', { message: 'Класс с таким названием уже существует' });
        }

        const newClass = new Class({ name, description, schoolId });
        await newClass.save();
        if(req.session.userRole===1){
            res.redirect(`/admin/classes`);    
        }else{
            res.redirect('/admin/classes');
        }
    } catch (error) {
        console.error('Error creating class:', error);
        res.status(500).render('error', { message: 'Ошибка при создании класса' });
    }
};

exports.getSchoolById = async (req, res) => {
    try {
        const schoolId = req.params.id;
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

        if(req.session.userRole===1){
            res.render('admin/school', { 
                school, 
                classCount: classes.length,
                studentCount, 
                teacherCount, 
                schoolAdmins,
                layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                footer: true,
                headerTitle: `Школа`,
                currentPageTitle: 'home',
                schoolId: schoolId
            });
        }else{
            res.render('admin/school', { 
                school, 
                classCount: classes.length,
                studentCount, 
                teacherCount, 
                schoolAdmins
            });
        }
       
    } catch (error) {
        console.error('Error fetching school data:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке данных школы' });
    }
};

exports.getEditSchool = async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        if (!school) {
            return res.status(404).render('error', { message: 'Школа не найдена' });
        }
        
        const classes = await Class.find({ schoolId: school._id });
        const classIds = classes.map(c => c._id);
        
        const [studentCount, teacherCount] = await Promise.all([
            User.countDocuments({ classId: { $in: classIds }, role: 0 }),
            User.countDocuments({ classId: { $in: classIds }, role: 1 })
        ]);

        if(req.session.userRole===1){
            res.render('admin/edit-school', { 
                school, 
                studentCount, 
                teacherCount,
                classes,
                layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                footer: true,
                headerTitle: `Школа`,
                currentPageTitle: 'home',
                schoolId: req.session.schoolId
            });
        }else{
            res.render('admin/edit-school', { 
                school, 
                studentCount, 
                teacherCount,
                classes,
                schoolId : null
            });
        }
        
    } catch (error) {
        console.error('Error fetching school for edit:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке данных школы' });
    }
};

exports.postEditSchool = async (req, res) => {
    try {
        const { name, description } = req.body;
        const school = await School.findById(req.params.id);
        
        if (!school) {
            return res.status(404).render('error', { message: 'Школа не найдена' });
        }

        school.name = name;
        school.description = description;

        await school.save();

        if(req.session.userRole===1){
            res.redirect('/admin/dashboard');    
        }else{
            res.redirect('/admin/schools');
        }
        
    } catch (error) {
        console.error('Error updating school:', error);
        res.status(500).render('error', { message: 'Ошибка при обновлении школы' });
    }
};


exports.deleteSchool = async (req, res) => {
    try {
        const schoolId = req.params.id;

        // Проверяем, есть ли связанные классы
        const relatedClasses = await Class.find({ schoolId: schoolId });
        if (relatedClasses.length > 0) {
            return res.status(400).json({ success: false, message: 'Нельзя удалить школу, у которой есть классы' });
        }

        // Если классов нет, удаляем школу
        await School.findByIdAndDelete(schoolId);

        res.json({ success: true, message: 'Школа успешно удалена' });
    } catch (error) {
        console.error('Error deleting school:', error);
        res.status(500).json({ success: false, message: 'Ошибка при удалении школы' });
    }
};

exports.deleteClass = async (req, res) => {
    try {
        const classId = req.params.id;

        // Проверяем, есть ли связанные классы
        const relatedUsers = await User.find({ classId: classId });
        if (relatedUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'Нельзя удалить класс, у которой есть ученики' });
        }

        // Если классов нет, удаляем школу
        await Class.findByIdAndDelete(classId);

        res.json({ success: true, message: 'Класс успешно удален' });
    } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({ success: false, message: 'Ошибка при удалении класса' });
    }
};

exports.getSchoolClasses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 1000; // Количество классов на странице
        const skip = (page - 1) * limit;

        const searchQuery = req.query.search || '';
        const searchRegex = new RegExp(searchQuery, 'i');

        const classesQuery = Class.find({ 
            schoolId: req.params.id,
            name: searchRegex 
        })
            .select('name description')
            .skip(skip)
            .limit(limit)
            .lean();

        const [classes, totalClasses] = await Promise.all([
            classesQuery.exec(),
            Class.countDocuments({ schoolId: req.params.id, name: searchRegex })
        ]);
        
        const classesWithStats = await Promise.all(classes.map(async (classItem) => {
            const studentCount = await User.countDocuments({ classId: classItem._id, role: 0 });
            return {
                ...classItem,
                studentCount
            };
        }));

        const schoolId = req.params.id;
        const school = await School.findById(schoolId);

        const totalPages = Math.ceil(totalClasses / limit);

        if(req.session.userRole===1){
            res.render('admin/school-classes', {
                classes: classesWithStats,
                currentPage: page,
                totalPages,
                totalClasses,
                searchQuery,
                limit,
                school,
                layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                headerTitle: `Классы`,
                currentPageTitle: 'classes',
                schoolId: schoolId
            });
        }else{
            res.render('admin/school-classes', {
                classes: classesWithStats,
                currentPage: page,
                totalPages,
                totalClasses,
                searchQuery,
                limit,
                school
            });
        }
    } catch (error) {
        console.error('Error fetching school classes:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке классов' });
    }
};

// exports.getSchoolClasses = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = 10; // Количество классов на странице
//         const skip = (page - 1) * limit;

//         const searchQuery = req.query.search || '';
//         const searchRegex = new RegExp(searchQuery, 'i');

//         const classes = await Class.find({ schoolId: req.params.id });

//         const classesQuery = await Class.find({ name: searchRegex })
//             .populate('name description')
//             .skip(skip)
//             .limit(limit)
//             .lean();

//         const [classesSecond, totalClasses] = await Promise.all([
//             classesQuery.exec(),
//             classes.countDocuments({ name: searchRegex })
//         ]);
        
//         const classesWithStats = await Promise.all(classesSecond.map(async (classItem) => {
//             const studentCount = await User.countDocuments({ classId: classItem._id, role: 0 });
//             return {
//                 ...classItem,
//                 studentCount
//             };
//         }));

//         const totalPages = Math.ceil(totalClasses / limit);
//         // res.render('admin/school-classes', { school, classes });
//         res.render('admin/school-classes', {
//             classes: classesWithStats,
//             currentPage: page,
//             totalPages,
//             totalClasses,
//             searchQuery,
//             limit
//         });
//     } catch (error) {
//         console.error('Error fetching school classes:', error);
//         res.status(500).render('error', { message: 'Ошибка при загрузке классов' });
//     }
// };

exports.getClassesList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 1000; // Количество классов на странице
        const skip = (page - 1) * limit;

        const searchQuery = req.query.search || '';
        const searchRegex = new RegExp(searchQuery, 'i');

        var classesQuery;
        if(req.session.userRole===1){
            classesQuery = Class.find({ name: searchRegex, schoolId: req.session.schoolId})
            .populate('name')
            .skip(skip)
            .limit(limit)
            .lean();
        }else{
            classesQuery = Class.find({ name: searchRegex })
            .populate('name')
            .skip(skip)
            .limit(limit)
            .lean();
        }

        

        const [classes, totalClasses] = await Promise.all([
            classesQuery.exec(),
            Class.countDocuments({ name: searchRegex })
        ]);

        // Получаем количество учеников для каждого класса
        const classesWithStats = await Promise.all(classes.map(async (classItem) => {
            const studentCount = await User.countDocuments({ classId: classItem._id, role: 0 });
            const school = await School.findById(classItem.schoolId).select('name');
            const schoolName = school ? school.name : 'Неизвестная школа';
            return {
                ...classItem,
                studentCount,
                schoolName
            };
        }));

        const totalPages = Math.ceil(totalClasses / limit);

        if(req.session.userRole===1){
            res.render('admin/classes', {
                classes: classesWithStats,
                currentPage: page,
                totalPages,
                totalClasses,
                searchQuery,
                limit,
                layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                footer: true,
                headerTitle: `Классы`,
                currentPageTitle: 'classes',
                schoolId: req.session.schoolId
            });
        }
        res.render('admin/classes', {
            classes: classesWithStats,
            currentPage: page,
            totalPages,
            totalClasses,
            searchQuery,
            limit
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке списка классов' });
    }
};

exports.getClass = async (req, res) => {
    try {
        const classId = req.params.id;
        const classItem = await Class.findById(classId).populate('schoolId', 'name');
        
        if (!classItem) {
            return res.status(404).render('error', { message: 'Класс не найден' });
        }

        const students = await User.find({ classId: classId, role: 0 })
            .select('name surname email rating')
            .sort({ rating: -1 }); // Сортировка по рейтингу (по убыванию)

            if(req.session.userRole===1){
                res.render('admin/class-details', {
                    classItem,
                    students,
                    studentCount: students.length,
                    layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                    footer: true,
                    headerTitle: `Класс`,
                    currentPageTitle: 'classes',
                    schoolId: classItem.schoolId
                });
            }else{
                res.render('admin/class-details', {
                    classItem,
                    students,
                    studentCount: students.length
                });
            }
        
    } catch (error) {
        console.error('Error fetching class details:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке информации о классе' });
    }
};


exports.getEditClass = async (req, res) => {
    try {
        // const schoolId=req.params.id;
        
        const myClass=await Class.findById(req.params.id);
        if (!myClass) {
            return res.status(404).render('error', { message: 'Класс не найден' });
        }
        let schools;
        if(req.session.userRole===1){
            const school=await School.findById(myClass.schoolId);
            schools=[school];
        }else{
            schools=await School.find();
        }
        
        
        if (!schools) {
            return res.status(404).render('error', { message: 'Школы не найдено' });
        }

        if(req.session.userRole===1){
            res.render('admin/class-edit', { 
                schools,
                myClass,
                layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                footer: true,
                headerTitle: `Редактировать класс`,
                currentPageTitle: 'classes',
                schoolId: myClass.schoolId
            });
        }else{
            res.render('admin/class-edit', { 
                schools,
                myClass
            });
        }
        
    } catch (error) {
        console.error('Error fetching class for edit:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке данных школы' });
    }
};

exports.postEditClass = async (req, res) => {
    try {
        const { name, description, schoolId } = req.body;
        const myClass = await Class.findById(req.params.id);
        
        if (!myClass) {
            return res.status(404).render('error', { message: 'Класс не найден' });
        }

        const school = await School.findById(schoolId);
        
        if (!school) {
            return res.status(404).render('error', { message: 'Школа не найдена' });
        }

        myClass.name = name;
        myClass.description = description;
        myClass.schoolId=schoolId;

        await myClass.save();

        if(req.session.userRole===1){
            res.redirect(`/admin/classes`);
        }else{
            res.redirect('/admin/classes');
        }
    } catch (error) {
        console.error('Error updating class:', error);
        res.status(500).render('error', { message: 'Ошибка при обновлении класса' });
    }
};

exports.getSchoolStudents = async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        const classes = await Class.find({ schoolId: req.params.id });
        const classIds = classes.map(c => c._id);
        const students = await User.find({ classId: { $in: classIds }, role: 0 });
        res.render('admin/school-students', { school, students });
    } catch (error) {
        console.error('Error fetching school students:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке учеников' });
    }
};


exports.getSchoolAdmins = async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        const admins = await User.find({ schoolId: req.params.id, role: 1 });
        res.render('admin/school-admins', { school, admins });
    } catch (error) {
        console.error('Error fetching school admins:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке администраторов' });
    }
};


exports.getAdmins = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 1000; // Количество классов на странице
        const skip = (page - 1) * limit;

        const searchQuery = req.query.search || '';
        const searchRegex = new RegExp(searchQuery, 'i');

        const adminsQuery = User.find({role: 1, email: searchRegex })
            .populate('name')
            .skip(skip)
            .limit(limit)
            .lean();

        const [admins, totalAdmins] = await Promise.all([
            adminsQuery.exec(),
            User.countDocuments({ email: searchRegex, role: 1 })
        ]);

        // Получаем количество учеников для каждого класса
        const adminsWithStats = await Promise.all(admins.map(async (adminItem) => {
            const school = await School.findById(adminItem.schoolId).select('name');
            const schoolName = school ? school.name : 'Неизвестная школа';
            return {
                ...adminItem,
                schoolName
            };
        }));

        const totalPages = Math.ceil(totalAdmins / limit);

        res.render('admin/admin-list', {
            admins: adminsWithStats,
            currentPage: page,
            totalPages,
            totalAdmins,
            searchQuery,
            limit
        });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке списка админов' });
    }
};

exports.getPupils = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 1000; // Количество классов на странице
        const skip = (page - 1) * limit;

        const searchQuery = req.query.search || '';
        const searchRegex = new RegExp(searchQuery, 'i');

        let pupilsQuery;

        if(req.session.userRole===1){
            pupilsQuery = User.find({role: 0, email: searchRegex, schoolId: req.session.schoolId})
            .populate('name')
            .skip(skip)
            .limit(limit)
            .lean();
        }else{
            pupilsQuery = User.find({role: 0, email: searchRegex})
            .populate('name')
            .skip(skip)
            .limit(limit)
            .lean();
        }
        

        const [pupils, totalPupils] = await Promise.all([
            pupilsQuery.exec(),
            User.countDocuments({ email: searchRegex, role: 0, schoolId: req.session.schoolId})
        ]);

        // Получаем количество учеников для каждого класса
        const pupilsWithStats = await Promise.all(pupils.map(async (pupilItem) => {
            const pupilClass = await Class.findById(pupilItem.classId);
            var school;
            if(pupilClass){
                school = await School.findById(pupilClass.schoolId).select('name');
            }
            const className = pupilClass ? pupilClass.name : 'Неизвестный класс';
            const schoolName = school ? school.name : 'Неизвестная школа';
            return {
                ...pupilItem,
                schoolName,
                className
            };
        }));

        const totalPages = Math.ceil(totalPupils / limit);

        if(req.session.userRole===1){
            res.render('admin/pupil/pupil-list', {
                pupils: pupilsWithStats,
                currentPage: page,
                totalPages,
                totalPupils,
                searchQuery,
                limit,
                layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                headerTitle: `Ученики`,
                currentPageTitle: 'pupils',
                schoolId: req.session.schoolId
            });
        }else{
            res.render('admin/pupil/pupil-list', {
                pupils: pupilsWithStats,
                currentPage: page,
                totalPages,
                totalPupils,
                searchQuery,
                limit
            });
        }
        
    } catch (error) {
        console.error('Error fetching pupils:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке списка учеников' });
    }
};

exports.deletePupil = async (req, res) => {
    try {
        const pupilId = req.params.id;

        await User.findByIdAndDelete(pupilId);

        res.json({ success: true, message: 'Ученик успешно удален' });
    } catch (error) {
        console.error('Error deleting pupil:', error);
        res.status(500).json({ success: false, message: 'Ошибка при удалении ученика' });
    }
};


exports.getCreateAdmin = async (req, res) => {
    try {
        let schools
        const schoolId=req.params.id;
        if(schoolId){
            const school=await School.findById(schoolId);
            schools=[school];
        }else{
            schools=await School.find();
        }
        
        
        if (!schools) {
            return res.status(404).render('error', { message: 'Школ не найдено' });
        }

        res.render('admin/admin-create', { 
            schools
        });
    } catch (error) {
        console.error('Error fetching school data:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке данных школ' });
    }
};

exports.postCreateAdmin = async (req, res) => {
    try {
        const { name, surname, schoolId, email} = req.body;
        const existingAdmin = await User.findOne({ email });
        
        if (existingAdmin) {
            return res.status(404).render('error', { message: 'Админ уже существует' });
        }

        const newAdmin = new User({ name, surname, schoolId, email, role: 1 });
        await newAdmin.save();
        res.redirect('/admin/list');
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).render('error', { message: 'Ошибка при создании админа' });
    }
};

exports.getEditAdmin = async (req, res) => {
    try {
        // const schoolId=req.params.id;
        
        const admin=await User.findById(req.params.id);
        if (!admin) {
            return res.status(404).render('error', { message: 'Админ не найден' });
        }

        const schools=await School.find();
        
        
        if (!schools) {
            return res.status(404).render('error', { message: 'Школы не найдены' });
        }

        res.render('admin/admin-edit', { 
            schools,
            admin
        });
    } catch (error) {
        console.error('Error fetching admin for edit:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке данных админа' });
    }
};

exports.postEditAdmin = async (req, res) => {
    try {
        const { name, surname, schoolId, email } = req.body;
        const admin = await User.findById(req.params.id);
        
        if (!admin) {
            return res.status(404).render('error', { message: 'Админ не найден' });
        }

        const school = await School.findById(schoolId);
        
        if (!school) {
            return res.status(404).render('error', { message: 'Школа не найдена' });
        }

        admin.name = name;
        admin.surname = surname;
        admin.schoolId=schoolId;
        admin.email=email;

        await admin.save();

        res.redirect('/admin/list');
    } catch (error) {
        console.error('Error updating class:', error);
        res.status(500).render('error', { message: 'Ошибка при редактировании админа' });
    }
};


exports.deleteAdmin = async (req, res) => {
    try {
        const adminId = req.params.id;

        await User.findByIdAndDelete(adminId);

        res.json({ success: true, message: 'Админ успешно удален' });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({ success: false, message: 'Ошибка при удалении админа' });
    }
};



exports.getSurveys = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 1000; // Количество опросов на странице
        const skip = (page - 1) * limit;

        const searchQuery = req.query.search || '';
        const searchRegex = new RegExp(searchQuery, 'i');

        let surveysQuery;
        
        if(req.session.userRole===1){
            const schoolClasses = await Class.find({ schoolId: req.session.schoolId });
            const classIds = schoolClasses.map(cls => cls._id);

            // Теперь ищем опросы, где хотя бы один класс из массива classIds есть в массиве classes
            surveysQuery = Survey.find({
                name: searchRegex,
                // classes: { $in: classIds }  // или classIds если у вас поле называется classIds
                schoolId: req.session.schoolId
            }).skip(skip)
            .limit(limit)
            .lean();
        }else{
            surveysQuery = Survey.find({name: searchRegex })
            .populate('name')
            .skip(skip)
            .limit(limit)
            .lean();
        }

        console.log(`${surveysQuery} survey`);
        const [surveys, totalSurveys] = await Promise.all([
            surveysQuery.exec(),
            Survey.countDocuments({ name: searchRegex, schoolId: req.session.schoolId})
        ]);

        console.log(`${surveys} survey`);

        // Получаем количество учеников для каждого класса
        const surveysWithStats = await Promise.all(surveys.map(async (surveyItem) => {
            const surveyClass = await Class.findById(surveyItem.classes[0]);
            var school;
            if(surveyClass){
                school = await School.findById(surveyClass.schoolId).select('name');
            }
            const className = surveyClass ? surveyClass.name : 'Неизвестный класс';
            const schoolName = school ? school.name : 'Неизвестная школа';
            const surveyResCount=await SurveyResponse.countDocuments({survey:surveyItem._id})

            console.log(`${surveyResCount} survey response count`)
            return {
                ...surveyItem,
                schoolName,
                surveyResCount
            };
        }));

        const totalPages = Math.ceil(totalSurveys / limit);

        if(req.session.userRole===1){
            res.render('admin/survey/survey-list.ejs', {
                surveys: surveysWithStats,
                currentPage: page,
                totalPages,
                totalSurveys,
                searchQuery,
                limit,
                layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                headerTitle: `Опросы`,
                currentPageTitle: 'surveys',
                schoolId: req.session.schoolId
            });
        }else{
            res.render('admin/survey/survey-list.ejs', {
                surveys: surveysWithStats,
                currentPage: page,
                totalPages,
                totalSurveys,
                searchQuery,
                limit
            });
        }
        
    } catch (error) {
        console.error('Error fetching surveys:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке списка опросов' });
    }
};

exports.createSurvey = async (req, res) => {
    try {
        var schools;
        var classes;
        if(req.session.userRole===1){
            schools = await School.findById(req.session.schoolId).lean();
            
                schools=[schools];
            classes = await Class.find({schoolId: req.session.schoolId}).lean();

            res.render('admin/survey/survey-create', { 
                schools,
                classes,
                formData: req.session.formData,
                layout: path.join(__dirname, "../../views/layouts/adminSchoolSurvey"),
                footer: true,
                headerTitle: `Опросы`,
                currentPageTitle: 'surveys',
                title: `Опросы`,
                schoolId: req.session.schoolId
            });
        }else{
            schools = await School.find().lean();
            classes = await Class.find().lean();

            res.render('admin/survey/survey-create', { 
                schools,
                classes,
                formData: req.session.formData,
                layout: path.join(__dirname, "../../views/layouts/adminSurvey"),
                footer: true,
            });
        }
        delete req.session.formData;
    } catch (error) {
        console.error('Error loading project create page:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке страницы создание опроса' });
    }
};

exports.postCreateSurvey = async (req, res) => {
    try {
        const { name, description, options, schoolFilter } = req.body;
        let { classIds } = req.body;
        
        // Преобразуем classIds в массив, если это строка
        if (!Array.isArray(classIds)) {
            classIds = [classIds];
        }

        console.log(req.body);
        // Проверка наличия необходимых полей
        if (!name || !description || !Array.isArray(options) || options.length === 0 || !Array.isArray(classIds)) {
          return res.status(400).json({ message: 'Неверные данные опроса' });
        }
    
        const classes = await Class.find({ _id: { $in: classIds } });
        if (classes.length !== classIds.length) {
          return res.status(400).json({ message: 'Некоторые из указанных классов не существуют' });
        }
    
        // Добавляем optionId к каждому варианту ответа
        const optionsWithIds = options.map((option, index) => ({
          ...option,
          optionId: index + 1
        }));
        var survey;

        if(schoolFilter){

            survey = new Survey({
                name,
                description,
                options: optionsWithIds,
                classes: classIds,
                schoolId: schoolFilter
              });
        }else{

            survey = new Survey({
                name,
                description,
                options: optionsWithIds,
                classes: classIds
              });
        }
        
    
        await survey.save();
    
        res.redirect('/admin/surveys');
        // res.status(201).json({ message: 'Опрос успешно создан', survey });
      } catch (error) {
        console.error('Error creating survey:', error);
        res.status(500).render({ message: 'Ошибка при создании опроса' });
      }
};

exports.showEditForm = async (req, res) => {
    try {
        console.log(`id is ${req.params.id}`)
        const survey = await Survey.findById(req.params.id);
        var schools = await School.find().sort('name');
        var classes = await Class.find().sort('name');
        
        if (!survey) {
            res.status(500).render({ message: 'Опрос не найден' });
        }

        if(req.session.userRole===1){
            schools = await School.findById(req.session.schoolId).sort('name');
            schools=[schools];
            classes = await Class.find({schoolId: req.session.schoolId}).sort('name');
            res.render('admin/survey/survey-edit', {
                survey,
                schools,
                classes,
                layout: path.join(__dirname, "../../views/layouts/adminSchoolSurvey"),
                footer: true,
                headerTitle: `Опросы`,
                currentPageTitle: 'surveys',
                title: `Опросы`,
                schoolId: req.session.schoolId
            });
        }else{
            schools = await School.find().sort('name');
            classes = await Class.find().sort('name');
            res.render('admin/survey/survey-edit', {
                survey,
                schools,
                classes,
                layout: path.join(__dirname, "../../views/layouts/adminSurvey"),
                footer: true,
            });
        }
        
    } catch (error) {
        res.status(500).render({ message: 'Ошибка при загрузке данных' });
    }
}

exports.showInfoSurvey = async (req, res) => {
    try {
        const id = req.params.id;
        const survey = await Survey.findById(id);
        if (!survey) {
          return res.status(404).json({ message: 'Опрос не найден' });
        }
  
        var _id = new mongoose.Types.ObjectId(id);
        const resultsStart = await SurveyResponse.aggregate([
          { $match: { survey: _id } },
          { $group: { _id: '$selectedOption', count: { $sum: 1 } } }
        ]);
    
        const results = survey.options.map(option => {
          const result = resultsStart.find(r => r._id === option.optionId);
          return {
            optionId: option.optionId,
            optionName: option.optionName,
            votes: result ? result.count : 0
          };
        });

        const classes = await Class.find({
            _id: { $in: survey.classes }
        });

        const schoolIds = classes.map(c => c.schoolId);
        const schools = await School.find({
            _id: { $in: schoolIds }
        });

        res.render('admin/survey/survey-result', {
            survey,
            classes,
            schools,
            results,
            layout: path.join(__dirname, "../../views/layouts/adminSurvey"),
            footer: true,
        });
      } catch (error) {
        console.error('Error fetching survey results:', error);
        res.status(500).json({ message: 'Ошибка при получении результатов опроса' });
      }
}

exports.updateSurvey = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, options, classIds } = req.body;

        // Проверяем существование опроса
        const survey = await Survey.findById(id);
        if (!survey) {
            return res.redirect('/admin/surveys');
        }

        const optionsWithIds = options.map((option, index) => ({
            ...option,
            optionId: index + 1
          }));

        // Обновляем данные
        survey.name = name;
        survey.description = description;
        survey.options = optionsWithIds;
        survey.classes = Array.isArray(classIds) ? classIds : [classIds];

        await survey.save();

        return res.redirect('/admin/surveys'); // добавляем return и используем redirect вместо render
    } catch (error) {
        console.error('Error in updateSurvey:', error);
        return res.redirect(`/admin/surveys/edit/${req.params.id}`); // добавляем return и правильный путь
    }
}


exports.deleteSurvey = async (req, res) => {
    try {
        const surveyId = req.params.id;

        // Проверяем, есть ли связанные классы
        // if (project.users.length > 0) {
        //     return res.status(400).json({ success: false, message: 'Нельзя удалить проект, у которого есть участники' });
        // }

        // Если классов нет, удаляем школу
        await Survey.findByIdAndDelete(surveyId);

        res.json({ success: true, message: 'Проект успешно удален' });
    } catch (error) {
        console.error('Error deleting survey:', error);
        res.status(500).json({ success: false, message: 'Ошибка при удалении опроса' });
    }
};


//events

exports.eventsGet = async (req, res) => {
    try {
        if(req.session.userRole===1){
            const currentDate = new Date();
            const events = await Event.find({schoolId: req.session.schoolId, date: { $gte: currentDate.getTime() }})
            .sort({ date: 1 });
            var schools = await School.findById(req.session.schoolId);
            schools=[schools]
            res.render('admin/event/event-list', {
                events,
                schools,
                success: req.flash('success'),
                error: req.flash('error'),
                layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                footer: true,
                headerTitle: `События`,
                currentPageTitle: 'events',
                title: `События`,
                schoolId: req.session.schoolId
            });
        }else{
            const currentDate = new Date();
            const events = await Event.find({date: { $gte: currentDate.getTime() }})
            .sort({ date: 1 });
            const schools = await School.find();

            res.render('admin/event/event-list', {
                events,
                schools,
                success: req.flash('success'),
                error: req.flash('error')
            });
        }
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Ошибка' });
        // req.flash('error', 'Ошибка при загрузке событий');
        // res.redirect('/admin/dashboard');
    }
}

exports.createEvent = async (req, res) => {
    
        try {
            if(req.session.userRole===1){
                var schools = await School.findById(req.session.schoolId);
                schools=[schools]
                res.render('admin/event/event-create', {
                    schools,
                    success: req.flash('success'),
                    error: req.flash('error'),
                    layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                    footer: true,
                    headerTitle: `События`,
                    currentPageTitle: 'events',
                    title: `События`,
                    schoolId: req.session.schoolId
                });
            }else{
                const schools = await School.find().sort('name');
            
                res.render('admin/event/event-create', {
                    schools,
                    success: req.flash('success'),
                    error: req.flash('error')
                });
            }
            
        } catch (error) {
            req.flash('error', 'Ошибка при загрузке формы');
            res.redirect('/admin/events');
        }
}

exports.createEventPost = async (req, res) => {
    try {
        const { title, description, date, schoolId } = req.body;

        const event = new Event({
            title,
            description,
            date,
            schoolId
        });

        await event.save();

        req.flash('success', 'Событие успешно создано');
        res.redirect('/admin/events');
    } catch (error) {
        req.flash('error', 'Ошибка при создании события');
        res.redirect('/admin/events/create');
    }
}

exports.editEvent = async (req, res) => {
    try {
        if(req.session.userRole===1){
            const event = await Event.findById(req.params.id);
            if (!event) {
                req.flash('error', 'Событие не найдено');
                return res.redirect('/admin/events');
            }
            var schools = await School.findById(req.session.schoolId);
            schools=[schools]
            res.render('admin/event/event-edit', {
                event,
                schools,
                success: req.flash('success'),
                error: req.flash('error'),
                layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                footer: true,
                headerTitle: `События`,
                currentPageTitle: 'events',
                title: `События`,
                schoolId: req.session.schoolId
            });
        }
        else{
            const event = await Event.findById(req.params.id);
            if (!event) {
                req.flash('error', 'Событие не найдено');
                return res.redirect('/admin/events');
            }
    
    
            const schools = await School.find().sort('name');
            
            res.render('admin/event/event-edit', {
                event,
                schools,
                success: req.flash('success'),
                error: req.flash('error')
            });
        }
    } catch (error) {
        console.error('Error:', error);
        req.flash('error', 'Ошибка при загрузке события');
        res.redirect('/admin/events');
    }
}

exports.editEventPost = async (req, res) => {
    try {
        const { title, description, date, schoolId } = req.body;
        
        const event = await Event.findByIdAndUpdate(req.params.id, {
            title,
            description,
            date,
            schoolId
        });

        if (!event) {
            req.flash('error', 'Событие не найдено');
            return res.redirect('/admin/events');
        }

        req.flash('success', 'Событие успешно обновлено');
        res.redirect('/admin/events');
    } catch (error) {
        console.error('Error:', error);
        req.flash('error', 'Ошибка при обновлении события');
        res.redirect(`/admin/events/edit/${req.params.id}`);
    }
}

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        
        if (!event) {
            return res.json({ 
                success: false, 
                message: 'Событие не найдено' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Событие успешно удалено' 
        });
    } catch (error) {
        console.error('Error:', error);
        res.json({ 
            success: false, 
            message: 'Ошибка при удалении события' 
        });
    }
}

exports.createDiscussion = async (req, res) => {
    try {
        if(req.session.userRole===1){
        
            var schools = await School.findById(req.session.schoolId);
            schools=[schools];
            res.render('admin/discussion/discussion-create', {
                schools,
                layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                footer: true,
                headerTitle: `Обсуждения`,
                currentPageTitle: 'discussions',
                title: `Обсуждения`,
                schoolId: req.session.schoolId
            });
        }else{
            const schools = await School.find().sort('name');
            res.render('admin/discussion/discussion-create', {
                schools,
                error: req.flash('error')
            });
        }
        
    } catch (error) {
        console.error('Error:', error);
        req.flash('error', 'Ошибка при загрузке формы');
        res.redirect('/admin/discussions');
    }
}

exports.createDiscussionPost = async (req, res) => {
    try {
        const { title, description, isGlobal, schoolId } = req.body;
        
        const discussion = new Discussion({
            title,
            description,
            isGlobal: isGlobal === 'on',
            schoolId: isGlobal === 'on' ? null : schoolId
        });

        await discussion.save();
        req.flash('success', 'Обсуждение успешно создано');
        res.redirect('/admin/discussions');
    } catch (error) {
        console.error('Error:', error);
        req.flash('error', 'Ошибка при создании обсуждения');
        res.redirect('/admin/discussions/create');
    }
}

exports.discussionList = async (req, res) => {
    try {
        if(req.session.userRole===1){
            const discussions = await Discussion.find({
                $or: [
                    { isGlobal: true },
                    { schoolId: req.session.schoolId }
                ]
            }).lean();
        
            var schools = await School.findById(req.session.schoolId);
            schools=[schools];

            console.log(`discussions ${discussions}`)
            res.render('admin/discussion/list', {
                discussions,
                schools,
                layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                footer: true,
                headerTitle: `Обсуждения`,
                currentPageTitle: 'discussions',
                title: `Обсуждения`,
                schoolId: req.session.schoolId
            });
        }else{
            const discussions = await Discussion.find()
            .sort('-createdAt')
            .lean();
        
            const schools = await School.find().lean();

            console.log(`discussions ${discussions}`)
            res.render('admin/discussion/list', {
                discussions,
                schools
            });
        }
        
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/admin/dashboard');
    }
}

exports.deleteDiscussion = async (req, res) => {
    try {
        const discussionId = req.params.id;
        const discussion = await Discussion.findByIdAndDelete(discussionId);
        
        if (!discussion) {
            return res.json({ 
                success: false, 
                message: 'Обсуждение не найдено' 
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.json({ 
            success: false, 
            message: 'Ошибка при удалении обсуждения' 
        });
    }
}

exports.editDiscussion = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.redirect('/admin/discussions');
        }

        if(req.session.userRole===1){
            var schools = await School.findById(req.session.schoolId);
            schools=[schools];
            res.render('admin/discussion/edit', {
                discussion,
                schools,
                layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                footer: true,
                headerTitle: `Обсуждения`,
                currentPageTitle: 'discussions',
                title: `Обсуждения`,
                schoolId: req.session.schoolId
            });
        }else{
            const schools = await School.find().sort('name');
        
            res.render('admin/discussion/edit', {
                discussion,
                schools
            });
        }

        
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/admin/discussions');
    }
}

exports.editDiscussionPost = async (req, res) => {
    try {
        const { title, description, isGlobal, schoolId } = req.body;
        
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.redirect('/admin/discussions');
        }

        discussion.title = title;
        discussion.description = description;
        discussion.isGlobal = !!isGlobal;
        discussion.schoolId = isGlobal ? null : schoolId;

        await discussion.save();

        res.redirect('/admin/discussions');
    } catch (error) {
        console.error('Error:', error);
        res.redirect(`/admin/discussions/edit/${req.params.id}`);
    }
}