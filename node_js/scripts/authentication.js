// const jwt = require('json-web-token')
const jwt = require('jsonwebtoken');
// Never do this!
let users = {
    john: {password: "passwordjohn"},
    mary: {password:"passwordmary"}
}

exports.signin = function(req, res){
    let username = req.body.username
    let password = req.body.password
    
    // Neither do this!
    if (!username || !password || users[username].password !== password){
        return res.status(401).send()
    }

    //use the payload to store information about the user such as username, user role, etc.
    let payload = {username: username}

    console.log('524d4c5d7a2c71af42dfaf9094e93a029ffb8bfb1885444a986852dd62fc4d0a');
    //create the access token with the shorter lifespan
    //let accessToken = jwt.sign(payload, '524d4c5d7a2c71af42dfaf9094e93a029ffb8bfb1885444a986852dd62fc4d0a', {
    let accessToken = jwt.sign(payload, '524d4c5d7a2c71af42dfaf9094e93a029ffb8bfb1885444a986852dd62fc4d0a', {	
        algorithm: "HS512",
        expiresIn: 86400
    });

    //create the refresh token with the longer lifespan
    let refreshToken = jwt.sign(payload, '524d4c5d7a2c71af42dfaf9094e93a029ffb8bfb1885444a986852dd62fc4d0a', {
        algorithm: "HS512",
        expiresIn: 86400
    });

    //store the refresh token in the user array
    users[username].refreshToken = refreshToken

    //send the access token to the client inside a cookie
    res.cookie("jwt", accessToken, {secure: false, httpOnly: false})
    res.send()
}

exports.refresh = function (req, res){

    let accessToken = req.cookies.jwt

    if (!accessToken){
        return res.status(403).send()
    }

    let payload
    try{
        payload = jwt.verify(accessToken, '524d4c5d7a2c71af42dfaf9094e93a029ffb8bfb1885444a986852dd62fc4d0a')
     }
    catch(e){
        return res.status(401).send()
    }

    //retrieve the refresh token from the users array
    let refreshToken = users[payload.username].refreshToken

    //verify the refresh token
    try{
        jwt.verify(refreshToken, '524d4c5d7a2c71af42dfaf9094e93a029ffb8bfb1885444a986852dd62fc4d0a')
    }
    catch(e){
        return res.status(401).send()
    }

    let newToken = jwt.sign(payload, '524d4c5d7a2c71af42dfaf9094e93a029ffb8bfb1885444a986852dd62fc4d0a', 
    {
        algorithm: "HS256",
        expiresIn: 86400
    })

    res.cookie("jwt", newToken, {secure: true, httpOnly: true})
    res.send()
}
