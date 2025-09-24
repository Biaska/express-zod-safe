// src/index.ts
import express from "express";
import { ZodError, z } from "zod";
var types = ["query", "params", "body"];
function isZodType(schema) {
  return !!schema && typeof schema.safeParseAsync === "function";
}
var descriptor = Object.getOwnPropertyDescriptor(express.request, "query");
if (descriptor) {
  Object.defineProperty(express.request, "query", {
    get() {
      if (Object.hasOwn(this, "_query")) return this._query;
      return descriptor?.get?.call(this);
    },
    set(query) {
      this._query = query;
    },
    configurable: true,
    enumerable: true
  });
}
function validate(schemas) {
  const validation = {
    params: isZodType(schemas.params) ? schemas.params : z.strictObject(schemas.params ?? {}),
    query: isZodType(schemas.query) ? schemas.query : z.strictObject(schemas.query ?? {}),
    body: isZodType(schemas.body) ? schemas.body : z.strictObject(schemas.body ?? {})
  };
  return async (req, res, next) => {
    const errors = [];
    const issues = [];
    for (const type of types) {
      const parsed = await validation[type].safeParseAsync(req[type] ?? {});
      if (parsed.success) req[type] = parsed.data;
      else {
        issues.push(...parsed.error.issues);
      }
    }
    if (issues.length > 0) {
      throw new ZodError(issues);
    }
    return next();
  };
}
export {
  validate as default
};
//# sourceMappingURL=index.mjs.map