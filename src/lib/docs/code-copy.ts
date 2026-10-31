import type { Action } from 'svelte/action';

interface Labels {
	copy: string;
	copied: string;
	/** Changes whenever the article's HTML does, so buttons are added to the new code blocks. */
	key: string;
}

/** Adds a copy button to every rendered code block inside the node. */
export const codeCopy: Action<HTMLElement, Labels> = (node, labels) => {
	let current = labels;

	function enhance() {
		for (const figure of node.querySelectorAll<HTMLElement>('figure.doc-code')) {
			if (figure.querySelector('.copy-button')) continue;
			let bar = figure.querySelector<HTMLElement>('.window-bar');
			if (!bar) {
				bar = document.createElement('figcaption');
				bar.className = 'window-bar';
				figure.prepend(bar);
			}
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'copy-button';
			button.textContent = current.copy;
			button.addEventListener('click', async () => {
				const code = figure.querySelector('pre')?.innerText ?? '';
				try {
					await navigator.clipboard.writeText(code.replace(/\n$/, ''));
					button.textContent = current.copied;
					button.classList.add('done');
					setTimeout(() => {
						button.textContent = current.copy;
						button.classList.remove('done');
					}, 1600);
				} catch {
					// Clipboard access can be refused; the code stays selectable.
				}
			});
			bar.append(button);
		}
	}

	enhance();
	return {
		update(next) {
			current = next;
			enhance();
		}
	};
};
