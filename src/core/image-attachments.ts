export interface ChatImage {
	type: "image";
	mimeType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
	data: string;
}

export const MAX_CHAT_IMAGES = 3;
export const MAX_CHAT_IMAGE_BYTES = 2 * 1024 * 1024;
export const CHAT_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;

export function parseChatImages(value: unknown): ChatImage[] {
	if (value === undefined) return [];
	if (!Array.isArray(value) || value.length > MAX_CHAT_IMAGES) throw new Error("Attach at most 3 images per message.");
	return value.map((raw) => {
		if (!raw || typeof raw !== "object" || !CHAT_IMAGE_TYPES.includes(raw.mimeType) || raw.type !== "image") {
			throw new Error("Images must be PNG, JPEG, WebP, or GIF.");
		}
		if (typeof raw.data !== "string" || !raw.data.length || raw.data.length > Math.ceil(MAX_CHAT_IMAGE_BYTES / 3) * 4 || raw.data.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(raw.data)) {
			throw new Error("Each image must contain valid base64 data and be no larger than 2 MB.");
		}
		const bytes = raw.data.length * 3 / 4 - (raw.data.endsWith("==") ? 2 : raw.data.endsWith("=") ? 1 : 0);
		if (bytes > MAX_CHAT_IMAGE_BYTES) throw new Error("Each image must be no larger than 2 MB.");
		return { type: "image", mimeType: raw.mimeType, data: raw.data };
	});
}
