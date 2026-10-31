---
title: 프로젝트 이벤트 만들기
description: 플러그인이 정의한 이벤트로 프로젝트 스크립트의 함수를 호출해요.
order: 2
---

프로젝트 이벤트는 **플러그인이 스크립트의 함수를 부르는 통로**예요. StarLight의 기본 이벤트(메시지 수신 등)도 같은 방식으로 동작해요. 플러그인이 이벤트를 등록하면 사용자는 프로젝트 설정의 이벤트 목록에서 그 이벤트를 허용하고, 스크립트에 이벤트 함수를 작성해요.

## 이벤트 정의

`ProjectEvent`를 상속해요.

```kotlin title="AlarmEvent.kt"
class AlarmEvent : ProjectEvent() {

    // 카테고리 안에서의 ID예요. 영문, 숫자, -, _만 쓸 수 있어요.
    override val id: String = "alarm"

    // 이벤트 목록에 보이는 이름이에요.
    override val name: String = translate {
        Locale.ENGLISH { "Alarm" }
        Locale.KOREAN  { "알람" }
    }

    // 스크립트에서 작성할 함수 이름이에요.
    override val functionName: String = "onAlarm"

    // 함수 인자의 이름과 형식이에요. 호출할 때 형식을 검사해요.
    override val argTypes: Array<CodeGenerator.Argument<*>> = arrayOf(
        "time"  typedAs String::class,
        "label" typedAs String::class,
    )

    // 새 프로젝트를 만들 때 함수 위에 붙는 주석이에요. (선택)
    override val functionComment: String = "알람이 울릴 때 호출돼요."
}
```

`typedAs`는 `ProjectEvent` 안에서 쓸 수 있는 중위 함수예요. `typedAs<String>("time")` 형태로도 쓸 수 있어요.

## 등록

`onEnable()`에서 `registerProjectEvents { }`로 등록해요. 이벤트는 반드시 카테고리 안에 넣어야 해요.

```kotlin title="ClockPlugin.kt"
override fun onEnable() {
    registerProjectEvents {
        category("clock") {
            add<AlarmEvent>()
        }
    }
}
```

이벤트의 전체 ID는 **`<플러그인 ID>.<카테고리>.<이벤트 ID>`** 예요. 플러그인 ID가 `clock`이라면 위 이벤트는 `clock.clock.alarm`이 돼요. 카테고리는 `category("a") { category("b") { … } }`처럼 중첩할 수 있어요.

> [!TIP]
> 웹 서버 플러그인은 `category("server") { add<WebServerSetupEvent>() }`로 `webserver.server.setup` 이벤트를 등록해요.

## 사용자 쪽

1. 프로젝트 설정의 이벤트 목록에서 플러그인 이벤트를 허용해요. 프로젝트는 기본으로 `starlight.*`(StarLight 기본 이벤트)만 허용해요. 목록에는 와일드카드도 쓸 수 있어서, `clock.*`은 `clock` 플러그인의 모든 이벤트를 허용해요.
2. 스크립트에 `functionName`과 같은 이름의 함수를 작성해요.

```javascript title="main.js (Rhino)"
function onAlarm(time, label) {
    Api.replyRoom("알림방", time + " " + label);
}
```

```javascript title="main.js (NeonJS)"
// NeonJS 프로젝트는 ES 모듈이라 이벤트 함수를 export 해야 해요.
export function onAlarm(time, label) {
    console.log(`${time} ${label}`);
}
```

새 프로젝트를 만들 때 이벤트를 고르면 함수 틀과 `functionComment`가 기본 코드에 들어가요. 함수 이름이 같은 이벤트가 둘 이상이면 처음 것만 함수로 만들고 나머지는 주석 처리해요.

## 이벤트 호출

### 모든 프로젝트에 보내기

`fireProjectEvent<T>()`는 이 이벤트를 받을 수 있는 모든 프로젝트의 함수를 호출해요.

```kotlin
fireProjectEvent<AlarmEvent>("07:30", "기상") { project, e ->
    log.error { "${project.info.name}에서 onAlarm 실행 실패: ${e.message}" }
}
```

호출되는 프로젝트는 아래 조건을 **모두** 만족해야 해요.

- 컴파일되어 있어요(`project.isCompiled`).
- 켜져 있어요(`project.info.isEnabled`).
- 이 이벤트를 허용했어요(`project.isEventCallAllowed(eventId)`).

### 프로젝트 하나에 보내기

```kotlin
val called: Boolean = project.fireEvent<AlarmEvent>("07:30", "기상") { e ->
    log.error { "onAlarm 실행 실패: ${e.message}" }
}
```

`Project.fireEvent<T>()`는 프로젝트가 이벤트를 허용하지 않으면 `false`를 돌려줘요. `fireProjectEvent<T>()`와 달리 컴파일 여부나 켜짐 여부는 확인하지 않으므로, 필요하면 `project.isCompiled`, `project.info.isEnabled`를 먼저 확인하세요.

### 직접 호출하기

이벤트 ID가 필요하거나 호출 조건을 직접 정하고 싶다면 `ProjectEventManager`와 `Project.callFunction()`을 써요. 웹 서버 플러그인이 쓰는 방식이에요.

```kotlin
val eventId = ProjectEventManager.validateAndGetEventID(AlarmEvent::class) ?: return
if (project.isCompiled && project.isEventCallAllowed(eventId)) {
    project.callFunction("onAlarm", arrayOf("07:30", "기상")) { e ->
        log.error { "onAlarm 실행 실패: ${e.message}" }
    }
}
```

## 인자 검사

`fireProjectEvent`와 `Project.fireEvent`는 함수를 호출하기 전에 인자를 검사해요.

- 넘긴 인자 수가 `argTypes`보다 많으면 예외가 발생해요.
- 각 인자가 `argTypes`의 형식(또는 그 하위 형식)이 아니면 예외가 발생해요.
- 등록하지 않은 이벤트로 호출해도 예외가 발생해요.

스크립트 안에서 생긴 오류는 예외로 던지지 않고 `onFailure`/`onException` 콜백으로 전달돼요.

## 다음 단계

- 이벤트 호출 시점을 앱 이벤트(프로젝트 컴파일, 메시지 수신 등)에 맞추려면 → [이벤트 레퍼런스](/docs/reference/events)
- 실제 예제 → [웹 서버 플러그인 살펴보기](/docs/guides/webserver-example)
