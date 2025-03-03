const mongoose=require('mongoose');
const UserModel = require("../models/user.model");
const { Schema } = mongoose;
const School = require("../models/school.model");
const { type } = require('os');

const ideaStatusEnum = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};

const ideaSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    userId: { type: Schema.Types.ObjectId, ref: UserModel.modelName },
    schoolId:{
        type : Schema.Types.ObjectId,
        ref: School.modelName
      },
    createdAt: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: Object.values(ideaStatusEnum),
        default: ideaStatusEnum.PENDING
    },
});

const IdeaModel = mongoose.model('idea', ideaSchema);

module.exports = {
    IdeaModel,
    ideaStatusEnum
};