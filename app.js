const STORAGE_KEY = "pawpalConnectDemoState";
const screen = document.getElementById("screen");
const phone = document.getElementById("phone");
const nav = document.getElementById("bottomNav");
const navBadge = document.getElementById("navBadge");
const toast = document.getElementById("toast");
const modal = document.getElementById("modal");

let state = loadState();
let route = { name: "onboarding", id: null };
let routeHistory = [];
let ui = { query: "", feedFilter: "all", taskFilter: "open", createMode: "rescue", exploreFilter: "all" };

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return clone(window.PawPalSeed);
  try {
    const parsed = JSON.parse(saved);
    return { ...clone(window.PawPalSeed), ...parsed };
  } catch {
    return clone(window.PawPalSeed);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function icon(name) {
  return `<svg><use href="#i-${name}"></use></svg>`;
}

function money(value) {
  return `RM${Number(value || 0).toLocaleString("en-MY")}`;
}

function unreadCount() {
  return state.notifications.filter((item) => !item.read).length;
}

function caseTasks(caseId) {
  return state.tasks.filter((task) => task.caseId === caseId);
}

function caseOpenTasks(caseId) {
  return caseTasks(caseId).filter((task) => task.status === "open");
}

function getCase(id) {
  return state.cases.find((item) => item.id === id);
}

function getTask(id) {
  return state.tasks.find((item) => item.id === id);
}

function getPet(id) {
  return state.pets.find((item) => item.id === id);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 1400);
}

function showModal(title, text, label = "Continue", nextRoute = null) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalText").textContent = text;
  const primary = document.getElementById("modalPrimary");
  primary.textContent = label;
  primary.onclick = () => {
    modal.hidden = true;
    if (nextRoute) go(nextRoute.name, nextRoute.id);
  };
  modal.hidden = false;
}

function notify(title, text, target = null) {
  state.notifications.unshift({
    id: `n-${Date.now()}`,
    title,
    text,
    time: "now",
    read: false,
    target
  });
}

function setRouteHash() {
  const hash = route.id ? `${route.name}/${route.id}` : route.name;
  if (location.hash.replace("#", "") !== hash) history.replaceState(null, "", `#${hash}`);
}

function parseHash() {
  const raw = location.hash.replace("#", "");
  const [name, id] = raw.split("/");
  return { name: name || "onboarding", id: id || null };
}

function activeTab() {
  if (route.name === "explore" || route.name === "map") return "explore";
  if (route.name === "create") return "create";
  if (route.name === "tasks" || route.name === "task") return "tasks";
  if (["profile", "settings", "dashboard", "notifications"].includes(route.name)) return "profile";
  return "feed";
}

function go(name, id = null, push = true) {
  const next = { name, id };
  if (push && route.name !== "onboarding") routeHistory.push(route);
  route = next;
  setRouteHash();
  render();
}

function back() {
  const previous = routeHistory.pop();
  if (previous) {
    route = previous;
    setRouteHash();
    render();
    return;
  }
  go("feed", null, false);
}

function renderShell() {
  const isAuthScreen = ["onboarding", "login"].includes(route.name);
  nav.hidden = isAuthScreen;
  phone.classList.toggle("dark", route.name === "onboarding");
  screen.classList.toggle("full", isAuthScreen);
  nav.querySelectorAll("[data-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === activeTab());
  });
  const count = unreadCount();
  navBadge.hidden = count === 0;
  navBadge.textContent = count;
}

function render() {
  renderShell();
  const renderer = {
    onboarding: renderOnboarding,
    login: renderLogin,
    feed: renderFeed,
    explore: renderExplore,
    case: renderCaseDetail,
    create: renderCreate,
    tasks: renderTasks,
    task: renderTaskDetail,
    donation: renderDonation,
    pet: renderPetDetail,
    notifications: renderNotifications,
    profile: renderProfile,
    dashboard: renderDashboard,
    settings: renderSettings
  }[route.name] || renderFeed;

  screen.innerHTML = `<div class="skeleton"></div><div style="height:12px"></div><div class="skeleton"></div>`;
  clearTimeout(window.__renderTimer);
  window.__renderTimer = setTimeout(() => {
    screen.innerHTML = renderer();
    screen.scrollTop = 0;
  }, 90);
}

function renderTop(title, right = "", subtitle = "") {
  return `
    <div class="top">
      <div>
        ${subtitle ? `<p style="font-weight:850">${escapeHtml(subtitle)}</p>` : ""}
        <h2>${escapeHtml(title)}</h2>
      </div>
      ${right}
    </div>
  `;
}

