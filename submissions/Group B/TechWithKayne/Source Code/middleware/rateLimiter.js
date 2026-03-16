const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

// All rate-limited routes are behind verifySupabaseJWT, so req.user.id is always set.
// We still provide the IPv6-safe ipKeyGenerator as a fallback to satisfy the library.
const makeKeyGenerator = (req) => req.user?.id || ipKeyGenerator(req);

const triageRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: makeKeyGenerator,
  message: { error: "Too many requests. Subukan muli pagkatapos ng isang minuto." },
  standardHeaders: true,
  legacyHeaders: false,
});

const bridgeRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: makeKeyGenerator,
  message: { error: "Too many requests. Subukan muli pagkatapos ng isang minuto." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { triageRateLimiter, bridgeRateLimiter };
