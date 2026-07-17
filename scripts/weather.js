/* WeatherSpot: city data, weather API, and weather rendering */

/* ---------------- 2. Master Data ---------------- */

// 表示都市はここだけを編集すれば追加・削除できます。
// New Yorkはアメリカの首都ではありませんが、主要都市として登録しています。
const cityList = [
  {
    id: "tokyo",
    name: "東京",
    country: "日本",
    latitude: 35.6812,
    longitude: 139.7671,
    sceneVariant: "urban",
    largeWindowBackgrounds: {
      default: {
        day: "assets/large-window/tokyo/default_day.png",
        night: "assets/large-window/tokyo/default_night.png"
      }
    }
  },
  {
    id: "london",
    name: "ロンドン",
    country: "イギリス",
    latitude: 51.5072,
    longitude: -0.1276,
    sceneVariant: "urban",
    largeWindowBackgrounds: {
      default: {
        day: "assets/large-window/london/default_day.png",
        night: "assets/large-window/london/default_night.png"
      }
    }
  },
  {
    id: "new-york",
    name: "ニューヨーク",
    country: "アメリカ",
    latitude: 40.7128,
    longitude: -74.0060,
    sceneVariant: "urban",
    largeWindowBackgrounds: {
      default: {
        day: "assets/large-window/new-york/default_day.png",
        night: "assets/large-window/new-york/default_night.png"
      }
    }
  },
  {
    id: "beijing",
    name: "北京",
    country: "中国",
    latitude: 39.9042,
    longitude: 116.4074,
    sceneVariant: "urban",
    largeWindowBackgrounds: {
      default: {
        day: "assets/large-window/beijing/default_day.png",
        night: "assets/large-window/beijing/default_night.png"
      }
    }
  },
  {
    id: "texas",
    name: "テキサス",
    country: "アメリカ",
    latitude: 30.2672,
    longitude: -97.7431,
    sceneVariant: "rural",
    largeWindowBackgrounds: {
      default: {
        day: "assets/large-window/texas/default_day.png",
        night: "assets/large-window/texas/default_night.png"
      }
    }
  }
];

const cities = Object.fromEntries(cityList.map((city) => [city.id, city]));


