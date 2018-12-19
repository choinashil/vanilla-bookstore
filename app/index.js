import 'styles/index.less';

import headerTemplate from 'header.ejs';
import searchboxTemplate from 'searchbox.ejs';
import contentTemplate from 'content.ejs';

import Gorilla from '../Gorilla';


const searchbox = new Gorilla.Component(searchboxTemplate);

searchbox.search = function(e) {
	if (e.keyCode === 13) {
		console.log(e.target.value);
		const keyword = e.target.value;
		e.target.value = '';
		keyword ? request(keyword) : console.error('1글자 이상 입력하세요');
	}
}


function request(keyword) {
	$.ajax(`http://localhost:3000/v1/search/book/?query=${keyword}&display=20&start=1&sort=sim`, {
		success: function(data) {
			console.log(data);
			showResult(data);
		}
	});
}

function showResult(data) {
	console.log('showResult: '+data);

	for (let i = 0; i < data.display; i++) {
		const content = new Gorilla.Component(contentTemplate, {
			image : data.items[i].image,
			title : data.items[i].title,
			author : data.items[i].author,
			publisher : data.items[i].publisher,
			price : data.items[i].price
		});
	
		Gorilla.renderToDOM(
			content,
			document.querySelector('#root')
		);
	}
}

const header = new Gorilla.Component(headerTemplate, {
	title: 'Vanilla Bookstore'
}, {
	searchbox
});


Gorilla.renderToDOM(
    header,
    document.querySelector('#root')
);

/* DO NOT REMOVE */
// module.hot.accept();
/* DO NOT REMOVE */