function renderBackTop(title, subtitle = "") {
  return `
    <div class="top">
      <button class="icon-btn" data-back aria-label="Back">${icon("back")}</button>
      <div style="flex:1">
        ${subtitle ? `<p style="font-weight:850">${escapeHtml(subtitle)}</p>` : ""}
        <h2>${escapeHtml(title)}</h2>
      </div>
    </div>
  `;
}

function renderOnboarding() {
  return `
    <div class="top">
      <div class="brand"><div class="logo"></div>PawPal</div>
      <button class="icon-btn" data-go="login">${icon("user")}</button>
    </div>
    <div class="hero">
      <img src="assets/pet_5_1.png" alt="Kittens">
      <div class="hero-copy">
        <h1>Rescue together. Adopt with trust.</h1>
        <p>Coordinate nearby helpers, shelters, donors, and adopters with transparent updates.</p>
      </div>
    </div>
    <div class="actions">
      <button class="btn full" data-go="login">Start helping today</button>
      <button class="btn full light" data-go="feed">Browse nearby cases</button>
    </div>
  `;
}

function renderLogin() {
  return `
    <div class="brand"><div class="logo"></div>PawPal Connect</div>
    <div style="height:44px"></div>
    <h1>Welcome back, rescuer.</h1>
    <p style="margin-top:12px">Sign in to manage adoption requests, volunteer tasks, and donation proof.</p>
    <div style="height:30px"></div>
    <form class="form" data-form="login">
      <div class="field"><label>Email</label><input class="input" name="email" value="alya@pawpal.test"></div>
      <div class="field"><label>Password</label><input class="input" name="password" type="password" value="pawpal"></div>
      <button class="btn full" type="submit">Log in</button>
      <button class="btn full light" type="button" data-action="fake-account">Create account</button>
    </form>
  `;
}

function filteredCases() {
  const query = ui.query.trim().toLowerCase();
  return state.cases.filter((item) => {
    const matchQuery = !query || [item.title, item.petName, item.species, item.location, item.owner, ...item.tags].join(" ").toLowerCase().includes(query);
    const matchFilter =
      ui.feedFilter === "all" ||
      (ui.feedFilter === "urgent" && ["Critical", "High"].includes(item.urgency)) ||
      (ui.feedFilter === "verified" && item.tags.includes("verified")) ||
      (ui.feedFilter === "adoption" && item.type === "adoption") ||
      (ui.feedFilter === "donation" && item.type === "donation");
    return matchQuery && matchFilter;
  });
}

function renderFeed() {
  const cases = filteredCases();
  const openTasks = state.tasks.filter((task) => task.status === "open").length;
  const pledged = state.cases.reduce((sum, item) => sum + item.pledged, 0);
  return `
    ${renderTop("Good morning, Alya", `
      <div class="row" style="gap:8px">
        <button class="icon-btn" data-go="notifications">${icon("bell")}</button>
        <img class="avatar" src="${state.user.avatar}" alt="${state.user.name}">
      </div>
    `, "Nearby community")}
    <div class="live-card clickable" data-go="notifications">
      <div class="row"><h3>Live coordination room</h3><span class="pill hot">${unreadCount()} new</span></div>
      <p>Helpers are arranging transport, foster care, medical proof, and adoption screening near you.</p>
    </div>
    <div style="height:13px"></div>
    ${renderSearch(ui.query, "Search rescue cases, tags, shelters")}
    ${renderFilterChips("feedFilter", [
      ["all", "All"],
      ["urgent", "Urgent", "coral"],
      ["verified", "Verified", "teal"],
      ["donation", "Donation", "amber"]
    ], ui.feedFilter)}
    <div class="insights">
      <div class="insight teal"><strong>${state.cases.length}</strong><span>active cases</span></div>
      <div class="insight coral"><strong>${openTasks}</strong><span>open tasks</span></div>
      <div class="insight violet"><strong>${money(pledged)}</strong><span>tracked support</span></div>
    </div>
    <div class="stack">
      ${cases.length ? cases.map(renderCaseCard).join("") : renderEmpty("search", "No matching cases", "Try another tag, location, or urgency filter.")}
      <h3>Adoption matches</h3>
      ${state.pets.slice(0, 2).map(renderPetCard).join("")}
    </div>
  `;
}

function renderSearch(value, placeholder) {
  return `
    <label class="search">
      ${icon("search")}
      <input data-search value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}">
    </label>
  `;
}

