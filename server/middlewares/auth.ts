import { NextFunction, Request, Response } from "express"
import { User, type IUser } from "../models/User.js"
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request{
user?: IUser
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        let token

        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
try {
    //Pegar token do Header
    token = req.headers.authorization.split(" ")[1]  

    //Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {id: string}

    //Pegar user do token, excluir senha
    const user = await User.findById(decoded.id).select("-password")
    if(!user){
      res.status(401).json({message: "Não autorizado. Usuário não encontrado."})
      return
    }   

    req.user = user
    next()

} catch (error) {

   console.error("Erro do Auth Middleware:", error)
    res.status(401).json({message: "Não autorizado, token falhou."})
     return    
}
}

if(!token){
    res.status(401).json({message: "Não autorizado, sem token."})
}
}

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void =>{
   if(req.user && req.user.role === "admin"){
    next()
   } else {
    res.status(403).json({message: "Acesso negado. Cargo de Admin é necessário."})
   }
}

export const ownerOnly = (req: AuthRequest, res: Response, next: NextFunction): void =>{
   if(req.user && (req.user.role === "owner" || req.user.role === "admin")){
    next()
   } else {
    res.status(403).json({message: "Acesso negado. Cargo de Dono do Restaurante é necessário."})
   }
}


