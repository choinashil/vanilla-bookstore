# Vanilla Bookstore Web with Gorilla.js

Gorilla를 사용하여 컴포넌트 기반으로 구현한 도서 정보 검색 어플리케이션입니다.

<img src="./Vanilla Bookstore.gif" alt="example">

## Setup

Install dependencies

```sh
$ yarn install (or npm install)
```

## Development

```sh
$ yarn dev (or npm run dev)
# visit http://localhost:8080
```

## Features

1. 검색어를 입력하면 [Naver Book Search API](https://developers.naver.com/docs/search/book/)로부터 도서 검색결과를 가져옵니다.
2. 검색 데이터를 가져오는 동안에는 새로운 검색이 불가능합니다.
3. 검색 결과는 리스트 형식과 카드 형식 중에 선택 가능합니다.
4. '구매하기' 버튼을 클릭하면 Naver 도서 상세 페이지로 이동합니다.
4. 검색 결과는 한번에 최대 20개까지 보여지며, 무한 스크롤 형식으로 내용이 추가됩니다.
5. 오른쪽 하단의 화살표를 클릭하면 화면 제일 상단으로 이동합니다.
