import { Repository } from "@/types/repository";
import { Request, Response, Router } from "express";

export default function createDebugRouter(repository: Repository) {
  const router = Router();

  router.get("/", (req: Request, res: Response) => {
    res.status(200).send("Hello world");
  });

  router.get("/messages/", async (req: Request, res: Response) => {
    const messages = await repository.messages.readAll();
    res.status(200).send(messages);
  });

  router.get("/statuses/", async (req: Request, res: Response) => {
    const statuses = await repository.statuses.readAll();
    res.status(200).send(statuses);
  });

  return router;
}
