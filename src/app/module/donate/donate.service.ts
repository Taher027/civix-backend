import httpStatus from "http-status";
import { randomUUID } from "node:crypto";
import type { ICreateDonationPayload } from "./donate.interface";
import { AppError } from "../../../utils/AppError";
import { getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import config from "../../config";

const createDonation = async (payload: ICreateDonationPayload) => {
	const { amount, donarId, payerReference } = payload;

	if (amount <= 0) {
		throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
	}

	const donateId = randomUUID();
	const merchantInvoiceNumber = `DON-${donateId}`;

	const idToken = await getBkashIdToken();

	const response = await fetch(
		`${config.bkash_base_url}/tokenized/checkout/create`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: idToken as string,
				"X-APP-Key": config.bkash_app_key as string,
			},
			body: JSON.stringify({
				mode: "0011",
				payerReference: payerReference || " ",
				callbackURL: `${config.bkash_callback_url}/donation/callback`,
				amount: amount.toFixed(2),
				currency: "BDT",
				intent: "sale",
				merchantInvoiceNumber,
			}),
		},
	);

	if (!response.ok) {
		throw new AppError(httpStatus.BAD_GATEWAY, "Bkash Create Payment Failed");
	}

	const result = await response.json();

	if (result.statusCode && result.statusCode !== "0000") {
		throw new AppError(
			httpStatus.BAD_GATEWAY,
			result.statusMessage || "Bkash Create Payment Failed",
		);
	}

	const donate = await prisma.donate.create({
		data: {
			id: donateId,
			merchantInvoiceNumber,
			amount,
			currency: "BDT",
			paymentGateway: "bkash",
			bkashPaymentId: result.paymentID,
			payerReference,
			donarId,
			gatewayResponse: result,
		},
	});

	return {
		bkashURL: result.bkashURL,
		donateId: donate.id,
		merchantInvoiceNumber: donate.merchantInvoiceNumber,
	};
};

const executeDonation = async (paymentID: string) => {
	const donate = await prisma.donate.findUnique({
		where: { bkashPaymentId: paymentID },
	});

	if (!donate) {
		throw new AppError(httpStatus.NOT_FOUND, "Donation record not found");
	}

	const idToken = await getBkashIdToken();

	const response = await fetch(
		`${config.bkash_base_url}/tokenized/checkout/execute`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: idToken as string,
				"X-APP-Key": config.bkash_app_key as string,
			},
			body: JSON.stringify({ paymentID }),
		},
	);

	if (!response.ok) {
		throw new AppError(httpStatus.BAD_GATEWAY, "Bkash Execute Payment Failed");
	}

	const result = await response.json();

	if (
		result.statusCode === "0000" &&
		result.transactionStatus === "Completed"
	) {
		const updated = await prisma.donate.update({
			where: { id: donate.id },
			data: {
				status: "PAID",
				bkashTrxId: result.trxID,
				paidAt: new Date(),
				gatewayResponse: result,
			},
		});
		return updated;
	}

	await prisma.donate.update({
		where: { id: donate.id },
		data: {
			status: "FAILED",
			gatewayResponse: result,
		},
	});

	throw new AppError(
		httpStatus.BAD_REQUEST,
		result.statusMessage || "Payment execution failed",
	);
};

const handleCallback = async (paymentID: string, status: string) => {
	if (status === "cancel" || status === "failure") {
		const donate = await prisma.donate.findUnique({
			where: { bkashPaymentId: paymentID },
		});

		if (donate) {
			await prisma.donate.update({
				where: { id: donate.id },
				data: { status: status === "cancel" ? "CANCELLED" : "FAILED" },
			});
		}

		return { success: false, paymentID };
	}

	const result = await executeDonation(paymentID);
	return { success: true, data: result };
};

const getDonationById = async (id: string) => {
	return prisma.donate.findUniqueOrThrow({ where: { id } });
};

const getMyDonations = async (donarId: string) => {
	return prisma.donate.findMany({
		where: { donarId },
		orderBy: { createdAt: "desc" },
	});
};

export const DonationService = {
	createDonation,
	executeDonation,
	handleCallback,
	getDonationById,
	getMyDonations,
};
