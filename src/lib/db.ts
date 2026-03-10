import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
    connectionString: import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

export const query = (text: string, params?: any[]) => {
    return pool.query(text, params);
};

export const initDb = async () => {
    const schema = `
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    emotional_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_letters_user_id ON letters(user_id);
  `;
    try {
        await query(schema);
        console.log("Database initialized");
    } catch (error) {
        console.error("Database initialization failed:", error);
    }
};

export const getTransaction = async () => {
    const client = await pool.connect();
    const start = async () => {
        await client.query("BEGIN");
    };
    const commit = async () => {
        await client.query("COMMIT");
        client.release();
    };
    const rollback = async () => {
        await client.query("ROLLBACK");
        client.release();
    };
    return { client, start, commit, rollback };
};
