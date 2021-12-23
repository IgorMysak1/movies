//header`s blocks
const input = document.querySelector('.header__input');
const autoComplete = document.querySelector('.header__autocomplete');

//window with movie / cross
const blockContent = document.querySelector('.body-movies');
const crossWindowMovie = document.querySelector('.body-movies__cross');

//watched movies
const moviesWatched = document.querySelector('.movies__watched');
const watchedMoviesList = document.querySelector('.watched-movies__list');
const watchedMoviesTitle = document.querySelector('.watched-movies__title');

//all blocks to fill page
const nameMovie = document.querySelector('.right-body__title');
const describeMovie = document.querySelector('.right-body__sub');
const rateMovie = document.querySelector('.right-body__rate');
const imgMovie = document.querySelector('.left-movies__ava');
const yearsMovie = document.querySelector('.right-body__years');
const genresMovie = document.querySelector('.right-body__genres');

//parent recommendation
const divRecMovies = document.querySelector('.right-body__recommendations');

//global variables to save the received objects from API
let listOfMovies;
let selectedMovie;
let seriesMovie;

//get list movie which enter user
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
        outputNameMovies(listOfMovies.d);
    }catch(err){
        showErrorPopUp(err)
    }

}
//get all info about some movie, create obj, save in LocalStorage, fill page
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
            let createObjMovie = new User(selectedMovie, id);
            
            let getObj = JSON.parse(localStorage.getItem("watchedMovies"));
            getObj[createObjMovie.title] = createObjMovie;
            localStorage.setItem("watchedMovies", JSON.stringify(getObj));
            watchedMoviesTitle.textContent = "List of watched movies:";

            fillPage(createObjMovie);
            showHide(blockContent, moviesWatched);
        }
        if(type == "recommendedMovie"){
            rewriteRecommandation(selectedMovie, rate, id, adressChild);
        }
    }
    catch(err){
        showErrorPopUp(err)
    }
}
//get info about recommended movie, fill
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
// show error about finding movie 
function showErrorPopUp(err){
    console.log("Erorr", err);
}
//hide autoComplete by clicking outside autoComplete field
document.addEventListener("click", function(e) {
    if(e.target.className != "header__autocomplete"){
        autoComplete.classList.remove("active");
        input.classList.remove("active");
    }
});


//search movies
input.addEventListener("keyup", function () {
    console.log(input.value.length);
    if(input.value.length == 0){
        input.classList.remove('active');
        autoComplete.classList.remove('active');     
    }else{
        getDataAboutAllMovies(input.value);
        autoComplete.classList.add('active');     
        input.classList.add('active');

    }
    let lengthWord = input.value.length;
    if(input.value.length < lengthWord){
        autoComplete.classList.remove('active');
        input.classList.remove('active');
    } 
})

//hide window with movie
crossWindowMovie.addEventListener("click", function(e) {
    showHide(moviesWatched, blockContent);
    input.value = "";
});

//click on movie from autoComplete
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

//click on recommended movie
divRecMovies.addEventListener("click", function(e) {
    if(e.target.tagName == "IMG" && e.target.className == ""){
        const idMovie = e.target.getAttribute("numOfChild");
        getDataAboutMovie(idMovie , "movie");
        callRecc();
        input.value = "";
    } 
});

//click on last watched movie
watchedMoviesList.addEventListener("click", function(e) {
    if(e.target.className != "watched-movies__list"){
        let nameMovie = e.target.closest(".watched-movies__movie").querySelector('p').textContent;
        let obj = JSON.parse(localStorage.getItem('watchedMovies'));
        showHide(blockContent, moviesWatched);
        fillPage(obj[nameMovie]);
        callRecc();
    }
});
//create a certain amount preloader depends of document width
function callRecc(){
    divRecMovies.textContent = "";
    if(document.body.clientWidth <= 991 && document.body.clientWidth >= 768){
        for (let i = 0; i < 2; i++) createPreloader("img/giphy.gif");
    }else if(document.body.clientWidth >= 991){
        for (let i = 0; i < 3; i++) createPreloader("img/giphy.gif");
    }
    recommendedMovie();
}
//create obj about movie
function User(obj, id) {
    this.title = obj?.title?.title, 
    this.year = `${obj?.title?.seriesStartYear || ""}-${obj?.title?.seriesEndYear || ""}`,
    this.rate = obj?.ratings?.rating != undefined ? `Rate: ${obj.ratings.rating} /10`: "",
    this.url = obj?.title?.image?.url,
    this.genres = obj.genres != undefined ? `Genres: ${obj?.genres.join(", ") || ""}` : "",
    this.describe = obj?.plotSummary?.text || "",
    this.id = id
}
//output movies in autoComplete
function outputNameMovies(arr){
    autoComplete.textContent = "";
    arr.forEach(element => {
        let div = document.createElement('div');
        div.textContent = element.l;
        autoComplete.append(div);
    });
}
//fill page about all info movie
function fillPage(obj){
    nameMovie.textContent = obj.title;
    yearsMovie.textContent = obj.title.year;
    rateMovie.textContent = obj.rate;
    imgMovie.src = obj.url;
    genresMovie.textContent = obj.genres;
    describeMovie.textContent = obj.describe;
    showWatchedMovies();
}
//create a certain amount recommended movie depends of document width
function fillRecommendedMovie(arr){
    if(document.body.clientWidth <= 991 && document.body.clientWidth >= 768){
        renderRecommandation(2, arr)
    }else if(document.body.clientWidth >= 991){
        renderRecommandation(3, arr)
    }
}

//show / hide some block
function showHide(show, hide){
    show.style.display = "flex";
    hide.style.display = "none";
}

//create preloader
function createPreloader(imgPath){
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
//take random movie from the most popular movies
function renderRecommandation(num, arr){
    for (let i = 0; i < num; i++) {
        let object = arr[getRandomInt(250)];
        let name = object.id;
        let rate = object.chartRating;
        getDataAboutMovie(name.slice(7, name.length - 1), "recommendedMovie" , rate, i);
    }
}
//change preloader on real recommandation movie
function rewriteRecommandation(obj, rate, id, adressChild){
    const card = document.querySelectorAll('.recommendations__card');
    card[adressChild].querySelector('img').src =  obj.title.image.url;
    card[adressChild].querySelector('img').setAttribute("numOfChild", id);
    card[adressChild].querySelector('.recommendations__rate').textContent =  rate; 
}
//get random number
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
//check localStorage
if(localStorage.getItem('watchedMovies') == null){
    localStorage.setItem('watchedMovies', JSON.stringify({}));
}else if(localStorage.getItem('watchedMovies').length != 2){
    watchedMoviesTitle.textContent = "List of watched movies:";
    showWatchedMovies();
}
//show show watched movies from localStorage
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
