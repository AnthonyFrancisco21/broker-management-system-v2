import { prisma } from '../lib/db';
import fs from "fs";
import path from "path";

// ─── Get All Brokers ──────────────────────────────────────────────────────────

export const getAllBrokers = async () => {
  return await prisma.broker.findMany({
    where: {
      isDeleted: 0,
    },
    include: {
      // clients removed — brokers and clients are no longer connected
      brokerPictures: true,
      characterReferences: true,
      educBackgrounds: true,
      seminars: true,
      salesExperiences: true,
    },
  });
};

// ─── Create Broker Interface ──────────────────────────────────────────────────
// Removed: password — brokers no longer have system accounts or login access

export interface CreateBrokerData {
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  homeAddress: string;
  email: string;
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

// ─── Create Broker ────────────────────────────────────────────────────────────

export const createBroker = async (
  data: CreateBrokerData,
  pictureFile?: any,
) => {
  // Handle Profile Picture Upload
  let picturePath: string | null = null;

  if (pictureFile) {
    const ext = path.extname(pictureFile.originalname);
    const safeName = data.firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const newFileName = `${safeName}-${Date.now()}-profilepic${ext}`;

    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fullPath = path.join(uploadDir, newFileName);
    fs.writeFileSync(fullPath, pictureFile.buffer);
    picturePath = `uploads/${newFileName}`;
  }

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

      ...(picturePath && {
        brokerPictures: {
          create: { imagePath: picturePath },
        },
      }),

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

// ─── Update Broker ────────────────────────────────────────────────────────────

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

      ...(picturePath && {
        brokerPictures: {
          deleteMany: {},
          create: { imagePath: picturePath },
        },
      }),
    },
    include: {
      brokerPictures: true,
    },
  });
};

// ─── Delete Broker ────────────────────────────────────────────────────────────

export const deleteBroker = async (id: number) => {
  const broker = await prisma.broker.findUnique({
    where: { id },
    include: { brokerPictures: true },
  });

  if (!broker) throw new Error("Broker not found");

  if (broker.brokerPictures && broker.brokerPictures.length > 0) {
    for (const pic of broker.brokerPictures) {
      if (pic.imagePath) {
        const fullPath = path.join(__dirname, "../../", pic.imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }
  }

  return await prisma.broker.delete({
    where: { id },
  });
};
