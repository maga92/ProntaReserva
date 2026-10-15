import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db.js";

const app = express();

//Conectar ao MongoDB
await connectDB()

// Middleware
app.use(cors())
app.use(express.json());

const port = process.env.PORT || 5000;

app.get('/', (req: Request, res: Response) => {
    res.send('ProntaReserva: servidor rodando!');
});

app.listen(port, () => {
    console.log(`ProntaReserva: servidor rodando em http://localhost:${port}`);
});