const { User } = require('../models')
const middleware = require('../models/middleware')

const Register = async (req, res) => {
  try {
    const {
      memberName,
      memberEmail,
      CPR,
      bankName,
      ibanNo,
      phoneNumber,
      extraNumber,
      homeNumber,
      officeNumber,
      faxNumber,
      buildingNo,
      blockNo,
      rodeNo,
      departmentNo,
      mailboxNo,
      password,
      projectType,
      exName,
      exCpr,
      exRelation,
      exOfficeNo,
      exHomeNo,
      exFoxNo
    } = req.body;

    let passwordDigest = await middleware.hashPassword(password);
    let existingUser = await User.exists({ memberEmail });
    if (existingUser) {
      return res.status(400).send('A user with that email has already been registered!');
    } else {
      const user = await User.create({
        memberName,
        memberEmail,
        CPR,
        bankName,
        ibanNo,
        phoneNumber,
        extraNumber,
        homeNumber,
        officeNumber,
        faxNumber,
        buildingNo,
        blockNo,
        rodeNo,
        departmentNo,
        mailboxNo,
        password: passwordDigest,
        projectType,
        exName,
        exCpr,
        exRelation,
        exOfficeNo,
        exHomeNo,
        exFoxNo
      });
      res.status(200).send(user);
    }
  } catch (error) {
    throw error;
  }
}
const Login = async (req, res) => {
  try {
    const { CPR, password } = req.body;
    const user = await User.findOne({ CPR });

    if (!user) {
      return res.status(401).send({ status: 'Error', msg: 'User not found' });
    }

    let matched = await middleware.comparePassword(password, user.password);

    if (matched) {
      let payload = {
        id: user._id,
        name: user.memberName,
        CPR: user.CPR,
        email: user.memberEmail,
        PhoneNumber: user.phoneNumber,
        userType: user.userType,
        username: user.username
      };

      let token = middleware.createToken(payload);

      return res.status(200).send({ user: payload, token });
    } else {
      res.status(401).send({ status: 'Error', msg: 'Invalid credentials' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: 'Error', msg: 'An error occurred during login' });
  }
}
const UpdatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ status: 'Error', msg: 'User not found' });
    }
    let matched = await middleware.comparePassword(oldPassword, user.password);
    if (matched) {
      let passwordDigest = await middleware.hashPassword(newPassword);
      user.password = passwordDigest;
      await user.save();

      let payload = {
        id: user._id,
        name: user.memberName,
        email: user.memberEmail,
        phoneNumber: user.phoneNumber
      };
      return res.status(200).send({ status: 'Password Updated!', user: payload });
    } else {
      res.status(401).send({ status: 'Error', msg: 'Old Password did not match!' });
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      status: 'Error',
      msg: 'An error has occurred updating password!'
    });
  }
}

const CheckSession = async (req, res) => {
  const { payload } = res.locals;
  res.status(200).send(payload);
}

module.exports = {
  Register,
  Login,
  UpdatePassword,
  CheckSession
};