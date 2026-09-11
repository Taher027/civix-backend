import type {
	ComplaintPriority,
	ComplaintStatus,
} from "../../prisma/generated/prisma/enums";

export type TComplaintFilters = {
	title?: string;
	searchTerm?: string;
	city?: string;
	location?: string;
	priority?: ComplaintPriority;
	status?: ComplaintStatus;
	categoryId?: string;
};

const pick = <T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	keys: K[],
) => {
	const finalObj: Partial<T> = {};
	for (const key of keys) {
		if (obj && Object.hasOwn(obj, key)) {
			finalObj[key] = obj[key];
		}
	}
	return finalObj;
};

export default pick;
