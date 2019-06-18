const searchForm = document.querySelector("#searchForm");
const movies = document.querySelector("#movies");

function apiSearch(e) {
  e.preventDefault();
  const searchText = document.querySelector("#searchText").value;
  const server = `https://api.themoviedb.org/3/search/multi?api_key=cc4a12debd0f48352ad900be26638ef0&language=ru-RU&query=${searchText}`;
  requesApi("GET", server);
}

searchForm.addEventListener("submit", apiSearch);

function requesApi(method, url) {
  const request = new XMLHttpRequest();
  request.open(method, url);
  request.send();
  request.addEventListener("readystatechange", () => {
    if (request.readyState !== 4) return;
    if (request.status !== 200) {
      console.log(`Error: ${request.status}`);
      return;
    }
    const output = JSON.parse(request.responseText);
    console.log(output);
    let inner = "";
    output.results.forEach(item => {
      let itemName = item.name || item.title;
      let itemPremiereDate = item.first_air_date || item.release_date;
      if (itemPremiereDate) {
        itemPremiereDate = new Date(itemPremiereDate);
        itemPremiereDate = `
          <p class="card-text text-secondary">
            Премьера: ${itemPremiereDate.getDate()}.${itemPremiereDate.getMonth() +
          1}.${itemPremiereDate.getFullYear()}
          </p>`;
      }
      inner += `
        <div class="col-12 col-md-4 col-xl-3 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">${itemName}</h5>
             ${itemPremiereDate}
            </div>
          </div>
        </div>`;
    });
    movies.innerHTML = inner;
  });
}
