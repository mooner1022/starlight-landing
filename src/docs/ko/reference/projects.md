---
title: 프로젝트와 Session
description: Session으로 앱의 관리자 객체에 접근하고, 프로젝트를 찾고, 프로젝트의 상태와 로그를 다뤄요.
order: 3
---

## Session

```kotlin
object Session
```

앱 전체에서 하나뿐인 관리자 객체들을 모아 둔 곳이에요.

| 속성 | 형식 | 설명 |
|---|---|---|
| `projectManager` | `ProjectManager` | 프로젝트 목록과 이벤트 호출을 관리해요. |
| `pluginManager` | `PluginManager` | 불러온 플러그인을 관리해요. |
| `apiManager` | `ApiManager` | 등록된 스크립트 API 목록이에요. `getApis()` |
| `languageManager` | `LanguageManager` | 등록된 스크립트 언어를 관리해요. |
| `widgetManager` | `WidgetManager` | 등록된 홈 위젯을 관리해요. |
| `isInitComplete` | `Boolean` | 앱 초기화가 끝났는지 알려 줘요. |
| `json` | `Json` | 앱이 쓰는 `kotlinx.serialization` 설정이에요(`ignoreUnknownKeys`, `isLenient`). |

`projectManager`와 `apiManager`는 앱이 초기화된 뒤에 준비돼요. 플러그인의 `onEnable()`이 호출될 때는 이미 쓸 수 있어요.

## PluginManager

| 멤버 | 설명 |
|---|---|
| `plugins: Set<StarlightPlugin>` | 불러온 플러그인 목록이에요. |
| `getPluginById(id)` / `getPluginByName(name)` | 플러그인을 찾아요. 없으면 `null`이에요. |
| `getPlugin<T>()` | 클래스로 플러그인을 찾아요. |
| `isPluginEnabled(id)` | 플러그인이 켜져 있는지 알려 줘요. |

다른 플러그인과 협력할 때 쓸 수 있어요. 이때는 `starlight.json`의 `dependency`에 그 플러그인을 적어 먼저 불러오게 하세요.

## ProjectManager

| 메서드 | 설명 |
|---|---|
| `getProjects(): List<Project>` | 모든 프로젝트예요. |
| `getEnabledProjects(): List<Project>` | 켜진 프로젝트만 돌려줘요. |
| `getProjectByName(name, ignoreCase = false): Project?` | 이름으로 찾아요. |
| `getProjectById(id: String): Project?` | UUID 문자열로 찾아요. |
| `fireEvent<T : ProjectEvent>(vararg args, onFailure)` | 이벤트를 받을 수 있는 모든 프로젝트의 함수를 호출해요. 플러그인 안에서는 `fireProjectEvent<T>()`와 같아요. |

## Project

```kotlin
abstract class Project : CoroutineScope, ProjectLifecycleOwner
```

### 속성

| 속성 | 형식 | 설명 |
|---|---|---|
| `info` | `ProjectInfo` | 프로젝트 정보예요(아래 참고). |
| `directory` | `File` | 프로젝트 폴더예요. |
| `config` | `MutableConfig` | 프로젝트 폴더에 저장되는 프로젝트 전용 설정이에요. |
| `logger` | `ProjectLogger` | 프로젝트 로그예요. 앱의 프로젝트 로그 화면에 보여요. |
| `isCompiled` | `Boolean` | 컴파일되어 스코프가 있는지 알려 줘요. |
| `threadPoolName` | `String?` | 스크립트가 실행되는 스레드 풀 이름이에요. |

### 메서드

