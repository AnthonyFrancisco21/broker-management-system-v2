import { Request, Response } from "express";
import * as ClientService from "../services/client.service";

/* export const getBrokers = async (req: Request, res: Response) => {
  try {
    const brokers = await BrokerService.getAllBrokers();
    res.json(brokers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch brokers" });
  }
};

// UPDATE THIS FUNCTION:
export const createBroker = async (req: Request, res: Response) => {
  try {
    // We now expect firstName and lastName, not "name"
    const { firstName, lastName, email } = req.body;

    const newBroker = await BrokerService.createBroker(
      firstName,
      lastName,
      email,
    );
    res.status(201).json(newBroker);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}; */

export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await ClientService.getAllClients();
    res.json(clients);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email } = req.body;
    const newClient = await ClientService.createClient(
      firstName,
      lastName,
      email,
    );
    res.status(201).json(newClient);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
