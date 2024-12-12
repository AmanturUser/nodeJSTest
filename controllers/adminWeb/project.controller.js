const Project = require('../../models/project.model');
const School = require('../../models/school.model');
const Class = require('../../models/class.model');
const User = require('../../models/user.model');
const mongoose=require('mongoose');
const path = require('path');
const ProjectServices = require("../../services/project.services");



async function validateUsers(userIds) {
    const invalidUsers = [];
  
    for (const userId of userIds) {
      try {
        const _id = new mongoose.Types.ObjectId(userId);
        const checkUser = await User.findById(_id);
        if (!checkUser) {
          invalidUsers.push(userId);
        }
      } catch (error) {
        console.error(`Error checking user ${userId}:`, error);
        invalidUsers.push(userId);
      }
    }
  
    return invalidUsers;
  }

// Projects controller
exports.getProjectList = async (req,res,next) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 50; // Количество опросов на странице
        const skip = (page - 1) * limit;

        const searchQuery = req.query.search || '';
        const searchRegex = new RegExp(searchQuery, 'i');

        let projectQuery;

        if (req.session.userRole === 1) {
            // Сначала получаем всех пользователей данной школы
            const schoolUsers = await User.find({ schoolId: req.session.schoolId }, '_id');
            const userIds = schoolUsers.map(user => user._id);
         
            // Ищем проекты, где хотя бы один пользователь из школы есть в массиве users
            projectQuery = Project.find({
                name: searchRegex,
                users: { $in: userIds }
            })
            .skip(skip)
            .limit(limit)
            .lean();
         }else{
            projectQuery = Project.find({name: searchRegex })
            .populate('name')
            .skip(skip)
            .limit(limit)
            .lean();
        }
        

        const [projects, totalProject] = await Promise.all([
            projectQuery.exec(),
            Project.countDocuments({ name: searchRegex})
        ]);

        const projectsWithStats = await Promise.all(projects.map(async (projectItem) => {
            var school=await School.findById(projectItem.schoolId).select('name');
            const schoolName = school ? school.name : 'Неизвестная школа';
            const inProjectUserCount=projectItem.users.length;
            return {
                ...projectItem,
                schoolName,
                inProjectUserCount
            };
        }));

        const totalPages = Math.ceil(totalProject / limit);

        if(req.session.userRole===1){
            res.render('admin/project/project-list.ejs', {
                projects: projectsWithStats,
                currentPage: page,
                totalPages,
                totalProject,
                searchQuery,
                limit,
                layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                headerTitle: `Проекты`,
                currentPageTitle: 'projects',
                schoolId: req.session.schoolId
            });
        }
        res.render('admin/project/project-list.ejs', {
            projects: projectsWithStats,
            currentPage: page,
            totalPages,
            totalProject,
            searchQuery,
            limit
        });

    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).render('error', { message: 'Ошибка при загрузке списка проектов' });
    }
}

exports.deleteProject = async (req, res) => {
    try {
        const projectId = req.params.id;

        // Проверяем, есть ли связанные классы
        const project = await Project.findById(projectId);
        if (project.users.length > 0) {
            return res.status(400).json({ success: false, message: 'Нельзя удалить проект, у которого есть участники' });
        }

        // Если классов нет, удаляем школу
        await Project.findByIdAndDelete(projectId);

        res.json({ success: true, message: 'Проект успешно удален' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ success: false, message: 'Ошибка при удалении проекта' });
    }
};

exports.editProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.redirect('/admin/projects');
        }

        console.log('Project userIds:', project.user); // для проверки

        var schools;
        var classes;
        var users;

        // Преобразуем userIds в строки для корректного сравнения
        // project.users = project.users.map(id => id.toString());
        if(req.session.userRole===1){
            schools = await School.findById(req.session.schoolId).sort('name');
            classes = await Class.find({schoolId: req.session.schoolId}).sort('name');
            users = await User.find({ role: 0, schoolId: req.session.schoolId})
                .sort('name');
            
            schools=[schools];

                res.render('admin/project/project-edit', {
                    project,
                    schools,
                    classes,
                    users,
                    layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
                    headerTitle: `Проекты`,
                    currentPageTitle: 'projects',
                    schoolId: req.session.schoolId
                });
        }else{
            const schools = await School.find().sort('name');
            const classes = await Class.find().sort('name');
            const users = await User.find({ role: 0 })
                .where('schoolId').exists(true)
                .where('classId').exists(true)
                .sort('name');
            res.render('admin/project/project-edit', {
                project,
                schools,
                classes,
                users,
            });
        }
        
    } catch (error) {
        console.error('Error in showEditForm:', error);
        res.status(500).send('Ошибка при загрузке страницы редактирования проекта');

    }
};

exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, users } = req.body;

        const project = await Project.findById(id);
        if (!project) {
            return res.redirect('/admin/surveys');
        }

        project.name = name;
        project.description = description;
        project.users = Array.isArray(users) ? users : [users];
        
        await project.save();

        res.redirect('/admin/projects');
    } catch (error) {
        console.error('Error:', error);

        res.status(500).send('Ошибка при загрузке страницы создание проекта');
    }
}

exports.createProject = async (req, res) => {
    try {
        const schools = await School.find().lean();
        const classes = await Class.find().lean();
        const users = await User.find({ role: 0 }).sort('name');
        res.render('admin/project/project-create', { 
            schools,
            classes,
            users
        });
    } catch (error) {
        console.error('Error loading project create page:', error);
        res.status(500).send('Ошибка при загрузке страницы создание проекта');
    }
};

exports.postCreateProject = async (req,res,next) => {
    try {
        const {name, description, userIds} = req.body;

        const invalidUsers = await validateUsers(userIds);

        if (invalidUsers.length > 0) {
            return res.status(404).json({ 
              message: 'Некоторые пользователи не найдены', 
              invalidUsers 
            });
          }

        let newProject = await ProjectServices.createProject(name, description, userIds);

        await User.updateMany(
            { _id: { $in: userIds } },
            { 
                $addToSet: { projects: newProject },
                $inc: { rating: 1 }
             },
          );

          res.redirect('/admin/projects');
        // res.json({status: true, success: newProject});
    } catch (error) {
        next(error);
    }
}