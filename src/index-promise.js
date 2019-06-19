const searchForm = document.querySelector("#searchForm");
const movies = document.querySelector("#movies");

function apiSearch(e) {
  e.preventDefault();
  const searchText = document.querySelector("#searchText").value;
  const server = `https://api.themoviedb.org/3/search/multi?api_key=cc4a12debd0f48352ad900be26638ef0&language=ru-RU&include_adult=false&query=${searchText}`;
  movies.innerHTML = "<div class='col-12'>Загрузка</div>";

  requesApi(server)
    .then(result => {
      const output = JSON.parse(result);
      let inner = "";
      output.results.forEach(item => {
        const itemName = item.name || item.title;
        const itemPopularity = item.popularity
          ? `<div class="card-img-overlay"><span class="badge badge-success">&#9733; ${
              item.popularity
            }</span></div>`
          : "";
        const itemPoster = item.poster_path
          ? `<div class="embed-responsive-item"><img src="//image.tmdb.org/t/p/w500${
              item.poster_path
            }" alt="${itemName}" class="img-fluid"></div>`
          : '<div class="embed-responsive-item bg-light"></div>';
        let itemPremiereDate = "";
        let premiereDate = item.first_air_date || item.release_date;
        if (premiereDate) {
          premiereDate = new Date(premiereDate);
          let premiereDay = (premiereDate.getDate() + 1)
            .toString()
            .padStart(2, "0");
          let premiereMonth = (premiereDate.getMonth() + 1)
            .toString()
            .padStart(2, "0");
          let premiereYaer = premiereDate.getFullYear();
          itemPremiereDate = `
            <p class="card-subtitle text-muted">
              <small>Премьера: ${premiereDay}.${premiereMonth}.${premiereYaer}</small>
            </p>`;
        }
        inner += `
          <div class="col-12 col-sm-6 col-md-4 col-xl-3 mb-3">
            <div class="card h-100">
              <div class="embed-responsive embed-responsive-1by1 card-img-top border-bottom">
              ${itemPoster}
              </div>
              ${itemPopularity}
              <div class="card-body">
                <h5 class="card-title">${itemName}</h5>
                ${itemPremiereDate}
              </div>
            </div>
          </div>`;
      });
      movies.innerHTML = inner;
    })
    .catch(reason => {
      movies.innerHTML = "<div class='col-12'>Упс, что-то пошло не так</div>";
      console.log(`Error: ${reason.status}`);
    });
}

searchForm.addEventListener("submit", apiSearch);

function requesApi(url) {
  return new Promise(function(resolve, reject) {
    const request = new XMLHttpRequest();
    request.open("GET", url);
    request.addEventListener("load", () => {
      if (request.status !== 200) {
        reject({ status: request.status });
        return;
      }
      resolve(request.response);
    });
    request.addEventListener("error", () => {
      reject({ status: request.status });
    });
    request.send();
  });
}
