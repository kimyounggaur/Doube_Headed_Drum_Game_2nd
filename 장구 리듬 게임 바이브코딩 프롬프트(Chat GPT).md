아래는 첨부 설계와 이미지들을 기반으로 **“조선의 북소리: 전장의 지휘자”를 실제 플레이 가능한 웹 프로토타입으로 업그레이드하기 위한 바이브코딩 프롬프트 패키지**입니다. 핵심은 기존 설계의 “장구 리듬 = 군령 = 전술 명령” 구조를 유지하면서, 입력 판정·전투 시뮬레이션·진법 콤보·RPG 성장·훈련/도감 모드까지 데이터 기반으로 확장하는 것입니다. 첨부 마크다운의 기본 콘셉트는 조선 시대 전장, 플레이어 역할은 고수/군령 장교, 장르는 리듬 전략 액션으로 정의되어 있습니다.  또한 궁/구/따/다/덩/더가 각각 보병, 궁수, 전군 명령으로 매핑되어 있고, 리듬 패턴 성공 시 진법과 사기가 발동되는 구조가 이미 잡혀 있습니다. 

---

## 1. 그대로 복사해서 쓰는 메인 바이브코딩 프롬프트

````markdown
너는 세계 최고 수준의 게임 기획자, 리듬게임 시스템 디자이너, TypeScript 프론트엔드 엔지니어, UX 디자이너, 사운드 시스템 엔지니어다.

우리는 첨부된 마크다운 기획서와 이미지 소스를 바탕으로, 장구 리듬 게임 프로토타입을 “최고의 플레이 가능한 웹 게임 데모”로 업그레이드한다.

게임명은 우선 “조선의 북소리: 전장의 지휘자”로 한다.  
핵심 정체성은 다음과 같다.

- 배경: 판타지 요소 없는 조선 시대 전장.
- 플레이어 역할: 칼을 휘두르는 장수가 아니라, 장구와 북소리로 부대를 지휘하는 고수/군령 장교.
- 장르: 리듬 전략 액션 + 가벼운 RPG 성장.
- 핵심 재미: 정확한 장단 입력이 단순 점수가 아니라 전술 명령, 진법, 사기, 전황 변화로 이어진다.
- 핵심 문법: “리듬 입력 → 군령 판정 → 부대 행동 → 전황 변화 → 성장/해금”.

이번 목표는 예쁜 목업이 아니라, 실제로 브라우저에서 플레이 가능한 프로토타입이다.

## 기술 스택

다음 스택으로 구현한다.

- Vite + React + TypeScript
- Canvas 2D 기반 게임 화면
- React DOM 기반 메뉴, HUD, 설정, 도감, 결과 화면
- Web Audio API 기반 타격음/피드백음/메트로놈/간단한 전장 사운드
- 외부 백엔드 없음
- localStorage로 진행도 저장
- 가능하면 외부 게임 엔진은 쓰지 않는다. Phaser 없이 Canvas 2D와 TypeScript로 구현한다.
- 빌드가 반드시 통과해야 한다.

## 첨부 이미지/소스 활용

첨부 이미지들은 `/public/assets/source/`에 있다고 가정한다. 한글 파일명은 import 오류가 날 수 있으므로, 코드에서 직접 참조하기 전에 안전한 영문 파일명으로 복사하거나, asset manifest를 만들어 관리한다.

사용할 이미지 소스 예시는 다음과 같다.

- `1768263708087.jpg`: 현재 전투 UI 와이어프레임. 상단 전황, 중앙 전장, 하단 장구 입력부 레이아웃 참고.
- `레벨 디자인 (Level 1-신병 훈련소).jpg`: Level 1 튜토리얼 카드/로딩 이미지/훈련소 배경 참고.
- `레벨 디자인(Level 2-첫 번째 보조 근무).png`: Level 2 강약 조절/야간 보초 배경 참고.
- `레벨 디자인(Level 3-왜구의 기습).png`: Level 3 패턴 콤보/마을 습격 배경 참고.
- `02 핵심 메카닉-군령(Signal) 시스템[타법에 따른 병과지휘].png`: 구음별 명령표 참고.
- `02 핵심 메카닉-군령(Signal) 시스템[리듬 패턴과 진법].png`: 진법 UI/도감/스킬 카드 참고.
- `03 RPG 성장 요소-승진과 장비.png`: 계급/장비 UI 참고.
- `04 콘텐츠 구성(역사 속 전장).png`, `04 콘텐츠 구성-역사 속 전장.png`: 캠페인/훈련/도감 구조 참고.
- `Gemini_Generated_Image_jq8w8tjq8w8tjq8w.png`: 아군 판옥선/해전 아이콘으로 활용.
- `Gemini_Generated_Image_8kv2tz8kv2tz8kv2.png`: 보스 함선 또는 적 기함 아이콘으로 활용.
- `학익진&일좌진01.png`: 진법 연출 참고.
- `휘모리 (Hwimori).png`, `자진모리 (Jajinmori).png`: 장단 도감/훈련 모드 참고.

이미지가 없어도 게임은 깨지지 않게 fallback 일러스트/도형을 Canvas로 그려라.

## 핵심 구현 원칙

1. “리듬 게임”과 “전략 전투”를 분리하지 말고 결합한다.
   - 노트 판정이 곧 명령 발동이다.
   - 명령 결과가 상단 전황 게이지, 아군/적군 이동, 사기, 피해량, 방어력에 즉시 반영되어야 한다.

2. 판타지 마법 이펙트를 쓰지 않는다.
   - 이펙트는 깃발 신호, 함성, 화살, 방패벽, 포격, 북소리, 전열 이동, 파도, 연기, 먼지로 표현한다.

3. 모든 핵심 데이터는 하드코딩 UI에 박지 말고 데이터 파일로 분리한다.
   - 구음 데이터
   - 노트 차트
   - 레벨 데이터
   - 진법 패턴
   - 장비 데이터
   - 계급 데이터

4. 모바일과 데스크톱 모두 플레이 가능해야 한다.
   - 데스크톱 키보드
   - 모바일 터치
   - 오디오 지연 보정 설정
   - 판정선, 노트 속도, 판정 범위 조절 옵션

5. 프로토타입이지만 “게임 루프”가 완성되어야 한다.
   - 메인 메뉴
   - 캠페인 선택
   - 훈련 모드
   - 전투 플레이
   - 결과 화면
   - 경험치/승진/장비 해금
   - 도감
   - 설정
   - 저장/불러오기

## 프로젝트 구조

다음 구조로 파일을 만든다.

