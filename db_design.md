# 회원가입 데이터베이스(DB) 설계서

이 문서는 영진전문대학교 회원가입 페이지에서 사용되는 회원 정보를 저장하기 위한 데이터베이스 설계서입니다. 아직 실제 DB가 연동되지 않은 상태이지만, 이후 관계형 데이터베이스(RDBMS, 예: MySQL, MariaDB, PostgreSQL)로 구현할 수 있도록 상세히 설계되었습니다.

---

## 1. 테이블 정의 (Table Definition)

- **테이블명**: `users` (또는 `members`)
- **설명**: 회원 정보를 관리하는 테이블

| 순서 | 컬럼명 (Column Name) | 데이터 타입 (Data Type) | PK/FK | Null 여부 | 제약조건 (Constraints) | 설명 (Description) |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| 1 | `number` | `INT` | PK | NN | AUTO_INCREMENT, UNSIGNED | 회원 고유 번호 (순번) |
| 2 | `user_id` | `VARCHAR(20)` | - | NN | UNIQUE, 영문/숫자 조합 4~20자 | 로그인 아이디 (중복 불가능) |
| 3 | `password` | `VARCHAR(255)` | - | NN | 최소 8자 이상 (영문/숫자/특수문자) | 암호화된 비밀번호 (단방향 해시) |
| 4 | `email` | `VARCHAR(100)` | - | NN | UNIQUE, 이메일 형식 검증 | 이메일 주소 (비밀번호 찾기 등에 활용) |
| 5 | `phone` | `VARCHAR(15)` | - | NN | 형식: `010-XXXX-XXXX` | 전화번호 (휴대폰 번호) |

> **NN**: Not Null (빈 값 허용 안 함)  
> **PK**: Primary Key (기본키)  
> **UNIQUE**: 중복 값 허용 안 함

---

## 2. SQL DDL (Data Definition Language)

테이블을 생성하기 위한 SQL 스크립트 예시입니다. (MySQL / MariaDB 기준)

```sql
CREATE TABLE `users` (
    `number` INT UNSIGNED AUTO_INCREMENT COMMENT '회원 고유 번호',
    `user_id` VARCHAR(20) NOT NULL COMMENT '회원 로그인 아이디',
    `password` VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호 (단방향 해시)',
    `email` VARCHAR(100) NOT NULL COMMENT '이메일 주소',
    `phone` VARCHAR(15) NOT NULL COMMENT '전화번호 (010-XXXX-XXXX)',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '가입일시',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '정보수정일시',
    PRIMARY KEY (`number`),
    UNIQUE KEY `uq_user_id` (`user_id`),
    UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회원 정보 테이블';
```

---

## 3. 컬럼별 세부 고려 사항 및 보안 설계

### ① `number` (회원 번호)
- 회원 관리를 위한 가장 기본이 되는 고유 식별자(Primary Key)입니다.
- `UNSIGNED` 속성을 주어 음수 값을 배제하고 표현 범위를 늘립니다.
- `AUTO_INCREMENT`를 사용하여 회원이 추가될 때마다 자동으로 1씩 증가하도록 설정합니다.

### ② `user_id` (아이디)
- 대소문자 구분 및 중복 배제를 위해 `UNIQUE` 제약조건을 부여합니다.
- 악의적인 입력을 방지하기 위해 가입 시 영문과 숫자만 포함하도록 정규식 검증(Javascript 및 Backend)을 필수로 수행합니다.

### ③ `password` (비밀번호)
- **보안 필수**: 비밀번호는 절대 평문(Plain Text)으로 DB에 저장하면 안 됩니다.
- 반드시 **단방향 해시 알고리즘**(`bcrypt`, `Argon2` 또는 `PBKDF2`)을 적용하여 암호화한 후 저장해야 합니다.
- 암호화된 비밀번호는 길이가 늘어나므로 컬럼 길이를 충분히 여유 있게(`VARCHAR(255)`) 설정합니다.

### ④ `email` (이메일)
- 아이디/비밀번호 분실 시 본인 확인용으로 사용되며, 마케팅/알림 수신 등에 활용됩니다.
- 입력값에 대한 이메일 형식 검증(Regular Expression)을 반드시 거칩니다.

### ⑤ `phone` (전화번호)
- 대시(`-`)를 포함하여 일관된 형식(`010-XXXX-XXXX`)으로 포맷팅하여 저장합니다.
- 프론트엔드단에서 번호 입력 시 자동으로 하이픈(`-`)이 삽입되도록 스크립트를 구현하여 사용자 편의성을 높입니다.
