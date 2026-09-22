const placeInput = document.getElementById('place');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const statusMsg = document.getElementById('status');
const weatherInfo = document.querySelector('.weather-info');
const weatherIcon = document.getElementById('weatherIcon');
const locationEl = document.getElementById('location');
const temperatureEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('description');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');

const conditions = {
  0: ['Clear sky', 'sun.png'], 1: ['Mainly clear', 'sun.png'],
  2: ['Partly cloudy', 'weather.png'], 3: ['Overcast', 'weather-news.png'],
  45: ['Foggy', 'weather-news.png'], 48: ['Foggy', 'weather-news.png'],
  51: ['Light drizzle', 'rain.png'], 53: ['Drizzle', 'rain.png'], 55: ['Heavy drizzle', 'rain.png'],
  56: ['Freezing drizzle', 'rain.png'], 57: ['Heavy freezing drizzle', 'rain.png'],
  61: ['Light rain', 'rain.png'], 63: ['Rain', 'rain.png'], 65: ['Heavy rain', 'rain (1).png'],
  66: ['Freezing rain', 'rain (1).png'], 67: ['Heavy freezing rain', 'rain (1).png'],
  71: ['Light snow', 'weather.png'], 73: ['Snow', 'weather.png'], 75: ['Heavy snow', 'weather.png'],
  77: ['Snow grains', 'weather.png'], 80: ['Rain showers', 'rain.png'], 81: ['Rain showers', 'rain.png'],
  82: ['Heavy rain showers', 'rain (1).png'], 85: ['Snow showers', 'weather.png'],
  86: ['Heavy snow showers', 'weather.png'], 95: ['Thunderstorm', 'storm.png'],
  96: ['Thunderstorm with hail', 'storm.png'], 99: ['Severe thunderstorm with hail', 'storm.png']
};

function showStatus(message, isError = false) {
  statusMsg.textContent = message;
  statusMsg.classList.toggle('error', isError);
}

function setLoading(isLoading) {
  getWeatherBtn.disabled = isLoading;
  getWeatherBtn.textContent = isLoading ? 'Searching...' : 'Search';
}

async function checkWeather() {
  const city = placeInput.value.trim();

  if (!city) {
    weatherInfo.hidden = true;
    showStatus('Please enter a city name.', true);
    placeInput.focus();
    return;
  }

  setLoading(true);
  weatherInfo.hidden = true;
  showStatus(`Looking up weather in ${city}...`);

  try {
    const locationResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    if (!locationResponse.ok) throw new Error('Unable to find that location.');

    const location = (await locationResponse.json()).results?.[0];
    if (!location) throw new Error('City not found. Check the spelling and try again.');

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
    );
    if (!weatherResponse.ok) throw new Error('Weather data is unavailable right now.');

    const current = (await weatherResponse.json()).current;
    if (!current) throw new Error('Weather data is unavailable right now.');

    const [description, icon] = conditions[current.weather_code] ?? ['Unknown conditions', 'weather.png'];
    locationEl.textContent = [location.name, location.admin1, location.country].filter(Boolean).join(', ');
    temperatureEl.innerHTML = `${Math.round(current.temperature_2m)}<sub>&deg;C</sub>`;
    descriptionEl.textContent = description;
    humidityEl.textContent = `Humidity: ${current.relative_humidity_2m}%`;
    windEl.textContent = `Wind: ${Math.round(current.wind_speed_10m)} km/h`;
    weatherIcon.src = `New folder/${icon}`;
    weatherIcon.alt = description;
    weatherInfo.hidden = false;
    showStatus(`Current weather for ${location.name}.`);
  } catch (error) {
    showStatus(error.message || 'Something went wrong. Please try again.', true);
  } finally {
    setLoading(false);
  }
}

getWeatherBtn.addEventListener('click', checkWeather);
placeInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') checkWeather();
});
