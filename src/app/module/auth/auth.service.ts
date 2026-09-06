import { UserStatus } from "../../../../prisma/generated/prisma/enums";
import { AppError } from "../../../utils/AppError";
import { prisma } from "../../lib/prisma";
import type { ILoginPayload } from "./auth.interface";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { jwtUtils } from "../../../utils/jwt";
import config from "../../config";
import type { SignOptions } from "jsonwebtoken";

const loginToDB = async (payload: ILoginPayload) => {
  const { password } = payload;
  const email = payload.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }
  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
  }

  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new AppError(httpStatus.FORBIDDEN, "User is deleted");
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password as string,
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  const jwtPayload = {
    userID: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_token_secret as string,
    config.jwt_access_token_expireIn as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_token_secret as string,
    config.jwt_refresh_token_expireIn as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const authServices = {
  loginToDB,
};