function renderFilterChips(key, options, current) {
  return `
    <div class="chips">
      ${options.map(([value, label, color]) => `
        <button class="chip ${current === value ? "active" : ""} ${color || ""}" data-filter-key="${key}" data-filter-value="${value}">${label}</button>
      `).join("")}
    </div>
  `;
}

function renderCaseCard(item) {
  const open = caseOpenTasks(item.id).length;
  const urgencyClass = item.urgency === "Critical" || item.urgency === "High" ? "hot" : "warn";
  return `
    <article class="card case-card clickable" data-case="${item.id}">
      <img class="case-photo" src="${item.image}" alt="${escapeHtml(item.petName)}">
      <div class="case-content">
        <div class="row"><span class="pill ${urgencyClass}"><span class="dot"></span>${escapeHtml(item.urgency)}</span><span class="pill blue">${escapeHtml(item.distance)}</span></div>
        <div class="meta" style="margin:9px 0">${escapeHtml(item.owner)} - ${escapeHtml(item.time)} - ${item.comments.length} updates</div>
        <h3>${escapeHtml(item.title)}</h3>
        <p style="margin-top:6px">${escapeHtml(item.description)}</p>
        <div class="metric-grid">
          <div class="metric"><div><strong>${open}</strong><span>open tasks</span></div></div>
          <div class="metric"><div><strong>${money(item.pledged)}</strong><span>pledged</span></div></div>
          <div class="metric"><div><strong>${item.trusted}%</strong><span>trusted</span></div></div>
        </div>
      </div>
    </article>
  `;
}

function renderPetCard(item) {
  const applied = state.applications.some((app) => app.petId === item.id);
  return `
    <article class="card clickable" data-pet="${item.id}">
      <div class="row">
        <div class="row" style="gap:10px">
          <img class="avatar" src="${item.image}" alt="${escapeHtml(item.name)}">
          <div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.species)} - ${escapeHtml(item.age)} - ${escapeHtml(item.distance)}</p></div>
        </div>
        <span class="pill ${applied ? "warn" : ""}">${applied ? "Review" : `${item.match}%`}</span>
      </div>
      <p style="margin-top:9px">${escapeHtml(item.description)}</p>
    </article>
  `;
}

function renderExplore() {
  const visibleCases = filteredCases();
  const pets = state.pets.filter((pet) => {
    if (ui.exploreFilter === "all") return true;
    return pet.species.toLowerCase() === ui.exploreFilter;
  });
  return `
    ${renderTop("Explore nearby", `<button class="icon-btn" data-action="toggle-filter">${icon("filter")}</button>`)}
    ${renderSearch(ui.query, "Search cat, dog, foster, medical")}
    ${renderFilterChips("exploreFilter", [["all", "All"], ["cat", "Cats", "teal"], ["dog", "Dogs", "coral"]], ui.exploreFilter)}
    <div class="map"><i class="road"></i><i class="pin a"></i><i class="pin b"></i><i class="pin c"></i></div>
    <div style="height:14px"></div>
    <div class="stack">
      <h3>Nearby cases</h3>
      ${visibleCases.map((item) => `
        <article class="task" data-case="${item.id}">
          <div class="round-icon coral">${icon("bell")}</div>
          <div><h3>${escapeHtml(item.petName)} - ${escapeHtml(item.location)}</h3><p>${escapeHtml(item.description)}</p></div>
          <span class="pill">${escapeHtml(item.distance)}</span>
        </article>
      `).join("")}
      <h3>Adoptable pets</h3>
      ${pets.length ? pets.map(renderPetCard).join("") : renderEmpty("heart", "No pets found", "Try a different species filter.")}
    </div>
  `;
}

