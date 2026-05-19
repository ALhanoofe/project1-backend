const { Schema } = require('mongoose');

const UserSchema = new Schema({
  memberName: { type: String, required: true },
  memberEmail: { type: String, required: true, unique: true },
  CPR: { type: Number, required: true, unique: true },
  bankName: { type: String, required: true },
  ibanNo: { type: String, required: true },

  phoneNumber: { type: Number, required: true },
  extraNumber: { type: Number },
  homeNumber: { type: Number },
  officeNumber: { type: Number },
  faxNumber: { type: Number },


  buildingNo: { type: Number, required: true },
  blockNo: { type: Number, required: true },
  rodeNo: { type: Number, required: true },
  departmentNo: { type: String, required: true },
  city: { type: String, required: true },
  mailboxNo: { type: Number, required: true },

  userbalance: {    
    type: String,
    enum: ["option1", "option2", "option3"],
    default: "pending", },




  // هل نحط امثل و لا 
  projectType: { type: String, required: true },

  exName: { type: String, required: true },
  exCpr: { type: Number, required: true },
  exRelation: { type: String, required: true },
  exPhoneNumber: { type: Number, required: true },
  exOfficeNo: { type: Number, required: true },
  exHomeNo: { type: Number, required: true },
  exFoxNo: { type: Number },

  status: {
    type: String,
    enum: ["pending", "approved"],
    default: "pending",
  },
  password: { type: String, required: false },




})
module.exports = UserSchema