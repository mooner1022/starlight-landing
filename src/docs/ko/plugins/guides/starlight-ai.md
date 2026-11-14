---
title: StarLight AI와 플러그인
description: StarLight AI가 플러그인의 API와 이벤트를 어떻게 보는지, KDoc과 가이드로 설명을 붙이고 개발자 모드에서 확인하는 방법을 정리했어요.
order: 3
---

> [!IMPORTANT]
> **PluginCore 1.1.0 이상**(StarLight 1.1.0 이상)의 기능이에요.

StarLight AI는 앱이 따로 들고 있던 문서 사본 대신, 실행 중인 앱에 등록된 API와 이벤트에서 문서를 만들어요. 그래서 플러그인이 등록한 API와 이벤트도 아래 도구에 함께 나와요. 별도 설정은 필요 없어요.

| 도구 | 플러그인에서 나오는 것 |
|---|---|
| `list_apis`, `describe_api` | [`addApi()`](/docs/plugins/guides/script-api)로 등록한 API |
| `list_events`, `describe_event` | [`registerProjectEvents { }`](/docs/plugins/guides/project-events)로 등록한 이벤트 |
| `read_guide` | 플러그인이 배포한 [가이드](#가이드) |
| `create_project` | 플러그인 이벤트의 시작 코드 |

어느 플러그인이 등록한 API·이벤트인지는 클래스 로더로 찾아, 플러그인 ID로 표시해요.

## API

플러그인이 [KDoc과 가이드를 배포](#kdoc과-가이드-배포하기)하면 앱의 API와 같은 형식으로 설명이 붙어요. 배포하지 않은 플러그인은 리플렉션으로 본 구조만 보여 줘요. 이름, 매개변수, 반환 타입, 프로퍼티가 나와요.

- Kotlin 플러그인은 매개변수 이름과 nullability가 Kotlin 메타데이터에서 나와요.
- Java 플러그인은 `-parameters` 옵션으로 컴파일해야 매개변수 이름이 보여요. 그러지 않으면 `arg0`처럼 표시돼요. Gradle 플러그인 0.5.0은 이 옵션을 자동으로 켜요. 그 이전 버전이라면 직접 켜세요.

```kotlin title="app/build.gradle.kts"
// Gradle 플러그인 0.4.x 이하에서만 필요해요.
tasks.withType<JavaCompile>().configureEach {
    options.compilerArgs.add("-parameters")
}
```

### 플러그인 자체 타입의 범위

StarLight AI는 API 클래스 패키지의 앞 세 부분을 플러그인 자체 패키지로 봐요. 예를 들어 `com.example.discord.DiscordApi`라면 `com.example.discord.`예요.

- 그 안의 타입은 멤버까지 따라가 설명해요.
- 그 밖의 타입(번들한 라이브러리, Java·Android 클래스)은 이름만 보여 줘요.

스크립트가 받는 타입을 같은 패키지 아래에 두면 StarLight AI가 그 멤버까지 설명할 수 있어요.

```text
com.example.discord.DiscordApi           API 클래스
com.example.discord.model.DiscordUser    멤버까지 설명해요
okhttp3.OkHttpClient                     이름만 보여 줘요
```

KDoc을 배포하면 이 규칙과 관계없이, 문서 파일에 있는 플러그인 클래스(모든 public 클래스)를 따라가 설명해요.

### 상수와 오류

- 문서를 만들면서 플러그인 클래스의 인스턴스를 만들지 않아요. 상수 값은 `static final` 필드만 읽어요.
- 멤버가 Android에 없는 클래스를 참조하면 그 타입은 "설명할 수 없음"으로 표시돼요. 앱에는 영향이 없어요.

## 이벤트

이벤트 목록과 설명에는 `ProjectEvent`의 다음 값을 그대로 써요.

- `description`, `usage`, `functionName`, `scriptArguments`, `listenerName`

그러니 `description`과 `usage`는 짧고 정확하게 써 주세요. `usage`의 기본값은 `functionName(인자, …)`예요. 각 멤버는 [프로젝트 이벤트의 선택 멤버](/docs/plugins/guides/project-events#선택-멤버)에 정리해 두었어요. KDoc을 배포한다면 `ProjectEvent` 클래스의 KDoc에 스크립트가 받는 인자마다 `@param`을 쓰세요.

## KDoc과 가이드 배포하기

**Gradle 플러그인 0.5.0 이상.** 플러그인도 앱과 같은 방식으로 문서를 배포할 수 있어요. StarLight 1.1.0은 플러그인 패키지에서 다음 두 가지를 읽어요.

- **KDoc:** `starlight/agent/<플러그인 ID>.api.json`. KSP가 플러그인의 KDoc과 Kotlin 시그니처를 뽑아 APK에 넣은 파일이에요.
- **가이드:** `assets/agent/guides/` 아래의 Markdown 파일. 특정 클래스에 속하지 않는 설명(설정 방법, 개념, 제약)을 둬요.

### 설정

Gradle 플러그인을 0.5.0 이상(지금은 0.5.1)으로 올리고, `plugins { }` 블록에 KSP를 추가해요. 나머지는 Gradle 플러그인이 맡아요.

```kotlin title="app/build.gradle.kts"
plugins {
    id("com.android.application")
    id("com.google.devtools.ksp") version "2.3.13"     // AGP 8.12 이상
    id("io.github.mooner1022.slplugin") version "0.5.1"
}
```

- Gradle 플러그인이 앱과 같은 문서 프로세서를 들고 있다가 KSP에 연결해요. 모듈 이름은 플러그인 ID예요.
- KSP는 Gradle 플러그인이 직접 적용하지 않아요. KSP 2.3.13은 AGP 8.12 미만을 거부하는데, Gradle 플러그인은 AGP 8.0부터 지원하기 때문이에요. KSP를 적용하지 않으면 문서 없이 지금처럼 빌드돼요.
- 0.5.0부터 Java는 `-parameters`, Kotlin은 `-java-parameters`로 컴파일돼요. 문서가 없는 멤버도 매개변수 이름이 보여요.

### KDoc 작성 규칙

StarLight 저장소의 [`docs/agent-docs.md`](https://github.com/mooner1022/StarLight/blob/nightly/docs/agent-docs.md) §3을 따라요.

- 첫 문장이 요약이에요. 목록에 한 줄로 나오므로, 스크립트를 쓰는 사람이 읽을 문장으로 쓰세요. 이어지는 문단은 상세 설명에만 나와요.
- 매개변수마다 `@param`을 써요. 이벤트는 `ProjectEvent` 클래스에 스크립트가 받는 인자마다 `@param`을 써요.
- `@suppress`를 붙인 public 멤버는 StarLight AI에 보이지 않아요.
- `@see guide:<id>`로 가이드를 연결해요.

```kotlin title="DiscordApi.kt"
/**
 * Discord 채널에 메시지를 보내요. 플러그인이 켜져 있는 동안 모든 프로젝트의 전역 객체예요.
 *
 * 2,000자가 넘는 메시지는 나눠서 보내요. 봇이 오프라인이면 실패해요. guide:setup을 참고하세요.
 *
 * @see guide:setup
 */
class DiscordApi {
    /**
     * [text]를 채널에 보내고, Discord가 받아들였는지 돌려줘요.
     *
     * @param channelId 채널 ID예요. Discord의 개발자 모드에서 확인할 수 있어요.
     * @param text 보낼 메시지예요. Discord의 Markdown을 쓸 수 있어요.
     */
    fun send(channelId: Long, text: String): Boolean = TODO()
}
```

### 가이드

`src/main/assets/agent/guides/<id>.md`에 두고, front matter로 시작해요.

```markdown title="src/main/assets/agent/guides/setup.md"
---
title: Setup
summary: 봇 토큰, 인텐트, 켜야 하는 설정.
---
```

- StarLight AI의 `read_guide`에 `<플러그인 ID>:<id>`로 나와요. 예: `discord:setup`. 하위 폴더도 돼요(`discord:faq/start`).
- front matter가 없거나 `title`·`summary`가 빠지면, 또는 BOM이 있으면 StarLight가 그 가이드를 건너뛰어요. Gradle 플러그인이 빌드할 때 경고해요.

### 가이드 참조

- 플러그인의 KDoc과 가이드 안에서 모듈 없이 쓴 `guide:setup`은 그 플러그인의 가이드예요. 가이드 안에서는 `guide:<id>`로 가는 Markdown 링크도 돼요.
- 앱의 가이드는 `guide:starlight:projects`처럼 `starlight:`를 붙여 가리켜요.
- 앱이 패키지를 읽을 때 참조에 플러그인 ID를 붙이므로, StarLight AI가 보는 참조는 모두 바로 열 수 있어요.

### 빌드 확인

`assemble<Variant>Slp`가 패키지의 문서를 확인하고 요약을 남겨요.

```text
i: [StarLight] StarLight AI docs: 3 classes in starlight/agent/my_plugin.api.json, 1 guide (my_plugin:setup)
```

- 문서 파일의 이름·형식·모듈이 StarLight가 읽는 것과 다르면 경고해요.
- KSP를 적용했는데 문서 파일이 없어도 경고해요.

### 참고

- 문서는 클래스와 멤버 이름으로 연결돼요. 난독화(R8)를 쓴다면 스크립트가 쓰는 클래스를 유지하세요. 스크립트도 이름으로 접근하므로 원래 유지해야 하는 클래스예요.
- 앱이 문서화한 클래스와 이름이 같은 클래스를 플러그인이 문서화해도 앱의 문서가 쓰여요. 앱의 가이드도 플러그인이 바꿀 수 없어요.
- 문서가 없는 플러그인 타입은 설명에 `// Without docs:`로 표시돼요.

## 개발자 모드에서 확인하기

StarLight AI가 플러그인을 어떻게 보는지 앱에서 바로 확인할 수 있어요. **설정 → 개발자 모드 → StarLight AI 문서**를 열어요.

- 가이드, API, 이벤트, 타입 네 분류로 나뉘고, 분류마다 개수가 나와요. 각 분류 안에서는 StarLight 것이 먼저, 그다음 플러그인별로 묶여요. 예: `Discord (discord)`.
- 항목을 누르면 StarLight AI의 도구(`read_guide`, `describe_api`, `describe_event`)가 돌려주는 내용이 그대로 나와요. 가이드는 Markdown으로, 나머지는 TypeScript 선언으로 보여요. 본문의 `guide:` 참조를 누르면 그 가이드가 열리고, 오른쪽 위 버튼으로 전체를 복사할 수 있어요.
- 문서 없이 리플렉션으로만 보이는 플러그인 타입은 **문서 없음**으로 표시돼요. KDoc을 배포한 뒤 설명이 붙었는지, 빠진 클래스가 없는지 여기서 확인하세요.
- 개발자 모드가 꺼져 있다면 **설정 → 앱 정보**의 개발자 항목(무너)을 8번 누르면 켜져요. → [개발자 모드](/docs/app/guides/settings#개발자-모드)

## API 레벨

플러그인이 `Session.apiLevelManager.register`로 자기 API를 API 레벨에 넣지 않았다면, 그 API는 어느 레벨에도 속하지 않아요. 그래서 모든 프로젝트의 API 목록에 나와요. 이벤트도 같아요.

## 프로젝트 만들기

`create_project` 도구가 시작 코드를 만드는 방식이에요.

- `events`에 플러그인 이벤트나 와일드카드(예: `myplugin.*`)를 주면, 맞는 이벤트마다 `generateCode`로 시작 코드를 만들어요.
- `events`를 생략하면 선택한 API 레벨의 메시지 이벤트만 시작 코드를 받아요. 플러그인 이벤트는 포함되지 않아요.
