import { Request, Response } from "express";
import * as UnitServices from "../services/unit.service";

export const getUnits = async (req: Request, res: Response) => {
  try {
    const units = await UnitServices.getAllUnits();
    res.json(units);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch units" });
  }
};
