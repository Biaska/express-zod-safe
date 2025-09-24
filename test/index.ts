import express, {
  type NextFunction,
  type Request,
  type Response,
  type ErrorRequestHandler,
} from "express";
import { z } from "zod";
import validate, {
  type WeakRequestHandler,
  type ValidatedRequestHandler,
} from "../src/index";

const app = express();
const port = 3000;

app.use(express.json());

const authenticate = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

const schema = {
  query: {
    name: z.string().min(3).max(10),
    age: z.coerce.number().min(18),
  },
  body: {
    title: z.string().max(4),
  },
  params: {
    id: z.coerce.number(),
  },
};

app.post(
  "/:id",
  authenticate as WeakRequestHandler,
  validate(schema),
  (req, res) => {
    console.log("Trying to handle request...");
    const { name, age } = req.query;
    const { id } = req.params;
    // @ts-expect-error
    const { title, notFound } = req.body;

    res.send(
      `Hello ${title} ${name}! (Your age is ${age} and your ID is ${id})`
    );
  }
);

const requestHandler: ValidatedRequestHandler<typeof schema> = (req, res) => {
  const { name, age } = req.query;
  const { id } = req.params;
  const { title } = req.body;

  res.send(`Hello ${title} ${name}! (Your age is ${age} and your ID is ${id})`);
};

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const error = err as z.ZodError;
  console.log("Caught by global error handler");
  console.log("Errors", error.issues);
  res.status(400).send("Validation failed");
  return;
};

app.post("/handler/:id", validate(schema), requestHandler);

app.use(errorHandler);

app.listen(port, () => console.log(`Server is running on port ${port}`));
