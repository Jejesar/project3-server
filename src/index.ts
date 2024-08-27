import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Route "/new" : créer une nouvelle mesure
app.post("/new", async (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    if (!type || !["Métal", "Non-métal", "Autre"].includes(type)) {
      return res.status(400).json({ error: "Invalid type provided" });
    }

    const valueId = type === "Métal" ? 1 : type === "Non-métal" ? 2 : 3;

    const measurement = await prisma.measurement.create({
      data: {
        value: req.body.type,
        valueId,
      },
    });

    // const measurement = await prisma.measurement.create({
    //   data: { type },
    // });

    res.status(201).json(measurement);
  } catch (error) {
    res.status(500).json({ error: "Error creating measurement" });
    console.error(error);
  }
});

// Route "/all" : récupérer toutes les mesures
app.get("/all", async (req: Request, res: Response) => {
  try {
    const measurements = await prisma.measurement.findMany();
    res.status(200).json(measurements);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving measurements" });
  }
});

// Route "/last" : récupérer la dernière mesure
app.get("/last", async (req: Request, res: Response) => {
  try {
    const lastMeasurement = await prisma.measurement.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!lastMeasurement) {
      return res.status(404).json({ error: "No measurements found" });
    }

    res.status(200).json(lastMeasurement);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving last measurement" });
  }
});

// Route "/manual/get" : récupérer une mesure manuelle
app.get("/manual/get", async (req: Request, res: Response) => {
  try {
    const manualMeasurement = await prisma.measurement.findFirst({
      where: { value: "Manuel" }, // Assuming 'Manuel' is a type or adding a manual flag to the schema
    });

    if (!manualMeasurement) {
      return res.status(404).json({ error: "No manual measurements found" });
    }

    res.status(200).json(manualMeasurement);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving manual measurement" });
  }
});

// Route "/manual/new" : effectuer une mesure manuelle depuis l'application mobile
app.post("/manual/new", async (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    if (!type || !["METAL", "OTHER"].includes(type)) {
      return res.status(400).json({ error: "Invalid type provided" });
    }

    const measurement = await prisma.measurement.create({
      data: {
        value: "Manuel",
        valueId: type === "METAL" ? 1 : type === "OTHER" ? 2 : 3,
      },
    });

    res.status(201).json(measurement);
  } catch (error) {
    res.status(500).json({ error: "Error creating manual measurement" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
