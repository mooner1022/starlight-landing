---
title: SDK와 변경 사항
description: PluginCore와 ConfigDSL의 최신 버전과 버전별 변경 사항이에요.
section: sdk
layout: sdk
order: 1
---

## 버전별 변경 사항

PluginCore의 버전은 `Info.PLUGINCORE_VERSION`이에요. ConfigDSL은 따로 버전을 매기지 않고 PluginCore와 함께 배포돼요. 플러그인을 새 버전으로 올릴 때 확인하고 고칠 것은 [버전 올리기](/docs/plugins/migration)에 정리했어요.

| 버전 | 날짜 | 포함된 앱 |
|---|---|---|
| **1.1.0** | 예비 사양 | StarLight 1.1.0 스냅샷(nightly) |
| **1.0.1** | 2026-11-06 | StarLight 1.0.1 (현재 정식·베타 앱) |
| 1.0.0 | 2026-10-30 | StarLight 1.0.0 |
| 0.3.3 | 2026-10-30 | nightly 중간 버전 |
| 0.3.2 | 2025-06-05 | StarLight 0.3.4b |
| 0.3.0 | 2024-02-24 | |
| 0.2.0 | 2024-02-08 | StarLight v0.2.0a |
| 0.1.0 | 2022 | |

### 1.1.0

예비 사양 · nightly. StarLight 1.1.0과 함께 배포할 예정이에요. 확정 전이라 내용이 바뀔 수 있어요.

