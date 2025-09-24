"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/index.ts
var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _zod = require('zod');
var types = ["query", "params", "body"];
function isZodType(schema) {
  return !!schema && typeof schema.safeParseAsync === "function";
}
var descriptor = Object.getOwnPropertyDescriptor(_express2.default.request, "query");
if (descriptor) {
  Object.defineProperty(_express2.default.request, "query", {
    get() {
      if (Object.hasOwn(this, "_query")) return this._query;
      return _optionalChain([descriptor, 'optionalAccess', _ => _.get, 'optionalAccess', _2 => _2.call, 'call', _3 => _3(this)]);
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
    params: isZodType(schemas.params) ? schemas.params : _zod.z.strictObject(_nullishCoalesce(schemas.params, () => ( {}))),
    query: isZodType(schemas.query) ? schemas.query : _zod.z.strictObject(_nullishCoalesce(schemas.query, () => ( {}))),
    body: isZodType(schemas.body) ? schemas.body : _zod.z.strictObject(_nullishCoalesce(schemas.body, () => ( {})))
  };
  return async (req, res, next) => {
    const errors = [];
    const issues = [];
    for (const type of types) {
      const parsed = await validation[type].safeParseAsync(_nullishCoalesce(req[type], () => ( {})));
      if (parsed.success) req[type] = parsed.data;
      else {
        issues.push(...parsed.error.issues);
      }
    }
    if (issues.length > 0) {
      throw new (0, _zod.ZodError)(issues);
    }
    return next();
  };
}


exports.default = validate;

module.exports = exports.default;
//# sourceMappingURL=index.js.map