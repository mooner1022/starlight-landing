---
title: 이벤트
description: EventHandler로 메시지, 프로젝트, 알림, 로그 같은 앱 이벤트를 구독하고 발생시켜요.
order: 2
---

StarLight는 앱 안에서 일어나는 일을 코루틴 `SharedFlow`로 흘려보내요. 플러그인은 `EventHandler`로 원하는 이벤트를 구독할 수 있어요.

> [!NOTE]
> 이 페이지의 이벤트는 **앱 이벤트**예요. 스크립트 함수를 부르는 [프로젝트 이벤트](/docs/guides/project-events)와는 다른 개념이에요.

## 구독

```kotlin
inline fun <reified T : Event> EventHandler.on(
    scope: CoroutineScope = EventHandler,
    noinline callback: suspend T.() -> Unit,
): Job
```

```kotlin
private var scope: CoroutineScope? = null

override fun onEnable() {
    val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default).also { scope = it }

    EventHandler.on<Events.Message.Create>(scope) {
        if (message.message == "/ping")
            message.room.send("pong")
    }
}

override fun onDisable() {
    scope?.cancel() // 구독도 함께 취소돼요.
}
```

- 콜백은 이벤트 객체를 수신 객체(`this`)로 받아요. 위 예시의 `message`는 `Events.Message.Create.message`예요.
- 콜백은 이벤트마다 새 코루틴에서 실행되고, 콜백에서 던진 예외는 로그로만 남아요.
- **플러그인 전용 스코프**를 넘기세요. 기본값인 `EventHandler` 스코프로 구독하면 플러그인을 꺼도 구독이 남아요.
- 위젯 안에서는 `WidgetScope.on<T> { }`를 쓰면 화면이 보이는 동안만 구독해요.

## 발생시키기

```kotlin
suspend fun EventHandler.fireEvent(event: Event)
fun EventHandler.fireEventWithScope(event: Event, scope: CoroutineScope = EventHandler): Job
```

`Event`를 구현한 클래스를 직접 만들어 플러그인끼리 주고받을 수도 있어요. `Event`는 `CoroutineScope`를 상속하므로, 기본 이벤트들처럼 `CoroutineScope by eventHandlerScope()`로 위임하면 돼요.

```kotlin
class AlarmRang(
    val label: String,
    val coroutineScope: CoroutineScope = eventHandlerScope(),
) : Event, CoroutineScope by coroutineScope

EventHandler.fireEventWithScope(AlarmRang("기상"))
```

> [!CAUTION]
> `Events.Locale.Update`처럼 앱이 관리하는 이벤트를 플러그인이 발생시키면 앱 상태가 꼬일 수 있어요. 기본 이벤트는 구독만 하세요.

`EventHandler.eventFlow`로 모든 이벤트가 흐르는 `SharedFlow<Event>`에 직접 접근할 수도 있어요.

## 이벤트 목록

모든 이벤트는 `dev.mooner.starlight.plugincore.event.Events` 안에 있어요.

### 메시지

| 이벤트 | 속성 | 발생 시점 |
|---|---|---|
| `Events.Message.Create` | `message: Message` | 메신저 메시지를 받았을 때 |

### 프로젝트

| 이벤트 | 속성 | 발생 시점 |
|---|---|---|
| `Events.Project.Create` | `project: Project` | 프로젝트가 만들어졌을 때 |
| `Events.Project.Compile` | `project: Project` | 프로젝트가 컴파일됐을 때 |
| `Events.Project.InfoUpdate` | `project: Project` | 프로젝트 정보(허용 이벤트 등)가 바뀌었을 때 |
| `Events.Project.Delete` | `projectName: String`, `projectId: ProjectID` | 프로젝트가 삭제됐을 때 |

### 알림

| 이벤트 | 속성 | 발생 시점 |
|---|---|---|
| `Events.Notification.Post` | `statusBarNotification`, `context` | 기기에 알림이 올라왔을 때 |
| `Events.Notification.Dismiss` | `sbn`, `rankingMap`, `reason` | 알림이 사라졌을 때 |
| `Events.Notification.Click` | `notificationId: Int` | 알림을 눌렀을 때 |

### 그 밖의 이벤트

| 이벤트 | 속성 | 발생 시점 |
|---|---|---|
| `Events.Log.Create` | `log: LogData` | 로그가 남았을 때 |
| `Events.Config.GlobalConfigUpdate` | — | 앱 전역 설정이 바뀌었을 때 |
| `Events.Scheme.SchemeOpenEvent` | `params: Map<String, String>` | `starlight://action/…` 링크가 열렸을 때 |
| `Events.Locale.Update` | `locale: Locale` | 앱 언어가 바뀌었을 때 |

모든 이벤트에는 `coroutineScope` 속성도 있어요.

## 메시지 객체

`Events.Message.Create.message`의 형식이에요.

```kotlin
data class Message(
    val message     : String,      // 본문
    val image       : Bitmap?,     // 이미지 메시지일 때
    val sender      : ChatSender,
    val room        : ChatRoom,
    val packageName : String,      // 메신저 앱 패키지 이름
    val hasMention  : Boolean,
    val chatLogId   : Long,
)
```

| `ChatRoom` | 설명 |
|---|---|
| `id`, `name` | 방 ID와 이름이에요. |
| `isGroupChat` | 단체방인지 알려 줘요. |
| `isDebugRoom` | 앱의 디버그룸에서 온 메시지인지 알려 줘요. |
| `send(message): Boolean` | 그 방에 답장을 보내요. |
| `markAsRead(): Boolean` | 그 방의 메시지를 읽음으로 표시해요. |

| `ChatSender` | 설명 |
|---|---|
| `name` | 보낸 사람 이름이에요. |
| `id` | 보낸 사람 ID예요. Android 9(P) 이상에서는 `null`이에요. |
| `profileBitmap`, `profileBase64`, `profileHash` | 프로필 이미지와 그 Base64 문자열, 해시예요. |
