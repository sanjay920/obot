import items, { type EditorItem } from '$lib/stores/editor.svelte';
import tasks from '$lib/stores/tasks.svelte';
import ChatService from '../chat';
import { get, type Writable, writable } from 'svelte/store';

const visible = writable(false);
const maxSize = writable(false);

const editor: Editor = {
	remove,
	init,
	load,
	select,
	items,
	maxSize,
	visible
};

export interface Editor {
	load: (assistant: string, id: string) => Promise<void>;
	remove: (name: string) => void;
	select: (name: string) => void;
	init: (assistant: string) => Promise<void>;
	items: EditorItem[];
	visible: Writable<boolean>;
	maxSize: Writable<boolean>;
}

async function init(assistant: string) {
	let currentID = window.location.href.split('#editor:')[1];
	const maxSize = currentID?.search(',maxSize');
	currentID = currentID?.split(',maxSize')[0];
	if (maxSize > 0) {
		editor.maxSize.set(true);
	}
	if (currentID && assistant) {
		return load(assistant, currentID);
	}
}

function hasItem(id: string): boolean {
	const item = items?.find((item) => item.id === id);
	return item !== undefined;
}

async function load(assistant: string, id: string) {
	if (id.startsWith('w1')) {
		await loadTask(assistant, id);
		visible.set(true);
		return;
	}
	await loadFile(assistant, id);
	visible.set(true);
}

async function loadTask(assistant: string, taskID: string) {
	if (hasItem(taskID)) {
		select(taskID);
		return;
	}

	try {
		let task = tasks.items.get(taskID);
		if (!task) {
			task = await ChatService.getTask(assistant, taskID);
			tasks.items.set(taskID, task);
		}
		const targetFile: EditorItem = {
			id: taskID,
			name: task.name ?? `Task ${taskID}`,
			contents: '',
			buffer: '',
			modified: false,
			selected: true,
			task
		};
		items.push(targetFile);
		select(task.id);
	} catch {
		// ignore error
	}
}

async function loadFile(assistant: string, file: string) {
	if (hasItem(file)) {
		select(file);
		return;
	}

	try {
		const contents = await ChatService.getFile(assistant, file);
		const targetFile = {
			id: file,
			name: file,
			contents,
			buffer: '',
			modified: false,
			selected: true
		};
		items.push(targetFile);
		select(targetFile.name);
	} catch {
		// ignore error
	}
}

function select(id: string) {
	if (!id) {
		return;
	}

	let matched = false;
	for (const item of items) {
		if (item.id === id) {
			item.selected = true;
			matched = true;
			if (typeof window !== 'undefined') {
				if (get(maxSize)) {
					window.location.href = `#editor:${item.id},maxSize`;
				} else {
					window.location.href = `#editor:${item.id}`;
				}
			}
		} else {
			item.selected = false;
		}
	}

	if (!matched && items.length > 0) {
		items[0].selected = true;
	}
}

function remove(id: string) {
	for (let i = 0; i < items.length; i++) {
		if (items[i].id === id) {
			if (items[i].selected) {
				if (i > 0) {
					select(items[i - 1].id);
				} else if (items.length > 1) {
					select(items[i + 1].id);
				}
				items.splice(i, 1);
				break;
			}
		}
	}

	if (items.length === 0) {
		visible.set(false);
	}
}

export default editor;