```txt
src/
  main.tsx
  App.tsx
  styles/
    global.css
    theme.css

  data/
    strokes.ts
    formations.ts
    charts.ts
    levels.ts
    equipment.ts
    ranks.ts
    codex.ts

  game/
    types.ts
    constants.ts
    math.ts
    timing.ts
    input.ts
    audio/
      AudioEngine.ts
      synth.ts
    rhythm/
      RhythmEngine.ts
      ChartPlayer.ts
      Judgement.ts
      PatternDetector.ts
    battle/
      BattleEngine.ts
      EnemyDirector.ts
      CommandResolver.ts
    render/
      GameCanvas.tsx
      drawBattlefield.ts
      drawRhythmLane.ts
      drawEffects.ts
      sprites.ts

  state/
    useGameStore.ts
    save.ts

  screens/
    MainMenu.tsx
    CampaignScreen.tsx
    BattleScreen.tsx
    TrainingScreen.tsx
    CodexScreen.tsx
    EquipmentScreen.tsx
    ResultScreen.tsx
    SettingsScreen.tsx

  components/
    Button.tsx
    Panel.tsx
    BattleStatusBar.tsx
    RhythmLegend.tsx
    FormationBadge.tsx
    RankBadge.tsx
    DebugPanel.tsx
````

Zustand 같은 상태관리 라이브러리를 쓰지 않아도 된다. 필요하면 React context 또는 간단한 store 클래스로 구현한다. 단, 코드가 지저분해지지 않도록 분리한다.

## 데이터 모델

먼저 `src/game/types.ts`에 다음 핵심 타입을 만든다.

```ts
export type StrokeType = 'Gung' | 'Gu' | 'Tta' | 'Da' | 'Dung' | 'Deo' | 'Rest';

export type Lane = 'left' | 'right' | 'both' | 'none';
export type Strength = 'strong' | 'soft' | 'rest';

export type JudgementName = 'perfect' | 'great' | 'good' | 'miss';

export interface StrokeDefinition {
  id: StrokeType;
  korean: string;
  roman: string;
  lane: Lane;
  strength: Strength;
  commandName: string;
  commandDescription: string;
  tacticalRole: string;
  colorHint: string;
  keyboard: string[];
}

export interface ChartNote {
  id: string;
  beat: number;
  type: StrokeType;
  durationBeats?: number;
  label?: string;
  commandHint?: string;
}

export interface RhythmChart {
  id: string;
  name: string;
  timeSignature: string;
  bpm: number;
  subdivision: number;
  notes: ChartNote[];
}

export interface FormationRecipe {
  id: string;
  nameKo: string;
  nameHanja?: string;
  nameEn: string;
  sequence: StrokeType[];
  maxGapBeats: number;
  minAverageJudgement: 'perfect' | 'great' | 'good';
  effectDescription: string;
  cooldownMs: number;
}

export interface LevelDefinition {
  id: string;
  chapter: number;
  titleKo: string;
  subtitle: string;
  mode: 'campaign' | 'training' | 'boss';
  backgroundKey: string;
  chartIds: string[];
  enemyProfile: string;
  objective: string;
  unlocks?: string[];
  tutorialSteps?: TutorialStep[];
}

export interface BattleState {
  battleBalance: number; // 0 enemy victory, 50 neutral, 100 ally victory
  allyMorale: number;    // 0-100
  enemyMorale: number;   // 0-100
  allyHP: number;        // 0-100
  enemyHP: number;       // 0-100
  combo: number;
  maxCombo: number;
  fever: number;         // 0-100
  activeFormationId?: string;
  recentCommands: CommandEvent[];
}

