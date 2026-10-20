import "dotenv/config";
import express, { NextFunction, Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/AuthRoutes.js";

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
app.use("/api/auth/", authRouter)

   //Manipulador de erros global
   app.use((err: Error, req: Request, res: Response, next: NextFunction) =>{
     console.error("Erro não tratado", err)
      res.status(500).json({
        message: err.message || "Erro interno do server",
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
      })
   }) 

app.listen(port, () => {
    console.log(`ProntaReserva: servidor rodando em http://localhost:${port}`);
});