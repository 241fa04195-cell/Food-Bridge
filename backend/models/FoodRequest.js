import mongoose from "mongoose";

const foodRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Request title is required"],
      trim: true,
    },
    organizationName: {
      type: String,
      required: [true, "Organization or community name is required"],
    },
    peopleCount: {
      type: Number,
      required: [true, "Number of people to feed is required"],
      min: [1, "Must be at least 1 person"],
    },
    urgency: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    foodTypeNeeded: {
      type: String,
      enum: [
        "Cooked Meals",
        "Raw Groceries",
        "Packaged Food",
        "Baby Food & Milk",
        "Any",
      ],
      default: "Cooked Meals",
    },
    deliveryAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      contactPhone: { type: String, default: "" },
    },
    requiredByDate: {
      type: Date,
      required: [true, "Required by date/time is required"],
    },
    status: {
      type: String,
      enum: ["Open", "Fulfilled", "Closed"],
      default: "Open",
    },
    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const FoodRequest =
  mongoose.models.FoodRequest ||
  mongoose.model("FoodRequest", foodRequestSchema);

export default FoodRequest;
