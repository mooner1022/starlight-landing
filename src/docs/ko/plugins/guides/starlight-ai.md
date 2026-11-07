---
title: StarLight AI와 플러그인
description: StarLight AI가 플러그인의 API와 이벤트를 어떻게 읽고 설명하는지, 잘 설명되게 하려면 무엇을 확인할지 정리했어요.
order: 3
---

> [!IMPORTANT]
> **PluginCore 1.1.0 이상**(StarLight 1.1.0)의 기능이에요. 1.1.0은 아직 예비 사양이라 바뀔 수 있어요.

StarLight AI는 앱이 따로 들고 있던 문서 사본 대신, 실행 중인 앱에 등록된 API와 이벤트에서 문서를 만들어요. 그래서 플러그인이 등록한 API와 이벤트도 아래 도구에 함께 나와요. 별도 설정은 필요 없어요.

| 도구 | 플러그인에서 나오는 것 |
|---|---|
| `list_apis`, `describe_api` | [`addApi()`](/docs/plugins/guides/script-api)로 등록한 API |
| `list_events`, `describe_event` | [`registerProjectEvents { }`](/docs/plugins/guides/project-events)로 등록한 이벤트 |
| `create_project` | 플러그인 이벤트의 시작 코드 |

어느 플러그인이 등록한 API·이벤트인지는 클래스 로더로 찾아, 플러그인 ID로 표시해요.

## API

**설명은 아직 없어요.** 이번 버전은 플러그인의 KDoc을 읽지 않고, 리플렉션으로 본 구조만 보여 줘요. 이름, 매개변수, 반환 타입, 프로퍼티가 나와요.

- Kotlin 플러그인은 매개변수 이름과 nullability가 Kotlin 메타데이터에서 나와요.
- Java 플러그인은 `-parameters` 옵션으로 컴파일해야 매개변수 이름이 보여요. 그러지 않으면 `arg0`처럼 표시돼요.

```kotlin title="app/build.gradle.kts"
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

### 상수와 오류

- 문서를 만들면서 플러그인 클래스의 인스턴스를 만들지 않아요. 상수 값은 `static final` 필드만 읽어요.
- 멤버가 Android에 없는 클래스를 참조하면 그 타입은 "설명할 수 없음"으로 표시돼요. 앱에는 영향이 없어요.

## API 레벨

플러그인이 `Session.apiLevelManager.register`로 자기 API를 API 레벨에 넣지 않았다면, 그 API는 어느 레벨에도 속하지 않아요. 그래서 모든 프로젝트의 API 목록에 나와요. 이벤트도 같아요.

## 이벤트

이벤트 목록과 설명에는 `ProjectEvent`의 다음 값을 그대로 써요.

- `description`, `usage`, `functionName`, `scriptArguments`, `listenerName`

그러니 `description`과 `usage`는 짧고 정확하게 써 주세요. `usage`의 기본값은 `functionName(인자, …)`예요. 각 멤버는 [프로젝트 이벤트의 선택 멤버](/docs/plugins/guides/project-events#선택-멤버)에 정리해 두었어요.

## 프로젝트 만들기

`create_project` 도구가 시작 코드를 만드는 방식이에요.

- `events`에 플러그인 이벤트나 와일드카드(예: `myplugin.*`)를 주면, 맞는 이벤트마다 `generateCode`로 시작 코드를 만들어요.
- `events`를 생략하면 선택한 API 레벨의 메시지 이벤트만 시작 코드를 받아요. 플러그인 이벤트는 포함되지 않아요.

## 예정: KDoc과 가이드 배포

> [!NOTE]
> 이번 버전에는 없는 기능이에요. 플러그인이 KDoc과 가이드를 함께 배포하는 기능을 계획하고 있어요.
>
> - KDoc은 KSP로 뽑은 `starlight/agent/<pluginId>.api.json`으로, 가이드는 `src/main/assets/agent/guides/<id>.md`로 배포할 예정이에요.
> - StarLight Gradle 플러그인이 KSP 설정을 맡을 예정이에요.
> - KDoc 작성 규칙(요약 문장, `@param`, `@suppress`, `@see guide:…`)은 StarLight 저장소의 [`docs/agent-docs.md`](https://github.com/mooner1022/StarLight/blob/nightly/docs/agent-docs.md) §3을 따라요. 미리 그 규칙대로 KDoc을 써 두면 이후 그대로 쓰여요.
