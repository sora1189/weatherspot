/* WeatherSpot: DOM, interactions, opening sequence, and initialization */

const playlistInputMap = {
  clear: "playlistClear",
  cloudy: "playlistCloudy",
  rain: "playlistRain",
  snow: "playlistSnow",
  storm: "playlistStorm"
};

let pendingShareDraft = null;
let lastShareConfirmFocus = null;
let lastLiveFeedFocus = null;
let cloudTimelineRequestId = 0;
let pendingReportPostId = null;
let lastReportDialogFocus = null;
let adminAccessToken = "";
let lastAdminPanelFocus = null;


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
  gifLoadingScreen: document.getElementById("gifLoadingScreen"),
  gifLoadingProgress: document.getElementById("gifLoadingProgress"),
  gifLoadingPercent: document.getElementById("gifLoadingPercent"),
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
  getCurrentTrackButton: document.getElementById("getCurrentTrackButton"),
  currentTrackImage: document.getElementById("currentTrackImage"),
  currentTrackPlaceholder: document.getElementById("currentTrackPlaceholder"),
  currentTrackTitle: document.getElementById("currentTrackTitle"),
  currentTrackArtist: document.getElementById("currentTrackArtist"),
  currentTrackPlaybackState: document.getElementById("currentTrackPlaybackState"),
  currentTrackSpotifyLink: document.getElementById("currentTrackSpotifyLink"),
  shareDiaryForm: document.getElementById("shareDiaryForm"),
  shareNameInput: document.getElementById("shareNameInput"),
  shareMessageInput: document.getElementById("shareMessageInput"),
  shareMessageCounter: document.getElementById("shareMessageCounter"),
  shareCityPreview: document.getElementById("shareCityPreview"),
  shareWeatherPreview: document.getElementById("shareWeatherPreview"),
  shareTrackPreview: document.getElementById("shareTrackPreview"),
  shareArtistPreview: document.getElementById("shareArtistPreview"),
  prepareShareButton: document.getElementById("prepareShareButton"),
  shareFormStatus: document.getElementById("shareFormStatus"),
  cloudApiStatus: document.getElementById("cloudApiStatus"),
  cloudTimelineCount: document.getElementById("cloudTimelineCount"),
  cloudTimelineStatus: document.getElementById("cloudTimelineStatus"),
  cloudTimelineList: document.getElementById("cloudTimelineList"),
  refreshCloudTimelineButton: document.getElementById("refreshCloudTimelineButton"),
  liveFeedButton: document.getElementById("liveFeedButton"),
  liveFeedBadge: document.getElementById("liveFeedBadge"),
  liveFeedPanel: document.getElementById("liveFeedPanel"),
  closeLiveFeedButton: document.getElementById("closeLiveFeedButton"),
  reportDialogLayer: document.getElementById("reportDialogLayer"),
  reportDialogBackdrop: document.getElementById("reportDialogBackdrop"),
  reportDialog: document.getElementById("reportDialog"),
  reportReasonSelect: document.getElementById("reportReasonSelect"),
  reportDialogStatus: document.getElementById("reportDialogStatus"),
  cancelReportButton: document.getElementById("cancelReportButton"),
  submitReportButton: document.getElementById("submitReportButton"),
  openAdminPanelButton: document.getElementById("openAdminPanelButton"),
  adminPanelLayer: document.getElementById("adminPanelLayer"),
  adminPanelBackdrop: document.getElementById("adminPanelBackdrop"),
  adminPanel: document.getElementById("adminPanel"),
  closeAdminPanelButton: document.getElementById("closeAdminPanelButton"),
  adminLoginView: document.getElementById("adminLoginView"),
  adminKeyInput: document.getElementById("adminKeyInput"),
  adminLoginButton: document.getElementById("adminLoginButton"),
  adminReportsView: document.getElementById("adminReportsView"),
  adminReportCount: document.getElementById("adminReportCount"),
  adminReportList: document.getElementById("adminReportList"),
  refreshAdminReportsButton: document.getElementById("refreshAdminReportsButton"),
  adminLogoutButton: document.getElementById("adminLogoutButton"),
  adminPanelStatus: document.getElementById("adminPanelStatus"),
  shareConfirmLayer: document.getElementById("shareConfirmLayer"),
  shareConfirmBackdrop: document.getElementById("shareConfirmBackdrop"),
  shareConfirmDialog: document.getElementById("shareConfirmDialog"),
  confirmShareName: document.getElementById("confirmShareName"),
  confirmShareMessage: document.getElementById("confirmShareMessage"),
  confirmShareCity: document.getElementById("confirmShareCity"),
  confirmShareWeather: document.getElementById("confirmShareWeather"),
  confirmShareTrack: document.getElementById("confirmShareTrack"),
  confirmShareArtist: document.getElementById("confirmShareArtist"),
  cancelShareConfirmButton: document.getElementById("cancelShareConfirmButton"),
  publishShareButton: document.getElementById("publishShareButton"),
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

