---
title: 이벤트 함수
description: 메시지 수신, 삭제, 알림, 컴파일 같은 일이 생겼을 때 StarLight가 부르는 스크립트 함수와 인자를 정리했어요.
order: 1
---

스크립트에 정해진 이름의 함수를 만들어 두면, 그 일이 생길 때 StarLight가 함수를 불러요. **NeonJS 프로젝트에서는 함수를 `export` 해야** 해요.

```javascript title="NeonJS"
export function onMessage(event) { … }
```

```javascript title="Rhino"
function onMessage(event) { … }
```

## 기본 이벤트

| 함수 | 이벤트 ID | 언제 불리나요 |
|---|---|---|
| `onMessage(event)` | `starlight.message.create` | 메시지를 받았을 때 |
| `onMessageDeleted(event)` | `starlight.message.delete` | 카카오톡에서 가장 최근 메시지가 삭제됐을 때 |
| `response(room, msg, sender, isGroupChat, replier, imageDB, packageName, isMention, logId, channelId, userHash)` | `starlight.message.legacy` | 메시지를 받았을 때. 프로젝트의 API 방식에 **메신저봇 레거시**가 있어야 해요. |
| `onNotificationPosted(sbn, sessionManager)` | `starlight.notification.post` | 아무 앱이나 알림을 올렸을 때. **onNotificationPosted 이벤트 사용**을 켜야 해요. |
| `onNotificationRemoved(sbn, rankingMap, reason)` | `starlight.notification.removed` | 알림이 지워졌을 때. **메신저봇 레거시** 방식이고, 같은 설정을 켜야 해요. |
| `onStartCompile()` | `starlight.project.compile` | 이미 컴파일된 프로젝트를 다시 컴파일하기 직전 |
| `onUncaughtError(error, origin, detail)` | — | 프로젝트의 코드에서 아무도 처리하지 않은 오류가 났을 때 |
| `onProjectButtonClicked(buttonId)` | — | 프로젝트 카드의 사용자 지정 버튼을 눌렀을 때 |

## 메신저봇 API2 이벤트

