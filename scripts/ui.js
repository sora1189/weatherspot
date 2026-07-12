/* WeatherSpot: DOM, interactions, opening sequence, and initialization */

const playlistInputMap = {
  clear: "playlistClear",
  cloudy: "playlistCloudy",
  rain: "playlistRain",
  snow: "playlistSnow",
  storm: "playlistStorm"
};


/* ---------------- 3. DOM Elements ---------------- */

const elements = {
  citySelect: document.getElementById("citySelect"),
  cityList: document.getElementById("cityList"),
  customCitySelect: document.getElementById("customCitySelect"),
  customCitySelectButton: document.getElementById("customCitySelectButton"),
  customCitySelectMenu: document.getElementById("customCitySelectMenu"),
  customCitySelectIcon: document.getElementById("customCitySelectIcon"),
  customCitySelectName: document.getElementById("customCitySelectName"),
  customCitySelectMeta: document.getElementById("customCitySelectMeta"),
  reloadButton: document.getElementById("reloadButton"),
  connectionStatus: document.getElementById("connectionStatus"),
  weatherTheme: document.getElementById("weatherTheme"),
  statusText: document.getElementById("statusText"),
  cityName: document.getElementById("cityName"),
  weatherName: document.getElementById("weatherName"),
  temperature: document.getElementById("temperature"),
  apparentTemp: document.getElementById("apparentTemp"),
  humidity: document.getElementById("humidity"),
  precipitation: document.getElementById("precipitation"),
  windSpeed: document.getElementById("windSpeed"),
  petFace: document.getElementById("petFace"),
  petMessage: document.getElementById("petMessage"),
  asciiArt: document.getElementById("asciiArt"),
  sceneWindow: document.getElementById("sceneWindow"),
  immersiveWindowScene: document.getElementById("immersiveWindowScene"),
  largeWindowBackgroundImage: document.getElementById("largeWindowBackgroundImage"),
  windowModeCityText: document.getElementById("windowModeCityText"),
  windowModeWeatherText: document.getElementById("windowModeWeatherText"),
  introScreen: document.getElementById("introScreen"),
  loadingScreen: document.getElementById("loadingScreen"),
  loadingCode: document.getElementById("loadingCode"),
  appMenuLayer: document.getElementById("appMenuLayer"),
  floatingMenuButton: document.getElementById("floatingMenuButton"),
  hourlyList: document.getElementById("hourlyList"),
  systemLog: document.getElementById("systemLog"),
  spotifyClientId: document.getElementById("spotifyClientId"),
  spotifyRedirectUri: document.getElementById("spotifyRedirectUri"),
  saveSpotifyConfigButton: document.getElementById("saveSpotifyConfigButton"),
  spotifyLoginButton: document.getElementById("spotifyLoginButton"),
  spotifyLogoutButton: document.getElementById("spotifyLogoutButton"),
  initSpotifyPlayerButton: document.getElementById("initSpotifyPlayerButton"),
  playWeatherBgmButton: document.getElementById("playWeatherBgmButton"),
  pauseSpotifyButton: document.getElementById("pauseSpotifyButton"),
  resumeSpotifyButton: document.getElementById("resumeSpotifyButton"),
  previousTrackButton: document.getElementById("previousTrackButton"),
  nextTrackButton: document.getElementById("nextTrackButton"),
  repeatModeButton: document.getElementById("repeatModeButton"),
  shuffleButton: document.getElementById("shuffleButton"),
  autoMusicSwitch: document.getElementById("autoMusicSwitch"),
  spotifyStatus: document.getElementById("spotifyStatus"),
  musicModeText: document.getElementById("musicModeText"),
  spotifyLog: document.getElementById("spotifyLog"),
  openMusicDrawerButton: document.getElementById("openMusicDrawerButton"),
  closeMusicDrawerButton: document.getElementById("closeMusicDrawerButton"),
  windowOnlyModeButton: document.getElementById("windowOnlyModeButton"),
  musicDrawer: document.getElementById("musicDrawer"),
  musicDrawerBackdrop: document.getElementById("musicDrawerBackdrop"),
  drawerMusicModeText: document.getElementById("drawerMusicModeText"),
  playlistClear: document.getElementById("playlistClear"),
  playlistCloudy: document.getElementById("playlistCloudy"),
  playlistRain: document.getElementById("playlistRain"),
  playlistSnow: document.getElementById("playlistSnow"),
  playlistStorm: document.getElementById("playlistStorm"),
  savePlaylistSettingsButton: document.getElementById("savePlaylistSettingsButton"),
  resetPlaylistSettingsButton: document.getElementById("resetPlaylistSettingsButton")
};


