---
title: 첫 플러그인 만들기
description: 로그를 남기는 가장 작은 플러그인을 만들어 기기에서 실행해 봐요.
order: 2
---

[개발 환경 준비](/docs/start/setup)를 마쳤다면, 켜지고 꺼질 때 로그를 남기는 플러그인을 만들어 볼게요.

## 1. 플러그인 클래스 작성

`StarlightPlugin`을 상속한 클래스를 만들어요. 이 클래스가 플러그인의 진입점(`main_class`)이에요.

```kotlin title="HelloPlugin.kt"
package com.example.hello

import dev.mooner.starlight.plugincore.logger.LoggerFactory
import dev.mooner.starlight.plugincore.plugin.StarlightPlugin

class HelloPlugin : StarlightPlugin() {

    private val log = LoggerFactory.logger("HelloPlugin")

    override fun onEnable() {
        log.info { "Hello, StarLight! (${info.fullName})" }
    }

    override fun onDisable() {
        log.info { "Bye!" }
    }
}
```

- 클래스는 `public`이고 **인자 없는 public 생성자**가 있어야 해요. StarLight가 이 생성자로 플러그인을 만들어요.
- `onEnable()`은 플러그인이 켜질 때, `onDisable()`은 꺼질 때 호출돼요. API, 이벤트, 위젯 등록은 보통 `onEnable()`에서 해요.
- `info`에는 `starlight.json`의 내용이 들어 있어요. `info.fullName`은 `"이름 v버전"` 형식이에요.

## 2. 매니페스트 작성

플러그인 정보는 `starlight.json`에 적어요. Gradle 플러그인의 `manifest { }` 블록을 쓰면 빌드할 때 파일을 만들어 줘요.

```kotlin title="app/build.gradle.kts"
starlight {
    sdk {
        pluginCore = file("libs/PluginCore-release.aar")
        configDsl = file("libs/ConfigDSL-release.aar")
        excludeHostKotlinLibraries = true
    }

    manifest {
        id = "hello"
        name = "Hello"
        mainClass = "com.example.hello.HelloPlugin"
        apiVersion = "0.3.2"
        authors.add("me")
        description = "My first StarLight plugin"
        category = "utility"   // 생략하면 other
        // version을 생략하면 android.defaultConfig.versionName을 써요.
    }
}
```

`manifest { }` 대신 `src/main/assets/starlight.json`을 직접 써도 돼요. 이때는 Gradle 플러그인이 파일을 검증만 해요. 키와 규칙은 [starlight.json](/docs/start/manifest)에서 자세히 볼 수 있어요.

> [!TIP]
> 정식 앱(0.3.4b)에서도 동작해야 한다면 `apiVersion`을 `0.3.2`로 두세요. 정식 앱과 nightly 앱이 모두 이 플러그인을 불러와요. nightly 앱 전용이라면 `1.0.0`으로 둬도 돼요. 이유는 [API 버전 호환](/docs/start/manifest#api-버전-호환)에 정리해 두었어요.

## 3. 빌드

```bash
./gradlew assembleDebugSlp
```

`build/outputs/starlight/debug/hello-debug.slp`가 만들어져요. 빌드 중에 Gradle 플러그인이 아래 항목을 검사하고, 문제가 있으면 빌드를 멈춰요.

- `starlight.json`의 필수 키와 형식
- `main_class`가 APK 안에 있고 `StarlightPlugin`을 상속하며 인자 없는 public 생성자가 있는지
- 앱이 이미 제공하는 라이브러리를 플러그인에 넣지 않았는지(경고)

## 4. 기기에 배포

기기를 USB 디버깅이나 무선 디버깅으로 연결하고 실행해요.

```bash
./gradlew deployDebugSlp -Pstarlight.restartApp=true
```

플러그인이 기기의 `/sdcard/StarLight/plugins/hello.slp`로 복사되고, StarLight가 다시 시작돼요. StarLight는 플러그인을 **앱이 시작될 때만** 불러와서(핫 리로드 없음), 플러그인을 바꿀 때마다 앱을 다시 시작해야 해요.

## 5. 로그 확인

```bash
./gradlew starlightLogcat
```

StarLight의 로그캣이 스트리밍돼요(Ctrl+C로 종료). `Hello, StarLight! (Hello v1.0.0)`이 보이면 성공이에요. 앱의 로그 화면과 플러그인 목록에서도 확인할 수 있어요.

플러그인이 목록에 보이지 않는다면 로그캣에서 플러그인을 제외한 이유를 찾아보세요. API 버전이 맞지 않거나, 필요한 의존성 플러그인이 없을 때 이유가 로그로 남아요. [빌드와 배포](/docs/start/build-and-deploy#문제-해결)에 자주 있는 경우를 정리해 두었어요.

## 다음 단계

- 스크립트에서 쓸 객체를 제공하려면 → [스크립트에 API 노출하기](/docs/guides/script-api)
- 플러그인 설정 화면을 만들려면 → [설정 화면 만들기](/docs/guides/settings)
