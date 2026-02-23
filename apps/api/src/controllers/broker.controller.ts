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

// UPDATE THIS FUNCTION:
export const createBroker = async (
  req: Request & { file?: any },
  res: Response,
) => {
  try {
    console.log("Received broker creation request");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const brokerData = req.body;
    const pictureFile = req.file; // If using multer

    if (!brokerData.firstName || !brokerData.lastName || !brokerData.email) {
      return res
        .status(400)
        .json({ error: "Missing required fields: firstName, lastName, email" });
    }

    const newBroker = await BrokerService.createBroker(brokerData, pictureFile);
    console.log("Broker created successfully:", newBroker.id);
    res.status(201).json(newBroker);
  } catch (error: any) {
    console.error("Error creating broker:", error);
    res.status(400).json({
      error: error.message || "Failed to create broker",
      details: error.code,
    });
  }
};