**메신저봇 API2** 방식의 이벤트는 함수 이름이 아니라 `bot.addListener()`로 등록한 리스너로 전달돼요. 허용 이벤트 ID는 아래와 같고, 리스너와 인자는 [BotManager](/docs/app/reference/script-api#이벤트-방식-botmanager-메신저봇-api2)를 보세요.

| 리스너 (`Event.…`) | 이벤트 ID |
|---|---|
| `MESSAGE` | `starlight.api2.message` |
| `COMMAND` | `starlight.api2.command` |
| `NOTIFICATION_POSTED` | `starlight.api2.notification_posted` |
| `NOTIFICATION_REMOVED` | `starlight.api2.notification_removed` |
| `START_COMPILE` | `starlight.api2.start_compile` |

이벤트는 아래 조건을 모두 만족할 때만 불려요.

- 설정의 **전역 전원**이 켜져 있어요.
- 프로젝트가 컴파일되어 있고, 켜져 있어요. (디버그 룸과 사용자 지정 버튼은 꺼져 있어도 불러요.)
- 프로젝트 설정의 [받을 이벤트](/docs/app/guides/projects#받을-이벤트)에서 그 이벤트가 체크돼 있고, 프로젝트의 API 방식에 그 이벤트가 있어요.

이벤트는 프로젝트마다 순서대로 대기열에 들어가 차례로 실행돼요. 대기열이 가득 차면(256개) 가장 오래된 이벤트부터 버려져요. NeonJS 프로젝트는 한 번에 이벤트 하나를 실행하고, Rhino 프로젝트는 세 개까지 함께 실행해요. 그래서 Rhino에서 여러 이벤트가 같이 쓰는 값은 조심해서 다뤄야 해요.

이벤트 함수나 타이머가 프로젝트 설정의 **느린 실행 경고 (초)**(기본 10초)보다 오래 끝나지 않으면 프로젝트 로그에 경고가 남아요. 무엇이 실행 중이고 몇 개의 이벤트가 기다리는지 알려 주고, 1분이 지날 때와 끝날 때 다시 알려 줘요.

> [!WARNING]
> 이벤트 함수에서 처리하지 않은 오류가 나면 로그에 **실행 중 에러 발생**과 함께 파일, 줄, 열이 남아요. 프로젝트 설정의 **오류 발생시 비활성화**(기본 켜짐)가 켜져 있으면 프로젝트가 꺼지고 컴파일된 코드도 내려가요. 그동안은 디버그 룸에서도 불리지 않으니, 다시 컴파일하고 켜세요. 타이머나 아무도 처리하지 않은 Promise의 오류는 로그에만 남아요. 오류를 직접 받으려면 [onUncaughtError](#onuncaughterror)를 쓰세요.

## onMessage

```javascript title="NeonJS"
export function onMessage(event) {
    const { message, sender, room } = event;
    if (message === "/방정보")
        room.send(`${room.name} (${room.isGroupChat() ? "단체방" : "1:1"}) · ${sender.name}`);
}
```

### event

| 속성 | 형식 | 설명 |
|---|---|---|
| `message` | 문자열 | 메시지 내용이에요. |
| `sender` | 객체 | 보낸 사람이에요. 아래 표를 보세요. |
| `room` | 객체 | 메시지가 온 방이에요. 아래 표를 보세요. |
| `packageName` | 문자열 | 메신저 앱의 패키지 이름이에요 (`com.kakao.talk`). |
| `hasMention` | 불리언 | 멘션이 들어 있는 메시지인지 알려 줘요. 누구를 멘션했는지는 가리지 않아요. |
| `chatLogId` | 숫자 | 카카오톡 메시지 ID예요. 디버그 룸에서는 `-1`이에요. |
| `image` | `Bitmap` 또는 `null` | 알림에 붙은 이미지예요. 대부분 `null`이에요. |

### event.room

| 멤버 | 설명 |
|---|---|
| `name` | 방 이름이에요. 1:1 방은 상대 이름이에요. |
| `id` | 방을 구분하는 문자열이에요. |
| `isGroupChat()` | 단체방이면 `true`예요. |
| `isDebugRoom()` | 디버그 룸에서 온 메시지면 `true`예요. |
| `send(message)` | 이 방에 메시지를 보내요. 성공하면 `true`예요. |
| `sendMedia(files, options?)` | 이 방에 이미지·동영상·파일을 보내요. 디버그 룸에서도 돼요. 상대 경로는 받지 않으니, 프로젝트 안의 파일은 `MediaSharer.send(event, files)`로 보내세요. [파일 보내기](/docs/app/reference/script-api#파일-보내기-mediasharer-room.sendmedia)를 보세요. |
| `markAsRead()` | 이 방의 메시지를 읽음으로 표시해요. |

### event.sender

| 멤버 | 설명 |
|---|---|
| `name` | 보낸 사람 이름이에요. |
| `id` | 보낸 사람 ID예요. Android 9 미만과 디버그 룸에서는 `null`이에요. |
| `profileBase64` | 프로필 이미지의 Base64 문자열이에요. |
| `profileHash` | 프로필 이미지의 해시 값(숫자)이에요. 같은 사람인지 가늠할 때 써요. |
| `profileBitmap` | 프로필 이미지(`Bitmap`)예요. |

> [!IMPORTANT]
> `isGroupChat`과 `isDebugRoom`은 **괄호를 붙여 불러야** 해요. `room.isGroupChat`처럼 괄호 없이 쓰면 함수 자체가 돌아와서 조건문에서 항상 참이 돼요. NeonJS에서는 `room.groupChat`, `room.debugRoom`으로 읽어도 돼요.

> [!TIP]
> 다음 메시지를 답으로 받고 싶다면 [`Chat.waitFor()`](/docs/app/reference/script-api#대화-chat)를 쓰세요. 답이 된 메시지는 기다리던 코드로만 가고, 이 프로젝트의 `onMessage`에는 오지 않아요.

> [!NOTE]
> NeonJS에서 `chatLogId`처럼 2⁵³보다 큰 숫자는 BigInt로 들어와요. 비교할 때는 `String(event.chatLogId)`처럼 문자열로 바꾸세요. [Java와 Android API 쓰기](/docs/neonjs/guides/java#값이-바뀌는-규칙)를 보세요.

## onMessageDeleted

카카오톡에서 **가장 최근에 받은 메시지**가 삭제되면 불려요.

StarLight는 카카오톡이 그 메시지의 알림을 지우는 것으로 삭제를 알아차려요. 그래서 아래와 같은 한계가 있어요.

- 읽지 않은 메시지 중 마지막 메시지가 삭제될 때만 알 수 있어요. 그보다 앞선 메시지의 삭제는 알 수 없어요.
- 기기에서 사람이 그 방을 열어 읽어도 알림이 지워지므로, 삭제와 구분하지 못해 이 함수가 불릴 수 있어요.
- 봇이 카카오톡 방에 답장한 뒤에는 다음 메시지를 받을 때까지 불리지 않아요. StarLight가 직접 읽음 처리하거나 공유로 방을 연 직후에도 불리지 않아요.

| `event` 속성 | 설명 |
|---|---|
| `message` | 삭제된 메시지 내용이에요. |
| `sender` | 보낸 사람 이름(문자열)이에요. |
| `room` | 방이에요. 알 수 없으면 `null`이에요. |
| `packageName`, `chatLogId` | `onMessage`와 같아요. |

## response (레거시)

메신저봇, 채자봇 같은 다른 앱의 봇 코드와 호환되는 함수예요. 프로젝트의 [API 방식](/docs/app/guides/projects#api-방식)에 **메신저봇 레거시**가 있어야 불려요. **StarLight 오리지널**도 함께 고르면 메시지마다 `onMessage` 다음에 `response`도 불려요.

```javascript title="Rhino"
function response(room, msg, sender, isGroupChat, replier, imageDB) {
    if (msg === "/안녕")
        replier.reply(sender + "님 안녕하세요!");
}
```

| 인자 | 설명 |
|---|---|
| `room` | 방 이름이에요. |
| `msg` | 메시지 내용이에요. |
| `sender` | 보낸 사람 이름이에요. |
| `isGroupChat` | 단체방이면 `true`예요. |
| `replier` | 답장 객체예요. 아래 표를 보세요. |
| `imageDB` | 이미지 객체예요. 프로필 이미지는 `getProfileBase64()`, `getProfileHash()`, `getProfileBitmap()`, 사진 메시지는 `getImage()`, `getImageBitmap()`으로 읽어요. |
| `packageName` | 메신저 앱의 패키지 이름이에요 (`com.kakao.talk`). |
| `isMention` | 멘션이 들어 있는 메시지인지 알려 줘요. |
| `logId`, `channelId` | 메시지 ID와 방 ID예요. BigInt이고, 모르면 `0`이에요. |
| `userHash` | 보낸 사람의 고유 ID예요. 모르면 `""`예요. |

디버그 룸에서는 `logId`와 `channelId`가 `0`, `userHash`가 `"DEBUG ROOM"`이에요.

| `replier` 메서드 | 설명 |
|---|---|
| `reply(message)` | 메시지가 온 방에 답장해요. |
| `reply(room, message, hideToast?)` | 방 이름이나 ID로 그 방에 보내요. StarLight가 아는 방이어야 하고, 모르는 방이면 메시지가 온 방으로 보내지 않고 `false`를 돌려줘요. `hideToast`는 받기만 하고 쓰지 않아요. |
| `replyDelayed(message, delay)`, `replyDelayed(room, message, delay)` | `delay`밀리초 뒤에 보내요. |
| `replyWithMarkdown(message)`, `replyWithMarkdown(room, message)` | 카카오톡 공유 화면으로 마크다운을 보내요. 서식은 보낸 기기에서만 보여요. [텍스트 보내기](/docs/app/reference/script-api#텍스트-보내기)를 보세요. |
| `markAsRead()`, `markAsRead(room)` | 방의 메시지를 읽음으로 표시해요. |

## onNotificationPosted

**설정 → 알림, 이벤트**에서 **onNotificationPosted 이벤트 사용**을 켜면, StarLight를 뺀 **모든 앱의 알림**이 이 함수로 들어와요. 인자 `sbn`은 Android의 [`StatusBarNotification`](https://developer.android.com/reference/android/service/notification/StatusBarNotification)이에요. 두 번째 인자 `sessionManager`로 그 알림의 답장·읽음 기능을 쓰거나, `bindSession(room)`으로 그 알림의 방을 답장할 수 있는 방으로 이어요.

```javascript title="NeonJS"
export function onNotificationPosted(sbn) {
    const extras = sbn.getNotification().extras;
    console.log(sbn.getPackageName(), String(extras.getCharSequence("android.title")));
}
```

알림이 많은 기기에서는 부하가 커질 수 있어요. 필요할 때만 켜세요.

메신저봇 레거시 방식에는 알림이 지워질 때 불리는 `onNotificationRemoved(sbn, rankingMap, reason)`도 있어요. `reason`은 Android의 `NotificationListenerService.REASON_*` 값이에요.

## onStartCompile

이미 컴파일된 프로젝트를 다시 컴파일할 때, 이전 상태를 정리하기 **직전에** 불려요. 처음 컴파일할 때는 불리지 않아요. 열어 둔 연결을 닫거나 값을 저장하는 데 쓰고, 오래 걸리는 작업은 하지 마세요. 이 함수에서 오류가 나도 로그에 남기고 컴파일은 계속해요.

## onUncaughtError

프로젝트의 코드에서 아무도 처리하지 않은 오류가 나면, StarLight가 로그에 남긴 뒤 이 함수를 불러요. Node.js의 `process.on("uncaughtException")`과 비슷해요. 오류가 났을 때 방에 알리거나 따로 기록하는 데 써요.

```javascript title="NeonJS"
export function onUncaughtError(error, origin, detail) {
    // origin: "uncaughtException" 또는 "unhandledRejection", detail: { source, args }
    detail.args[0]?.room?.send("문제가 생겼어요.");
}
```

| 오류가 난 곳 | `origin` | `detail.source` | `detail.args` |
|---|---|---|---|
| 이벤트 함수 | `uncaughtException` | 함수 이름(예: `onMessage`) | 함수의 인자 |
| API2 리스너 | `uncaughtException` | `listener` | 빈 배열 |
| NeonJS `async` 이벤트 함수의 Promise | `unhandledRejection` | 함수 이름 | 함수의 인자 |
| 그 밖에 처리하지 않은 Promise (NeonJS) | `unhandledRejection` | `promise` | 빈 배열 |
| `setTimeout`, `setInterval` 콜백 | `uncaughtException` | `setTimeout`, `setInterval` | 빈 배열 |
| `Schedule`, `Chat.waitFor` 콜백 | `uncaughtException` | 콜백 이름(예: `Schedule.daily`) | 빈 배열 |

- `error`는 코드가 던진 값 그대로예요(`error instanceof Error`, `error.message`). Java 예외는 Java 객체로 와서 `error.message`는 읽을 수 있지만 `Error`는 아니에요.
- 이 함수가 프로젝트를 지켜 주지는 않아요. **오류 발생시 비활성화**가 켜져 있으면 이벤트 함수의 오류로 이 함수가 끝난 직후 프로젝트가 꺼져요. 첫 `await` 전에 한 일만 확실히 실행되니, 답장은 그 전에 보내세요.
- 1분에 10번까지 불려요. 그 뒤로는 한동안 로그에만 남아요. 이 함수가 3번 잇달아 실패하면 다시 컴파일할 때까지 불리지 않아요.
- 컴파일 중 최상위 코드의 오류(컴파일 실패)와, 다시 컴파일하며 멈춘 코드의 오류에는 불리지 않아요.
- Rhino에서는 Promise의 거부를 알 수 없어서 `origin`이 늘 `uncaughtException`이에요.

## onProjectButtonClicked

프로젝트 설정의 **실험적 기능 → 사용자 지정 버튼**에 버튼을 추가하면 프로젝트 카드에 버튼이 생겨요. 버튼을 누르면 버튼에 정한 ID가 `buttonId`로 넘어와요. 프로젝트가 컴파일되어 있어야 하고, 꺼져 있어도 불려요.

```javascript title="NeonJS"
let count = 0;

export function onMessage(event) {
    count++;
}

export function onProjectButtonClicked(buttonId) {
    if (buttonId === "reset") {
        count = 0;
        Log.i("button", "초기화했어요");
    }
}
```

## 플러그인 이벤트

플러그인이 더한 이벤트도 같은 방식으로 받아요. 프로젝트 설정의 **받을 이벤트**에서 그 플러그인의 이벤트를 체크하고(ID로는 예: `webserver.*`), 플러그인이 정한 이름의 함수를 만들어요. 함수 이름과 인자는 각 플러그인의 문서를 보세요.
