---
title: 개발 환경 준비
description: 플러그인을 빌드하는 데 필요한 도구와 SDK를 준비해요.
order: 1
---

## 필요한 도구

| 도구 | 버전 | 비고 |
|---|---|---|
| JDK | 17 이상 | |
| Gradle | 8.11 이상 | |
| Android Gradle Plugin | 8.0 이상 | `com.android.application`으로 적용해요. |
| Kotlin | 2.4.20 (또는 바로 이전 마이너 버전) | PluginCore가 이 버전으로 컴파일돼서, 더 오래된 컴파일러는 PluginCore 클래스를 읽지 못해요. |
| Android Studio | 최신 버전 권장 | |
| adb | | 기기 배포에 써요. Android SDK Platform-Tools에 들어 있어요. |

플러그인을 실행할 안드로이드 기기에는 StarLight 앱이 설치되어 있어야 해요. StarLight의 `minSdk`는 26(Android 8.0)이에요.

## SDK 준비하기

플러그인은 **PluginCore**와 **ConfigDSL**을 `compileOnly`로 참조해요. 실행할 때는 StarLight 앱이 들어 있는 것을 쓰기 때문에, 플러그인 파일에 함께 넣으면 안 돼요.

> [!NOTE]
> SDK 파일 배포는 아직 준비 중이에요. 지금은 StarLight 저장소에서 직접 빌드해 주세요. 배포가 시작되면 [SDK 페이지](/docs/sdk)에서 내려받을 수 있어요.

```bash
git clone https://github.com/mooner1022/StarLight.git
cd StarLight
./gradlew :PluginCore:assembleRelease :ConfigDSL:assembleRelease
```

빌드가 끝나면 아래 두 파일을 플러그인 프로젝트의 `libs/` 폴더로 복사해요.

- `PluginCore/build/outputs/aar/PluginCore-release.aar`
- `ConfigDSL/build/outputs/aar/ConfigDSL-release.aar`

## 프로젝트 만들기

Android Studio에서 **No Activity** 템플릿으로 새 프로젝트를 만들어요. 플러그인은 화면이 있는 앱이 아니라 StarLight가 불러오는 APK이므로 액티비티가 필요 없어요.

`settings.gradle.kts`에서 Gradle 플러그인 포털을 플러그인 저장소로 쓰는지 확인하고, 모듈의 `build.gradle.kts`에 StarLight Gradle 플러그인을 적용해요.

```kotlin title="app/build.gradle.kts"
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("io.github.mooner1022.slplugin") version "0.3.0"
}

android {
    namespace = "com.example.hello"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.hello"
        minSdk = 26
        versionName = "1.0.0" // starlight.json의 version 기본값으로 쓰여요.
    }
}

starlight {
    sdk {
        pluginCore = file("libs/PluginCore-release.aar")
        configDsl = file("libs/ConfigDSL-release.aar")
        // Kotlin 런타임(stdlib, reflect, coroutines, serialization)은 StarLight가 제공해요.
        excludeHostKotlinLibraries = true
    }
}
```

`sdk { }`에 지정한 두 파일은 자동으로 `compileOnly` 의존성이 돼요.

> [!WARNING]
> AGP 9의 내장 Kotlin을 쓴다면 루트 `build.gradle.kts`에 `id("org.jetbrains.kotlin.android") version "2.4.20" apply false`를 추가해 Kotlin 버전을 고정하세요.

## 앱이 제공하는 라이브러리

StarLight 앱에 이미 들어 있는 라이브러리는 `compileOnly`로 선언해요. 플러그인 파일에 함께 넣으면 앱과 버전이 엇갈려 클래스 충돌이 날 수 있어요. Gradle 플러그인은 이런 라이브러리가 플러그인에 포함되면 경고를 보여 줘요.

```kotlin title="app/build.gradle.kts"
dependencies {
    compileOnly("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.11.0")
    compileOnly("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")
    compileOnly("androidx.core:core-ktx:1.16.0")
    compileOnly("androidx.appcompat:appcompat:1.7.0")
    compileOnly("androidx.lifecycle:lifecycle-runtime-ktx:2.9.0")
    compileOnly("com.google.android.material:material:1.12.0")
}
```

위 버전은 [웹 서버 플러그인](/docs/guides/webserver-example)이 쓰는 값이에요. 앱의 라이브러리 버전과 맞춰 주세요.

다른 플러그인이 제공하는 라이브러리도 같은 방식으로 `compileOnly`로 참조하고, `starlight.json`의 `dependency`에 그 플러그인을 적어요. 예를 들어 웹 서버 플러그인은 Ktor를 직접 넣지 않고 Ktor 플러그인(`ktor@3.6.0`)에서 불러와요.

## 다음 단계

준비가 끝났다면 [첫 플러그인 만들기](/docs/start/first-plugin)로 넘어가세요.
