const { Schema } = require('mongoose');

const UserSchema = new Schema({
  memberName: { type: String },
  memberEmail: {
    type: String,

  },
  CPR: { type: Number, unique: true, required: true },
  bankName: { type: String },
  ibanNo: { type: String },

  phoneNumber: { type: Number },
  extraNumber: { type: Number },
  homeNumber: { type: Number },
  officeNumber: { type: Number },
  faxNumber: { type: Number },


  buildingNo: { type: Number },
  blockNo: { type: Number },
  rodeNo: { type: Number },
  departmentNo: { type: String },
  city: { type: String },
  mailboxNo: { type: Number },

  userbalance: {
    type: String,
    enum: ["option1", "option2", "option3"],
    default: "option1"
  },




  // هل نحط امثل و لا 
  projectType: { type: String },

  exName: { type: String },
  exCpr: { type: Number },
  exRelation: { type: String },
  exPhoneNumber: { type: Number },
  exOfficeNo: { type: Number },
  exHomeNo: { type: Number },
  exFoxNo: { type: Number },

  status: {
    type: String,
    enum: ["pending", "approved"],
    default: "pending",
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  memberStatus: {
    type: String,
    enum: ["مشترك", "منسحبة"],
    default: "مشترك",
  },
  password: { type: String },
  settlementreason: { type: String },

  subscriptionDate: {
    type: Date,
    default: Date.now
  }


})
module.exports = UserSchema