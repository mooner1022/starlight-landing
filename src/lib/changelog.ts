/*
 * A tiny parser for the changelog files in mooner1022/starlight-version.
 * It only understands what those files use (`##`/`###` headings, `+`/`-` lists nested by
 * indentation, inline `code` and plain paragraphs) and produces data instead of HTML,
 * so nothing fetched at runtime is ever injected as markup.
 */

export type Inline = { code: boolean; text: string };

export interface ListItem {
	content: Inline[];
	children: ListItem[];
}

export type Block =
	| { type: 'heading'; content: Inline[] }
	| { type: 'list'; items: ListItem[] }
	| { type: 'paragraph'; lines: Inline[][] };

export interface Release {
	title: string;
	blocks: Block[];
}

function parseInline(text: string): Inline[] {
	return text
		.split('`')
		.map((part, i) => ({ code: i % 2 === 1, text: part }))
		.filter((part) => part.text.length > 0);
}

/** Splits a changelog into releases, newest first, as they appear in the file. */
export function parseChangelog(source: string): Release[] {
	const releases: Release[] = [];
	let release: Release | null = null;
	// Stack of open lists, one entry per indentation level.
	let lists: { indent: number; items: ListItem[] }[] = [];
	let paragraph: Inline[][] | null = null;

	const closeBlocks = () => {
		lists = [];
		paragraph = null;
	};

	for (const raw of source.replace(/\r\n?/g, '\n').split('\n')) {
		const line = raw.trimEnd();

		if (line.startsWith('## ')) {
			release = { title: line.slice(3).trim(), blocks: [] };
			releases.push(release);
			closeBlocks();
			continue;
		}
		if (!release) continue;

		if (line.trim() === '') {
			closeBlocks();
			continue;
		}

		if (line.startsWith('### ')) {
			release.blocks.push({ type: 'heading', content: parseInline(line.slice(4).trim()) });
			closeBlocks();
			continue;
		}

		const item = /^(\s*)[+\-*]\s+(.*)$/.exec(line);
		if (item) {
			paragraph = null;
			const indent = item[1].length;
			const node: ListItem = { content: parseInline(item[2]), children: [] };

			while (lists.length && lists[lists.length - 1].indent > indent) lists.pop();
			const top = lists[lists.length - 1];

			if (!top) {
				const block: Block = { type: 'list', items: [node] };
				release.blocks.push(block);
				lists.push({ indent, items: block.items });
			} else if (indent > top.indent) {
				const parent = top.items[top.items.length - 1];
				parent.children.push(node);
				lists.push({ indent, items: parent.children });
			} else {
				top.items.push(node);
			}
			continue;
		}

		lists = [];
		if (!paragraph) {
			paragraph = [];
			release.blocks.push({ type: 'paragraph', lines: paragraph });
		}
		paragraph.push(parseInline(line.trim()));
	}

	return releases;
}
