import React, { act, useState } from "react";
(globalThis as Record<string, unknown>).React = React;
import assert from "node:assert/strict";
import { it } from "node:test";
import { parseHTML } from "linkedom";
import { Composer } from "../components/composer.tsx";
import { parseChatInput, parseUserSteerInput, inputAppends } from "../src/core/input-events.ts";
import { parseChatImages, MAX_CHAT_IMAGE_BYTES, type ChatImage } from "../src/core/image-attachments.ts";
import { newUserSteer, toLlmMessages } from "../src/core/native-messages.ts";
import { projectView } from "../src/core/view.ts";
import { SessionModel } from "../components/session-core.ts";

const image: ChatImage = { type: "image", mimeType: "image/png", data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=" };

it("preserves images when a mid-turn steer races a settled turn and becomes a normal send", async () => {
	const posts: Array<{ url: string; input: Record<string, unknown> }> = [];
	const model = new SessionModel({ chatId: "image-test", initialMessages: [], fetch: async (url, init) => {
		posts.push({ url: String(url), input: JSON.parse(String(init?.body)).input });
		return new Response("test refusal", { status: String(url).endsWith("/steer") ? 409 : 400 });
	} });
	await model.steer("", [image]);
	assert.equal(posts.length, 2);
	assert.deepEqual(posts[0]!.input.images, [image]);
	assert.deepEqual(posts[1], { url: "/api/chat", input: { type: "text", text: "", images: [image] } });
	assert.deepEqual(model.getState().messages[0]!.parts, [image]);
});

it("image-only input survives validation, native storage, model conversion, and transcript projection", () => {
	const input = parseChatInput({ type: "text", text: "", images: [image] });
	const messages = inputAppends({ messages: [] }, input);
	assert.deepEqual(messages[0]!.content, [image]);
	assert.deepEqual(toLlmMessages(messages)[0]!.content, [image]);
	assert.deepEqual(projectView(JSON.parse(JSON.stringify(messages)))[0]!.parts, [image]);
	const steer = parseUserSteerInput({ type: "steer", id: "s1", text: "Explain this", images: [image] });
	assert.deepEqual(newUserSteer(steer.text, steer.id, steer.images).content, [{ type: "text", text: "Explain this" }, image]);
});

it("rejects unsupported, malformed, oversized, and excessive images without breaking text inputs", () => {
	for (const images of [[{ ...image, mimeType: "image/svg+xml" }], [{ ...image, data: "https://example.com/image" }], [{ ...image, data: "a".repeat(MAX_CHAT_IMAGE_BYTES * 2) }], Array(4).fill(image)]) {
		assert.throws(() => parseChatInput({ type: "text", text: "test", images }));
		assert.throws(() => parseUserSteerInput({ type: "steer", id: "s1", text: "test", images }));
	}
	assert.deepEqual(parseChatInput({ type: "text", text: "hello" }), { type: "text", text: "hello" });
	assert.throws(() => parseChatInput({ type: "text", text: "", images: [] }));
	assert.deepEqual(parseChatImages([image]), [image]);
});

it("pasting previews an image, enables image-only send, supports removal, and leaves text paste alone", async () => {
	const dom = parseHTML("<html><body><div id='root'></div></body></html>");
	const globals = globalThis as Record<string, unknown>;
	const previous = new Map<string, PropertyDescriptor | undefined>();
	class Reader {
		result = `data:${image.mimeType};base64,${image.data}`;
		onload?: () => void;
		readAsDataURL() { queueMicrotask(() => this.onload?.()); }
	}
	for (const [key, value] of Object.entries({ window: dom.window, document: dom.document, HTMLElement: dom.window.HTMLElement, FileReader: Reader, IS_REACT_ACT_ENVIRONMENT: true })) {
		previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
		Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
	}
	let sent: ChatImage[] = [];
	function Harness() {
		const [images, setImages] = useState<ChatImage[]>([]);
		return <Composer busy={false} value="" onChange={() => {}} onSend={() => { sent = images; }} onStop={() => {}} canSend={images.length > 0} images={images} onImagesChange={setImages} />;
	}
	const { createRoot } = await import("react-dom/client");
	const root = createRoot(document.getElementById("root")!);
	try {
		await act(async () => root.render(<Harness />));
		const textarea = document.querySelector("textarea")!;
		const paste = new dom.window.Event("paste", { bubbles: true, cancelable: true });
		Object.defineProperty(paste, "clipboardData", { value: { items: [{ kind: "file", type: "image/png", getAsFile: () => ({ type: "image/png", size: 68 }) }] } });
		await act(async () => { textarea.dispatchEvent(paste); });
		assert.equal(paste.defaultPrevented, true);
		assert.ok(document.querySelector('img[alt="Attached image 1"]'));
		const send = document.querySelector<HTMLButtonElement>('button[aria-label="Send"]')!;
		assert.equal(send.hasAttribute("disabled"), false);
		await act(async () => { document.querySelector("form")!.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })); });
		assert.deepEqual(sent, [image]);
		await act(async () => { document.querySelector<HTMLButtonElement>('button[aria-label="Remove image 1"]')!.click(); });
		assert.equal(document.querySelector("img"), null);
		const textPaste = new dom.window.Event("paste", { bubbles: true, cancelable: true });
		Object.defineProperty(textPaste, "clipboardData", { value: { items: [{ kind: "string", type: "text/plain" }] } });
		textarea.dispatchEvent(textPaste);
		assert.equal(textPaste.defaultPrevented, false);
	} finally {
		await act(async () => root.unmount());
		for (const [key, descriptor] of previous) {
			if (descriptor) Object.defineProperty(globalThis, key, descriptor);
			else delete globals[key];
		}
	}
});
