import type {
	ComplaintPriority,
	ComplaintStatus,
} from "../../../../prisma/generated/prisma/enums";

export interface ICreateComplaintInput {
	title: string;
	short_description: string;
	description?: string;
	city: string;
	location: string;
	mapURL?: string;
	initialImages?: string[];
	priority?: ComplaintPriority;
	status?: ComplaintStatus;
	categoryId: string;
}
export interface IUpdateComplaintInput {
	title?: string;
	short_description?: string;
	description?: string;
	city?: string;
	location?: string;
	mapURL?: string;
	initialImages?: string[];
	priority?: ComplaintPriority;
}
export interface IStatusUpdate {
	status: ComplaintStatus;
}
