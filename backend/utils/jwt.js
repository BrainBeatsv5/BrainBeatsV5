const jwt = require('jsonwebtoken');
const { getUserExists } = require('./database');
require("dotenv").config();

// Checks the local storage for an existing token and logs them in if one exists
function verifyJWT(jwtToken) {
    let token;

    if (jwtToken) {
        token = jwtToken;
    } else {
        return false;
    }

    return jwt.verify(token, process.env.NEXT_JWT_KEY, function (err, decoded) {
        if (err) {
            console.log(err);
            return false;
        } else {
            if (decoded) {
                const userExists = getUserExists(decoded.id, "id");

                if (!userExists) return false;

                return decoded;
            }
        }
    });
}

// Creates and saves a JWT onto their machine's local storage
function getJWT(id, email) {
    try {
        const token = jwt.sign({
            id: id,
            email: email
        }, process.env.JWT_KEY, {
            expiresIn: '30d'
        });

        return token;
    } catch (err) {
        console.log(err);
    }
}

// TODO : Turn these into API calls for frontend to use so it's actually client side local storage

// Save a JWT onto local storage
/*function saveJWT(token) {
    localStorage.setItem('BrainBeatsToken', token);
    console.log("Saved JWT", token);
}

// Retrive JWT from local storage
function getJWT() {
    return localStorage.getItem('BrainBeatsToken');
}

// Remove JWT from local storage
function removeJWT() {
    return localStorage.removeItem('BrainBeatsToken');
}*/

module.exports = {
    verifyJWT: verifyJWT,
    getJWT: getJWT,
}