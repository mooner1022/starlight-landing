---
title: SDK와 변경 사항
description: PluginCore와 ConfigDSL의 최신 버전과 버전별 변경 사항이에요.
section: sdk
layout: sdk
order: 1
---

## 버전별 변경 사항

PluginCore의 버전은 `Info.PLUGINCORE_VERSION`이에요. ConfigDSL은 따로 버전을 매기지 않고 PluginCore와 함께 배포돼요.

| 버전 | 날짜 | 포함된 앱 |
|---|---|---|
| **1.0.0** | 2026-10-30 | StarLight nightly (아직 정식 앱에 없음) |
| 0.3.3 | 2026-10-30 | nightly 중간 버전 |
| **0.3.2** | 2025-06-05 | StarLight 0.3.4b (현재 정식 앱) |
| 0.3.0 | 2024-02-24 | |
| 0.2.0 | 2024-02-08 | StarLight v0.2.0a |
| 0.1.0 | 2022 | |

### 1.0.0

2026-10-30 · nightly. PluginCore 버전을 앱 버전과 함께 1.0.0으로 맞췄어요. 같은 날 잠깐 쓰인 0.3.3의 변경도 여기에 포함돼요.

**호환성**

- `api_version`을 범위로 확인해요. `0.3.0` 이상이고 앱의 PluginCore 버전 이하인 플러그인을 불러와요. 이전에는 major.minor가 같아야 했어요. (`ApiCompatibility`, `Info.MIN_PLUGIN_API_VERSION` 추가)
- 플러그인 API가 맞지 않아 생기는 오류가 설정 화면과 위젯 밖으로 번지지 않도록 막아요.

**새 기능**

- [홈 위젯 DSL](/docs/guides/widgets): `widget(id) { }`, 크기(span) 모델과 격자 배치, 위젯별 설정, 레이아웃 저장과 예전 위젯 이전
- 매니페스트 `category` 키와 `PluginCategory`
- 플러그인 설치 기록: 설치 출처와 불러오기 상태를 추적해요.
- 프로젝트 이벤트를 공유 워커에서 프로젝트별 버퍼로 실행하고, 대기 중인 이벤트 수(`Project.queuedEvents()`)를 보여 줘요.
- ConfigDSL: `choice`, `multiChoice`, `info`, `progress`, `textList` 옵션, 버튼 `style`/`confirm`/`action`, 실시간 바인딩(`bindTitle`, `bindDescription`, `bindValue`)과 `visibleWhen`, 옵션 대화상자를 앱 시트로 표시, 잘못된 설정 구조 보고

**개선과 수정**

- 플러그인 의존성을 위상 정렬 순서로 불러와요.
- 플러그인과 라이브러리 dex를 코드 캐시의 읽기 전용 복사본에서 불러와요.
- 설정 파일을 원자적으로 쓰고, 손상된 파일에서 복구해요.
- `Version.newerThan`이 모든 자리가 커야만 참이 되던 문제를 고쳤어요.
- `StarlightPlugin`의 `hashCode()`를 플러그인 ID로만 계산해요.
- 이벤트 함수 이름이 겹치면 첫 번째 함수만 기본 코드에 만들어요.
- 불러오지 못한 플러그인을 끌 때 앱 재시작을 요구해요.
- 프로젝트 작업을 멈출 때 스레드 풀과 타이머를 정리하고, 프로젝트 정보를 원자적으로 저장해요.
- ConfigDSL 버튼의 `backgroundColor`를 더 이상 쓰지 않아요(`style` 사용).

[0.3.2와 비교](https://github.com/mooner1022/StarLight/compare/f2df29f3...c4b2ac06)

### 0.3.3

2026-10-30 · nightly. 1.0.0 직전에 잠깐 쓰인 중간 버전이에요. 변경 사항은 1.0.0에 정리했어요.

### 0.3.2

2025-06-05 · **StarLight 0.3.4b**. 현재 정식 앱에 들어 있는 버전이에요.

- `Language.eval()`에 `options` 파라미터를 추가했어요.
- 기본 코드 생성기를 최적화했어요.
- BotManager 호환 API(API2)를 지원해요.
- `ProjectManager.getProject()`의 이름이 `getProjectByName()`으로 바뀌었어요.
- `Events.Project.Delete`에 `projectId`가 추가됐어요.
- `Session.isDebugging`이 `Info.DEBUG`로 옮겨졌어요.
- 설정이 올바르게 불러와지지 않던 문제를 고쳤어요.

[0.3.0과 비교](https://github.com/mooner1022/StarLight/compare/905964bc...f2df29f3)

### 0.3.0

2024-02-24. 설정 화면 구조를 별도 모듈인 **ConfigDSL**로 분리하고 설정 빌더를 새로 만들었어요. 이때부터 플러그인은 PluginCore와 ConfigDSL을 함께 참조해요.

[변경 내용](https://github.com/mooner1022/StarLight/pull/33)

### 0.2.0

2024-02-08 · StarLight v0.2.0a와 함께 나온 버전이에요.

### 0.1.0

첫 PluginCore 버전이에요.

> [!NOTE]
> 변경 사항은 StarLight 저장소의 커밋 이력에서 플러그인에 영향을 주는 항목을 골라 정리했어요. 전체 내용은 각 버전의 비교 링크에서 볼 수 있어요.