export interface CommandEvent {
  timeMs: number;
  stroke: StrokeType;
  judgement: JudgementName;
  commandName: string;
  effectPower: number;
}
```

## 구음/명령 데이터

`src/data/strokes.ts`를 만든다.

반드시 다음 매핑을 구현한다.

* 궁 Gung

  * lane: left
  * strength: strong
  * command: 보병 전진 / 방패 벽
  * tactical role: 적 돌격 저지, 전선 유지
  * desktop key: F 또는 A
  * mobile: 왼쪽 궁편 중앙 강타 영역

* 구 Gu

  * lane: left
  * strength: soft
  * command: 보병 대기 / 재정비
  * tactical role: 흐트러진 대열 정비, 보병 체력 회복
  * desktop key: D 또는 S
  * mobile: 왼쪽 궁편 가장자리 약타 영역

* 따 Tta

  * lane: right
  * strength: strong
  * command: 궁수 일제 사격
  * tactical role: 원거리 적 제압, 화망 구성
  * desktop key: J 또는 L
  * mobile: 오른쪽 채편 중앙 강타 영역

* 다 Da

  * lane: right
  * strength: soft
  * command: 조준 / 장전
  * tactical role: 다음 사격 치명타 확률 증가
  * desktop key: K 또는 ;
  * mobile: 오른쪽 채편 가장자리 약타 영역

* 덩 Dung

  * lane: both
  * strength: strong
  * command: 전군 총공격
  * tactical role: 보병과 궁수 동시 공격
  * desktop: F+J 또는 A+L 동시 입력
  * mobile: 좌우 중앙 강타 동시 터치

* 더 Deo

  * lane: both
  * strength: soft
  * command: 전군 후퇴 / 산개
  * tactical role: 포격/광역 공격 회피
  * desktop: D+K 또는 S+; 동시 입력
  * mobile: 좌우 가장자리 약타 동시 터치

입력 강약은 실제 모바일 압력 감지에 의존하지 말고, UI에서 각 편을 “중앙 강타 존”과 “가장자리 약타 존”으로 나누어 구현한다.

## 리듬 판정 시스템

`RhythmEngine`과 `ChartPlayer`를 구현한다.

요구사항:

* AudioContext time 또는 performance.now 기반의 안정적인 타이밍을 사용한다.
* 노트는 beat 기준으로 저장하고, 플레이 시 seconds로 변환한다.
* hitLine은 화면 하단 고정.
* 노트는 위에서 아래로 내려온다.
* approachTime 기본값 1800ms.
* 판정 범위:

  * perfect: ±45ms
  * great: ±90ms
  * good: ±140ms
  * miss: 그 외
* 설정에서 판정 보정 offsetMs를 -200ms ~ +200ms 사이로 조절 가능하게 한다.
* 동시 입력 Dung/Deo는 좌우 입력이 75ms 이내에 들어오면 하나의 both 입력으로 합친다.
* miss가 나면 전황이 악화되고 사기가 떨어진다.
* good 이상이면 명령이 발동된다.
* great/perfect이면 명령 위력이 커진다.
* perfect 연속 시 fever가 오른다.

## 전투 시스템

`BattleEngine`, `CommandResolver`, `EnemyDirector`를 구현한다.

전투는 다음 상태를 가진다.

* `battleBalance`: 0~100, 시작값 50

  * 100에 가까우면 아군 우세
  * 0에 가까우면 적군 우세
* `allyMorale`: 0~100
* `allyHP`: 0~100
* `enemyHP`: 0~100
* `enemyPressure`: 시간이 지날수록 증가
* `combo`, `fever`

구음별 효과:

* Gung / 궁

  * good: battleBalance +1.0, allyMorale +1
  * great: battleBalance +1.5, allyMorale +2, shieldBuff 2초
  * perfect: battleBalance +2.2, allyMorale +3, shieldBuff 4초
  * 시각효과: 방패벽 전진, 파란 깃발 상승

* Gu / 구

  * good: allyHP +0.8, allyMorale +1
  * great: allyHP +1.2, 다음 Gung 효과 +15%
  * perfect: allyHP +1.8, 전열 정비 연출
  * 시각효과: 병사 대열 재정렬, 먼지 감소

* Tta / 따

  * good: enemyHP -1.0, battleBalance +1
  * great: enemyHP -1.8
  * perfect: enemyHP -2.5, arrowVolley 연출
  * Da 조준 버프가 있으면 피해량 1.4배

* Da / 다

  * good: aimBuff 1회
  * great: aimBuff 1회 + enemyMorale -1
  * perfect: aimBuff 2회 + 다음 Tta 치명타
  * 시각효과: 궁수 조준선, 작은 숨 고르기 효과

* Dung / 덩

  * good: enemyHP -2.0, battleBalance +2
  * great: enemyHP -3.2, allyMorale +3
  * perfect: enemyHP -4.5, fever +8, 대포/함성 동시 연출
  * 단, 남발 방지를 위해 2초 내부 쿨다운

* Deo / 더

  * good: 다음 enemyAttack 피해 30% 감소
  * great: 다음 enemyAttack 피해 55% 감소, battleBalance +0.5
  * perfect: 적 광역공격 회피, allyMorale +2
  * 시각효과: 산개, 후퇴 깃발, 적 포격 회피

적 행동:

* EnemyDirector는 일정 간격으로 적 압박 이벤트를 발생시킨다.
* Level 1: 느린 돌격
* Level 2: 은밀한 접근/경보 게이지
* Level 3: 기습, 화살, 돌격 혼합
* 한산도 해전: 적선 접근, 포격
* 행주 대첩: 웨이브 다수, 자원 압박

적 이벤트 예시:

```ts
type EnemyEventType = 'charge' | 'arrowRain' | 'cannon' | 'ambush' | 'moralePush';
```

Deo가 정확하면 cannon/arrowRain을 회피하고, Gung이 정확하면 charge를 막고, Tta/Dung이 정확하면 enemyHP를 깎는다.

## 진법 패턴 시스템

`PatternDetector`를 구현한다.

* 최근 성공한 입력을 배열로 저장한다.
* miss는 패턴 체인을 끊는다.
* good 이상 입력만 패턴 후보가 된다.
* 정해진 sequence가 순서대로 들어오고, 각 입력 간 간격이 maxGapBeats 이하이면 진법 발동.
* 진법은 cooldownMs를 가진다.
* 진법 발동 시 화면 중앙에 한지 두루마리 스타일 배너와 깃발 신호가 나온다.

기본 진법:

1. 일자진

   * sequence: Tta, Gung, Gung, Tta, Gu, Gung
   * 효과: 8초 동안 방어력 상승, 적 파상공세 피해 감소
   * 연출: 병사들이 일렬 방패벽 구성

2. 학익진

   * sequence: Da, Tta, Da, Tta, Gung, Dung
   * 효과: 적을 포위하는 연출, enemyHP 큰 폭 감소, battleBalance 상승
   * 연출: 아군이 반원 형태로 펼쳐지고 적을 감싼다

3. 장사진

   * sequence: Dung, Gung, Tta, Gung, Tta
   * 효과: 기동력 증가, 빠른 돌파/후퇴가 쉬워짐
   * 연출: S자 행군 궤적

4. 원진

   * sequence: Gung, Tta, Gung, Tta
   * 효과: 포위 상황에서 생존력 증가
   * 연출: 아군이 둥글게 방어

Level 3에서는 짧은 전술 콤보도 구현한다.

* 돌격: Da, Da, Tta
* 포위: Tta, Gung, Tta
* 화차/신기전 지원: Dung, Dung, Tta, Gung, Tta

  * 너무 판타지처럼 보이지 않게, 역사적 화포 지원 연출로 표현한다.

## 리듬 차트 데이터

`src/data/charts.ts`에 다음 차트를 구현한다.

### Level 1: 신병 훈련소

* BPM: 80
* timeSignature: 4/4
* 사용 노트: Gung, Tta, Dung
* 목표: 좌/우/동시 입력 적응
* 패턴:

  * Gung, Rest, Tta, Rest
  * Gung, Tta, Dung, Rest
  * Gung, Gung, Tta, Dung
* 총 32~48노트
* 초반은 매우 쉽고 후반에 Dung 동시 입력 추가

### Level 2: 첫 번째 보초 근무

* BPM: 72
* timeSignature: 4/4
* 사용 노트: Gu, Da, Deo, Gung, Tta
* 목표: 강약 구분
* 특수 규칙:

  * 강타를 잘못 치면 경보 게이지 상승
  * 약타 성공 시 은밀 제압/전열 정비
* 패턴:

  * Gu, Rest, Da, Rest
  * Gu, Da, Deo, Rest
  * Gu, Gu, Da, Deo
  * 마지막에는 Gung/Tta 강타가 필요한 긴급 대응

### Level 3: 왜구의 기습

* BPM: 96
* timeSignature: 4/4
* 사용 노트: 모든 구음
* 목표: 연결 장단으로 전술 발동
* 패턴:

  * Da, Da, Tta = 돌격
  * Tta, Gung, Tta = 포위
  * Dung, Rest, Dung, Tta, Gung, Tta = 화차 지원
* 총 60~80노트
* 전투 이벤트와 노트를 맞물리게 설계

### 별달거리

* BPM: 118
* timeSignature: 4/4
* 기본 패턴:

  * Dung, Rest, Dung, Rest, Gung, Tta, Gung, Rest
* 보너스/피버 모드:

  * Gung, Tta, Gung, Tta, Gung, Tta, Gung, Rest
* 화면에 “하늘 보고 별을 따고, 땅을 보고 농사짓고” 같은 사설을 자막처럼 표시하되, 저작권 문제가 없도록 자체 문장으로 짧고 교육적으로 쓴다.

### 휘모리

* BPM: 150
* timeSignature: 4/4
* 기본 패턴:

  * Dung, Rest, Dung, Rest, Gung, Tta, Gung, Rest
* 변형 다드래기:

  * Dung, Da, Da, Gung, Tta, Gung, Rest
* 전투 절정/추격전에 사용
* Da, Da는 ghost note처럼 작은 노트로 표시하고 판정 범위를 조금 넓힌다.

### 자진모리

* BPM: 108
* timeSignature: 12/8
* subdivision: 12
* 기본 1:

  * Dung, Rest, Rest, Dung, Rest, Rest, Gung, Tta, Gung, Rest, Rest, Rest
* 기본 2:

  * Dung, Deo, Gung, Deo, Gung, Deo, Gung, Deo
* 일반 전투 또는 몬스터 대신 “기습 부대/왜군 소부대” 등장에 사용한다. 판타지 몬스터는 사용하지 않는다.

## 레벨 구성

`src/data/levels.ts`를 만든다.

### Campaign 1: 부산진 전투 / 튜토리얼

* title: “1장: 부산진 전투”
* playable sub-level: “신병 훈련소”
* objective: 기본 궁, 따, 덩으로 전선을 60초 동안 유지
* enemy: 느린 보병 웨이브
* clear condition:

  * enemyHP <= 0 또는 battleBalance >= 80
  * allyHP > 0
* fail condition:

  * battleBalance <= 0 또는 allyHP <= 0
* unlock:

  * Level 2
  * Training: Basic Strokes

### Campaign 2: 첫 번째 보초 근무

* objective: 강약을 구분해 적 정찰병을 조용히 제압
* unique gauge: alertGauge
* soft notes 성공 시 alertGauge 감소
* strong notes 오입력 시 alertGauge 상승
* clear condition:

  * chart complete + alertGauge < 70
* unlock:

  * Level 3
  * Equipment: 대나무 열채

### Campaign 3: 왜구의 기습

* objective: 전술 콤보로 마을 습격 방어
* unlock formations:

  * 돌격
  * 포위
  * 화차 지원
* clear condition:

  * 최소 2회 이상 전술 콤보 성공
  * enemyHP <= 0 또는 battleBalance >= 85
* unlock:

  * 장비 화면
  * 도감: 진법

### Campaign 4: 한산도 대첩

* 해전 레벨
* 배경: 파도, 판옥선, 적선
* 특수 규칙:

  * Gung/Gu는 노 젓기/선회
  * Tta/Da는 포격 준비/발사
  * Dung은 일제 포격
  * 학익진 발동 시 적 함대 포위 연출
* clear:

  * 학익진 1회 이상 발동
  * 적 기함 HP 0

### Campaign 5: 행주 대첩

* 최종 데모 레벨
* BPM 상승 구조: 110 → 130 → 150
* 휘모리 피날레
* 특수 규칙:

  * 콤보가 높을수록 민병/아녀자 지원 연출 증가
  * miss가 많으면 성벽 피해 증가
* clear:

  * 휘모리 구간에서 fever 100 달성 또는 적 마지막 웨이브 격퇴

## UI/UX

전체 분위기는 첨부 이미지처럼 한지, 두루마리, 목재, 짙은 남색 전장, 붉은 적군, 푸른 아군을 조합한다.

### 화면 구조

BattleScreen:

1. 상단 HUD

   * 게임명/레벨명
   * Battle Status bar: Ally vs Enemy
   * allyHP, morale, combo, fever
   * pause/settings button

2. 중앙 전장 Canvas

   * 좌측/하단: 아군
   * 우측/상단: 적군
   * 해전 레벨에서는 파도와 배
   * 육전 레벨에서는 성벽/마을/훈련소
   * 명령 성공 시 깃발/부대 애니메이션

3. 하단 리듬 입력부

   * 왼쪽 궁편 영역
   * 오른쪽 채편 영역
   * 각 영역은 중앙 강타 존과 가장자리 약타 존으로 나뉨
   * hit line
   * 내려오는 노트
   * 노트 라벨: 궁/구/따/다/덩/더
   * 강타 노트는 굵고 선명하게
   * 약타 노트는 작고 반투명한 물결 표시
   * 동시 노트는 좌우를 잇는 가로 연결선 표시

4. 판정 피드백

   * PERFECT/GREAT/GOOD/MISS
   * command text: “궁수 일제 사격!”, “방패벽 전진!”, “전군 산개!”
   * 너무 크게 가리지 않게 0.6초 후 사라짐

### 메뉴

MainMenu:

* 시작하기
* 캠페인
* 무관 수련
* 장비/승진
* 역사 도감
* 설정

CampaignScreen:

* 장별 카드
* 잠금/해금 상태
* 추천 장단
* 클리어 등급

TrainingScreen:

* 구음 연습
* 장단 연습
* 판정선/오프셋 보정
* 타법표 보기
* 자유 연습: 사용자가 원하는 BPM과 장단 선택

CodexScreen:

* 장구 구음
* 군령 체계
* 진법
* 전장
* 장비
* 각 항목은 짧은 교육 문장 + 게임 내 효과 + 이미지 카드

EquipmentScreen:

* 악기:

  * 교련용 장구: 기본
  * 용고: Dung 효과 +10%
  * 신기전 지원 장구: 화차/신기전 콤보 피해 +15%
* 복장:

  * 철릭: 기본
  * 두정갑: allyHP 감소량 -10%
* 채:

  * 기본 궁채/열채
  * 대나무 열채: Da 판정 범위 +10ms
  * 강화 궁채: Gung 판정 범위 +10ms
* 장비 효과는 숫자로 보여준다.

## 오디오

`AudioEngine`을 구현한다.

실제 샘플 파일이 없으면 Web Audio API로 합성음을 만든다.

* Gung: 낮은 북소리. sine/triangle oscillator + noise transient. pitch 낮음.
* Gu: Gung보다 작고 짧음.
* Tta: 높은 목탁/채편 느낌. bandpass noise + 짧은 envelope.
* Da: Tta보다 작고 짧은 ghost note.
* Dung: Gung과 Tta 동시 재생 + 저역 강조.
* Deo: Gu와 Da 동시 재생, 작고 짧음.
* perfect: 짧은 깃발/종 느낌.
* miss: 둔탁한 낮은 소리.
* cannon: Dung perfect 또는 해전 포격 때 낮은 boom.
* crowd: fever/formation 때 짧은 함성 noise.

반드시 브라우저 autoplay 제한을 고려해서, 첫 사용자 클릭 후 AudioContext를 resume한다.

## 시각 연출

Canvas에 다음을 그린다.

* 바다/파도: 한산도 해전
* 성벽/훈련소/마을: 각 레벨 배경
* 아군: 푸른 계열 병사 아이콘 또는 간단한 방패/깃발 스프라이트
* 적군: 붉은 계열 병사/배 아이콘
* 화살: Tta 성공 시 오른쪽 위로 날아가는 선
* 방패벽: Gung 성공 시 아군 앞에 방패 라인
* 산개: Deo 성공 시 병사들이 좌우로 퍼지는 애니메이션
* 진법:

  * 일자진: 직선 대열
  * 학익진: 반원 대열
  * 원진: 원형 대열
  * 장사진: S자 궤적
* 마법진, 초자연적 폭발, 번개 마법은 금지.
* 단, 전투 피드백을 위해 먼지, 파도, 화포 연기, 깃발, 빛나는 창끝 정도는 허용.

## 저장/성장 시스템

localStorage에 저장한다.

```ts
interface SaveData {
  version: number;
  xp: number;
  rankId: string;
  clearedLevels: Record<string, {
    grade: 'S' | 'A' | 'B' | 'C';
    score: number;
    maxCombo: number;
    accuracy: number;
  }>;
  unlockedLevels: string[];
  unlockedEquipment: string[];
  equipped: {
    instrument: string;
    armor: string;
    sticks: string;
  };
  settings: {
    offsetMs: number;
    noteSpeed: number;
    hitWindowScale: number;
    reducedMotion: boolean;
    masterVolume: number;
  };
}
```

계급:

1. 의병
2. 군악대원
3. 별기군
4. 훈련도감 지휘관
5. 전장의 고수

각 계급은 troopCap, formationSlots, moraleBonus를 가진다.

결과 화면에서 다음을 계산한다.

* accuracy
* maxCombo
* score
* grade
* xpGain
* unlocked items
* “오늘 익힌 장단” 요약

## 점수 시스템

점수는 다음 기준으로 계산한다.

* perfect: 1000
* great: 700
* good: 400
* miss: 0
* combo bonus: combo * 10, 최대 500
* formation bonus: 3000
* fever bonus: 1.2배

등급:

* S: accuracy >= 95% and maxCombo >= 80%
* A: accuracy >= 88%
* B: accuracy >= 75%
* C: 그 외
* fail: clear condition 실패

## 설정

SettingsScreen에서 다음을 제공한다.

* 오디오 지연 보정 offsetMs
* 노트 속도
* 판정 난이도
* 음량
* reduce motion
* 저장 초기화
* 키보드 도움말

Calibration:

* 메트로놈을 8박 재생
* 사용자가 박자에 맞춰 탭
* 평균 오차로 offsetMs 제안
* 적용 버튼

## 디버그 패널

개발 중 `?debug=1`이면 DebugPanel을 표시한다.

표시할 값:

* currentTime
* currentBeat
* offsetMs
* active notes
* recent input events
* recent judgement
* battleBalance
* allyHP/enemyHP
* active buffs
* pattern buffer
* FPS

## 구현 순서

반드시 아래 단계 순서로 구현한다. 각 단계가 끝나면 build 오류를 고친다.

### Phase 1: 프로젝트 기초

* Vite React TypeScript 프로젝트 구성
* global.css/theme.css
* App 라우팅 상태 구현
* MainMenu, CampaignScreen, BattleScreen 골격
* asset manifest와 fallback 처리

완료 조건:

* `npm run build` 통과
* 메인 메뉴에서 전투 화면 진입 가능

### Phase 2: 리듬 엔진

* ChartNote 렌더링
* 노트 하강
* hit line
* keyboard/touch input
* 판정 perfect/great/good/miss
* Dung/Deo 동시 입력 처리
* combo/accuracy 표시

완료 조건:

* Level 1 chart가 실제로 플레이 가능
* 입력 시 노트가 판정되고 사라짐
* 결과 화면에 정확도와 콤보 표시

### Phase 3: 전투 엔진

* BattleState 구현
* CommandResolver 구현
* 구음별 전술 효과
* Battle Status bar 변화
* 적 압박 이벤트
* clear/fail 조건

완료 조건:

* 리듬을 잘 치면 아군이 이김
* 계속 miss하면 적이 이김
* 궁/따/덩의 효과 차이가 시각적으로 드러남

### Phase 4: Level 1~3 완성

* Level 1 신병 훈련소
* Level 2 첫 번째 보초 근무
* Level 3 왜구의 기습
* 각 레벨별 배경, 튜토리얼, 목표, 결과 문구

완료 조건:

* 세 레벨이 순차 해금됨
* Level 2에서 강약 구분이 의미 있음
* Level 3에서 콤보 전술이 발동됨

### Phase 5: 진법 시스템

* PatternDetector
* 일자진/학익진/장사진/원진
* FormationBadge
* 진법 발동 연출
* cooldown 표시

완료 조건:

* 정해진 패턴 입력 시 진법이 발동됨
* 전투 효과와 화면 연출이 모두 있음

### Phase 6: 장단 확장

* 별달거리
* 휘모리
* 자진모리
* TrainingScreen에서 장단 선택 연습
* CodexScreen에서 장단 설명 표시

완료 조건:

* 각 장단을 훈련 모드에서 플레이 가능
* 휘모리의 빠른 템포와 자진모리의 12/8 느낌이 구분됨

### Phase 7: RPG 성장/장비

* localStorage save
* XP, 계급, 장비 해금
* EquipmentScreen
* 장비 효과가 실제 판정/전투에 반영됨

완료 조건:

* 클리어 후 XP 증가
* 장비 장착 후 효과 적용
* 새로고침 후 저장 유지

### Phase 8: 사운드/연출 폴리시

* Web Audio 합성 타격음
* 구음별 다른 소리
* formation/cannon/crowd 효과
* reduced motion 대응
* 이미지 asset 활용 및 fallback

완료 조건:

* 오디오가 첫 클릭 후 정상 재생
* 사운드 없이도 플레이 가능
* 첨부 이미지가 적절히 메뉴/도감/배경에 사용됨

### Phase 9: 최종 QA

* TypeScript 오류 제거
* build 오류 제거
* 모바일 터치 확인
* 키보드 조작 확인
* localStorage 저장 확인
* 모든 화면 이동 확인
* 디버그 패널 정상 확인
* 접근성: 버튼 라벨, 색 대비, reduced motion

## 최종 산출물

최종적으로 다음을 제공하라.

1. 완성된 코드
2. 실행 방법
3. 주요 파일 설명
4. 구현된 기능 목록
5. 남은 개선 과제
6. “플레이 방법” 짧은 안내

## 절대 하지 말 것

* 목업만 만들고 실제 플레이가 안 되는 상태로 끝내지 마라.
* 판타지 마법/몬스터 중심으로 바꾸지 마라.
* 리듬 입력이 단순 점수만 올리고 전투에 영향을 주지 않는 구조로 만들지 마라.
* 한글 파일명 import 오류를 방치하지 마라.
* 오디오 autoplay 문제를 무시하지 마라.
* 타입 오류나 build 오류를 남기지 마라.
* 모든 데이터를 App.tsx 하나에 몰아넣지 마라.

이제 Phase 1부터 Phase 9까지 순서대로 구현하라. 구현 중 막히면 임시로 기능을 삭제하지 말고, fallback을 만들어 전체 게임 루프가 유지되게 하라.
최종적으로 브라우저에서 바로 플레이 가능한 “장구 리듬 전략 액션 RPG 프로토타입”을 완성하라.

````

---

## 2. 첫 구현 후 바로 넣을 “업그레이드 1차 프롬프트”

메인 프롬프트로 1차 결과가 나온 뒤, 기능이 얕거나 전투감이 약하면 아래를 넣으면 됩니다.

```markdown
지금 구현된 장구 리듬 게임 프로토타입을 “리듬 입력이 실제 전술처럼 느껴지는 게임”으로 강화해줘.

