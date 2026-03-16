const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifySupabaseJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user?.user_metadata?.role;
    // No role set → allow through (matches frontend behaviour for accounts without metadata)
    if (!role || roles.includes(role)) return next();
    return res.status(403).json({ error: "Forbidden." });
  };
}

module.exports = { verifySupabaseJWT, requireRole, supabase };
