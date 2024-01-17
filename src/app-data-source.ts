import { DataSource } from 'typeorm';
import process from 'process';
import dotenv from 'dotenv';

dotenv.config();

export const myDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ["src/entities/*.ts"],
    logging: true,
    synchronize: true, // CHANGE TO false FOR PRODUCTION!!!!d
})
