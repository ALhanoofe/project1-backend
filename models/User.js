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
  mailboxNo: { type: Number, required: true },

  password: { type: String, required: true },

// هل نحط امثل و لا 
  projectType: { type: String, required: true },

  exName: { type: String, required: true },
  exCpr: { type: Number, required: true },
  exRelation: { type: String, required: true },
  exName: { type: Number, required: true },
  exOfficeNo: { type: Number, required: true },
  exHomeNo: { type: Number, required: true },
  exFoxNo: { type: Number, required: true },



})
module.exports = UserSchema