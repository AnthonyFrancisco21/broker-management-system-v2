import { Request, Response } from "express";
import * as UnitServices from "../services/unit.service";

// GET ALL
export const getUnits = async (req: Request, res: Response) => {
  try {
    const units = await UnitServices.getAllUnits();
    res.json(units);
  } catch (error) {
    console.error("Get Units Error:", error);
    res.status(500).json({ error: "Failed to fetch units" });
  }
};

// GET SINGLE UNIT
export const getUnit = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid unit ID" });
      return;
    }
    const unit = await UnitServices.getUnitById(id);
    if (!unit) {
      res.status(404).json({ error: "Unit not found" });
      return;
    }
    res.json(unit);
  } catch (error) {
    console.error("Get Unit Error:", error);
    res.status(500).json({ error: "Failed to fetch unit" });
  }
};

// CREATE
export const createUnit = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const imagePaths = files
      ? files.map((file) => `uploads/${file.filename}`)
      : [];

    const newUnit = await UnitServices.createUnit(req.body, imagePaths);
    res.status(201).json(newUnit);
  } catch (error) {
    console.error("Create Unit Error:", error);
    res.status(500).json({ error: "Failed to create unit" });
  }
};

// UPDATE
export const updateUnit = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid unit ID" });
      return;
    }

    const files = req.files as Express.Multer.File[];
    const newImagePaths = files
      ? files.map((file) => `uploads/${file.filename}`)
      : [];

    let deletedImageIds: number[] = [];
    if (req.body.deletedImages) {
      try {
        deletedImageIds = JSON.parse(req.body.deletedImages);
      } catch (e) {
        console.error("Failed to parse deletedImages array");
      }
    }

    const updatedUnit = await UnitServices.updateUnit(
      id,
      req.body,
      newImagePaths,
      deletedImageIds,
    );
    res.json(updatedUnit);
  } catch (error) {
    console.error("Update Unit Error:", error);
    res.status(500).json({ error: "Failed to update unit" });
  }
};

// DELETE
export const deleteUnit = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid unit ID" });
      return;
    }

    await UnitServices.deleteUnit(id);
    res.json({ message: "Unit deleted successfully" });
  } catch (error) {
    console.error("Delete Unit Error:", error);
    res.status(500).json({ error: "Failed to delete unit" });
  }
};