function renderCaseDetail() {
  const item = getCase(route.id) || state.cases[0];
  const open = caseOpenTasks(item.id).length;
  const tasks = caseTasks(item.id);
  const completed = Math.max(1, Math.min(4, 4 - open));
  return `
    <div class="detail-photo">
      <img src="${item.image}" alt="${escapeHtml(item.petName)}">
      <button class="icon-btn" data-back style="position:absolute;top:16px;left:18px;z-index:5">${icon("back")}</button>
      <div class="detail-title"><h2>${escapeHtml(item.petName)} needs help</h2><div style="height:8px"></div><span class="pill hot">${escapeHtml(item.urgency)}</span></div>
    </div>
    <div class="sheet">
      <div class="row"><div><h3>${escapeHtml(item.title)}</h3><p>Reported by ${escapeHtml(item.owner)}. ${escapeHtml(item.location)}.</p></div><span class="pill">Verified</span></div>
      <div class="progress">
        <div class="row"><h3>Rescue progress</h3><p>${completed} of 4</p></div>
        <div class="bars">${[1,2,3,4].map((n) => `<i class="${n < completed ? "done" : n === completed ? "now" : ""}"></i>`).join("")}</div>
      </div>
      <div class="metric-grid">
        <div class="metric"><div><strong>${open}</strong><span>open tasks</span></div></div>
        <div class="metric"><div><strong>${money(item.pledged)}</strong><span>pledged</span></div></div>
        <div class="metric"><div><strong>${item.comments.length}</strong><span>updates</span></div></div>
      </div>
      <div style="height:12px"></div>
      <div class="stack">
        <div class="card">
          <div class="row"><h3>Trust checks</h3><span class="pill">${item.trusted}% trusted</span></div>
          <div class="stack" style="margin-top:10px">
            ${item.trust.map(([title, text, status], index) => `
              <div class="task" style="box-shadow:none;margin:0">
                <div class="round-icon teal">${index + 1}</div>
                <div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div>
                <span class="pill ${status === "Pending" ? "warn" : ""}">${escapeHtml(status)}</span>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="card">
          <div class="row"><h3>Open tasks</h3><button class="btn small light" data-go="tasks">View all</button></div>
          <div class="stack" style="margin-top:10px">
            ${tasks.map(renderTaskRow).join("")}
          </div>
        </div>
        <button class="btn full coral" data-go="donation" data-id="${item.id}">Support this case</button>
        <div class="card">
          <div class="row"><h3>Community updates</h3><span class="pill">${item.comments.length}</span></div>
          <div class="stack" style="margin-top:12px">${item.comments.map(renderComment).join("")}</div>
          <form class="form" data-form="comment" data-id="${item.id}" style="margin-top:12px">
            <textarea class="textarea" name="comment" placeholder="Write an update or verification note"></textarea>
            <button class="btn full" type="submit">Post update</button>
          </form>
        </div>
      </div>
    </div>
  `;
}

function renderComment(item) {
  return `
    <div class="message">
      <div class="avatar"></div>
      <div class="bubble"><div class="row"><h3>${escapeHtml(item.author)}</h3><span class="meta">${escapeHtml(item.time)}</span></div><p style="margin-top:5px">${escapeHtml(item.text)}</p></div>
    </div>
  `;
}

function renderTaskRow(task) {
  const classes = { transport: "coral", foster: "amber", verify: "teal", search: "violet", update: "teal", post: "amber" };
  return `
    <article class="task" data-task="${task.id}">
      <div class="round-icon ${classes[task.type] || "teal"}">${icon(task.type === "transport" ? "map" : task.type === "foster" ? "home" : "task")}</div>
      <div><h3>${escapeHtml(task.title)}</h3><p>${escapeHtml(task.detail)}</p></div>
      <span class="pill ${task.status === "open" ? "hot" : ""}">${task.status === "open" ? "Open" : "Claimed"}</span>
    </article>
  `;
}

function renderTasks() {
  const tasks = state.tasks.filter((task) => ui.taskFilter === "all" || task.status === ui.taskFilter);
  return `
    ${renderTop("Volunteer tasks", `<button class="icon-btn" data-go="notifications">${icon("bell")}</button>`)}
    ${renderFilterChips("taskFilter", [["open", "Open", "coral"], ["claimed", "Claimed", "teal"], ["all", "All"]], ui.taskFilter)}
    <div class="stack">
      ${tasks.length ? tasks.map(renderTaskRow).join("") : renderEmpty("task", "No tasks here", "Change filter or explore nearby cases.")}
    </div>
  `;
}

function renderTaskDetail() {
  const task = getTask(route.id) || state.tasks[0];
  const item = getCase(task.caseId);
  const claimed = task.status === "claimed";
  return `
    ${renderBackTop(task.title, item.petName)}
    <div class="map"><i class="road"></i><i class="pin a"></i><i class="pin b"></i></div>
    <div style="height:14px"></div>
    <div class="card">
      <div class="row"><h3>${escapeHtml(task.title)}</h3><span class="pill ${claimed ? "" : "hot"}">${claimed ? "Claimed" : "Open"}</span></div>
      <p style="margin-top:8px">${escapeHtml(task.detail)}</p>
      <div class="metric-grid">
        <div class="metric"><div><strong>${escapeHtml(task.distance)}</strong><span>distance</span></div></div>
        <div class="metric"><div><strong>${escapeHtml(task.due)}</strong><span>due</span></div></div>
        <div class="metric"><div><strong>${item.trusted}%</strong><span>trust</span></div></div>
      </div>
    </div>
    <div style="height:12px"></div>
    <form class="form" data-form="claim" data-id="${task.id}">
      <div class="field"><label>Availability</label><input class="input" name="availability" value="6:30 PM - 8:00 PM"></div>
      <div class="field"><label>Message to case owner</label><textarea class="textarea" name="message">I can help and will wait for confirmation before going to the exact location.</textarea></div>
      <button class="btn full coral" type="submit" ${claimed ? "disabled" : ""}>${claimed ? "Already claimed" : "Claim task safely"}</button>
    </form>
  `;
}

function renderCreate() {
  return `
    ${renderTop("Create a case", `<button class="icon-btn" data-go="notifications">${icon("bell")}</button>`)}
    <div class="segment">
      ${["rescue", "adopt", "donation"].map((mode) => `<button class="${ui.createMode === mode ? "active" : ""}" data-create-mode="${mode}">${mode[0].toUpperCase() + mode.slice(1)}</button>`).join("")}
    </div>
    <form class="form" data-form="create">
      <div class="field"><label>Pet name or temporary name</label><input class="input" name="petName" placeholder="e.g. Lucky"></div>
      <div class="row">
        <div class="field" style="width:48%"><label>Pet type</label><select class="select" name="species"><option>Cat</option><option>Dog</option><option>Rabbit</option></select></div>
        <div class="field" style="width:48%"><label>Urgency</label><select class="select" name="urgency"><option>Medium</option><option>High</option><option>Critical</option></select></div>
      </div>
      <div class="field"><label>Approximate location only</label><input class="input" name="location" placeholder="Area, campus, or nearby landmark"></div>
      <div class="field"><label>What happened?</label><textarea class="textarea" name="description" placeholder="Explain what help is needed"></textarea></div>
      <div class="card">
        <div class="row"><h3>Add photos</h3><span class="pill blue">0/3</span></div>
        <p style="margin-top:7px">Clear photos help nearby volunteers verify the case and respond faster.</p>
      </div>
      <button class="btn full" type="submit">Publish case</button>
    </form>
  `;
}

function renderDonation() {
  const item = getCase(route.id) || state.cases[0];
  const left = Math.max(0, item.goal - item.pledged);
  return `
    ${renderBackTop("Donation pledge", item.petName)}
    <div class="card">
      <div class="row"><h3>${escapeHtml(item.title)}</h3><span class="pill hot">${money(left)} left</span></div>
      <p style="margin-top:7px">Funds are tracked publicly after receipt and community review.</p>
      <div class="metric-grid">
        <div class="metric"><div><strong>${money(item.pledged)}</strong><span>pledged</span></div></div>
        <div class="metric"><div><strong>${money(item.goal)}</strong><span>goal</span></div></div>
        <div class="metric"><div><strong>${item.trusted}%</strong><span>trusted</span></div></div>
      </div>
    </div>
    <div style="height:12px"></div>
    <form class="form" data-form="donation" data-id="${item.id}">
      <div class="field"><label>Pledge amount</label><input class="input" name="amount" type="number" min="1" value="50"></div>
      <div class="field"><label>Support type</label><select class="select" name="type"><option>Medical</option><option>Food</option><option>Transport</option></select></div>
      <div class="card">
        <div class="row"><h3>Transparency timeline</h3><span class="pill">Public</span></div>
        <div class="timeline" style="margin-top:12px">
          <div class="timeline-item"><div class="timeline-dot">1</div><div><h3>Pledge locked</h3><p>Donor commits support to this case.</p></div></div>
          <div class="timeline-item"><div class="timeline-dot">2</div><div><h3>Receipt reviewed</h3><p>Community checks proof before funds are marked used.</p></div></div>
          <div class="timeline-item"><div class="timeline-dot">3</div><div><h3>Closure update</h3><p>Case owner posts outcome photo and spending note.</p></div></div>
        </div>
      </div>
      <button class="btn full coral" type="submit">Confirm pledge</button>
    </form>
  `;
}

function renderPetDetail() {
  const pet = getPet(route.id) || state.pets[0];
  const application = state.applications.find((app) => app.petId === pet.id);
  return `
    <div class="detail-photo">
      <img src="${pet.image}" alt="${escapeHtml(pet.name)}">
      <button class="icon-btn" data-back style="position:absolute;top:16px;left:18px;z-index:5">${icon("back")}</button>
      <div class="detail-title"><h2>${escapeHtml(pet.name)}</h2><div style="height:8px"></div><span class="pill">${application ? "Under review" : pet.status}</span></div>
    </div>
    <div class="sheet">
      <div class="card">
        <div class="row"><div><h3>${escapeHtml(pet.species)} - ${escapeHtml(pet.age)}</h3><p>${escapeHtml(pet.owner)} - ${escapeHtml(pet.distance)}</p></div><span class="pill">${pet.match}% match</span></div>
        <p style="margin-top:9px">${escapeHtml(pet.description)}</p>
        <div class="chips" style="margin-top:12px;margin-bottom:0">${pet.traits.map((trait) => `<span class="chip teal">${escapeHtml(trait)}</span>`).join("")}</div>
      </div>
      <div style="height:12px"></div>
      <form class="form" data-form="adoption" data-id="${pet.id}">
        <div class="field"><label>Home type</label><input class="input" name="home" value="${application ? escapeHtml(application.home) : ""}" placeholder="Apartment, landed house, campus room"></div>
        <div class="field"><label>Pet experience</label><input class="input" name="experience" value="${application ? escapeHtml(application.experience) : ""}" placeholder="Tell the owner about your care experience"></div>
        <div class="field"><label>Why are you a good fit?</label><textarea class="textarea" name="reason" placeholder="Share your adoption plan">${application ? escapeHtml(application.reason) : ""}</textarea></div>
        <button class="btn full" type="submit" ${application ? "disabled" : ""}>${application ? "Application under review" : "Submit application"}</button>
      </form>
    </div>
  `;
}

function renderNotifications() {
  return `
    ${renderTop("Updates", `<button class="btn small light" data-action="mark-read">Mark read</button>`)}
    <div class="stack">
      ${state.notifications.length ? state.notifications.map((item) => `
        <article class="task" data-notification="${item.id}">
          <div class="round-icon ${item.read ? "teal" : "coral"}">${icon(item.read ? "shield" : "bell")}</div>
          <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></div>
          <span class="pill ${item.read ? "" : "hot"}">${escapeHtml(item.time)}</span>
        </article>
      `).join("") : renderEmpty("bell", "No updates", "New rescue, donation, and adoption activity will appear here.")}
    </div>
  `;
}

function renderProfile() {
  const helped = state.tasks.filter((task) => task.status === "claimed").length + 16;
  return `
    ${renderTop("Profile", `<button class="icon-btn" data-go="settings">${icon("settings")}</button>`)}
    <div class="profile-card">
      <div class="row"><div><h2>${escapeHtml(state.user.name)}</h2><p>${escapeHtml(state.user.role)} - verified donor</p></div><img class="avatar" src="${state.user.avatar}" alt=""></div>
      <div class="badge-grid">${state.user.badges.map((badge) => `<div class="badge">${escapeHtml(badge)}</div>`).join("")}</div>
    </div>
    <div style="height:12px"></div>
    <div class="metric-grid">
      <div class="metric"><div><strong>${helped}</strong><span>cases helped</span></div></div>
      <div class="metric"><div><strong>${state.user.rating}</strong><span>rating</span></div></div>
      <div class="metric"><div><strong>${unreadCount()}</strong><span>new updates</span></div></div>
    </div>
    <div style="height:12px"></div>
    <div class="stack">
      <article class="card clickable" data-go="dashboard"><div class="row"><h3>Community impact</h3><span class="pill">Live</span></div><p style="margin-top:7px">Track rescue activity, donation transparency, and adoption outcomes.</p></article>
      <article class="card clickable" data-go="notifications"><div class="row"><h3>Notifications</h3><span class="pill hot">${unreadCount()} new</span></div><p style="margin-top:7px">Review comments, task updates, and application status.</p></article>
      <article class="card clickable" data-go="settings"><div class="row"><h3>Privacy and safety</h3><span class="pill">On</span></div><p style="margin-top:7px">Phone and exact address stay hidden until confirmation.</p></article>
    </div>
  `;
}

function renderDashboard() {
  const adopted = state.applications.length;
  const pledged = state.cases.reduce((sum, item) => sum + item.pledged, 0);
  const completedTasks = state.tasks.filter((task) => task.status === "claimed").length;
  return `
    ${renderBackTop("Community impact")}
    <div class="metric-grid">
      <div class="metric"><div><strong>${state.cases.length}</strong><span>cases posted</span></div></div>
      <div class="metric"><div><strong>${adopted}</strong><span>applications</span></div></div>
      <div class="metric"><div><strong>${completedTasks}</strong><span>tasks claimed</span></div></div>
    </div>
    <div style="height:12px"></div>
    <div class="card">
      <div class="row"><h3>Donation transparency</h3><span class="pill warn">Monthly</span></div>
      <div class="donut" data-total="${money(pledged)}"></div>
      <p>Money, medical, food, and transport support tracked publicly with receipt review.</p>
    </div>
    <div style="height:12px"></div>
    <div class="stack">
      ${state.cases.map((item) => `
        <article class="task" data-case="${item.id}">
          <div class="round-icon teal">${Math.round((item.pledged / item.goal) * 100)}%</div>
          <div><h3>${escapeHtml(item.petName)}</h3><p>${money(item.pledged)} pledged of ${money(item.goal)} goal.</p></div>
          <span class="pill">${caseOpenTasks(item.id).length} tasks</span>
        </article>
      `).join("")}
    </div>
  `;
}

function renderSettings() {
  return `
    ${renderBackTop("Settings")}
    <div class="stack">
      <div class="card"><div class="row"><h3>Privacy mode</h3><span class="pill">On</span></div><p style="margin-top:7px">Approximate location is shown publicly. Exact pickup point stays private until confirmation.</p></div>
      <div class="card"><div class="row"><h3>Donation proof</h3><span class="pill warn">Required</span></div><p style="margin-top:7px">Medical and donation cases require receipt or closure proof before marked complete.</p></div>
      <button class="btn full light" data-action="reset-demo">Reset demo data</button>
    </div>
  `;
}

function renderEmpty(iconName, title, text) {
  return `<div class="empty">${icon(iconName)}<h3>${escapeHtml(title)}</h3><p style="margin-top:7px">${escapeHtml(text)}</p></div>`;
}

function fieldError(form, name, message) {
  const field = form.querySelector(`[name="${name}"]`)?.closest(".field");
  if (!field) return;
  field.classList.add("error");
  field.insertAdjacentHTML("beforeend", `<span class="error-text">${escapeHtml(message)}</span>`);
}

function clearErrors(form) {
  form.querySelectorAll(".field.error").forEach((field) => field.classList.remove("error"));
  form.querySelectorAll(".error-text").forEach((item) => item.remove());
}

function validateRequired(form, names) {
  clearErrors(form);
  let valid = true;
  names.forEach((name) => {
    const value = form.elements[name]?.value.trim();
    if (!value) {
      valid = false;
      fieldError(form, name, "Required");
    }
  });
  return valid;
}

function handleForm(form) {
  const type = form.dataset.form;
  if (type === "login") {
    showToast("Logged in");
    go("feed");
  }
  if (type === "comment") {
    if (!validateRequired(form, ["comment"])) return;
    const item = getCase(form.dataset.id);
    item.comments.unshift({ id: `c-${Date.now()}`, author: state.user.name, text: form.elements.comment.value.trim(), time: "now" });
    notify("Update posted", `Your update was added to ${item.petName}.`, item.id);
    saveState();
    showModal("Update posted", "Your comment now appears in the community updates.", "View updates", { name: "notifications" });
    render();
  }
  if (type === "claim") {
    if (!validateRequired(form, ["availability", "message"])) return;
    const task = getTask(form.dataset.id);
    task.status = "claimed";
    task.claimedBy = state.user.name;
    const item = getCase(task.caseId);
    notify("Task claimed", `${task.title} is now assigned to you.`, item.id);
    saveState();
    showModal("Task claimed", "The case owner can now confirm details while exact location stays protected.", "View updates", { name: "notifications" });
    render();
  }
  if (type === "donation") {
    if (!validateRequired(form, ["amount", "type"])) return;
    const amount = Number(form.elements.amount.value);
    if (!amount || amount < 1) return fieldError(form, "amount", "Enter a valid amount");
    const item = getCase(form.dataset.id);
    item.pledged += amount;
    state.donations.unshift({ id: `d-${Date.now()}`, caseId: item.id, amount, type: form.elements.type.value, status: "Pledged", from: state.user.name });
    notify("Donation pledged", `${money(amount)} pledge added to ${item.petName}.`, item.id);
    saveState();
    showModal("Pledge confirmed", "Your support is now visible in the transparency timeline.", "View case", { name: "case", id: item.id });
    render();
  }
  if (type === "adoption") {
    if (!validateRequired(form, ["home", "experience", "reason"])) return;
    const pet = getPet(form.dataset.id);
    state.applications.push({
      id: `a-${Date.now()}`,
      petId: pet.id,
      home: form.elements.home.value.trim(),
      experience: form.elements.experience.value.trim(),
      reason: form.elements.reason.value.trim(),
      status: "Under review"
    });
    notify("Application submitted", `${pet.name}'s owner is reviewing your profile.`, pet.id);
    saveState();
    showModal("Application submitted", "Your adoption application is now under review.", "View updates", { name: "notifications" });
    render();
  }
  if (type === "create") {
    if (!validateRequired(form, ["petName", "location", "description"])) return;
    const petName = form.elements.petName.value.trim();
    const newCase = {
      id: `case-${Date.now()}`,
      type: ui.createMode === "donation" ? "donation" : "rescue",
      title: `${petName} needs community support`,
      petName,
      species: form.elements.species.value,
      urgency: form.elements.urgency.value,
      status: "Open",
      distance: "Nearby",
      location: form.elements.location.value.trim(),
      owner: state.user.name,
      time: "now",
      trusted: 58,
      pledged: 0,
      goal: 180,
      image: form.elements.species.value === "Dog" ? "assets/pet_6_1.png" : "assets/pet_4_3.png",
      tags: ["new", ui.createMode, form.elements.urgency.value.toLowerCase()],
      description: form.elements.description.value.trim(),
      tasks: [],
      comments: [{ id: `c-${Date.now()}`, author: state.user.name, text: "Case created. Waiting for community verification.", time: "now" }],
      trust: [["Community verification", "New cases need trusted users to verify details.", "Pending"]]
    };
    state.cases.unshift(newCase);
    notify("Case published", `${petName} is now visible to nearby helpers.`, newCase.id);
    saveState();
    showModal("Case published", "Nearby volunteers can now find, verify, and respond to this case.", "View case", { name: "case", id: newCase.id });
    render();
  }
}

