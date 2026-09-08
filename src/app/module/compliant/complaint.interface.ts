import type {
	ComplaintPriority,
	ComplaintStatus,
} from "../../../../prisma/generated/prisma/enums";

export interface ICreateComplaintInput {
	title: string;
	short_description: string;
	description?: string;
	location: string;
	mapURL?: string;
	images?: string[];
	priority?: ComplaintPriority;
	status?: ComplaintStatus;
	categoryId: string;
}
