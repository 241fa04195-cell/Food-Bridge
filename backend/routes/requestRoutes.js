
import express from "express";
import FoodRequest from "../models/FoodRequest.js";

const router = express.Router();

// Get all food requests
router.get("/", async (req, res) => {
  try {
    const requests = await FoodRequest.find()
      .populate("requester", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch requests",
      error: error.message
    });
  }
});

// Create a food request
router.post("/", async (req, res) => {
  try {
    const request = await FoodRequest.create(req.body);

    res.status(201).json({
      message: "Food request created successfully",
      request
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create food request",
      error: error.message
    });
  }
});

// Get request by ID
router.get("/:id", async (req, res) => {
  try {
    const request = await FoodRequest.findById(req.params.id)
      .populate("requester", "name email");

    if (!request) {
      return res.status(404).json({
        message: "Food request not found"
      });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(400).json({
      message: "Invalid request ID",
      error: error.message
    });
  }
});

export default router;