| 메서드 | 설명 |
|---|---|
| `callFunction(name, args, onException = {})` | 스크립트의 함수를 호출해요. 스크립트 오류는 `onException`으로 전달돼요. |
| `isEventCallAllowed(eventId): Boolean` | 프로젝트가 그 [프로젝트 이벤트](/docs/guides/project-events)를 허용했는지 알려 줘요. |
| `compile(throwException = false): Boolean` | 다시 컴파일해요. 이전 스코프는 정리돼요. |
| `compileAsync(): Flow<Pair<PipelineStage<*, *>, Int>>` | 컴파일 단계와 진행률을 흘려보내며 컴파일해요. |
| `setEnabled(enabled): Boolean` | 프로젝트를 켜거나 꺼요. |
| `getDataDirectory(): File` | 데이터베이스, 사용자 데이터 같은 파일을 저장할 폴더예요. |
| `getLanguage(): Language` | 프로젝트의 스크립트 언어예요. |
| `getScope(): Any?` | 컴파일된 스코프예요. 컴파일 전이면 `null`이에요. |
| `activeJobs(): Int` / `queuedEvents(): Int` | 실행 중인 작업 수와 대기 중인 이벤트 수예요. `queuedEvents()`는 **PluginCore 1.0.0 이상**이에요. |
| `stopAllJobs()` | 실행 중인 작업을 모두 취소해요. |
| `destroy(requestUpdate = false)` | 작업을 취소하고 스코프를 정리해요. |
| `requestUpdate()` | 앱에 프로젝트 화면 갱신을 요청해요. 앱이 백그라운드면 무시돼요. |
| `saveInfo()` / `loadInfo()` | `info`를 파일에 저장하거나 파일에서 다시 읽어요. |
| `rename(name, preserveMainScript = false)` | 이름을 바꿔요. `preserveMainScript`가 `false`면 메인 스크립트 파일 이름도 바꿔요. |

### 한 프로젝트에 이벤트 보내기

```kotlin
inline fun <reified T : ProjectEvent> Project.fireEvent(
    vararg args: Any,
    noinline onFailure: (e: Throwable) -> Unit = {},
): Boolean
```

프로젝트가 그 이벤트를 허용하지 않으면 `false`를 돌려줘요. 자세한 내용은 [프로젝트 이벤트](/docs/guides/project-events#프로젝트-하나에-보내기)를 참고하세요.

## ProjectInfo

| 속성 | 형식 | 설명 |
|---|---|---|
| `id` | `ProjectID` (`UUID`) | 프로젝트 ID예요. |
| `name` | `String` | 이름이에요. |
| `mainScript` | `String` | 메인 스크립트 파일 이름이에요. |
| `languageId` | `String` | 스크립트 언어 ID예요. |
| `isEnabled` | `Boolean` | 켜져 있는지 알려 줘요. |
| `isPinned` | `Boolean` | 목록 위에 고정됐는지 알려 줘요. |
| `createdMillis` | `Long` | 만든 시각이에요. |
| `allowedEventIds` | `MutableSet<String>` | 허용한 프로젝트 이벤트 ID예요. 기본값은 `starlight.*`이고 와일드카드를 쓸 수 있어요. |
| `packages` | `MutableSet<String>` | 메시지를 받을 메신저 앱 패키지예요. 기본값은 `com.kakao.talk`이에요. |

## 프로젝트 로그

`project.logger`(`ProjectLogger`)에 남긴 로그는 그 프로젝트의 로그 화면에 보여요. 플러그인이 프로젝트를 대신해 처리한 일(오류 등)을 사용자에게 알릴 때 좋아요.

```kotlin
project.logger.info("WebServer", "GET /hello 200")
project.logger.error("WebServer", "핸들러에서 오류가 발생했어요: ${e.message}")
```

`verbose`/`v`, `debug`/`d`, `info`/`i`, `warn`/`w`, `error`/`e`, `wtf`가 있고, 각각 `(message)`와 `(tag, message)` 형태로 쓸 수 있어요.

## 프로젝트 생명주기

`project.getLifecycle()`로 프로젝트의 생명주기를 관찰할 수 있어요.

| `ProjectLifecycle.State` | 의미 |
|---|---|
| `COMPILING` | 컴파일 중이에요. |
| `ENABLED` | 켜져 있어요. |
| `DISABLED` | 꺼져 있어요(컴파일이 끝난 직후 포함). |
| `DESTROYED` | 정리됐어요. |

```kotlin
project.getLifecycle().registerObserver(object : ProjectLifecycleObserver.ExplicitObserver {
    override fun onCompileEnd(project: Project) { /* … */ }
    override fun onDestroy(project: Project) { /* … */ }
})
```

상태만 받고 싶다면 `ProjectLifecycleObserver.StateObserver { project, state -> }`를 쓰고, 특정 상태 동안만 코드를 실행하려면 `whileInState(state) { project -> }`를 써요. 관찰을 멈출 때는 `unregisterObserver()`를 호출하세요.
