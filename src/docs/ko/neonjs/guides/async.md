---
title: 비동기와 네트워크
description: Promise와 async 함수, 타이머, fetch와 WebSocket을 NeonJS 프로젝트에서 쓰는 방법과 주의할 점이에요.
order: 3
---

NeonJS는 `Promise`와 `async`/`await`를 표준 그대로 지원해요. StarLight는 프로젝트마다 이벤트 루프를 돌려서, 타이머와 `fetch`, `WebSocket`의 결과를 프로젝트의 작업으로 처리해요.

## async 이벤트 함수

이벤트 함수도 `async`로 만들 수 있어요. 함수 안에서 `await`를 쓰면 응답을 기다리는 동안 다른 이벤트가 먼저 처리될 수 있어요.

```javascript title="main.js"
export async function onMessage(event) {
    if (event.message !== "/고양이") return;

    const res = await fetch("https://api.example.com/cat-fact");
    const { fact } = await res.json();
    event.room.send(fact);
}
```

> [!NOTE]
> StarLight는 async 이벤트 함수가 끝나기를 기다리지 않아요. 함수 안에서 처리하지 않은 오류는 `Unhandled promise rejection`으로 로그에 남고, [`onUncaughtError`](/docs/app/reference/events#onuncaughterror)를 만들어 두었다면 그 함수에도 전달돼요. 사용자에게 알려야 하는 오류는 `try`/`catch`로 직접 처리하세요.

## 다음 메시지 기다리기

API 방식으로 **StarLight 오리지널**을 고른 프로젝트는 [`Chat.waitFor()`](/docs/app/reference/script-api#대화-chat)로 다음 메시지를 답으로 받을 수 있어요. Promise를 돌려주니 `await`로 기다려요.

```javascript title="main.js"
export async function onMessage(msg) {
    if (msg.message !== "!가입") return;
    msg.room.send("닉네임을 입력해주세요.");
    const answer = await Chat.waitFor(msg, 30_000);   // 같은 방, 같은 사람의 다음 메시지
    msg.room.send(answer ? `${answer.message}님, 환영합니다!` : "시간이 초과되었습니다.");
}
```

기다리는 동안에도 프로젝트는 다른 메시지를 처리해요. 답이 된 메시지는 기다리던 코드로만 가고 `onMessage`에는 오지 않아요. 시간이 지나도 답이 없으면 `null`이에요.

## 모듈 최상위의 await

NeonJS 프로젝트는 ES 모듈이라 최상위에서도 `await`를 쓸 수 있어요. 컴파일은 최상위 코드가 끝날 때까지 기다리므로, 시작할 때 한 번 받아 올 데이터를 준비하기에 좋아요.

```javascript title="main.js"
const res = await fetch("https://example.com/words.json");
const words = await res.json();

export function onMessage(event) {
    if (words.includes(event.message)) event.room.send("찾았어요!");
}
```

최상위 코드가 오래 걸리면 그만큼 컴파일도 늦어져요. 실패해도 괜찮은 작업은 `try`/`catch`로 감싸 두세요.

## 타이머

`setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`은 StarLight가 직접 제공해요.

```javascript
const id = setInterval(() => console.log("1분마다"), 60_000);
// 나중에
clearInterval(id);
```

- `setInterval`은 콜백이 **끝난 뒤부터** 다시 시간을 재요. 콜백이 오래 걸리면 그만큼 간격이 벌어져요.
- 프로젝트를 다시 컴파일하거나 스코프를 폐기하면 남은 타이머는 모두 취소돼요. 프로젝트 스위치를 꺼도 타이머는 계속 돌아요.
- 콜백에서 난 오류는 `Exception on timer <ID>: …`로 로그에 남고, `setInterval`은 다음 차례에 계속 실행돼요.
- 정해진 시각에 실행하거나 앱을 다시 시작해도 남아야 하는 예약은 [`Schedule`](/docs/app/reference/script-api#예약-작업-schedule)을 쓰세요(StarLight 오리지널 방식).

## fetch

`fetch`는 웹 표준과 같아요. 요청 본문으로 문자열, `FormData`, `Blob`, `URLSearchParams`를 보낼 수 있고, 응답은 `text()`, `json()`, `arrayBuffer()`, `bytes()`, `blob()`, `formData()`로 읽어요.

```javascript
const res = await fetch("https://api.example.com/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "별" }),
    signal: AbortSignal.timeout(5_000),   // 5초가 지나면 취소
});
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const item = await res.json();
```

StarLight에서 `fetch`가 닿을 수 있는 곳은 아래와 같아요.

| 대상 | 허용 |
|---|---|
| 인터넷의 모든 호스트 (`https:`, `http:`) | 예 |
| 같은 기기의 서버 (`127.0.0.1`) | 예 |
| 같은 와이파이의 다른 기기 (`192.168.x.x`, `10.x.x.x` 같은 사설 주소) | **아니요** |

- 리디렉션은 20번까지 따라가고, 쿠키를 보내거나 저장하지 않으며, 캐시도 쓰지 않아요.
- 동시에 진행할 수 있는 요청은 프로젝트마다 16개, 응답 하나의 크기는 32MiB까지예요.
- 연결에 실패하면 `TypeError: fetch failed`로 거부되고, 원인은 오류의 `cause`에 들어 있어요.

> [!TIP]
> 사설 주소의 기기와 통신해야 한다면 `Java.type()`으로 Java의 HTTP 클라이언트를 직접 쓰세요. [Java와 Android API 쓰기](/docs/neonjs/guides/java)를 참고하세요.

## WebSocket

`WebSocket`도 웹 표준과 같고, `fetch`와 같은 주소 규칙을 따라요. 소켓은 `close()`로 닫거나 프로젝트를 다시 컴파일할 때까지 열려 있어요.

```javascript
const ws = new WebSocket("wss://echo.example.com");
ws.addEventListener("open", () => ws.send("안녕"));
ws.addEventListener("message", (e) => console.log("받음:", e.data));
ws.addEventListener("error", (e) => console.error(e.message));
```

## 놓친 오류

어디서도 잡지 않은 오류는 프로젝트 로그에 오류로 남아요.

| 로그 | 언제 |
|---|---|
| `Uncaught exception: …` | `WebSocket` 이벤트 리스너처럼 이벤트 루프의 작업에서 던진 오류 |
| `Unhandled promise rejection: …` | 처리하지 않은 채 거부된 Promise |

메시지 뒤에는 JS 스택 트레이스가 붙어 있어서, 어느 파일 몇 번째 줄에서 났는지 볼 수 있어요.

이런 오류를 코드에서 받으려면 `onUncaughtError(error, origin, detail)`를 내보내세요. 이벤트 함수, 타이머, Promise에서 아무도 처리하지 않은 오류가 로그에 남은 뒤 불려요. `origin`은 `"uncaughtException"`이나 `"unhandledRejection"`이에요. 자세한 것은 [이벤트 함수](/docs/app/reference/events#onuncaughterror)를 보세요.

```javascript title="main.js"
export function onUncaughtError(error, origin, detail) {
    // detail.source: 오류가 난 곳(예: "onMessage"), detail.args: 그 함수의 인자
    detail.args[0]?.room?.send("문제가 생겼어요.");
}
```

## 오래 걸리는 코드

NeonJS 프로젝트는 한 번에 한 작업만 실행해요. 이벤트 함수 하나가 오래 걸리면 그동안 다른 메시지는 기다려요. `await`로 기다리는 동안은 다른 작업이 실행되니, 기다리는 시간은 여기에 들지 않아요. 그리고 StarLight는 실행 시간을 제한하지 않아서, 끝나지 않는 반복문은 프로젝트를 멈추게 해요.

작업 하나가 프로젝트 설정의 **느린 실행 경고 (초)**(기본 10초)보다 오래 끝나지 않으면 프로젝트 로그에 경고가 남아요. 무엇이 실행 중이고 몇 개의 이벤트가 기다리는지 알려 줘서, 멈춘 코드를 찾을 수 있어요.

- 무거운 계산은 나누어 `setTimeout`으로 이어서 실행하세요.
- 기다리는 작업은 반복문으로 확인하지 말고 `await`나 타이머를 쓰세요.
- 프로젝트가 멈췄다면 다시 컴파일하거나 프로젝트 설정의 **위험 → 프로젝트 스코프 폐기**를 쓰세요. 실행 중인 코드는 그때 중단돼요.
