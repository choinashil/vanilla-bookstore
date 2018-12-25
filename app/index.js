import 'styles/index.scss';

import appTemplate from 'app.ejs';
import searchBoxTemplate from 'searchBox.ejs';
import settingTemplate from 'setting.ejs';
import resultsTemplate from 'results.ejs';
import arrowTemplate from 'arrow.ejs';

import Gorilla from '../Gorilla';

let keyword;
let bookData;
let bookInfo;
let dataRequestCount;
let urlRequestCount;
let type = 'list';
let sortBySim = true;
let isRequesting = false;

let result;
let returnToTopArrow;
let noMoreDataAlert;

const searchBox = new Gorilla.Component(searchBoxTemplate);

searchBox.search = (e) => {
    if (e.keyCode === 13) {
        keyword = e.target.value;
        e.target.value = '';
        resetValues();
        keyword ? requestData(keyword) : searchBox._element.children[1].classList.remove('invisible');
    } else {
        searchBox._element.children[1].classList.add('invisible');
    }
}

function resetValues() {
    bookData = {};
    bookInfo = [];
    dataRequestCount = 0;
}

function requestData(keyword, start = 1, sort = 'sim', display = 20) {
    if (!isRequesting) {
        isRequesting = true;
        $.ajax({
            url: `http://localhost:3000/v1/search/book/?query=${keyword}&display=${display}&start=${start}&sort=${sort}`,
            success: function(data) {
                bookData = data;
                bookInfo = bookInfo.concat(data.items);
                urlRequestCount = 0;

                if (sortBySim) {
                    if (bookInfo.length) {
                        for (let i = dataRequestCount * 20; i < bookInfo.length; i++) {
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
            urlRequestCount++;
            bookInfo[index].link = urldata.result.url;
            if (urlRequestCount === bookData.display) {
                showResult(bookInfo);
            }
        }
    });
}

function showResult(bookInfo) {
    dataRequestCount++;
    isRequesting = false;

    results.keyword = keyword;
    results.bookInfo = bookInfo;
    results.bookData = bookData;

    makeHeaderSmall();
    setting._element.classList.remove('invisible');
    results._element.children[0].classList.remove('mt');
    noMoreDataAlert = results._element.children[results._element.children.length - 2];
    noMoreDataAlert.classList.add('invisible');

    if (!bookInfo.length) {
        setting._element.classList.add('invisible');
        results._element.children[0].classList.add('mt');
    } else {
        if (type === 'list') {
            setListType();
        } else {
            setCardType();
        }
    }
}

function makeHeaderSmall() {
    app._element.children[0].classList.remove('header-big');
    app._element.children[0].classList.add('header-small');
    app._element.children[0].children[0].classList.remove('invisible');
    app._element.children[0].children[1].classList.add('invisible');
    app._element.children[1].classList.remove('invisible');
}

const setting = new Gorilla.Component(settingTemplate);

setting.sortBySim = (e) => {
    resetValues();
    sortBySim = true;
    e.target.classList.add('selected');
    e.target.parentElement.children[2].classList.remove('selected');
    e.target.parentElement.children[4].classList.remove('selected');
    requestData(keyword, 1, 'sim');
}

setting.sortByPubDate = (e) => {
    resetValues();
    sortBySim = false;
    e.target.classList.add('selected');
    e.target.parentElement.children[0].classList.remove('selected');
    e.target.parentElement.children[4].classList.remove('selected');
    requestData(keyword, 1, 'date');
}

setting.sortBySales = (e) => {
    resetValues();
    sortBySim = false;
    e.target.classList.add('selected');
    e.target.parentElement.children[0].classList.remove('selected');
    e.target.parentElement.children[2].classList.remove('selected');
    requestData(keyword, 1, 'count');
}

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

function setListType() {
    results._element.classList.remove('results-wrapper-card');
    results._element.classList.add('results-wrapper-list');
    for (let i = 1; i < results._element.children.length - 2; i++) {
        result = results._element.children[i];
        result.classList.remove('result-card');
        result.classList.add('result-list');
        result.children[0].classList.remove('result-inner-wrapper-card');
        result.children[0].classList.add('result-inner-wrapper-list');
        result.children[0].children[1].classList.remove('info-card');
        result.children[0].children[1].children[0].children[3].classList.remove('invisible');
        result.children[0].children[1].children[0].children[4].classList.remove('invisible');
        result.children[0].children[2].classList.remove('invisible');
    }
    returnToTopArrow = results._element.children[results._element.children.length - 1];
    returnToTopArrow.classList.remove('arrow-card');
    returnToTopArrow.classList.add('arrow-list');
}

function setCardType() {
    results._element.classList.remove('results-wrapper-list');
    results._element.classList.add('results-wrapper-card');
    for (let i = 1; i < results._element.children.length - 2; i++) {
        result = results._element.children[i];
        result.classList.remove('result-list');
        result.classList.add('result-card');
        result.children[0].classList.remove('result-inner-wrapper-list');
        result.children[0].classList.add('result-inner-wrapper-card');
        result.children[0].children[1].classList.add('info-card');
        result.children[0].children[1].children[0].children[3].classList.add('invisible');
        result.children[0].children[1].children[0].children[4].classList.add('invisible');
        result.children[0].children[2].classList.add('invisible');
    }
    returnToTopArrow = results._element.children[results._element.children.length - 1];
    returnToTopArrow.classList.remove('arrow-list');
    returnToTopArrow.classList.add('arrow-card');
}

const arrow = new Gorilla.Component(arrowTemplate);

arrow.returnToTop = () => {
    window.scroll({
        top: 0,
        behavior: 'smooth'
    });
}

window.addEventListener('scroll', function() {
    if (window.scrollY > 700) {
        returnToTopArrow.classList.remove('invisible-effect');
    } else {
        returnToTopArrow.classList.add('invisible-effect');
    }

    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 1500)) {
        if (bookData.total - (dataRequestCount * 20) > 0) {
            requestData(keyword, (dataRequestCount * 20) + 1);
        } else {
            noMoreDataAlert.classList.remove('invisible');
        }
    }
});

const results = new Gorilla.Component(resultsTemplate, {
    keyword: '',
    bookInfo: [],
    bookData: []
}, {
    arrow
});


results.MoveToNaverBook = (e) => {
    if (type === 'card') {
        window.open(e.currentTarget.children[2].children[0].href, '_blank');
    }
}

const app = new Gorilla.Component(appTemplate, null, {
    searchBox,
    setting,
    results
});

app.resetAll = () => setTimeout(makeHeaderBig, 500);

function makeHeaderBig() {
    app._element.children[0].classList.remove('header-small');
    app._element.children[0].classList.add('header-big');
    app._element.children[0].children[0].classList.add('invisible');
    app._element.children[0].children[1].classList.remove('invisible');
    app._element.children[1].classList.add('invisible');
}

Gorilla.renderToDOM(
    app,
    document.querySelector('#root')
);

/* DO NOT REMOVE */
module.hot.accept();
/* DO NOT REMOVE */
