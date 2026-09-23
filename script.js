// Music Player Data & Application State

const tracks = [
  {
    id: 1,
    title: "Midnight City Lights",
    artist: "SynthWave Collective",
    genre: "Chillwave",
    duration: "2:45",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    themeColor: "radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.4), transparent 45%), radial-gradient(circle at 70% 70%, rgba(236, 72, 153, 0.35), transparent 45%)",
    // Reliable MP3 stream
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    freqBase: 220
  },
  {
    id: 2,
    title: "Neon Dreams",
    artist: "Aura Pulse",
    genre: "Electronic",
    duration: "3:12",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
    themeColor: "radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.4), transparent 45%), radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.35), transparent 45%)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    freqBase: 261
  },
  {
    id: 3,
    title: "Celestial Horizon",
    artist: "Starlight Echoes",
    genre: "Ambient",
    duration: "4:05",
    cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80",
    themeColor: "radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.4), transparent 45%), radial-gradient(circle at 70% 70%, rgba(245, 158, 11, 0.35), transparent 45%)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    freqBase: 329
  },
  {
    id: 4,
    title: "Lofi Sunset Drive",
    artist: "Chill Hop Beats",
    genre: "Lofi",
    duration: "2:50",
    cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80",
    themeColor: "radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.4), transparent 45%), radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.35), transparent 45%)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    freqBase: 392
  },
  {
    id: 5,
    title: "Quantum Flux",
    artist: "Cyber Dynamics",
    genre: "Future Bass",
    duration: "3:30",
    cover: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80",
    themeColor: "radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.4), transparent 45%), radial-gradient(circle at 70% 70%, rgba(244, 63, 94, 0.35), transparent 45%)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    freqBase: 440
  }
];

// DOM Elements
const audio = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const muteBtn = document.getElementById("muteBtn");
const volumeIcon = document.getElementById("volumeIcon");

const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const volumeBar = document.getElementById("volumeBar");
const volumeFill = document.getElementById("volumeFill");
const volumeText = document.getElementById("volumeText");

const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");
const genreBadge = document.getElementById("genreBadge");
const coverImage = document.getElementById("coverImage");
const albumContainer = document.getElementById("albumContainer");
const currentTimeEl = document.getElementById("currentTime");
const totalDurationEl = document.getElementById("totalDuration");
const ambientBg = document.getElementById("ambientBg");

const playlistItemsEl = document.getElementById("playlistItems");
const trackCountEl = document.getElementById("trackCount");
const searchInput = document.getElementById("searchInput");
const autoplayToggle = document.getElementById("autoplayToggle");

const shortcutBtn = document.getElementById("shortcutBtn");
const shortcutModal = document.getElementById("shortcutModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const canvas = document.getElementById("visualizerCanvas");
const ctx = canvas.getContext("2d");

// App State
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 'off'; // 'off' | 'one' | 'all'
let previousVolume = 0.8;
let synthAudioContext = null;
let synthOscillator = null;
let isSynthFallback = false;
let audioContext = null;
let analyser = null;
let dataArray = null;

// Initialize Player
function initPlayer() {
  trackCountEl.textContent = tracks.length;
  renderPlaylist(tracks);
  loadTrack(currentTrackIndex);
  setupEventListeners();
  setupCanvas();
}

// Render Playlist Items
function renderPlaylist(trackList) {
  playlistItemsEl.innerHTML = "";
  if (trackList.length === 0) {
    playlistItemsEl.innerHTML = `<li style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No songs found</li>`;
    return;
  }

  trackList.forEach((track) => {
    const originalIndex = tracks.findIndex(t => t.id === track.id);
    const isActive = originalIndex === currentTrackIndex;

    const li = document.createElement("li");
    li.className = `playlist-item ${isActive ? "active" : ""}`;
    li.onclick = () => selectTrack(originalIndex);

    li.innerHTML = `
      <img src="${track.cover}" alt="${track.title}" class="track-thumb" />
      <div class="item-details">
        <div class="item-title">${track.title}</div>
        <div class="item-artist">${track.artist}</div>
      </div>
      ${isActive && isPlaying ? `
        <div class="eq-bars">
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
          <div class="eq-bar"></div>
        </div>
      ` : `<span class="item-duration">${track.duration}</span>`}
    `;

    playlistItemsEl.appendChild(li);
  });
}

// Load Selected Track
function loadTrack(index) {
  currentTrackIndex = index;
  const track = tracks[currentTrackIndex];

  songTitle.textContent = track.title;
  artistName.textContent = track.artist;
  genreBadge.textContent = track.genre;
  coverImage.src = track.cover;
  audio.src = track.url;
  ambientBg.style.background = track.themeColor;

  progressBar.value = 0;
  progressFill.style.width = "0%";
  currentTimeEl.textContent = "0:00";
  totalDurationEl.textContent = track.duration;

  document.title = `${track.title} - ${track.artist} | AuraSound`;
  renderPlaylist(filterTracks(searchInput.value));
}

// Play Audio
function playAudio() {
  isPlaying = true;
  playIcon.className = "fa-solid fa-pause";
  albumContainer.classList.add("playing");

  initWebAudio();

  audio.play().catch(err => {
    console.warn("Audio stream playback failed, starting Web Audio synth fallback:", err);
    startSynthFallback();
  });

  renderPlaylist(filterTracks(searchInput.value));
}

// Pause Audio
function pauseAudio() {
  isPlaying = false;
  playIcon.className = "fa-solid fa-play";
  albumContainer.classList.remove("playing");

  if (isSynthFallback) {
    stopSynthFallback();
  } else {
    audio.pause();
  }

  renderPlaylist(filterTracks(searchInput.value));
}

// Toggle Play / Pause
function togglePlay() {
  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

// Next Track
function nextTrack() {
  if (isShuffle) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * tracks.length);
    } while (randomIndex === currentTrackIndex && tracks.length > 1);
    currentTrackIndex = randomIndex;
  } else {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  }
  loadTrack(currentTrackIndex);
  playAudio();
}

