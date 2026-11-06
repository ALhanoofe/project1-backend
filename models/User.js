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
    type: String,
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

  paymentMethod: {type:String, enum:["Standing Order", "benefit"]},
  SOpaymentDate: {type:Date},
  SOpaymentAmount:{type:Number},


  // =========================
  // PHONE
  // =========================

  phoneNumber: {
    type: String
  },

  extraNumber: {
    type: String
  },

  homeNumber: {
    type: String
  },

  officeNumber: {
    type: String
  },

  faxNumber: {
    type: String
  },


  // =========================
  // ADDRESS
  // =========================

  buildingNo: {
    type: String
  },

  blockNo: {
    type: String
  },

  rodeNo: {
    type: String
  },

  flatNo: {
    type: String
  },

  city: {
    type: String
  },

  // mailboxNo: {
  //   type: Number
  // },


  // =========================
  // BALANCE (inheritancePolicy)
  // =========================

  inheritancePolicy: {
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

  // exName: {
  //   type: String
  // },

  // exCpr: {
  //   type: Number
  // },

  // exRelation: {
  //   type: String
  // },

  // exPhoneNumber: {
  //   type: Number
  // },

  // exOfficeNo: {
  //   type: Number
  // },

  // exHomeNo: {
  //   type: Number
  // },

  // exFoxNo: {
  //   type: Number
  // },


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


  // =========================
  // FORM STATUS
  // =========================

  formCompleted: {
    type: Boolean,
    default: false
  },


  // =========================
  // ROLE
  // =========================

  role: {
    type: String,

    enum: [
      "user",
      "admin"
    ],

    default: "user"
  },


  // =========================
  // MEMBER STATUS
  // =========================

  // memberStatus: {
  //   type: String,

  //   enum: [
  //     "مشترك",
  //     "منسحب"
  //   ],

  //   default: "مشترك"
  // },


  // =========================
  // PASSWORD
  // =========================

  password: {
    type: String
  },


  // =========================
  // SETTLEMENT
  // =========================

  settlementreason: {
    type: String
  },


  // =========================
  // SUBSCRIPTION
  // =========================

  subscriptionAmount: {
    type: Number
  },

  subscriptionDate: {
    type: Date,

    default: Date.now
  }
  ,
    projectPersonName: {
    type: String
  },

    projectPersonCpr: {
    type: String
  },

    projectPersonRelation: {
    type: String
  },

    projectPersonPhone: {
    type: String
  },
  projectHomePhone:{type: String},
  projectWorkPhone: {type: String},
  projectWorkFax: {type: String}

})

module.exports = UserSchema