const weatherCodeMap = {
  0: { name: "快晴", icon: "☀️", theme: "theme-clear", music: "clear", message: "空は安定しています。外出しやすい天気です。", ascii: "      *      \n   *  O  *   \n      |      \n  CLEAR SKY  " },
  1: { name: "晴れ", icon: "🌤️", theme: "theme-clear", music: "clear", message: "晴れています。視界は良好です。", ascii: "      *      \n   *  O  *   \n      |      \n     SUNNY   " },
  2: { name: "一部くもり", icon: "⛅", theme: "theme-cloudy", music: "cloudy", message: "雲がありますが、天気は大きく崩れていません。", ascii: "    O        \n  .--.       \n (    ).     \n(___.__)__)  " },
  3: { name: "くもり", icon: "☁️", theme: "theme-cloudy", music: "cloudy", message: "曇りです。天気の変化に注意してください。", ascii: "      .--.   \n   .-(    ). \n  (___.__)__) " },
  45: { name: "霧", icon: "🌫️", theme: "theme-cloudy", music: "cloudy", message: "霧が出ています。移動時は視界に注意してください。", ascii: " _ - _ - _ - \n  _ - _ - _  \n _ - _ - _ - " },
  48: { name: "霧氷", icon: "🌫️", theme: "theme-cloudy", music: "cloudy", message: "霧氷の可能性があります。冷え込みに注意してください。", ascii: " _ - _ - _ - \n  _ - _ - _  \n _ - _ - _ - " },
  51: { name: "弱い霧雨", icon: "🌦️", theme: "theme-rain", music: "rain", message: "弱い霧雨です。折りたたみ傘があると安心です。", ascii: "     .--.    \n  .-(    ).  \n (___.__)__) \n   '  '  '   " },
  53: { name: "霧雨", icon: "🌦️", theme: "theme-rain", music: "rain", message: "霧雨です。服や荷物が濡れないよう注意してください。", ascii: "     .--.    \n  .-(    ).  \n (___.__)__) \n   '  '  '   " },
  55: { name: "強い霧雨", icon: "🌧️", theme: "theme-rain", music: "rain", message: "強い霧雨です。傘の使用を推奨します。", ascii: "     .--.    \n  .-(    ).  \n (___.__)__) \n  ' ' ' ' '  " },
  61: { name: "弱い雨", icon: "🌧️", theme: "theme-rain", music: "rain", message: "弱い雨です。路面状況に注意してください。", ascii: "     .--.    \n  .-(    ).  \n (___.__)__) \n   /  /  /   " },
  63: { name: "雨", icon: "🌧️", theme: "theme-rain", music: "rain", message: "雨です。移動時は傘を準備してください。", ascii: "     .--.    \n  .-(    ).  \n (___.__)__) \n  / / / / /  " },
  65: { name: "強い雨", icon: "☔", theme: "theme-rain", music: "rain", message: "強い雨です。外出時は十分注意してください。", ascii: "     .--.    \n  .-(    ).  \n (___.__)__) \n ///// ///// " },
  71: { name: "弱い雪", icon: "🌨️", theme: "theme-snow", music: "snow", message: "弱い雪です。足元に注意してください。", ascii: "     .--.    \n  .-(    ).  \n (___.__)__) \n   *  *  *   " },
  73: { name: "雪", icon: "❄️", theme: "theme-snow", music: "snow", message: "雪です。交通情報を確認してください。", ascii: "     .--.    \n  .-(    ).  \n (___.__)__) \n  * * * * *  " },
  75: { name: "強い雪", icon: "☃️", theme: "theme-snow", music: "snow", message: "強い雪です。移動は慎重に行ってください。", ascii: "     .--.    \n  .-(    ).  \n (___.__)__) \n *********** " },
  80: { name: "弱いにわか雨", icon: "🌦️", theme: "theme-rain", music: "rain", message: "にわか雨の可能性があります。空の変化に注意してください。", ascii: "     .--.    \n  .-(    ).  \n (___.__)__) \n   /  /  /   " },
  81: { name: "にわか雨", icon: "🌧️", theme: "theme-rain", music: "rain", message: "にわか雨です。急な雨に注意してください。", ascii: "     .--.    \n  .-(    ).  \n (___.__)__) \n  / / / / /  " },
  82: { name: "強いにわか雨", icon: "⛈️", theme: "theme-storm", music: "storm", message: "強いにわか雨です。屋内に入れる場所を確認してください。", ascii: "     .--.    \n  .-(    ).  \n (___.__)__) \n  / / ⚡ / /  " },
  95: { name: "雷雨", icon: "⛈️", theme: "theme-storm", music: "storm", message: "雷雨です。安全な場所で待機してください。", ascii: "     .--.    \n  .-(    ).  \n (___.__)__) \n    ⚡ ⚡     " },
  96: { name: "雷雨とひょう", icon: "⛈️", theme: "theme-storm", music: "storm", message: "雷雨とひょうの可能性があります。外出は慎重に判断してください。", ascii: "     .--.    \n  .-(    ).  \n (___.__)__) \n  ⚡ o ⚡ o   " },
  99: { name: "強い雷雨とひょう", icon: "⛈️", theme: "theme-storm", music: "storm", message: "危険な天候です。屋内で安全を確保してください。", ascii: "     .--.    \n  .-(    ).  \n (___.__)__) \n ⚡ o ⚡ o ⚡  " }
};


let currentTimeMode = "day";
let lastWeatherInfo = null;
let lastMusicCategory = "clear";

function getTimeMode(currentTime) {
  const hour = Number(currentTime?.split("T")[1]?.slice(0, 2));

  if (Number.isNaN(hour)) {
    return "day";
  }

  // 選択都市の現地時刻で判定する。Open-Meteoのtimezone:autoの時刻を使う。
  if (hour >= 18 || hour < 5) {
    return "night";
  }

  if (hour >= 5 && hour < 10) {
    return "morning";
  }

  if (hour >= 16 && hour < 18) {
    return "evening";
  }

  return "day";
}

function getTimeModeLabel(timeMode) {
  const labels = {
    morning: "朝",
    day: "昼",
    evening: "夕方",
    night: "夜"
  };

  return labels[timeMode] || "昼";
}

function getWeatherInfo(code) {
  return weatherCodeMap[code] || {
    name: `不明な天気コード: ${code}`,
    icon: "🌍",
    theme: "theme-cloudy",
    music: "cloudy",
    message: "未登録の天気コードです。weatherCodeMapを確認してください。",
    ascii: "   UNKNOWN\n   WEATHER\n   CODE"
  };
}


function getLargeWindowTimeKey(timeMode) {
  // 現在は昼 / 夜だけ。将来 evening を追加したくなったらここを変更します。
  return timeMode === "night" ? "night" : "day";
}

function getLargeWindowWeatherKey(weatherInfo) {
  // weatherInfo.music は clear / cloudy / rain / snow / storm と一致します。
  // 画像が未登録なら default にフォールバックします。
  return weatherInfo?.music || lastMusicCategory || "default";
}

