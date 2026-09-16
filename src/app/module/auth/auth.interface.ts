export interface ILoginPayload {
	email: string;
	password: string;
}
export interface IRequestUser {
	userID: string;
	name: string;
	email: string;
	role: string;
}
export interface IVerifyEmailPayload {
	email: string;
	otp: string;
}
export interface IRegisterPatientPayload {
	name: string;
	email: string;
	password: string;
	phone: string;
}

export interface IGoogleLoginPayload {
	idToken: string;
}
