const API_KEY = "b870e70070d9d536cce26a2fb2269099";

const cityInput = document.getElementById("cityInput");
const checkBtn = document.getElementById("checkBtn");
const geoBtn = document.getElementById("geoBtn");
const currentBox = document.getElementById("currentWeather");
const forecastBox = document.getElementById("forecastWeather");

// Obsługa przycisków

checkBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) {
        alert("Wpisz nazwę miasta");
        return;
    }
    getCurrentWeatherByCity(city);
    getForecastByCity(city);
});

geoBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Geolokalizacja nie jest obsługiwana w Twojej przeglądarce");
        return;
    }

    currentBox.innerHTML = `<p class="placeholder">Pobieram Twoją lokalizację</p>`;
    forecastBox.innerHTML = `<p class="placeholder">Czekam na dane prognozy</p>`;

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            console.log("GEO OK:", lat, lon);

            getCurrentWeatherByCoords(lat, lon);
            getForecastByCoords(lat, lon);
        },
        (err) => {
            console.error("Geo error:", err);
            alert("Nie udało się pobrać Twojej lokalizacji.");
        }
    );
});

// CURRENT WEATHER po nazwie miasta (XMLHttpRequest)
function getCurrentWeatherByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
    )}&appid=${API_KEY}&units=metric&lang=pl`;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log("CURRENT WEATHER (city):", data);

            renderCurrentWeather(data);
        } else {
            console.error("Błąd, status:", xhr.status, xhr.responseText);
            currentBox.innerHTML = `<p class="placeholder">Nie udało się pobrać aktualnej pogody (błąd ${xhr.status}).</p>`;
        }
    };

    xhr.onerror = function () {
        console.error("Błąd połączenia (XMLHttpRequest)");
        currentBox.innerHTML = `<p class="placeholder">Błąd połączenia po stronie klienta</p>`;
    };

    xhr.send();
}

// CURRENT WEATHER po współrzędnych (XMLHttpRequest)
function getCurrentWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pl`;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log("CURRENT WEATHER (geo):", data);

            renderCurrentWeather(data);
        } else {
            console.error("Błąd, status (geo):", xhr.status, xhr.responseText);
            currentBox.innerHTML = `<p class="placeholder">Nie udało się pobrać pogody dla Twojej lokalizacji (błąd ${xhr.status}).</p>`;
        }
    };

    xhr.onerror = function () {
        console.error("Błąd połączenia (XMLHttpRequest geo)");
        currentBox.innerHTML = `<p class="placeholder">Błąd połączenia przy pobieraniu pogody z geolokalizacji</p>`;
    };

    xhr.send();
}

// Wspólny render aktualnej pogody
function renderCurrentWeather(data) {
    const temp = Math.round(data.main.temp);
    const feels = Math.round(data.main.feels_like);
    const desc = data.weather[0].description;
    const humidity = data.main.humidity;
    const cityName = data.name;
    const country = data.sys.country;

    currentBox.innerHTML = `
    <div class="current-city">${cityName}, ${country}</div>
    <div class="current-temp">${temp}°C</div>
    <div class="current-extra">
      Odczuwalna: ${feels}°C • Wilgotność: ${humidity}%</div>
    <div class="badge">
      <span class="dot"></span>
      <span>${desc}</span>
    </div>
  `;
}

//FORECAST po nazwie miasta (Fetch API)
function getForecastByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city
    )}&appid=${API_KEY}&units=metric&lang=pl`;

    fetchForecast(url, "FORECAST (city):");
}

//FORECAST po współrzędnych (Fetch API)
function getForecastByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pl`;

    fetchForecast(url, "FORECAST (geo):");
}

//Wspólna funkcja do pobierania prognozy
function fetchForecast(url, logLabel) {
    fetch(url)
        .then((res) => {
            if (!res.ok) {
                throw new Error("HTTP " + res.status);
            }
            return res.json();
        })
        .then((data) => {
            console.log(logLabel, data);

            if (!data.list || !Array.isArray(data.list)) {
                forecastBox.innerHTML =
                    '<p class="placeholder">Brak danych prognozy</p>';
                return;
            }

            const items = data.list.slice(0, 8);
            let html = "";

            items.forEach((item) => {
                const date = item.dt_txt;
                const t = Math.round(item.main.temp);
                const feels = Math.round(item.main.feels_like);
                const desc = item.weather[0].description;

                html += `
          <article class="forecast-item">
            <strong>${date}</strong>
            <div class="forecast-temp">${t}°C (odczuwalna ${feels}°C)</div>
            <div class="forecast-desc">${desc}</div>
          </article>
        `;
            });

            forecastBox.innerHTML = html;
        })
        .catch((err) => {
            console.error("Błąd Fetchforecast:", err);
            forecastBox.innerHTML =
                '<p class="placeholder">Nie udało się pobrać prognozy pogody</p>';
        });
}