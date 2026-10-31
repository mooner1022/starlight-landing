---
title: 플러그인 개발 문서
description: StarLight에 새로운 API, 이벤트, 설정 화면, 홈 위젯을 더하는 플러그인을 만들어 보세요.
section: start
order: 0
---

## StarLight 플러그인이란

StarLight 플러그인은 **이름을 `.slp`로 바꾼 안드로이드 APK**예요. APK 안의 `assets/starlight.json`에 플러그인 정보가 들어 있고, StarLight는 앱이 시작될 때 기기의 `StarLight/plugins/` 폴더에서 플러그인을 찾아 불러와요.

플러그인은 Kotlin(또는 Java)으로 작성하고, StarLight가 제공하는 **PluginCore** SDK의 `StarlightPlugin` 클래스를 상속해 만들어요.

```kotlin title="HelloPlugin.kt"
class HelloPlugin : StarlightPlugin() {

    private val log = LoggerFactory.logger("HelloPlugin")

    override fun onEnable() {
        log.info { "Hello, StarLight!" }
    }
}
```

## 플러그인으로 할 수 있는 일

| 하고 싶은 일 | 사용하는 기능 | 문서 |
|---|---|---|
| 스크립트에서 쓸 전역 객체나 클래스 제공 | `addApi()` | [스크립트에 API 노출하기](/docs/guides/script-api) |
| 스크립트가 받을 새 이벤트 함수 추가 | `registerProjectEvents()` | [프로젝트 이벤트 만들기](/docs/guides/project-events) |
| 플러그인 설정 화면 제공 | `getConfigStructure()` + ConfigDSL | [설정 화면 만들기](/docs/guides/settings) |
| 홈 화면 위젯 추가 | `addWidget()` | [홈 위젯 만들기](/docs/guides/widgets) |
| 메시지, 프로젝트, 알림 등 앱 이벤트에 반응 | `EventHandler.on<T>()` | [이벤트](/docs/reference/events) |
| 새 스크립트 언어(엔진) 추가 | `addLanguage()` | [StarlightPlugin](/docs/reference/plugin#언어-추가) |

## 구성 요소

- **StarLight 앱** — 플러그인을 불러오고 실행하는 호스트예요. 플러그인이 쓰는 Kotlin, 코루틴, AndroidX 같은 라이브러리도 앱이 제공해요.
- **PluginCore** — 플러그인이 컴파일할 때 참조하는 SDK예요. `StarlightPlugin`, 이벤트, 프로젝트, 위젯 API가 들어 있어요.
- **ConfigDSL** — 플러그인 설정 화면을 Kotlin DSL로 정의하는 라이브러리예요.
- **[StarLight Gradle 플러그인](https://github.com/mooner1022/StarLight-GradlePlugin)** — `.slp` 패키징, `starlight.json` 생성과 검증, 기기 배포까지 맡는 Gradle 플러그인이에요.

PluginCore와 ConfigDSL은 [SDK 페이지](/docs/sdk)에서 버전별 변경 사항을 확인할 수 있어요.

## 문서 읽는 순서

1. **시작하기** — [개발 환경을 준비](/docs/start/setup)하고 [첫 플러그인](/docs/start/first-plugin)을 기기에 올려 봐요.
2. **가이드** — API, 이벤트, 설정 화면, 위젯을 하나씩 붙여 봐요. 마지막에는 실제 플러그인인 [웹 서버 플러그인](/docs/guides/webserver-example)을 살펴봐요.
3. **API 레퍼런스** — 클래스와 메서드를 찾아볼 때 써요.

> [!IMPORTANT]
> 이 문서는 **StarLight nightly 브랜치(PluginCore 1.0.0)** 를 기준으로 해요. 현재 내려받을 수 있는 정식 앱(StarLight 0.3.4b)에는 PluginCore 0.3.2가 들어 있어서, 위젯 DSL처럼 1.0.0에서 추가된 기능은 동작하지 않아요. 이런 기능에는 **PluginCore 1.0.0 이상**이라고 따로 표시해 두었어요.

## 예제 플러그인

- [starlight-webserver](https://github.com/mooner1022/starlight-webserver) — 프로젝트(스크립트)가 HTTP 요청을 처리하게 해 주는 웹 서버 플러그인이에요. API, 프로젝트 이벤트, 설정 화면, 홈 위젯을 모두 사용해요.
- [StarLight-GradlePlugin의 testApp](https://github.com/mooner1022/StarLight-GradlePlugin/tree/master/testApp) — Gradle 플러그인을 시험하는 가장 작은 샘플이에요.