우선 코드를 전체 점검하고 다음 문제를 찾아서 고쳐라.

1. 리듬 판정이 전투에 충분히 영향을 주는가?
2. 궁/구/따/다/덩/더의 차이가 플레이어에게 명확히 느껴지는가?
3. Dung/Deo 동시 입력이 정확히 처리되는가?
4. miss가 났을 때 전황 악화가 분명한가?
5. perfect/great가 났을 때 보상이 충분한가?
6. Level 1, 2, 3의 난이도 차이가 분명한가?
7. 한글 UI가 깨지지 않는가?
8. 모바일 터치 조작이 가능한가?
9. 사운드가 첫 클릭 후 정상 작동하는가?
10. localStorage 저장/해금이 정상 작동하는가?

다음 개선을 구체적으로 구현해라.

- Battle Status Bar에 애니메이션을 추가해라.
- 명령 성공 시 화면 중앙에 “방패벽!”, “일제 사격!”, “전군 산개!” 같은 군령 배너를 띄워라.
- 궁 성공 시 아군 방패 라인이 앞으로 밀고 나가게 하라.
- 따 성공 시 화살 궤적이 적에게 날아가게 하라.
- 다 성공 시 다음 따 노트 위에 “조준 완료” 표시를 띄워라.
- 덩 성공 시 함성, 북소리, 포격 연출을 동시에 보여라.
- 더 성공 시 적 포격/화살비를 회피하는 산개 애니메이션을 보여라.
- miss 시 아군 대열이 흔들리고 enemy pressure가 올라가게 하라.
- Level 2에서는 약타 노트를 잘못 강타하면 alertGauge가 크게 상승하게 하라.
- Level 3에서는 패턴 콤보 성공 시 전투가 확실히 유리해지게 하라.

