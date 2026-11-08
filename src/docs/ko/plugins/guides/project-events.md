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

    // 이벤트 목록에서 이름과 함께 보이는, 이벤트가 일어나는 때예요. (선택, PluginCore 1.0.1 이상)
    override val description: String = translate {
        Locale.ENGLISH { "When an alarm goes off" }
        Locale.KOREAN  { "알람이 울릴 때" }
    }
}
```

프로젝트 설정의 **받을 이벤트** 목록은 이벤트마다 `usage`, `name`, `description`, 이벤트 ID를 보여 줘요. `usage`는 스크립트가 이벤트를 받는 방법이고, 기본값은 `onAlarm(time, label)`처럼 함수 이름과 인자예요. 함수가 아닌 다른 방법으로 전달하는 이벤트라면 `usage`를 바꾸고, `dispatch()`와 `generateCode()`를 재정의해 전달 방법과 새 프로젝트의 기본 코드를 정할 수 있어요. → [선택 멤버](#선택-멤버)

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

1. 프로젝트 설정의 [받을 이벤트](/docs/app/guides/projects#받을-이벤트)에서 플러그인의 이벤트를 체크해요. 이벤트는 플러그인별로 묶여 있고, 프로젝트의 API 방식과 상관없이 받을 수 있어요. **ID 직접 편집**에서는 와일드카드도 쓸 수 있어서, `clock.*`은 `clock` 플러그인의 모든 이벤트를 받아요.
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

새 프로젝트를 만들 때 이벤트를 고르면 함수 틀과 `functionComment`가 기본 코드에 들어가요. 함수 이름이 같은 이벤트가 둘 이상이면 처음 것만 함수로 만들고 나머지는 주석 처리해요. PluginCore 1.1.0부터는 [대체 함수 이름](#함수-이름이-겹칠-때)을 정해 주석 처리를 피할 수 있어요.

## 선택 멤버

아래 멤버는 모두 기본 구현이 있는 `open` 멤버라 오버라이드는 선택이에요. `description`과 `usage`는 프로젝트 설정의 받을 이벤트 목록에 보이고, [StarLight AI](/docs/plugins/guides/starlight-ai#이벤트)는 `description`, `usage`, `functionName`, `scriptArguments`, `listenerName`을 그대로 써요. [KDoc을 배포](/docs/plugins/guides/starlight-ai#kdoc과-가이드-배포하기)한다면 이벤트 클래스의 KDoc에 스크립트가 받는 인자마다 `@param`을 쓰세요.

| 멤버 | 기본값 | 언제 오버라이드하나 |
|---|---|---|
| `description: String?` **1.0.1+** | `null` | 이벤트가 언제 일어나는지 짧게 설명할 때. 받을 이벤트 목록에 보여요. |
| `usage: String` **1.0.1+** | `functionName(인자, …)` | 스크립트가 이벤트를 받는 방법이 함수가 아닐 때. 예: `myBot.on("message")` |
| `dispatch(project, args, onFailure)` **1.0.1+** | `functionName` 함수를 호출 | 스크립트가 등록한 리스너처럼 다른 방식으로 전달할 때 |
| `generateCode(generator)` **1.0.1+** | `functionName` 함수 하나 | 시작 코드에 함수 말고도 필요한 코드(리스너 등록 등)가 있을 때 |
| `scriptArguments: Array<CodeGenerator.Argument<*>>` **1.1.0+** | `argTypes` | `dispatch`가 스크립트에 넘기는 인자가 이벤트를 발생시킬 때의 인자(`argTypes`)와 다를 때. 예: 원본 대신 래퍼 객체를 넘기는 경우. StarLight AI는 이 값으로 스크립트가 받는 인자를 설명해요. |
| `listenerName: String?` **1.1.0+** | `null` | 스크립트가 함수 이름 대신 리스너를 등록해 받는 이벤트일 때, 등록할 때 쓰는 이름. 예: `bot.on("message", …)`의 `"message"` |
| `alternateFunctionName: String?` **1.1.0+** | `null` | 시작 코드의 함수 이름이 다른 이벤트의 함수 이름과 겹칠 수 있을 때 대신 쓸 이름. `null`이면 겹칠 때 주석 처리돼요. |
| `generateCode(generator, name)` **1.1.0+** | `name`이 `functionName`이면 `generateCode(generator)`, 아니면 `name`으로 된 함수 하나 | `alternateFunctionName`을 정하면서 `generateCode(generator)`도 오버라이드했다면 **반드시 같이 오버라이드하세요.** 그러지 않으면 대체 이름일 때 리스너 등록 코드가 빠진 함수만 생겨요. |

1.1.0 멤버는 오버라이드만 한다면 PluginCore 1.0.x 앱에서도 안전해요. 그 앱은 호출하지 않을 뿐 오류는 나지 않아요. 반대로 플러그인 코드가 `event.scriptArguments`처럼 직접 읽으면 1.0.x 앱에서 `NoSuchMethodError`가 나요.

### 리스너로 받는 이벤트

스크립트가 함수 이름 대신 리스너를 등록해 받는 이벤트의 예시예요.

```kotlin title="MyMessageEvent.kt"
class MyMessageEvent : ProjectEvent() {
    override val id = "message"
    override val name = "My 메시지 이벤트"
    override val functionName = "onMessage"
    override val argTypes: Array<CodeGenerator.Argument<*>> = arrayOf("message" typedAs Message::class)

