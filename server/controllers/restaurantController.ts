import { Request, Response } from "express"
import { Query } from "mongoose";
import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";
import jwt from 'jsonwebtoken'
import { Booking } from "../models/booking.js";

//0001
  //Achar os restaurantes com pesquisa e filtros
  //GET /api/restaurants
export const getRestaurants = async(req:Request, res: Response): Promise<void> => {

    try {
        const {search, priceRange, rating, location, sort} = req.query
        

        //Build query object
        const queryObj: any = {status: "approved"}

        if(search){
            queryObj.$or = [
                {name: {$regex: search, $options: "i"}},
                 {tags: {$regex: search, $options: "i"}},
                  {location: {$regex: search, $options: "i"}},
            ]
        }
        if(priceRange){
            const prices = Array.isArray(priceRange) ?  priceRange :  [priceRange]
            queryObj.priceRange = {$in: prices}   
        }

        if(rating){
            queryObj.rating = {$gte: parseFloat(rating as string)}   
        }

        if(location){
            queryObj.location = {$regex: location as string, $options: "i"}   
        }

        // Sort (Classificação)

        let sortOption: any =  {createdAt: -1}
        if(sort === "rating"){
            sortOption = {rating: -1}
        } else if (sort === "price_low"){
            sortOption = {rating: 1}
        } else if (sort === "price_high"){
            sortOption = {rating: -1}
        }

        const restaurant = await Restaurant.find(queryObj).sort(sortOption)
        res.json(restaurant)
        
    } catch (error: any) {
        console.error(error);
        res.status(400).json({message: error.message})
        
    }
}

//0002
  //Achar os restaurantes exclusivos/em destaque
  //GET /api/restaurants/featured
export const getFeaturedRestaurants = async(req:Request, res: Response): Promise<void> => {
    try {
        const featured= await Restaurant.find({
            status: "approved",
            $or: [
                {featured: true},
                 {exclusive: true}           
            ]
        }).limit(6)
        res.json(featured   )
    } catch (error) {
        console.error("Erro dos restaurantes em destaque:", error);
        res.status(500).json({message: "Erro do server"})

        
    }
}

//0003
  //Achar um único restaurante pelo slug
  //GET /api/restaurants/:slug
export const getRestaurantsBySlug = async(req:Request, res: Response): Promise<void> => {

    try {
        const restaurant = await Restaurant.findOne( {slug: req.params.slug})
      if(!restaurant){
        res.status(400).json({message: "Restaurante não encontrado"})
        return
      }
  // Caso não for autorizado, verificar auth (Owner ou Admin)
      if(restaurant.status !== "approved"){
        let isAuthorized = false
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            try {
                const token = req.headers.authorization.split(" ") [1]
                const decoded =jwt.verify(token, process.env.JWT_SECRET as string) as {id: string}

                const user = await User.findById(decoded.id)
                 if (user && (user.role === "admin" || (user.role === "owner" &&
                  restaurant.owner.toString() === user._id.toString()))) {
                  isAuthorized = true
                      }
            } catch (err) {
                //Ignorar token de verificar erro
                
            }
        }
        if(!isAuthorized){
            res.status(404).json({message: "Restaurante não encontrado/Aprovação pendente."})
            return
        }
      }
      res.json(restaurant)
    } catch (error: any) {
        console.error(error);
        res.status(400).json({message: error.message})
        
    }
}

//0004
  //Lugares disponiveis para os horarios  
  //GET /api/restaurants/:id/availability
export const getRestaurantAvailability = async(req:Request, res: Response): Promise<void> => {

    try {
        const { date } = req.query
        if(!date){
            res.status(400).json({message: "Por favor indique uma data."})
            return
        }
        
        const restaurant = await Restaurant.findById(req.params.id)
         if(!restaurant){
            res.status(404).json({message: "Restaurante não encontrado."})
            return
        }

        const bookingDate = new Date(date as string)

        //Todos as reservas desse dia para aquele restaurante

        const bookings = await Booking.find({
            restaurant: restaurant._id,
             date: bookingDate,
              status: "confirmed"
        })

        //Lugares para capacidades disponiveis
         const availability = restaurant.availableSlots.map((slot) =>{
            const bookedSeats = bookings.filter((b) =>b.time === slot).reduce((sum, b) => sum + 
            b.guests, 0)
        

         const totalSeats = restaurant.totalSeats || 20
          const availableSeats =  Math.max(0, totalSeats - bookedSeats)

          return{
            time: slot,
             availableSeats,
               isAvailable: availableSeats > 0
          }
        })
        res.json(availability)
    } catch (error: any) {
        console.error(error);
        res.status(400).json({message: error.message})
        
    }
}