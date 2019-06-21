(function() {
  const searchForm = document.querySelector("#searchForm");
  const movies = document.querySelector("#movies");
  const key = "cc4a12debd0f48352ad900be26638ef0";

  function apiSearch(e) {
    e.preventDefault();
    const searchText = document.querySelector("#searchText").value;
    if (searchText.trim().length === 0) {
      movies.innerHTML =
        "<p class='col-12 h2 text-center text-danger'>Поле поиска не должно быть пустым</p>";
      return;
    }
    movies.innerHTML = "<div class='spinner'></div>";

    fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${key}&language=ru-RU&include_adult=false&query=${searchText}`
    )
      .then(value => {
        if (value.status !== 200) {
          return Promise.reject(value);
        }
        return value.json();
      })
      .then(output => {
        let inner = "";
        if (output.results.length === 0) {
          inner =
            "<p class='col-12 h2 text-center text-muted'>По вашему запросу ничего не найдено</p>";
        }
        output.results.forEach(item => {
          const itemName = item.name || item.title;
          const itemPopularity = item.popularity
            ? `<div class="card-img-overlay"><span class="badge badge-success">&#9733; ${
                item.popularity
              }</span></div>`
            : "";
          const itemPoster = item.poster_path
            ? `<img src="//image.tmdb.org/t/p/w500${
                item.poster_path
              }" alt="${itemName}" class="img-fluid h-100">`
            : "<div class='d-flex h-100 align-items-center justify-content-center text-muted'>Постер отсутствует</div>";
          let premiereDate = formatDate(
            item.first_air_date || item.release_date
          );
          let itemPremiereDate = premiereDate
            ? `
            <p class="card-subtitle text-muted">
              <small>Премьера: ${premiereDate}</small>
            </p>`
            : "";
          let dataInfo = "";
          if (item.media_type !== "person") {
            dataInfo = `data-id="${item.id}" data-type="${item.media_type}"`;
          }
          inner += `
          <div class="col-12 col-sm-6 col-md-4 col-xl-3 mb-3 mb-sm-4">
            <div class="card h-100 shadow-sm">
              <div class="embed-responsive embed-responsive-2by3 card-img-top border-bottom" ${dataInfo}>
                <div class="embed-responsive-item bg-light">
                ${itemPoster}
                </div>
              ${itemPopularity}
              </div>
              <div class="card-body">
                <h3 class="card-title">${itemName}</h3>
               ${itemPremiereDate}
              </div>
            </div>
          </div>`;
        });
        movies.innerHTML = inner;
        addEventMedia();
      })
      .catch(reason => {
        movies.innerHTML = "<div class='col-12'>Упс, что-то пошло не так</div>";
        console.log(`Error: ${reason || reason.status}`);
      });
  }

  searchForm.addEventListener("submit", apiSearch);

  function addEventMedia() {
    const media = movies.querySelectorAll(".card-img-top[data-id]");
    media.forEach(el => {
      el.style.cursor = "pointer";
      el.addEventListener("click", showFullInfo);
    });
  }

  function showFullInfo() {
    let url = "";
    if (this.dataset.type === "movie") {
      url = `https://api.themoviedb.org/3/movie/${
        this.dataset.id
      }?api_key=${key}&language=ru-RU`;
    } else if (this.dataset.type === "tv") {
      url = `https://api.themoviedb.org/3/tv/${
        this.dataset.id
      }?api_key=${key}&language=ru-RU`;
    } else {
      movies.innerHTML =
        "<p class='col-12 h2 text-center text-danger'>Произошла ошибка, повторите позже</p>";
    }

    fetch(url)
      .then(value => {
        if (value.status !== 200) {
          return Promise.reject(value);
        }
        return value.json();
      })
      .then(output => {
        movies.innerHTML = `
        <h2 class="col-12 h4 text-center text-info">
        ${output.name || output.title}
        </h2>
        <div class="col-4">
          <div class="embed-responsive embed-responsive-2by3 mb-4">
            <div class="embed-responsive-item bg-light">
            ${
              output.poster_path
                ? `<img src="//image.tmdb.org/t/p/w500${
                    output.poster_path
                  }" alt="${output.name ||
                    output.title}" class="img-thumbnail img-fluid h-100">`
                : "<div class='d-flex h-100 align-items-center justify-content-center bg-light text-muted border'>Постер отсутствует</div>"
            }
            </div>
          </div>
          ${
            output.homepage
              ? `<p class="text-center"><a href="${
                  output.homepage
                }" target="_blank" rel="nofollow noopener">Официальная страница</a></p>`
              : ""
          }
          ${
            output.imdb_id
              ? `<p class="text-center"><a href="https://imdeb.com/title/${
                  output.imdb_id
                }" target="_blank" rel="nofollow noopener">Страница на IMDB</a></p>`
              : ""
          }
        </div>
        <div class="col-8">
          <p><span class="text-muted">Рейтинг:</span> ${
            output.vote_average
          } (голосов: ${output.vote_count})</p>
          <p><span class="text-muted">Статус:</span> ${output.status}</p>
          <p><span class="text-muted">Премьера:</span> ${formatDate(
            output.first_air_date || output.release_date
          )}</p>
          <p><span class="text-muted">Жанр:</span> ${
            output.genres ? output.genres.map(g => ` ${g.name}`) : ""
          }</p>
          ${
            output.last_episode_to_air
              ? `<p>Вышло: ${output.number_of_seasons} сезон ${
                  output.last_episode_to_air.episode_number
                } серий</p>`
              : ""
          }
          <p>${output.overview}</p>
          <div class="youtube mt-4"></div>
        </div>
      `;

        getVideo(this.dataset.type, this.dataset.id);
      })
      .catch(reason => {
        movies.innerHTML = "<div class='col-12'>Упс, что-то пошло не так</div>";
        console.log(`Error: ${reason || reason.status}`);
      });
  }

  if (document.readyState !== "loading") {
    apiTrend();
  } else {
    document.addEventListener("DOMContentLoaded", apiTrend);
  }

  function apiTrend() {
    fetch(
      `https://api.themoviedb.org/3/trending/all/week?api_key=${key}&language=ru-RU&include_adult=false`
    )
      .then(value => {
        if (value.status !== 200) {
          return Promise.reject(value);
        }
        return value.json();
      })
      .then(output => {
        let inner =
          "<h2 class='h4 col-12 text-center text-info mb-4'>Популярное за неделю</h2>";
        if (output.results.length === 0) {
          inner =
            "<p class='col-12 h2 text-center text-muted'>По вашему запросу ничего не найдено</p>";
        }
        output.results.forEach(item => {
          const itemName = item.name || item.title;
          const itemPopularity = item.popularity
            ? `<div class="card-img-overlay"><span class="badge badge-success">&#9733; ${
                item.popularity
              }</span></div>`
            : "";
          const itemPoster = item.poster_path
            ? `<img src="//image.tmdb.org/t/p/w500${
                item.poster_path
              }" alt="${itemName}" class="img-fluid h-100">`
            : "<div class='d-flex h-100 align-items-center justify-content-center text-muted'>Постер отсутствует</div>";
          let premiereDate = formatDate(
            item.first_air_date || item.release_date
          );
          let itemPremiereDate = premiereDate
            ? `
            <p class="card-subtitle text-muted">
              <small>Премьера: ${premiereDate}</small>
            </p>`
            : "";
          let mediaType = item.name ? "tv" : "movie";
          let dataInfo = `data-id="${item.id}" data-type="${mediaType}"`;
          inner += `
          <div class="col-12 col-sm-6 col-md-4 col-xl-3 mb-3 mb-sm-4">
            <div class="card h-100 shadow-sm">
              <div class="embed-responsive embed-responsive-2by3 card-img-top border-bottom" ${dataInfo}>
                <div class="embed-responsive-item bg-light">
                ${itemPoster}
                </div>
              ${itemPopularity}
              </div>
              <div class="card-body">
                <h3 class="card-title">${itemName}</h3>
                ${itemPremiereDate}
              </div>
            </div>
          </div>`;
        });
        movies.innerHTML = inner;
        addEventMedia();
      })
      .catch(reason => {
        movies.innerHTML = "<div class='col-12'>Упс, что-то пошло не так</div>";
        console.log(`Error: ${reason || reason.status}`);
      });
  }

  function formatDate(date) {
    if (date) {
      date = new Date(date);
      const day = (date.getDate() + 1).toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const yaer = date.getFullYear();
      return `${day}.${month}.${yaer}`;
    }
    return "";
  }

  function getVideo(type, id) {
    let youtube = movies.querySelector(".youtube");
    fetch(
      `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${key}&language=ru-RU`
    )
      .then(value => {
        if (value.status !== 200) {
          return Promise.reject(value);
        }
        return value.json();
      })
      .then(output => {
        let videoframe = "<h4 class='text-info h5'>Трейлеры</h4>";
        if (output.results.length > 0) {
          output.results.forEach(item => {
            videoframe += `
            <div class="embed-responsive embed-responsive-16by9 mb-3">
              <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${
                item.key
              }" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            `;
          });
        } else {
          videoframe += "К сожалению, видео отсутствует";
        }
        youtube.innerHTML = videoframe;
      })
      .catch(reason => {
        youtube.innerHTML = "Видео отсутствует";
        console.log(`Error: ${reason || reason.status}`);
      });
  }
})();
