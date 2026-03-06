import { Request, Response } from "express";
import * as ClientService from "../services/client.service";
import { ClientStatus } from "@prisma/client";

export const getClients = async (req: Request, res: Response) => {
  try {
    const brokerId = (req as any).user?.id;
    const role = (req as any).user?.role; // FIX: Extract the role

    if (!brokerId) return res.status(401).json({ error: "Unauthorized" });

    // FIX: Pass both brokerId and role to the service
    const clients = await ClientService.getAllClients(brokerId, role);
    res.json(clients);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const brokerId = (req as any).user?.id;
    if (!brokerId) return res.status(401).json({ error: "Unauthorized" });

    const { firstName, lastName, email, clientStatus, unitId } = req.body;

    const newClient = await ClientService.createClient(
      firstName,
      lastName,
      email,
      (clientStatus as ClientStatus) || "prospect",
      unitId ? parseInt(String(unitId), 10) : null,
      brokerId,
    );
    res.status(201).json(newClient);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { firstName, lastName, email, clientStatus, unitId } = req.body;

    const updatedClient = await ClientService.updateClient(
      id,
      firstName,
      lastName,
      email,
      clientStatus as ClientStatus,
      unitId ? parseInt(String(unitId), 10) : null,
    );
    res.json(updatedClient);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    await ClientService.deleteClient(id);
    res.json({ message: "Client deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
