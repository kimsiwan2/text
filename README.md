# 🏫 영진전문대학교 - 통합 회원가입 및 계정 관리 시스템

> **Supabase(PostgreSQL) 기반의 실시간 데이터 연동 및 프리미엄 UI가 적용된 통합 회원 관리 시스템입니다.**  
> 본 프로젝트는 현대적인 웹 디자인 트렌드(Glassmorphism, Neon Glow Effect, Smooth Transitions)를 반영하여 직관적이고 미려한 UI/UX를 제공하며, Supabase 실시간 데이터베이스를 연동하여 안전하고 빠른 회원가입, 로그인 및 정보 관리를 지원합니다.

---

## ✨ 주요 기능 (Key Features)

### 1. 📝 유효성 검사 기반 회원가입 (Sign Up)
* **실시간 입력값 검증**: 아이디 중복 체크, 이메일 형식 체크, 패스워드 조합 규칙 검사를 실시간 피드백으로 제공합니다.
* **비밀번호 강도 측정기**: 사용자가 비밀번호를 입력함에 따라 보안 강도를 실시간(Weak / Medium / Strong)으로 시각화합니다.
* **자동 전화번호 포맷터**: 전화번호 입력 시 하이픈(`-`)이 자동으로 생성(`010-XXXX-XXXX`)되도록 지원합니다.
* **DB INSERT Mock Visualizer**: 가입 성공 시, DB 설계서 규칙에 따라 데이터베이스에 실제 생성 및 삽입된 레코드 결과를 카드 UI 형태로 가시화하여 제공합니다.

### 2. 🔐 스마트 로그인 (Login)
* **아이디 기억하기**: LocalStorage를 활용하여 마지막으로 로그인에 성공했던 아이디를 안전하게 불러옵니다.
* **보안 암호화 해시 연동**: 클라이언트 브라우저 단에서 비밀번호 유출을 막기 위해 단방향 bcrypt 모의 해시(`generateMockHash`) 과정을 거쳐 DB에 적재된 해시 코드와 비교 검증을 수행합니다.

### 3. 🔍 아이디 찾기 및 비밀번호 재설정 (Account Recovery)
* **아이디 찾기**: 가입 당시 입력했던 실명(이름)과 이메일 주소를 입력하여 분실한 아이디를 간편하게 조회합니다.
* **비밀번호 찾기(재설정)**:
  * **1단계 (본인인증)**: 아이디, 이름, 이메일을 입력하여 DB 회원 정보와 대조합니다.
  * **2단계 (비밀번호 재설정)**: 정보가 완벽히 일치할 경우에만 새 비밀번호를 입력할 수 있는 폼으로 전환되며, 유효성 검사 통과 시 새로운 해시로 DB에 즉시 업데이트합니다.

### 4. 👤 내 정보 관리 및 회원 탈퇴 (My Page & Withdrawal)
* **프로필 대시보드**: 로그인 후 내 프로필 화면(`welcome.html`)에서 회원 고유번호(PK), 아이디, 이름, 닉네임, 이메일, 전화번호 등 저장된 정보를 한눈에 볼 수 있습니다.
* **비밀번호 변경**: 로그인된 세션 상태에서 기존 비밀번호 검증 단계를 거쳐 새 비밀번호로 신속하게 변경할 수 있습니다.
* **안전한 회원탈퇴 (Withdrawal)**: 
  - 탈퇴 확인 팝업 모달을 통해 2차 확인 후, Supabase DB에서 해당 회원 레코드를 물리적으로 영구 삭제(`DELETE`) 처리합니다.
  - 탈퇴가 완료되면 브라우저 세션을 소멸시키고 로그인 화면으로 즉시 전환합니다.

---

## 🛠 기술 스택 (Tech Stack)

* **Frontend**: HTML5, Vanilla CSS3 (Custom Variables, Keyframe Animations), Vanilla JavaScript (ES6+)
* **Database & Auth**: Supabase (PostgreSQL) Database, Row Level Security (RLS)
* **Icons & Fonts**: FontAwesome v6 (Icons), Google Fonts (Outfit, Noto Sans KR)

---

## 🗄 데이터베이스 설계 (Database Schema)

본 프로젝트는 통합 회원 정보를 저장하기 위해 Supabase에 아래와 같은 `members` 테이블 구조를 사용합니다.

### 테이블명: `members`
| 순서 | 컬럼명 | 데이터 타입 | PK/FK | Null 허용 | 제약조건 | 설명 |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| 1 | `number` | `BIGINT` | PK | NO | AUTO IDENTITY | 회원 고유 번호 (PK) |
| 2 | `user_id` | `VARCHAR(50)` | - | NO | UNIQUE | 로그인 아이디 (중복 불가) |
| 3 | `password` | `VARCHAR(255)` | - | NO | - | 암호화된 비밀번호 (단방향 해시) |
| 4 | `name` | `VARCHAR(50)` | - | NO | - | 사용자 실명 (이름) |
| 5 | `nickname` | `VARCHAR(50)` | - | NO | - | 화면 표시용 닉네임 |
| 6 | `email` | `VARCHAR(100)` | - | NO | UNIQUE | 이메일 주소 |
| 7 | `phone` | `VARCHAR(20)` | - | YES | - | 연락처 번호 (010-XXXX-XXXX) |
| 8 | `is_admin` | `BOOLEAN` | - | NO | DEFAULT false | 관리자 권한 여부 |
| 9 | `created_at` | `TIMESTAMPTZ` | - | NO | DEFAULT now() | 최초 회원가입 일시 |
| 10 | `updated_at` | `TIMESTAMPTZ` | - | NO | DEFAULT now() | 회원정보 마지막 수정 일시 |

---

## 🚀 시작하기 (How to Run)

1. 리포지토리를 클론합니다.
   ```bash
   git clone https://github.com/kimsiwan2/text.git
   ```
2. 프로젝트 루트 폴더에서 `login.html` 또는 `index.html` 파일을 브라우저로 직접 실행하거나, VS Code의 **Live Server** 확장을 활용하여 실행합니다.