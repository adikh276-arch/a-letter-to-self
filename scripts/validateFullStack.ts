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

async function validate() {
    try {
        console.log('Testing connection...');
        const now = await pool.query('SELECT NOW()');
        console.log('✔ Connection ok:', now.rows[0]);

        console.log('Testing schema...');

        const initSchema = `
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
    `;

        await pool.query(initSchema);
        console.log('✔ Schema initialized/verified');

        const testUserId = 999999999;
        const testLetterId = '00000000-0000-0000-0000-000000000000';

        console.log('Testing user insert...');
        await pool.query('INSERT INTO users(id) VALUES($1) ON CONFLICT(id) DO NOTHING', [testUserId]);
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [testUserId]);
        if (user.rowCount === 0) throw new Error('User insert failed');
        console.log('✔ User insert/read ok');

        console.log('Testing letter insert...');
        try {
            await pool.query('INSERT INTO letters(id, user_id, content) VALUES($1, $2, $3) ON CONFLICT(id) DO NOTHING', [testLetterId, testUserId, 'Test content']);
        } catch (e) {
            console.error('Letter insert failed specifically:', e);
            throw e;
        }
        const letter = await pool.query('SELECT * FROM letters WHERE id = $1', [testLetterId]);
        if (letter.rowCount === 0) throw new Error('Letter insert failed');
        console.log('✔ Letter insert/read ok');

        console.log('Testing isolation...');
        const wrongUserLetter = await pool.query('SELECT * FROM letters WHERE user_id = 0');
        if (wrongUserLetter.rowCount > 0) throw new Error('Isolation failed');
        console.log('✔ Isolation ok');

        console.log('Testing delete...');
        await pool.query('DELETE FROM letters WHERE id = $1', [testLetterId]);
        const deletedLetter = await pool.query('SELECT * FROM letters WHERE id = $1', [testLetterId]);
        if (deletedLetter.rowCount > 0) throw new Error('Delete failed');
        console.log('✔ Delete ok');

        // Cleanup test user
        await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);

        console.log('ALL TESTS PASSED ✔');
        process.exit(0);
    } catch (err) {
        console.error('FAILED ✘');
        console.error(err);
        process.exit(1);
    }
}

validate();
