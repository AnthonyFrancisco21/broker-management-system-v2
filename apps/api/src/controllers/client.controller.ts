import { Request, Response } from "express";
import * as ClientService from "../services/client.service";
import { ClientStatusValue } from "../services/client.service";

export const getClients = async (req: Request, res: Response) => {
  try {
    const accountId = (req as any).user?.id;
    const role = (req as any).user?.role;

    if (!accountId) return res.status(401).json({ error: "Unauthorized" });

    const clients = await ClientService.getAllClients(accountId, role);
    res.json(clients);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const accountId = (req as any).user?.id;
    if (!accountId) return res.status(401).json({ error: "Unauthorized" });

    const { firstName, lastName, email, clientStatus, unitId } = req.body;

    const newClient = await ClientService.createClient(
      firstName,
      lastName,
      email,
      (clientStatus as ClientStatusValue) || "prospect",
      unitId ? parseInt(String(unitId), 10) : null,
      accountId,
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
      clientStatus as ClientStatusValue,
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
