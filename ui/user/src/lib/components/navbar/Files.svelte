<script lang="ts">
	import { FileText, Trash } from '$lib/icons';
	import { files, currentAssistant } from '$lib/stores';
	import { ChatService, EditorService } from '$lib/services';
	import Modal from '$lib/components/Modal.svelte';
	import Menu from '$lib/components/navbar/Menu.svelte';
	import { Image } from 'lucide-svelte';

	async function loadFiles() {
		files.set(await ChatService.listFiles($currentAssistant.id));
	}

	async function deleteFile() {
		if (!fileToDelete) {
			return;
		}
		await ChatService.deleteFile($currentAssistant.id, fileToDelete);
		await loadFiles();
		fileToDelete = undefined;
	}

	let fileToDelete = $state<string | undefined>();
	let menu = $state<ReturnType<typeof Menu>>();
</script>

<Menu bind:this={menu} title="Files" description="Click to view or edit files" onLoad={loadFiles}>
	{#snippet icon()}
		<FileText class="h-5 w-5" />
	{/snippet}
	{#snippet body()}
		{#if $files.items.length === 0}
			<p class="pb-3 pt-6 text-center text-sm text-gray dark:text-gray-300">No files</p>
		{:else}
			<ul class="space-y-4 px-3 py-6 text-sm">
				{#each $files.items as file}
					<li class="group">
						<div class="flex">
							<button
								class="flex flex-1 items-center"
								onclick={async () => {
									await EditorService.load($currentAssistant.id, file.name);
									menu?.open.set(false);
								}}
							>
								{#if file.name.toLowerCase().endsWith('.png')}
									<Image class="h-5 w-5" />
								{:else}
									<FileText class="h-5 w-5" />
								{/if}
								<span class="ms-3">{file.name}</span>
							</button>
							<button
								class="hidden group-hover:block"
								onclick={() => {
									fileToDelete = file.name;
								}}
							>
								<Trash class="h-5 w-5 text-gray" />
							</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	{/snippet}
</Menu>

<Modal
	show={fileToDelete !== undefined}
	msg={`Are you sure you want to delete ${fileToDelete}?`}
	onsuccess={deleteFile}
	oncancel={() => (fileToDelete = undefined)}
/>