function getCityLabel(city) {
  return `${city.name} / ${city.country}`;
}

function getCitySceneVariant(city) {
  return city?.sceneVariant === "rural" ? "rural" : "urban";
}

function getCitySceneIcon(city) {
  return getCitySceneVariant(city) === "rural" ? "🌲" : "🏙";
}

function getCitySceneLabel(city) {
  return getCitySceneVariant(city) === "rural" ? "rural weather scene" : "urban weather scene";
}

function updateCustomCitySelect(selectedCityId) {
  const selectedCity = cities[selectedCityId] || cities[DEFAULT_CITY_ID];
  if (!selectedCity) return;

  if (elements.citySelect) {
    elements.citySelect.value = selectedCity.id;
  }

  if (elements.customCitySelectIcon) {
    elements.customCitySelectIcon.textContent = getCitySceneIcon(selectedCity);
  }

  if (elements.customCitySelectName) {
    elements.customCitySelectName.textContent = getCityLabel(selectedCity);
  }

  if (elements.customCitySelectMeta) {
    elements.customCitySelectMeta.textContent = getCitySceneLabel(selectedCity);
  }

  if (elements.customCitySelectMenu) {
    elements.customCitySelectMenu.querySelectorAll(".custom-city-option").forEach((button) => {
      const isSelected = button.dataset.cityId === selectedCity.id;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-selected", String(isSelected));
    });
  }
}

function closeCustomCitySelect() {
  if (!elements.customCitySelect || !elements.customCitySelectButton) return;

  elements.customCitySelect.classList.remove("is-open");
  elements.customCitySelectButton.setAttribute("aria-expanded", "false");
}

function openCustomCitySelect() {
  if (!elements.customCitySelect || !elements.customCitySelectButton) return;

  elements.customCitySelect.classList.add("is-open");
  elements.customCitySelectButton.setAttribute("aria-expanded", "true");
}

function toggleCustomCitySelect(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!elements.customCitySelect) return;

  if (elements.customCitySelect.classList.contains("is-open")) {
    closeCustomCitySelect();
  } else {
    openCustomCitySelect();
  }
}

function selectCustomCity(cityId) {
  if (!cities[cityId] || !elements.citySelect) return;

  updateCustomCitySelect(cityId);
  closeCustomCitySelect();

  // 既存の天気取得処理をそのまま使うため、hidden selectのchangeを発火する
  elements.citySelect.dispatchEvent(new Event("change", { bubbles: true }));
}

function createCityOptions() {
  if (!elements.citySelect) return;

  elements.citySelect.innerHTML = "";

  if (elements.cityList) {
    elements.cityList.innerHTML = "";
  }

  if (elements.customCitySelectMenu) {
    elements.customCitySelectMenu.innerHTML = "";
  }

  cityList.forEach((city) => {
    const option = document.createElement("option");
    option.value = city.id;
    option.textContent = getCityLabel(city);
    elements.citySelect.appendChild(option);

    if (elements.cityList) {
      const li = document.createElement("li");
      li.textContent = `${city.name} [${city.latitude}, ${city.longitude}]`;
      elements.cityList.appendChild(li);
    }

    if (elements.customCitySelectMenu) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "custom-city-option";
      button.dataset.cityId = city.id;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", "false");
      button.innerHTML = `
        <span class="custom-city-option-icon" aria-hidden="true">${getCitySceneIcon(city)}</span>
        <span class="custom-city-option-text">
          <strong>${getCityLabel(city)}</strong>
          <small>${getCitySceneLabel(city)}</small>
        </span>
      `;
      button.addEventListener("click", () => selectCustomCity(city.id));
      elements.customCitySelectMenu.appendChild(button);
    }
  });

  updateCustomCitySelect(DEFAULT_CITY_ID);
}



