import { RequestHandler, Request, Response, NextFunction } from 'express';
import { ZodType, ZodRawShape, z, ZodError } from 'zod';

declare const types: readonly ["query", "params", "body"];
/**
 * Generates a middleware function for Express.js that validates request params, query, and body.
 * This function uses Zod schemas to perform validation against the provided schema definitions.
 *
 * @param schemas - An object containing Zod schemas for params, query, and body.
 * @returns An Express.js middleware function that validates the request based on the provided schemas.
 *          It attaches validated data to the request object and sends error details if validation fails.
 * @template TParams - Type definition for params schema.
 * @template TQuery - Type definition for query schema.
 * @template TBody - Type definition for body schema.
 * @example
 * // Example usage in an Express.js route
 * import express from 'express';
 * import validate from 'express-zod-safe';
 * import { z } from 'zod';
 *
 * const app = express();
 * app.use(express.json());
 *
 * // Define your Zod schemas
 * const params = {
 *   userId: z.string().uuid(),
 * };
 * const query = {
 *   age: z.coerce.number().optional(),
 * };
 * const body = {
 *   name: z.string(),
 *   email: z.string().email(),
 * };
 *
 * // Use the validate middleware in your route
 * app.post('/user/:userId', validate({ params, query, body }), (req, res) => {
 *   // Your route logic here
 *   res.send('User data is valid!');
 * });
 *
 * app.listen(3000, () => console.log('Server running on port 3000'));
 */
declare function validate<TParams extends ValidationSchema, TQuery extends ValidationSchema, TBody extends ValidationSchema>(schemas: CompleteValidationSchema<TParams, TQuery, TBody>): RequestHandler<ZodOutput<TParams>, any, ZodOutput<TBody>, ZodOutput<TQuery>>;
/**
 * Describes the types of data that can be validated: 'query', 'params', or 'body'.
 */
type DataType = (typeof types)[number];
/**
 * Defines the structure of an error item, containing the type of validation that failed (params, query, or body)
 * and the associated ZodError.
 */
interface ErrorListItem {
    type: DataType;
    errors: ZodError;
}
type Unvalidated = unknown;
/**
 * Represents a generic type for route validation, which can be applied to params, query, or body.
 * Each key-value pair represents a field and its corresponding Zod validation schema.
 */
type ValidationSchema = ZodType | ZodRawShape;
/**
 * Defines the structure for the schemas provided to the validate middleware.
 * Each property corresponds to a different part of the request (params, query, body)
 * and should be a record of Zod types for validation.
 *
 * @template TParams - Type definition for params schema.
 * @template TQuery - Type definition for query schema.
 * @template TBody - Type definition for body schema.
 */
interface CompleteValidationSchema<TParams extends ValidationSchema = ValidationSchema, TQuery extends ValidationSchema = ValidationSchema, TBody extends ValidationSchema = ValidationSchema> {
    params?: TParams;
    query?: TQuery;
    body?: TBody;
}
/**
 * Represents the output type of a Zod validation schema.
 * This is used to infer the TypeScript type from a Zod schema,
 * providing typesafe access to the validated data.
 *
 * @template T - The validation type (params, query, or body).
 */
type ZodOutput<T extends ValidationSchema | undefined> = T extends ValidationSchema ? z.output<T extends ZodRawShape ? z.ZodObject<T> : T> : Unvalidated;
/**
 * A utility type to ensure other middleware types don't conflict with the validate middleware.
 */
type WeakRequestHandler = RequestHandler<Unvalidated, Unvalidated, Unvalidated, Unvalidated>;
/**
 * A utility type to ensure the Request is typed correctly.
 * @template T - The validation schema to be applied to the request params, query and body.
 * @example
 * import { ValidatedRequest } from 'express-zod-safe';
 * import { z } from 'zod';
 *
 * const schema = {
 * 	query: {
 * 		name: z.string().min(3).max(10),
 * 		age: z.coerce.number().min(18)
 * 	},
 * 	body: {
 * 		title: z.string().max(4)
 * 	},
 * 	params: {
 * 		id: z.coerce.number()
 * 	}
 * };
 *
 * const requestHandler = (req: ValidatedRequest<typeof schema>, res: Response) => {
 * 	const { name, age } = req.query;
 * 	const { id } = req.params;
 *  const { title } = req.body;
 *
 * 	res.send(`Hello ${title} ${name}! (Your age is ${age} and your ID is ${id})`);
 * };
 *
 * app.post('/handler/:id', validate(schema), requestHandler);
 */
type ValidatedRequest<T extends CompleteValidationSchema> = Request<ZodOutput<T["params"]>, any, ZodOutput<T["body"]>, ZodOutput<T["query"]>>;
/**
 * A utility type to ensure the RequestHandler is typed correctly.
 * @template T - The validation schema to be applied to the request params, query and body.
 */
type ValidatedRequestHandler<T extends CompleteValidationSchema> = (req: ValidatedRequest<T>, res: Response, next: NextFunction) => void | Promise<void>;

// @ts-ignore
export = validate;
export type { CompleteValidationSchema, ErrorListItem, Unvalidated, ValidatedRequest, ValidatedRequestHandler, ValidationSchema, WeakRequestHandler, ZodOutput };
