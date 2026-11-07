import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Donation title is required"],
      trim: true,
    },
    foodType: {
      type: String,
      enum: [
        "Cooked Meals",
        "Raw Groceries",
        "Bakery & Dairy",
        "Fruits & Vegetables",
        "Packaged Food",
        "Other",
      ],
      default: "Cooked Meals",
    },
    dietaryType: {
      type: String,
      enum: ["Vegetarian", "Non-Vegetarian", "Vegan", "Eggitarian"],
      default: "Vegetarian",
    },
    quantity: {
      type: String,
      required: [true, "Quantity is required (e.g., '50 meals', '20 kg')"],
      trim: true,
    },
    servingsEstimate: {
      type: Number,
      default: 10,
    },
    preparedTime: {
      type: Date,
      default: Date.now,
    },
    expiryTime: {
      type: Date,
      required: [true, "Expiry or best-before time is required"],
    },
    pickupAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      contactPerson: { type: String, default: "" },
      contactPhone: { type: String, default: "" },
      instructions: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["Available", "Claimed", "In Transit", "Completed", "Cancelled"],
      default: "Available",
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    imageUrl: {
      type: String,
      default: "",
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

const Donation =
  mongoose.models.Donation || mongoose.model("Donation", donationSchema);

export default Donation;
