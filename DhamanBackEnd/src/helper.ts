import jwt from "jsonwebtoken"



export const generateAccessToken = (userId: String, role: String) => {
    return jwt.sign(
        {
        id: userId,
        role: role
    },
    process.env.JWT_SECRET! ,
    {
        expiresIn: '15m'
    }
)
}

export const generateRefreshToken = (userId: String) => {
    return jwt.sign(
        {
        id: userId
    },
    process.env.JWT_SECRET! ,
    {
        expiresIn: '7d'
    }
)
} 