// Previous Track
function prevTrack() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentTrackIndex);
  playAudio();
}

// Select Specific Track from Playlist
function selectTrack(index) {
  if (currentTrackIndex === index && isPlaying) return;
  currentTrackIndex = index;
  loadTrack(currentTrackIndex);
  playAudio();
}

// Filter Tracks via Search
function filterTracks(query) {
  if (!query) return tracks;
  const q = query.toLowerCase();
  return tracks.filter(t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
}

// Web Audio API Synthesizer Fallback (Guarantees offline/fallback sound generation)
function startSynthFallback() {
  isSynthFallback = true;
  if (!synthAudioContext) {
    synthAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (synthOscillator) synthOscillator.stop();

  synthOscillator = synthAudioContext.createOscillator();
  const gainNode = synthAudioContext.createGain();

  const freq = tracks[currentTrackIndex].freqBase || 261.63;
  synthOscillator.type = 'sine';
  synthOscillator.frequency.setValueAtTime(freq, synthAudioContext.currentTime);

  gainNode.gain.setValueAtTime(volumeBar.value * 0.2, synthAudioContext.currentTime);

  synthOscillator.connect(gainNode);
  gainNode.connect(synthAudioContext.destination);
  synthOscillator.start();
}

function stopSynthFallback() {
  if (synthOscillator) {
    try { synthOscillator.stop(); } catch(e){}
    synthOscillator = null;
  }
  isSynthFallback = false;
}

// Initialize Web Audio Visualizer Analyser Node
function initWebAudio() {
  if (audioContext) return;
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 64;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  } catch(e) {
    console.log("AudioContext canvas visualizer fallback to dynamic synth wave");
  }
}

// Canvas Setup & Render Loop
function setupCanvas() {
  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(drawVisualizer);
}

function drawVisualizer() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 105;
  const bars = 36;

  if (analyser && isPlaying && dataArray) {
    analyser.getByteFrequencyData(dataArray);
  }

  for (let i = 0; i < bars; i++) {
    const angle = (i * 2 * Math.PI) / bars;
    let value = 15;

    if (isPlaying) {
      if (analyser && dataArray && dataArray[i % dataArray.length]) {
        value = (dataArray[i % dataArray.length] / 255) * 45 + 10;
      } else {
        value = Math.sin(Date.now() * 0.005 + i) * 15 + 25;
      }
    }

    const x1 = centerX + Math.cos(angle) * radius;
    const y1 = centerY + Math.sin(angle) * radius;
    const x2 = centerX + Math.cos(angle) * (radius + value);
    const y2 = centerY + Math.sin(angle) * (radius + value);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `hsla(${139 + i * 5}, 80%, 65%, ${isPlaying ? 0.75 : 0.25})`;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  requestAnimationFrame(drawVisualizer);
}

// Format Seconds into MM:SS
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Setup Event Listeners
function setupEventListeners() {
  // Playback Controls
  playBtn.addEventListener("click", togglePlay);
  prevBtn.addEventListener("click", prevTrack);
  nextBtn.addEventListener("click", nextTrack);

  // Shuffle Toggle
  shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
  });

  // Repeat Modes Toggle (Off -> One -> All -> Off)
  repeatBtn.addEventListener("click", () => {
    if (repeatMode === 'off') {
      repeatMode = 'all';
      repeatBtn.classList.add("active");
      repeatBtn.innerHTML = '<i class="fa-solid fa-repeat"></i>';
      repeatBtn.title = "Repeat Playlist";
    } else if (repeatMode === 'all') {
      repeatMode = 'one';
      repeatBtn.classList.add("active");
      repeatBtn.innerHTML = '<i class="fa-solid fa-arrows-to-dot"></i>';
      repeatBtn.title = "Repeat Current Track";
    } else {
      repeatMode = 'off';
      repeatBtn.classList.remove("active");
      repeatBtn.innerHTML = '<i class="fa-solid fa-repeat"></i>';
      repeatBtn.title = "Repeat Off";
    }
  });

  // Audio Time Update
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progressPercent;
    progressFill.style.width = `${progressPercent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  // Audio Metadata Loaded
  audio.addEventListener("loadedmetadata", () => {
    totalDurationEl.textContent = formatTime(audio.duration);
  });

  // Audio Ended (Autoplay / Loop Logic)
  audio.addEventListener("ended", () => {
    if (repeatMode === 'one') {
      audio.currentTime = 0;
      playAudio();
    } else if (autoplayToggle.checked) {
      if (repeatMode === 'off' && currentTrackIndex === tracks.length - 1 && !isShuffle) {
        pauseAudio();
      } else {
        nextTrack();
      }
    } else {
      pauseAudio();
    }
  });

  // Seek Bar Interaction
  progressBar.addEventListener("input", (e) => {
    const seekTime = (e.target.value / 100) * (audio.duration || 0);
    audio.currentTime = seekTime;
    progressFill.style.width = `${e.target.value}%`;
  });

  // Volume Bar Interaction
  volumeBar.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    audio.volume = val;
    volumeFill.style.width = `${val * 100}%`;
    volumeText.textContent = `${Math.round(val * 100)}%`;
    updateVolumeIcon(val);
  });

  // Mute / Unmute
  muteBtn.addEventListener("click", () => {
    if (audio.volume > 0) {
      previousVolume = audio.volume;
      audio.volume = 0;
      volumeBar.value = 0;
      volumeFill.style.width = "0%";
      volumeText.textContent = "0%";
      updateVolumeIcon(0);
    } else {
      audio.volume = previousVolume;
      volumeBar.value = previousVolume;
      volumeFill.style.width = `${previousVolume * 100}%`;
      volumeText.textContent = `${Math.round(previousVolume * 100)}%`;
      updateVolumeIcon(previousVolume);
    }
  });

  // Search Filter Input
  searchInput.addEventListener("input", (e) => {
    const filtered = filterTracks(e.target.value);
    renderPlaylist(filtered);
  });

  // Keyboard Shortcuts Modal Toggle
  shortcutBtn.addEventListener("click", () => shortcutModal.classList.add("open"));
  closeModalBtn.addEventListener("click", () => shortcutModal.classList.remove("open"));
  shortcutModal.addEventListener("click", (e) => {
    if (e.target === shortcutModal) shortcutModal.classList.remove("open");
  });

  // Global Keyboard Controls
  document.addEventListener("keydown", (e) => {
    if (document.activeElement.tagName === "INPUT") return;

    switch (e.code) {
      case "Space":
        e.preventDefault();
        togglePlay();
        break;
      case "KeyN":
        nextTrack();
        break;
      case "KeyP":
        prevTrack();
        break;
      case "ArrowRight":
        audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || 0);
        break;
      case "ArrowLeft":
        audio.currentTime = Math.max(audio.currentTime - 5, 0);
        break;
      case "ArrowUp":
        e.preventDefault();
        audio.volume = Math.min(audio.volume + 0.1, 1);
        volumeBar.value = audio.volume;
        volumeFill.style.width = `${audio.volume * 100}%`;
        volumeText.textContent = `${Math.round(audio.volume * 100)}%`;
        updateVolumeIcon(audio.volume);
        break;
      case "ArrowDown":
        e.preventDefault();
        audio.volume = Math.max(audio.volume - 0.1, 0);
        volumeBar.value = audio.volume;
        volumeFill.style.width = `${audio.volume * 100}%`;
        volumeText.textContent = `${Math.round(audio.volume * 100)}%`;
        updateVolumeIcon(audio.volume);
        break;
      case "KeyM":
        muteBtn.click();
        break;
    }
  });
}

function updateVolumeIcon(val) {
  if (val === 0) {
    volumeIcon.className = "fa-solid fa-volume-xmark";
  } else if (val < 0.5) {
    volumeIcon.className = "fa-solid fa-volume-low";
  } else {
    volumeIcon.className = "fa-solid fa-volume-high";
  }
}

// Start application on DOM ready
document.addEventListener("DOMContentLoaded", initPlayer);
