import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  hrName: {
    type: String,
  },
  hrContact: {
    type: String,
  },
  role: {
    type: String,
  },
  location: {
    type: String,
  },
  rounds: {
    type: String,
  },
  offeredCTC: {
    type: String,
  },
  expectedCTC: {
    type: String,
  },
  discussion: {
    type: String,
  },
  nextStep: {
    type: String,
  },
  status: {
    type: String,
  },
  remarks: {
    type: String,
  },
}, {
  timestamps: true,
});

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
