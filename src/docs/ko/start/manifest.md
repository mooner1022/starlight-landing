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
| `api_version` | 버전 | ✓ | 플러그인이 기준으로 삼은 PluginCore 버전이에요. 앱의 PluginCore가 이 버전 이상이어야 불러와요. [API 버전 호환](#api-버전-호환)을 참고하세요. |
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
- **`api_version`이 `0.3.x`라면** `{`로 시작해 `}`로 끝나야 하고, 앞뒤에 공백이나 빈 줄이 있으면 안 돼요. 이런 플러그인은 PluginCore 0.3.x 앱(정식 앱)도 불러오는데, 그 앱은 파일을 줄 단위로 읽어 다시 합치기 때문이에요. PluginCore 1.0.0 앱은 파일을 그대로 JSON으로 읽어서 이 제한이 없어요.

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

`api_version`은 플러그인이 어떤 PluginCore를 기준으로 만들어졌는지, 즉 앱에 어느 버전 이상의 PluginCore가 필요한지 알려 줘요.

| 앱 | 받아들이는 `api_version` |
|---|---|
| StarLight 0.3.4b (정식, PluginCore 0.3.2) | major.minor가 같은 `0.3.x` |
| StarLight nightly (PluginCore 1.0.0) | `0.3.0` 이상, `1.0.0` 이하 |

nightly에서는 앱보다 새로운 PluginCore를 요구하는 플러그인(`api_version`이 앱보다 높음)과, 지원 범위(`0.3.0`)보다 오래된 플러그인을 불러오지 않아요. Gradle 플러그인 0.3.0도 같은 범위로 검사해서, 벗어나면 경고를 보여 줘요.

| 목표 | 권장 `api_version` |
|---|---|
| 정식 앱과 nightly 앱 모두 지원 | **`0.3.2`** |
| nightly 앱(PluginCore 1.0.0) 전용 | `1.0.0` |

`0.3.2`로 두더라도 PluginCore 1.0.0에서 추가된 API(위젯 DSL 등)를 쓴다면, 정식 앱에서는 그 부분이 `LinkageError`로 실패해요. [홈 위젯의 호환성](/docs/guides/widgets#호환성)처럼 감싸서 등록하세요.

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
