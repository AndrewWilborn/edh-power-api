import sql from 'mssql'
import { config } from "./config.js"

const db = await sql.connect(config);

export default db;