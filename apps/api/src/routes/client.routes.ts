import { Router } from "express";
import * as ClientController from "../controllers/client.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Retrieve all clients
router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "MANAGER", "AGENT"]),
  ClientController.getClients,
);

// Create a new client
router.post(
  "/",
  authenticate,
  authorize(["ADMIN", "MANAGER", "AGENT"]),
  ClientController.createClient,
);

// Update an existing client (Edit Form)
router.patch(
  "/:id",
  authenticate,
  authorize(["ADMIN", "MANAGER", "AGENT"]),
  ClientController.updateClient,
);

// Delete a client (Delete Modal)
router.delete(
  "/:id",
  authenticate,
  authorize(["ADMIN", "MANAGER", "AGENT"]),
  ClientController.deleteClient,
);

export default router;