const drawerTabButtons = Array.from(document.querySelectorAll("[data-drawer-tab]"));
const drawerTabPanels = Array.from(document.querySelectorAll(".drawer-tab-panel"));


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


function setActiveDrawerTab(tabName, { focus = false } = {}) {
  const activeButton = drawerTabButtons.find((button) => button.dataset.drawerTab === tabName);
  if (!activeButton) return;

  drawerTabButtons.forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  drawerTabPanels.forEach((panel) => {
    const isActive = panel.id === activeButton.getAttribute("aria-controls");
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });

  if (elements.musicDrawer) elements.musicDrawer.scrollTop = 0;
  if (focus) activeButton.focus();
}

function handleDrawerTabKeydown(event) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

  event.preventDefault();
  const currentIndex = drawerTabButtons.indexOf(event.currentTarget);
  let nextIndex = currentIndex;

  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % drawerTabButtons.length;
  if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + drawerTabButtons.length) % drawerTabButtons.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = drawerTabButtons.length - 1;

  setActiveDrawerTab(drawerTabButtons[nextIndex].dataset.drawerTab, { focus: true });
}

function openMusicDrawer(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!elements.musicDrawer || !elements.musicDrawerBackdrop) return;

  closeLiveFeed(null, { restoreFocus: false });
  elements.musicDrawer.classList.add("is-open");
  elements.musicDrawerBackdrop.classList.add("is-open");
  elements.musicDrawer.setAttribute("aria-hidden", "false");
  setActiveDrawerTab(document.body.classList.contains("window-only-mode") ? "settings" : "share");
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

function openLiveFeed(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!elements.liveFeedPanel || !elements.liveFeedButton) return;

  closeMusicDrawer();
  lastLiveFeedFocus = document.activeElement;
  elements.liveFeedPanel.classList.add("is-open");
  elements.liveFeedPanel.setAttribute("aria-hidden", "false");
  elements.liveFeedButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("live-feed-open");
  refreshCloudDiaryTimeline({ announce: false });
  elements.closeLiveFeedButton?.focus();
}

function closeLiveFeed(event, { restoreFocus = true } = {}) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!elements.liveFeedPanel || !elements.liveFeedButton) return;

  const wasOpen = elements.liveFeedPanel.classList.contains("is-open");
  elements.liveFeedPanel.classList.remove("is-open");
  elements.liveFeedPanel.setAttribute("aria-hidden", "true");
  elements.liveFeedButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("live-feed-open");

  if (wasOpen && restoreFocus && lastLiveFeedFocus instanceof HTMLElement) {
    lastLiveFeedFocus.focus();
  }

  lastLiveFeedFocus = null;
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
  const gifLoadingDuration = 3400;
  const gifFadeDuration = 1100;

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

      if (elements.loadingScreen) {
        elements.loadingScreen.classList.add("is-hidden");
        elements.loadingScreen.setAttribute("aria-hidden", "true");
      }

      if (!elements.gifLoadingScreen) {
        document.body.classList.remove("is-booting");
        showFloatingMenuButton();
        resetMenuIdleTimer();
        return;
      }

      elements.gifLoadingScreen.classList.remove("is-leaving", "is-active");
      elements.gifLoadingScreen.setAttribute("aria-hidden", "false");
      elements.gifLoadingProgress?.setAttribute("aria-valuenow", "0");
      if (elements.gifLoadingPercent) elements.gifLoadingPercent.textContent = "0%";

      window.requestAnimationFrame(() => {
        elements.gifLoadingScreen?.classList.add("is-active");
      });

      const gifStartedAt = performance.now();
      const progressTimer = window.setInterval(() => {
        const elapsed = performance.now() - gifStartedAt;
        const progress = Math.min(100, Math.round((elapsed / gifLoadingDuration) * 100));
        elements.gifLoadingProgress?.setAttribute("aria-valuenow", String(progress));
        if (elements.gifLoadingPercent) elements.gifLoadingPercent.textContent = `${progress}%`;
      }, 80);

      window.setTimeout(() => {
        window.clearInterval(progressTimer);
        elements.gifLoadingProgress?.setAttribute("aria-valuenow", "100");
        if (elements.gifLoadingPercent) elements.gifLoadingPercent.textContent = "100%";
        document.body.classList.remove("is-booting");
        elements.gifLoadingScreen?.classList.add("is-leaving");

        window.setTimeout(() => {
          elements.gifLoadingScreen?.classList.remove("is-active", "is-leaving");
          elements.gifLoadingScreen?.setAttribute("aria-hidden", "true");
          showFloatingMenuButton();
          resetMenuIdleTimer();
        }, gifFadeDuration);
      }, gifLoadingDuration);
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
    closeLiveFeed(null, { restoreFocus: false });
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

  bindIfExists(elements.liveFeedButton, "click", openLiveFeed);
  bindIfExists(elements.closeLiveFeedButton, "click", closeLiveFeed);

  elements.closeMusicDrawerButton.addEventListener("click", closeMusicDrawer);
  elements.musicDrawerBackdrop.addEventListener("click", closeMusicDrawer);

  drawerTabButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveDrawerTab(button.dataset.drawerTab));
    button.addEventListener("keydown", handleDrawerTabKeydown);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (elements.adminPanelLayer && !elements.adminPanelLayer.hidden) {
      closeAdminPanel(event);
      return;
    }

    if (elements.reportDialogLayer && !elements.reportDialogLayer.hidden) {
      closeReportDialog(event);
      return;
    }

    if (elements.shareConfirmLayer && !elements.shareConfirmLayer.hidden) {
      closeShareConfirmDialog(event);
      return;
    }

    if (elements.liveFeedPanel?.classList.contains("is-open")) {
      closeLiveFeed(event);
      return;
    }

    closeMusicDrawer(event);
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