    // dispatch가 래퍼를 넘기므로, 스크립트가 실제로 받는 인자를 알려 줘요.
    override val scriptArguments: Array<CodeGenerator.Argument<*>> = arrayOf("msg" typedAs MyMessage::class)
    override val listenerName: String = "message"
    override val usage: String get() = "myBot.on(\"message\")"

    // StarLight의 onMessage와 겹치면 onMyMessage로 만들어요.
    override val alternateFunctionName: String get() = "onMyMessage"

    override fun generateCode(generator: CodeGenerator): CodeGenerator.GeneratedFunction =
        generateCode(generator, functionName)

    override fun generateCode(generator: CodeGenerator, name: String): CodeGenerator.GeneratedFunction =
        CodeGenerator.GeneratedFunction(
            imports = listOf("const myBot = MyBot.get();"),
            function = "function $name(msg) {\n}\nmyBot.on(\"message\", $name);",
        )

    override fun dispatch(project: Project, args: Array<out Any>, onFailure: (Throwable) -> Unit) {
        // 등록된 리스너에 MyMessage(args[0] as Message)를 전달
    }
}
```

> [!NOTE]
> NeonJS는 `export`된 함수만 이름으로 호출해요. 그래서 위처럼 `export` 없이 직접 쓴 리스너 함수는 StarLight가 이름으로 다시 호출하지 않아요. 반면 언어의 `CodeGenerator`로 함수를 만들면 NeonJS에서는 `export`가 붙어, 같은 이름의 StarLight 이벤트가 그 함수를 한 번 더 불러요.

### 함수 이름이 겹칠 때

**PluginCore 1.1.0 이상.** 새 프로젝트의 시작 코드를 만들 때, 기본 구현은 함수 이름을 이렇게 정해요.

- 새 프로젝트가 받는 이벤트 중 `alternateFunctionName`이 없는 이벤트들의 함수 이름은 고정 이름으로 봐요. 시작 코드가 없어도 `starlight.*` 같은 와일드카드로 받는 이벤트도 포함돼요.
- `alternateFunctionName`이 있는 이벤트의 함수 이름이 고정 이름과 겹치면, 그 이벤트는 대체 이름을 써요.
- `alternateFunctionName`이 없는 이벤트끼리 이름이 겹치면, 이전처럼 두 번째 것부터 주석 처리해요.

위 예시의 `MyMessageEvent`를 StarLight의 메시지 이벤트(`onMessage`)와 함께 받는 프로젝트라면, 시작 코드에는 `onMyMessage`라는 리스너 함수가 만들어져요. 플러그인 언어가 이 규칙을 어떻게 받는지는 [새 프로젝트 시작 코드](/docs/plugins/reference/plugin#새-프로젝트-시작-코드)를 참고하세요.

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
- 받을 이벤트에 이 이벤트가 들어 있어요(`project.isEventCallAllowed(eventId)`).

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

- 이벤트 호출 시점을 앱 이벤트(프로젝트 컴파일, 메시지 수신 등)에 맞추려면 → [이벤트 레퍼런스](/docs/plugins/reference/events)
- StarLight AI가 이벤트를 어떻게 설명하는지 → [StarLight AI와 플러그인](/docs/plugins/guides/starlight-ai)
- 실제 예제 → [웹 서버 플러그인 살펴보기](/docs/plugins/guides/webserver-example)
