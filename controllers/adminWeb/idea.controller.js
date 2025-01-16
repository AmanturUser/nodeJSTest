// controllers/ideaController.js
const {IdeaModel, ideaStatusEnum} = require('../../models/idea.model');
const UserModel = require('../../models/user.model');
const UserClass = require('../../models/class.model');
const path = require('path');

exports.listIdeas = async (req, res) => {
    try {
        // Получаем schoolId из сессии администратора

        
        // Получаем все идеи для данной школы
        const ideas = await IdeaModel.find({ schoolId: req.session.schoolId })
            .sort({ createdAt: -1 });    // Сортируем по дате создания

            const ideasWithUsers = (await Promise.all(
                ideas.map(async (idea) => {
                    const userInfo = await UserModel.findById(idea.userId);
                    if (!userInfo) return null; // Пропускаем идеи без пользователя

                    const date = new Date(idea.createdAt);
                    const formattedDate = date.toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    const userClass = await UserClass.findById(userInfo.classId);
                    return {
                        ...idea.toObject(),
                        userFullName: `${userInfo.name} ${userInfo.surname} (${userClass.name})`.trim(),
                        formattedDate
                    };
                })
            )).filter(idea => idea !== null); // Удаляем все null значения
        
        res.render('admin/idea/list', { 
            ideas : ideasWithUsers,
            title: 'Список идей',
            ideaStatusEnum,
            layout: path.join(__dirname, "../../views/layouts/schoolAdmin"),
            footer: true,
            headerTitle: 'Инициативы',
            currentPageTitle: 'ideas'
        });
    } catch (error) {
        console.error('Error fetching ideas:', error);
        res.status(500).render('error', { 
            message: 'Ошибка при загрузке списка идей'
        });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const schoolId = req.session.schoolId;

        if (!Object.values(ideaStatusEnum).includes(status)) {
            throw new Error('Invalid status');
        }

        const idea = await IdeaModel.findOne({ _id: id, schoolId });
        
        if (!idea) {
            return res.status(404).json({ 
                success: false, 
                message: 'Идея не найдена' 
            });
        }

        idea.status = status;
        await idea.save();

        if (req.xhr) {
            return res.json({ 
                success: true, 
                message: 'Статус обновлен' 
            });
        }

        req.flash('success', 'Статус идеи обновлен');
        res.redirect('/admin/ideas');

    } catch (error) {
        console.error('Error updating idea status:', error);
        if (req.xhr) {
            return res.status(500).json({ 
                success: false, 
                message: 'Ошибка при обновлении статуса' 
            });
        }
        res.status(500).render('error', { 
            message: 'Ошибка при обновлении статуса идеи' 
        });
    }
};