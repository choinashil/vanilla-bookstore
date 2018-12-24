import 'styles/index.scss';

import appTemplate from 'app.ejs';
import searchBoxTemplate from 'searchBox.ejs';
import settingTemplate from 'setting.ejs';
import resultsTemplate from 'results.ejs';
import arrowTemplate from 'arrow.ejs';

import Gorilla from '../Gorilla';

let header;
let content;
let sortBy;
let resultsWrapper;
let result;
let returnToTopArrow;
let keywordAlert;
let noMoreDataAlert;

let keyword;
let bookdata;
let bookInfo;
let dataRequestCount;
let urlRequestCount;
let type = 'list';
let sortBySim = true;
let isRequesting = false;

const searchBox = new Gorilla.Component(searchBoxTemplate);

searchBox.search = (e) => {
    keywordAlert = document.querySelector('.keyword-alert');
    if (e.keyCode === 13) {
        keyword = e.target.value;
        e.target.value = '';
        resetValues();
        keyword ? requestData(keyword) : keywordAlert.classList.remove('invisible');
    } else {
        keywordAlert.classList.add('invisible');
    }
}

function resetValues() {
    bookdata = {};
    bookInfo = [];
    dataRequestCount = 0;
}

function requestData(keyword, start = 1, sort = 'sim', display = 20) {
    if (!isRequesting) {
        isRequesting = true;
        $.ajax({
            url: `http://localhost:3000/v1/search/book/?query=${keyword}&display=${display}&start=${start}&sort=${sort}`,
            success: function(data) {
                bookdata = data;
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
            if (urlRequestCount === bookdata.display) {
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
    results.bookdata = bookdata;

    getDOMElements();
    makeHeaderSmall();
    sortBy.classList.remove('invisible');
    resultsWrapper.children[0].classList.remove('mt');
    noMoreDataAlert.classList.add('invisible');

    if (!bookInfo.length) {
        sortBy.classList.add('invisible');
        resultsWrapper.children[0].classList.add('mt');
    } else {
        if (type === 'list') {
            setListType();
        } else {
            setCardType();
        }
    }
}

function getDOMElements() {
    header = document.querySelector('.header');
    content = document.querySelector('.content');
    sortBy = document.querySelector('.setting');
    resultsWrapper = document.querySelector('.results-wrapper');
    result = document.querySelectorAll('.result');
    returnToTopArrow = document.querySelector('.arrow');
    noMoreDataAlert = document.querySelector('.no-more-data-alert');
}

function makeHeaderSmall() {
    header.classList.remove('header-big');
    header.classList.add('header-small');
    header.children[0].classList.remove('invisible');
    header.children[1].classList.add('invisible');
    content.classList.remove('invisible');
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
    resultsWrapper.classList.remove('results-wrapper-card');
    resultsWrapper.classList.add('results-wrapper-list');
    for (let i = 0; i < resultsWrapper.children.length - 3; i++) {
        result[i].classList.remove('result-card');
        result[i].classList.add('result-list');
        result[i].children[0].classList.remove('result-inner-wrapper-card');
        result[i].children[0].classList.add('result-inner-wrapper-list');
        result[i].children[0].children[1].classList.remove('info-card');
        result[i].children[0].children[1].children[0].children[3].classList.remove('invisible');
        result[i].children[0].children[1].children[0].children[4].classList.remove('invisible');
        result[i].children[0].children[2].classList.remove('invisible');
    }
    returnToTopArrow.classList.remove('arrow-card');
    returnToTopArrow.classList.add('arrow-list');
}

function setCardType() {
    resultsWrapper.classList.remove('results-wrapper-list');
    resultsWrapper.classList.add('results-wrapper-card');
    for (let i = 0; i < resultsWrapper.children.length - 3; i++) {
        result[i].classList.remove('result-list');
        result[i].classList.add('result-card');
        result[i].children[0].classList.remove('result-inner-wrapper-list');
        result[i].children[0].classList.add('result-inner-wrapper-card');
        result[i].children[0].children[1].classList.add('info-card');
        result[i].children[0].children[1].children[0].children[3].classList.add('invisible');
        result[i].children[0].children[1].children[0].children[4].classList.add('invisible');
        result[i].children[0].children[2].classList.add('invisible');
    }
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
        if (bookdata.total - (dataRequestCount * 20) > 0) {
            requestData(keyword, (dataRequestCount * 20) + 1);
        } else {
            noMoreDataAlert.classList.remove('invisible');
        }
    }
});

const results = new Gorilla.Component(resultsTemplate, {
    keyword: '',
    bookInfo: [],
    bookdata: []
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
    header.classList.remove('header-small');
    header.classList.add('header-big');
    header.children[0].classList.add('invisible');
    header.children[1].classList.remove('invisible');
    content.classList.add('invisible');
}

Gorilla.renderToDOM(
    app,
    document.querySelector('#root')
);

/* DO NOT REMOVE */
module.hot.accept();
/* DO NOT REMOVE */
