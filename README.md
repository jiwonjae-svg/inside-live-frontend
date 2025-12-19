# React JS CRUD 게시판 (Bulletin Board)

React JS로 만든 CRUD(Create, Read, Update, Delete) 기능을 갖춘 게시판 애플리케이션입니다.

## 주요 기능 (Features)

- ✅ **게시글 목록 보기** - 모든 게시글을 테이블 형식으로 확인
- ✅ **게시글 작성** - 제목, 작성자, 내용을 입력하여 새 게시글 작성
- ✅ **게시글 상세보기** - 게시글의 전체 내용과 메타데이터 확인
- ✅ **게시글 수정** - 기존 게시글의 제목과 내용 수정
- ✅ **게시글 삭제** - 게시글 삭제 (확인 메시지 포함)
- 💾 **로컬 스토리지** - 브라우저의 localStorage를 사용한 데이터 영구 저장

## 기술 스택 (Tech Stack)

- **React** 19.2.3
- **JavaScript** (ES6+)
- **CSS3** (모듈화된 스타일)
- **localStorage API** (데이터 저장)

## 설치 및 실행 (Installation & Running)

### 필수 요구사항
- Node.js (14.0.0 이상)
- npm (6.0.0 이상)

### 설치
```bash
# 의존성 설치
npm install
```

### 개발 서버 실행
```bash
# 개발 모드로 실행
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인할 수 있습니다.

### 프로덕션 빌드
```bash
# 프로덕션용 빌드
npm run build
```

## 프로젝트 구조 (Project Structure)

```
src/
├── components/          # React 컴포넌트
│   ├── PostList.js     # 게시글 목록 컴포넌트
│   ├── PostList.css
│   ├── PostDetail.js   # 게시글 상세 컴포넌트
│   ├── PostDetail.css
│   ├── PostForm.js     # 게시글 작성/수정 폼
│   └── PostForm.css
├── services/           # 비즈니스 로직
│   └── postService.js  # 게시글 CRUD 서비스
├── App.js             # 메인 애플리케이션
├── App.css
├── index.js           # 진입점
└── index.css
```

## 사용 방법 (How to Use)

### 1. 게시글 목록 보기
- 애플리케이션을 실행하면 기본적으로 게시글 목록이 표시됩니다
- 게시글 번호, 제목, 작성자, 작성일을 확인할 수 있습니다

### 2. 새 게시글 작성
- "새 글 쓰기" 버튼을 클릭합니다
- 제목, 작성자, 내용을 입력합니다
- "등록하기" 버튼을 클릭하여 게시글을 저장합니다

### 3. 게시글 상세보기
- 목록에서 게시글 제목을 클릭합니다
- 게시글의 전체 내용과 작성자, 작성일, 수정일 정보를 확인할 수 있습니다

### 4. 게시글 수정
- 상세보기 화면에서 "수정" 버튼을 클릭합니다
- 제목과 내용을 수정합니다 (작성자는 수정 불가)
- "수정하기" 버튼을 클릭하여 변경사항을 저장합니다

### 5. 게시글 삭제
- 상세보기 화면에서 "삭제" 버튼을 클릭합니다
- 확인 메시지에서 "확인"을 클릭하여 삭제를 완료합니다

## 데이터 저장 (Data Storage)

이 애플리케이션은 브라우저의 **localStorage**를 사용하여 데이터를 저장합니다:
- 데이터는 브라우저에 영구적으로 저장됩니다
- 페이지를 새로고침해도 데이터가 유지됩니다
- 브라우저 캐시를 삭제하면 데이터가 삭제됩니다
- 처음 실행 시 샘플 게시글 2개가 자동으로 생성됩니다

## 스크린샷 (Screenshots)

### 게시글 목록
![게시글 목록](https://github.com/user-attachments/assets/b62f48d0-fbe4-4f03-a303-a4a93ffdcb9e)

### 게시글 상세보기
![게시글 상세보기](https://github.com/user-attachments/assets/7d03ab29-6165-4117-bd0e-a93282eb8020)

### 게시글 작성
![게시글 작성](https://github.com/user-attachments/assets/1393b001-ac7d-4deb-b284-92baf761e1ad)

## Available Scripts

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## License

This project is open source and available under the MIT License.

