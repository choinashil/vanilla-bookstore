import 'styles/index.scss';

import appTemplate from 'app.ejs';
import searchboxTemplate from 'searchbox.ejs';
import settingTemplate from 'setting.ejs';
import resultsTemplate from 'results.ejs';
import loadMoreTemplate from 'loadMore.ejs';

import Gorilla from '../Gorilla';

let keyword;
let count;
let requestCount;
let bookInfo;
let bookdata;

let header;
let content;
let sortby;
let resultsWrapper;
let result;
let naverLink;
let loadmore;

let type = 'list';
let sortbySim = true;
let isRequesting = false;

const searchbox = new Gorilla.Component(searchboxTemplate);

searchbox.search = function(e) {
	if (e.keyCode === 13) {
		console.log(e.target.value);
		keyword = e.target.value;
		e.target.value = '';
		requestCount = 0;
		bookInfo = [];
		bookdata = {};
		keyword ? requestInfo(keyword) : console.error('1글자 이상 입력하세요');
	}
}


function requestInfo(keyword, start = 1, sort = 'sim', display = 20) {
	if (!isRequesting) {
		isRequesting = true;
		$.ajax({
			url: `http://localhost:3000/v1/search/book/?query=${keyword}&display=${display}&start=${start}&sort=${sort}`,
	
			success: function(data) {
				count = 0;
				
				bookdata = data;
				// debugger
				// bookInfo.push(data.items);
				// bookInfo = Object.assign(data.items);
				bookInfo = bookInfo.concat(data.items);
				console.log(bookdata);
				console.log(bookInfo.length);
	
				if (sortbySim) {
					if (bookInfo.length) {
						for (let i = 0; i < bookInfo.length; i++) {
							if (!bookInfo[i].image) {
								bookInfo[i].image = 'https://bookthumb-phinf.pstatic.net/cover/106/518/10651821.jpg?udate=20160603';
							}
							requestURL(bookInfo, i, bookInfo[i].link);
						}	
					} else {
						showResult(bookInfo);
					}
				} else {
					showResult(bookInfo);
				}
			}
		});	
	}
}

function requestURL(bookInfo, index, link) {

	$.ajax({
		url: `http://localhost:3000/v1/util/shorturl/?url=${link}`,
		success: function(urldata) {
			// if (count > 40) debugger
			count++;
			// console.log('url successed / count: '+ count);
			bookInfo[index].link = urldata.result.url;
			// console.log('bookinfo: '+bookInfo);
			if (count === bookdata.display) {
				showResult(bookInfo);
			}
		}
		
	});
}

function showResult(bookInfo) {
	isRequesting = false;
	results.keyword = keyword;
	results.bookInfo = bookInfo;
	results.bookdata = bookdata;
	loadMore.bookInfo = bookInfo;
	loadMore.bookdata = bookdata;

	requestCount++;
	console.log('requestCount', requestCount);
	
	header = document.querySelector('.header');
	content = document.querySelector('.content');
	sortby = document.querySelector('.setting');
	resultsWrapper = document.querySelector('.resultsWrapper');
	result = document.querySelectorAll('.result');
	naverLink = document.querySelector('.naverLink');
	loadmore = document.querySelector('.loadMore');
	
	content.classList.remove('invisible');
	header.classList.remove('header-big');
	header.classList.add('header-small');
	header.children[0].classList.remove('invisible');
	header.children[1].classList.add('invisible');
	loadmore.classList.remove('invisible');
	sortby.classList.remove('invisible');
	resultsWrapper.children[0].classList.remove('mt');

	if (!bookInfo.length) {
		console.log('검색결과가 없습니다');
		loadmore.classList.add('invisible');
		sortby.classList.add('invisible');
		resultsWrapper.children[0].classList.add('mt');
	} else {
		if (type === 'list') {
			setListType();
		} else {
			setCardType();
		}
	}
	
}

const setting = new Gorilla.Component(settingTemplate);

