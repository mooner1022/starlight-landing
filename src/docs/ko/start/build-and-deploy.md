---
title: 빌드와 배포
description: Gradle 플러그인의 태스크로 .slp를 만들고, 기기에 올리고, 로그를 확인하는 방법이에요.
order: 4
---

[StarLight Gradle 플러그인](https://github.com/mooner1022/StarLight-GradlePlugin)(`io.github.mooner1022.slplugin`)은 플러그인 APK를 `.slp`로 묶고, StarLight가 불러올 때와 같은 기준으로 검사하고, adb로 기기에 올려요. StarLight가 실행 중에야 알려 주던(또는 조용히 무시하던) 문제를 빌드 오류로 미리 알 수 있어요.

## 태스크

| 태스크 | 하는 일 |
|---|---|
| `assemble<Variant>Slp` | 빌드 변형을 빌드하고 검사한 뒤 `build/outputs/starlight/<variant>/<id>-<variant>[-<abi>].slp`를 만들어요. |
| `assembleSlp` | 모든 빌드 변형을 만들어요. |
| `deploy<Variant>Slp` | `.slp`를 기기의 `/sdcard/StarLight/plugins/<id>.slp`로 올려요. 기기에 맞는 ABI 분할 파일을 골라요. |
| `restartStarlight` | StarLight를 강제 종료하고 다시 실행해요. |
| `starlightLogcat` | StarLight의 로그캣을 스트리밍해요(Ctrl+C로 종료). |
| `generate<Variant>StarlightManifest` | `starlight.json`을 생성해요(`manifest { }` 블록이 있을 때만). |
| `verifyStarlightSdk` | SDK 파일이 있는지 확인해요(매 빌드 전에 실행돼요). |

평소에는 이렇게 반복하면 돼요.

```bash
./gradlew deployDebugSlp -Pstarlight.restartApp=true
./gradlew starlightLogcat
```

## 기기 지정

`deploy { device }`에는 `adb -s`에 넘길 수 있는 값을 적어요. 기기가 하나만 연결되어 있다면 생략해도 돼요.

```kotlin title="app/build.gradle.kts"
starlight {
    deploy {
        device = "192.168.0.10:5555"   // adb 시리얼 또는 ip:port
        // restartApp = true           // 배포 후 StarLight를 다시 시작
    }
}
```

- 무선 디버깅은 `adb pair <ip>:<port>`로 한 번 페어링한 뒤 *무선 디버깅* 화면의 주소를 쓰세요. `ip:port` 값이면 Gradle 플러그인이 `adb connect`를 대신 실행해요.
- 개인 주소를 빌드 스크립트에 남기고 싶지 않다면 `-Pstarlight.device=...`나 환경 변수 `STARLIGHT_DEVICE`를 쓰세요. 둘 다 빌드 스크립트보다 우선해요.
- `restartApp`은 기기의 StarLight를 강제 종료해요. 매번 다시 시작하지 않으려면 빌드 스크립트에서는 꺼 두고 `-Pstarlight.restartApp=true`로 필요할 때만 켜세요.

## 검사 항목

검사 규칙은 StarLight가 플러그인을 읽고 불러오는 방식과 같아요(Gradle 플러그인 0.3.0 기준).

- `starlight.json`이 `assets/`에 있고 BOM이 없는지. `api_version`이 `0.3.x`라면 `{`로 시작해 `}`로 끝나고 앞뒤에 빈 줄이 없는지도 확인해요.
- 필수 키(`id`, `name`, `main_class`, `version`, `api_version`, `authors`, `description`)와 그 형식
- 버전이 `major.minor.patch[.build]` 형식인지
- `api_version`이 앱이 불러오는 범위(`0.3.0` 이상, 앱의 PluginCore 이하)인지. Gradle 플러그인이 아는 가장 새 PluginCore는 1.0.0이라, 더 높은 값은 경고만 해요.
- `id`가 영문, 숫자, `.`, `_`, `-`로만 이루어졌고 예약어(`global`, `starlight`, `system`, `core`)가 아닌지(오류)
- `category`가 문자열인지, 알려진 카테고리인지(모르는 값은 경고)
- 의존성 문자열 형식(`id`, `id@1.2.3`, `id@*?`)과 `?`만 붙은 선택 의존성
- 모르는 키(경고), 예전 키 `depend`(오류)
- `main_class`가 APK 안에 있고, public이고, 추상 클래스가 아니며, `StarlightPlugin`을 상속하고, 인자 없는 public 생성자가 있는지
- `uses_native_lib`가 실제 `.so` 파일 포함 여부와 맞는지
- 앱이 제공하는 라이브러리(PluginCore, ConfigDSL, Kotlin, 주요 AndroidX, Material)를 플러그인에 넣었는지(경고)

## 참고 사항

- **난독화** — R8을 켠다면 진입점 클래스를 남겨 두세요. `excludeHostKotlinLibraries`를 켰다면 `-dontwarn kotlin.**`도 필요할 수 있어요.

  ```properties title="proguard-rules.pro"
  -keep class com.example.MyPlugin { public <init>(); }
  ```

- **서명** — StarLight는 플러그인 서명을 확인하지 않아서, 서명하지 않은 release 빌드도 동작해요.
- **ABI 분할** — ABI별로 APK를 나누면 `<id>-<variant>-<abi>.slp`가 각각 만들어지고, 배포할 때 기기에 맞는 파일을 골라요.
- **같은 ID의 파일** — `plugins/` 폴더에 ID가 같은 `.slp`가 여럿 있으면 StarLight는 `version`이 가장 높은 것을 불러오고 나머지는 제외해요. 배포 태스크는 `<id>.slp`로 저장하므로, 다른 이름으로 남아 있는 예전 파일은 지워 주세요.
- **구성 캐시** — Gradle 플러그인 0.3.0은 Gradle 구성 캐시(configuration cache)와 함께 쓸 수 있어요.

## 0.2.0에서 올리기

- 플러그인 ID에 영문, 숫자, `.`, `_`, `-` 외의 문자가 있으면 이제 오류예요(이전에는 경고). PluginCore 1.0.0 앱이 이런 플러그인을 불러오지 않기 때문이에요.
- `api_version`을 앱의 major.minor 대신 앱이 불러오는 범위로 검사해요. `1.0.0`도 더 이상 경고하지 않아요.
- 필요하면 `manifest { }`에 `category`를 추가하세요.

## 문제 해결

플러그인이 앱에 보이지 않거나 켜지지 않으면 `starlightLogcat`에서 아래 메시지를 찾아보세요.

| 로그 | 원인과 해결 |
|---|---|
| `requires PluginCore X or newer` | `api_version`이 앱의 PluginCore보다 높아요. 앱을 업데이트하거나 `api_version`을 낮추세요. |
| `targets PluginCore X, older than the supported Y` | `api_version`이 지원 범위보다 오래됐어요. |
| `Required dependency X for plugin Y wasn't found` | `dependency`에 적은 플러그인이 기기에 없거나 버전(major.minor)이 맞지 않아요. |
| `Failed to read plugin info from …` | `starlight.json`을 읽지 못했어요. 뒤에 붙은 이유를 확인하세요. `Cannot find starlight.json`은 파일 위치, `Malformed starlight.json`은 JSON 문법이나 BOM, `Illegal plugin id`는 ID에 쓸 수 없는 문자가 있다는 뜻이에요. → [형식 규칙](/docs/start/manifest#파일-형식-규칙) |
| `was skipped because … has the same id` | 같은 ID의 `.slp`가 여러 개예요. 버전이 가장 높은 파일만 불러오니, 예전 파일을 지우세요. |
| `Failed to load plugin …` | 플러그인 클래스를 만들지 못했어요. `main_class` 이름과 생성자를 확인하세요. |

빌드 결과물에 문제가 있다면 먼저 Gradle 플러그인의 검사 결과를 확인하세요. 대부분은 빌드 단계에서 잡혀요.
