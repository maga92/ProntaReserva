import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from "../models/User.js"
import bcrypt from "bcrypt"
import { AuthRequest } from '../middlewares/auth.js'

//Auxilio para gerar o token JWT 
const generateToken = (id:string) =>{
return jwt.sign({id}, process.env.JWT_SECRET as string, {expiresIn: "30d"}) // Gera um token de 30 dias de valid.
}

//Registrar novo usuário
 //POST  /api/auth/login 
export const registerUser = async(req: Request, res: Response): Promise<void> =>{
 try {
     const{ name, email, password, phone, role } =  req.body
        if (!name || !email || !password){
          res.status(400).json({message: "Cadastre todos os campos."})
           return
        }

        //Check de user existente:
        const userExists = await User.findOne({email})
        if(userExists){
          res.status(400).json({message: "Cadastre todos os campos."})
           return
        }

        //Senha Hash
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //Criar user
        const user = await User.create({
          name,
           email, 
            password: hashedPassword,
             phone,
              role,
               })

          if (user){
            res.status(201).json({
              _id: user._id,
               name: user.name,
                email: user.email,
                 phone: user.phone,
                  role: user.role,
                   token: generateToken(user._id.toString())
                   })
          }else{
            res.status(400).json({message: "Dados do usuário inválidos."})
          }
 } catch (error: any) {
      console.error(error)
       res.status(400).json({message: error.message})
  
}
}

//Autenticar/Token usuário
 //POST  /api/auth/login 
export const loginUser = async(req: Request, res: Response): Promise<void> =>{
 try {
     const{ email, password } =  req.body
        if (!email || !password){
          res.status(400).json({message: "Precisa de e-mail e senha."})
           return
        }

        //Checar por usuário
        const user = await User.findOne({email})
        if(!user){
          res.status(401).json({message:"E-mail ou senha inválidos"})
        return
        }

        //Conferir se as senhas batem
        const isMatch = await bcrypt.compare(password, user.password || "")
        if(isMatch){
          res.status(401).json({message:"E-mail ou senha inválidos"})
        return
        }

        res.json({
              _id: user._id,
               name: user.name,
                email: user.email,
                 phone: user.phone,
                  role: user.role,
                   token: generateToken(user._id.toString())
                   })

 } catch (error: any) {
console.error(error)
       res.status(400).json({message: error.message})
}    
}




//Pegar perfil do usuário
 //GET  api/auth/me
  //@access private  -  essa rota é privada  / para isso, usa-se um middleware para conferir a autenticação do user
export const getMe = async(req: AuthRequest, res: Response): Promise<void> =>{
 try {
    if(!req.user){
      res.status(401).json({message: "Não autorizado."})
      return
    }
    res.json(req.user)
 } catch (error: any) {
    console.error(error)
 res.status(400).json({message: error.message}) }    

}