/* ---------------- 7. Cloud Weather Diary / Phase 05 ---------------- */

function limitTextByCharacters(value, maxLength) {
  return Array.from(value).slice(0, maxLength).join("");
}

function getCurrentShareContext() {
  const selectedCity = cities[elements.citySelect?.value] || cities[DEFAULT_CITY_ID];

  return {
    cityId: selectedCity?.id || "",
    city: selectedCity ? getCityLabel(selectedCity) : "--",
    weather: lastWeatherInfo?.name || "--",
    track: currentPlayingTrack
      ? {
          id: currentPlayingTrack.id,
          title: currentPlayingTrack.title,
          artist: currentPlayingTrack.artist,
          imageUrl: currentPlayingTrack.imageUrl,
          spotifyUrl: currentPlayingTrack.spotifyUrl
        }
      : null
  };
}

function getShareFormValidation() {
  const name = elements.shareNameInput?.value.trim() || "";
  const message = elements.shareMessageInput?.value.trim() || "";
  const context = getCurrentShareContext();
  const valid = Boolean(name && message && lastWeatherInfo && context.cityId);

  return { name, message, context, valid };
}

function updateShareContextPreview() {
  if (!elements.shareDiaryForm) return;

  const context = getCurrentShareContext();
  elements.shareCityPreview.textContent = context.city;
  elements.shareWeatherPreview.textContent = context.weather;
  elements.shareTrackPreview.textContent = context.track?.title || "曲なしで投稿できます";
  elements.shareArtistPreview.textContent = context.track?.artist || "OPTIONAL";
  updateShareFormState();
}

function updateShareFormState() {
  if (!elements.shareDiaryForm) return;

  const messageLength = Array.from(elements.shareMessageInput?.value || "").length;
  elements.shareMessageCounter.textContent = `${messageLength} / 30`;

  const validation = getShareFormValidation();
  elements.prepareShareButton.disabled = !validation.valid;
  elements.shareFormStatus.classList.remove("is-ready", "is-error");

  if (!validation.name || !validation.message) {
    elements.shareFormStatus.textContent = "名前とひとことを入力してください。";
  } else if (!lastWeatherInfo) {
    elements.shareFormStatus.textContent = "天気情報の取得を待っています。";
  } else {
    elements.shareFormStatus.textContent = validation.context.track
      ? "曲と一緒に投稿内容を確認できます。"
      : "曲なしで投稿内容を確認できます。";
    elements.shareFormStatus.classList.add("is-ready");
  }
}

function createTimelineTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = String(text || "--");
  return element;
}

function getSafeTimelineUrl(value, allowedHost) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" && url.hostname === allowedHost ? url.toString() : "";
  } catch {
    return "";
  }
}

function formatTimelineDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "日時不明";

  return date.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function createCloudTimelineCard(post) {
  const article = document.createElement("article");
  article.className = "cloud-timeline-card";
  article.setAttribute("aria-label", `${post?.name || "匿名"}さんの投稿`);

  const imageUrl = getSafeTimelineUrl(post?.track?.imageUrl, "i.scdn.co");
  if (imageUrl) {
    const image = document.createElement("img");
    image.className = "cloud-timeline-avatar";
    image.src = imageUrl;
    image.alt = `${post?.track?.title || "再生中の曲"}のジャケット`;
    image.loading = "lazy";
    image.width = 40;
    image.height = 40;
    image.style.width = "40px";
    image.style.height = "40px";
    image.style.maxWidth = "40px";
    image.style.aspectRatio = "1 / 1";
    image.style.objectFit = "cover";
    article.appendChild(image);
  } else {
    article.appendChild(createTimelineTextElement(
      "span",
      "cloud-timeline-avatar is-placeholder",
      post?.track?.title ? "♪" : "☁"
    ));
  }

  const body = document.createElement("div");
  body.className = "cloud-timeline-body";

  const header = document.createElement("header");
  const identity = document.createElement("p");
  identity.className = "cloud-timeline-identity";
  identity.append(
    createTimelineTextElement("strong", "cloud-timeline-name", post?.name || "匿名"),
    createTimelineTextElement("span", "cloud-timeline-handle", `@${post?.cityId || "weather"}`)
  );

  const time = createTimelineTextElement("time", "cloud-timeline-time", formatTimelineDate(post?.createdAt));
  if (post?.createdAt) time.dateTime = post.createdAt;
  header.append(identity, time);

  const message = createTimelineTextElement("p", "cloud-timeline-message", post?.message || "--");

  const context = document.createElement("p");
  context.className = "cloud-timeline-context";
  context.append(
    createTimelineTextElement("span", "cloud-timeline-weather", post?.weather || "天気不明"),
    document.createTextNode(" · "),
    createTimelineTextElement("span", "cloud-timeline-city", post?.city || "都市不明")
  );

  let track = null;
  if (post?.track?.title) {
    track = document.createElement("div");
    track.className = "cloud-timeline-track";
    const spotifyUrl = getSafeTimelineUrl(post.track.spotifyUrl, "open.spotify.com");
    const trackText = `${post.track.title} / ${post.track.artist || "アーティスト不明"}`;
    const trackTitle = createTimelineTextElement(
      spotifyUrl ? "a" : "strong",
      "cloud-timeline-track-title",
      trackText
    );

    if (spotifyUrl && trackTitle instanceof HTMLAnchorElement) {
      trackTitle.href = spotifyUrl;
      trackTitle.target = "_blank";
      trackTitle.rel = "noopener noreferrer";
    }

    track.append(
      createTimelineTextElement("span", "cloud-timeline-now-playing", "NOW PLAYING"),
      trackTitle
    );
  }

  const actions = document.createElement("div");
  actions.className = "cloud-timeline-actions";
  const alreadyReported = hasLocallyReportedPost(post?.id);
  const reportButton = createTimelineTextElement(
    "button",
    "cloud-timeline-report-button",
    alreadyReported ? "通報済み" : "通報"
  );
  reportButton.type = "button";
  reportButton.dataset.postId = String(post?.id || "");
  reportButton.disabled = !post?.id || alreadyReported;
  reportButton.setAttribute("aria-label", `${post?.name || "匿名"}さんの投稿を通報`);
  reportButton.addEventListener("click", () => openReportDialog(post.id, reportButton));
  actions.appendChild(reportButton);

  body.append(header, message, context);
  if (track) body.appendChild(track);
  body.appendChild(actions);
  article.appendChild(body);
  return article;
}

function openReportDialog(postId, trigger) {
  if (!elements.reportDialogLayer || !postId) return;

  pendingReportPostId = String(postId);
  lastReportDialogFocus = trigger || document.activeElement;
  elements.reportReasonSelect.value = "abuse";
  elements.reportDialogStatus.textContent = "";
  elements.reportDialogLayer.hidden = false;
  document.body.classList.add("report-dialog-open");
  elements.reportReasonSelect.focus();
}

function closeReportDialog(event, { restoreFocus = true } = {}) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!elements.reportDialogLayer || elements.reportDialogLayer.hidden) return;

  elements.reportDialogLayer.hidden = true;
  document.body.classList.remove("report-dialog-open");
  pendingReportPostId = null;

  if (restoreFocus && lastReportDialogFocus instanceof HTMLElement) {
    lastReportDialogFocus.focus();
  }

  lastReportDialogFocus = null;
}

async function submitPendingReport() {
  if (!pendingReportPostId || !elements.reportReasonSelect) return;

  const postId = pendingReportPostId;
  const reason = elements.reportReasonSelect.value;
  elements.submitReportButton.disabled = true;
  elements.submitReportButton.textContent = "送信中...";
  elements.reportDialogStatus.textContent = "Azureへ通報を送信しています。";

  try {
    await reportCloudDiaryPost(postId, reason, getOrCreateDiaryReporterId());
    rememberLocallyReportedPost(postId);

    document.querySelectorAll(".cloud-timeline-report-button").forEach((button) => {
      if (button.dataset.postId === postId) {
        button.disabled = true;
        button.textContent = "通報済み";
      }
    });

    elements.cloudTimelineStatus.textContent = "通報を受け付けました。管理者が内容を確認します。";
    closeReportDialog(null, { restoreFocus: false });
  } catch (error) {
    elements.reportDialogStatus.textContent = `通報を送信できませんでした。${error.message}`;
    if (error.status === 404) refreshCloudDiaryTimeline({ announce: false });
  } finally {
    elements.submitReportButton.disabled = false;
    elements.submitReportButton.textContent = "通報を送信";
  }
}

