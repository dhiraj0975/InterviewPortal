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

  // ✅ New Field Added
  interviewSchedule: {
    type: String, // Example: "12/11/2025 10:30 AM"
    required: false, 
  }, 

}, {
  timestamps: true,
});

// Add index for faster sorting on createdAt
interviewSchema.index({ createdAt: -1 });

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
