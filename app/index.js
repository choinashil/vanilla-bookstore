import 'styles/index.scss';

import appTemplate from 'app.ejs';
import searchboxTemplate from 'searchbox.ejs';
import settingTemplate from 'setting.ejs';
import resultTemplate from 'result.ejs';
import loadMoreTemplate from 'loadMore.ejs';

import Gorilla from '../Gorilla';

let keyword;
let count;
let viewCount;
let bookInfo;
let bookdata;

const searchbox = new Gorilla.Component(searchboxTemplate);

searchbox.search = function(e) {
	if (e.keyCode === 13) {
		console.log(e.target.value);
		keyword = e.target.value;
		e.target.value = '';
		viewCount = 0;
		bookInfo = [];
		bookdata = {};
		keyword ? requestInfo(keyword) : console.error('1글자 이상 입력하세요');

		// const content = document.querySelector('.content');
		// content.style.backgroundColor = 'pink';
		
	}
}


function requestInfo(keyword, start = 1, display = 20, sort = 'sim') {
	$.ajax({
		url: `http://localhost:3000/v1/search/book/?query=${keyword}&display=${display}&start=${start}&sort=${sort}`,

		success: function(data) {
			count = 0;

			bookdata = data;
			// debugger
			// bookInfo.push(data.items);
			// bookInfo = Object.assign(data.items);
			bookInfo = bookInfo.concat(data.items);
			// console.log('bookInfo'+ bookInfo[0]);
			for (let i = 0; i < bookInfo.length; i++) {
				if (!bookInfo[i].image) {
					bookInfo[i].image = 'https://bookthumb-phinf.pstatic.net/cover/106/518/10651821.jpg?udate=20160603';
				}
				// console.log(bookInfo[i].link);
				requestURL(bookInfo, i, bookInfo[i].link);
			}
		}
	});
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
	result.bookInfo = bookInfo;
	loadMore.bookInfo = bookInfo;
	loadMore.bookdata = bookdata;
	viewCount++;
	console.log('viewCount', viewCount);
	// const loadMore = document.querySelector('.loadMore');
	// loadMore.classList.remove('invisible');
}

const setting = new Gorilla.Component(settingTemplate);

setting.showCardType = (e) => {
	console.log(e.target.className);
	e.target.classList.add('selected');
}

const result = new Gorilla.Component(resultTemplate, {
	bookInfo: []
});

const loadMore = new Gorilla.Component(loadMoreTemplate, {
	bookInfo: [],
	bookdata: []
});

loadMore.loadMoreInfo = function() {
	console.log('load more..')
	if (viewCount * 20 - bookdata.total < 20) {
		requestInfo(keyword, (viewCount * 20) + 1);
	}
}


const app = new Gorilla.Component(appTemplate, {
    title: 'Vanilla Bookstore'
}, {
	searchbox,
	setting,
	result,
	loadMore
});

Gorilla.renderToDOM(
    app,
    document.querySelector('#root')
);


/* DO NOT REMOVE */
// module.hot.accept();
/* DO NOT REMOVE */