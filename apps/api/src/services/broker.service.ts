import { prisma } from "@repo/database";
import bcryptjs from "bcryptjs";
import fs from "fs";
import path from "path";

export const getAllBrokers = async () => {
  const brokers = await prisma.broker.findMany({
    include: {
      clients: true,
      brokerPictures: true,
      characterReferences: true,
      educBackgrounds: true,
      seminars: true,
      salesExperiences: true,
    },
  });
  return brokers.map(({ ...brokerData }) => brokerData);
};

// Interface matching your frontend Wizard Form payload
export interface CreateBrokerData {
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  homeAddress: string;
  email: string;
  password: string;
  employerName: string;
  position: string;
  businessAddress: string;
  brokersLicense: string;
  tin?: string;
  primaryContact: string;
  viber?: string;
  whatsapp?: string;
  messenger?: string;
  emergencyContactName: string;
  emergencyContactNo: string;
  emergencyRelationship: string;
  characterReferences?: Array<{
    name: string;
    relationship: string;
    contactNo: string;
    email: string;
  }>;
  highSchool?: string;
  highSchoolYear?: string;
  college?: string;
  collegeYear?: string;
  seminars?: Array<{ title: string; date: string; venue: string }>;
  yearsExperience?: Array<{
    company?: string;
    position?: string;
    years?: string;
  }>;
}

export const createBroker = async (
  data: CreateBrokerData,
  pictureFile?: any, // File object from multer
) => {
  // 1. Hash the password
  const saltRounds = 10;
  const hashedPassword = await bcryptjs.hash(data.password, saltRounds);

  // 2. Handle Profile Picture Upload
  let picturePath: string | null = null;

  if (pictureFile) {
    const ext = path.extname(pictureFile.originalname);
    const safeName = data.firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const newFileName = `${safeName}-${Date.now()}-profilepic${ext}`;

    // FIX: Using __dirname ensures it specifically goes to apps/api/uploads
    // __dirname is inside src/services, so we go up two levels: ../../uploads
    const uploadDir = path.join(__dirname, "../../uploads");

    // Create folder if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fullPath = path.join(uploadDir, newFileName);

    // Write the file buffer to the uploads directory
    fs.writeFileSync(fullPath, pictureFile.buffer);

    // Save relative path for the database
    picturePath = `uploads/${newFileName}`;
  }

  // 3. Prisma Database Transaction (Inserts Broker + All Related Tables)
  return await prisma.broker.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName || null,
      email: data.email,

      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      homeAddress: data.homeAddress,
      employerName: data.employerName,
      position: data.position,
      businessAddress: data.businessAddress,
      brokersLicense: data.brokersLicense,
      tin: data.tin || null,
      primaryContact: data.primaryContact || null,
      viber: data.viber || null,
      whatsapp: data.whatsapp || null,
      messenger: data.messenger || null,
      emergencyContactName: data.emergencyContactName,
      emergencyContactNo: data.emergencyContactNo,
      emergencyRelationship: data.emergencyRelationship,

      // Profile Picture Relation
      ...(picturePath && {
        brokerPictures: {
          create: {
            imagePath: picturePath,
          },
        },
      }),

      // Character References
      ...(Array.isArray(data.characterReferences) &&
        data.characterReferences.length > 0 && {
          characterReferences: {
            create: data.characterReferences.map((ref) => ({
              name: ref.name,
              relationship: ref.relationship,
              contactNo: ref.contactNo,
              email: ref.email,
            })),
          },
        }),

      // Education Relation
      ...((data.highSchool || data.college) && {
        educBackgrounds: {
          create: {
            highSchool: data.highSchool || null,
            highSchoolYear: data.highSchoolYear || null,
            collegeDegree: data.college || null,
            collegeYear: data.collegeYear || null,
          },
        },
      }),

      // Seminars Relation
      ...(Array.isArray(data.seminars) &&
        data.seminars.length > 0 && {
          seminars: {
            create: data.seminars.map((sem) => ({
              seminars: sem.title,
              semDate: sem.date ? new Date(sem.date) : null,
              venue: sem.venue,
            })),
          },
        }),

      // Sales Experience Relation
      ...(Array.isArray(data.yearsExperience) &&
        data.yearsExperience.length > 0 && {
          salesExperiences: {
            create: data.yearsExperience.map((exp: any) => ({
              company: exp.company || null,
              position: exp.position || null,
              years: exp.years || null,
            })),
          },
        }),
    },
  });
};

// NEW: Update Broker Service
export const updateBroker = async (
  id: number,
  data: Partial<CreateBrokerData>,
  pictureFile?: any,
) => {
  let picturePath: string | null = null;

  if (pictureFile) {
    const ext = path.extname(pictureFile.originalname);
    const safeName = (data.firstName || "broker")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const newFileName = `${safeName}-${Date.now()}-profilepic${ext}`;

    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fullPath = path.join(uploadDir, newFileName);
    fs.writeFileSync(fullPath, pictureFile.buffer);
    picturePath = `uploads/${newFileName}`;
  }

  return await prisma.broker.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      primaryContact: data.primaryContact,
      brokersLicense: data.brokersLicense,
      employerName: data.employerName,

      // If a new picture was uploaded, delete old references and add the new one
      ...(picturePath && {
        brokerPictures: {
          deleteMany: {}, // Clears old pictures so they don't stack up
          create: {
            imagePath: picturePath,
          },
        },
      }),
    },
    include: {
      brokerPictures: true, // Return the updated picture so the frontend can use it
    },
  });
};

// Add this at the end of the file
export const deleteBroker = async (id: number) => {
  // 1. Find the broker first to get their picture paths
  const broker = await prisma.broker.findUnique({
    where: { id },
    include: { brokerPictures: true },
  });

  if (!broker) {
    throw new Error("Broker not found");
  }

  // 2. Delete the physical image files from the server
  if (broker.brokerPictures && broker.brokerPictures.length > 0) {
    for (const pic of broker.brokerPictures) {
      // FIX: Add a check to ensure imagePath is not null before deleting
      if (pic.imagePath) {
        // pic.imagePath is usually saved as "uploads/filename.ext"
        const fullPath = path.join(__dirname, "../../", pic.imagePath);

        // Check if the file actually exists before trying to delete it
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath); // Deletes the file
        }
      }
    }
  }

  // 3. Delete the broker from the database
  // Note: This assumes your Prisma schema has `onDelete: Cascade` set for related tables
  // (like characterReferences, educBackgrounds, etc.) so they delete automatically.
  return await prisma.broker.delete({
    where: { id },
  });
};
