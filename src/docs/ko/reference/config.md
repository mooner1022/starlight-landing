---
title: 설정 데이터와 ConfigDSL
description: 저장된 설정 값을 읽고 쓰는 ConfigData API와, ConfigDSL 옵션의 전체 속성을 정리했어요.
order: 5
---

## ConfigData

`getPluginConfig()`가 돌려주는 읽기 전용 설정이에요. 카테고리 ID로 `ConfigCategory`를 꺼내 값을 읽어요.

| 메서드 | 설명 |
|---|---|
| `category(id): ConfigCategory` | 카테고리를 돌려줘요. 저장된 값이 없으면 빈 카테고리예요. |
| `categoryOrNull(id): ConfigCategory?` | 카테고리가 없으면 `null`이에요. |
| `get(id)` / `contains(id)` | `config["general"]`, `"general" in config`처럼 쓸 수 있어요. |

## ConfigCategory

| 메서드 | 반환 |
|---|---|
| `getBoolean(key)` / `getBoolean(key, default)` | `Boolean?` / `Boolean` |
| `getInt(key)` / `getInt(key, default)` | `Int?` / `Int` |
| `getLong(key)` / `getLong(key, default)` | `Long?` / `Long` |
| `getFloat(key)` / `getFloat(key, default)` | `Float?` / `Float` |
| `getDouble(key)` / `getDouble(key, default)` | `Double?` / `Double` |
| `getString(key)` / `getString(key, default)` | `String?` / `String` |
| `getList(key)` | `List<JsonElement>?` (`list` 옵션 등) |
| `getObject(key)` | `JsonObject?` |
| `getSubCategory(key)` | `ConfigCategory?` |
| `contains(key)` | `Boolean` |

## MutableConfig

프로젝트의 `project.config`처럼 값을 쓸 수 있는 설정이에요. `category(id)`가 `MutableConfigCategory`를 돌려줘요.

```kotlin
project.config.edit {
    category("myplugin")["last_run"] = System.currentTimeMillis()
    category("myplugin").setString("mode", "fast")
}
```

`edit { }`는 블록을 실행한 뒤 저장해요. 직접 바꿨다면 `push()`로 저장하세요. `MutableConfigCategory`에는 `setInt`, `setLong`, `setBoolean`, `setString`, `setFloat`, `setDouble`, `set(key, value)`(연산자), `remove(key)`가 있어요.

> [!TIP]
> 여러 플러그인이 같은 프로젝트 설정을 쓸 수 있으므로, 카테고리 ID에 플러그인 ID를 넣어 겹치지 않게 하세요.

## 옵션 레퍼런스

모든 옵션은 `config { category { items { … } } }` 안에서 써요. 패키지는 `dev.mooner.configdsl.options`예요.

### 공통 속성

| 속성 | 설명 |
|---|---|
| `id` | 옵션 ID예요(필수). |
| `title` | 제목이에요. 대부분의 옵션에서 필수예요. |
| `description` | 제목 아래 설명이에요. |
| `icon: Icon?` | 내장 아이콘이에요. |
| `iconFile: File?`, `iconResId: Int?` | 파일이나 리소스로 아이콘을 지정해요. `setIcon(...)`로 하나만 골라 지정할 수도 있어요. |
| `iconTintColor: Int?` | 아이콘 색이에요. `color { "#78DCE8" }`처럼 지정해요. |
| `dependency: String?` | 같은 카테고리의 토글 ID예요. 토글이 켜져 있을 때만 활성화돼요. 앞에 `!`를 붙이면 꺼져 있을 때만 활성화돼요. |
| `visibleWhen(id, predicate)` | `id` 옵션의 값(`JsonElement?`)이 조건을 만족할 때만 보여요. `visibleWhen(id, "a", "b")`, `visibleWhen(id, true)` 형태도 있어요. **1.0.0+** |
| `bindTitle(flow)`, `bindDescription(flow)` | 화면이 열려 있는 동안 `Flow`의 값으로 제목/설명을 바꿔요. `bindDescription(every: Duration) { … }`는 주기적으로 갱신해요. **1.0.0+** |

### 카테고리

| 속성 | 설명 |
|---|---|
| `id` | 카테고리 ID예요(필수). 값을 읽을 때 `category(id)`로 써요. |
| `title` | 카테고리 제목이에요. 비워 두면 제목 없이 보여요. |
| `textColor` | 제목 색이에요. |
| `flags` | 카테고리 표시 플래그예요. |
| `items { }` | 옵션 목록이에요. 하나 이상 있어야 해요. |

### 값을 저장하는 옵션

