const { Schema } = require("mongoose")

const UserSchema = new Schema({

  // =========================
  // PERSONAL INFORMATION
  // =========================

  memberName: {
    type: String
  },

  memberEmail: {
    type: String
  },

  CPR: {
    type: Number,
    unique: true,
    required: true
  },

  profilePicture: {
    type: String,
    default: ""
  },

  signature: {
    type: String,
    default: ""
  },


  // =========================
  // BANK
  // =========================

  bankName: {
    type: String
  },

  ibanNo: {
    type: String
  },


  // =========================
  // PHONE
  // =========================

  phoneNumber: {
    type: Number
  },

  extraNumber: {
    type: Number
  },

  homeNumber: {
    type: Number
  },

  officeNumber: {
    type: Number
  },

  faxNumber: {
    type: Number
  },


  // =========================
  // ADDRESS
  // =========================

  buildingNo: {
    type: Number
  },

  blockNo: {
    type: Number
  },

  rodeNo: {
    type: Number
  },

  departmentNo: {
    type: String
  },

  city: {
    type: String
  },

  mailboxNo: {
    type: Number
  },


  // =========================
  // BALANCE
  // =========================

  userbalance: {
    type: String,

    enum: [
      "option1",
      "option2",
      "option3"
    ],

    default: "option1"
  },


  projectType: {
    type: String
  },


  // =========================
  // EMERGENCY CONTACT
  // =========================

  exName: {
    type: String
  },

  exCpr: {
    type: Number
  },

  exRelation: {
    type: String
  },

  exPhoneNumber: {
    type: Number
  },

  exOfficeNo: {
    type: Number
  },

  exHomeNo: {
    type: Number
  },

  exFoxNo: {
    type: Number
  },


  // =========================
  // USER STATUS
  // =========================

  status: {
    type: String,

    enum: [
      "pending",
      "approved",
      "withdrawn"
    ],

    default: "pending"
  },


  role: {
    type: String,

    enum: [
      "user",
      "admin"
    ],

    default: "user"
  },


  memberStatus: {
    type: String,

    enum: [
      "مشترك",
      "منسحب"
    ],

    default: "مشترك"
  },


  password: {
    type: String
  },

  settlementreason: {
    type: String
  },


  subscriptionDate: {
    type: Date,

    default: Date.now
  }

})

module.exports = UserSchema