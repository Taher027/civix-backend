import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
const createToken = (
  pyaload: JwtPayload,
  secret: string,
  expiresIn: SignOptions,
) => {
  const token = jwt.sign(pyaload, secret, { expiresIn } as SignOptions);
  return token;
};

const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: verifiedToken,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const jwtUtils = {
  createToken,
  verifyToken,
};
