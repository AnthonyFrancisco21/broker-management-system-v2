import { Request, Response } from "express";
import * as BrokerService from "../services/broker.service";

export const getBrokers = async (req: Request, res: Response) => {
  try {
    const brokers = await BrokerService.getAllBrokers();
    res.json(brokers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch brokers" });
  }
};

export const createBroker = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
) => {
  try {
    const rawData = req.body;
    const pictureFile = req.file;

    if (!rawData.firstName || !rawData.lastName || !rawData.email) {
      return res
        .status(400)
        .json({ error: "Missing required fields: firstName, lastName, email" });
    }

    const brokerData = {
      ...rawData,
      characterReferences: rawData.characterReferences
        ? JSON.parse(rawData.characterReferences)
        : [],
      seminars: rawData.seminars ? JSON.parse(rawData.seminars) : [],
      yearsExperience: rawData.yearsExperience
        ? JSON.parse(rawData.yearsExperience)
        : [],
    };

    const newBroker = await BrokerService.createBroker(brokerData, pictureFile);
    res.status(201).json(newBroker);
  } catch (error: any) {
    console.error("Error creating broker:", error);
    res.status(400).json({
      error: error.message || "Failed to create broker",
      details: error.code,
    });
  }
};

// NEW: Update Broker Controller
export const updateBroker = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
) => {
  try {
    // Parse the ID from the URL parameter (e.g., /api/brokers/2)
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid broker ID provided" });
    }

    const rawData = req.body;
    const pictureFile = req.file;

    const updatedBroker = await BrokerService.updateBroker(
      id,
      rawData,
      pictureFile,
    );
    res
      .status(200)
      .json({ message: "Broker updated successfully", updatedBroker });
  } catch (error: any) {
    console.error("Error updating broker:", error);
    res.status(400).json({
      error: error.message || "Failed to update broker",
    });
  }
};

// Add this at the end of the file

export const deleteBroker = async (req: Request, res: Response) => {
  try {
    // Parse the ID from the URL parameter (e.g., /api/brokers/2)
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid broker ID provided" });
    }

    await BrokerService.deleteBroker(id);
    res
      .status(200)
      .json({ message: "Broker and associated files deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting broker:", error);
    res.status(400).json({
      error: error.message || "Failed to delete broker",
    });
  }
};
