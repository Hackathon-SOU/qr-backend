const volunteerData = require("../models/member");
const httpStatus = require("http-status");
const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");

const deleteMemberAccount = async (req, res, next) => {
  try {
    const membershipId = req.body.membershipId;
    if (membershipId === req.membershipId) {
      res.send({
        message: "You can not delete your account yourself",
      });
    } else {
      const data = await volunteerData.deleteOne({
        membershipId: membershipId,
      });
      if (data.deletedCount === 1) {
        res.send({
          data: data,
        });
      } else if (data.acknowledged === false) {
        res.send({
          message: "Account not found",
        });
      }
    }
  } catch (error) {
    logger.error("delete member catch error %o", error);
  }
};

const getAllMemberDetails = async (req, res, next) => {
  try {
    let data;
    if (req.role === "super-admin") {
      data = await volunteerData.find(
        {
          membershipId: {
            $ne: req.membershipId,
          },
        },
        {
          _id: 0,
          __v: 0,
          password: 0,
        }
      );
    } else if (req.role === "admin") {
      data = await volunteerData.find(
        {
          role: {
            $nin: ["super-admin"],
          },
          membershipId: {
            $ne: req.membershipId,
          },
        },
        {
          _id: 0,
          __v: 0,
          password: 0,
        }
      );
    } else {
      data = await volunteerData.find(
        {
          role: {
            $nin: ["admin", "super-admin"],
          },
          membershipId: {
            $ne: req.membershipId,
          },
        },
        {
          _id: 0,
          __v: 0,
          password: 0,
        }
      );
    }
    res.status(httpStatus.OK).send({
      data,
    });
  } catch (error) {
    logger.error("getMemberDetails catch errror %o", error);
    next(new ApiError(error));
  }
};

const getProfileDetails = async (req, res, next) => {
  try {
    console.log("req.headers.cookies", req.headers.cookie);
    const member = await volunteerData.findById(
      { _id: req.id },
      { _id: 0, __v: 0, verified: 0, password: 0 }
    );
    res.status(200).send({
      data: member,
    });
  } catch (error) {
    logger.error("get member details catch %o", error);
    res.send(httpStatus.BAD_REQUEST, { message: error.message });
  }
};

const updateMemberDetails = async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body;

    const memberUpdate = await volunteerData.findByIdAndUpdate(
      { _id: req.id },
      {
        $rename: {
          name: "firstName",
        },
        $set: {
          firstName,
          lastName,
          email,
        },
      },
      { new: true }
    );
    logger.debug("memberUpdate %o", memberUpdate);
    res.send({
      data: memberUpdate,
    });
  } catch (error) {
    logger.error("error %o", error);
  }
};

module.exports = {
  getAllMemberDetails,
  deleteMemberAccount,
  getProfileDetails,
  updateMemberDetails,
};