function writeLog(lines) {
  elements.systemLog.textContent = lines.map((line) => `> ${line}`).join("\n");
}

function writeSpotifyLog(lines) {
  elements.spotifyLog.textContent = lines.map((line) => `> ${line}`).join("\n");
}


function openMusicDrawer(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!elements.musicDrawer || !elements.musicDrawerBackdrop) return;

  elements.musicDrawer.classList.add("is-open");
  elements.musicDrawerBackdrop.classList.add("is-open");
  elements.musicDrawer.setAttribute("aria-hidden", "false");
  showFloatingMenuButton();
  clearTimeout(idleMenuTimer);
}

function closeMusicDrawer(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!elements.musicDrawer || !elements.musicDrawerBackdrop) return;

  elements.musicDrawer.classList.remove("is-open");
  elements.musicDrawerBackdrop.classList.remove("is-open");
  elements.musicDrawer.setAttribute("aria-hidden", "true");
  resetMenuIdleTimer();
}

function startOpeningSequence() {
  const codeLines = [
    "<div class=\"wrapper\">",
    "  <div class=\"wrapper__text\">",
    "    WeatherSpot Terminal",
    "  </div>",
    "</div>",
    "",
    "<main class=\"terminal-app position-layout-site\">",
    "  <section class=\"position-dashboard\">",
    "    <section class=\"position-city\">",
    "      <select id=\"citySelect\"></select>",
    "      <button id=\"reloadButton\">RUN WEATHER CHECK</button>",
    "    </section>",
    "    <section class=\"position-window\">",
    "      <div class=\"scene-window\" id=\"sceneWindow\"></div>",
    "    </section>",
    "    <section class=\"position-weather\" id=\"weatherTheme\">",
    "      <h2 id=\"cityName\">Tokyo</h2>",
    "      <strong id=\"temperature\">--</strong>",
    "    </section>",
    "    <section class=\"position-forecast\">",
    "      <div id=\"hourlyList\"></div>",
    "    </section>",
    "  </section>",
    "</main>",
    "",
    "const selectedCity = cities[elements.citySelect.value];",
    "const response = await fetch(openMeteoUrl);",
    "const data = await response.json();",
    "const weatherInfo = getWeatherInfo(data.current.weather_code);",
    "setTheme(weatherInfo.theme, getTimeMode(data.current.time));",
    "renderHourly(data.hourly, data.current.time);",
    "system.ready = true;"
  ];

  const titleDuration = 1800;
  const loadingDuration = 3000;

  if (elements.loadingCode) {
    elements.loadingCode.textContent = "";
  }

  if (elements.loadingScreen) {
    elements.loadingScreen.classList.remove("is-hidden");
    elements.loadingScreen.setAttribute("aria-hidden", "true");
  }

  window.setTimeout(() => {
    if (elements.loadingScreen) {
      elements.loadingScreen.setAttribute("aria-hidden", "false");
    }

    if (elements.introScreen) {
      elements.introScreen.classList.add("is-hidden");
    }

    let index = 0;
    const timer = window.setInterval(() => {
      if (!elements.loadingCode) return;

      const visibleLines = codeLines.slice(0, index + 1).slice(-20);
      elements.loadingCode.textContent = visibleLines.join("\n");
      index += 1;

      if (index >= codeLines.length) {
        index = 0;
      }
    }, 90);

    window.setTimeout(() => {
      window.clearInterval(timer);

      document.body.classList.remove("is-booting");

      if (elements.loadingScreen) {
        elements.loadingScreen.classList.add("is-hidden");
        elements.loadingScreen.setAttribute("aria-hidden", "true");
      }

      if (elements.floatingMenuButton) {
        showFloatingMenuButton();
        resetMenuIdleTimer();
      }
    }, loadingDuration);
  }, titleDuration);
}

