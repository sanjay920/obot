<script lang="ts">
	import { Minimize, Maximize, X } from 'lucide-svelte';
	import { EditorService } from '$lib/services';

	interface Props {
		navBar?: boolean;
	}

	let editorMaxSize = EditorService.maxSize;
	let { navBar = false }: Props = $props();

	let show = $derived(navBar || EditorService.items.length <= 1);
</script>

{#if show}
	<div class="flex">
		{#if $editorMaxSize}
			<button
				class="icon-button"
				onclick={() => {
					editorMaxSize.set(false);
				}}
			>
				<Minimize class="h-5 w-5" />
			</button>
		{:else}
			<button
				class="icon-button"
				onclick={() => {
					editorMaxSize.set(true);
				}}
			>
				<Maximize class="h-5 w-5" />
			</button>
		{/if}
		<button
			class="icon-button"
			onclick={() => {
				EditorService.maxSize.set(false);
				EditorService.visible.set(false);
			}}
		>
			<X class="h-5 w-5" />
		</button>
	</div>
{/if}
