import bcrypt from "bcryptjs";
import { Pool } from "pg";

// 创建一个连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
              CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
              )
            `);

    console.log("Database tables initialized successfully");
  } finally {
    client.release();
  }
}

initializeDatabase().catch((err) =>
  console.error("Database initialization error:", err)
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const client = await pool.connect();
      await client.query(
        "INSERT INTO users (username, password) VALUES ($1, $2)",
        [username, hashedPassword]
      );
      client.release();

      res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
