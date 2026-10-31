import { page } from '$app/state';
import type { Channel } from '#lib/versions.ts';
import type { IconName } from '#lib/components/Icon.svelte';

export type Locale = 'ko' | 'en';

const ko = {
	meta: {
		title: 'StarLight — 스크립트로 만드는 메신저 자동응답',
		description:
			'StarLight는 자바스크립트와 플러그인으로 확장할 수 있는 안드로이드 메신저 자동응답 앱이에요.',
		privacyTitle: '개인정보 처리방침 — StarLight'
	},
	nav: {
		skip: '본문으로 건너뛰기',
		home: 'StarLight 홈',
		features: '기능',
		code: '코드',
		plugins: '플러그인',
		download: '다운로드',
		docs: '문서',
		switchLang: 'EN',
		switchLangLabel: 'View in English',
		toLight: '라이트 모드로 전환',
		toDark: '다크 모드로 전환',
		sections: '섹션'
	},
	sections: {
		home: '홈',
		features: '기능',
		code: '코드',
		plugins: '플러그인',
		download: '다운로드',
		openSource: '오픈소스'
	},
	hero: {
		eyebrow: 'Project StarLight · Android',
		title: ['스크립트로 움직이는', '메신저 자동응답'],
		lead: '자바스크립트로 응답 규칙을 만들고, 플러그인으로 기능을 넓혀 보세요.',
		download: '다운로드',
		unavailable: 'GitHub에서 받기',
		source: '소스 코드',
		note: 'Android 전용 · 무료 · GPL-3.0 오픈소스',
		mockupAlt: 'StarLight 앱의 홈 화면과 프로젝트 목록 화면',
		scroll: '스크롤'
	},
	features: {
		eyebrow: '기능',
		title: '봇을 만들고 돌보는 일, 앱 하나로',
		lead: '스크립트를 쓰고, 고치고, 지켜보는 일을 폰 안에서 끝낼 수 있어요.',
		items: [
			{
				icon: 'layers',
				title: '프로젝트 단위 관리',
				body: '봇마다 프로젝트를 따로 두고, 스위치 하나로 켜고 끌 수 있어요.'
			},
			{
				icon: 'code',
				title: '앱 안의 코드 에디터',
				body: '파일 트리와 탭을 갖춘 에디터로 폰에서 바로 스크립트를 고쳐요.'
			},
			{
				icon: 'zap',
				title: 'NeonJS 엔진',
				body: '직접 개발한 NeonJS 엔진으로 ES2025 문법과 모듈, fetch를 쓰고, 코드 최적화로 더 빠르게 실행해요.'
			},
			{
				icon: 'plug',
				title: '플러그인 플랫폼',
				body: '플러그인으로 새로운 언어와 API를 더해 앱을 원하는 대로 넓혀요.'
			},
			{
				icon: 'history',
				title: '레거시 호환 모드',
				body: '익숙한 response(room, msg, sender, …) 형식의 스크립트도 그대로 돌아가요.'
			},
			{
				icon: 'activity',
				title: '로그와 업타임',
				body: '프로젝트 로그와 실행 시간을 홈 화면에서 한눈에 확인해요.'
			}
		] satisfies { icon: IconName; title: string; body: string }[],
		extrasLabel: '그 밖에도',
		extras: [
			'.env 환경 변수 로드',
			'디버그룸에서 테스트',
			'방 ID로 메시지 보내기',
			'업데이트 확인과 변경 사항 보기',
			'태블릿 · 폴더블 화면'
		]
	},
	code: {
		eyebrow: '익숙한 코드 그대로',
		title: '쓰던 스크립트를 옮겨 오세요',
		body: '레거시 호환 모드에서는 response 함수 하나로 바로 시작할 수 있어요. 메시지가 도착하면 StarLight가 이 함수를 불러 줘요.',
		points: [
			'room, msg, sender 같은 익숙한 인자를 그대로 받아요',
			'replier.reply()로 같은 방에 바로 답장해요',
			'Promise, BigInt 등 ES6 문법을 함께 쓸 수 있어요'
		],
		comment: '메시지가 올 때마다 호출돼요'
	},
	plugins: {
		eyebrow: '플러그인 개발',
		title: 'Kotlin으로 플러그인을 만들어 보세요',
		body: 'StarLight 플러그인(.slp)은 매니페스트를 담은 안드로이드 APK예요. 전용 Gradle 플러그인이 빌드부터 검증, 기기 배포까지 맡아요.',
		points: [
			'빌드 변형마다 .slp 파일로 패키징',
			'starlight.json 매니페스트 생성과 검증',
			'런타임에야 드러나던 문제를 빌드 오류로 미리 확인',
			'adb로 배포하고 앱 재시작, 로그캣까지 한 번에'
		],
		docs: '개발 문서 보기',
		link: 'Gradle 플러그인 보기',
		deployComment: '기기에 배포하고 StarLight 재시작'
	},
	download: {
		eyebrow: '다운로드',
		title: '지금 바로 시작하세요',
		lead: '안드로이드 기기에서 APK를 내려받아 설치하면 돼요.',
		steps: [
			{ title: 'APK 내려받기', body: '원하는 채널을 골라 내려받아요.' },
			{
				title: '설치 허용하기',
				body: "처음이라면 '출처를 알 수 없는 앱 설치'를 허용해야 할 수 있어요."
			},
			{ title: '초기 설정 마치기', body: '앱이 안내하는 권한을 허용하고 첫 프로젝트를 만들어요.' }
		],
		channels: {
			release: { name: '정식', body: '가장 오래 검증된 안정 빌드예요.' },
			beta: { name: '베타', body: '새 기능이 먼저 들어오는 빌드예요.' },
			snapshot: { name: '스냅샷', body: '개발 중인 최신 빌드예요. 불안정할 수 있어요.' }
		} satisfies Record<Channel, { name: string; body: string }>,
		recommended: '추천',
		get: '내려받기',
		unavailable: '버전 정보를 불러오지 못했어요.',
		changelogTitle: '최근 변경 사항',
		changelogAll: '전체 변경 이력',
		changelogNote: '',
		changelogUnavailable: '변경 사항을 불러오지 못했어요.'
	},
	dialog: {
		chooseTitle: '버전 선택',
		chooseLead: '설치할 빌드를 골라 주세요.',
		download: '내려받기',
		cancel: '취소',
		title: '다운로드가 시작됐어요',
		retryBefore: '자동으로 시작되지 않았다면 ',
		retryLink: '여기',
		retryAfter: '를 눌러 주세요.',
		installHint: "설치할 때 '출처를 알 수 없는 앱 설치'를 허용해야 할 수 있어요.",
		close: '확인'
	},
	openSource: {
		title: 'StarLight는 오픈소스예요',
		body: 'GPL-3.0 라이선스로 공개되어 있어요. 버그 제보와 PR은 언제나 환영하고, 최신 개발 내용은 nightly 브랜치에서 볼 수 있어요.',
		github: 'GitHub에서 보기',
		privacy: '개인정보 처리방침'
	},
	footer: {
		licenseBefore: '소스 코드는 ',
		licenseMiddle: ', 웹사이트 콘텐츠는 ',
		licenseAfter: ' 라이선스를 따라요.',
		privacy: '개인정보 처리방침',
		websiteSource: '웹사이트 소스'
	},
	privacy: {
		eyebrow: '개인정보 처리방침',
		title: '앱의 개인정보 사용에 관한 내용',
		body: '이 애플리케이션은 업데이트 확인을 위한 서버 접속 이외에 인터넷을 직접적으로 사용하지 않으며, 사용자의 데이터를 수집하지 않습니다.',
		back: '홈으로'
	},
	docs: {
		title: '플러그인 개발 문서',
		metaSuffix: 'StarLight 플러그인 문서',
		navLabel: '문서 목차',
		search: '문서 검색',
		noResults: '일치하는 문서가 없어요.',
		onThisPage: '이 페이지에서',
		prev: '이전',
		next: '다음',
		edit: 'GitHub에서 이 문서 수정하기',
		fallback: '',
		copy: '복사',
		copied: '복사됨',
		sections: {
			start: '시작하기',
			guides: '가이드',
			reference: 'API 레퍼런스',
			sdk: 'SDK'
		},
		sdk: {
			title: '최신 SDK',
			channel: 'nightly',
			channelNote: 'StarLight nightly 빌드 기준이에요. 정식 앱(0.3.4b)에는 PluginCore 0.3.2가 들어 있어요.',
			preparing: '준비 중',
			download: '내려받기',
			plugincore: '플러그인 기본 클래스, 이벤트, 프로젝트, 위젯 API',
			configdsl: '플러그인 설정 화면을 만드는 DSL',
			bundled: 'PluginCore와 함께 배포',
			notice: 'SDK 파일 배포는 아직 준비 중이에요. 지금은 StarLight 저장소에서 직접 빌드해 주세요.'
		}
	}
};

