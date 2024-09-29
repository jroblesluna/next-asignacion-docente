import sql from 'mssql';

interface DBConfig {
  user: string;
  password: string;
  database: string;
  server: string;
  port: number;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
}

const config: DBConfig = {
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
  server: process.env.DB_SERVER as string,
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

export async function connectToDatabase() {
  console.log("connectToDatabase@/pages/api/lib/db.ts");
  try {
    console.log("DB_USER", process.env.DB_USER);
    console.log("DB_PASSWORD", process.env.DB_PASSWORD);
    const pool = await sql.connect(config);
    console.log('Database connection successful');
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to the database');
  }
}
