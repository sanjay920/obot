<script lang="ts">
	import { currentAssistant } from '$lib/stores';
	import { ChatService, type Task } from '$lib/services';
	import { Trash } from '$lib/icons';
	import { Pen } from 'lucide-svelte';
	import { onDestroy } from 'svelte';
	import Runs from '$lib/components/tasks/Runs.svelte';
	import Trigger from '$lib/components/tasks/Trigger.svelte';
	import Steps from '$lib/components/tasks/Steps.svelte';
	import Controls from '$lib/components/editor/Controls.svelte';

	interface Props {
		id: string;
		onChanged?: (task: Task) => void | Promise<void>;
	}

	let { id, onChanged }: Props = $props();
	let savedTask = $state<string>();
	let task = $state<Task>({
		name: 'Loading...',
		steps: [],
		id: ''
	});
	let editMode = $state(true);

	$effect(() => {
		if ($currentAssistant.id && !savedTask) {
			ChatService.getTask($currentAssistant.id, id).then((newTask) => {
				savedTask = JSON.stringify(newTask);
				task = newTask;
			});
		}
	});

	$effect(() => {
		if (task.id && editMode && task.steps.length === 0) {
			task.steps.push({
				id: ''
			});
		}
	});

	function isDirty() {
		return savedTask !== JSON.stringify(task);
	}

	onDestroy(() => {
		if (inflight) {
			clearTimeout(inflight);
		}
	});

	let inflight: number = 0;

	function saveLater() {
		if (inflight) {
			clearTimeout(inflight);
			inflight = 0;
		}
		inflight = setTimeout(() => {
			inflight = 0;
			save();
		}, 1000);
	}

	async function saveOnEnter(e: KeyboardEvent) {
		if (e.target instanceof HTMLElement && e.key === 'Enter') {
			await save();
			e.target.blur();
		}
	}

	async function save() {
		if (!task || !isDirty()) {
			return;
		}

		task = await ChatService.saveTask($currentAssistant.id, task);
		savedTask = JSON.stringify(task);
		onChanged?.(task);
	}
</script>

<div
	role="none"
	onkeydown={(e) => e.stopPropagation()}
	class="relative flex min-h-full flex-col rounded-s-3xl p-5"
>
	<input
		class="text-xl font-semibold outline-none dark:bg-black dark:text-gray-50"
		bind:value={task.name}
		onfocusout={saveLater}
		disabled={!editMode}
		onkeydown={saveOnEnter}
	/>

	<input
		class="mt-0.5 text-sm outline-none dark:bg-black dark:text-gray-50"
		bind:value={task.description}
		placeholder={editMode ? 'Enter description' : ''}
		onfocusout={saveLater}
		disabled={!editMode}
		onkeydown={saveOnEnter}
	/>

	{#if !editMode}
		<Runs {id} />
	{/if}

	<Trigger
		{task}
		{editMode}
		onChanged={async (t) => {
			task = t;
			await save();
		}}
	/>

	<Steps
		{task}
		{editMode}
		save={async (steps) => {
			task.steps = steps;
			await save();
		}}
	/>

	<div class="absolute right-0 top-0 m-2 flex">
		<button
			class="icon-button"
			onclick={() => {
				editMode = !editMode;
			}}
		>
			<Pen class="h-5 w-5" />
		</button>
		<button class="icon-button">
			<Trash class="h-5 w-5" />
		</button>
		<Controls />
	</div>

	<div class="m-2 grow place-content-end self-end text-gray-300">id: {id}</div>
</div>

<style lang="postcss">
</style>