export type Messages = typeof ko;

const en: Messages = {
	meta: {
		title: 'StarLight — Scriptable messenger auto-reply',
		description:
			'StarLight is an Android messenger auto-reply app you can extend with JavaScript and plugins.',
		privacyTitle: 'Privacy Policy — StarLight'
	},
	nav: {
		skip: 'Skip to content',
		home: 'StarLight home',
		features: 'Features',
		code: 'Code',
		plugins: 'Plugins',
		download: 'Download',
		docs: 'Docs',
		switchLang: '한국어',
		switchLangLabel: '한국어로 보기',
		toLight: 'Switch to light mode',
		toDark: 'Switch to dark mode',
		sections: 'Sections'
	},
	sections: {
		home: 'Home',
		features: 'Features',
		code: 'Code',
		plugins: 'Plugins',
		download: 'Download',
		openSource: 'Open source'
	},
	hero: {
		eyebrow: 'Project StarLight · Android',
		title: ['Messenger auto-reply,', 'powered by scripts'],
		lead: 'Write reply rules in JavaScript, then extend the app with plugins.',
		download: 'Download',
		unavailable: 'Get it on GitHub',
		source: 'Source code',
		note: 'Android only · Free · GPL-3.0 open source',
		mockupAlt: 'StarLight home screen and project list',
		scroll: 'Scroll'
	},
	features: {
		eyebrow: 'Features',
		title: 'Build and run your bots in one app',
		lead: 'Write, fix and monitor your scripts without leaving your phone.',
		items: [
			{
				icon: 'layers',
				title: 'Projects',
				body: 'Keep each bot in its own project and turn it on or off with a single switch.'
			},
			{
				icon: 'code',
				title: 'Built-in code editor',
				body: 'Edit scripts right on your phone in an editor with a file tree and tabs.'
			},
			{
				icon: 'zap',
				title: 'NeonJS engine',
				body: 'Our own NeonJS engine brings ES2025 syntax, modules and fetch, with code optimization for faster runs.'
			},
			{
				icon: 'plug',
				title: 'Plugin platform',
				body: 'Add new languages and APIs through plugins and shape the app around your needs.'
			},
			{
				icon: 'history',
				title: 'Legacy compatibility',
				body: 'Scripts written in the familiar response(room, msg, sender, …) style run as they are.'
			},
			{
				icon: 'activity',
				title: 'Logs and uptime',
				body: 'See project logs and how long everything has been running, right on the home screen.'
			}
		],
		extrasLabel: 'And also',
		extras: [
			'Load .env variables',
			'Test in the debug room',
			'Send messages by room ID',
			'Update checks with changelogs',
			'Tablet and foldable layouts'
		]
	},
	code: {
		eyebrow: 'Familiar code',
		title: 'Bring your existing scripts',
		body: 'In legacy compatibility mode, a single response function is all you need. StarLight calls it whenever a message arrives.',
		points: [
			'Receives the familiar arguments: room, msg, sender and more',
			'Reply to the same room with replier.reply()',
			'Use ES6 syntax such as Promise and BigInt'
		],
		comment: 'Called for every incoming message'
	},
	plugins: {
		eyebrow: 'Plugin development',
		title: 'Build plugins in Kotlin',
		body: 'A StarLight plugin (.slp) is an Android APK with a manifest. The Gradle plugin takes care of building, validating and deploying it to your device.',
		points: [
			'Packages every build variant as an .slp file',
			'Generates and validates the starlight.json manifest',
			'Turns problems that would only show up at runtime into build errors',
			'Deploys with adb, restarts the app and streams logcat'
		],
		docs: 'Read the developer docs',
		link: 'View the Gradle plugin',
		deployComment: 'Deploy to the device and restart StarLight'
	},
	download: {
		eyebrow: 'Download',
		title: 'Get started now',
		lead: 'Download the APK on your Android device and install it.',
		steps: [
			{ title: 'Download the APK', body: 'Pick a channel and download it.' },
			{
				title: 'Allow the install',
				body: 'You may need to allow installing apps from unknown sources the first time.'
			},
			{
				title: 'Finish the setup',
				body: 'Grant the permissions the app asks for and create your first project.'
			}
		],
		channels: {
			release: { name: 'Release', body: 'The most thoroughly tested, stable build.' },
			beta: { name: 'Beta', body: 'New features land here first.' },
			snapshot: { name: 'Snapshot', body: 'The latest development build. It may be unstable.' }
		},
		recommended: 'Recommended',
		get: 'Download',
		unavailable: 'Could not load version info.',
		changelogTitle: 'Recent changes',
		changelogAll: 'Full changelog',
		changelogNote: 'The changelog is written in Korean.',
		changelogUnavailable: 'Could not load the changelog.'
	},
	dialog: {
		chooseTitle: 'Choose a version',
		chooseLead: 'Pick the build you want to install.',
		download: 'Download',
		cancel: 'Cancel',
		title: 'Your download has started',
		retryBefore: "If it didn't start automatically, ",
		retryLink: 'click here',
		retryAfter: '.',
		installHint: 'You may need to allow installing apps from unknown sources.',
		close: 'OK'
	},
	openSource: {
		title: 'StarLight is open source',
		body: 'It is released under the GPL-3.0 license. Bug reports and pull requests are always welcome, and the latest work happens on the nightly branch.',
		github: 'View on GitHub',
		privacy: 'Privacy policy'
	},
	footer: {
		licenseBefore: 'Source code is licensed under ',
		licenseMiddle: ' and site content under ',
		licenseAfter: '.',
		privacy: 'Privacy policy',
		websiteSource: 'Website source'
	},
	privacy: {
		eyebrow: 'Privacy policy',
		title: 'How the app handles personal information',
		body: 'This application does not use or collect personal information from users, and does not connect to the network directly except when checking for updates.',
		back: 'Back to home'
	},
	docs: {
		title: 'Plugin developer docs',
		metaSuffix: 'StarLight plugin docs',
		navLabel: 'Docs navigation',
		search: 'Search docs',
		noResults: 'No pages match.',
		onThisPage: 'On this page',
		prev: 'Previous',
		next: 'Next',
		edit: 'Edit this page on GitHub',
		fallback: 'This page is only available in Korean for now.',
		copy: 'Copy',
		copied: 'Copied',
		sections: {
			start: 'Getting started',
			guides: 'Guides',
			reference: 'API reference',
			sdk: 'SDK'
		},
		sdk: {
			title: 'Latest SDK',
			channel: 'nightly',
			channelNote: 'Based on StarLight nightly builds. The released app (0.3.4b) ships PluginCore 0.3.2.',
			preparing: 'Coming soon',
			download: 'Download',
			plugincore: 'Plugin base class, events, projects and widget APIs',
			configdsl: 'DSL for plugin settings screens',
			bundled: 'Released with PluginCore',
			notice: 'SDK downloads are not hosted yet. For now, build them from the StarLight repository.'
		}
	}
};

const messages: Record<Locale, Messages> = { ko, en };

/** The locale of the current page, derived from the optional `[[lang]]` route segment. */
export function getLocale(): Locale {
	return page.params.lang === 'en' ? 'en' : 'ko';
}

export function getMessages(): Messages {
	return messages[getLocale()];
}
