import jwt from 'jsonwebtoken';
import { env } from './config.js';

const private_key = env.PRIVATEKEY;

// minus
const jwtSign = (data, time) => {
    return jwt.sign(data, private_key, { 'expiresIn': time * 60, "algorithm":"HS256" });
}

const jwtVerify = (data) => {
    return jwt.verify(data, private_key);
}

export { jwtSign, jwtVerify };