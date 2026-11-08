---
title: 버전 올리기
description: 플러그인을 새 PluginCore와 Gradle 플러그인으로 올릴 때 확인하고 고칠 것을 버전별로 정리했어요.
section: sdk
order: 2
---

플러그인을 새 PluginCore로 올릴 때 확인하고 고칠 것을 버전별 체크리스트로 정리했어요. 버전마다 바뀐 내용 전체는 [SDK와 변경 사항](/docs/plugins/sdk)에 있어요.

| 지금 쓰는 PluginCore | 볼 곳 |
|---|---|
| 1.0.x (StarLight 1.0.x) | [1.0.x에서 1.1.0으로](#1.0.x에서-1.1.0으로) |
| 0.3.x (StarLight 0.3.4b) | [0.3.2에서 1.0.0으로](#0.3.2에서-1.0.0으로)를 먼저 보고, 이어서 1.0.x에서 1.1.0으로 |

## 먼저 알아 둘 것

버전을 올릴 때는 두 방향을 따로 생각해야 해요.

- **새 앱에서 기존 플러그인 실행하기.** 플러그인이 상속하는 클래스에는 추상 멤버를 추가하지 않으므로, 다시 빌드하지 않은 기존 플러그인도 대부분 새 앱에서 불러와져요. 다만 새 앱의 **동작 변경**은 기존 플러그인에도 적용돼요.
- **기존 앱에서 새 플러그인 실행하기.** 새 SDK로 빌드한 플러그인이 새 API를 쓰면, 그 API가 없는 기존 앱에서는 그 코드가 실행될 때 `NoSuchMethodError` 같은 `LinkageError`로 실패해요. 기존 앱도 지원한다면 [`api_version`](/docs/plugins/start/manifest#api-버전-호환)을 낮게 두고 새 API를 쓰는 코드를 버전 확인으로 감싸야 해요.

## 1.0.x에서 1.1.0으로

1.0.x용 플러그인은 1.1.0 앱에서 수정 없이 불러와져요. 다시 빌드하지 않아도 아래 **동작 변경**은 적용되니 확인하세요.

> [!NOTE]
> PluginCore 1.1.0은 예비 사양이라 바뀔 수 있어요. SDK는 StarLight 저장소의 nightly 브랜치에서 빌드하세요.

### 꼭 확인할 것

- **Gradle 플러그인을 0.4.0 이상(지금은 0.5.0)으로 올리세요(강력 권장).** 1.1.0에서 매니페스트 메타데이터와 버전 처리가 여러 가지 바뀌었고, 0.3.x는 이를 반영하지 못해요. 0.4.0은 코드가 쓰는 PluginCore API로 `api_version`을 계산하고 검증해요. 코드가 1.1.0 API를 쓰는데 적어 둔 `api_version`이 그보다 낮으면 빌드가 실패하니, `api_version`을 올리거나 그 코드를 [`@RequiresPluginCore`](/docs/plugins/start/build-and-deploy#requiresplugincore)로 표시하세요. → [0.3.x에서 올리기](/docs/plugins/start/build-and-deploy#0.3.x에서-올리기)
- **리스너의 생명주기.** 로드가 끝나면 `isEnabled()`가 `true`가 되고, `onEnable()` 안에서 추가한 리스너도 `onEnable`을 받아요. 언로드할 때는 모든 리스너가 `onDisable`을 받아요. → [켜고 끄는 순서](/docs/plugins/reference/plugin#켜고-끄는-순서)
  - `listener.onEnable()`을 직접 부르던 우회 코드는 지우세요. 1.1.0에서는 두 번 호출돼요.
  - `onDisable`은 `onEnable`이 실행되지 않은 리스너에도 호출될 수 있어요. `lateinit`이나 아직 등록하지 않은 리시버를 건드리기 전에 초기화됐는지 확인하세요.
  - `isEnabled()`가 `false`인 것을 전제로 한 코드가 있다면 고치세요.
- **같은 프로젝트를 컴파일하는 흐름 안에서 다시 컴파일하지 마세요.** 같은 프로젝트의 컴파일은 한 번에 하나만 실행돼서, 재진입하면 60초를 기다린 뒤 실패해요. 플러그인 언어의 `compile` 안이나 컴파일 중에 동기로 호출되는 리스너(생명주기 관찰자 등)가 대표적인 경우예요. → [컴파일은 한 번에 하나](/docs/plugins/reference/projects#컴파일은-한-번에-하나)
- **플러그인 언어라면 `formatDefaultCode`.** 2인자만 오버라이드했다면 그대로 동작해요. 고칠 일이 있다면 3인자 형식만 오버라이드하세요. → [새 프로젝트 시작 코드](/docs/plugins/reference/plugin#새-프로젝트-시작-코드)
- **스크립트 콜백을 다른 스레드에서 실행하고 결과를 기다리는 API.** 기다리는 동안 `NeonContext.releasing`으로 컨텍스트를 놓지 않으면 데드락이 나요. `neonjs-core:0.1.7`을 `compileOnly`로 추가해야 해요. → [스크립트 콜백과 스레드](/docs/plugins/guides/script-api#스크립트-콜백과-스레드)
- **스크립트가 플러그인 객체의 `originalFile`을 읽고 있었다면** 이제 보이지 않아요(`@JvmSynthetic`).

### 1.1.0 기능 쓰기 (선택)

- **리스너로 받는 이벤트**나 래퍼 객체를 넘기는 이벤트라면 `scriptArguments`, `listenerName`을 정하세요. StarLight AI가 이 값으로 이벤트를 설명해요. → [선택 멤버](/docs/plugins/guides/project-events#선택-멤버)
- **시작 코드의 함수 이름이 StarLight 이벤트와 겹칠 수 있다면** `alternateFunctionName`을 정하세요. `generateCode(generator)`를 오버라이드했다면 `generateCode(generator, name)`도 반드시 함께 오버라이드하세요. → [함수 이름이 겹칠 때](/docs/plugins/guides/project-events#함수-이름이-겹칠-때)
- **프로젝트를 만드는 플러그인**이라면 `allowedEventIds`로 받을 이벤트를 처음부터 정할 수 있어요. → [프로젝트 만들기](/docs/plugins/reference/projects#프로젝트-만들기)
- **StarLight AI가 API를 잘 설명하게 하려면** 이벤트의 `description`, `usage`를 짧고 정확하게 쓰고, 스크립트가 받는 타입을 API 클래스와 같은 패키지 아래에 두세요. → [StarLight AI와 플러그인](/docs/plugins/guides/starlight-ai)
- **StarLight AI에 설명을 붙이려면** Gradle 플러그인 0.5.0과 KSP를 적용하고 KDoc과 가이드를 쓰세요. 적용하지 않으면 StarLight AI는 리플렉션으로 본 구조만 보여 줘요. → [KDoc과 가이드 배포하기](/docs/plugins/guides/starlight-ai#kdoc과-가이드-배포하기)
- **StarLight AI가 플러그인을 어떻게 보는지**는 **설정 → 개발자 모드 → StarLight AI 문서**에서 확인해요. → [개발자 모드에서 확인하기](/docs/plugins/guides/starlight-ai#개발자-모드에서-확인하기)

### `api_version` 정하기

| 플러그인 | `api_version` |
|---|---|
| 1.1.0 API를 쓰지 않음 | 그대로 두세요. 생략하면 Gradle 플러그인 0.4.0이 `1.0.1`을 넣어서 PluginCore 1.0.0 앱은 불러오지 않아요. 1.0.0 앱까지 지원하려면 `1.0.0`을 직접 적으세요. |
| 1.1.0 API를 쓰고 1.1.0 앱 전용 | `1.1.0` |
| 1.1.0 API를 쓰면서 1.0.x 앱도 지원 | 1.0.x로 두고, 새 API를 쓰는 코드를 버전 확인으로 감싸고 [`@RequiresPluginCore("1.1.0")`](/docs/plugins/start/build-and-deploy#requiresplugincore)을 붙여요. |

1.0.x 앱도 지원할 때의 규칙이에요. 자세한 내용은 [PluginCore 1.1.0과 1.0.x](/docs/plugins/start/manifest#plugincore-1.1.0과-1.0.x)를 보세요.

- 새 `open` 멤버(`scriptArguments`, `listenerName`, `alternateFunctionName`, `generateCode(generator, name)`, 3인자 `formatDefaultCode`)는 오버라이드만 하면 안전해요. 1.0.x 앱은 호출하지 않을 뿐이에요.
- 새 멤버를 직접 호출하거나 읽으면 1.0.x 앱에서 `NoSuchMethodError`가 나요.
- 버전 확인은 `Info.PLUGINCORE_VERSION >= Version(1, 1, 0)`처럼 하세요. `Version`의 비교는 PluginCore 1.0.0부터 있어요.

```kotlin
override fun onEnable() {
    if (Info.PLUGINCORE_VERSION >= Version(1, 1, 0))
        createProject()
}

@RequiresPluginCore("1.1.0")
private fun createProject() = Session.projectManager.newProject(events = starterEvents) {
    name = "my-bot"
    mainScript = "my-bot.js"
    languageId = "js_neon"
    allowedEventIds = setOf("myplugin.*")   // 1.1.0
}
```

### 1.0.0에서 올린다면

1.0.1에서 고친 동작도 함께 적용돼요. 플러그인 코드가 예전 동작에 기대고 있지 않은지 확인하세요.

- **이벤트 구독:** `EventHandler.on`에 넘긴 스코프를 취소하면 이미 실행 중인 핸들러도 함께 취소돼요. 1.0.0에서는 스코프를 취소해도 실행 중인 핸들러는 끝까지 실행됐어요. → [구독](/docs/plugins/reference/events#구독)
- **생명주기 관찰자:** 프로젝트 상태가 바뀔 때마다 빠짐없이, 상태를 바꾸는 스레드에서 변화가 진행되기 전에 호출돼요. 관찰자 안에서는 오래 걸리는 일이나 같은 프로젝트의 컴파일을 하지 마세요. → [프로젝트 생명주기](/docs/plugins/reference/projects#프로젝트-생명주기)
- **`whileInState(state)`:** 프로젝트가 그 상태가 될 때까지 기다렸다가 블록을 실행하고, 상태를 벗어나면 블록을 취소해요.
- **앱 종료:** 앱이 종료될 때 프로젝트는 정리되지만(`DESTROYED`) 켜짐 상태는 그대로 남아서, 다음에 앱을 시작할 때 다시 켜져요.

## 0.3.2에서 1.0.0으로

PluginCore 1.0.0부터 PluginCore 버전을 앱 버전과 맞췄어요. 0.3.2용 플러그인은 대부분 다시 빌드하지 않아도 1.0.0 앱에서 불러와져요. 플러그인이 상속하는 클래스(`StarlightPlugin`, `Language`, `ProjectEvent`, `Api`, `Widget`)에 추상 멤버가 추가되지 않았기 때문이에요. 그래도 아래는 확인하세요.

> [!NOTE]
> 이 절은 0.3.2(`f2df29f3`)와 1.0.0(`c4b2ac06`) 사이의 소스와 커밋을 비교해 정리했어요. [전체 비교](https://github.com/mooner1022/StarLight/compare/f2df29f3...c4b2ac06)

### 불러오기 전에 확인할 것

- **플러그인 ID.** 영문 대소문자, 숫자, `.`, `_`, `-`만 쓸 수 있어요. 다른 문자가 있으면 1.0.0 앱은 `Illegal plugin id`로 불러오지 않아요. `global`, `starlight`, `system`, `core`는 예전처럼 쓸 수 없어요.
  - ID를 바꾸면 이벤트 ID(`<플러그인 ID>.<카테고리>.<이벤트 ID>`)와 데이터 폴더(`plugin_data/<id>/`, `/sdcard/StarLight/plugins/<이름>(<id>)/`)도 바뀌어요. 사용자가 프로젝트의 받을 이벤트를 다시 고르고 데이터를 옮기도록 안내하세요.
- **`api_version`.** 1.0.0 앱은 `0.3.0` 이상, `1.0.0` 이하를 불러와요(0.3.4b는 `0.3.x`만). 0.3.4b 앱도 지원한다면 `0.3.2`로 두세요. 1.0.0 API를 쓰고 1.0.0 이상 앱 전용이라면 `1.0.0`으로 올리세요. → [API 버전 호환](/docs/plugins/start/manifest#api-버전-호환)
- **`starlight.json` 형식.** 1.0.0 앱은 파일을 그대로 JSON으로 읽어요. 0.3.4b 앱은 줄 단위로 읽어 다시 합치므로, `api_version`을 `0.3.x`로 둔다면 `{`로 시작해 `}`로 끝나고 앞뒤에 빈 줄이 없게 하세요. `res/raw/`에 있다면 `assets/`로 옮기세요. → [파일 형식 규칙](/docs/plugins/start/manifest#파일-형식-규칙)

### 다시 빌드할 때

- **Kotlin 2.4.20.** PluginCore가 Kotlin 2.1.21 대신 2.4.20으로 컴파일돼서, 더 오래된 컴파일러는 1.0.0 AAR의 클래스를 읽지 못해요. 플러그인의 Kotlin을 2.4.20(또는 바로 이전 마이너 버전)으로 올리세요. → [개발 환경 준비](/docs/plugins/start/setup#필요한-도구)
- **앱이 제공하는 라이브러리 버전.** 앱의 kotlinx-coroutines가 1.9.0에서 1.11.0으로, kotlinx-serialization이 1.8.1에서 1.11.0으로 올라갔어요. `compileOnly` 버전을 맞추세요. → [앱이 제공하는 라이브러리](/docs/plugins/start/setup#앱이-제공하는-라이브러리)
- **Gradle 플러그인.** 0.3.0 이상이 1.0.0의 불러오기 규칙(ID, `api_version` 범위, `category`)으로 검사해요. 1.1.0까지 올린다면 0.4.0 이상을 쓰세요. → [0.2.0에서 올리기](/docs/plugins/start/build-and-deploy#0.2.0에서-올리기)
- **`MaterialDialog.setCommonAttrs()`를 썼다면** ConfigDSL에서 지워졌으니 직접 설정하세요. `showConfirmDialog()`는 그대로 있어요.

### 설정 화면(ConfigDSL)

- **버튼의 `backgroundColor`는 더 이상 그려지지 않아요.** `style`(`DEFAULT`, `PRIMARY`, `DANGER`)을 쓰세요. `style`은 0.3.2에 없으니 0.3.4b 앱도 지원한다면 [버전을 확인](#0.3.2-앱도-지원한다면)한 뒤에만 설정하세요.
- **`flagOf()`가 이제 플래그를 실제로 합쳐요.** 0.3.2에서는 버그로 항상 `0`을 돌려줘서 `flagOf()`로 준 플래그가 적용되지 않았어요. 1.0.0부터는 적용되니, 의도한 플래그인지 확인하세요.
  - 예: `flags = flagOf(CategoryConfigOption.FLAG_DEV_MODE_ONLY)`인 카테고리는 이제 개발자 모드에서만 보여요.
  - 예: `colorPicker`의 `FLAG_CUSTOM_ARGB`, `FLAG_ALPHA_SELECTOR`도 이제 적용돼요.
- **설정 구조를 검사해요.** 아래 경우는 설정 구조를 만들 때 오류가 나요. 0.3.2에서 그냥 넘어가던 구조라도 고치세요.
  - 항목이 하나도 없는 카테고리
  - ID에 `:`가 들어간 옵션
  - 같은 카테고리 안에서 옵션 ID가 겹치면 오류 대신 경고 로그를 남겨요.

### 동작이 바뀐 것

- **프로젝트 이벤트 실행.** 프로젝트마다 따로 만들던 스레드 풀 대신, 앱이 함께 쓰는 작업 스레드에서 프로젝트마다 최대 동시 실행 수만큼 실행해요. 이벤트는 프로젝트마다 256개까지 쌓이고, 넘치면 가장 오래된 이벤트부터 버려요. 플러그인 언어는 `defaultConcurrency`(기본 3)로 기본 동시 실행 수를 정할 수 있어요.
- **이벤트 함수 이름이 겹칠 때.** 새 프로젝트의 시작 코드에서 첫 번째 이벤트만 함수로 만들고, 나머지는 주석 처리해요.
- **`StarlightPlugin`의 `equals()`와 `hashCode()`** 는 플러그인 ID만 비교해요.
- **의존성 순서.** `dependency`에 적은 플러그인을 위상 정렬 순서로 먼저 불러와요.
- **`Version.newerThan`** 이 올바르게 비교해요. 0.3.2에서는 모든 자리가 커야만 `true`였어요.

### 0.3.2 앱도 지원한다면

`api_version`을 `0.3.2`로 두고 1.0.0 API를 쓴다면, 0.3.4b 앱에서는 그 코드가 실행될 때 `LinkageError`로 실패해요. 해당하는 API는 위젯 DSL, ConfigDSL의 1.0.0 옵션(`choice`, `info` 등)과 버튼 `style`/`confirm`/`action`, `Project.queuedEvents()` 같은 것들이에요.

- 등록 한 번으로 끝나는 기능은 [홈 위젯의 호환성](/docs/plugins/guides/widgets#호환성)처럼 `LinkageError`를 잡아 그 기능만 빼세요.
- 버전으로 나눌 때는 `Info.PLUGINCORE_VERSION.major`처럼 필드로 비교하세요. 0.3.2의 `Version`에는 `>=` 비교(`compareTo`)가 없어서 확인 코드 자체가 `NoSuchMethodError`로 실패하고, `newerThan`은 잘못된 결과를 내요.

```kotlin
// 0.3.2 앱에도 있는 API만으로 확인해요.
val hasPluginCore1 = Info.PLUGINCORE_VERSION.major >= 1
```

Gradle 플러그인 0.4.0은 1.0.1 이전 API의 기록이 없어서, 0.3.2 앱에서 실패할 코드는 빌드 단계에서 잡지 못해요. 0.3.4b 앱에서 직접 실행해 확인하세요.

## Gradle 플러그인

| 올릴 버전 | 함께 쓰는 PluginCore | 할 일 |
|---|---|---|
| 0.5.0 | 1.1.0 (StarLight AI용 KDoc 배포) | [0.4.x에서 올리기](/docs/plugins/start/build-and-deploy#0.4.x에서-올리기) |
| 0.4.0 | 1.1.0 (**강력 권장**) | [0.3.x에서 올리기](/docs/plugins/start/build-and-deploy#0.3.x에서-올리기) |
| 0.3.x | 1.0.x | [0.2.0에서 올리기](/docs/plugins/start/build-and-deploy#0.2.0에서-올리기) |
