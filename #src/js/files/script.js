const input = document.querySelector('.header__input');
const autoComplete = document.querySelector('.header__autocomplete');

const blockContent = document.querySelector('.body-movies');
const crossWindowMovie = document.querySelector('.body-movies__cross');

const moviesWatched = document.querySelector('.movies__watched');
const watchedMoviesList = document.querySelector('.watched-movies__list');
const watchedMoviesTitle = document.querySelector('.watched-movies__title');

const nameMovie = document.querySelector('.right-body__title');
const describeMovie = document.querySelector('.right-body__sub');
const rateMovie = document.querySelector('.right-body__rate');
const imgMovie = document.querySelector('.left-movies__ava');
const yearsMovie = document.querySelector('.right-body__years');
const genresMovie = document.querySelector('.right-body__genres');

const divRecMovies = document.querySelector('.right-body__recommendations');

let createObjMovie;
let listOfMovies;
let selectedMovie;
let seriesMovie;


async function getDataAboutAllMovies(name){
    try{
        let data = await fetch(`https://imdb8.p.rapidapi.com/auto-complete?q=${name}`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "imdb8.p.rapidapi.com",
                "x-rapidapi-key": "bd53622be4mshd5647b3e441286bp1f8273jsn5906123430a0"
            }
        })
        listOfMovies = await data.json();
        autoComplete.classList.add('active');     
        input.classList.add('active');
        outputNameMovies(listOfMovies.d);
    }catch(err){
        showErrorPopUp(err)
    }

}

async function getDataAboutMovie(id, type, rate = 0, adressChild){
    try{
        let data = await fetch(`https://imdb8.p.rapidapi.com/title/get-overview-details?tconst=${id}&currentCountry=US`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "imdb8.p.rapidapi.com",
                "x-rapidapi-key": "bd53622be4mshd5647b3e441286bp1f8273jsn5906123430a0"
            }
        })
        selectedMovie = await data.json();
        if(type == "movie"){
            createObjMovie = new User(selectedMovie, id);
            
            let getObj = JSON.parse(localStorage.getItem("watchedMovies"));
            getObj[createObjMovie.title] = createObjMovie;
            localStorage.setItem("watchedMovies", JSON.stringify(getObj));
            watchedMoviesTitle.textContent = "List of watched movies:";

            fillPage(createObjMovie);
            showHide(blockContent, moviesWatched);
        }
        if(type == "recommendedMovie"){
            bbb(selectedMovie, rate, id, adressChild);
        }
    }
    catch(err){
        showErrorPopUp(err)
    }
}

async function recommendedMovie(){
    try{
        let data = await fetch("https://imdb8.p.rapidapi.com/title/get-top-rated-movies", {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "imdb8.p.rapidapi.com",
                "x-rapidapi-key": "bd53622be4mshd5647b3e441286bp1f8273jsn5906123430a0"
            }
        })
        seriesMovie = await data.json();
        fillRecommendedMovie(seriesMovie)
    }
    catch(err){
        showErrorPopUp(err)
    }
}

document.addEventListener("click", function(e) {
    if(e.target.className != "header__autocomplete"){
        autoComplete.classList.remove("active");
        input.classList.remove("active");
    }
});
function showErrorPopUp(err){
    console.log("Erorr", err);
}

document.addEventListener("keydown", listenerEnter);
function listenerEnter(event) {
    if(event.code == "Enter"){
        getDataAboutAllMovies(input.value);
        let lengthWord = input.value.length;
        input.addEventListener("input", function (e) {
            if(input.value.length < lengthWord){
                autoComplete.classList.remove('active');
                input.classList.remove('active');
            } 
        });
    }
}

function outputNameMovies(arr){
    autoComplete.textContent = "";
    arr.forEach(element => {
        let div = document.createElement('div');
        div.textContent = element.l;
        autoComplete.append(div);
    });
}

autoComplete.addEventListener("click", function(e) {
    if(e.target.tagName == "DIV" && e.target.className == ""){
        input.value = e.target.textContent;
        autoComplete.classList.remove('active');
        input.classList.remove('active');
        listOfMovies.d.forEach(element => {
            if(element.l == e.target.textContent){
                getDataAboutMovie(element.id, "movie");
                callRecc();
            }
        });
    } 
});

divRecMovies.addEventListener("click", function(e) {
    if(e.target.tagName == "IMG" && e.target.className == ""){
        const idMovie = e.target.getAttribute("numOfChild");
        getDataAboutMovie(idMovie , "movie");
        callRecc();
        input.value = "";
    } 
});

