---
title: 홈 위젯 만들기
description: 위젯 DSL로 StarLight 홈 화면에 놓을 위젯을 만들어요.
order: 4
---

> [!IMPORTANT]
> 위젯 DSL은 **PluginCore 1.0.0 이상**에서 쓸 수 있어요. 정식 앱(0.3.4b)에서 실행하면 클래스를 찾지 못해 `LinkageError`가 발생하므로, 아래 [호환성](#호환성)처럼 감싸서 등록하세요.

## 위젯 정의

`widget(id) { }`로 위젯을 정의해요. 결과는 `WidgetDefinition`이에요.

```kotlin title="ClockWidget.kt"
val ClockWidget = widget("clock_status") {
    name {
        Locale.ENGLISH { "Clock" }
        Locale.KOREAN  { "시계" }
    }
    // 기본 크기 4×2, 2×1까지 줄이고 8×4까지 늘릴 수 있어요.
    span(default = 4 x 2, min = 2 x 1, max = 8 x 4)

    settings {
        toggle("show_seconds", "초 표시", default = false)
        choice(
            id = "style",
            title = "모양",
            options = listOf("digital" to "디지털", "analog" to "아날로그"),
        )
    }

    content {
        val text = TextView(context)
        container.removeAllViews()
        container.addView(text)

        ticker(1.seconds) {
            val pattern = if (settings.boolean("show_seconds")) "HH:mm:ss" else "HH:mm"
            text.text = TimeUtils.formatCurrentDate(pattern)
        }
    }

    preview {
        // 위젯 추가 화면에 보이는 미리보기예요. 실제 데이터 대신 예시 값을 보여 주세요.
        container.addView(TextView(context).apply { text = "07:30" })
    }
}
```

| 항목 | 설명 |
|---|---|
| `name("…")` / `name { … }` | 위젯 목록에 보이는 이름이에요(필수). 블록을 쓰면 앱 언어에 맞춰 번역돼요. |
| `span(default, min, max)` | 격자 크기예요. `4 x 2`는 가로 4칸, 세로 2칸이에요. 가로는 최대 8칸이에요. `min`과 `max`가 같으면 크기를 바꿀 수 없어요. |
| `settings { }` | 위젯별 설정이에요. `toggle(id, title, description?, default)`과 `choice(id, title, options, default?, description?)`를 쓸 수 있어요. |
| `content { }` | 홈 화면에 위젯을 그려요(필수). |
| `preview { }` | 위젯 추가 화면의 미리보기를 그려요. |
| `autoHeight` | `true`면 내용 높이에 맞춰 늘어나요. |
| `devOnly` | `true`면 개발자 모드에서만 보여요. |

## WidgetScope

`content { }`와 `preview { }` 블록은 `WidgetScope` 안에서 실행돼요.

| 멤버 | 설명 |
|---|---|
| `container: FrameLayout` | 위젯 뷰를 넣을 컨테이너예요. |
| `context: Context` | 컨테이너의 컨텍스트예요. |
| `span: WidgetSpan` | 현재 크기예요(`span.x`, `span.y`). 크기에 따라 다른 레이아웃을 보여 줄 때 써요. |
| `isPreview: Boolean` | 미리보기로 그리는 중인지 알려 줘요. |
| `settings: WidgetSettings` | 위젯 설정 값이에요. `settings.boolean(id)`, `settings.string(id)`로 읽어요. |
| `inflate(layoutRes)` | 레이아웃을 inflate 해 컨테이너에 넣어요. ViewBinding의 `inflate` 함수를 넘기는 오버로드도 있어요. |
| `view<T>(id)` | 컨테이너에서 뷰를 찾아요. |
| `launch { }` | 위젯 수명에 묶인 코루틴을 실행해요(메인 스레드). |
| `repeatWhile(state) { }` | 생명주기가 `state` 이상일 때만 블록을 실행해요. |
| `ticker(period) { }` | 화면이 보이는 동안(`RESUMED`) `period`마다 블록을 실행해요. |
| `on<T> { }` | 화면이 보이는 동안(`STARTED`) [앱 이벤트](/docs/reference/events) `T`를 받아요. |
| `onResize { span -> }` | 사용자가 위젯 크기를 바꿨을 때 호출돼요. |

위젯이 홈 화면에서 사라지면 `launch`, `ticker`, `on`으로 시작한 작업은 모두 취소돼요. 블록 안에서 발생한 예외는 앱이 위젯 오류로 처리해요.

## 등록

`onEnable()`에서 `addWidget()`으로 등록해요.

```kotlin title="ClockPlugin.kt"
override fun onEnable() {
    addWidget(ClockWidget)
}
```

## 호환성

정식 앱(PluginCore 0.3.2)에도 플러그인을 배포한다면, 웹 서버 플러그인처럼 등록을 감싸 두세요. 위젯만 빠지고 나머지 기능은 계속 동작해요.

```kotlin
try {
    addWidget(ClockWidget)
} catch (e: LinkageError) {
    log.warn { "이 StarLight 버전에서는 위젯을 지원하지 않아요: $e" }
}
```

> [!NOTE]
> 예전 방식인 `Widget` 클래스 상속(`onCreateWidget(view)`, `onCreateThumbnail(view)`)과 `addWidget<T>()`도 아직 동작해요. 새 위젯은 DSL로 만드는 걸 권장해요.

## 앱 스타일에 맞추기

위젯 DSL은 뷰를 직접 만들게 하므로, 색과 여백을 앱에 맞추는 건 플러그인 몫이에요. 웹 서버 플러그인은 앱의 리소스 이름(`card_radius`, `widget_cell_height` 등)을 `resources.getIdentifier()`로 찾아 쓰고, 찾지 못하면 기본값을 쓰는 헬퍼(`hostColor`, `hostDimen`)를 만들어 써요. [웹 서버 플러그인 살펴보기](/docs/guides/webserver-example#홈-위젯)에서 구성을 볼 수 있어요.
