import httpStatus from "http-status";
import type { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { DonationService } from "./donate.service";
import { sendResponse } from "../../../utils/sendResponse";
import config from "../../config";

const createDonation = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;

	const result = await DonationService.createDonation({
		amount: req.body.amount,
		donarId: user?.userID as string,
		payerReference: req.body.payerReference,
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Donation initiated successfully",
		data: result,
	});
});

const callback = catchAsync(async (req: Request, res: Response) => {
	const { paymentID, status } = req.query as {
		paymentID: string;
		status: string;
	};

	const result = await DonationService.handleCallback(paymentID, status);

	const redirectUrl = result.success
		? `${config.frontend_url}/donation/success`
		: `${config.frontend_url}/donation/failed`;

	return res.redirect(redirectUrl);
});

const getDonationById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await DonationService.getDonationById(id as string);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Donation retrieved successfully",
		data: result,
	});
});

const getMyDonations = catchAsync(async (req: Request, res: Response) => {
	const user = req.user;
	const result = await DonationService.getMyDonations(user?.userID as string);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "My donations retrieved successfully",
		data: result,
	});
});

export const DonationController = {
	createDonation,
	callback,
	getDonationById,
	getMyDonations,
};