1.0.x용으로 만든 플러그인은 1.1.0에서 수정 없이 불러와져요. 다만 아래 **동작 변경**은 기존 플러그인에도 적용되니 확인하세요. 할 일은 [1.0.x에서 1.1.0으로](/docs/plugins/migration#1.0.x에서-1.1.0으로)에 체크리스트로 정리했어요.

| 구분 | 내용 | 플러그인이 할 일 |
|---|---|---|
| 동작 변경 | [플러그인 로드·언로드 때 리스너 생명주기](/docs/plugins/reference/plugin#수명-주기) | 리스너 `onEnable`/`onDisable` 처리 확인 |
| 동작 변경 | [프로젝트 컴파일은 한 번에 하나](/docs/plugins/reference/projects#컴파일은-한-번에-하나) | `compile` 호출 위치 확인 |
| 동작 변경 | [새 프로젝트 시작 코드를 고르는 방식](/docs/plugins/reference/plugin#새-프로젝트-시작-코드) | 플러그인 언어라면 오버라이드할 메서드 확인 |
| 새 API | [`ProjectEvent`의 새 멤버](/docs/plugins/guides/project-events#선택-멤버), [`ProjectInfoBuilder.allowedEventIds`](/docs/plugins/reference/projects#프로젝트-만들기), [`@RequiresPluginCore`](/docs/plugins/start/build-and-deploy#requiresplugincore) | 선택 |
| 도구 | [Gradle 플러그인 0.4.0이 `api_version`을 코드에서 계산하고 검증](/docs/plugins/start/build-and-deploy#api_version-계산과-검증) | Gradle 플러그인 0.4.0으로 올리기(**강력 권장**) |
| 새 기능 | [StarLight AI가 플러그인 API·이벤트를 보는 방식](/docs/plugins/guides/starlight-ai) | 이름과 패키지 구조 확인 |
| 참고 | [NeonJS 0.1.7과 스레드](/docs/plugins/guides/script-api#스크립트-콜백과-스레드) | 스크립트 콜백을 다른 스레드에서 부르는 API라면 확인 |

**동작 변경**

- 로드가 끝나면 `isEnabled()`가 `true`예요(이전에는 로드된 플러그인도 `false`). `onEnable()` 안에서 `addListener`로 추가한 리스너도 `onEnable`을 받고, 언로드할 때는 모든 리스너가 `onDisable`을 받아요. 로드 후 `setEnabled(true)`는 아무 일도 하지 않아요.
- 같은 프로젝트의 컴파일(`Project.compile`, `compileAsync`)은 누가 시작했든 한 번에 하나만 실행돼요. 앞선 컴파일을 최대 60초 기다린 뒤 실패해요.
- `Language.formatDefaultCode`에 새 프로젝트가 받는 모든 이벤트(`received`)를 받는 3인자 형식이 추가됐어요. 2인자만 오버라이드한 기존 언어는 그대로 동작해요.

**새 API**

- `ProjectEvent.scriptArguments`, `listenerName`, `alternateFunctionName`, `generateCode(generator, name)`: 모두 기본 구현이 있는 `open` 멤버예요.
- `ProjectInfoBuilder.allowedEventIds`: `ProjectManager.newProject { }`로 프로젝트를 만들 때 받을 이벤트를 정해요.
- `@RequiresPluginCore(version)`: PluginCore `version` 이상인 앱에서만 실행되는 코드를 표시해요. 클래스 파일에만 남아서 이 어노테이션이 없는 앱에서도 플러그인이 정상적으로 로드돼요.
- AAR에 클래스와 멤버마다 추가된 버전을 기록한 표(`starlight/plugincore-api.json`)가 들어가요. Gradle 플러그인이 `api_version`을 계산할 때 읽어요.

**도구**

- [StarLight Gradle 플러그인 0.4.0](/docs/plugins/start/build-and-deploy#0.3.x에서-올리기)이 나왔어요. 1.1.0에서 매니페스트 메타데이터와 버전 처리가 여러 가지 바뀌었으니, PluginCore 1.1.0으로 개발한다면 **0.4.0을 쓰는 것을 강력하게 권장해요.** 0.4.0은 코드가 쓰는 PluginCore API로 `api_version`을 계산하고 검증하며, `target_api_version`을 기록해요.

**StarLight AI**

- StarLight AI가 앱에 들어 있던 문서 사본 대신 실행 중인 앱에 등록된 API와 이벤트에서 문서를 만들어요. 플러그인의 API와 이벤트도 함께 보여요. 별도 설정은 필요 없어요.
- 스크립트가 쓰는 PluginCore 타입(`Project`, `ProjectInfo`, `StarlightPlugin`, `PluginInfo`, `Language`와 `chat`, `logger`, `library` 패키지)에 StarLight AI용 KDoc이 붙었어요. 플러그인용 멤버에는 `@suppress`가 붙어 스크립트 문서에서만 숨겨져요. API 자체는 바뀌지 않았어요.

**그 밖의 변경**

- 앱의 NeonJS가 0.1.7로 올라갔어요. 스크립트 콜백을 다른 스레드에서 실행하고 결과를 기다리는 API는 기다리는 동안 컨텍스트를 놓아야 해요.
- 스크립트에서 `Plugins.ofId(id).enabled`가 불러온 플러그인에 대해 `true`를 돌려줘요.
- `StarlightPlugin`의 내부 필드 `originalFile`이 스크립트에 보이지 않아요(`@JvmSynthetic`). 이전에는 스크립트에서 읽고 쓸 수 있었어요.

> [!NOTE]
> 스냅샷 `1.1.0-261107`(versionCode 1000144)부터 위 변경이 모두 들어 있어요. 같은 이름의 앞선 빌드(versionCode 1000142)에는 버전 표와 `@RequiresPluginCore`([#105](https://github.com/mooner1022/StarLight/pull/105))가 없어서, 그 시점의 AAR로는 Gradle 플러그인이 `api_version`을 계산할 수 없어요. 그 전 스냅샷 `1.0.1-261107`(versionCode 1000141)은 #104가 들어 있어도 PluginCore를 `1.0.1`로 보고해서 `api_version`이 `1.1.0`인 플러그인을 불러오지 않아요.

원본: [StarLight#104](https://github.com/mooner1022/StarLight/pull/104), [StarLight#105](https://github.com/mooner1022/StarLight/pull/105), [StarLight-GradlePlugin#4](https://github.com/mooner1022/StarLight-GradlePlugin/pull/4)

### 1.0.1

2026-11-06 · **StarLight 1.0.1**. 현재 정식·베타 앱에 들어 있는 버전이에요. Gradle 플러그인 0.4.0이 `api_version`을 계산할 때 기준으로 삼는 가장 오래된 버전이기도 해요.

- 프로젝트가 API 레벨을 골라요. API 레벨은 프로젝트가 한꺼번에 고르는 API와 이벤트 묶음이에요(`Session.apiLevelManager`, `ApiLevel`). 어느 레벨에도 넣지 않은 플러그인의 API와 이벤트는 모든 프로젝트에 들어가요.
- 이벤트가 스크립트에 전달되는 방식과 시작 코드를 정할 수 있어요: `ProjectEvent.dispatch`, `generateCode(generator)`, `usage`, `description`
- 플러그인이 처음 쓰기 전에 필요한 값을 받는 초기 설정: `isSetupRequired()`, `getSetupReason()`, `getSetupStructure()`, `onSetup(values)`
- 채팅방에서 파일을 보내요(`ChatRoom.sendMedia`).
- 앱이 종료될 때 프로젝트의 켜짐 상태를 그대로 두고, 다시 컴파일할 때 이전 스코프를 정리해요. 생명주기 관찰자가 모든 상태 변화를 받아요.
- 구독한 스코프가 취소되면 이벤트 핸들러도 취소돼요. `whileInState`가 그 상태를 기다리고, 상태를 벗어나면 멈춰요.

[1.0.0과 비교](https://github.com/mooner1022/StarLight/compare/c4b2ac06...4f41d0b0)

### 1.0.0

2026-10-30 · nightly. PluginCore 버전을 앱 버전과 함께 1.0.0으로 맞췄어요. 같은 날 잠깐 쓰인 0.3.3의 변경도 여기에 포함돼요.

**호환성**

- `api_version`을 범위로 확인해요. `0.3.0` 이상이고 앱의 PluginCore 버전 이하인 플러그인을 불러와요. 이전에는 major.minor가 같아야 했어요. (`ApiCompatibility`, `Info.MIN_PLUGIN_API_VERSION` 추가)
- 플러그인 API가 맞지 않아 생기는 오류가 설정 화면과 위젯 밖으로 번지지 않도록 막아요.

**새 기능**

- [홈 위젯 DSL](/docs/plugins/guides/widgets): `widget(id) { }`, 크기(span) 모델과 격자 배치, 위젯별 설정, 레이아웃 저장과 예전 위젯 이전
- 매니페스트 `category` 키와 `PluginCategory`
- 플러그인 설치 기록: 설치 출처와 불러오기 상태를 추적해요.
- 프로젝트 이벤트를 공유 워커에서 프로젝트별 버퍼로 실행하고, 대기 중인 이벤트 수(`Project.queuedEvents()`)를 보여 줘요.
- ConfigDSL: `choice`, `multiChoice`, `info`, `progress`, `textList` 옵션, 버튼 `style`/`confirm`/`action`, 실시간 바인딩(`bindTitle`, `bindDescription`, `bindValue`)과 `visibleWhen`, 옵션 대화상자를 앱 시트로 표시, 잘못된 설정 구조 보고

**개선과 수정**

- 플러그인 의존성을 위상 정렬 순서로 불러와요.
- 플러그인과 라이브러리 dex를 코드 캐시의 읽기 전용 복사본에서 불러와요.
- 설정 파일을 원자적으로 쓰고, 손상된 파일에서 복구해요.
- `Version.newerThan`이 모든 자리가 커야만 참이 되던 문제를 고쳤어요.
- `StarlightPlugin`의 `hashCode()`를 플러그인 ID로만 계산해요.
- 이벤트 함수 이름이 겹치면 첫 번째 함수만 기본 코드에 만들어요.
- 불러오지 못한 플러그인을 끌 때 앱 재시작을 요구해요.
- 프로젝트 작업을 멈출 때 스레드 풀과 타이머를 정리하고, 프로젝트 정보를 원자적으로 저장해요.
- ConfigDSL 버튼의 `backgroundColor`를 더 이상 쓰지 않아요(`style` 사용).

[0.3.2와 비교](https://github.com/mooner1022/StarLight/compare/f2df29f3...c4b2ac06)

### 0.3.3

2026-10-30 · nightly. 1.0.0 직전에 잠깐 쓰인 중간 버전이에요. 변경 사항은 1.0.0에 정리했어요.

### 0.3.2

2025-06-05 · **StarLight 0.3.4b**. 1.0.0 이전 앱에 들어 있던 버전이에요.

- `Language.eval()`에 `options` 파라미터를 추가했어요.
- 기본 코드 생성기를 최적화했어요.
- BotManager 호환 API(API2)를 지원해요.
- `ProjectManager.getProject()`의 이름이 `getProjectByName()`으로 바뀌었어요.
- `Events.Project.Delete`에 `projectId`가 추가됐어요.
- `Session.isDebugging`이 `Info.DEBUG`로 옮겨졌어요.
- 설정이 올바르게 불러와지지 않던 문제를 고쳤어요.

[0.3.0과 비교](https://github.com/mooner1022/StarLight/compare/905964bc...f2df29f3)

### 0.3.0

2024-02-24. 설정 화면 구조를 별도 모듈인 **ConfigDSL**로 분리하고 설정 빌더를 새로 만들었어요. 이때부터 플러그인은 PluginCore와 ConfigDSL을 함께 참조해요.

[변경 내용](https://github.com/mooner1022/StarLight/pull/33)

### 0.2.0

2024-02-08 · StarLight v0.2.0a와 함께 나온 버전이에요.

### 0.1.0

첫 PluginCore 버전이에요.

> [!NOTE]
> 변경 사항은 StarLight 저장소의 커밋 이력에서 플러그인에 영향을 주는 항목을 골라 정리했어요. 전체 내용은 각 버전의 비교 링크에서 볼 수 있어요.
