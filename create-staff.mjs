import bcrypt from 'bcrypt';
import pg from 'pg';

const { Pool } = pg;

async function createStaffUser() {
    // Connect to your database
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5433/kingwilliam',
    });

    // Password to hash
    const password = 'password123';

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        // Insert staff record
        await pool.query(`
      INSERT INTO staff (first_name, last_name, email, password_hash)
      VALUES ($1, $2, $3, $4)
    `, ['Admin', 'User', 'admin@kingwilliam.com', passwordHash]);

        console.log('Staff user created successfully!');
    } catch (error) {
        console.error('Error creating staff user:', error);
    } finally {
        // Close connection
        await pool.end();
    }
}

createStaffUser();