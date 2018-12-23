import 'styles/index.scss';

import appTemplate from 'app.ejs';
import searchboxTemplate from 'searchbox.ejs';
import settingTemplate from 'setting.ejs';
import resultsTemplate from 'results.ejs';
// import loadMoreTemplate from 'loadMore.ejs';
import arrowTemplate from 'arrow.ejs';

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
let returnToTopArrow;
let keywordAlert;
let exceedAlert;
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
		keyword ? requestInfo(keyword) : keywordAlert.classList.remove('invisible-effect');
	} else {
		keywordAlert.classList.add('invisible-effect');
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
			},
			error: function(error) {
				console.log(error);
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
		},
		error: function(error2) {
			console.log(error2);
		}
		
	});
}


function showResult(bookInfo) {
	isRequesting = false;
	results.keyword = keyword;
	results.bookInfo = bookInfo;
	results.bookdata = bookdata;
	// loadMore.bookInfo = bookInfo;
	// loadMore.bookdata = bookdata;

	requestCount++;
	console.log('requestCount', requestCount);
	
	header = document.querySelector('.header');
	content = document.querySelector('.content');
	sortby = document.querySelector('.setting');
	resultsWrapper = document.querySelector('.resultsWrapper');
	result = document.querySelectorAll('.result');
	naverLink = document.querySelector('.naverLink');
	// loadmore = document.querySelector('.loadMore');
	returnToTopArrow = document.querySelector('.arrow');
	exceedAlert = document.querySelector('.exceedAlert');
	
	content.classList.remove('invisible');
	header.classList.remove('header-big');
	header.classList.add('header-small');
	header.children[0].classList.remove('invisible');
	header.children[1].classList.add('invisible');
	// loadmore.classList.remove('invisible');
	sortby.classList.remove('invisible');
	resultsWrapper.children[0].classList.remove('mt');
	exceedAlert.classList.add('invisible');

	if (!bookInfo.length) {
		console.log('검색결과가 없습니다');
		// loadmore.classList.add('invisible');
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

const arrow = new Gorilla.Component(arrowTemplate);


arrow.returnToTop = () => {
	window.scroll({
		top: 0,
		behavior: 'smooth'
	});
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
	for (let i = 0; i < resultsWrapper.children.length - 3; i++) {
		// if (i > 19) debugger
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
	// debugger
	resultsWrapper.classList.remove('resultsWrapper-list');
	resultsWrapper.classList.add('resultsWrapper-card');
	for (let i = 0; i < resultsWrapper.children.length - 3; i++) {
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
}, {arrow});

results.MoveToNaverBook = function() {
	if (type === 'card') {
		window.open(naverLink.href, '_blank');
	}
}

// const loadMore = new Gorilla.Component(loadMoreTemplate, {
// 	bookInfo: [],
// 	bookdata: []
// });

// loadMore.loadMoreInfo = function() {
// 	console.log('load more..')
// 	if (requestCount * 20 - bookdata.total < 20) {
// 		requestInfo(keyword, (requestCount * 20) + 1);
// 	} else {

// 	}
// }

window.addEventListener('scroll', function() {
	// this.console.log('w.innerHeight: '+window.innerHeight);
	// this.console.log('w.scrollY: '+window.scrollY);
	// this.console.log('1**innerHeight+scrollY: '+ (window.innerHeight + window.scrollY));
	// this.console.log('2**w.b.offsetHeight: '+document.body.offsetHeight);
	if (window.scrollY > 700) {
		returnToTopArrow.classList.remove('invisible-effect');
	} else {
		returnToTopArrow.classList.add('invisible-effect');
	}


	if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 2000)) {
		if (bookdata.total - (requestCount * 20) > 0) {
			requestInfo(keyword, (requestCount * 20) + 1);
		} else {
			exceedAlert.classList.remove('invisible');
		}
	}
});


const app = new Gorilla.Component(appTemplate, null, {
	searchbox,
	setting,
	results
	// ,loadMore
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

// results.on('BEFORE_RENDER', () => console.log('results 렌더전'));
// setting.on('BEFORE_RENDER', () => console.log('setting 렌더전'));

app.on('AFTER_RENDER', () => {
	keywordAlert = document.querySelector('.keyword-alert');
	keywordAlert.classList.remove('invisible');
	console.log('안보이게 처리 완료');
});
app.on('BEFORE_RENDER', () => console.log('app before render'));

Gorilla.renderToDOM(
    app,
    document.querySelector('#root')
);


/* DO NOT REMOVE */
// module.hot.accept();
/* DO NOT REMOVE */