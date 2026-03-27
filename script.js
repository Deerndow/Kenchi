// ============================================================
//  NAVIGATION
// ============================================================

function showMemory() {
  document.getElementById("memoryView").classList.remove("hidden");
}

function hideMemory() {
  document.getElementById("memoryView").classList.add("hidden");
}

function showProfile() {
  document.getElementById("profileView").classList.remove("hidden");
  setNavActive(null);
}

function hideProfile() {
  document.getElementById("profileView").classList.add("hidden");
  setNavActive("navTimeline");
}

function setNavActive(id) {
  document.querySelectorAll("#mainNav .nav-btn").forEach(b => b.classList.remove("active"));
  if (id) {
    const btn = document.getElementById(id);
    if (btn) btn.classList.add("active");
  }
}

// ============================================================
//  UPLOAD MODAL
// ============================================================

let uploadState = {
  step: 1,
  month: null,
  year: null,
  tags: [],
  locations: [],
  photos: [],
  style: "cutouts",
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const GEN_MESSAGES = [
  "Picking your best shots",
  "Analyzing composition",
  "Arranging the layout",
  "Adding finishing touches",
  "Almost done...",
];

function openModal() {
  uploadState = { step: 1, month: null, year: null, tags: [], locations: [], photos: [], style: "cutouts" };
  resetModalUI();
  document.getElementById("uploadModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("uploadModal").classList.add("hidden");
  document.body.style.overflow = "";
}

function resetModalUI() {
  document.querySelectorAll(".step-content").forEach(s => s.classList.remove("active"));
  document.getElementById("step1").classList.add("active");

  document.querySelectorAll(".steps-indicator .step").forEach((s, i) => {
    s.classList.toggle("active", i === 0);
    s.classList.remove("done");
  });
  document.querySelectorAll(".step-line").forEach(l => l.classList.remove("done"));

  document.getElementById("monthSelect").value = "";
  document.getElementById("yearSelect").selectedIndex = 0;
  document.getElementById("tagInput").value = "";
  document.getElementById("tagsPreview").innerHTML = "";
  document.getElementById("locationInput").value = "";
  document.getElementById("locationsPreview").innerHTML = "";
  document.getElementById("photoPreviewGrid").innerHTML = "";
  document.getElementById("uploadZoneClick").style.display = "flex";

  document.querySelectorAll(".style-option").forEach(o => {
    o.classList.toggle("active", o.dataset.style === "cutouts");
  });
  uploadState.style = "cutouts";
}

function goToStep(n) {
  document.querySelectorAll(".step-content").forEach(s => s.classList.remove("active"));
  document.getElementById(`step${n}`).classList.add("active");
  uploadState.step = n;

  document.querySelectorAll(".steps-indicator .step").forEach((s, i) => {
    s.classList.remove("active", "done");
    if (i + 1 < n) s.classList.add("done");
    if (i + 1 === n) s.classList.add("active");
  });
  document.querySelectorAll(".step-line").forEach((l, i) => {
    l.classList.toggle("done", i + 1 < n);
  });
}

function startGenerating() {
  document.querySelectorAll(".step-content").forEach(s => s.classList.remove("active"));
  document.getElementById("stepGenerating").classList.add("active");

  let msgIndex = 0;
  const subEl = document.getElementById("genSubtext");

  const interval = setInterval(() => {
    msgIndex++;
    if (msgIndex < GEN_MESSAGES.length) subEl.textContent = GEN_MESSAGES[msgIndex];
  }, 700);

  setTimeout(() => {
    clearInterval(interval);
    // Just close modal — main page stays as the static PNG
    closeModal();
  }, 3500);
}

function populateYearSelect() {
  const sel = document.getElementById("yearSelect");
  const current = new Date().getFullYear();
  for (let y = current; y >= current - 10; y--) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    sel.appendChild(opt);
  }
}

function renderPhotoPreview(files) {
  const grid = document.getElementById("photoPreviewGrid");
  const zone = document.getElementById("uploadZoneClick");
  grid.innerHTML = "";
  zone.style.display = files.length ? "none" : "flex";
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement("img");
      img.src = e.target.result;
      grid.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

function renderTagBadges() {
  document.getElementById("tagsPreview").innerHTML = uploadState.tags.map((t, i) => `
    <span class="tag-badge">#${t}<button onclick="removeTag(${i})">×</button></span>
  `).join("");
}

function removeTag(i) {
  uploadState.tags.splice(i, 1);
  renderTagBadges();
}

function renderLocationBadges() {
  document.getElementById("locationsPreview").innerHTML = uploadState.locations.map((l, i) => `
    <div class="loc-badge"><span>${l}</span><button onclick="removeLocation(${i})">×</button></div>
  `).join("");
}

function removeLocation(i) {
  uploadState.locations.splice(i, 1);
  renderLocationBadges();
}

function shakeField(id) {
  const el = document.getElementById(id);
  el.style.borderColor = "#ff4444";
  setTimeout(() => { el.style.borderColor = ""; }, 1500);
}

// ============================================================
//  INIT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  populateYearSelect();

  // Main image tap → open memory page
  document.getElementById("mainTap").addEventListener("click", showMemory);

  // Memory overlay nav
  document.getElementById("memNavTimeline").addEventListener("click", () => { hideMemory(); setNavActive("navTimeline"); });
  document.getElementById("memNavUploadBtn").addEventListener("click", openModal);
  document.getElementById("memNavProfile").addEventListener("click", () => { hideMemory(); showProfile(); });

  // Profile overlay nav
  document.getElementById("profileNavTimeline").addEventListener("click", () => { hideProfile(); setNavActive("navTimeline"); });
  document.getElementById("profileNavUploadBtn").addEventListener("click", openModal);
  document.getElementById("profileNavProfile").addEventListener("click", () => {});

  // Nav: Timeline
  document.getElementById("navTimeline").addEventListener("click", () => {
    hideMemory();
    hideProfile();
    setNavActive("navTimeline");
  });

  // Nav: You → profile
  document.getElementById("navProfile").addEventListener("click", showProfile);

  // Nav: Upload
  document.getElementById("uploadNavBtn").addEventListener("click", openModal);

  // Modal backdrop
  document.getElementById("modalBackdrop").addEventListener("click", closeModal);

  // Step 1
  document.getElementById("step1Next").addEventListener("click", () => {
    const m = document.getElementById("monthSelect").value;
    if (m === "") return shakeField("monthSelect");
    uploadState.month = m;
    uploadState.year = document.getElementById("yearSelect").value;
    goToStep(2);
  });

  // Step 2: photos
  document.getElementById("uploadZoneClick").addEventListener("click", () => {
    document.getElementById("fileInput").click();
  });
  document.getElementById("fileInput").addEventListener("change", e => {
    uploadState.photos = Array.from(e.target.files);
    renderPhotoPreview(uploadState.photos);
  });
  document.getElementById("tagInput").addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = e.target.value.trim().replace(/^#/, "");
    if (val && !uploadState.tags.includes(val)) {
      uploadState.tags.push(val);
      renderTagBadges();
    }
    e.target.value = "";
  });
  document.getElementById("step2Next").addEventListener("click", () => goToStep(3));

  // Step 3: locations
  document.getElementById("locationInput").addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = e.target.value.trim();
    if (val && !uploadState.locations.includes(val)) {
      uploadState.locations.push(val);
      renderLocationBadges();
    }
    e.target.value = "";
  });
  document.getElementById("step3Next").addEventListener("click", () => goToStep(4));

  // Step 4: style
  document.querySelectorAll(".style-option").forEach(opt => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".style-option").forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      uploadState.style = opt.dataset.style;
    });
  });
  document.getElementById("step4Generate").addEventListener("click", startGenerating);
});
