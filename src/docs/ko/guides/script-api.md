---
title: 스크립트에 API 노출하기
description: 플러그인의 Kotlin 객체나 클래스를 프로젝트 스크립트의 전역 변수로 제공해요.
order: 1
---

플러그인은 `Api`를 등록해 스크립트에 전역 이름을 하나 추가할 수 있어요. 등록한 이름은 프로젝트를 컴파일할 때 스크립트에 주입되고, 코드 에디터의 자동 완성에도 나타나요.

## Api 클래스

`Api<T>`를 상속해 아래 다섯 가지를 정해요.

| 멤버 | 설명 |
|---|---|
| `name` | 스크립트에서 쓸 전역 이름이에요. 다른 API와 겹치면 안 돼요. |
| `instanceType` | `InstanceType.OBJECT` 또는 `InstanceType.CLASS`예요. 아래에서 설명해요. |
| `instanceClass` | 노출할 Kotlin 클래스예요. |
| `getInstance(project)` | `OBJECT` 방식에서 프로젝트마다 넘길 인스턴스를 만들어요. |
| `objects` | 에디터 자동 완성에 보여 줄 멤버 목록이에요. 보통 `getApiObjects<T>()`로 채워요. |

## 프로젝트마다 객체 하나: OBJECT

`InstanceType.OBJECT`는 프로젝트를 **컴파일할 때마다** `getInstance(project)`를 호출해, 그 결과를 `name`이라는 전역 변수로 넣어요. 프로젝트별 상태가 필요한 API에 알맞아요.

```kotlin title="Greeter.kt"
class Greeter(private val project: Project) {

    fun hello(name: String): String =
        "Hello, $name! (from ${project.info.name})"
}

class GreeterApi : Api<Greeter>() {

    override val name: String = "Greeter"

    override val objects: List<ApiObject> = getApiObjects<Greeter>()

    override val instanceClass: Class<Greeter> = Greeter::class.java

    override val instanceType: InstanceType = InstanceType.OBJECT

    override fun getInstance(project: Project): Any = Greeter(project)
}
```

플러그인의 `onEnable()`에서 등록해요.

```kotlin title="HelloPlugin.kt"
override fun onEnable() {
    addApi(GreeterApi())
}
```

스크립트에서는 바로 전역 변수로 쓸 수 있어요.

```javascript title="main.js"
function response(room, msg, sender, isGroupChat, replier) {
    if (msg === "/hello")
        replier.reply(Greeter.hello(sender));
}
```

## 클래스 자체를 노출: CLASS

`InstanceType.CLASS`는 `instanceClass`를 그대로 `name`에 연결해요. 스크립트는 클래스의 정적 메서드를 호출하거나 생성자로 인스턴스를 만들 수 있어요. 이 방식에서는 `getInstance()`가 호출되지 않아요.

```kotlin title="TextTools.kt"
object TextTools {
    @JvmStatic
    fun reverse(text: String): String = text.reversed()
}

class TextToolsApi : Api<TextTools>() {
    override val name: String = "TextTools"
    override val objects: List<ApiObject> = getApiObjects<TextTools>()
    override val instanceClass: Class<TextTools> = TextTools::class.java
    override val instanceType: InstanceType = InstanceType.CLASS
    // CLASS 방식에서는 호출되지 않아요.
    override fun getInstance(project: Project): Any = TextTools
}
```

```javascript
TextTools.reverse("StarLight"); // "thgiLratS"
```

Kotlin `object`의 함수를 스크립트에서 정적 메서드로 부르려면 `@JvmStatic`을 붙이세요. `getApiObjects()`는 리플렉션으로 멤버를 모으므로, `object`의 `INSTANCE` 필드도 자동 완성에 함께 보여요.

## 언어별 동작

| 언어 | OBJECT | CLASS |
|---|---|---|
| Rhino (JS) | 전역 변수로 인스턴스를 넣어요. | `const <name> = Packages.<클래스 이름>;`으로 연결해요. |
| NeonJS | 전역 변수로 인스턴스를 넣어요. | 클래스를 `<name>`으로 노출해요. |

- NeonJS는 이름이 `Java`인 API를 노출하지 않아요.
- NeonJS 프로젝트는 ES 모듈로 실행돼요. 전역 API는 그대로 쓸 수 있지만, 이벤트 함수는 `export` 해야 해요.

> [!NOTE]
> NeonJS의 플러그인 API 노출은 StarLight nightly 기준이에요. 웹 서버 플러그인의 소스 주석처럼 "NeonJS는 아직 플러그인 API를 노출하지 않는다"고 적힌 자료는 그 이전 버전 이야기예요.

## 주의할 점

- **이름 충돌** — 같은 `name`의 API가 이미 있으면 새 API는 경고와 함께 무시돼요. StarLight 기본 API(`Api`, `App`, `BotManager`, `Broadcast`, `Bridge`, `DataBase`, `Device`, `EventEmitter`, `FileStream`, `HomeWidget`, `Languages`, `Log`, `Notification`, `Platform`, `Plugins`, `Projects`, `Utils` 등)와도 겹치지 않는 이름을 쓰세요.
- **주입 시점** — API는 프로젝트를 컴파일할 때 들어가요. 플러그인이 켜지기 전에 컴파일된 프로젝트는 다시 컴파일해야 새 API가 보여요.
- **스레드** — 스크립트는 프로젝트의 작업 스레드에서 API를 호출해요. 메인 스레드가 아니므로 뷰를 직접 건드리지 말고 `Handler(Looper.getMainLooper())` 등으로 넘기세요.
- **값의 형식** — 스크립트가 넘긴 함수나 객체는 언어의 값 형식 그대로 들어와요. Rhino는 Rhino 객체, NeonJS는 `NeonValue`예요(웹 서버 플러그인은 그래서 `dev.mooner.neonjs:neonjs-core`를 `compileOnly`로 참조해요). 가능하면 문자열, 숫자, 불리언처럼 단순한 형식으로 주고받으세요.
- **자동 완성** — `getApiObjects<T>()`는 클래스의 필드와 메서드를 리플렉션으로 모아요. 에디터는 이름에 `$`가 들어간 멤버를 숨겨요.

## 다음 단계

스크립트가 API를 부르는 대신, 플러그인이 스크립트의 함수를 부르게 하려면 [프로젝트 이벤트](/docs/guides/project-events)를 만드세요.
