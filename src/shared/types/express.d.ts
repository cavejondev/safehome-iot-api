/**
 * Extensoes de tipagem do Express para carregar usuario autenticado e gateway IoT.
 * Isso evita casts manuais em cada controller.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
      gateway?: {
        id: string;
        householdId: string;
        serialNumber: string;
      };
    }
  }
}

export {};
