<script lang="ts">
	import type { Messages, Progress } from '$lib/services';
	import { ChatService } from '$lib/services';
	import Message from '$lib/components/messages/Message.svelte';
	import { fade } from 'svelte/transition';
	import { newMessageSource } from '$lib/services/chat/messagesource.js';
	import { onDestroy } from 'svelte';
	import { currentAssistant } from '$lib/stores';

	interface Props {
		onMessages?: (messages: Messages) => void;
		onError: (err: Error) => void;
		onLoadFile: (filename: string) => void;
	}

	let { onMessages, onError, onLoadFile }: Props = $props();

	let progressEvents: Progress[] = [];
	let replayComplete = false;
	let messages: Messages = $state({ messages: [], inProgress: false });
	let close: () => void | undefined;

	$effect(() => {
		if ($currentAssistant.id && !close) {
			close = newMessageSource($currentAssistant.id, handleMessage, {
				onError
			});
		}
	});

	onDestroy(() => {
		close?.();
	});

	function handleMessage(progress: Progress) {
		progressEvents = [...progressEvents, progress];
		if (!replayComplete) {
			replayComplete = progressEvents.find((e) => e.replayComplete) !== undefined;
		}

		if (!replayComplete) {
			return;
		}

		messages = ChatService.progressToMessages(progressEvents);

		// forward the messages to the parent component
		onMessages?.(messages);
	}
</script>

<div in:fade|global class="flex flex-col gap-8">
	{#each messages.messages as msg}
		{#if !msg.ignore}
			<Message {msg} {onLoadFile} />
		{/if}
	{/each}
</div>
