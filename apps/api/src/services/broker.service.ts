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
  return brokers.map(({ password, ...brokerData }) => brokerData);
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
      // Step 1 & 2: Main Broker Information
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName || null,
      email: data.email,
      password: hashedPassword,
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

      // Step 3: Character References (FIXED!)
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

      // Step 4: Education Relation (Added the Years)
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

      // Step 4 (Cont): Seminars Relation
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

      // Step 5: Sales Experience Relation (FIXED: mapped to salesExperiences)
      ...(Array.isArray(data.yearsExperience) &&
        data.yearsExperience.length > 0 && {
          salesExperiences: {
            // <-- This was previously yearsExperience, causing the crash
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