function handleReportDialogKeydown(event) {
  if (event.key !== "Tab") return;

  const focusable = [elements.reportReasonSelect, elements.cancelReportButton, elements.submitReportButton]
    .filter((element) => element && !element.disabled);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

const adminReportReasonLabels = Object.freeze({
  abuse: "誹謗中傷",
  sexual: "卑猥な内容",
  spam: "スパム",
  other: "その他"
});

function openAdminPanel(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (!elements.adminPanelLayer) return;

  lastAdminPanelFocus = document.activeElement;
  closeMusicDrawer();
  closeLiveFeed(null, { restoreFocus: false });
  elements.adminPanelLayer.hidden = false;
  document.body.classList.add("admin-panel-open");
  elements.adminPanelStatus.textContent = "管理者キーを入力してください。";
  elements.adminKeyInput?.focus();
}

function logoutAdmin({ message = "管理者モードを終了しました。" } = {}) {
  adminAccessToken = "";
  if (elements.adminKeyInput) elements.adminKeyInput.value = "";
  if (elements.adminLoginView) elements.adminLoginView.hidden = false;
  if (elements.adminReportsView) elements.adminReportsView.hidden = true;
  if (elements.adminReportList) elements.adminReportList.replaceChildren();
  if (elements.adminPanelStatus) elements.adminPanelStatus.textContent = message;
  elements.adminKeyInput?.focus();
}

function closeAdminPanel(event, { restoreFocus = true } = {}) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (!elements.adminPanelLayer || elements.adminPanelLayer.hidden) return;

  elements.adminPanelLayer.hidden = true;
  document.body.classList.remove("admin-panel-open");
  adminAccessToken = "";
  if (elements.adminKeyInput) elements.adminKeyInput.value = "";
  if (elements.adminLoginView) elements.adminLoginView.hidden = false;
  if (elements.adminReportsView) elements.adminReportsView.hidden = true;
  if (elements.adminReportList) elements.adminReportList.replaceChildren();

  if (restoreFocus && lastAdminPanelFocus instanceof HTMLElement) lastAdminPanelFocus.focus();
  lastAdminPanelFocus = null;
}

function renderAdminReports(items) {
  if (!elements.adminReportList) return;
  const reports = Array.isArray(items) ? items : [];
  elements.adminReportList.replaceChildren();
  elements.adminReportCount.textContent = `${reports.length} REPORTS`;

  if (!reports.length) {
    elements.adminReportList.appendChild(
      createTimelineTextElement("p", "admin-report-empty", "現在、確認が必要な通報はありません。")
    );
    return;
  }

  const fragment = document.createDocumentFragment();
  reports.forEach((item) => {
    const card = document.createElement("article");
    card.className = "admin-report-card";

    const header = document.createElement("header");
    const identity = item.post
      ? `${item.post.name || "匿名"} @${item.post.cityId || "weather"}`
      : "期限切れ、または削除済みの投稿";
    header.append(
      createTimelineTextElement("h3", "", identity),
      createTimelineTextElement("span", "admin-report-count", `${item.reportCount || 0}件の通報`)
    );

    const message = createTimelineTextElement(
      "p",
      "admin-report-message",
      item.post?.message || "投稿本文はすでに存在しません。"
    );

    const meta = document.createElement("div");
    meta.className = "admin-report-meta";
    const reasons = Array.isArray(item.reasons)
      ? item.reasons.map((reason) => adminReportReasonLabels[reason] || "その他").join("・")
      : "不明";
    meta.append(
      createTimelineTextElement("span", "", `理由: ${reasons}`),
      createTimelineTextElement("time", "", formatTimelineDate(item.latestReportedAt))
    );

    if (item.post?.track?.title) {
      card.append(header, message, meta, createTimelineTextElement(
        "p",
        "cloud-timeline-track",
        `NOW PLAYING  ${item.post.track.title} / ${item.post.track.artist || "--"}`
      ));
    } else {
      card.append(header, message, meta);
    }

    const actions = document.createElement("div");
    actions.className = "admin-report-actions";
    const dismissButton = createTimelineTextElement("button", "admin-dismiss-report-button", "問題なし");
    dismissButton.type = "button";
    dismissButton.addEventListener("click", () => handleAdminModerationAction("dismiss", item.postId, dismissButton));
    actions.appendChild(dismissButton);

    if (item.post) {
      const deleteButton = createTimelineTextElement("button", "admin-delete-post-button", "投稿を削除");
      deleteButton.type = "button";
      deleteButton.addEventListener("click", () => handleAdminModerationAction("delete", item.postId, deleteButton));
      actions.appendChild(deleteButton);
    }

    card.appendChild(actions);
    fragment.appendChild(card);
  });

  elements.adminReportList.appendChild(fragment);
}

