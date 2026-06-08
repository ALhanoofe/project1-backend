const { User } = require('../models');
const middleware = require('../models/middleware');

const Register = async (req, res) => {
  try {
    let {
      memberName,
      memberEmail,
      CPR,
      password,
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
      city,
      mailboxNo,
      projectType,
      exName,
      exPhoneNumber,
      exCpr,
      exRelation,
      exOfficeNo,
      exHomeNo,
      exFoxNo,
    } = req.body;

    // ❗ Required fields
    if (!CPR || !password) {
      return res.status(400).send("CPR and password are required");
    }

    // ❗ Clean CPR
    CPR = Number(CPR);
    if (isNaN(CPR)) {
      return res.status(400).send("Invalid CPR");
    }

    // ❗ Clean email (IMPORTANT FIX FOR YOUR ERROR)
    if (!memberEmail || memberEmail.trim() === "") {
      memberEmail = undefined;
    } else {
      memberEmail = memberEmail.trim();

      // check duplicate email only if exists
      const emailExists = await User.exists({ memberEmail });
      if (emailExists) {
        return res.status(400).send("Email already exists");
      }
    }

    // ❗ Check duplicate CPR
    const cprExists = await User.exists({ CPR });
    if (cprExists) {
      return res.status(400).send("CPR already exists");
    }

    // ❗ Hash password
    const passwordDigest = await middleware.hashPassword(password);

    // ❗ Create user
    const user = await User.create({
      memberName,
      memberEmail,
      CPR,
      password: passwordDigest,
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
      city,
      mailboxNo,
      projectType,
      exName,
      exCpr,
      exRelation,
      exPhoneNumber,
      exOfficeNo,
      exHomeNo,
      exFoxNo,
      status: "pending",
      role: "user",
      memberStatus: "مشترك",
    });

    return res.status(201).send(user);

  } catch (error) {
    console.log("REGISTER ERROR:", error);

    return res.status(500).send({
      msg: "Server error"
    });
  }
};



const Login = async (req, res) => {
  try {
    let { CPR, password } = req.body

    CPR = Number(CPR)

    const user = await User.findOne({ CPR })

    if (!user) {
      return res.status(404).send({
        status: "Error",
        msg: "User not found"
      })
    }

    let matched = await middleware.comparePassword(
      password,
      user.password
    )

    if (!matched) {
      return res.status(401).send({
        status: "Error",
        msg: "Wrong password"
      })
    }

    let payload = {
      id: user._id,
      name: user.memberName,
      cpr: user.CPR,
      email: user.memberEmail,
      phoneNumber: user.phoneNumber,
      status: user.status
    }

    let token = middleware.createToken(payload)

    return res.status(200).send({ user, token })

  } catch (error) {
    console.log(error)
    return res.status(500).send({
      status: "Error",
      msg: "Server error"
    })
  }
}

const GetUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).send({
        msg: "User not found"
      })
    }

    res.status(200).send(user)

  } catch (error) {
    console.log(error)

    res.status(500).send({
      msg: "Error getting user"
    })
  }
}

const CheckSession = async (req, res) => {
  try {
    const user = await User.findById(res.locals.payload.id);

    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }

    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "Session error" });
  }
};

const UpdateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }

    const { newPassword, ...data } = req.body;

    Object.assign(user, data);

    if (newPassword) {
      user.password = await middleware.hashPassword(newPassword);
    }

    await user.save();

    return res.status(200).send(user);

  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "Update failed" });
  }
};
const UpdatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body

    let user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).send({ msg: "User not found" })
    }

    const matched = await middleware.comparePassword(
      oldPassword,
      user.password
    )

    if (!matched) {
      return res.status(401).send({ msg: "Wrong password" })
    }

    user.password = await middleware.hashPassword(newPassword)

    await user.save()

    return res.status(200).send({
      status: "Password Updated Successfully"
    })

  } catch (error) {
    console.log(error)
    return res.status(500).send({
      msg: "Update password failed"
    })
  }
}
module.exports = {
  Register,
  Login,
  UpdatePassword,
  CheckSession,
  UpdateUser,
  GetUserById
}
