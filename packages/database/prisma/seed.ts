import { PrismaClient, UnitStatus, SystemRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type UnitType = "S-24" | "S-28" | "S-36" | "S-40" | "S-75";

// Maps the unit type to its square meter size
const UNIT_SPECS: Record<UnitType, { sqm: number }> = {
  "S-24": { sqm: 24 },
  "S-28": { sqm: 28 },
  "S-36": { sqm: 36 },
  "S-40": { sqm: 40 },
  "S-75": { sqm: 108 }, // Multi-purpose
};

// 1. Calculate Ref Price per Sqm based on the 2026 SEM 1 Pricing Table
function getPricePerSqm(floor: number): number {
  if (floor === 1) return 200000; // Upper Ground
  if (floor >= 2 && floor <= 6) return 150000; // 2F, 3F, 4F, 5F, 6F
  if (floor >= 7 && floor <= 10) return 160000; // 7F, 8F, 9F, 10F
  return 150000; // Fallback
}

// 2. Map the 10-Year Plan Monthly Installment from the table
function get10YearMonthlyInstallment(
  floor: number,
  type: UnitType,
): number | null {
  if (type === "S-75") return null; // Custom pricing for Multi-purpose

  if (floor === 1) {
    // Upper Ground Installments
    if (type === "S-24") return 55100;
    if (type === "S-28") return 64280;
    if (type === "S-36") return 82650;
    if (type === "S-40") return 91820;
  } else if (floor >= 2 && floor <= 6) {
    // 2F to 6F Installments
    if (type === "S-24") return 41320;
    if (type === "S-28") return 48210;
    if (type === "S-36") return 61980;
    if (type === "S-40") return 68870;
  } else if (floor >= 7 && floor <= 10) {
    // 7F to 10F Installments
    if (type === "S-24") return 44100;
    if (type === "S-28") return 51420;
    if (type === "S-36") return 66110;
    if (type === "S-40") return 73460;
  }
  return null;
}

// Generates the object expected by your Prisma Unit model
function generateUnitData(floor: number, num: number, type: UnitType) {
  const roomNo = `${floor}${String(num).padStart(2, "0")}`;
  const specs = UNIT_SPECS[type];

  const pricePerSqm = getPricePerSqm(floor);
  const price = pricePerSqm * specs.sqm;
  const installment = get10YearMonthlyInstallment(floor, type);

  return {
    unitType: type,
    roomNo: roomNo,
    size: `${specs.sqm} sqm`,
    floor: floor,
    installmentPerMonth: installment,
    price: price,
    unitStatus: UnitStatus.available,
  };
}

async function main() {
  // ==========================================
  // 1. ADMIN ACCOUNT SETUP
  // ==========================================
  console.log("🌱 Setting up Admin Account...");
  const adminEmail = "admin@gmail.com";
  const passwordHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.systemAccount.upsert({
    where: { email: adminEmail },
    update: {
      password: passwordHash,
    },
    create: {
      email: adminEmail,
      password: passwordHash,
      firstName: "Manager",
      lastName: "Admin",
      role: SystemRole.ADMIN,
      contactNo: "09171234567",
    },
  });
  console.log(`✅ Admin Account ready: ${admin.email}`);

  // ==========================================
  // 2. UNIT SEEDING (2026 SEM 1 PRICING)
  // ==========================================
  console.log("🧹 Flushing old unit data...");
  await prisma.unit.deleteMany();

  const allUnits = [];

  // Build Upper Ground (Floor 1) - 17 Units
  const floor1Units = [
    generateUnitData(1, 17, "S-75"),
    generateUnitData(1, 16, "S-40"),
    generateUnitData(1, 15, "S-24"),
    generateUnitData(1, 14, "S-24"),
    generateUnitData(1, 13, "S-28"),
    generateUnitData(1, 12, "S-24"),
    generateUnitData(1, 11, "S-28"),
    generateUnitData(1, 10, "S-24"),
    generateUnitData(1, 9, "S-28"),
    generateUnitData(1, 8, "S-24"),
    generateUnitData(1, 7, "S-28"),
    generateUnitData(1, 6, "S-24"),
    generateUnitData(1, 5, "S-28"),
    generateUnitData(1, 4, "S-28"),
    generateUnitData(1, 3, "S-28"),
    generateUnitData(1, 2, "S-28"),
    generateUnitData(1, 1, "S-36"),
  ];
  allUnits.push(...floor1Units);

  // Build Typical Floors (Floors 2 to 10) - 19 Units per floor
  for (let floor = 2; floor <= 10; floor++) {
    const typicalUnits = [
      generateUnitData(floor, 19, "S-36"),
      generateUnitData(floor, 18, "S-36"),
      generateUnitData(floor, 17, "S-36"),
      generateUnitData(floor, 16, "S-40"),
      generateUnitData(floor, 15, "S-24"),
      generateUnitData(floor, 14, "S-24"),
      generateUnitData(floor, 13, "S-28"),
      generateUnitData(floor, 12, "S-24"),
      generateUnitData(floor, 11, "S-28"),
      generateUnitData(floor, 10, "S-24"),
      generateUnitData(floor, 9, "S-28"),
      generateUnitData(floor, 8, "S-24"),
      generateUnitData(floor, 7, "S-28"),
      generateUnitData(floor, 6, "S-24"),
      generateUnitData(floor, 5, "S-28"),
      generateUnitData(floor, 4, "S-28"),
      generateUnitData(floor, 3, "S-28"),
      generateUnitData(floor, 2, "S-28"),
      generateUnitData(floor, 1, "S-36"),
    ];
    allUnits.push(...typicalUnits);
  }

  console.log(
    `🏗️ Inserting ${allUnits.length} units into the database with new pricing...`,
  );

  await prisma.unit.createMany({
    data: allUnits,
  });

  console.log(
    "✅ Database successfully seeded with updated 2026 SEM 1 pricing!",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
