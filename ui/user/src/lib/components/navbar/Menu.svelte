<script lang="ts">
	import { popover } from '$lib/actions';
	import type { Snippet } from 'svelte';

	interface Props {
		onLoad?: () => void | Promise<void>;
		icon: Snippet;
		body: Snippet;
		title: string;
		description?: string;
	}

	let { onLoad, icon, body, title, description }: Props = $props();
	const { ref, tooltip, toggle, open } = popover({
		placement: 'bottom'
	});

	export { toggle, open };
</script>

<button
	use:ref
	class="icon-button z-20"
	onclick={async () => {
		await onLoad?.();
		toggle();
	}}
	type="button"
>
	{@render icon()}
</button>

<div
	use:tooltip
	class="flex w-96 flex-col divide-y
	divide-gray-200
	rounded-3xl
	 bg-gray-50 p-6 shadow-md dark:divide-gray-700 dark:bg-gray-950"
>
	<div class="mb-4">
		{title}
		{#if description}
			<p class="mt-1 text-xs font-normal text-gray-700 dark:text-gray-300">{description}</p>
		{/if}
	</div>
	{@render body()}
</div>
