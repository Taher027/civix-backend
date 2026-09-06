import { AppError } from "../../../utils/AppError";
import { prisma } from "../../lib/prisma";
import type { IUserRegister } from "./user.interface";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import config from "../../config";

const userRegisterToDB = async (payload: IUserRegister) => {
  const isExist = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isExist) {
    throw new AppError(httpStatus.CONFLICT, "User already Exists");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_round),
  );

  const createUser = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
    omit: {
      password: true,
    },
  });
  console.log(payload);

  return createUser;
};

export const userServices = {
  userRegisterToDB,
};
