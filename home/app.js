const API_KEY = '5670268c';
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const movieContainer = document.getElementById('movieContainer');
const toggleFavoritesBtn = document.getElementById('toggleFavoritesBtn');
const favoritesDropdown = document.getElementById('favoritesDropdown');
const favoritesContainer = document.getElementById('favoritesContainer');
const showAllMoviesBtn = document.getElementById('showSomeMoviesBtn');

let allMovies = [];
let favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];


async function fetchMovies() {
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=movie`);
        const data = await response.json();
        if (data.Response === "True") {
            return data.Search.slice(0, 600);
        } else {
            throw new Error(data.Error);
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}


function displayMovies() {
    movieContainer.innerHTML = '';
    allMovies.forEach(movie => {
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');

        const isFavorite = favoriteMovies.some(favMovie => favMovie.imdbID === movie.imdbID);

        movieEl.innerHTML = `
            <img src="${movie.Poster}" alt="${movie.Title}">
            <h3>${movie.Title}</h3>
            <i class="fas fa-heart favorite-icon" 
               style="color: ${isFavorite ? 'red' : 'white'};" 
               data-imdbid="${movie.imdbID}" 
               onclick="toggleFavorite('${movie.imdbID}', '${movie.Title}', '${movie.Poster}', this)"></i>
        `;
        movieContainer.appendChild(movieEl);
    });
}

// دالة لتفعيل وإلغاء تفعيل المفضلة
function toggleFavorite(imdbID, title, poster, icon) {
    const movieIndex = favoriteMovies.findIndex(movie => movie.imdbID === imdbID);
    if (movieIndex > -1) {
        // إزالة الفيلم من المفضلة
        favoriteMovies.splice(movieIndex, 1);
        icon.style.color = 'white'; // تغيير لون أيقونة المفضلة
    } else {
        // إضافة الفيلم إلى المفضلة
        favoriteMovies.push({ imdbID, Title: title, Poster: poster });
        icon.style.color = 'red'; // تغيير لون أيقونة المفضلة
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies)); // تحديث المفضلات في localStorage
    displayFavorites();
}

// عرض قائمة المفضلات
function displayFavorites() {
    favoritesContainer.innerHTML = '';
    if (favoriteMovies.length === 0) {
        favoritesContainer.innerHTML = '<p>No favorites added yet.</p>';
    } else {
        favoriteMovies.forEach(movie => {
            const favoriteEl = document.createElement('div');
            favoriteEl.classList.add('favorite-movie-wrapper');
            favoriteEl.innerHTML = `
                <img src="${movie.Poster}" alt="${movie.Title}">
                <h3>${movie.Title}</h3>
                <button class="remove-favorite" onclick="removeFavorite('${movie.imdbID}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            favoritesContainer.appendChild(favoriteEl);
        });
    }
}

// دالة لإزالة الفيلم من قائمة المفضلات
function removeFavorite(imdbID) {
    // إزالة الفيلم من قائمة المفضلات
    favoriteMovies = favoriteMovies.filter(movie => movie.imdbID !== imdbID);

    // تحديث المفضلات في localStorage
    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));

    // تحديث قائمة المفضلات المعروضة
    displayFavorites();

    // تحديث أيقونة المفضلة في قائمة الأفلام
    const movieIcons = document.querySelectorAll('.favorite-icon');
    movieIcons.forEach(icon => {
        if (icon.getAttribute('data-imdbid') === imdbID) {
            icon.style.color = 'white'; // إعادة تعيين لون الأيقونة
        }
    });
}

// حدث عند الضغط على زر المفضلات
toggleFavoritesBtn.addEventListener('click', () => {
    const isDisplayed = favoritesDropdown.style.display === 'block';
    favoritesDropdown.style.display = isDisplayed ? 'none' : 'block';
    displayFavorites(); // تأكد من عرض الأفلام المفضلة
});

// حدث البحث
searchBtn.addEventListener('click', async() => {
    const searchQuery = searchInput.value;
    if (searchQuery) {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        if (data.Response === "True") {
            displaySearchResults(data.Search);
            // إخفاء قسم جميع الأفلام وإظهار قسم نتائج البحث
            document.getElementById('SomeMoviesSection').style.display = 'none';
            document.getElementById('searchResultsSection').style.display = 'block';
        } else {
            alert('No results found.');
        }
    } else {
        alert('Please enter a search term');
    }
});


function displaySearchResults(movies) {
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    searchResultsContainer.innerHTML = '';
    movies.forEach(movie => {
        const resultEl = document.createElement('div');
        resultEl.classList.add('movie');

        const isFavorite = favoriteMovies.some(favMovie => favMovie.imdbID === movie.imdbID);

        resultEl.innerHTML = `
            <img src="${movie.Poster}" alt="${movie.Title}">
            <h3>${movie.Title}</h3>
            <i class="fas fa-heart favorite-icon" 
               style="color: ${isFavorite ? 'red' : 'white'};" 
               data-imdbid="${movie.imdbID}" 
               onclick="toggleFavorite('${movie.imdbID}', '${movie.Title}', '${movie.Poster}', this)"></i>
        `;
        searchResultsContainer.appendChild(resultEl);
    });

    showAllMoviesBtn.style.display = 'inline';
}


showAllMoviesBtn.addEventListener('click', () => {
    document.getElementById('searchResultsSection').style.display = 'none';
    document.getElementById('SomeMoviesSection').style.display = 'block';
});

// تحميل الأفلام عند فتح الصفحة
fetchMovies().then(movies => {
    allMovies = movies;
    displayMovies();
    showAllMoviesBtn.style.display = 'none'; // إخفاء الزر عند البداية
});

// عرض المفضلات عند تحميل الصفحة
displayFavorites();