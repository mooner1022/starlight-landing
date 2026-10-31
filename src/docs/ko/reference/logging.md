---
title: 로그와 번역
description: 앱 로그에 메시지를 남기고, 앱 언어(한국어/영어)에 맞춰 문구를 번역해요.
order: 4
---

## 로거 만들기

```kotlin
object LoggerFactory {
    fun logger(name: String): TLogger
    fun logger(block: () -> Unit): TLogger
}
```

```kotlin
private val LOG = LoggerFactory.logger("WebServerPlugin")

// 이름을 생략하면 이 코드가 있는 파일/클래스 이름을 태그로 써요.
private val logger = LoggerFactory.logger { }
```

플러그인 로그는 앱의 로그 화면과 로그캣(`./gradlew starlightLogcat`)에 함께 남아요.

## TLogger

메시지는 람다로 넘겨요. 로그 수준이 걸러질 때는 문자열을 만들지 않아요.

| 메서드 | 설명 |
|---|---|
| `verbose { }`, `debug { }`, `info { }`, `warn { }`, `error { }` | 각 수준의 로그를 남겨요. |
| `info(flags) { }`, `error(flags) { }` | 플래그와 함께 남겨요(아래 참고). |
| `warn(throwable)`, `error(throwable)`, `error(throwable) { }` | 예외를 남겨요. |
| `wtf { }` | 일어나면 안 되는 상황을 남겨요. |
| `log(type: LogType) { }` | 수준을 직접 지정해요. `LogType`은 `VERBOSE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `CRITICAL`이에요. |

```kotlin
LOG.info { "웹 서버 시작됨: $urls" }
LOG.error(e) { "서버를 멈추지 못했어요" }
```

### 화면 알림 플래그

`INFO` 로그는 보통 로그 목록에만 남아요. `LogData.FLAG_NOTIFY`를 붙이면 앱 화면에도 알림으로 띄워요. 사용자가 누른 버튼의 결과를 알려 줄 때 알맞아요.

```kotlin
LOG.info(LogData.FLAG_NOTIFY) { "서버 재시작 중..." }
```

로그가 남을 때마다 `Events.Log.Create`(`log: LogData`) [이벤트](/docs/reference/events)가 발생해요. 프로젝트별 로그는 [`project.logger`](/docs/reference/projects#프로젝트-로그)를 쓰세요.

## 번역

StarLight는 한국어와 영어를 지원해요. 문구를 언어별로 적어 두면 앱 언어에 맞는 쪽을 골라요.

```kotlin
fun translate(block: TranslationBuilder.() -> Unit): String
```

```kotlin
val title = translate {
    Locale.ENGLISH { "Web server" }
    Locale.KOREAN  { "웹 서버" }
}
```

- `Locale`은 `dev.mooner.starlight.plugincore.translation.Locale`(`ENGLISH`, `KOREAN`)이에요. `java.util.Locale`과 헷갈리지 않게 import를 확인하세요.
- 앱 언어의 문구가 없으면 영어 문구를 써요. 둘 다 없으면 `<TRANSLATION FAILURE>`가 돼요.
- `translate`는 호출할 때의 앱 언어로 문자열을 만들어요. 언어가 바뀌어도 이미 만든 문자열은 그대로이므로, 화면에 보일 문구는 보여 줄 때 만드는 게 좋아요(`ProjectEvent.name`처럼 `get()`으로 만들거나, `getConfigStructure()` 안에서 만들기).

### 값 끼워 넣기

`format()`으로 `{이름}` 자리에 값을 넣을 수 있어요.

```kotlin
translate {
    Locale.ENGLISH { "Added language {name}" }
    Locale.KOREAN  { "언어 {name}을 추가했어요" }
    format("name" to language.name)
}
```

### 번역된 로그

로거에는 번역 블록을 바로 받는 함수도 있어요.

```kotlin
LOG.infoTranslated {
    Locale.ENGLISH { "Server started on port {port}" }
    Locale.KOREAN  { "{port} 포트에서 서버를 시작했어요" }
    format("port" to port.toString())
}
```

`verboseTranslated`, `debugTranslated`, `infoTranslated`, `warnTranslated`, `errorTranslated`가 있어요.

### 현재 언어

| 멤버 | 설명 |
|---|---|
| `TranslationManager.getLocale(): Locale` | 현재 앱 언어예요. |
| `TranslationManager.translateTo(locale) { }` | 앱 언어와 상관없이 지정한 언어로 번역해요. |

앱 언어가 바뀌면 `Events.Locale.Update` [이벤트](/docs/reference/events#그-밖의-이벤트)가 발생해요.