| 옵션 | 속성 | 저장 형식 |
|---|---|---|
| `toggle` | `defaultValue: Boolean`, `setOnValueChangedListener { view, value -> }`, `warnOnEnable(message)`, `warnOnDisable(message)` | Boolean |
| `string` | `hint`, `defaultValue`, `inputType`(`android.text.InputType`), `require: (String) -> String?` | String |
| `password` | `hashCode: (String) -> String`(필수), `require` | 해시 문자열 |
| `spinner` | `items: List<String>`(필수), `defaultIndex`, `setOnItemSelectedListener { view, index -> }` | 선택 인덱스(Int) |
| `seekbar` | `min`, `max`(필수), `defaultValue` | Int |
| `colorPicker` | `colors(...)`, `defaultSelection`, `flags`, `setOnColorSelectedListener { view, color -> }` | 색상(Int) |
| `list` | `structure { }`(필수, 항목 하나의 옵션들), `onInflate { }`, `onDraw { }`, `transformData { }`, `default(...)` | 객체 목록 |
| `choice` **1.0.0+** | `option(key, label)`(하나 이상), `defaultKey`, `setOnSelectedListener { key -> }` | 선택 키(String) |
| `multiChoice` **1.0.0+** | `option(key, label)`, `defaultKeys: Set<String>` | 선택 키 목록 |

- `require`는 입력값이 올바르면 `null`, 아니면 사용자에게 보여 줄 오류 문구를 돌려줘요.
- `password`는 입력값 대신 `hashCode`의 결과만 저장해요.
- `toggle`의 `warnOnEnable`/`warnOnDisable`은 켜거나 끌 때 확인 메시지를 보여 줘요.

### 동작과 표시만 하는 옵션

| 옵션 | 속성 |
|---|---|
| `button` | `setOnClickListener { view -> }` 또는 `setOnClickListener { }`, `style: ButtonStyle`(`DEFAULT`, `PRIMARY`, `DANGER`) **1.0.0+**, `confirm(message)` **1.0.0+**, `action { }` **1.0.0+** |
| `info` **1.0.0+** | `value`, `status: OptionStatus`(`OK`, `WARNING`, `ERROR`, `LOADING`), `copyable`, `setOnClickListener { }`, `bindValue(flow)`, `bindValue(every) { }`, `bind(flow)` |
| `progress` **1.0.0+** | `progress: Int?`(`null`이면 진행률을 모르는 상태), `max`(기본 100), `label` |
| `textList` **1.0.0+** | `lines: List<String>`, `monospace`, `copyable`, `maxVisible`(기본 5), `emptyText` |

`button`의 `backgroundColor`는 더 이상 표시되지 않아요. `style`을 쓰세요.

### 버튼 동작 (ConfigActionScope)

`button { action { … } }` 블록은 일시 중단 함수로 실행돼요. **1.0.0+**

| 멤버 | 설명 |
|---|---|
| `context` | 버튼의 컨텍스트예요. |
| `peek(message, type = PeekType.INFO)` | 화면에 짧은 알림을 띄워요. `PeekType`은 `INFO`, `SUCCESS`, `ERROR`예요. |
| `setDescription(text)` / `resetDescription()` | 버튼 설명을 바꾸거나 되돌려요. 진행 상황을 보여 줄 때 써요. |
| `confirm(title, message): Boolean` | 확인 창을 띄우고 결과를 기다려요. |
| `input(title, hint = "", initial = ""): String?` | 입력 창을 띄워요. 취소하면 `null`이에요. |
| `select(title, items, selected = -1): Int?` | 선택 창을 띄워요. 취소하면 `null`이에요. |

## Icon

`dev.mooner.configdsl.Icon`에 있는 내장 아이콘이에요.

`NONE` `REFRESH` `ARROW_RIGHT` `ARROW_LEFT` `ARROW_UP` `ARROW_DOWN` `LIST_BULLETED` `COPY` `PASTE` `CLOUD` `CLOUD_DOWNLOAD` `ADD` `REMOVE` `CLOSE` `SETTINGS` `SEND` `DELETE` `DELETE_SWEEP` `CREATE` `FOLDER` `CREATE_NEW_FOLDER` `EDIT` `DOWNLOAD` `CHECK` `CHECK_CIRCLE` `FAVORITE` `EXIT_TO_APP` `EMAIL` `ERROR` `ECO` `THUMB_UP` `THUMB_DOWN` `STAR` `KEY` `KEYBOARD` `COMPRESS` `EDIT_ATTRIBUTES` `IMPORT_EXPORT` `LINK` `LINK_OFF` `LAYERS` `LAYERS_CLEAR` `LAUNCH` `MASKS` `BOOKMARK` `MARK_CHAT_READ` `MARK_CHAT_UNREAD` `PIN` `NIGHTS_STAY` `HALF_MOON` `SUN` `TIMER` `TIMER_OFF` `ACCESS_TIME` `INFO` `BRANCH` `DEVELOPER_MODE` `DEVELOPER_BOARD` `DEVELOPER_BOARD_OFF` `PROJECTS` `POWER` `SHARE` `IOS_SHARE` `ACCOUNT_BOX` `GITHUB` `ARCHIVE` `BATTERY_ALERT` `BATTERY_FULL` `BATTERY_SAVER` `BATTERY_UNKNOWN` `NOTIFICATIONS` `NOTIFICATIONS_ACTIVE` `LOCATION_ON` `LOCATION_OFF` `LOCK` `FILE` `TEXT_FIELDS` `WRAP_TEXT`

`Icon.LINK.drawableRes`처럼 리소스 ID를 꺼내 위젯 등 다른 곳에서 쓸 수도 있어요.
