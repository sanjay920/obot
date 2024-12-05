function resize(node: HTMLTextAreaElement) {
	node.style.height = 'auto';
	// not totally sure why 4 is needed here, otherwise the textarea is too small and we
	// get a scrollbar
	node.style.height = (node.scrollHeight < 44 ? 44 : node.scrollHeight) + 4 + 'px';
	console.log('resize', node.scrollHeight, node.style.height);
}

export function autoHeight(node: HTMLTextAreaElement) {
	node.onkeyup = () => resize(node);
	node.onfocus = () => resize(node);
	node.oninput = () => resize(node);
	node.onresize = () => resize(node);
}
