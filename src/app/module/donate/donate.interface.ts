export interface ICreateDonationPayload {
	amount: number;
	donarId: string;
	payerReference?: string; // email or phone
}

export interface IBkashExecutePaymentResponse {
	paymentID: string;
	trxID: string;
	transactionStatus: string;
	amount: string;
	currency: string;
	payerReference?: string;
	statusCode: string;
	statusMessage: string;
}
