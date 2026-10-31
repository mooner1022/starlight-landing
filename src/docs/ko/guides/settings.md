---
title: 설정 화면 만들기
description: ConfigDSL로 플러그인 설정 화면을 정의하고, 저장된 값을 읽고, 변경에 반응해요.
order: 3
---

플러그인이 `getConfigStructure()`를 재정의하면 앱의 플러그인 목록에서 설정 화면을 열 수 있어요. 화면은 **ConfigDSL**로 정의하고, 값은 StarLight가 저장해 줘요.

## 설정 화면 정의

`config { }` 안에 카테고리를, 카테고리 안에 옵션을 넣어요.

```kotlin title="ClockPlugin.kt"
override fun getConfigStructure(): ConfigStructure = config {
    category {
        id = "general"
        title = "일반"
        textColor = color { "#DFC199" }
        items {
            toggle {
                id = "enabled"
                title = "알람 사용"
                description = "정해진 시각에 onAlarm 이벤트를 보내요."
                defaultValue = true
                icon = Icon.TIMER
            }
            string {
                id = "time"
                title = "알람 시각"
                hint = "07:30"
                defaultValue = "07:30"
                // null을 돌려주면 통과, 문자열을 돌려주면 그 내용이 오류로 표시돼요.
                require = { value ->
                    if (Regex("\\d{2}:\\d{2}").matches(value)) null else "HH:mm 형식으로 입력하세요"
                }
                icon = Icon.ACCESS_TIME
                dependency = "enabled" // '알람 사용'이 켜져 있을 때만 활성화
            }
            seekbar {
                id = "snooze"
                title = "다시 알림 간격(분)"
                min = 1
                max = 30
                defaultValue = 5
            }
        }
    }
}
```

- 카테고리와 옵션에는 모두 `id`가 있어야 해요. 값을 읽을 때 이 ID를 써요.
- 카테고리에는 옵션이 하나 이상 있어야 해요.
- `color { "#RRGGBB" }`는 `config { }` 안에서 쓸 수 있는 색상 헬퍼예요.
- `getConfigStructure()`는 **설정 화면을 열 때마다** 호출돼요. 웹 서버 플러그인처럼 서버 상태에 따라 버튼 제목을 바꾸는 식으로 현재 상태를 반영할 수 있어요.

## 값 읽기

저장된 값은 `getPluginConfig()`로 읽어요. 카테고리를 고른 뒤 형식에 맞는 getter를 써요.

```kotlin
val general = getPluginConfig().category("general")
val enabled = general.getBoolean("enabled", true)
val time    = general.getString("time", "07:30")
val snooze  = general.getInt("snooze", 5)
```

- 값은 플러그인의 외부 데이터 폴더(`StarLight/plugins/<이름>(<id>)/config-plugin.json`)에 저장돼요.
- 아직 한 번도 저장하지 않은 값은 없으므로, 기본값을 받는 getter를 쓰세요.
- `spinner`는 선택한 **인덱스**(`getInt`), `choice`는 선택한 **키**(`getString`), `toggle`은 `getBoolean`으로 읽어요.

## 변경에 반응하기

사용자가 설정을 바꾸면 `onConfigUpdated()`가 호출돼요. `updated`에는 바뀐 카테고리 ID와 그 안에서 바뀐 옵션 ID들이 들어 있어요.

```kotlin
override fun onConfigUpdated(config: ConfigData, updated: Map<String, Set<String>>) {
    super.onConfigUpdated(config, updated) // 설정 캐시를 비워요. 꼭 호출하세요.
    if ("time" in updated["general"].orEmpty())
        rescheduleAlarm(config.category("general").getString("time", "07:30"))
}
```

`super.onConfigUpdated()`를 호출하지 않으면 `getPluginConfig()`가 예전 값을 계속 돌려줘요. 값이 하나 바뀔 때마다 알고 싶다면 `onConfigValueUpdated(id, data)`도 있어요.

## 옵션 종류

