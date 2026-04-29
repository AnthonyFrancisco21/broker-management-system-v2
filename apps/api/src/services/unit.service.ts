import { prisma } from '../lib/db';
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

// GET SINGLE UNIT BY ID (Added this to fix your frontend silent error)
export const getUnitById = async (id: number) => {
  return await prisma.unit.findUnique({
    where: { id },
    include: {
      clients: true,
      unitPictures: true,
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
  if (deletedImageIds.length > 0) {
    const unit = await prisma.unit.findUnique({
      where: { id },
      include: { unitPictures: true },
    });

    if (unit) {
      const picturesToDelete = unit.unitPictures.filter((pic: any) =>
        deletedImageIds.includes(pic.id),
      );

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
  const unit = await prisma.unit.findUnique({
    where: { id },
    include: { unitPictures: true },
  });

  if (!unit) {
    throw new Error("Unit not found");
  }

  const deletedUnit = await prisma.unit.delete({
    where: { id },
  });

  unit.unitPictures.forEach((pic: any) => {
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

  return deletedUnit;
};
