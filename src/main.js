console.log('Hola hermoso mundo');
const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
    },
    params: {
        api_key: API_KEY__THEMOVIES,
    }
});

function likedMoviesList(){
    const item = JSON.parse(localStorage.getItem('liked_movies'));
    let movies;
    if(item){
        movies = item;
    }else{
        movies = {};
    }
    return movies;
}

function likeMovie(movie){
    
    const likedMovies = likedMoviesList();
    if(likedMovies[movie.id]){
        console.log('ya esta en ls');
        likedMovies[movie.id] = undefined;
    }else{
        console.log('no esta en ls');
        likedMovies[movie.id] = movie;
    }
    localStorage.setItem('liked_movies',JSON.stringify(likedMovies));
    /*if (location.hash == ''){
    homePage();
    }*/
    getTrendingMoviesPreview();
    getLikedMovies();
}

const lazyLoader = new IntersectionObserver(entris => {
    entris.forEach(entry =>{
        if(entry.isIntersecting){
            const url = entry.target.getAttribute('data-img');
            entry.target.setAttribute('src', url);
        }
    });
});

//Utils
function createMovies(
    movies,
    container,
    {lazyLoad = false, clean = true}={},
    ) {
    if(clean){
        while(container.firstChild && container.firstChild){
            container.removeChild(container.firstChild);
        }
    }
    movies.forEach(movie => {

        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');
        

        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title);
        movieImg.setAttribute(
            lazyLoad ? 'data-img' : 'src',
            `https://image.tmdb.org/t/p/w300${movie.poster_path}`);
        
        movieImg.addEventListener('click', () =>{
            location.hash = '#movie=' + movie.id;
        });

        movieImg.addEventListener('error', ()=>{
            movieImg.setAttribute('src','https://i.pinimg.com/564x/9c/85/8d/9c858d2f7021a06bf1b98b67d0797277.jpg')
        });

        const movieBtn = document.createElement('button');
        movieBtn.classList.add('movie-btn');
        likedMoviesList()[movie.id] && movieBtn.classList.add('movie-btn--liked');
        movieBtn.addEventListener('click', () =>{
            movieBtn.classList.toggle('movie-btn--liked');
            likeMovie(movie);
        });

        if(lazyLoad){
            lazyLoader.observe(movieImg);
        }

        movieContainer.appendChild(movieImg);
        movieContainer.appendChild(movieBtn);
        container.appendChild(movieContainer);
    });
}

function createCategories(categories, container){
    while(container.firstChild && container.firstChild){
        container.removeChild(container.firstChild);
    }

    categories.forEach(category => {

        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');
        const categoryTitle = document.createElement('h3');
        categoryTitle.classList.add('category-title');
        categoryTitle.setAttribute('id', 'id' + category.id);
        categoryTitle.addEventListener('click', ()=>{
            location.hash = `#category=${category.id}-${category.name}`;
        });

        const categoryTitleText = document.createTextNode(category.name);
        categoryTitle.appendChild(categoryTitleText);
        categoryContainer.appendChild(categoryTitle);
        container.appendChild(categoryContainer);
    });
}


//call a the api

async function getTrendingMoviesPreview() {
    const { data } = await api('/trending/movie/day');
    const movies = data.results;

    console.log({data, movies});

    createMovies(movies, trendingMoviesPreviewList, {lazyLoad: true});

}

async function getCategoriesPreview(){
    const { data } = await api('/genre/movie/list');
    const categories = data.genres;

    createCategories(categories, categoriesPreviewList);

}

async function getMoviesByCategory(id) {
    const { data } = await api('/discover/movie', {
        params:{
            with_genres: id,
        }
    });
    
    const movies = data.results;
    maxPage = data.total_pages;
    console.log({data, movies});

    createMovies(movies, genericSection, {lazyLoad: true});
}

function getPaginatedMoviesByCategory(id){
    return async function (){
        const {
        scrollTop,
        scrollHeight,
        clientHeight,
    } = document.documentElement;

    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
    const pageIsNotMax = page < maxPage;

    if(scrollIsBottom && pageIsNotMax){

        page++;
        const { data } = await api('/discover/movie', {
            params:{
                with_genres: id,
                page,
            }
        });
        const movies = data.results;
    
        
        createMovies(
            movies, 
            genericSection, 
            {lazyLoad: true, clean: false});
        }
    }
}

async function getMoviesBySearch(query){
    const { data } = await api('search/movie', {
        params:{
            query,
        }
    });
    const movies = data.results;
    maxPage = data.total_pages;
    createMovies(movies, genericSection);
}

function getPaginatedMoviesBySearch(query){
    return async function (){
        const {
        scrollTop,
        scrollHeight,
        clientHeight,
    } = document.documentElement;

    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
    const pageIsNotMax = page < maxPage;

    if(scrollIsBottom && pageIsNotMax){

        page++;
        const { data } = await api('search/movie', {
            params:{
                query,
                page,
            }
        });
        const movies = data.results;
    
        
        createMovies(
            movies, 
            genericSection, 
            {lazyLoad: true, clean: false});
        }
    }
}

async function getTrendingMovies() {
    const { data } = await api('/trending/movie/day');
    const movies = data.results;
    maxPage = data.total_pages;
    
    console.log({data, movies});

    createMovies(movies, genericSection,{lazyLoad: true, clean: true});
}


async function getPaginatedTrendingMovies(){
    const {
        scrollTop,
        scrollHeight,
        clientHeight,
    } = document.documentElement;

    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
    const pageIsNotMax = page < maxPage;

    if(scrollIsBottom && pageIsNotMax){

        page++;
        const { data } = await api ('/trending/movie/day', {
            params:{
                page,
            },
        });
        const movies = data.results;
    
        
        createMovies(
            movies, 
            genericSection, 
            {lazyLoad: true, clean: false});
    }
}

async function getMovieById(id) {
    const { data: movie } = await api('movie/' + id);
    
    console.log({movie});

    const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
    headerSection.style.background = `linear-gradient(180deg, rgba(0, 0, 0, 0.35) 19.27%, rgba(0, 0, 0, 0) 29.17%), url(${movieImgUrl})`;
    console.log(movieImgUrl);

    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average;

    createCategories(movie.genres, movieDetailCategoriesList);
    getRelatedMoviesId(id)
}

async function getRelatedMoviesId(id){
    const { data } = await api(`/movie/${id}/recommendations`)
    const relatedMovies = data.results;

    createMovies(relatedMovies, relatedMoviesContainer);
}

function getLikedMovies(){
    const likedMovies = likedMoviesList();
    const movieListArray = Object.values(likedMovies);

    createMovies(movieListArray, likedMoviesListArticle, {lazyLoad: true, clean: true})
}

const flatsLang = document.querySelector('#lang-flats');

async function changeLang(langs){
    const textsToChange = document.querySelectorAll('[data-section]');
    const response = await fetch(`./lang/${langs}.json`);
    const data = await response.json();

    for(let textToChange of textsToChange){
        const section = textToChange.dataset.section;
        const value = textToChange.dataset.value;

        textToChange.innerText = data[section][value];
        console.log(textToChange);
    }
}

flatsLang.addEventListener('change', (e) => {
    const selectedOption = e.target.selectedOptions[0];
    const langCode = selectedOption.dataset.lang;
    changeLang(langCode);
});