/* ---------------- 5. Menu / Window Mode ---------------- */

let idleMenuTimer = null;

function showFloatingMenuButton() {
  if (!elements.floatingMenuButton) return;
  elements.floatingMenuButton.classList.remove("is-idle-hidden");
}

function resetMenuIdleTimer() {
  showFloatingMenuButton();
  clearTimeout(idleMenuTimer);

  // 5秒間操作がなければ、通常画面でも窓枠モードでもMENUボタンを隠す
  idleMenuTimer = setTimeout(() => {
    if (!elements.musicDrawer?.classList.contains("is-open")) {
      elements.floatingMenuButton?.classList.add("is-idle-hidden");
    }
  }, 5000);
}

function initIdleMenuButton() {
  ["pointermove", "pointerdown", "mousemove", "mousedown", "keydown", "touchstart", "scroll"].forEach((eventName) => {
    document.addEventListener(eventName, resetMenuIdleTimer, { passive: true });
  });
  resetMenuIdleTimer();
}

function isWindowOnlyModeEnabled() {
  return localStorage.getItem("window_only_mode") === "true";
}

function applyWindowOnlyMode(enabled) {
  document.body.classList.toggle("window-only-mode", enabled);

  if (enabled) {
    updateLargeWindowBackground(cities[elements.citySelect?.value], lastWeatherInfo, currentTimeMode);
  }

  if (elements.immersiveWindowScene) {
    elements.immersiveWindowScene.setAttribute("aria-hidden", String(!enabled));
  }

  if (elements.windowOnlyModeButton) {
    elements.windowOnlyModeButton.textContent = enabled ? "窓枠モード: ON" : "窓枠モード: OFF";
  }

  showFloatingMenuButton();

  if (enabled) {
    clearTimeout(idleMenuTimer);
  } else {
    resetMenuIdleTimer();
  }
}

function toggleWindowOnlyMode() {
  const next = !document.body.classList.contains("window-only-mode");
  localStorage.setItem("window_only_mode", String(next));
  applyWindowOnlyMode(next);

  if (next) {
    closeMusicDrawer();
    showFloatingMenuButton();
    resetMenuIdleTimer();
  }
}

function bindMenuEvents() {
  if (!elements.floatingMenuButton) return;

  const openHandler = (event) => openMusicDrawer(event);

  // clickが背面レイヤーに奪われる環境でも反応するよう、pointerdownも使う
  elements.floatingMenuButton.addEventListener("pointerdown", openHandler, { capture: true });
  elements.floatingMenuButton.addEventListener("click", openHandler, { capture: true });

  if (elements.openMusicDrawerButton) {
    elements.openMusicDrawerButton.addEventListener("click", openMusicDrawer);
  }

  elements.closeMusicDrawerButton.addEventListener("click", closeMusicDrawer);
  elements.musicDrawerBackdrop.addEventListener("click", closeMusicDrawer);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMusicDrawer(event);
  });
}

function resetWindowOnlyModeOnStartup() {
  // 起動時は必ず通常のメイン画面から始める
  localStorage.setItem("window_only_mode", "false");
  document.body.classList.remove("window-only-mode");

  if (elements.immersiveWindowScene) {
    elements.immersiveWindowScene.setAttribute("aria-hidden", "true");
  }

  if (elements.windowOnlyModeButton) {
    elements.windowOnlyModeButton.textContent = "窓枠モード: OFF";
  }
}


/* ---------------- 8. Initialization ---------------- */

