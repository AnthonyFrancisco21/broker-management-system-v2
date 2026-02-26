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

// Explicitly tell TypeScript that 'file' might exist on this specific Request
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

    // Parse the stringified JSON arrays sent by FormData
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
