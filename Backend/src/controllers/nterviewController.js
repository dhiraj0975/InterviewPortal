import Interview from "../models/Interview.js";

/* ✅ Add Interview Record */
export const addInterview = async (req, res, next) => {
  try {
    const data = new Interview(req.body);
    await data.save();
    res.status(201).json({
      success: true,
      message: "Interview record added successfully!",
      data,
    });
  } catch (error) {
    next(error); // Global error handler ko bhej do
  }
};

/* ✅ Get All Records */
export const getAllInterviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const data = await Interview.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean();
    const total = await Interview.countDocuments();
    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data,
    });
  } catch (error) {
    next(error);
  }
};

/* ✅ Get Single Record */
export const getInterviewById = async (req, res, next) => {
  try {
    const data = await Interview.findById(req.params.id);
    if (!data) {
      const err = new Error("Interview record not found");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/* ✅ Update Record */
export const updateInterview = async (req, res, next) => {
  try {
    const data = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) {
      const err = new Error("Interview record not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      message: "Interview record updated successfully!",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/* ✅ Delete Record */
export const deleteInterview = async (req, res, next) => {
  try {
    const data = await Interview.findByIdAndDelete(req.params.id);
    if (!data) {
      const err = new Error("Interview record not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      message: "Interview record deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};
