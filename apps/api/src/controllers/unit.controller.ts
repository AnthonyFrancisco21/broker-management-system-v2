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

// CREATE
export const createUnit = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    // Use the filename provided by multer to construct safe relative paths
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

    // Parse the deletedImages array sent from the frontend FormData
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