watchedMoviesList.addEventListener("click", function(e) {
    if(e.target.className != "watched-movies__list"){
        let nameMovie = e.target.closest(".watched-movies__movie").querySelector('p').textContent;
        let obj = JSON.parse(localStorage.getItem('watchedMovies'));
        showHide(blockContent, moviesWatched);
        fillPage(obj[nameMovie]);
        callRecc();
    }
});

function callRecc(){
    divRecMovies.textContent = "";
    if(document.body.clientWidth <= 991 && document.body.clientWidth >= 768){
        for (let i = 0; i < 2; i++) aaa("img/giphy.gif");
    }else if(document.body.clientWidth >= 991){
        for (let i = 0; i < 3; i++) aaa("img/giphy.gif");
    }
    recommendedMovie();
}

function fillPage(obj){
    nameMovie.textContent = obj.title;
    yearsMovie.textContent = obj.title.year;
    rateMovie.textContent = obj.rate;
    imgMovie.src = obj.url;
    genresMovie.textContent = obj.genres;
    describeMovie.textContent = setLimitDescribe(obj.describe);
    showWatchedMovies();
}

function User(obj, id) {
    this.title = obj?.title?.title, 
    this.year = `${obj?.title?.seriesStartYear || ""}-${obj?.title?.seriesEndYear || ""}`,
    this.rate = obj?.ratings?.rating != undefined ? `Rate: ${obj.ratings.rating} /10`: "",
    this.url = obj?.title?.image?.url,
    this.genres = obj.genres != undefined ? `Genres: ${obj?.genres.join(", ") || ""}` : "",
    this.describe = obj?.plotSummary?.text || "",
    this.id = id
}

function showHide(show, hide){
    show.style.display = "flex";
    hide.style.display = "none";
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function fillRecommendedMovie(arr){
    if(document.body.clientWidth <= 991 && document.body.clientWidth >= 768){
        renderRec(2, arr)
    }else if(document.body.clientWidth >= 991){
        renderRec(3, arr)
    }
}

function renderRec(num, arr){
    for (let i = 0; i < num; i++) {
        let object = arr[getRandomInt(250)];
        let name = object.id;
        let rate = object.chartRating;
        getDataAboutMovie(name.slice(7, name.length - 1), "recommendedMovie" , rate, i);
    }
}

function aaa(imgPath){
    let divBlock = document.createElement('div');
    divBlock.classList.add('recommendations__card');

    let img = document.createElement('img');
    img.src = imgPath;
    
    let divRate = document.createElement('div');
    divRate.classList.add('recommendations__rate');
    divRate.textContent = 10;
    
    divBlock.append(img);
    divBlock.append(divRate);
    divRecMovies.append(divBlock);
}

function bbb(obj, rate, id, adressChild){
    const card = document.querySelectorAll('.recommendations__card');
    card[adressChild].querySelector('img').src =  obj.title.image.url;
    card[adressChild].querySelector('img').setAttribute("numOfChild", id);
    card[adressChild].querySelector('.recommendations__rate').textContent =  rate; 
}
crossWindowMovie.addEventListener("click", function(e) {
    showHide(moviesWatched, blockContent);
    input.value = "";
});

if(localStorage.getItem('watchedMovies') == null){
    localStorage.setItem('watchedMovies', JSON.stringify({}));
}else if(localStorage.getItem('watchedMovies').length != 2){
    watchedMoviesTitle.textContent = "List of watched movies:";
    showWatchedMovies();
}

function showWatchedMovies(){
    watchedMoviesList.textContent = "";
    let obj = JSON.parse(localStorage.getItem('watchedMovies'));
    for(let key in obj){
        let div = document.createElement('div');
        div.classList.add('watched-movies__movie');

        let img = document.createElement('img');
        img.src = obj[key].url;

        let p = document.createElement('p');
        p.textContent = obj[key].title;
        
        div.append(img);
        div.append(p);
        watchedMoviesList.prepend(div)
    }
}

function setLimitDescribe(str){
    if(document.body.clientWidth <= 580){
        return str;
    }else if(document.body.clientWidth <= 768){
        if(str.length > 480){
            return str.slice(0, 480) + "...";
        }else{
            return str;
        }
    }else if(document.body.clientWidth <= 992){
        if(str.length > 402){
            return str.slice(0, 402) + "...";
        }else{
            return str;
        }
    }else if(document.body.clientWidth <= 1170){
        if(str.length > 655){
            return str.slice(0, 655) + "...";
        }else{
            return str;
        }
    }else{
        if(str.length > 790){
            return str.slice(0, 790) + "...";
        }else{
            return str;
        } 
    }
}