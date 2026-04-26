"use server";

import { db } from "../db";
import { unstable_cache as cache, revalidatePath } from "next/cache";

export async function getCacheUserSetting(userId: string) {
	return cache(
		async () => {
			return db.userSettings.findUnique({
				where: { userId },
			});
		},
		["userSettings", userId],
		{
			revalidate: 60,
			tags: [`userSettings-${userId}`],
		},
	)();
}

export async function getUserSetting(userId: string) {
	return db.userSettings.findUnique({
		where: { userId },
	});
}

export async function getCreateUserSetting(userId: string) {
	return db.userSettings.upsert({
		where: { userId },
		update: {},
		create: {
			userId,
			currency: "USD",
		},
	});
}

export async function updateUserSetting(userId: string, currency: string) {
	const result = await db.userSettings.update({
		where: { userId },
		data: { currency },
	});

	revalidatePath("/manage");

	return result;
}
