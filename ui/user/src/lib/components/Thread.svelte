<script lang="ts">
	import { sticktobottom, type StickToBottomControls } from '$lib/actions/div.svelte';
	import Input from '$lib/components/messages/Input.svelte';
	import Message from '$lib/components/messages/Message.svelte';
	import { Thread } from '$lib/services/chat/thread.svelte';
	import { ChatService, EditorService, type Messages, type Project } from '$lib/services';
	import { fade } from 'svelte/transition';
	import { onDestroy } from 'svelte';
	import { toHTMLFromMarkdown } from '$lib/markdown';
	import type { EditorItem } from '$lib/services/editor/index.svelte';
	import { getLayout } from '$lib/context/layout.svelte';

	interface Props {
		id?: string;
		project: Project;
		items: EditorItem[];
	}

	let { id = $bindable(), project, items = $bindable() }: Props = $props();

	let container = $state<HTMLDivElement>();
	let messages = $state<Messages>({ messages: [], inProgress: false });
	let thread = $state<Thread>();
	let messagesDiv = $state<HTMLDivElement>();
	let scrollSmooth = $state(false);

	$effect(() => {
		const update = () => (scrollSmooth = true);
		container?.addEventListener('scroll', update);
		return () => {
			container?.removeEventListener('scroll', update);
			scrollSmooth = false;
		};
	});

	$effect(() => {
		// Close and recreate thread if id changes
		if (thread && thread.threadID !== id) {
			thread?.close?.();
			thread = undefined;
			messages = {
				messages: [],
				inProgress: false
			};
		}

		if (id && !thread) {
			constructThread();
		}
	});

	let scrollControls = $state<StickToBottomControls>();

	onDestroy(() => {
		thread?.close?.();
	});

	const layout = getLayout();
	function onLoadFile(filename: string) {
		EditorService.load(items, project, filename, {
			threadID: id
		});
		layout.fileEditorOpen = true;
	}

	async function ensureThread() {
		if (!id) {
			id = (await ChatService.createThread(project.assistantID, project.id)).id;
			await constructThread();
		}
	}

	async function constructThread() {
		const newThread = new Thread(project, {
			threadID: id,
			onError: () => {
				// ignore errors they are rendered as messages
			}
		});

		messages = {
			messages: [],
			inProgress: false
		};
		newThread.onMessages = (newMessages) => {
			messages = newMessages;
		};

		thread = newThread;
	}

	function onSendCredentials(id: string, credentials: Record<string, string>) {
		thread?.sendCredentials(id, credentials);
	}
</script>

<div class="relative w-full">
	<div
		bind:this={container}
		class="flex h-full grow justify-center overflow-y-auto scrollbar-none"
		class:scroll-smooth={scrollSmooth}
		use:sticktobottom={{
			contentEl: messagesDiv,
			setControls: (controls) => (scrollControls = controls)
		}}
	>
		<div
			in:fade|global
			bind:this={messagesDiv}
			class="flex h-fit w-full max-w-[1000px] flex-col justify-start gap-8 p-5 transition-all"
			class:justify-center={!thread}
		>
			<div class="message-content self-center">
				{#if project?.introductionMessage}
					{@html toHTMLFromMarkdown(project?.introductionMessage)}
				{/if}
			</div>
			<div class="grid gap-2 self-center md:grid-cols-3">
				{#if thread}
					{#each project.starterMessages ?? [] as msg}
						<button
							class="rounded-3xl border-2 border-blue p-5 hover:bg-surface1"
							onclick={() => {
								thread?.invoke(msg);
							}}
						>
							{msg}
						</button>
					{/each}
				{/if}
			</div>
			{#each messages.messages as msg}
				<Message
					{project}
					{msg}
					{onLoadFile}
					{onSendCredentials}
					onSendCredentialsCancel={() => thread?.abort()}
				/>
			{/each}
			<div class="min-h-28">
				<!-- Vertical Spacer -->
			</div>
		</div>
		<div
			class="absolute inset-x-0 bottom-0 z-10 flex justify-center bg-gradient-to-t from-white px-3 pb-8 pt-10 dark:from-black"
		>
			<Input
				readonly={messages.inProgress}
				pending={thread?.pending}
				onAbort={async () => {
					await thread?.abort();
				}}
				onSubmit={async (i) => {
					await ensureThread();
					scrollControls?.stickToBottom();
					await thread?.invoke(i);
				}}
				bind:items
			/>
		</div>
	</div>
</div>
