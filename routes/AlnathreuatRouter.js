const router = require("express").Router();

const controller =
  require("../controllers/AlnathreuatController");


router.get(
  "/",
  controller.GetAllAlnathreuats
);


router.get(
  "/user/:id",
  controller.GetAlnathreuatById
);


// IMPORTANT:
// This must be BEFORE /:id

router.get(
  "/pending/user/:id",
  controller.GetPendingAlnathreuatsByUserId
);


router.post(
  "/",
  controller.CreateAlnathreuat
);


router.put(
  "/:id/accept",
  controller.AcceptAlnathreuat
);


router.put(
  "/:id/reject",
  controller.RejectAlnathreuat
);


router.put(
  "/:id",
  controller.UpdateAlnathreuat
);


router.delete(
  "/:id",
  controller.DeleteAlnathreuat
);


module.exports = router;