function getLargeWindowBackgroundPath(city, weatherInfo, timeMode) {
  const backgrounds = city?.largeWindowBackgrounds || {};
  const weatherKey = getLargeWindowWeatherKey(weatherInfo);
  const timeKey = getLargeWindowTimeKey(timeMode);

  return (
    backgrounds[weatherKey]?.[timeKey] ||
    backgrounds[weatherKey]?.day ||
    backgrounds.default?.[timeKey] ||
    backgrounds.default?.day ||
    "assets/large-window/tokyo/default_day.png"
  );
}

function updateLargeWindowBackground(city, weatherInfo = lastWeatherInfo, timeMode = currentTimeMode) {
  if (!elements.largeWindowBackgroundImage || !city) return;

  const timeKey = getLargeWindowTimeKey(timeMode);
  const weatherKey = getLargeWindowWeatherKey(weatherInfo);
  const nextSrc = getLargeWindowBackgroundPath(city, weatherInfo, timeMode);

  if (elements.largeWindowBackgroundImage.getAttribute("src") !== nextSrc) {
    elements.largeWindowBackgroundImage.setAttribute("src", nextSrc);
  }

  elements.largeWindowBackgroundImage.setAttribute(
    "alt",
    `${getCityLabel(city)} の${timeKey === "night" ? "夜" : "昼"}背景`
  );

  if (elements.immersiveWindowScene) {
    elements.immersiveWindowScene.dataset.largeCity = city.id;
    elements.immersiveWindowScene.dataset.largeWeather = weatherKey;
    elements.immersiveWindowScene.dataset.largeTime = timeKey;
  }
}

function setTheme(theme, timeMode = currentTimeMode, selectedCity = cities[elements.citySelect?.value]) {
  const timeClass = `time-${timeMode}`;
  const sceneVariantClass = `scene-variant-${getCitySceneVariant(selectedCity)}`;

  if (elements.weatherTheme) {
    elements.weatherTheme.className = `position-weather console-card main-console ${theme} ${timeClass}`;
  }

  if (elements.sceneWindow) {
    elements.sceneWindow.className = `scene-window ${theme} ${timeClass} ${sceneVariantClass}`;
  }

  if (elements.immersiveWindowScene) {
    elements.immersiveWindowScene.className = `immersive-window-scene ${theme} ${timeClass}`;
  }

  updateLargeWindowBackground(selectedCity, lastWeatherInfo, timeMode);
}

