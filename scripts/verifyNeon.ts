import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function verify() {
    try {
        const res = await pool.query('SELECT NOW();');
        console.log('✔ Neon database connection successful');
        console.log('Result:', res.rows[0]);
        process.exit(0);
    } catch (err) {
        console.error('✘ Neon database connection failed');
        console.error(err);
        process.exit(1);
    }
}

verify();