function bindIfExists(element, eventName, handler) {
  if (element) element.addEventListener(eventName, handler);
}


function bindCustomCitySelectEvents() {
  if (!elements.customCitySelectButton || !elements.customCitySelectMenu) return;

  elements.customCitySelectButton.addEventListener("click", toggleCustomCitySelect);

  elements.customCitySelectButton.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
      event.preventDefault();
      openCustomCitySelect();

      const selected = elements.customCitySelectMenu.querySelector(".custom-city-option.is-selected");
      const first = elements.customCitySelectMenu.querySelector(".custom-city-option");
      (selected || first)?.focus();
    }
  });

  elements.customCitySelectMenu.addEventListener("keydown", (event) => {
    const options = Array.from(elements.customCitySelectMenu.querySelectorAll(".custom-city-option"));
    const currentIndex = options.indexOf(document.activeElement);

    if (event.key === "Escape") {
      event.preventDefault();
      closeCustomCitySelect();
      elements.customCitySelectButton.focus();
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      options[Math.min(currentIndex + 1, options.length - 1)]?.focus();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      options[Math.max(currentIndex - 1, 0)]?.focus();
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      document.activeElement?.click();
    }
  });

  document.addEventListener("click", (event) => {
    if (!elements.customCitySelect?.contains(event.target)) {
      closeCustomCitySelect();
    }
  });
}

function bindWeatherEvents() {
  bindCustomCitySelectEvents();
  bindIfExists(elements.citySelect, "change", fetchWeather);
  bindIfExists(elements.reloadButton, "click", fetchWeather);
}

function bindSpotifyEvents() {
  // 旧バージョン互換の保存ボタンが存在する場合だけ接続します。
  bindIfExists(elements.saveSpotifyConfigButton, "click", saveSpotifyConfig);

  bindIfExists(elements.spotifyLoginButton, "click", startSpotifyLogin);
  bindIfExists(elements.spotifyLogoutButton, "click", logoutSpotify);
  bindIfExists(elements.initSpotifyPlayerButton, "click", initSpotifyPlayer);
  bindIfExists(elements.playWeatherBgmButton, "click", () => playWeatherBgm(true));
  bindIfExists(elements.pauseSpotifyButton, "click", pauseSpotify);
  bindIfExists(elements.resumeSpotifyButton, "click", resumeSpotify);
  bindIfExists(elements.previousTrackButton, "click", previousTrack);
  bindIfExists(elements.nextTrackButton, "click", nextTrack);
  bindIfExists(elements.repeatModeButton, "click", cycleRepeatMode);
  bindIfExists(elements.shuffleButton, "click", toggleShuffle);
  bindIfExists(elements.autoMusicSwitch, "change", saveSpotifyConfig);
}

function bindViewEvents() {
  bindMenuEvents();
  bindIfExists(elements.windowOnlyModeButton, "click", toggleWindowOnlyMode);
}

function bindPlaylistEvents() {
  bindIfExists(elements.savePlaylistSettingsButton, "click", savePlaylistSettings);
  bindIfExists(elements.resetPlaylistSettingsButton, "click", resetPlaylistSettings);
}

function bindAppEvents() {
  bindWeatherEvents();
  bindSpotifyEvents();
  bindViewEvents();
  bindPlaylistEvents();
}

function initializeApp() {
  createCityOptions();
  loadSpotifyConfig();
  loadPlaylistSettingsToInputs();

  resetWindowOnlyModeOnStartup();
  applyWindowOnlyMode(false);

  // Spotifyログイン後に戻ってきた場合だけ認証コードを処理します。
  handleSpotifyCallback();

  bindAppEvents();
  startOpeningSequence();
  initIdleMenuButton();
  fetchWeather();

  if (getStoredAccessToken() && elements.spotifyStatus) {
    elements.spotifyStatus.textContent = "logged in";
    writeSpotifyLog(["access token found", "天気BGMを再生できます"]);
  }
}

initializeApp();
