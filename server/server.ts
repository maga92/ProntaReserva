import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";

const app = express();

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