
import express from "express";
import mongoose from "mongoose";
import Donation from "../models/Donation.js";

const router = express.Router();

// Get all donations
router.get("/", async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("donor", "name email")
      .populate("claimedBy", "name email")
      .populate("volunteer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch donations",
      error: error.message
    });
  }
});

// Create a donation
router.post("/", async (req, res) => {
  try {
    const donation = await Donation.create(req.body);

    res.status(201).json({
      message: "Donation created successfully",
      donation
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create donation",
      error: error.message
    });
  }
});

// Receiver claims an available donation
router.patch("/:id/claim", async (req, res) => {
  try {
    const { requesterId } = req.body;

    if (!mongoose.isValidObjectId(requesterId)) {
      return res.status(400).json({ message: "Valid requester ID is required." });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found." });
    }

    if (donation.status !== "Available") {
      return res.status(400).json({ message: "This donation is no longer available." });
    }

    donation.status = "Claimed";
    donation.claimedBy = requesterId;
    donation.claimedAt = new Date();

    await donation.save();

    res.json({
      message: "Donation claimed successfully.",
      donation
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to claim donation.",
      error: error.message
    });
  }
});

// Volunteer accepts a delivery task
router.patch("/:id/assign-volunteer", async (req, res) => {
  try {
    const { volunteerId } = req.body;

    if (!mongoose.isValidObjectId(volunteerId)) {
      return res.status(400).json({ message: "Valid volunteer ID is required." });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found." });
    }

    if (donation.status !== "Claimed" || donation.volunteer) {
      return res.status(400).json({
        message: "This delivery task is not available."
      });
    }

    donation.volunteer = volunteerId;
    donation.status = "In Transit";

    await donation.save();

    res.json({
      message: "Delivery task accepted successfully.",
      donation
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to accept delivery task.",
      error: error.message
    });
  }
});

// Volunteer marks delivery as completed
router.patch("/:id/complete", async (req, res) => {
  try {
    const { volunteerId } = req.body;

    if (!mongoose.isValidObjectId(volunteerId)) {
      return res.status(400).json({ message: "Valid volunteer ID is required." });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found." });
    }

    if (
      donation.status !== "In Transit" ||
      String(donation.volunteer) !== String(volunteerId)
    ) {
      return res.status(403).json({
        message: "This delivery is not assigned to this volunteer."
      });
    }

    donation.status = "Completed";
    donation.deliveredAt = new Date();

    await donation.save();

    res.json({
      message: "Delivery marked as completed.",
      donation
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to complete delivery.",
      error: error.message
    });
  }
});

// Get donation by ID
router.get("/:id", async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donor", "name email")
      .populate("claimedBy", "name email")
      .populate("volunteer", "name email");

    if (!donation) {
      return res.status(404).json({ message: "Donation not found." });
    }

    res.json(donation);
  } catch (error) {
    res.status(400).json({
      message: "Invalid donation ID",
      error: error.message
    });
  }
});

export default router;
