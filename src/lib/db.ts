import { Pool, PoolClient } from 'pg';

// Create a pool instance to be reused for queries
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {rejectUnauthorized: false} : false
});

// Convert snake_case to camelCase
function snakeToCamel<T>(rows: Record<string, unknown>[]): T[] {
    return rows.map(row => {
        return Object.fromEntries(
            Object.entries(row).map(([key, value]) => [
                key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
                value
            ])
        ) as unknown as T;
    });
}

// Primary SQL query function
export async function query(text: string, params?: (string | number | boolean | Date | null)[]) {
    try {
        const start = Date.now();
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        // Log query performance in dev
        if (process.env.NODE_ENV !== 'production') {
            console.log('Executed query', {text, duration, rows: result.rowCount});
        }

        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Helper function for converting snake_case to camelCase and returning rows
export async function queryRows<T>(
    text: string,
    params?: (string | number | boolean | Date | null)[]
): Promise<T[]> {
    const result = await query(text, params);
    return snakeToCamel<T>(result.rows);
}


// Helper function to execute transactions
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export default {
    query,
    queryRows,
    transaction
};