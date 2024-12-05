<script lang="ts">
	import Logo from '$lib/components/navbar/Logo.svelte';
	import DarkModeToggle from '$lib/components/navbar/DarkModeToggle.svelte';
	import Profile from '$lib/components/navbar/Profile.svelte';
	import Tools from '$lib/components/navbar/Tools.svelte';
	import Files from '$lib/components/navbar/Files.svelte';
	import KnowledgeFile from '$lib/components/navbar/KnowledgeFiles.svelte';
	import Tasks from '$lib/components/navbar/Tasks.svelte';
	import { onMount } from 'svelte';

	let showTasks = $state(false);

	onMount(() => {
		showTasks = window.location.href.split('?')[1]?.includes('tasks=1');
	});
</script>

<nav
	class="fixed z-30
w-full
via-80%"
>
	<div class="bg-white px-3 py-3 dark:bg-black lg:px-5 lg:pl-3">
		<div class="flex items-center justify-between">
			<Logo />
			<div class="flex items-center gap-1 pr-2">
				{#if showTasks}
					<Tasks />
				{/if}
				<KnowledgeFile />
				<Files />
				<Tools />
				<DarkModeToggle />
				<Profile />
			</div>
		</div>
	</div>
</nav>
