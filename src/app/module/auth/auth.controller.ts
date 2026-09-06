import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { authServices } from "./auth.service";
import httpStatus from "http-status";

const login = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authServices.loginToDB(payload);

  const { accessToken, refreshToken } = result;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Login Successfull!",
    data: {
      accessToken,
      refreshToken,
    },
  });
});

export const authControllers = {
  login,
};