document.addEventListener("submit", (event) => {
  const form = event.target.closest("form");
  if (!form) return;
  event.preventDefault();
  const button = form.querySelector("button[type='submit']");
  if (button) {
    button.disabled = true;
    const original = button.textContent;
    button.textContent = "Working...";
    setTimeout(() => {
      button.disabled = false;
      button.textContent = original;
      handleForm(form);
    }, 280);
  } else {
    handleForm(form);
  }
});

document.addEventListener("click", (event) => {
  const backButton = event.target.closest("[data-back]");
  if (backButton) return back();

  const closeModal = event.target.closest("[data-close-modal]");
  if (closeModal) {
    modal.hidden = true;
    return;
  }

  const tab = event.target.closest("[data-tab]")?.dataset.tab;
  if (tab) return go(tab);

  const goButton = event.target.closest("[data-go]");
  if (goButton) return go(goButton.dataset.go, goButton.dataset.id || null);

  const caseCard = event.target.closest("[data-case]");
  if (caseCard) return go("case", caseCard.dataset.case);

  const petCard = event.target.closest("[data-pet]");
  if (petCard) return go("pet", petCard.dataset.pet);

  const taskRow = event.target.closest("[data-task]");
  if (taskRow) return go("task", taskRow.dataset.task);

  const notification = event.target.closest("[data-notification]");
  if (notification) {
    const item = state.notifications.find((note) => note.id === notification.dataset.notification);
    if (item) item.read = true;
    saveState();
    if (item?.target?.startsWith("case-")) return go("case", item.target);
    if (item?.target?.startsWith("pet-")) return go("pet", item.target);
    return render();
  }

  const filter = event.target.closest("[data-filter-key]");
  if (filter) {
    ui[filter.dataset.filterKey] = filter.dataset.filterValue;
    return render();
  }

  const createMode = event.target.closest("[data-create-mode]");
  if (createMode) {
    ui.createMode = createMode.dataset.createMode;
    return render();
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "mark-read") {
    state.notifications.forEach((item) => item.read = true);
    saveState();
    showToast("All updates marked read");
    return render();
  }
  if (action === "fake-account") {
    showModal("Account ready", "Your profile is ready to browse cases, apply for adoption, and help nearby rescues.", "Enter app", { name: "feed" });
    return;
  }
  if (action === "toggle-filter") {
    showToast("Filters update the visible results");
    return;
  }
  if (action === "reset-demo") {
    localStorage.removeItem(STORAGE_KEY);
    state = clone(window.PawPalSeed);
    ui = { query: "", feedFilter: "all", taskFilter: "open", createMode: "rescue", exploreFilter: "all" };
    showModal("Demo reset", "All simulated actions were cleared.", "Back to feed", { name: "feed" });
    render();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-search]")) {
    ui.query = event.target.value;
    clearTimeout(window.__searchTimer);
    window.__searchTimer = setTimeout(render, 160);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") back();
});

window.addEventListener("hashchange", () => {
  route = parseHash();
  render();
});

route = parseHash();
render();