async function fetchAndRenderAdminReports(token = adminAccessToken) {
  const result = await loadAdminReports(token);
  renderAdminReports(result?.reports);
  return result;
}

async function authenticateAdmin() {
  const token = String(elements.adminKeyInput?.value || "").trim();
  if (token.length < 32) {
    elements.adminPanelStatus.textContent = "管理者キーを正しく入力してください。";
    return;
  }

  elements.adminLoginButton.disabled = true;
  elements.adminPanelStatus.textContent = "管理者権限を確認しています。";
  try {
    await fetchAndRenderAdminReports(token);
    adminAccessToken = token;
    elements.adminKeyInput.value = "";
    elements.adminLoginView.hidden = true;
    elements.adminReportsView.hidden = false;
    elements.adminPanelStatus.textContent = "管理者として認証されました。";
    elements.refreshAdminReportsButton?.focus();
  } catch (error) {
    elements.adminPanelStatus.textContent = error.status === 401
      ? "管理者キーが正しくありません。"
      : `通報一覧を取得できませんでした。${error.message}`;
  } finally {
    elements.adminLoginButton.disabled = false;
  }
}

async function refreshAdminReports() {
  if (!adminAccessToken) return;
  elements.refreshAdminReportsButton.disabled = true;
  elements.adminPanelStatus.textContent = "通報一覧を更新しています。";
  try {
    await fetchAndRenderAdminReports();
    elements.adminPanelStatus.textContent = "最新の通報一覧です。";
  } catch (error) {
    if (error.status === 401) logoutAdmin({ message: "認証の有効期限が切れました。もう一度入力してください。" });
    else elements.adminPanelStatus.textContent = `更新できませんでした。${error.message}`;
  } finally {
    elements.refreshAdminReportsButton.disabled = false;
  }
}

async function handleAdminModerationAction(action, postId, button) {
  if (!adminAccessToken || !postId) return;
  const deleting = action === "delete";
  const confirmed = window.confirm(deleting
    ? "この投稿を公開タイムラインから削除します。元に戻せません。よろしいですか？"
    : "この投稿の通報を「問題なし」として閉じますか？");
  if (!confirmed) return;

  button.disabled = true;
  elements.adminPanelStatus.textContent = deleting ? "投稿を削除しています。" : "通報を処理しています。";
  try {
    if (deleting) await deleteCloudDiaryPostAsAdmin(postId, adminAccessToken);
    else await dismissCloudDiaryReportsAsAdmin(postId, adminAccessToken);
    await fetchAndRenderAdminReports();
    if (deleting) refreshCloudDiaryTimeline({ announce: false });
    elements.adminPanelStatus.textContent = deleting ? "投稿を削除しました。" : "通報を問題なしとして閉じました。";
  } catch (error) {
    if (error.status === 401) logoutAdmin({ message: "管理者認証に失敗しました。もう一度入力してください。" });
    else elements.adminPanelStatus.textContent = `処理できませんでした。${error.message}`;
  } finally {
    button.disabled = false;
  }
}

