import { listAssistants } from '$lib/services/chat/operations';
import { type Assistant } from '$lib/services/chat/types';
import loadedAssistants from './loadedassistants';
import { writable } from 'svelte/store';

const store = writable<Assistant[]>([]);

if (typeof window !== 'undefined') {
	listAssistants().then((assistants) => {
		store.set(assistants.items);
		loadedAssistants.set(true);
	});
}

export default store;
