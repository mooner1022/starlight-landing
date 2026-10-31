---
title: 웹 서버 플러그인 살펴보기
description: 실제 플러그인인 starlight-webserver가 API, 프로젝트 이벤트, 설정 화면, 위젯을 어떻게 엮는지 따라가 봐요.
order: 5
---

[starlight-webserver](https://github.com/mooner1022/starlight-webserver)(v0.1.2)는 프로젝트(스크립트)가 HTTP 요청을 처리하게 해 주는 플러그인이에요. Ktor(CIO 엔진) 위에서 동작하고, 홈 화면용 상태 위젯을 함께 제공해요. 앞의 가이드에서 다룬 기능을 모두 쓰기 때문에 전체 흐름을 보기에 좋아요.

## 스크립트에서 보이는 모습

먼저 플러그인이 만들어 내는 결과부터 볼게요. 사용자는 프로젝트 설정에서 **웹 서버 설정**(`webserver.server.setup`) 이벤트를 허용하고 아래 함수를 작성해요.

```javascript title="main.js (NeonJS)"
export function onWebServerSetup(server) {
    // 반환값이 응답 본문이 돼요. 객체/배열은 JSON, 문자열은 text/plain.
    server.get("/hello/:name", (req) => ({ hello: req.params.name }));

    // res로 직접 응답할 수도 있어요.
    server.post("/echo", (req, res) => {
        res.status(201).header("X-Length", req.bodySize).send(req.body);
    });

    // 프로젝트 폴더의 public 폴더를 /files 아래로 제공해요.
    server.serveStatic("/files", "public");
}
```

라우터 API 전체(`req`, `res`, 경로 패턴, 오류 응답)는 [저장소의 README](https://github.com/mooner1022/starlight-webserver#readme)에 정리되어 있어요.

## 프로젝트 구성

```text
app/
├─ libs/                 PluginCore-release.aar, ConfigDSL-release.aar
├─ src/main/assets/      starlight.json, icon.png
└─ src/main/java/…/
   ├─ StarlightWebServerPlugin.kt   진입점
   ├─ api/WebServerApi.kt           스크립트 전역 WebServer
   ├─ event/WebServerSetupEvent.kt  onWebServerSetup 이벤트
   ├─ widget/                       홈 위젯
   ├─ route/, http/, server/        라우터와 Ktor 서버
   └─ utils/Translations.kt         tr() 번역 헬퍼
```

### 매니페스트와 의존성

```json title="starlight.json"
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

Ktor는 플러그인에 넣지 않고 [Ktor 플러그인](https://github.com/mooner1022/starlight-ktor)에서 불러와요. 그래서 `dependency`에 `ktor@3.6.0`을 적고, Gradle에서는 `compileOnly`로만 참조해요. 앱이 제공하는 코루틴, 직렬화, AndroidX, NeonJS도 모두 `compileOnly`예요.

```groovy title="app/build.gradle"
dependencies {
    // StarLight가 실행 중에 제공해요.
    compileOnly "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.11.0"
    compileOnly "org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0"
    compileOnly "androidx.core:core-ktx:1.16.0"
    // NeonJS 핸들러의 JS 값과 Promise는 NeonValue로 들어와요.
    compileOnly "dev.mooner.neonjs:neonjs-core:0.1.5"

    // Ktor 플러그인이 제공해요(starlight.json: "ktor@3.6.0"). 버전을 맞춰 두세요.
    compileOnly "io.ktor:ktor-server-cio:3.6.0"
}
```

## onEnable: 등록 순서

```kotlin title="StarlightWebServerPlugin.kt"
override fun onEnable() {
    updateConfig(getPluginConfig())                                   // 1
    val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    pluginScope = scope

    registerProjectEvents {                                           // 2
        category("server") {
            add<WebServerSetupEvent>()
        }
    }
    addApi(WebServerApi())                                            // 3
    try {
        addWidget(WebServerWidget)                                    // 4
    } catch (e: LinkageError) {
        LOG.warn { tr("Widget is not supported by this StarLight version: $e", "이 StarLight 버전에서는 위젯을 지원하지 않아요: $e") }
    }

    EventHandler.on<Events.Project.Compile>(scope) { setUpProject(project) }           // 5
    EventHandler.on<Events.Project.InfoUpdate>(scope) { onProjectInfoUpdated(project) }
    EventHandler.on<Events.Project.Delete>(scope) { WebServerRuntime.routers.close(projectId.toString()) }

    for (project in Session.projectManager.getProjects())             // 6
        if (project.isCompiled && WebServerRuntime.routers.current(project.info.id.toString()) == null)
            setUpProject(project)

    if (autoStart)
        serverExecutor.execute(::startServer)                         // 7
}
```

1. **설정 읽기** — 포트, 접속 범위, 토큰 같은 값을 [설정](/docs/guides/settings)에서 읽어요.
2. **프로젝트 이벤트** — `webserver.server.setup` 이벤트를 등록해요. → [프로젝트 이벤트](/docs/guides/project-events)
3. **스크립트 API** — 전역 `WebServer`를 노출해요. → [스크립트에 API 노출하기](/docs/guides/script-api)
4. **홈 위젯** — 위젯을 지원하지 않는 앱에서도 플러그인이 켜지도록 `LinkageError`를 잡아요. → [홈 위젯](/docs/guides/widgets)
5. **앱 이벤트 구독** — 프로젝트가 컴파일되면 라우터를 새로 만들고 설정 함수를 불러요. 구독은 플러그인 전용 코루틴 스코프에서 해서, `onDisable()`에서 한 번에 취소해요. → [이벤트](/docs/reference/events)
6. **이미 컴파일된 프로젝트** — 플러그인이 켜지기 전에 컴파일된 프로젝트는 컴파일 이벤트를 다시 받지 않으므로 직접 처리해요.
7. **서버 시작** — 포트 바인딩은 네트워크 작업이라 메인 스레드에서 할 수 없어요. 전용 단일 스레드에서 시작하고 멈춰요.

## onDisable: 정리

```kotlin
override fun onDisable() {
    pluginScope?.cancel()      // 이벤트 구독과 요청 처리 중단
    pluginScope = null
    serverExecutor.execute(::stopServer)
}
```

`onEnable()`에서 시작한 스레드, 코루틴, 서버는 `onDisable()`에서 모두 정리해야 해요.

## 프로젝트 이벤트로 스크립트 부르기

```kotlin title="event/WebServerSetupEvent.kt"
class WebServerSetupEvent : ProjectEvent() {
    override val functionName: String = FUNCTION_NAME
    override val id: String = "setup"
    override val name: String = translate {
        Locale.ENGLISH { "Web server setup" }
        Locale.KOREAN  { "웹 서버 설정" }
    }
    override val argTypes: Array<CodeGenerator.Argument<*>> =
        arrayOf("server" typedAs WebServer::class)

    companion object {
        const val FUNCTION_NAME = "onWebServerSetup"
    }
}
```

컴파일 이벤트를 받으면 프로젝트가 이벤트를 허용했는지 직접 확인하고 함수를 불러요.

```kotlin
private fun callSetup(project: Project, router: WebServer) {
    val eventId = ProjectEventManager.validateAndGetEventID(WebServerSetupEvent::class) ?: return
    if (!project.isCompiled || !project.isEventCallAllowed(eventId))
        return
    project.callFunction(WebServerSetupEvent.FUNCTION_NAME, arrayOf(router)) { e ->
        LOG.error { tr("Error while setting up routes of project ${project.info.name}: ${e.message}", "프로젝트 ${project.info.name}의 라우트 설정 중 오류 발생: ${e.message}") }
    }
}
```

`fireProjectEvent<T>()`를 쓰지 않은 이유는, 이 이벤트가 **컴파일된 그 프로젝트 하나**에만 그 프로젝트의 라우터를 넘겨야 하기 때문이에요.

## 전역 API

```kotlin title="api/WebServerApi.kt"
class WebServerApi : Api<WebServer>() {
    override val name: String = "WebServer"
    override val objects: List<ApiObject> = getApiObjects<WebServer>()
    override val instanceClass: Class<WebServer> = WebServer::class.java
    override val instanceType: InstanceType = InstanceType.OBJECT

    override fun getInstance(project: Project): Any =
        WebServerRuntime.routers.open(ProjectRouteOwner(project))
}
```

`OBJECT` 방식이라 프로젝트를 컴파일할 때마다 그 프로젝트의 라우터가 전역 `WebServer`로 들어가요. 그래서 이벤트 함수 없이 최상위 코드에서도 라우트를 등록할 수 있어요.

## 설정 화면

설정 화면은 일반 / 제어 / 보안 / 요청 / 로그 카테고리로 나뉘어 있어요. 몇 가지 눈여겨볼 부분이에요.

- **상태가 반영되는 버튼** — `getConfigStructure()`는 설정 화면을 열 때마다 호출되므로, 서버 상태(작동 중/중지됨/오류)에 따라 버튼 제목과 아이콘 색이 바뀌어요.
- **토큰은 해시로 저장** — `password { hashCode = ::sha256Hex }`로 입력한 토큰을 SHA-256 해시로만 저장해요. `dependency = "require_token"`으로 '접근 토큰 필수'가 켜졌을 때만 활성화돼요.
- **입력 검사** — 포트 입력은 `require`로 1024–65535 범위를 검사해요.
- **값 변경 반응** — `onConfigUpdated()`에서 포트나 접속 범위가 바뀌었고 서버가 작동 중이면 서버를 다시 시작해요.

```kotlin
override fun onConfigUpdated(config: ConfigData, updated: Map<String, Set<String>>) {
    super.onConfigUpdated(config, updated)
    val oldHost = host
    val oldPort = port
    updateConfig(config)
    if ((host != oldHost || port != oldPort) && isRunning)
        serverExecutor.execute(::restartServer)
}
```

## 홈 위젯

```kotlin title="widget/WebServerWidget.kt"
val WebServerWidget = widget("webserver_status") {
    name {
        Locale.ENGLISH { "Web server" }
        Locale.KOREAN  { "웹 서버" }
    }
    span(default = 4 x 2, min = 2 x 1, max = 8 x 4)
    settings {
        toggle("show_chart", tr("Show requests per minute", "분당 요청 그래프 표시"), default = true)
        toggle("show_recent", tr("Show recent requests", "최근 요청 표시"), default = true)
    }
    content {
        val view = WebServerWidgetView(this)
        view.bind(liveData())
        view.root.setOnClickListener { copyServerUrl(it.context) }
        ticker(1.seconds) { view.bind(liveData()) }
        repeatWhile(Lifecycle.State.STARTED) { WebServerRuntime.state.collect { view.bind(liveData()) } }
    }
    preview {
        WebServerWidgetView(this).bind(previewData())
    }
}
```

- 1초마다 통계를 갱신하고(`ticker`), 서버 상태가 바뀌면 바로 다시 그려요(`repeatWhile` + `StateFlow`).
- 높이가 1칸이면 한 줄 요약만, 3칸 이상이면 그래프와 최근 요청 목록까지 보여 줘요. `span`으로 크기를 확인해요.
- 미리보기는 실제 서버 대신 예시 데이터로 그려요.
- 앱의 색과 치수는 리소스 이름으로 찾아 쓰고(`hostColor`, `hostDimen`), 찾지 못하면 앱의 기본값을 써요. 플러그인은 앱의 `R` 클래스를 직접 참조할 수 없기 때문이에요.

## 번역 헬퍼

모든 문구는 한 줄짜리 헬퍼로 영어와 한국어를 함께 적어요.

```kotlin title="utils/Translations.kt"
fun tr(english: String, korean: String): String =
    translate {
        Locale.ENGLISH { english }
        Locale.KOREAN  { korean }
    }
```

로그, 설정 화면, 위젯 어디서나 `tr("Stopped", "중지됨")`처럼 써요. → [로그와 번역](/docs/reference/logging)