function handleAdminPanelKeydown(event) {
  if (event.key === "Enter" && document.activeElement === elements.adminKeyInput) {
    event.preventDefault();
    authenticateAdmin();
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = Array.from(elements.adminPanel.querySelectorAll("button:not(:disabled), input:not(:disabled)"))
    .filter((element) => !element.closest("[hidden]"));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function renderCloudTimeline(posts) {
  if (!elements.cloudTimelineList) return;

  const safePosts = Array.isArray(posts) ? posts.filter((post) => post && typeof post === "object") : [];
  elements.cloudTimelineList.replaceChildren();
  elements.cloudTimelineCount.textContent = `${safePosts.length} POSTS`;
  if (elements.liveFeedBadge) elements.liveFeedBadge.textContent = String(safePosts.length);

  if (!safePosts.length) {
    const emptyState = createTimelineTextElement(
      "p",
      "cloud-timeline-empty",
      "まだ投稿はありません。最初の天気日記を共有してみましょう。"
    );
    elements.cloudTimelineList.appendChild(emptyState);
    return;
  }

  const fragment = document.createDocumentFragment();
  safePosts.forEach((post) => fragment.appendChild(createCloudTimelineCard(post)));
  elements.cloudTimelineList.appendChild(fragment);
}

async function refreshCloudDiaryTimeline({ announce = true } = {}) {
  if (!elements.cloudTimelineList || !elements.cloudTimelineStatus) return;

  if (!isWeatherSpotApiConfigured()) {
    elements.cloudApiStatus.textContent = "未設定";
    elements.cloudTimelineStatus.textContent = "Azure APIのURLが設定されていません。";
    elements.cloudTimelineList.setAttribute("aria-busy", "false");
    return;
  }

  const requestId = ++cloudTimelineRequestId;
  elements.cloudTimelineList.setAttribute("aria-busy", "true");
  elements.refreshCloudTimelineButton.disabled = true;
  elements.cloudApiStatus.textContent = "確認中";
  if (announce) elements.cloudTimelineStatus.textContent = "Azureから最新の投稿を読み込んでいます。";

  try {
    const result = await loadCloudDiaryPosts(30);
    if (requestId !== cloudTimelineRequestId) return;

    renderCloudTimeline(result?.posts);
    elements.cloudApiStatus.textContent = "接続済み";
    elements.cloudTimelineStatus.textContent = "最新の投稿を表示しています。";
  } catch (error) {
    if (requestId !== cloudTimelineRequestId) return;

    elements.cloudApiStatus.textContent = "接続エラー";
    elements.cloudTimelineStatus.textContent = `投稿を読み込めませんでした。${error.message}`;
    elements.cloudTimelineList.replaceChildren(
      createTimelineTextElement("p", "cloud-timeline-empty is-error", "通信状態を確認して再読み込みしてください。")
    );
    elements.cloudTimelineCount.textContent = "-- POSTS";
    if (elements.liveFeedBadge) elements.liveFeedBadge.textContent = "!";
  } finally {
    if (requestId === cloudTimelineRequestId) {
      elements.cloudTimelineList.setAttribute("aria-busy", "false");
      elements.refreshCloudTimelineButton.disabled = false;
    }
  }
}

function openShareConfirmDialog() {
  if (!pendingShareDraft || !elements.shareConfirmLayer) return;

  elements.confirmShareName.textContent = pendingShareDraft.name;
  elements.confirmShareMessage.textContent = pendingShareDraft.message;
  elements.confirmShareCity.textContent = pendingShareDraft.city;
  elements.confirmShareWeather.textContent = pendingShareDraft.weather;
  elements.confirmShareTrack.textContent = pendingShareDraft.track?.title || "曲なし";
  elements.confirmShareArtist.textContent = pendingShareDraft.track?.artist || "投稿には曲を含めません";

  lastShareConfirmFocus = document.activeElement;
  elements.shareConfirmLayer.hidden = false;
  document.body.classList.add("share-confirm-open");
  elements.publishShareButton.focus();
}

function closeShareConfirmDialog(event, { restoreFocus = true } = {}) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!elements.shareConfirmLayer || elements.shareConfirmLayer.hidden) return;

  elements.shareConfirmLayer.hidden = true;
  document.body.classList.remove("share-confirm-open");

  if (restoreFocus && lastShareConfirmFocus instanceof HTMLElement) {
    lastShareConfirmFocus.focus();
  }

  lastShareConfirmFocus = null;
}

async function publishPendingShareDraft() {
  if (!pendingShareDraft) return;

  const draftToPublish = {
    ...pendingShareDraft,
    clientId: getOrCreateDiaryReporterId()
  };
  elements.publishShareButton.disabled = true;
  elements.publishShareButton.textContent = "送信中...";

  try {
    const savedPost = await createCloudDiaryPost(draftToPublish);
    const expiresLabel = new Date(savedPost.expiresAt).toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric"
    });

    pendingShareDraft = null;
    elements.shareDiaryForm.reset();
    updateShareContextPreview();
    closeShareConfirmDialog(null, { restoreFocus: false });

    elements.shareFormStatus.textContent = `共有しました。${expiresLabel}に自動削除されます。`;
    elements.shareFormStatus.classList.add("is-ready");
    elements.cloudApiStatus.textContent = "接続済み";
    elements.shareNameInput.focus();
    refreshCloudDiaryTimeline({ announce: false });
  } catch (error) {
    elements.shareFormStatus.textContent = error.status === 429
      ? error.message
      : `共有できませんでした。${error.message}`;
    elements.shareFormStatus.classList.remove("is-ready");
    elements.shareFormStatus.classList.add("is-error");
    if (elements.cloudApiStatus) elements.cloudApiStatus.textContent = "接続エラー";
    closeShareConfirmDialog(null, { restoreFocus: false });
    console.error(error);
  } finally {
    elements.publishShareButton.disabled = false;
    elements.publishShareButton.textContent = "共有";
  }
}

