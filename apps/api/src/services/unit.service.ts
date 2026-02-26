import { prisma } from "@repo/database";
import fs from "fs";
import path from "path";

// GET ALL UNITS
export const getAllUnits = async () => {
  return await prisma.unit.findMany({
    include: {
      clients: true,
      unitPictures: true,
    },
    orderBy: {
      id: "desc",
    },
  });
};

// CREATE UNIT
export const createUnit = async (data: any, imagePaths: string[]) => {
  return await prisma.unit.create({
    data: {
      unitType: data.unitType,
      roomNo: data.roomNo,
      size: data.size,
      floor: data.floor ? parseInt(data.floor) : null,
      installmentPerMonth: data.installmentPerMonth
        ? parseFloat(data.installmentPerMonth)
        : null,
      price: data.price ? parseFloat(data.price) : null,
      unitStatus: data.unitStatus || "available",

      unitPictures: {
        create: imagePaths.map((path) => ({ imagePath: path })),
      },
    },
    include: {
      unitPictures: true,
    },
  });
};

// UPDATE UNIT
export const updateUnit = async (
  id: number,
  data: any,
  newImagePaths: string[],
  deletedImageIds: number[] = [],
) => {
  // 1. If there are images being deleted, we must delete the physical files first
  if (deletedImageIds.length > 0) {
    const unit = await prisma.unit.findUnique({
      where: { id },
      include: { unitPictures: true },
    });

    if (unit) {
      // Find the specific pictures that match the deleted IDs
      const picturesToDelete = unit.unitPictures.filter((pic: any) =>
        deletedImageIds.includes(pic.id),
      );

      // Delete them from the hard drive
      picturesToDelete.forEach((pic: any) => {
        if (pic.imagePath) {
          const fullPath = path.join(__dirname, "../../", pic.imagePath);
          if (fs.existsSync(fullPath)) {
            try {
              fs.unlinkSync(fullPath);
            } catch (err) {
              console.error("Failed to delete physical file:", fullPath);
            }
          }
        }
      });
    }
  }

  // 2. Now update the database as usual
  return await prisma.unit.update({
    where: { id },
    data: {
      unitType: data.unitType,
      roomNo: data.roomNo,
      size: data.size,
      floor: data.floor ? parseInt(data.floor) : null,
      installmentPerMonth: data.installmentPerMonth
        ? parseFloat(data.installmentPerMonth)
        : null,
      price: data.price ? parseFloat(data.price) : null,
      unitStatus: data.unitStatus,

      unitPictures: {
        create: newImagePaths.map((path) => ({ imagePath: path })),
        deleteMany:
          deletedImageIds.length > 0
            ? { id: { in: deletedImageIds } }
            : undefined,
      },
    },
    include: {
      unitPictures: true,
    },
  });
};

// DELETE UNIT
export const deleteUnit = async (id: number) => {
  // 1. Fetch the unit BEFORE deleting it so we know what images it has
  const unit = await prisma.unit.findUnique({
    where: { id },
    include: { unitPictures: true },
  });

  if (!unit) {
    throw new Error("Unit not found");
  }

  // 2. Delete the unit from the database
  const deletedUnit = await prisma.unit.delete({
    where: { id },
  });

  // 3. Delete the physical image files from the uploads folder
  unit.unitPictures.forEach((pic: any) => {
    if (pic.imagePath) {
      // Resolving the exact path to apps/api/uploads/
      const fullPath = path.join(__dirname, "../../", pic.imagePath);

      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath); // This deletes the actual file
        } catch (err) {
          console.error("Failed to delete physical file:", fullPath);
        }
      }
    }
  });

  return deletedUnit;
};
