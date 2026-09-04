const { Sadaqa } = require('../models')

const GetAllSadaqa = async (req, res) => {
  try {
    const sadaqas = await Sadaqa.find().populate('userId')
    res.status(200).send(sadaqas)
  }
  catch (error) {
    throw error
  }
}

const GetSadaqaById = async (req, res) => {
  try {
    const sadaqa = await Sadaqa.findById(req.params.id)
    res.status(200).send(sadaqa)
  } catch (error) {
    throw error
  }
}

const CreateSadaqa = async (req, res) => {
  try {
    // If this is a sadaqa expense
    if (req.body.type === "paid") {

      // Get all sadaqa records
      const allSadaqa = await Sadaqa.find();

      // Calculate total received donations
      const totalReceived = allSadaqa.reduce((sum, item) => {
        if (item.type === "paid") {
          return sum;
        }

        return sum + Number(item.SubAmount || 0);
      }, 0);

      // Calculate total already spent
      const totalSpent = allSadaqa.reduce((sum, item) => {
        if (item.type === "paid") {
          return sum + Number(item.SubAmount || 0);
        }

        return sum;
      }, 0);

      // Available balance
      const remainingAmount = totalReceived - totalSpent;

      // Amount requested to spend
      const expenseAmount = Number(req.body.SubAmount || 0);

      // Validate amount
      if (expenseAmount <= 0) {
        return res.status(400).send({
          msg: "مبلغ الصرف يجب أن يكون أكبر من صفر"
        });
      }

      // Prevent spending more than available
      if (expenseAmount > remainingAmount) {
        return res.status(400).send({
          msg: `لا يمكن صرف هذا المبلغ. المبلغ المتوفر للصرف هو ${remainingAmount.toFixed(
            3
          )} BD`
        });
      }
    }

    // Create the sadaqa only if validation passed
    const sadaqa = await Sadaqa.create(req.body);

    res.status(201).send(sadaqa);

  } catch (error) {
    console.log(error);

    res.status(500).send({
      msg: "حدث خطأ أثناء تسجيل الصدقة"
    });
  }
};

const UpdateSadaqa = async (req, res) => {
  try {
    const sadaqa = await Sadaqa.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.status(200).send(sadaqa)
  } catch (error) {
    throw error
  }
}

const DeleteSadaqa = async (req, res) => {
  try {
    await Sadaqa.findByIdAndDelete(req.params.id)
    res.status(204).send()
  } catch (error) {
    throw error
  }
}





module.exports = {
  GetAllSadaqa,
  GetSadaqaById,
  CreateSadaqa,
  UpdateSadaqa,
  DeleteSadaqa

}
