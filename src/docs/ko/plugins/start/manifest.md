---
title: starlight.json
description: 플러그인의 이름, 진입점, 버전, 의존성을 적는 매니페스트 파일의 모든 키와 규칙이에요.
order: 3
---

`starlight.json`은 플러그인 APK의 `assets/` 폴더에 들어가는 매니페스트예요. StarLight는 플러그인을 불러오기 전에 이 파일부터 읽어요.

```json title="src/main/assets/starlight.json"
{
  "id": "webserver",
  "name": "Web Server",
  "category": "utility",
  "main_class": "dev.mooner.starlightwebserver.StarlightWebServerPlugin",
  "version": "0.1.2",
  "api_version": "0.3.2",
  "assetRevision": 1,
  "dependency": ["ktor@3.6.0"],
  "authors": ["mooner"],
  "description": "HTTP server that routes requests to StarLight projects"
}
```

위 예시는 [웹 서버 플러그인](https://github.com/mooner1022/starlight-webserver)의 실제 매니페스트예요.

## 키

| 키 | 형식 | 필수 | 설명 |
|---|---|---|---|
| `id` | 문자열 | ✓ | 플러그인을 구분하는 ID예요. 이벤트 ID, 데이터 폴더 이름에도 쓰여요. 영문 대소문자, 숫자, `.`, `_`, `-`만 쓸 수 있고, `global`, `starlight`, `system`, `core`는 쓸 수 없어요. |
| `name` | 문자열 | ✓ | 앱에 표시되는 이름이에요. |
| `main_class` | 문자열 | ✓ | `StarlightPlugin`을 상속한 클래스의 전체 이름이에요. |
| `version` | 버전 | ✓ | 플러그인 버전이에요. |
| `api_version` | 버전 | ✓ | 플러그인에 필요한 가장 낮은 PluginCore 버전이에요. 앱의 PluginCore가 이 버전 이상이어야 불러와요. [API 버전 호환](#api-버전-호환)을 참고하세요. |
| `target_api_version` | 버전 | | 빌드에 쓴 PluginCore 버전이에요. Gradle 플러그인 0.4.0이 자동으로 기록하고, 직접 써도 돼요(`api_version`보다 낮으면 경고). 지금 앱은 이 값을 읽지 않아요(모르는 키는 무시). 앞으로 동작 변경을 플러그인별로 나눠 적용할 때 쓰여요. |
| `authors` | 문자열 배열 | ✓ | 만든 사람 목록이에요. |
| `description` | 문자열 | ✓ | 플러그인 설명이에요. |
| `dependency` | 문자열 배열 | | 먼저 불러와야 하는 플러그인 목록이에요. [의존성](#의존성)을 참고하세요. |
| `category` | 문자열 | | `messenger`, `engine`, `library`, `utility`, `devtools`, `other` 중 하나예요(대소문자 무시). 없거나 모르는 값이면 `other`가 되고, 모르는 값은 Gradle 플러그인이 경고로 알려 줘요. **PluginCore 1.0.0 이상** |
| `uses_native_lib` | 불리언 | | 플러그인에 `.so` 네이티브 라이브러리가 있으면 `true`로 설정해요. |
| `assetRevision` | 정수 | | 이 값이 바뀔 때만 StarLight가 플러그인의 assets를 다시 풀어요. assets를 바꿨다면 올려 주세요. |
| `custom_classloader` | 문자열 | | 직접 만든 클래스 로더를 쓸 때 그 클래스 이름이에요. 대부분의 플러그인에는 필요 없어요. |

버전은 `major.minor.patch` 또는 `major.minor.patch.build` 형식이에요(예: `1.0.0`).

## 파일 형식 규칙

- 파일은 `assets/`에 두세요. `res/raw/`도 아직 읽지만 더 이상 권장하지 않아요.
- UTF-8 BOM이 없어야 해요.
- 의존성 키는 `dependency`예요. 예전 이름인 `depend`는 무시되므로 Gradle 플러그인이 오류로 알려 줘요.
- **`api_version`이 `0.3.x`라면** `{`로 시작해 `}`로 끝나야 하고, 앞뒤에 공백이나 빈 줄이 있으면 안 돼요. 이런 플러그인은 PluginCore 0.3.x 앱(StarLight 0.3.4b)도 불러오는데, 그 앱은 파일을 줄 단위로 읽어 다시 합치기 때문이에요. PluginCore 1.0.0 이상 앱은 파일을 그대로 JSON으로 읽어서 이 제한이 없어요.

## 의존성

`dependency`의 각 항목은 아래 형식 중 하나예요.

| 형식 | 의미 |
|---|---|
| `"ktor"` | `ktor` 플러그인이 필요해요. 버전은 상관없어요. |
| `"ktor@3.6.0"` | `ktor` 플러그인이 필요하고, 버전의 **major.minor가 3.6**이어야 해요. |
| `"ktor@*?"` | 있으면 먼저 불러오고, 없어도 괜찮아요(선택 의존성). |
| `"ktor@3.6.0?"` | 선택 의존성이고, 있다면 major.minor가 3.6이어야 해요. |

- 버전은 **major와 minor만** 비교해요. `ktor@3.6.0`은 `3.6.0`과 `3.6.9`를 모두 받아들이지만 `3.7.0`은 받아들이지 않아요.
- 버전 없이 `"ktor?"`라고 쓰면 StarLight가 `?`까지 ID로 읽어서 절대 일치하지 않아요. 버전과 상관없는 선택 의존성은 `"ktor@*?"`로 쓰세요.
- StarLight는 의존성 순서대로(위상 정렬) 플러그인을 불러와요. 필요한 의존성이 없거나 버전이 맞지 않으면 그 플러그인은 불러오지 않고 이유를 로그에 남겨요.

## API 버전 호환

`api_version`은 플러그인에 필요한 가장 낮은 PluginCore 버전이에요. 앱은 플러그인을 불러올 때 이 값을 앱의 PluginCore 버전과 비교해요.

| 앱 | 받아들이는 `api_version` |
|---|---|
| StarLight 0.3.4b (PluginCore 0.3.2) | major.minor가 같은 `0.3.x` |
| StarLight 1.0.x (PluginCore 1.0.x, 현재 정식·베타는 1.0.1) | `0.3.0` 이상, 앱의 PluginCore 이하 |
| StarLight 1.1.0 nightly (PluginCore 1.1.0) | `0.3.0` 이상, `1.1.0` 이하 |

PluginCore 1.0.0 이상 앱은 `api_version`이 앱의 PluginCore보다 높은 플러그인을 건너뛰고, 로그에 "PluginCore 1.1.0 이상이 필요해요" 같은 이유를 남겨요. 지원 하한(`0.3.0`)보다 낮은 플러그인도 건너뛰어요.

| 목표 | 권장 `api_version` |
|---|---|
| StarLight 0.3.4b(PluginCore 0.3.2) 앱까지 지원 | **`0.3.2`** |
| PluginCore 1.0.0 이상 앱 지원 | `1.0.0` |
| PluginCore 1.1.0 API를 쓰는 1.1.0 앱 전용 | `1.1.0` |

`0.3.2`로 두더라도 PluginCore 1.0.0에서 추가된 API(위젯 DSL 등)를 쓴다면, PluginCore 0.3.2 앱에서는 그 부분이 `LinkageError`로 실패해요. [홈 위젯의 호환성](/docs/plugins/guides/widgets#호환성)처럼 감싸서 등록하세요.

### PluginCore 1.1.0과 1.0.x

| 플러그인 | PluginCore 1.0.x 앱 | PluginCore 1.1.0 앱 |
|---|---|---|
| 1.0.x용 기존 플러그인(`api_version` 1.0.x) | 그대로 동작 | 수정 없이 로드. [1.1.0의 동작 변경](/docs/plugins/sdk#1.1.0)이 적용됨 |
| 1.1.0 API를 쓰고 `api_version`을 `1.1.0`으로 선언 | **로드되지 않음** | 동작 |
| 1.1.0으로 빌드했지만 `api_version`은 1.0.x로 둠 | 아래 규칙을 지키면 동작 | 동작 |

마지막 경우처럼 1.0.x 앱도 함께 지원하려면 다음을 지키세요.

- **새 `open` 멤버는 오버라이드만 하세요. 안전해요.** 대상은 `scriptArguments`, `listenerName`, `alternateFunctionName`, `generateCode(generator, name)`, 3인자 `formatDefaultCode`예요. 1.0.x 앱에서는 호출되지 않을 뿐 오류는 나지 않아요.
- **새 멤버를 직접 호출하지 마세요.** 플러그인 코드가 직접 호출하면 1.0.x 앱에서 `NoSuchMethodError`가 나요. 예: `ProjectInfoBuilder.allowedEventIds` 설정, `event.scriptArguments` 읽기. 꼭 써야 한다면 버전을 확인한 뒤에만 쓰고, 그 코드에 [`@RequiresPluginCore`](/docs/plugins/start/build-and-deploy#requiresplugincore)를 붙이세요.
- 생명주기와 컴파일 동작은 앱 버전을 따라요. 두 방식 모두에서 문제없도록 작성하세요. → [켜고 끄는 순서](/docs/plugins/reference/plugin#켜고-끄는-순서), [컴파일은 한 번에 하나](/docs/plugins/reference/projects#컴파일은-한-번에-하나)

Gradle 플러그인 0.4.0 이상과 PluginCore 1.1.0 AAR로 빌드하면 이 규칙을 빌드 단계에서 자동으로 확인해요. → [`api_version` 계산과 검증](/docs/plugins/start/build-and-deploy#api_version-계산과-검증)

## Gradle에서 생성하기

`manifest { }` 블록을 쓰면 `starlight.json`을 직접 쓰지 않아도 돼요.

```kotlin title="app/build.gradle.kts"
starlight {
    manifest {
        id = "my_plugin"
        name = "My Plugin"
        mainClass = "com.example.MyPlugin"
        apiVersion = "0.3.2"
        authors.add("me")
        description = "What it does"
        category = "utility"            // messenger, engine, library, utility, devtools, other(기본값)
        // version = "1.0.0"            // 기본값: android.defaultConfig.versionName
        // usesNativeLibrary = true     // .so 파일이 있을 때
        // assetRevision = 3            // 기본값: assets 파일들의 해시
        dependency("nodejs")                          // 필수, 버전 상관없음 → "nodejs"
        dependency("v8", version = "0.0.3")           // 필수, major.minor 일치 → "v8@0.0.3"
        dependency("python", optional = true)         // 선택 → "python@*?"
    }
}
```

`manifest { }`가 없으면 `src/main/assets/starlight.json`을 검증해요. 직접 쓴 파일을 쓴다면 assets를 바꿀 때 `assetRevision`도 직접 올려 주세요.

`category` 설정은 Gradle 플러그인 **0.3.0 이상**에서 쓸 수 있어요.

Gradle 플러그인 **0.4.0 이상**에서는 `apiVersion`을 생략할 수 있어요. 생략하면 코드가 실제로 쓰는 PluginCore API로 계산하고, 적으면 그 값이 코드에 충분한지 검사해요. 빌드에 쓴 PluginCore 버전은 `target_api_version`으로 기록해요. 자세한 내용은 [`api_version` 계산과 검증](/docs/plugins/start/build-and-deploy#api_version-계산과-검증)을 참고하세요.
