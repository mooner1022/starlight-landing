import { page } from '$app/state';
import type { Channel } from '#lib/versions.ts';
import type { IconName } from '#lib/components/Icon.svelte';
import type { DocCategory, DocSection } from '#lib/docs/types.ts';

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
		play: 'Google Play에서 받기',
		apk: 'APK 내려받기',
		unavailable: 'GitHub에서 받기',
		note: 'Android 8.0 이상 · 무료',
		source: 'GPL-3.0 오픈소스',
		mockupAlt: 'StarLight 앱의 홈 화면과 프로젝트 목록 화면',
		scroll: '스크롤'
	},
	features: {
		eyebrow: '기능',
		title: '봇을 만들고 돌보는 일, 앱 하나로',
		lead: '스크립트를 쓰고, 고치고, 지켜보는 일을 폰 안에서 끝낼 수 있어요.',
		items: [
			{
				icon: 'sparkles',
				title: 'StarLight AI',
				body: '직접 연결한 AI와 대화하며 봇을 만들어요. 코드를 쓰고 고치고, 디버그 룸에서 시험까지 해 줘요.'
			},
			{
				icon: 'layers',
				title: '프로젝트 단위 관리',
				body: '봇마다 프로젝트를 따로 두고, 스위치 하나로 켜고 꺼요. zip 파일로 내보내 옮길 수도 있어요.'
			},
			{
				icon: 'code',
				title: '앱 안의 코드 에디터',
				body: '자동 완성, 문법 검사, 찾기·바꾸기를 갖춘 에디터로 폰에서 바로 스크립트를 고쳐요.'
			},
			{
				icon: 'zap',
				title: 'NeonJS 엔진',
				body: '직접 개발한 NeonJS 엔진으로 ES2025 문법과 모듈, fetch를 쓰고, 코드 최적화로 더 빠르게 실행해요.'
			},
			{
				icon: 'plug',
				title: '플러그인 플랫폼',
				body: '플러그인 스토어에서 새 언어와 API, 다른 메신저 연동을 더해요. 플러그인은 GitHub 판에서 쓸 수 있어요.'
			},
			{
				icon: 'history',
				title: '메신저봇 호환',
				body: '익숙한 response(room, msg, sender, …) 함수와 API2의 BotManager로 쓴 스크립트도 돌아가요.'
			}
		] satisfies { icon: IconName; title: string; body: string }[],
		extrasLabel: '그 밖에도',
		extras: [
			'사진·파일 보내기',
			'디버그 룸에서 테스트',
			'홈 화면 위젯과 로그',
			'.env 환경 변수 로드',
			'방 ID로 메시지 보내기',
			'태블릿 · 폴더블 화면'
		]
	},
	code: {
		eyebrow: '익숙한 코드 그대로',
		title: '쓰던 스크립트를 옮겨 오세요',
		body: '메신저봇 레거시 방식의 response 함수 하나로 바로 시작할 수 있어요. 메시지가 도착하면 StarLight가 이 함수를 불러 줘요.',
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
		body: 'StarLight 플러그인(.slp)은 매니페스트를 담은 안드로이드 APK예요. 전용 Gradle 플러그인이 빌드부터 검증, 기기 배포까지 맡아요. 플러그인은 GitHub 판 StarLight에서 불러와요.',
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
		lead: 'Google Play에서 설치하세요. 플러그인이 필요하면 GitHub 판 APK를 내려받으면 돼요.',
		steps: [
			{ title: '설치하기', body: 'Google Play에서 설치하거나, APK를 내려받아 열어요.' },
			{
				title: '권한 허용하기',
				body: '앱이 안내하는 알림 접근 등의 권한을 허용해요.'
			},
			{ title: '첫 봇 만들기', body: '프로젝트를 만들고 디버그 룸에서 시험해 봐요.' }
		],
		play: {
			name: 'Google Play',
			body: 'Google Play가 업데이트를 맡아요. 플러그인은 쓸 수 없어요.',
			get: '설치하기'
		},
		apk: {
			title: 'GitHub 판 (APK)',
			body: '플러그인과 앱 내 업데이트를 쓸 수 있어요. Google Play 판과 한 기기에 함께 설치할 수는 없어요.'
		},
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
		installHint: "설치할 때 '출처를 알 수 없는 앱 설치'를 허용해야 할 수 있어요. Google Play 판과는 한 기기에 함께 설치할 수 없어요.",
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
		body: 'StarLight는 사용자의 개인정보를 수집하지 않으며, 개발자의 서버로 데이터를 보내지 않습니다. 이 방침은 StarLight 앱(Google Play 판과 GitHub 판)이 데이터를 다루는 방식을 설명합니다.',
		effective: '시행일: 2026년 11월 6일',
		sections: [
			{
				title: '메시지와 알림',
				body: [
					'봇이 메시지를 받을 수 있도록 알림 접근 권한으로 메신저 앱의 알림을 읽습니다. 설정에서 켠 경우에는 다른 앱의 알림도 읽습니다.',
					'알림의 내용은 기기 안에서 사용자의 봇 프로젝트로 전달되며, StarLight는 이를 개발자의 서버로 보내지 않습니다.'
				]
			},
			{
				title: '기기에 저장하는 데이터',
				body: [
					'프로젝트, 로그, 설정, AI 대화 기록은 기기에만 저장합니다. GitHub 판은 내장 저장소의 StarLight 폴더에, Google Play 판은 앱 전용 폴더에 저장합니다.',
					'AI 서비스의 API 키와 로그인 토큰은 Android Keystore의 키로 암호화해 앱 전용 저장소에 보관합니다.'
				]
			},
			{
				title: 'AI 기능 (선택)',
				body: [
					'StarLight AI를 사용하면 대화 내용, 첨부한 파일, 에이전트가 작업 중에 읽은 프로젝트 파일과 로그가 사용자가 연결한 AI 서비스(Anthropic, OpenAI, ChatGPT 계정, Google Gemini, OpenRouter, 사용자가 지정한 OpenAI 호환 서버)로 전송됩니다. 전송된 데이터는 해당 서비스의 개인정보 처리방침과 이용 약관을 따릅니다.',
					'에이전트가 웹 페이지를 읽을 때는 기기가 그 페이지에 직접 접속합니다. AI 기능을 사용하지 않으면 이러한 전송은 일어나지 않습니다.'
				]
			},
			{
				title: '앱이 접속하는 서버',
				body: [
					'GitHub 판은 새 버전과 변경 사항을 확인하고 플러그인 스토어의 목록과 플러그인 파일을 받기 위해 GitHub에 접속합니다. 이 요청에는 사용자의 데이터를 담지 않습니다.',
					'Google Play 판은 이 서버에 접속하지 않으며, 업데이트는 Google Play를 통해 이루어집니다.'
				]
			},
			{
				title: '스크립트와 플러그인',
				body: [
					'사용자가 작성하거나 설치한 스크립트와 플러그인은 인터넷에 접속하거나 데이터를 다룰 수 있습니다. 그 동작은 스크립트 작성자와 플러그인 개발자가 정하며, 이 방침의 범위에 포함되지 않습니다.'
				]
			},
			{
				title: '분석, 광고, 오류 보고',
				body: [
					'StarLight에는 분석 도구, 광고, 사용자 추적 기능이 없습니다.',
					'앱에 오류가 나면 오류 보고를 기기에 표시하며, 사용자가 직접 공유할 때만 기기 밖으로 전송됩니다.'
				]
			}
		],
		contactBefore: '개인정보와 관련한 문의는 ',
		contactLink: 'GitHub 이슈',
		contactAfter: '로 남겨 주세요.',
		back: '홈으로'
	},
	docs: {
		title: '문서',
		metaSuffix: 'StarLight 문서',
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
		categoryLabel: '문서 분류',
		categories: {
			app: '앱 사용법',
			neonjs: 'NeonJS',
			plugins: '플러그인 개발'
		} satisfies Record<DocCategory, string>,
		sections: {
			start: '시작하기',
			guides: '가이드',
			reference: '레퍼런스',
			sdk: 'SDK'
		} satisfies Record<DocSection, string>,
		sdk: {
			title: '최신 SDK',
			channel: 'StarLight 1.0.0',
			channelNote: 'StarLight 1.0.0에 들어 있는 버전이에요. 이전 앱(0.3.4b)에는 PluginCore 0.3.2가 들어 있고, Google Play 판은 플러그인을 불러오지 않아요.',
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
		play: 'Get it on Google Play',
		apk: 'Download the APK',
		unavailable: 'Get it on GitHub',
		note: 'Android 8.0+ · Free',
		source: 'GPL-3.0 open source',
		mockupAlt: 'StarLight home screen and project list',
		scroll: 'Scroll'
	},
	features: {
		eyebrow: 'Features',
		title: 'Build and run your bots in one app',
		lead: 'Write, fix and monitor your scripts without leaving your phone.',
		items: [
			{
				icon: 'sparkles',
				title: 'StarLight AI',
				body: 'Build bots by chatting with the AI service you connect. It writes and fixes the code, then tries it in the debug room.'
			},
			{
				icon: 'layers',
				title: 'Projects',
				body: 'Keep each bot in its own project and turn it on or off with a single switch. Export it as a zip file to move it.'
			},
			{
				icon: 'code',
				title: 'Built-in code editor',
				body: 'Edit scripts right on your phone with completion, linting and find and replace.'
			},
			{
				icon: 'zap',
				title: 'NeonJS engine',
				body: 'Our own NeonJS engine brings ES2025 syntax, modules and fetch, with code optimization for faster runs.'
			},
			{
				icon: 'plug',
				title: 'Plugin platform',
				body: 'Add languages, APIs and other messengers from the plugin store. Plugins work in the GitHub build.'
			},
			{
				icon: 'history',
				title: 'MessengerBot compatibility',
				body: 'Scripts written with the familiar response(room, msg, sender, …) function or API2’s BotManager run too.'
			}
		],
		extrasLabel: 'And also',
		extras: [
			'Send photos and files',
			'Test in the debug room',
			'Home screen widgets and logs',
			'Load .env variables',
			'Send messages by room ID',
			'Tablet and foldable layouts'
		]
	},
	code: {
		eyebrow: 'Familiar code',
		title: 'Bring your existing scripts',
		body: 'With MessengerBot’s legacy style, a single response function is all you need. StarLight calls it whenever a message arrives.',
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
		body: 'A StarLight plugin (.slp) is an Android APK with a manifest. The Gradle plugin takes care of building, validating and deploying it to your device. Plugins load in the GitHub build of StarLight.',
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
		lead: 'Install it from Google Play. If you need plugins, download the GitHub build’s APK instead.',
		steps: [
			{ title: 'Install', body: 'Install it from Google Play, or download the APK and open it.' },
			{
				title: 'Grant permissions',
				body: 'Allow notification access and the other permissions the app asks for.'
			},
			{
				title: 'Make your first bot',
				body: 'Create a project and try it in the debug room.'
			}
		],
		play: {
			name: 'Google Play',
			body: 'Google Play keeps it up to date. Plugins aren’t available.',
			get: 'Install'
		},
		apk: {
			title: 'GitHub build (APK)',
			body: 'Supports plugins and in-app updates. It can’t be installed alongside the Google Play build.'
		},
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
		installHint: 'You may need to allow installing apps from unknown sources. It can’t be installed alongside the Google Play build.',
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
		body: 'StarLight does not collect personal information or send data to the developer’s servers. This policy describes how the StarLight app (the Google Play and GitHub builds) handles data.',
		effective: 'Effective November 6, 2026',
		sections: [
			{
				title: 'Messages and notifications',
				body: [
					'To let bots receive messages, StarLight reads messenger notifications with notification access. If you turn it on in the settings, it also reads other apps’ notifications.',
					'Notification content is passed to your bot projects on the device, and StarLight does not send it to the developer’s servers.'
				]
			},
			{
				title: 'Data stored on the device',
				body: [
					'Projects, logs, settings and AI conversations are stored only on the device: in the StarLight folder of the internal storage for the GitHub build, and in the app-specific folder for the Google Play build.',
					'API keys and sign-in tokens for AI services are encrypted with a key in the Android Keystore and kept in the app’s private storage.'
				]
			},
			{
				title: 'AI features (optional)',
				body: [
					'When you use StarLight AI, your conversation, the files you attach, and the project files and logs the agent reads while working are sent to the AI service you connect (Anthropic, OpenAI, a ChatGPT account, Google Gemini, OpenRouter or an OpenAI-compatible server you specify). That data is subject to the service’s privacy policy and terms.',
					'When the agent reads a web page, the device connects to that page directly. If you don’t use the AI features, none of this is sent.'
				]
			},
			{
				title: 'Servers the app connects to',
				body: [
					'The GitHub build connects to GitHub to check for new versions and changelogs, and to get the plugin store’s list and plugin files. These requests carry none of your data.',
					'The Google Play build doesn’t connect to these servers; Google Play handles its updates.'
				]
			},
			{
				title: 'Scripts and plugins',
				body: [
					'Scripts you write and plugins you install can connect to the internet and handle data. What they do is up to their authors and is outside the scope of this policy.'
				]
			},
			{
				title: 'Analytics, ads and error reports',
				body: [
					'StarLight has no analytics, ads or user tracking.',
					'When the app runs into an error, it shows the error report on the device. The report leaves the device only if you share it.'
				]
			}
		],
		contactBefore: 'For questions about privacy, open a ',
		contactLink: 'GitHub issue',
		contactAfter: '.',
		back: 'Back to home'
	},
	docs: {
		title: 'Docs',
		metaSuffix: 'StarLight docs',
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
		categoryLabel: 'Docs categories',
		categories: {
			app: 'Using the app',
			neonjs: 'NeonJS',
			plugins: 'Plugin development'
		},
		sections: {
			start: 'Getting started',
			guides: 'Guides',
			reference: 'Reference',
			sdk: 'SDK'
		},
		sdk: {
			title: 'Latest SDK',
			channel: 'StarLight 1.0.0',
			channelNote: 'The version in StarLight 1.0.0. The previous app (0.3.4b) ships PluginCore 0.3.2, and the Google Play build doesn’t load plugins.',
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
