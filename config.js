const dotenv = require('dotenv')

// process.env 객체에 삽입
dotenv.config()

// process.env.MONGODB_URL => config.MONGODB_URL
module.exports = {
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET
}