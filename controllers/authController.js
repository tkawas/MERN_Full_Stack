const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// @desc Login
// @route POST /auth
// @access Punlic
const login = asyncHandler(async (req, res) => {
    const{username, password} = req.body

    if(!username || !password){
        return res.status(400).json({message: 'All fields are required'})
    }

    const foundUser = await User.findOne({username}).exec()

    if (!foundUser || !foundUser.active){
        return res.status(401).json({message:'Unautherised'})
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) return res.status(401).json({message: 'Unausthorised'})

    //now we are creating our access refresh and sequrHTTP cooki

    const accessToken = jwt.sign(
        {
            "UserInfor":{
                "username": foundUser.username, 
                "roles": foundUser.roles
            }
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        {expiresIn: '10m'}
    )

    const refreshToken = jwt.sign(
        {"username":foundUser.username},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '10m'} 
    )
    //create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly: true, //acccessible only by web server
        secure: true, //https
        sameSite: 'None', //cross-site cookie
        maxAge: 7*24*60*60*1000 //cookie expiry: set to match RT
    })
    //send accessToken containing username and roles 
    res.json({accessToken})


})

// @desc Refresh
// @route GET /auth/refresh
// @access Public - becuse access token has expired
const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorised' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ username: decoded.username }).exec()

            if (!foundUser) return res.status(401).json({ message: 'Unauthorised' })

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '10m' }
            )

            res.json({ accessToken })
        })
    )
}

// @desc Logout
// @route GET /auth/Logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    res.clearCookie('jwt', {history:true, sameSite:'None', secure:true})
    res.json({message:'Cookie cleared'})

} 

module.exports ={
    login, 
    refresh, 
    logout
}
