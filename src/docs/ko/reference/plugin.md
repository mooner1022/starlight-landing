---
title: StarlightPlugin
description: 모든 플러그인이 상속하는 기본 클래스의 수명 주기, 등록 메서드, 파일 경로를 정리했어요.
order: 1
---

```kotlin
package dev.mooner.starlight.plugincore.plugin

abstract class StarlightPlugin : Plugin, EventListener
```

`main_class`로 지정한 클래스는 `StarlightPlugin`을 상속하고 인자 없는 public 생성자를 가져야 해요. StarLight가 만든 `PluginClassLoader`로 불러오지 않으면 생성자가 예외를 던지므로, 플러그인 클래스를 직접 생성하지 마세요.

## 수명 주기

`StarlightPlugin`은 `EventListener`를 구현해요. 필요한 콜백만 재정의하세요.

| 메서드 | 호출 시점 |
|---|---|
| `onEnable()` | 플러그인이 켜질 때예요. API, 이벤트, 위젯 등록과 구독을 여기서 해요. |
| `onDisable()` | 플러그인이 꺼질 때예요. `onEnable()`에서 시작한 스레드, 코루틴, 리소스를 정리해요. |
| `onNetworkStateChanged(state: Int)` | 기기의 네트워크 상태가 바뀔 때예요. `NetworkUtil.NETWORK_STATUS_NOT_CONNECTED`(0), `_WIFI`(1), `_MOBILE`(2), `_ETHERNET`(3) 중 하나가 들어와요. |
| `onSchemeAction(context, isGlobal, params)` | `starlight://action/<플러그인 ID>?키=값` 링크가 열릴 때예요. 플러그인 ID 자리에 `global`을 쓰면 모든 플러그인이 받고, 이때 `isGlobal`이 `true`예요. |
| `onProjectCreated(project)` / `onProjectRemoved(project)` / `onProjectUpdated(project)` | 인터페이스에는 있지만 **현재 앱은 플러그인에 이 콜백을 호출하지 않아요.** 대신 [`EventHandler.on<Events.Project.*>`](/docs/reference/events#프로젝트)를 쓰세요. |

### 추가 리스너

```kotlin
protected fun addListener(listener: EventListener)
```

다른 `EventListener` 객체도 같은 콜백을 받게 해요. 플러그인이 이미 켜져 있다면 `listener.onEnable()`이 바로 호출돼요. `getListeners()`는 플러그인 자신을 포함한 리스너 목록을 돌려줘요.

## 설정

| 멤버 | 설명 |
|---|---|
| `getConfigStructure(): ConfigStructure` | 설정 화면 구조를 돌려줘요. 기본값은 빈 목록(설정 화면 없음)이에요. 설정 화면을 열 때마다 호출돼요. |
| `onConfigUpdated(config, updated)` | 설정이 바뀌었을 때예요. `updated`는 카테고리 ID → 바뀐 옵션 ID 집합이에요. 재정의할 때 **`super`를 꼭 호출**하세요(`@CallSuper`). |
| `onConfigValueUpdated(id, data)` | 옵션 값 하나가 바뀌었을 때예요. |
| `getPluginConfig(): ConfigData` | 저장된 설정 값을 읽어요. 결과는 캐시돼요. |
| `invalidateConfigCache()` | 설정 캐시를 비워요. `super.onConfigUpdated()`가 대신 호출해 줘요. |

자세한 사용법은 [설정 화면 만들기](/docs/guides/settings)를 참고하세요.

## 등록

모두 `protected`라 플러그인 클래스 안에서 호출해요. 보통 `onEnable()`에서 써요.

| 메서드 | 설명 |
|---|---|
| `addApi(api: Api<T>)` | 스크립트 전역 API를 등록해요. → [스크립트에 API 노출하기](/docs/guides/script-api) |
| `registerProjectEvents { … }` | 프로젝트 이벤트를 등록해요. → [프로젝트 이벤트](/docs/guides/project-events) |
| `fireProjectEvent<T>(vararg args, onFailure)` | 이벤트를 받을 수 있는 모든 프로젝트의 함수를 호출해요. |
| `addWidget(definition: WidgetDefinition)` | DSL로 만든 홈 위젯을 등록해요. **PluginCore 1.0.0 이상** → [홈 위젯](/docs/guides/widgets) |
| `addWidget(widget: Class<out Widget>)` / `addWidget<T>()` | 예전 방식(`Widget` 상속)의 위젯을 등록해요. |
| `addLanguage(language: Language)` | 새 스크립트 언어를 등록해요. 아래 [언어 추가](#언어-추가)를 참고하세요. |

## 정보와 파일

| 멤버 | 설명 |
|---|---|
| `info: PluginInfo` | `starlight.json`의 내용이에요. `info.id`, `info.name`, `info.version`, `info.fullName`(`"이름 v버전"`) 등이 있어요. |
| `context: PluginContext` | 플러그인 ID, 이름, 리소스 폴더 경로(`resourceDir`)를 담고 있어요. 위젯과 언어를 등록할 때 내부적으로 써요. |
| `isEnabled(): Boolean` | 플러그인이 켜져 있는지 알려 줘요. |
| `getExternalDataDirectory(): File` | `/sdcard/StarLight/plugins/<이름>(<id>)/`예요. 사용자가 볼 수 있는 파일, 설정 파일(`config-plugin.json`)이 여기 있어요. |
| `getInternalDataDirectory(): File` | 앱 내부 저장소의 `plugin_data/<id>/`예요. 사용자에게 보이지 않는 데이터를 둘 때 써요. |
| `getAsset(path: String): File` | 플러그인 assets에서 풀린 파일이에요. assets를 바꿨다면 `starlight.json`의 `assetRevision`을 올려야 다시 풀려요. |
| `getClassLoader(): ClassLoader` | 플러그인을 불러온 클래스 로더예요. 플러그인이 만든 스레드에서 리플렉션이나 `ServiceLoader`를 쓴다면 `Thread.contextClassLoader`로 지정하세요. |
| `fileName`, `fileSize` | 플러그인 파일 이름과 크기예요. |
| `getDataFolder()` | 더 이상 쓰지 않아요. `getExternalDataDirectory()`를 쓰세요. |

`equals()`와 `hashCode()`는 플러그인 ID만 비교해요.

## PluginInfo

`starlight.json`을 읽은 결과예요. 키 설명은 [starlight.json](/docs/start/manifest#키)에 있어요.

| 속성 | 형식 |
|---|---|
| `id`, `name`, `mainClass`, `description` | `String` |
| `version`, `apiVersion` | `Version` |
| `authors` | `List<String>` |
| `dependency` | `List<PluginDependency>` (`pluginId`, `supportedVersion`, `isOptional`) |
| `softDependency` | 선택 의존성만 모은 목록이에요. |
| `category` | `PluginCategory` (`MESSENGER`, `ENGINE`, `LIBRARY`, `UTILITY`, `DEVTOOLS`, `OTHER`) **PluginCore 1.0.0 이상** |
| `usesNativeLibrary`, `assetRevision`, `customClassLoader` | |
| `fullName` | `"$name v$version"` |

## 언어 추가

`addLanguage()`로 새 스크립트 언어(엔진)를 등록하면 사용자가 프로젝트를 만들 때 그 언어를 고를 수 있어요. 매니페스트 `category`를 `engine`으로 두는 걸 권장해요. 언어는 `Language`를 상속해 만들어요.

| 멤버 | 설명 |
|---|---|
| `id`, `name`, `fileExtension` | 언어 ID, 표시 이름, 스크립트 파일 확장자예요. |
| `requireRelease` | `true`면 이벤트 함수를 호출할 때마다, 그리고 스코프를 정리하기 전에 `release(scope)`를 불러요. 스레드에 묶인 실행 컨텍스트를 정리해야 하는 엔진에 써요. |
| `compile(code, apis, project, classLoader): Any` | 스크립트를 컴파일하고 스코프를 돌려줘요. `apis`(등록된 [API](/docs/guides/script-api) 목록)를 스크립트에 넣어 주는 것도 언어의 몫이에요. |
| `callFunction(scope, functionName, args): Any?` | 컴파일된 스코프에서 이벤트 함수를 불러요. |
| `eval(code, options): Any` | 코드 한 조각을 실행해요(디버그룸 등). |
| `release(scope)`, `destroy(scope)` | 스코프를 풀고 정리해요. |
| `configStructure` | 언어별 설정 화면이에요. 값은 `getLanguageConfig()`로 읽어요. |
| `defaultCode`, `codeGenerator` | 새 프로젝트의 기본 코드와 이벤트 함수 틀을 만드는 코드 생성기예요. |
| `defaultConcurrency` | 프로젝트의 기본 동시 실행 수예요(기본 3). |

언어 아이콘은 언어 assets의 `icon.png`를 써요. 실제 구현은 StarLight 저장소의 `JSRhino.kt`, `JSNeon.kt`를 참고하세요.