모든 개선 후 `npm run build`가 통과하도록 오류를 수정해라.
````

---

## 3. “장단/채보 강화” 전용 프롬프트

첨부 설계에는 별달거리, 휘모리, 자진모리 데이터가 포함되어 있고, 휘모리는 4/4의 빠른 BPM 140~160, 자진모리는 12/8 셔플 느낌으로 정리되어 있습니다.  자진모리에는 “덩-덕-쿵-덕…” 형태의 삼채형 데이터도 있으므로 훈련 모드 확장에 바로 활용할 수 있습니다. 

```markdown
현재 게임의 장단/채보 시스템을 더 전문적이고 재미있게 개선해줘.

목표:
- 장단이 단순 노트 배열이 아니라 “조선 전장 군령 패턴”처럼 느껴지게 한다.
- 별달거리, 휘모리, 자진모리를 훈련 모드와 캠페인에 모두 연결한다.
- 각 장단의 박자감이 플레이어에게 시각적으로도 구분되어야 한다.

구현 요구사항:

1. Chart DSL 개선
   - beat 기반 ChartNote를 유지하되, measure, subdivision, accent 정보를 추가해라.
   - 강세 노트는 더 크게 표시한다.
   - ghost note인 Da/Deo는 작고 빠른 노트로 표시한다.

2. 장단별 시각 차별화
   - 별달거리: 경쾌한 4박, 피버/보너스 구간에 적합. 배경에 사설 자막 리듬 표시.
   - 휘모리: 빠른 4박, 전투 절정. 노트 속도와 전장 흔들림을 높인다.
   - 자진모리: 12/8 셔플. 노트 간격이 3분박 느낌으로 보이게 한다.

3. 훈련 모드
   - 장단 선택 화면 추가:
     - 기본 타법
     - 별달거리
     - 휘모리
     - 자진모리
   - 각 장단은 “듣기”, “따라치기”, “실전 적용” 3단계로 연습하게 한다.
   - 듣기 모드에서는 자동 재생과 구음 자막만 보여준다.
   - 따라치기 모드에서는 판정이 들어간다.
   - 실전 적용 모드에서는 작은 전투 시뮬레이션과 연결된다.

4. 캠페인 연결
   - Level 3 후반에 별달거리 필살 콤보를 넣어라.
   - 한산도 레벨 중반에 자진모리 기반 포격/선회 구간을 넣어라.
   - 행주 대첩 피날레에 휘모리 기반 총력전 구간을 넣어라.

5. 도감
   - 각 장단 항목에 다음을 표시해라.
     - 이름
     - 박자
     - BPM
     - 대표 구음
     - 게임 내 전술 용도
     - 연습 버튼

6. 판정
   - 휘모리의 빠른 Da, Da ghost note는 판정창을 약간 넓혀라.
   - 자진모리는 12/8 subdivision을 정확히 반영해라.
   - 시각 노트 위치와 오디오 메트로놈이 어긋나지 않게 해라.

구현 후 실제로 각 장단을 선택해서 플레이할 수 있어야 한다.
`npm run build`를 통과시켜라.
```

