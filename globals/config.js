import "dotenv/config";
import bcrypt from "bcrypt";

const env = process.env;
const defaultImage = "1kvFDWul0NlJiF4Pc5fCGAdMqXhWWkUPY";
const salt = await bcrypt.genSalt(Number(env.SALT));
const limit = 50;

const hashPassWord = async (password) => {
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

const comparePassWord = async (password, hash) => {
    const result = await bcrypt.compare(password, hash);
    return result;
};

export { env, hashPassWord, comparePassWord, defaultImage, limit };
