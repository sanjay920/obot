import { writable } from 'svelte/store';

const store = writable<boolean>(false);

export default store;