---

## 4. “진법/전술성 강화” 전용 프롬프트

첨부 기획에서는 학익진과 일자진 같은 진법이 특정 리듬 패턴으로 발동되고, 정확도가 높을수록 사기와 공격/방어력이 상승하는 구조가 제시되어 있습니다. 

```markdown
현재 게임의 진법 시스템을 단순 스킬이 아니라 “리듬 패턴을 통한 전술 지휘”로 강화해줘.

구현 목표:
- 플레이어가 정해진 장단을 성공시키면 진법이 발동한다.
- 진법은 단순 데미지가 아니라 전황, 병력 배치, 사기, 방어/공격 방식에 영향을 준다.
- 진법 발동은 시각적으로 매우 만족스러워야 하지만, 마법처럼 보이면 안 된다.

구현할 진법:

1. 일자진
   - sequence: Tta, Gung, Gung, Tta, Gu, Gung
   - 역할: 방어 극대화
   - 효과:
     - 8초 동안 enemy charge 피해 60% 감소
     - allyMorale +8
     - battleBalance +5
   - 연출:
     - 아군 방패가 일렬로 정렬
     - 깃발 “一” 표시
     - 적 돌격이 방패벽 앞에서 느려짐

2. 학익진
   - sequence: Da, Tta, Da, Tta, Gung, Dung
   - 역할: 포위 섬멸
   - 효과:
     - enemyHP -12
     - enemyMorale -15
     - battleBalance +10
   - 연출:
     - 아군이 반원으로 벌어짐
     - 적선/적군을 감싸는 궤적
     - 포격/화살이 중앙으로 집중

3. 장사진
   - sequence: Dung, Gung, Tta, Gung, Tta
   - 역할: 기동/돌파
   - 효과:
     - 10초 동안 noteSpeed 약간 상승
     - 성공 판정 시 추가 battleBalance +0.5
     - enemy ambush 효과 감소
   - 연출:
     - S자 행군 경로
     - 전열이 빠르게 이동

4. 원진
   - sequence: Gung, Tta, Gung, Tta
   - 역할: 포위 상황 생존
   - 효과:
     - allyHP +5
     - 6초 동안 광역 피해 감소
     - combo break 1회 방지
   - 연출:
     - 병사들이 둥근 방어 대열 형성

추가 요구사항:

- PatternDetector를 robust하게 만들어라.
- miss가 발생하면 현재 패턴 버퍼가 끊긴다.
- 패턴 후보 UI를 만들어서, 플레이어가 “지금 진법이 만들어지고 있다”는 느낌을 받게 하라.
- 진법 쿨다운을 화면에 표시하라.
- 진법 발동 시 1.2초짜리 시네마틱 배너를 보여주되, 플레이를 과도하게 방해하지 마라.
- TrainingScreen에 “진법 연습” 탭을 추가하라.
- 각 진법은 처음에는 잠겨 있고, 캠페인 클리어에 따라 해금되게 하라.

구현 후 Level 3에서 최소 하나의 진법이 실제 전투 중 발동되어야 한다.
`npm run build`를 통과시켜라.
```