function handleShareConfirmKeydown(event) {
  if (event.key !== "Tab") return;

  const firstButton = elements.cancelShareConfirmButton;
  const lastButton = elements.publishShareButton;

  if (event.shiftKey && document.activeElement === firstButton) {
    event.preventDefault();
    lastButton.focus();
  } else if (!event.shiftKey && document.activeElement === lastButton) {
    event.preventDefault();
    firstButton.focus();
  }
}

function handleShareFormInput(event) {
  const maxLength = event.target === elements.shareMessageInput ? 30 : 20;
  const limitedValue = limitTextByCharacters(event.target.value, maxLength);

  if (event.target.value !== limitedValue) {
    event.target.value = limitedValue;
  }

  pendingShareDraft = null;
  updateShareFormState();
}

function prepareShareDraft(event) {
  event.preventDefault();
  updateShareContextPreview();

  const validation = getShareFormValidation();
  if (!validation.valid) {
    elements.shareFormStatus.textContent = "未入力の項目を確認してください。";
    elements.shareFormStatus.classList.add("is-error");
    return;
  }

  pendingShareDraft = {
    name: validation.name,
    message: validation.message,
    cityId: validation.context.cityId,
    city: validation.context.city,
    weather: validation.context.weather,
    track: validation.context.track
  };

  elements.shareFormStatus.textContent = "投稿内容を確認してください。";
  elements.shareFormStatus.classList.remove("is-error");
  elements.shareFormStatus.classList.add("is-ready");
  openShareConfirmDialog();
}

function bindShareDiaryEvents() {
  bindIfExists(elements.shareNameInput, "input", handleShareFormInput);
  bindIfExists(elements.shareMessageInput, "input", handleShareFormInput);
  bindIfExists(elements.shareDiaryForm, "submit", prepareShareDraft);
  bindIfExists(elements.cancelShareConfirmButton, "click", closeShareConfirmDialog);
  bindIfExists(elements.shareConfirmBackdrop, "click", closeShareConfirmDialog);
  bindIfExists(elements.publishShareButton, "click", publishPendingShareDraft);
  bindIfExists(elements.refreshCloudTimelineButton, "click", refreshCloudDiaryTimeline);
  bindIfExists(elements.cancelReportButton, "click", closeReportDialog);
  bindIfExists(elements.reportDialogBackdrop, "click", closeReportDialog);
  bindIfExists(elements.submitReportButton, "click", submitPendingReport);
  bindIfExists(elements.reportDialog, "keydown", handleReportDialogKeydown);
  bindIfExists(elements.shareConfirmDialog, "keydown", handleShareConfirmKeydown);
  document.addEventListener("weatherspot:weather-updated", updateShareContextPreview);
  document.addEventListener("weatherspot:track-updated", updateShareContextPreview);
  updateShareContextPreview();
  refreshCloudDiaryTimeline({ announce: false });
}

function bindSpotifyEvents() {
  // 旧バージョン互換の保存ボタンが存在する場合だけ接続します。
  bindIfExists(elements.saveSpotifyConfigButton, "click", saveSpotifyConfig);

  bindIfExists(elements.spotifyLoginButton, "click", startSpotifyLogin);
  bindIfExists(elements.spotifyLogoutButton, "click", logoutSpotify);
  bindIfExists(elements.getCurrentTrackButton, "click", loadCurrentlyPlayingTrack);
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

function bindAdminEvents() {
  bindIfExists(elements.openAdminPanelButton, "click", openAdminPanel);
  bindIfExists(elements.closeAdminPanelButton, "click", closeAdminPanel);
  bindIfExists(elements.adminPanelBackdrop, "click", closeAdminPanel);
  bindIfExists(elements.adminLoginButton, "click", authenticateAdmin);
  bindIfExists(elements.refreshAdminReportsButton, "click", refreshAdminReports);
  bindIfExists(elements.adminLogoutButton, "click", () => logoutAdmin());
  bindIfExists(elements.adminPanel, "keydown", handleAdminPanelKeydown);
}

function bindPlaylistEvents() {
  bindIfExists(elements.savePlaylistSettingsButton, "click", savePlaylistSettings);
  bindIfExists(elements.resetPlaylistSettingsButton, "click", resetPlaylistSettings);
}

function bindAppEvents() {
  bindWeatherEvents();
  bindSpotifyEvents();
  bindShareDiaryEvents();
  bindAdminEvents();
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
  initCurrentlyPlayingAutoRefresh();
  startOpeningSequence();
  initIdleMenuButton();
  fetchWeather();

  if (getStoredAccessToken() && elements.spotifyStatus) {
    elements.spotifyStatus.textContent = "logged in";
    writeSpotifyLog(["access token found", "天気BGMを再生できます"]);
  }
}

initializeApp();