| 옵션 | 저장되는 값 | 주요 속성 |
|---|---|---|
| `toggle` | Boolean | `defaultValue`, `setOnValueChangedListener { view, value -> }`, `warnOnEnable("…")`, `warnOnDisable("…")` |
| `string` | String | `hint`, `defaultValue`, `inputType`, `require` |
| `password` | 해시 문자열 | `hashCode`(필수, 입력값을 해시로 바꾸는 함수), `require` |
| `spinner` | 인덱스(Int) | `items`, `defaultIndex` |
| `seekbar` | Int | `min`, `max`, `defaultValue` |
| `button` | — | `setOnClickListener { view -> }`, `style`, `confirm("…")`, `action { }` |
| `colorPicker` | 색상(Int) | `defaultSelection` |
| `list` | 객체 목록 | `structure { }`, `onInflate`, `onDraw`, `default(...)` |
| `choice` | 선택한 키(String) | `option(key, label)`, `defaultKey`, `setOnSelectedListener { key -> }` |
| `multiChoice` | 선택한 키 집합 | `option(key, label)`, `defaultKeys` |
| `info` | — | `value`, `status`, `copyable`, `bindValue(…)` |
| `progress` | — | `progress`, `max`, `label` |
| `textList` | — | `lines`, `monospace`, `copyable`, `maxVisible`, `emptyText` |

`choice`, `multiChoice`, `info`, `progress`, `textList`과 `button`의 `style`/`confirm`/`action`은 **PluginCore 1.0.0 이상**에서 쓸 수 있어요. 전체 속성은 [설정 레퍼런스](/docs/reference/config#옵션-레퍼런스)에 있어요.

모든 옵션에 공통으로 쓸 수 있는 속성도 있어요.

| 속성 | 설명 |
|---|---|
| `id`, `title`, `description` | ID, 제목, 설명이에요. 대부분의 옵션은 `title`이 필수예요. |
| `icon`, `iconTintColor` | `Icon` 열거형의 아이콘과 색이에요. `iconFile`, `iconResId`로 직접 지정할 수도 있어요. |
| `dependency` | 같은 카테고리에 있는 토글의 ID예요. 토글이 켜져 있을 때만 옵션이 활성화돼요. `"!enabled"`처럼 앞에 `!`를 붙이면 반대로 동작해요. |
| `visibleWhen(id, …)` | 다른 옵션의 값에 따라 옵션을 보이거나 숨겨요. **PluginCore 1.0.0 이상** |
| `bindTitle(flow)`, `bindDescription(flow)` | 화면이 열려 있는 동안 제목이나 설명을 실시간으로 바꿔요. **PluginCore 1.0.0 이상** |

## 버튼과 동작

버튼은 값을 저장하지 않고 동작을 실행해요. 화면에서 클릭되므로 **메인 스레드**에서 실행된다는 점에 주의하세요. 네트워크나 파일 작업은 다른 스레드로 넘기세요.

```kotlin
button {
    id = "restart_server"
    title = "서버 재시작"
    description = "프로젝트가 등록한 라우트는 유지돼요."
    icon = Icon.REFRESH
    setOnClickListener { _ ->
        serverExecutor.execute(::restartServer)
    }
}
```

PluginCore 1.0.0 이상에서는 `action { }`으로 확인 창, 입력 창, 선택 창을 띄우는 일시 중단(suspend) 동작을 쓸 수 있어요.

```kotlin
button {
    id = "rename"
    title = "이름 바꾸기"
    style = ButtonStyle.PRIMARY
    action {
        val name = input(title = "새 이름", hint = "my-bot") ?: return@action
        if (confirm(title = "이름 바꾸기", message = "$name(으)로 바꿀까요?")) {
            rename(name)
            peek("바꿨어요", PeekType.SUCCESS)
        }
    }
}
```

`action { }` 안에서는 `context`, `peek()`, `setDescription()`, `resetDescription()`, `confirm()`, `input()`, `select()`를 쓸 수 있어요.

## 다국어 문구

설정 화면의 문구도 [번역 헬퍼](/docs/reference/logging#번역)로 앱 언어에 맞출 수 있어요. 웹 서버 플러그인은 아래처럼 작은 헬퍼를 만들어 써요.

```kotlin
fun tr(english: String, korean: String): String =
    translate {
        Locale.ENGLISH { english }
        Locale.KOREAN  { korean }
    }

toggle {
    id = "auto_start"
    title = tr("Start automatically", "자동 시작")
}
```