---

## 5. “역사 전장 캠페인 강화” 전용 프롬프트

첨부 기획에는 부산진 전투, 한산도 대첩, 행주 대첩, 무관 수련, 역사 도감, 전장 사운드/시각 연출까지 들어 있습니다.  전투 연출은 실제 국악기 소리와 전장 소리를 리듬에 맞춰 믹싱하고, 마법 대신 깃발 신호와 병사 움직임을 쓰는 방향으로 제시되어 있습니다. 

```markdown
현재 게임을 “레벨 3개짜리 리듬 데모”에서 “역사 전장 캠페인 데모”로 업그레이드해줘.

목표:
- 캠페인 화면에서 조선 시대 전장 흐름이 느껴져야 한다.
- 각 전장은 서로 다른 규칙을 가져야 한다.
- 플레이어가 장단을 익히는 과정이 역사적 전장 상황과 연결되어야 한다.

구현할 캠페인:

1. 부산진 전투
   - 성벽 방어전
   - 기본 궁/따/덩 학습
   - 적 보병이 천천히 밀려온다
   - Gung으로 방패벽, Tta로 사격, Dung으로 총공격
   - 튜토리얼 말풍선:
     - “궁편을 울려 전열을 세워라”
     - “채편으로 궁수에게 사격을 명하라”
     - “양편을 함께 울리면 전군이 움직인다”

2. 첫 번째 보초 근무
   - 야간 잠입 방어
   - Gu/Da/Deo 약타 학습
   - alertGauge 구현
   - 강타 오입력 시 경보 상승
   - 약타 성공 시 조용한 제압/대기

3. 왜구의 기습
   - 마을 방어전
   - 패턴 콤보 학습
   - 돌격, 포위, 화차 지원 구현
   - 전투 중 이벤트:
     - 좌측 민가 위협
     - 우측 적 궁수 등장
     - 중앙 돌격대 등장

4. 한산도 대첩
   - 해전
   - 판옥선/적선 아이콘 활용
   - 파도 배경
   - Gung/Gu: 노 젓기와 선회
   - Tta/Da: 포격 준비와 발사
   - Dung: 일제 포격
   - 학익진 발동이 주요 목표
   - 적선이 접근하면 위험, 선회와 포격으로 거리 유지

5. 행주 대첩
   - 총력 방어전
   - BPM이 단계적으로 상승
   - 자진모리에서 시작해 휘모리 피날레로 전환
   - 콤보가 높을수록 민병 지원 연출 증가
   - 마지막 20초는 fever 구간

각 캠페인 카드에 다음 정보를 표시해라.

- 전장명
- 학습 장단
- 주요 군령
- 난이도
- 해금 보상
- 최고 등급
- 시작 버튼

도감에는 각 전장의 짧은 설명을 넣어라. 역사 설명은 과장하지 말고, 게임적 맥락 중심으로 간결하게 작성한다.

구현 후 캠페인 1~5가 메뉴에 표시되고, 적어도 1~3은 완전 플레이 가능, 4~5는 플레이 가능한 베타 레벨이어야 한다.
`npm run build`를 통과시켜라.
```

---

## 6. “UI/비주얼 완성도 강화” 전용 프롬프트