setting.showListType = (e) => {
	type = 'list';
	e.target.classList.add('selected');
	e.target.parentElement.children[6].classList.remove('selected');
	setListType();
}

setting.showCardType = (e) => {
	type = 'card';
	e.target.classList.add('selected');
	e.target.parentElement.children[5].classList.remove('selected');
	setCardType();
}

setting.sortBySim = (e) => {
	sortbySim = true;
	requestCount = 0;
	bookInfo = [];
	bookdata = {};
	e.target.classList.add('selected');
	e.target.parentElement.children[2].classList.remove('selected');
	e.target.parentElement.children[4].classList.remove('selected');
	requestInfo(keyword, 1, 'sim');
}

setting.sortByPubDate = (e) => {
	sortbySim = false;
	requestCount = 0;
	bookInfo = [];
	bookdata = {};
	e.target.classList.add('selected');
	e.target.parentElement.children[0].classList.remove('selected');
	e.target.parentElement.children[4].classList.remove('selected');
	requestInfo(keyword, 1, 'date');
}

setting.sortBySales = (e) => {
	sortbySim = false;
	requestCount = 0;
	bookInfo = [];
	bookdata = {};

	e.target.classList.add('selected');
	e.target.parentElement.children[0].classList.remove('selected');
	e.target.parentElement.children[2].classList.remove('selected');
	requestInfo(keyword, 1, 'count');
}

function setListType() {
	resultsWrapper.classList.remove('resultsWrapper-card');
	resultsWrapper.classList.add('resultsWrapper-list');
	for (let i = 0; i < resultsWrapper.children.length; i++) {
		result[i].classList.remove('result-card');
		result[i].classList.add('result-list');
		result[i].children[0].classList.remove('result-innerWrapper-card');
		result[i].children[0].classList.add('result-innerWrapper-list');
		result[i].children[0].children[1].classList.remove('info-card');
		result[i].children[0].children[1].children[0].children[3].classList.remove('invisible');
		result[i].children[0].children[1].children[0].children[4].classList.remove('invisible');
		result[i].children[0].children[1].children[0].children[5].classList.remove('invisible');
	}
}

function setCardType() {
	resultsWrapper.classList.remove('resultsWrapper-list');
	resultsWrapper.classList.add('resultsWrapper-card');
	for (let i = 0; i < resultsWrapper.children.length; i++) {
		debugger
		result[i].classList.remove('result-list');
		result[i].classList.add('result-card');
		result[i].children[0].classList.remove('result-innerWrapper-list');
		result[i].children[0].classList.add('result-innerWrapper-card');
		result[i].children[0].children[1].classList.add('info-card');
		result[i].children[0].children[1].children[0].children[3].classList.add('invisible');
		result[i].children[0].children[1].children[0].children[4].classList.add('invisible');
		result[i].children[0].children[1].children[0].children[5].classList.add('invisible');
	}
}

const results = new Gorilla.Component(resultsTemplate, {
	keyword: '',
	bookInfo: [],
	bookdata: []
});

results.MoveToNaverBook = function(e) {
	if (type !== 'list') {
		window.open(naverLink.href, '_blank');
	}
}

const loadMore = new Gorilla.Component(loadMoreTemplate, {
	bookInfo: [],
	bookdata: []
});

loadMore.loadMoreInfo = function() {
	console.log('load more..')
	if (requestCount * 20 - bookdata.total < 20) {
		requestInfo(keyword, (requestCount * 20) + 1);
	} else {

	}
}


const app = new Gorilla.Component(appTemplate, null, {
	searchbox,
	setting,
	results,
	loadMore
});

app.resetAll = function() {
	setTimeout(function() {
		header.classList.remove('header-small');
	header.classList.add('header-big');
	header.children[0].classList.add('invisible');
	header.children[1].classList.remove('invisible');
	content.classList.add('invisible');
	}, 500);
	
}

Gorilla.renderToDOM(
    app,
    document.querySelector('#root')
);


/* DO NOT REMOVE */
// module.hot.accept();
/* DO NOT REMOVE */