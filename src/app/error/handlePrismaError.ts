import type { Prisma } from "../../../prisma/generated/prisma/client";
import type { IGenericErrorMessage } from "../types";

interface IGenericErrorResponse {
	statusCode: number;
	message: string;
	errorMessages: IGenericErrorMessage[];
}

const handlePrismaClientKnownRequestError = (
	error: Prisma.PrismaClientKnownRequestError,
): IGenericErrorResponse => {
	let statusCode = 400;
	let message = "Something went wrong";
	let errorMessages: IGenericErrorMessage[] = [];

	switch (error.code) {
		case "P2025":
			statusCode = 404;
			message = (error.meta?.cause as string) || "Requested record not found";
			errorMessages = [{ path: "", message }];
			break;

		case "P2002":
			statusCode = 409;
			message = `Duplicate value for field: ${(error.meta?.target as string[])?.join(", ")}`;
			errorMessages = [
				{ path: (error.meta?.target as string[])?.[0] || "", message },
			];
			break;

		case "P2003":
			statusCode = 400;
			message = "Invalid reference — related record does not exist";
			errorMessages = [{ path: "", message }];
			break;

		default:
			statusCode = 400;
			message = error.message;
			errorMessages = [{ path: "", message }];
	}

	return { statusCode, message, errorMessages };
};

export default handlePrismaClientKnownRequestError;
