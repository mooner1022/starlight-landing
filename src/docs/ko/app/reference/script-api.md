---
title: 스크립트 API
description: StarLight가 스크립트에 넣어 주는 전역 API(Api, MediaSharer, Log, Store, Chat, Schedule, Format, DataBase, FileStream, Device 등)를 정리했어요.
order: 2
---

StarLight는 프로젝트를 컴파일할 때 프로젝트의 [API 방식](/docs/app/guides/projects#api-방식)에 든 전역 API를 스크립트에 넣어 줘요. NeonJS와 Rhino 프로젝트 모두에서 같은 이름으로 쓸 수 있어요. 켜져 있는 플러그인이 등록한 API도 방식과 상관없이 함께 들어와요.

| API 방식 | 들어오는 전역 |
|---|---|
| **StarLight 오리지널** | `Log`, `Store`, `Chat`, `Schedule`, `Format`, `MediaSharer`, `Env`, `Notification`, `HomeWidget`, `Projects`, `Plugins`, `Languages`, `Platform`, `Java`, `EventEmitter` |
| **메신저봇 API2** | `Log`, `BotManager`, `Event`, `App`, `Database`, `Broadcast`, `Device`, `FileStream`, `AppData`, `GlobalLog`, `Http`, `Security` |
| **메신저봇 레거시** | `Log`, `Api`, `Utils`, `DataBase`, `Bridge`, `Broadcast`, `Device`, `FileStream`, `AppData`, `GlobalLog`, `Http`, `Security` |

여러 방식을 고르면 전역을 합쳐서 넣고, 함께 든 전역은 한 번만 들어가요. 메신저봇 방식의 API는 메신저봇 R과 같게 동작하도록 맞췄어요.

> [!TIP]
> 에디터의 자동 완성에도 이 API들이 나와요. `Api.`까지 치면 쓸 수 있는 메서드 목록을 볼 수 있어요.

## 답장과 프로젝트 제어: Api

메신저봇 레거시 방식의 API예요. 방은 이름(문자열), ID(BigInt나 정수) 또는 방 객체로 넘겨요. StarLight가 아는 방이면 어느 메신저의 방이든 보낼 수 있어요. 앱이 시작된 뒤 메시지가 온 방과, 시작할 때 아직 알림이 떠 있던 방이에요.

| 메서드 | 설명 |
|---|---|
| `Api.replyRoom(room, message, hideToast?)` | 방에 메시지를 보내요. 모르는 방이면 `false`예요. `hideToast`는 받기만 하고 쓰지 않아요(안내 토스트를 띄우지 않아요). |
| `Api.replyToID(roomId, message, hideToast?)` | 방 ID(`event.room.id`, BigInt 등)로 보내요. |
| `Api.replyRoomWithMarkdown(room, message)`, `Api.replyToIDWithMarkdown(roomId, message)` | 카카오톡 공유 화면으로 마크다운을 보내요. [텍스트 보내기](#텍스트-보내기)를 보세요. |
| `Api.canReply(room)` | 그 방에 보낼 수 있는지 알려 줘요. |
| `Api.markAsRead(room?, packageName?)`, `Api.markAsReadOnID(roomId)` | 방의 메시지를 읽음으로 표시해요. |
| `Api.getScriptNames()` | 모든 프로젝트 이름 목록이에요. |
| `Api.reload(name?)`, `Api.compile(name?)`, `Api.prepare(name?)` | 프로젝트를 컴파일해요. 이름을 빼면 `reload`·`compile`은 **모든** 프로젝트를, `prepare`는 자기 프로젝트를 컴파일해요. |
| `Api.on(name?)`, `Api.off(name?)`, `Api.isOn(name)` | 프로젝트를 켜고 끄고, 켜져 있는지 알려 줘요. 이름을 빼면 모든 프로젝트예요. |
| `Api.isCompiled(name)`, `Api.isCompiling(name)`, `Api.unload(name)` | 컴파일 여부와 컴파일 중인지 알려 주거나, 컴파일된 상태를 버려요. |
| `Api.showToast(text, length?)` | 짧은 안내 메시지를 띄워요. `length`를 빼면 짧게 띄워요. |
| `Api.makeNoti(title, content, id?)` | 기기 알림을 띄우고 성공하면 `true`예요. |
| `Api.UIThread(fn, callback?)` | `fn`을 메인 스레드에서 실행해요. `callback(error, result)`로 결과를 받아요. |
| `Api.getContext()` | 앱의 Android `Context`예요. |
| `Api.gc()`, `Api.getActiveThreadsCount()`, `Api.interruptThreads()`, `Api.isTerminated()` | 메신저봇 호환 메서드예요. 스레드 대신 이 프로젝트의 이벤트 작업을 세고 멈춰요. |

## 파일 보내기: MediaSharer, room.sendMedia

이미지·동영상·파일을 채팅방에 보내요. 카카오톡 방에는 카카오톡의 공유 화면을 열어 보내고, **디버그룸에서는 채팅에 그 파일이 바로 보여요.** 그래서 파일을 보내는 봇도 디버그룸에서 시험할 수 있어요.

| API | 설명 |
|---|---|
| `MediaSharer.send(room, files, options?)` | `room`은 `msg`, `msg.room`, 카카오톡 채널 ID(문자열 또는 BigInt), 메시지를 받은 적 있는 방 이름이에요. 상대 경로는 **프로젝트 폴더** 기준이에요. |
| `msg.room.sendMedia(files, options?)` | 그 방에 보내요. 어느 프로젝트가 불렀는지 모르므로 **상대 경로는 받지 않아요.** 절대 경로·URL 등을 쓰거나 `MediaSharer.send`를 쓰세요. |
| `MediaSharer.sendText(room, text, options?)`, `MediaSharer.sendTextToMemo(text, options?)` | 텍스트를 공유 화면으로 보내요. [텍스트 보내기](#텍스트-보내기)를 보세요. |
| `MediaSharer.leave(to?, delay?)` | 카카오톡에서 나가요. `"home"`(기본), `"starlight"`, 패키지 이름. 채팅방이 열려 있는 동안에는 카카오톡이 그 방의 알림을 보내지 않아요. |
| `MediaSharer.getRooms()`, `MediaSharer.findRoom(name)` | 메시지를 받은 카카오톡 방 목록과 이름으로 찾은 방이에요(`id`, `name`, `isGroupChat`, `lastSeen`, `userId`). |
| `MediaSharer.clearCache(target?)` | 캐시를 비워요. URL이나 캐시 키를 주면 그것만 지워요. |
| `MediaSharer.hasOverlayPermission()` | '다른 앱 위에 표시' 권한이 있는지 알려 줘요. 없으면 StarLight가 화면에 떠 있을 때만 보낼 수 있어요. |

`files`는 경로(`/sdcard/...`, `file://...`), `http(s)` URL, data URL, Base64 문자열(`base64:...`), Java `byte[]`, NeonJS의 `Uint8Array`·`ArrayBuffer`, `Bitmap`(예: `msg.image`) 중 하나이거나 이들의 배열이에요. 형식은 내용으로 판별해요.

`options`는 `{ fileName, timeout, cache, headers, leave }`예요. 모르는 키는 오타로 보고 거부해요. `leave`는 보낸 뒤 이동할 화면으로 `"home"`(또는 `true`), `"starlight"`, 패키지 이름, `"stay"`(또는 `false`)예요. 빼면 앱의 **전송 후** 설정을 따르는데, 기본값은 홈 화면이에요.

보내기는 **바로 반환**하고 결과는 나중에 알려 줘요. NeonJS에서는 Promise라 `await`할 수 있고, Rhino에서는 `CompletableFuture`라 `.join()`으로 기다려요. 실패해도 예외 없이 `ok: false`로 끝나요.

| 결과 | 설명 |
|---|---|
| `ok` | 방이 파일을 받았는지 |
| `sent`, `failed` | 보낸 파일 수, 준비하지 못해 뺀 파일 수 |
| `error` | 하나도 못 보냈을 때 그 이유 |
| `errors` | 뺀 파일마다 `파일: 이유` |
| `room`, `via` | 방 이름과 ID, 다른 경로로 보냈을 때 그 방법(`"user 95"`, `"chooser"`) |

```javascript title="NeonJS"
export async function onMessage(msg) {
    if (msg.message === "!고양이") {
        const r = await MediaSharer.send(msg, "https://example.com/cat.jpg", { leave: "home" });
        if (!r.ok)
            msg.room.send("전송 실패: " + r.error);
    }
}
```

> [!TIP]
> `send_debug_message`의 답장에는 봇이 보낸 파일이 `files`(이름, 형식, 크기)로 들어와요. 이미지에는 `image` ID가 붙어서, `view_image`에 넘기면 그 이미지를 직접 볼 수 있어요.

전송 설정(다운로드 제한 시간, 최대 파일 크기, 전송 후 동작, 캐시)은 앱의 [설정 > 미디어 전송](/docs/app/guides/settings#미디어-전송)에 있어요.

### 텍스트 보내기

`MediaSharer.sendText(room, text, options?)`는 알림의 답장 대신 파일을 보낼 때처럼 카카오톡과 방을 열어 텍스트를 보내요. 그래서 서식을 붙일 수 있어요. 결과는 `send`와 같은 형식이고, 카카오톡을 시작하면 이행돼요. 카카오톡이 실제로 보냈는지는 알 수 없어요. 비밀채팅, 카카오톡 채널과의 채팅, 조용한 채팅방에는 보낼 수 없어요.

| 옵션 | 설명 |
|---|---|
| `markdown` | `true`면 마크다운(`**굵게**`, `*기울임*`, `` `코드` ``, `- 목록`)으로 보내요. **서식은 보낸 기기에서만 보이고, 방의 다른 사람에게는 서식 없는 텍스트로 보여요.** |
| `spoilers` | 탭해야 보이는 부분이에요. `[{ start, length }]` 또는 `[[start, length]]`로, 0부터 세는 글자 위치예요. `markdown`과 함께 쓸 수 없어요. |
| `emoticons` | 미니 이모티콘이에요. ID(`"<아이템 코드>_<번호>"`)나 `{ id, at, length }`로 텍스트의 `(…)` 자리를 바꿔요. 카카오톡 계정이 가진 이모티콘만 보내지고, 나머지는 글자로 남아요. |
| `leave` | 보낸 뒤 이동할 화면이에요. 파일 보내기와 같아요. |

`MediaSharer.sendTextToMemo(text, options?)`는 StarLight가 실행 중인 Android 사용자의 카카오톡에서 **나와의 채팅**으로 보내요. 화면을 열지 않고 바로 보내므로 `leave`는 무시돼요. 디버그룸에서는 두 메서드 모두 서식 없이 채팅에 보여요.

```javascript title="NeonJS"
export async function onMessage(msg) {
    if (msg.message === "!정답")
        await MediaSharer.sendText(msg, "정답: 스포일러", { spoilers: [[4, 4]] });
}
```

## 로그: Log, GlobalLog

`Log`는 프로젝트 로그에 기록을 남겨요. 로그는 로그 탭과 에디터 서랍의 로그 탭에서 볼 수 있어요.

| 메서드 | 단계 |
|---|---|
| `Log.v()`, `Log.verbose()` | 상세 |
| `Log.d()`, `Log.debug()` | 디버그 (앱 로그에만 남아요) |
| `Log.i()`, `Log.info()` | 정보 |
| `Log.w()`, `Log.warn()` | 경고 |
| `Log.e()`, `Log.error()` | 오류 |
| `Log.wtf()` | 심각 |
| `Log.clear()` | 이 프로젝트의 로그를 지워요. |

모든 메서드는 `Log.i(message)` 또는 `Log.i(tag, message)`로 불러요. 메신저봇처럼 `Log.i(data, true)`로 두 번째 인자에 `Boolean`을 넘기면 토스트로도 띄워요. 두 언어 모두 `console.log()` 등도 같은 로그에 남아요.

`GlobalLog`(메신저봇 방식)는 프로젝트 로그가 아니라 앱 전체 로그에 남겨요. `GlobalLog.i(data, toast?)`, `d`, `e`, `log`, `read`, `clear`가 있어요.

## 데이터 저장

### Store

StarLight 오리지널 방식의 저장소예요. 컴파일과 앱 재시작 후에도 남는 값을 프로젝트 폴더의 `data/store/<이름>.json`에 JSON으로 저장해요.

```javascript title="NeonJS"
const scores = Store.open("scores");

export function onMessage(msg) {
    if (msg.message !== "!점수") return;
    const total = scores.update(msg.sender.name, (n) => (n ?? 0) + 1);
    msg.room.send(`${msg.sender.name}: ${total}`);
}
```

| 메서드 | 설명 |
|---|---|
| `Store.open(name)` | 이름이 `name`인 저장소를 열어요. 이름은 64자 이하의 영문자, 숫자, `_`, `-`, `.`이고 `.`으로 시작할 수 없어요. |
| `store.get(key, defaultValue?)` | 값의 복사본이에요. 없으면 `defaultValue`(빼면 `null`)예요. |
| `store.set(key, value)` | 값을 저장해요. `JSON.stringify`로 쓸 수 있는 값이어야 해요. |
| `store.update(key, fn)` | 이전 값을 `fn`에 넘겨 받은 새 값으로 바꾸고, 그 값을 돌려줘요. 그 사이에 다른 변경이 끼어들지 않아요. |
| `store.has(key)`, `store.delete(key)`, `store.keys()`, `store.getAll()`, `store.clear()` | 값이 있는지, 지우기, 키 배열, 모든 값, 모두 지우기 |
| `store.save()` | 지금 바로 파일에 저장해요. 아니어도 1초 안에, 다시 컴파일하거나 프로젝트를 끌 때 저장돼요. |

- 값은 복사본이에요. 가져온 객체를 고친 뒤에는 `set()`으로 다시 저장해야 해요.
- `event.sender` 같은 Java 객체는 그대로 저장되지 않아요. 필요한 값만 꺼내 저장하세요. NeonJS에서는 BigInt를 JSON으로 쓸 수 없으니 64비트 ID는 `String(id)`로 저장하세요.
- 프로젝트가 실행 중일 때 파일을 직접 고쳐도 돼요. 고친 내용은 다음에 `Store.open()`할 때(다시 컴파일한 뒤 등) 읽어요.

### DataBase

메신저봇 레거시 방식이에요. 프로젝트 폴더의 `data/` 안에 텍스트 파일로 저장해요. 점이 없는 이름에는 `.txt`가 붙어요(`"count"` → `count.txt`). 하위 폴더도 쓸 수 있어요.

| 메서드 | 설명 |
|---|---|
| `DataBase.setDataBase(file, data)` | 파일에 내용을 써요. 없으면 만들어요. |
| `DataBase.getDataBase(file)` | 파일 내용을 읽어요. 파일이 없으면 `null`이에요. |
| `DataBase.appendDataBase(file, data)` | 파일 끝에 덧붙여요. 파일이 없으면 만들어요. |
| `DataBase.removeDataBase(file)` | 파일을 지워요. |
| `DataBase.exists(file)`, `DataBase.getFileSize(file)`, `DataBase.listFiles()`, `DataBase.clearDataBase(file)` | 있는지, 크기, 파일 목록, 내용 비우기 |

```javascript
const count = Number(DataBase.getDataBase("count.txt") ?? "0");
DataBase.setDataBase("count.txt", String(count + 1));
```

### Database (API2)

메신저봇 API2 방식이에요. 프로젝트 폴더의 `Database/` 안에 파일로 저장해요. 레거시의 `DataBase`와는 다른 폴더예요.

| 메서드 | 설명 |
|---|---|
| `Database.writeString(name, text)`, `Database.readString(name)` | 텍스트를 쓰고 읽어요. 없으면 `null`이에요. |
| `Database.writeObject(name, value)`, `Database.readObject(name)` | JSON으로 쓰고 읽어요. |
| `Database.exists(name)` | 파일이 있는지 알려 줘요. |

### AppData

메신저봇 방식의 키-값 저장소예요. **모든 프로젝트가 함께 쓰는** 하나의 저장소라서, 한 프로젝트만 쓸 값은 `Store`나 `Database`에 두는 게 좋아요. `putString`·`getString`, `putInt`·`getInt`, `putLong`, `putFloat`, `putBoolean`, `putObject`·`getObject`, `putMultiple`, `contains`, `remove`, `getAll`, `getAllKeys`, `size`, `clear`가 있어요. 다른 형식으로 저장된 값을 읽으면 오류가 나요.

### FileStream

기기의 아무 경로에나 읽고 써요. 경로는 **절대 경로**로 적어요(예: `/sdcard/StarLight/shared/memo.txt`).

| 메서드 | 설명 |
|---|---|
| `FileStream.read(path)` | 파일 내용을 읽어요. 없거나 실패하면 `null`이에요. |
| `FileStream.write(path, data)`, `FileStream.save(path, data, append?)` | 파일에 써요. 상위 폴더가 없으면 만들어요. |
| `FileStream.append(path, data)` | 파일 끝에 덧붙여요. 파일과 상위 폴더가 없으면 만들어요. |
| `FileStream.remove(path)` | 파일을 지워요. 성공하면 `true`예요. |
| `FileStream.readJson(path)`, `FileStream.writeJson(path, value)` | JSON으로 읽고 써요. |
| `FileStream.exists(path)`, `isFile`, `isDirectory`, `listFiles`, `createDir`, `copyFile`, `moveFile` | 파일과 폴더 다루기 |

### Env

프로젝트 폴더의 `.env` 파일에 적은 값을 읽어요. API 키처럼 코드에 직접 적고 싶지 않은 값을 두기에 좋아요.

```text title=".env"
# 주석
API_KEY=abcd1234
USER_NAME=별빛
GREETING="안녕하세요, ${USER_NAME}"
```

```javascript
const key = Env.get("API_KEY");
```

- 한 줄에 `이름=값`으로 적어요. 이름은 영문자, 숫자, `_`만 쓸 수 있어요.
- `"큰따옴표"` 값과 따옴표 없는 값에서는 `${다른_이름}`으로 **앞에서 정의한** 값을 끼워 넣을 수 있어요. `'작은따옴표'` 값은 적은 그대로예요.
- 형식이 틀리면 로그에 **환경 변수 파일(…) 로드 실패**가 남고 `Env`는 비어 있어요.
- 모든 값은 문자열이에요. `.env`를 고친 뒤에는 다시 컴파일해야 반영돼요. `Env`에 값을 넣을 수는 없어요.

## 대화: Chat

StarLight 오리지널 방식이에요. 다음 메시지를 답으로 기다리거나, 이벤트 없이 보낼 방을 찾아요.

```javascript title="NeonJS"
export async function onMessage(msg) {
    if (msg.message !== "!가입") return;
    msg.room.send("닉네임을 입력해주세요.");
    const answer = await Chat.waitFor(msg, 30000);
    msg.room.send(answer ? `${answer.message}님, 환영합니다!` : "시간이 초과되었습니다.");
}
```

| 메서드 | 설명 |
|---|---|
| `Chat.waitFor(target, options?, callback?)` | `target`이 메시지(`msg`)면 같은 방 같은 사람의, 방(`msg.room`)이면 그 방 누구든의 다음 메시지를 기다려요. `options`는 밀리초 숫자나 `{ timeout }`이고 1~600000, 기본 60000이에요. 오지 않으면 `null`이에요. |
| `Chat.findRoom(nameOrId)` | 이름이나 ID로 방을 찾아요. 없으면 `null`이에요. |
| `Chat.getRooms()` | 보낼 수 있는 방의 배열이에요. 앱이 시작된 뒤 메시지가 온 방과, 시작할 때 알림이 떠 있던 방이에요. |

- NeonJS에서는 Promise를 돌려줘요. Rhino에서는 `CompletableFuture`를 돌려주는데, `.join()`은 기다리는 동안 프로젝트의 작업자 하나를 붙잡으니 세 번째 인자로 콜백을 넘기세요: `Chat.waitFor(msg, 30000, function (answer) { … })`.
- 답이 된 메시지는 기다리던 코드에만 가요. 이 프로젝트의 `onMessage`, `response`, API2 리스너에는 가지 않고, 다른 프로젝트에는 평소처럼 가요.
- 기다림을 시작한 메시지는 답이 되지 않아요. 같은 대상을 다시 기다리면 이전 기다림은 `null`로 끝나고, 다시 컴파일하면 모든 기다림이 끝나요.

## 예약 작업: Schedule

StarLight 오리지널 방식이에요. 기기의 시계와 시간대로 정한 시각에 코드를 실행해요.

```javascript title="NeonJS"
// 매일 9시
Schedule.daily("09:00", () => Chat.findRoom("가족방")?.send("좋은 아침!"));
// 평일 18시 30분
Schedule.cron("30 18 * * 1-5", (run) => Log.i("schedule", `${run.lateMillis}ms 늦게 실행됨`));
```

| 메서드 | 설명 |
|---|---|
| `Schedule.daily(time, fn)` | 매일 `"HH:mm"`(또는 `"HH:mm:ss"`)에 실행해요. |
| `Schedule.cron(expression, fn)` | 5개 필드의 cron 표현식(`분 시 일 월 요일`)대로 실행해요. |
| `Schedule.once(time, fn)` | 한 번 실행해요. `time`은 `Date`, 밀리초, ISO 8601 문자열이에요. |
| `Schedule.getTasks()`, `Schedule.cancelAll()` | 위 작업의 배열, 모두 취소하기 |
| `Schedule.on(name, handler)`, `Schedule.at(time, name, data?)` | 재시작 후에도 남는 작업이에요. 아래를 보세요. |
| `Schedule.getStored()`, `Schedule.cancel(name)` | 남겨 둔 작업의 배열, 이름으로 취소하기 |

- 작업은 프로젝트가 컴파일되어 켜져 있을 때만 실행돼요. 꺼져 있는 동안 도래한 실행은 건너뛰어요.
- `daily`·`cron`·`once` 작업은 다시 컴파일하면 모두 취소돼요. 컴파일할 때마다 실행되는 최상위 코드에서 예약하세요. 한 프로젝트에 100개까지예요.
- 각 함수는 작업을 돌려주고, `task.cancel()`로 취소해요. 콜백은 실행 정보(`run.scheduledAt`, `run.lateMillis`)를 받아요. 콜백의 오류는 로그에 남고 프로젝트를 끄지 않아요.

`Schedule.at(time, name, data?)`는 작업을 프로젝트 폴더의 `data/schedule/stored.json`에 남겨서, 다시 컴파일하거나 앱을 다시 시작해도 남아요. 실행할 함수는 최상위 코드에서 `Schedule.on(name, (data, run) => …)`로 이름에 등록해요. 앱이나 프로젝트가 꺼져 있는 동안 시각이 지난 작업은 다시 켜졌을 때 한 번 실행되니, 너무 늦었으면 `run.lateMillis`를 보고 건너뛰세요. `data`는 JSON으로 16 KiB까지, 작업은 100개까지예요.

```javascript title="NeonJS"
Schedule.on("remind", (data, run) => Chat.findRoom(data.room)?.send(data.text));

export function onMessage(msg) {
    if (msg.message === "!알림")
        Schedule.at(Date.now() + 3600_000, "remind", { room: msg.room.name, text: "1시간이 지났어요." });
}
```

## 문자열 만들기: Format

StarLight 오리지널 방식이에요. NeonJS에 없는 `Intl`과 `toLocaleString()` 대신 쓸 수 있고, 두 언어에서 똑같이 동작해요.

| 메서드 | 예 |
|---|---|
| `Format.number(value, fractionDigits?)` | `Format.number(1234567.5)` → `"1,234,567.5"`, `Format.number(1234.5, 2)` → `"1,234.50"` |
| `Format.date(time, pattern, zone?)` | `Format.date(new Date(), "M월 d일 (E) HH:mm")` → `"11월 12일 (목) 09:30"`. 패턴은 Java `DateTimeFormatter`의 패턴이에요. |
| `Format.duration(millis)` | `Format.duration(3725000)` → `"1시간 2분 5초"` |
| `Format.josa(word, pair)` | `Format.josa("사과", "을/를")` → `"사과를"`. `"이/가"`, `"은/는"`, `"과/와"`, `"으로/로"` 등을 써요. |

## 기기와 앱

### Device

| 메서드 | 설명 |
|---|---|
| `Device.getBatteryLevel()` | 배터리 잔량(%)이에요. |
| `Device.isCharging()`, `Device.getPlugType()` | 충전 중인지(무선 충전 포함), 충전 방식(`"ac"`, `"usb"`, `"wireless"`, `"unknown"`)을 알려 줘요. |
| `Device.getBatteryTemperature()`, `Device.getBatteryVoltage()`, `Device.getBatteryHealth()` | 배터리 온도(섭씨의 10배, `315`는 31.5 °C), 전압(mV), 상태예요. |
| `Device.getAndroidVersionCode()`, `Device.getAndroidVersionName()` | Android 버전이에요. |
| `Device.getPhoneBrand()`, `Device.getPhoneModel()` | 브랜드(`Build.BRAND`, 예: `"samsung"`)와 기기 코드명(`Build.DEVICE`)이에요. |
| `Device.isScreenOn()`, `Device.isPowerSaveMode()` | 화면이 켜져 있는지, 절전 모드인지 알려 줘요. |
| `Device.getFreeMemory()`, `Device.getTotalMemory()`, `Device.getFreeStorageSpace(path)`, `Device.getTotalStorageSpace(path)` | 메모리와 저장 공간이에요. |
| `Device.getWifiName()` | 연결된 Wi-Fi 이름이에요. StarLight는 위치 권한을 요청하지 않아서 대부분 `"<unknown ssid>"`예요. |
| `Device.acquireWakeLock(flags, tag?, timeout?)`, `Device.releaseWakeLock()` | 기기가 잠들지 않게 붙잡거나 놓아요. |

### Utils

| 메서드 | 설명 |
|---|---|
| `Utils.getWebText(url)` | 웹 페이지의 HTML을 문자열로 가져와요. 실패하면 `null`이에요. |
| `Utils.parse(url)` | 웹 페이지를 [jsoup](https://jsoup.org/) `Document`로 가져와요. `select()`로 원하는 요소를 골라요. |
| `Utils.removeTags(html)`, `Utils.xmlToJson(xml)` | 태그를 지운 텍스트, XML을 JSON으로 바꾼 값이에요. |
| `Utils.randomAlphanumeric(length)`, `Utils.getRandomUserAgent()` | 임의 문자열, 실제 브라우저의 User-Agent예요. |
| `Utils.lw`, `Utils.compress()` | 카카오톡의 "전체 보기"를 만드는 보이지 않는 문자열이에요. `"요약" + Utils.lw + "\n긴 내용"`처럼 써요. |
| `Utils.toast(text)`, `Utils.vibrate(seconds)`, `Utils.copyToClipboard(text)` | 토스트, 진동, 클립보드 복사 |
| `Utils.sleep(ms)`, `Utils.delay(ms)` | 기다려요. 기다리는 동안 작업자를 붙잡아요. |
| `Utils.measureTimeMillis(fn)`, `Utils.measureNanoTime(fn)`, `Utils.isUndefined(value)` | 실행 시간 재기, `undefined`인지 알아보기 |

```javascript
const doc = Utils.parse("https://example.com");
const title = doc.select("h1").first().text();
```

> [!NOTE]
> `Utils.getWebText()`와 `Utils.parse()`는 응답이 올 때까지 기다려요. NeonJS 프로젝트에서는 [`fetch`](/docs/neonjs/guides/async#fetch)를 쓰면 기다리는 동안 다른 이벤트를 처리할 수 있어요.

### App, Platform

| 메서드 | 설명 |
|---|---|
| `App.getContext()` | 앱의 Android `Context`예요. |
| `App.runOnUiThread(fn, onComplete?)` | `fn`을 메인 스레드에서 실행해요. |
| `App.runOnScriptThread(fn, onComplete?)`, `App.runOnBackgroundThread(fn, onComplete?)` | `fn`을 프로젝트의 작업자에서 실행해요. `onComplete(error, result)`로 결과를 받아요. |
| `App.runDelayed(fn, delayMillis)` | 기다렸다가 프로젝트의 작업자에서 실행해요. |
| `App.isMainThread()`, `App.getScriptName()` | 메인 스레드인지, 프로젝트 이름이에요. |
| `Platform.getName()`, `Platform.getVersion()` | `"StarLight"`와 앱 버전이에요. |
| `Platform.getUptime()` | 앱이 켜진 뒤 지난 시간(밀리초)이에요. |

## 네트워크와 보안: Http, Security

메신저봇 방식의 API예요. NeonJS 프로젝트에서는 [`fetch`](/docs/neonjs/guides/async#fetch)도 쓸 수 있어요.

| 메서드 | 설명 |
|---|---|
| `Http.request(urlOrOptions, callback)` | jsoup으로 요청하고 `callback(error, response, doc)`을 불러요. |
| `Http.requestSync(urlOrOptions)` | 같은 요청을 기다렸다가 `Document`를 돌려줘요. |
| `Http.fetch(urlOrOptions, callback)` | 요청하고 `callback(error, response)`를 불러요. `response`에 `status`, `ok`, 본문 등이 있어요. |
| `Http.fetchSync(urlOrOptions)` | 같은 요청을 기다렸다가 응답을 돌려줘요. |

콜백은 프로젝트의 작업자에서 실행되고, 다시 컴파일하면 진행 중인 요청은 취소돼요. `fetch`는 한 프로젝트에서 동시에 64개까지 진행할 수 있어요.

`Security`는 해시(`md5`, `sha256`, `sha512` 등), 암호화(`aesEncode`/`aesDecode`, `ariaEncode`/`ariaDecode`, `desEncode`, `rc4Encode`, `seedEncode` 등), 인코딩(`base64Encode`/`base64Decode`, `base32Encode`), ID(`uuid`, `uuidv7`, `ulid`)를 제공해요. Android에 없는 `md2`, `sha3_*`, ECIES 계열은 오류가 나요.

## 알림과 위젯

### Notification

기기에 알림을 띄우고, 나중에 내용을 바꾸거나 지워요.

```javascript
const noti = Notification.create(1)
    .setTitle("봇 알림")
    .setText("새 메시지 10개")
    .onClick("확인", (id) => Log.i("눌림: " + id))
    .build();

noti.update("봇 알림", "새 메시지 11개");
noti.delete();
```

`setTitle()`과 `setText()`는 꼭 불러야 해요. 빠뜨리면 `build()`가 알려 줘요. 알림은 `build()`를 부를 때 올라가요. `lights(argb, onMs, offMs)`, `onDismiss(fn)`도 쓸 수 있어요.

### HomeWidget

홈의 **스크립트 값** 위젯에 값을 보여 줘요. [홈과 위젯](/docs/app/guides/home#스크립트-값-위젯)을 보세요.

## 프로젝트 사이

| API | 설명 |
|---|---|
| `Broadcast.send(name, value)` | 같은 이름을 구독한 모든 프로젝트의 콜백에 값을 보내요. |
| `Broadcast.sendLocal(name, value)` | 자기 프로젝트의 구독자에게만 보내요. |
| `Broadcast.register(name, fn)`, `Broadcast.unregister(name, fn)`, `Broadcast.unregisterAll()` | 이름을 구독하거나 그만둬요. 다시 컴파일하면 구독은 자동으로 풀려요. |
| `Broadcast.getAllEvents()`, `getLocalEvents()`, `getListenerCount(name)`, `hasListeners(name)` | 구독 상태를 알려 줘요. |
| `Projects.getSelf()`, `Projects.ofName(name)` | 프로젝트 객체를 가져와요. `info`, `directory`, `isCompiled`, `compile()`, `setEnabled()` 등이 있어요. |
| `Plugins.getAll()`, `Plugins.ofId(id)` | 설치된 플러그인 정보예요. |
| `Bridge.getScopeOf(name)` | 다른 프로젝트의 전역 객체예요. NeonJS 프로젝트는 `export`한 값만 보여요. |
| `Bridge.callFunctionOf(name, fn, ...args)`, `getVariableOf`, `setVariableOf`, `hasVariableOf`, `getMemberNamesOf` | 다른 프로젝트의 함수와 변수를 다뤄요. 컴파일되지 않은 프로젝트에는 `null`이나 `false`예요. |

```javascript title="알림 프로젝트"
Broadcast.register("alert", (text) => Api.replyRoom("공지방", text));
```

```javascript title="다른 프로젝트"
Broadcast.send("alert", "점검이 끝났어요");
```

## 이벤트 방식: BotManager (메신저봇 API2)

메신저봇 R의 API2와 같은 방식이에요. 프로젝트의 [API 방식](/docs/app/guides/projects#api-방식)에 **메신저봇 API2**가 있어야 쓸 수 있고, NeonJS를 권장해요. 동작은 [kbotdocs의 API2 문서](https://kbotdocs.dev/reference/api2)를 따라요.

```javascript
const bot = BotManager.getCurrentBot();

function onMessage(msg) {
    if (msg.content === "/핑") msg.reply("퐁");
}
bot.addListener(Event.MESSAGE, onMessage);

function onCommand(msg) {
    // "@더하기 4 7" → msg.command === "더하기", msg.args → ["4", "7"]
    if (msg.command === "더하기") msg.reply(Number(msg.args[0]) + Number(msg.args[1]));
}
bot.setCommandPrefix("@");
bot.addListener(Event.COMMAND, onCommand);
```

| `msg` 멤버 | 설명 |
|---|---|
| `content`, `room`, `packageName` | 메시지 내용, 방 이름, 메신저 패키지 이름 |
| `channelId`, `logId` | 방 ID와 메시지 ID. BigInt이고, 디버그 룸처럼 숫자 ID가 없으면 `0`이에요. |
| `author.name`, `author.hash`, `author.avatar` | 보낸 사람 이름, 방 안에서의 고유 ID(`author.userHash`도 같아요), 프로필 사진 |
| `image` | 사진 메시지면 `getBase64()`, `getBitmap()`이 있는 객체, 아니면 `null` |
| `isGroupChat`, `isDebugRoom`, `isMention` | 단체방, 디버그 룸, 멘션 여부. 괄호 없이 읽는 값이에요. |
| `isMultiChat` | 기기 주인이 아닌 Android 사용자(듀얼 메신저 등)의 메신저에서 온 메시지면 `true`예요. |
| `reply(message)`, `replyWithMarkdown(message)`, `markAsRead()` | 답장, 마크다운 답장([텍스트 보내기](#텍스트-보내기)), 읽음 표시. 성공하면 `true`예요. |
| `command`, `args` | `command` 이벤트에서만: 접두사 뒤 첫 단어와 그 뒤 단어들의 목록 |

| 이벤트 (`Event.…`) | 리스너 인자 | 언제 |
|---|---|---|
| `MESSAGE` (`"message"`) | `msg` | 메시지를 받았을 때 |
| `COMMAND` (`"command"`) | `msg` | `bot.setCommandPrefix()`로 정한 접두사로 시작하는 메시지를 받았을 때. 접두사를 정하기 전에는 `""`라 모든 메시지가 명령이에요. |
| `NOTIFICATION_POSTED` | `sbn, sessionManager` | 아무 앱이나 알림을 올렸을 때. **onNotificationPosted 이벤트 사용**을 켜야 해요. `sessionManager`로 그 알림의 답장 기능을 쓰거나 `bindSession()`으로 방을 이어요. |
| `NOTIFICATION_REMOVED` | `sbn, rankingMap, reason` | 알림이 지워졌을 때. 같은 설정을 켜야 해요. |
| `START_COMPILE` | 없음 | 다시 컴파일하기 직전 |

- `Event.Activity.*`, `Event.TICK` 상수도 있지만 StarLight에서는 불리지 않아요. 스크립트 전용 화면이 없기 때문이에요.
- `bot`: `on`/`addListener`, `prependListener`, `off`/`removeListener`, `removeAllListeners`, `listeners`, `getListenersMap`, `send(방, 메시지, packageName?)`(방은 이름, ID, `[이름, ID]`, `getRooms()`의 방), `sendMarkdown`, `canReply`, `markAsRead`, `setCommandPrefix`/`getCommandPrefix`, `getName`, `getRootPath`, `getPower`/`setPower`, `compile`, `unload`
- `BotManager`: `getCurrentBot`, `getBot(이름)`(컴파일되지 않았으면 `null`), `getBotList`, `getBotNames`, `getBotCount`, `getRooms(packageName?)`, `getAllRooms`, `getPower`/`setPower`, `compile`, `compileAll`, `prepare`, `prepareAll`, `isCompiled`, `unload`
- `BotManager.getRooms()`는 메시지를 받은 방의 목록이에요. 모든 알림 규칙의 방이 들어가고, `packageName`을 넘기면 그 앱의 방만 골라요. 각 방에 `name`, `id`, `channelId`, `isGroupChat`, `send(message)`, `markAsRead()`가 있어요.

> [!NOTE]
> 리스너는 다른 이벤트와 같은 규칙을 따라요. 프로젝트 스위치가 꺼져 있거나 허용 이벤트(`starlight.api2.*`)에 없으면 불리지 않고, 리스너에서 오류가 나면 **오류 발생시 비활성화** 설정에 따라 프로젝트가 꺼져요. `START_COMPILE` 리스너의 오류는 로그에만 남아요. 디버그 룸은 스위치가 꺼져 있어도 불러요. 리스너는 프로젝트를 다시 컴파일하거나 스코프를 폐기하면 사라져요.

## 언어마다 다른 전역

| | NeonJS | Rhino |
|---|---|---|
| 콘솔 | `console.log()` 등 (Node.js 형식) | `console.log()` 등 (메신저봇 형식) |
| 토스트 | `toast(message, duration?)` (기본은 짧게) | `toast(message, duration?)` (기본은 짧게) |
| 타이머 | `setTimeout(fn, ms, ...args)` 등 | `setTimeout(fn, ms, ...args)` 등 |
| 반복 호출 | `repeat(fn, count, args?)` → 결과 배열 | `repeat(fn, count, args?)` → 결과 배열 |
| HTTP | `fetch`, `WebSocket` | `Utils.getWebText()`, `Http`, Java API |
| Java 클래스 | `Java.type("…")` → 클래스 객체 | `Packages.…`, `importClass()` (`Java.type()`은 `java.lang.Class`를 돌려줘요) |
| 다른 파일 | `import` | `require()` |

Java 배열과 `List`는 두 언어 모두 `length`와 인덱스로 읽는 배열 비슷한 객체예요. `map()` 같은 배열 메서드를 쓰려면 `Array.from()`으로 바꾸세요. `Chat.getRooms()`, `Schedule.getTasks()`, `Schedule.getStored()`, `Store`의 값은 처음부터 JS 배열과 객체예요.

> [!NOTE]
> Rhino 스크립트의 최상위 `const`는 같은 이름의 API보다 우선해요. 예를 들어 `const Chat = …`을 쓰면 그 스크립트에서는 `Chat` API를 쓸 수 없어요.

> [!NOTE]
> Google Play 판에서는 리플렉션, 클래스 로딩, 프로세스 실행 같은 일부 Java API를 쓸 수 없어요. [Google Play 판의 제한](/docs/neonjs/guides/java#google-play-판의-제한)을 보세요.