```markdown
현재 게임의 UI와 비주얼을 첨부 이미지의 방향성에 맞춰 대폭 개선해줘.

목표:
- 모바일에서 한눈에 이해되는 리듬 전투 UI.
- 한지/두루마리/목재/남색 전장/푸른 아군/붉은 적군의 일관된 스타일.
- 교육 자료가 아니라 실제 게임처럼 보이게 만들기.

개선 요구사항:

1. 전체 테마
   - 배경: 깊은 남색 또는 한지 질감
   - 패널: 두루마리/목재 느낌
   - 버튼: 조선 문양 테두리
   - 아군: 청색/청록
   - 적군: 적색/주홍
   - 강조: 금색

2. BattleScreen
   - 상단 Battle Status bar를 첨부 이미지처럼 Ally/Enemy 대치 게이지로 만든다.
   - 게이지는 전황 변화에 따라 부드럽게 움직인다.
   - 중앙 전장에는 부대/배/파도/성벽이 보인다.
   - 하단 입력부는 장구의 좌우 구조가 즉시 이해되게 만든다.
   - 왼쪽은 “궁편: 방어/이동”
   - 오른쪽은 “채편: 공격/사격”
   - 중앙 강타 존과 가장자리 약타 존을 명확히 구분한다.

3. 노트 디자인
   - Gung: 푸른 큰 원형 노트
   - Gu: 푸른 작은 물결 노트
   - Tta: 붉은 큰 원형 노트
   - Da: 붉은 작은 점/ghost 노트
   - Dung: 좌우 연결 금색 노트
   - Deo: 좌우 연결 은은한 반투명 노트
   - Rest는 표시하지 않지만 박자 눈금은 보여준다.

4. 피드백
   - PERFECT는 금색 붓글씨 느낌
   - GREAT는 흰색/청색
   - GOOD은 일반
   - MISS는 먹물 번짐 느낌
   - Combo는 북채가 튀는 듯한 작은 애니메이션

5. 메뉴
   - 메인 메뉴에 큰 타이틀과 장구/깃발 아이콘
   - 캠페인 카드는 두루마리 카드
   - 장비 화면은 첨부 RPG 성장 이미지처럼 좌측 승진, 우측 장비 구성
   - 도감 화면은 책/두루마리 느낌

6. 반응형
   - 세로 모바일 화면 최적화
   - 데스크톱에서는 중앙 최대 너비 1000px
   - 터치 영역은 최소 64px 이상
   - 폰트 크기는 모바일에서 읽기 쉽게

7. 이미지 활용
   - 첨부 이미지는 메뉴 카드, 도감 카드, 배경, 레벨 선택 썸네일로 사용한다.
   - 이미지가 로드되지 않으면 fallback gradient와 Canvas 일러스트 사용.

8. 모션
   - 노트 하강은 부드럽게
   - 전투 이펙트는 짧고 명확하게
   - reduced motion 설정 시 흔들림/큰 애니메이션 감소

완성 후 게임 첫 화면을 봤을 때 “조선 장구 리듬 전략 게임”이라는 정체성이 즉시 느껴져야 한다.
`npm run build`를 통과시켜라.
```

---

## 7. “최종 품질 QA” 프롬프트

```markdown
이제 장구 리듬 게임 프로토타입을 출시 가능한 데모 수준으로 QA하고 수정해줘.

반드시 다음 체크리스트를 순서대로 점검하고, 발견한 문제를 직접 수정해라.

## 빌드/타입

- npm run build 통과
- TypeScript any 남용 최소화
- console error 제거
- React key warning 제거
- 이미지 import/path 오류 제거

## 게임 플레이

- 메인 메뉴에서 모든 화면으로 이동 가능
- 캠페인 레벨 시작 가능
- Level 1 클리어 가능
- Level 2 강약 입력 가능
- Level 3 콤보/진법 발동 가능
- miss 시 패배 가능
- 잘 플레이하면 승리 가능
- 결과 화면 표시
- XP/해금/저장 정상

## 입력

- 키보드 F/D/J/K 조작 가능
- 동시 입력 Dung/Deo 가능
- 모바일 터치 가능
- 터치 영역 충분히 큼
- 오프셋 설정 반영
- 빠른 휘모리에서도 입력 씹힘 최소화

## 사운드

- 첫 클릭 후 AudioContext resume
- 구음별 소리 구분
- 볼륨 설정 반영
- 음소거 가능
- 사운드 실패 시 게임 중단 없음

## UI

- 한글 깨짐 없음
- 모바일에서 텍스트 잘림 없음
- Battle Status bar 정상
- 판정 텍스트가 노트를 가리지 않음
- 버튼 hover/focus/active 상태 있음
- reduced motion 반영

## 데이터

- strokes/charts/levels/formations/equipment가 분리되어 있음
- 새 장단을 추가하기 쉬운 구조
- 새 레벨을 추가하기 쉬운 구조
- localStorage version 처리

## 밸런스

- perfect/great/good 차이가 있음
- Dung이 강하지만 남발 불가
- Da 후 Tta 보상이 체감됨
- Gu/Deo도 쓸모 있음
- Level 1은 쉽고 Level 3은 도전적임

마지막으로 README 또는 화면 내 “플레이 방법”을 작성해라.

플레이 방법에는 다음을 포함한다.

- 왼쪽 강타: 궁
- 왼쪽 약타: 구
- 오른쪽 강타: 따
- 오른쪽 약타: 다
- 양쪽 강타: 덩
- 양쪽 약타: 더
- 정확한 장단은 사기를 올리고 진법을 발동한다
- 오디오가 밀리면 설정에서 보정한다

수정 후 다시 `npm run build`를 실행하고, 통과 상태로 마무리해라.
```

---

## 8. 핵심 설계 의도 요약

이 프롬프트의 방향은 “리듬게임 스킨을 씌운 전투 게임”이 아니라, **리듬 그 자체가 전술 언어가 되는 게임**입니다. 첨부 설계의 Level 1~3도 기본 타법, 강약 조절, 패턴 콤보 순서로 난이도를 올리는 구조이므로, 프로토타입도 그 흐름을 그대로 따라가야 합니다.  Level 3의 왜구 기습은 돌격, 포위, 화차 지원 같은 전술 콤보를 학습하는 구간으로 설계되어 있으니, 이 부분을 “진법 패턴 감지 시스템”의 첫 실전 무대로 쓰는 것이 가장 좋습니다. 

위 프롬프트를 한 번에 넣어도 되고, 먼저 **메인 프롬프트**로 1차 구현을 만든 뒤, 결과물을 보면서 **장단 강화 → 진법 강화 → 캠페인 강화 → UI 강화 → QA** 순서로 추가 프롬프트를 넣으면 가장 안정적으로 고품질 프로토타입까지 끌어올릴 수 있습니다.
