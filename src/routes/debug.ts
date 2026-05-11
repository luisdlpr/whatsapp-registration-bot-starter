import { Repository } from "@/types/repository";
import { Request, Response, Router } from "express";

export default function createDebugRouter(repository: Repository) {
  const router = Router();

  router.get("/", (req: Request, res: Response) => {
    res.status(200).send("Hello world");
  });

  router.get("/entry/", async (req: Request, res: Response) => {
    const entries = await repository.entry.readAll();
    res.status(200).send(entries);
  });

  return router;
}
