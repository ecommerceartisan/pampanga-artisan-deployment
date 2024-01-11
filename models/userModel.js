import mongoose from "mongoose";

const securityQuestionsEnum = [
  "In what city were you born?",
  "What is the name of your favorite pet?",
  "What is your mother's maiden name?",
  "What high school did you attend?",
  "What was the name of your elementary school?",
  "What was the make of your first car?",
  "What was your favorite food as a child?",
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      buildingHouseNo: {
        type: String,
        required: false,
      },
      street: {
        type: String,
        required: true,
      },
      barangay: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      province: {
        type: String,
        required: true,
      },
      region: {
        type: String,
        required: true,
      },
    },    
    securityQuestions: [
      {
        question: {
          type: String,
          enum: securityQuestionsEnum,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
      },
    ],
    role: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
export { securityQuestionsEnum };
export default mongoose.model("users", userSchema);