function formatHourOnly(timeString) {
  const date = new Date(timeString);
  if (Number.isNaN(date.getTime())) {
    return timeString?.split("T")[1]?.slice(0, 5) ?? "--:--";
  }

  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function roundValue(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  return Number(value).toFixed(digits);
}

function formatHour(timeText) {
  return timeText?.split("T")[1]?.slice(0, 5) || "--:--";
}

function findStartIndex(hourlyTimes, currentTime) {
  if (currentTime) {
    const index = hourlyTimes.findIndex((timeText) => timeText >= currentTime);
    return index >= 0 ? index : 0;
  }
  return 0;
}


function renderHourly(hourly, currentTime) {
  if (!hourly?.time?.length) {
    elements.hourlyList.innerHTML = "<p class=\"empty-message\">予報データがありません。</p>";
    return;
  }

  const currentIndex = Math.max(0, hourly.time.findIndex((time) => time >= currentTime));
  const items = hourly.time.slice(currentIndex, currentIndex + 6).map((time, index) => {
    const absoluteIndex = currentIndex + index;
    const code = hourly.weather_code?.[absoluteIndex] ?? 0;
    const weatherInfo = getWeatherInfo(code);
    const temp = roundValue(hourly.temperature_2m?.[absoluteIndex] ?? "--", 1);
    const rainProb = hourly.precipitation_probability?.[absoluteIndex];
    const displayTime = formatHourOnly(time);

    return `
      <article class="hour-card">
        <div class="hour-time">${displayTime}</div>
        <div class="hour-icon">${weatherInfo.icon}</div>
        <div class="hour-temp">${temp}°C</div>
        <div class="hour-meta">${weatherInfo.name}</div>
        <div class="hour-meta">降水 ${rainProb ?? "--"}%</div>
      </article>
    `;
  });

  elements.hourlyList.innerHTML = items.join("");
}

async function fetchWeather() {
  const selectedCity = cities[elements.citySelect.value];

  if (!selectedCity) {
    setTheme("theme-error", currentTimeMode, selectedCity);
    elements.connectionStatus.textContent = "CITY ERROR";
    elements.statusText.textContent = "city not found";
    elements.petFace.textContent = "⚠️";
    elements.petMessage.textContent = "選択した都市IDがcityListに登録されているか確認してください。";
    writeLog(["city data was not found", "check cityList in app.js"]);
    return;
  }

  elements.connectionStatus.textContent = "FETCHING...";
  elements.statusText.textContent = "requesting API...";
  elements.cityName.textContent = getCityLabel(selectedCity);
  elements.reloadButton.disabled = true;
  elements.reloadButton.textContent = "RUNNING...";
  writeLog([
    `target city: ${getCityLabel(selectedCity)}`,
    "sending request to Open-Meteo API",
    `latitude: ${selectedCity.latitude}`,
    `longitude: ${selectedCity.longitude}`
  ]);

  const params = new URLSearchParams({
    latitude: selectedCity.latitude,
    longitude: selectedCity.longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    timezone: "auto",
    forecast_days: "1"
  });

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;
    const weatherInfo = getWeatherInfo(current.weather_code);

    currentTimeMode = getTimeMode(current.time);
    lastWeatherInfo = weatherInfo;
    lastMusicCategory = weatherInfo.music || "cloudy";
    setTheme(weatherInfo.theme, currentTimeMode, selectedCity);
    updateLargeWindowBackground(selectedCity, weatherInfo, currentTimeMode);
    elements.connectionStatus.textContent = `ONLINE / ${getTimeModeLabel(currentTimeMode)}`;
    elements.statusText.textContent = `local update: ${current.time.replace("T", " ")}`;
    elements.weatherName.textContent = weatherInfo.name;
    if (elements.windowModeCityText) elements.windowModeCityText.textContent = getCityLabel(selectedCity).toUpperCase();
    if (elements.windowModeWeatherText) elements.windowModeWeatherText.textContent = `${weatherInfo.name} / ${getTimeModeLabel(currentTimeMode)}`.toUpperCase();
    elements.temperature.textContent = roundValue(current.temperature_2m, 1);
    elements.apparentTemp.textContent = `${roundValue(current.apparent_temperature, 1)}℃`;
    elements.humidity.textContent = `${current.relative_humidity_2m ?? "--"}%`;
    elements.precipitation.textContent = `${roundValue(current.precipitation, 1)} mm`;
    elements.windSpeed.textContent = `${roundValue(current.wind_speed_10m, 1)} km/h`;
    elements.petFace.textContent = weatherInfo.icon;
    elements.petMessage.textContent = weatherInfo.message;
    if (elements.asciiArt) elements.asciiArt.textContent = weatherInfo.ascii;

    updateMusicMode(weatherInfo);
    renderHourly(data.hourly, current.time);
    document.dispatchEvent(new CustomEvent("weatherspot:weather-updated"));

    writeLog([
      "API response received",
      `weather code: ${current.weather_code}`,
      `weather: ${weatherInfo.name}`,
      `music mode: ${lastMusicCategory}`,
      `time mode: ${getTimeModeLabel(currentTimeMode)} / ${currentTimeMode}`,
      `temperature: ${roundValue(current.temperature_2m, 1)}℃`,
      `humidity: ${current.relative_humidity_2m ?? "--"}%`,
      "screen update completed"
    ]);

    if (elements.autoMusicSwitch.checked && getStoredAccessToken()) {
      await playWeatherBgm(false);
    }
  } catch (error) {
    console.error(error);
    setTheme("theme-error");
    elements.connectionStatus.textContent = "ERROR";
    elements.statusText.textContent = "request failed";
    elements.weatherName.textContent = "エラー";
    if (elements.windowModeCityText) elements.windowModeCityText.textContent = "SYSTEM";
    if (elements.windowModeWeatherText) elements.windowModeWeatherText.textContent = "ERROR";
    elements.temperature.textContent = "--";
    elements.apparentTemp.textContent = "--℃";
    elements.humidity.textContent = "--%";
    elements.precipitation.textContent = "-- mm";
    elements.windSpeed.textContent = "-- km/h";
    elements.petFace.textContent = "⚠️";
    elements.petMessage.textContent = "天気データを取得できませんでした。ネット接続やAPIのURLを確認してください。";
    if (elements.asciiArt) elements.asciiArt.textContent = "   ERROR\n   REQUEST\n   FAILED";
    elements.hourlyList.innerHTML = "<p>予報データを表示できませんでした。</p>";

    writeLog([
      "API request failed",
      String(error.message || error),
      "check internet connection or API URL"
    ]);
  } finally {
    elements.reloadButton.disabled = false;
    elements.reloadButton.textContent = "RUN WEATHER CHECK";
  }
}


