const MODULES = ["Reception", "Laboratory", "Pharmacy", "Interpreter"];
let patients = JSON.parse(localStorage.getItem("patients") || "[]");

function save() {
  localStorage.setItem("patients", JSON.stringify(patients));
}

function openModule(name) {
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("modulePanel").classList.remove("hidden");
  document.getElementById("moduleTitle").textContent = name;
  document.getElementById("patientForm").dataset.module = name;
  renderPatients();
}

function closeModule() {
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("modulePanel").classList.add("hidden");
}

function submitForm(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    id: Date.now(),
    name: form.name.value,
    age: form.age.value,
    condition: form.condition.value,
    notes: form.notes.value,
    stage: form.dataset.module,
    history: [{ ts: new Date().toISOString(), action: `Added to ${form.dataset.module}` }]
  };
  patients.push(data);
  save();
  renderPatients();
  renderLog();
  form.reset();
}

function renderPatients() {
  const list = document.getElementById("patientList");
  const module = document.getElementById("patientForm").dataset.module;
  list.innerHTML = "";
  patients
    .filter(p => p.stage === module)
    .forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${p.name}</strong> (${p.age}) — ${p.condition}<br>
        <small>${p.notes || ""}</small><br>
        <button onclick="sendNext(${p.id})">Send to Next</button>
        <button onclick="removePatient(${p.id})">Remove</button>
      `;
      list.appendChild(li);
    });
}

function sendNext(id) {
  patients = patients.map(p => {
    if (p.id === id) {
      const nextIndex = (MODULES.indexOf(p.stage) + 1) % MODULES.length;
      const nextStage = MODULES[nextIndex];
      p.stage = nextStage;
      p.history.push({ ts: new Date().toISOString(), action: `Sent to ${nextStage}` });
    }
    return p;
  });
  save();
  renderPatients();
  renderLog();
}

function removePatient(id) {
  patients = patients.filter(p => p.id !== id);
  save();
  renderPatients();
  renderLog();
}

function renderLog() {
  const log = document.getElementById("activityLog");
  log.innerHTML = "";
  patients.slice().reverse().forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${p.name}</strong> — ${p.stage}<br>
      ${p.history.map(h => `${new Date(h.ts).toLocaleString()} • ${h.action}`).join("<br>")}`;
    log.appendChild(li);
  });
}

window.onload = renderLog;
