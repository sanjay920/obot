<script lang="ts">
	import { profile } from '$lib/stores';
	import Navbar from '$lib/components/Navbar.svelte';
	import Messages from '$lib/components/Messages.svelte';
	import Editor from '$lib/components/Editors.svelte';
	import { EditorService } from '$lib/services';
	import Notifications from '$lib/components/Notifications.svelte';
	import { NotificationMessage } from '$lib/components/Notifications.svelte';
	import { currentAssistant } from '$lib/stores';
	import type { Messages as MessageList } from '$lib/services';
	import Input from '$lib/components/messages/Input.svelte';
	import { autoscroll } from '$lib/actions/div';

	let notification: ReturnType<typeof Notifications>;
	const editorVisible = EditorService.visible;
	const editorMaxSize = EditorService.maxSize;
	let editorIsMax = $derived($editorVisible && $editorMaxSize);

	function handleError(event: Error) {
		notification.addNotification(new NotificationMessage(event));
	}

	function handleLoadFile(e: string) {
		if ($currentAssistant.id) {
			EditorService.load($currentAssistant.id, e);
		}
	}

	let title = $derived($currentAssistant.name ?? '');
	let readonly = $state(false);

	$effect(() => {
		if ($profile.unauthorized) {
			window.location.href = '/oauth2/start?rd=' + window.location.pathname;
		}
	});
</script>

<svelte:head>
	{#if title && title !== 'otto'}
		<title>otto8 - {title}</title>
	{:else}
		<title>otto8</title>
	{/if}
</svelte:head>

<Navbar />

<main id="main-content" class="flex">
	<!-- overflow-auto is here only because when I remove it this pane won't disappear when the editor is max screen. Who knows... CSS sucks. -->
	<!-- these divs suck, but it's so that we have a relative container for the absolute input and the scrollable area is the entire screen and not just
			 the center content. Plus the screen will auto resize as the editor is resized -->
	<div class="relative flex-1 overflow-auto">
		<div
			class="flex h-screen w-full justify-center overflow-auto transition-all scrollbar-none"
			class:opacity-0={editorIsMax}
			class:opacity-100={!editorIsMax}
			use:autoscroll
		>
			<div class="flex max-w-[1000px] flex-col px-8 pt-24 transition-all">
				<Messages
					onError={handleError}
					onLoadFile={handleLoadFile}
					onMessages={(messages: MessageList) => {
						readonly = messages.inProgress;
					}}
				/>
				<div class="h-28 w-full flex-shrink-0"></div>
			</div>
		</div>
		<div
			class="absolute inset-x-0 bottom-0 z-30 flex justify-center bg-gradient-to-t from-white px-3 pb-8 pt-10 dark:from-black"
		>
			<Input assistant={$currentAssistant.id} {readonly} onError={handleError} />
		</div>
	</div>

	{#if $editorVisible}
		<div class="pt-16 transition-all {$editorMaxSize ? 'w-full' : 'w-1/2'} h-screen">
			<Editor />
		</div>
	{/if}

	<Notifications bind:this={notification} />
</main>
