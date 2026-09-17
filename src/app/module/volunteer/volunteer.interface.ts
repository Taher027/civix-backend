export interface IVolunteerApplyPayload {
	bio?: string;
	skills?: string[];
}

export interface IVolunteerReviewPayload {
	status: "APPROVED" | "REJECTED";
}

export interface IComplaintVolunteerApplyPayload {
	message?: string;
}

export interface IComplaintVolunteerStatusPayload {
	statusNote: string;
}
