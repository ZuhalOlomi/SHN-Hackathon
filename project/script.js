let currentProfile = null;
let currentChoice = null;
let currentPatient = null;

document.getElementById("patient-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  currentPatient = data;

  currentProfile = classifyPatient(data);
  const options = getOptionsForProfile(currentProfile);

  // Update UI
  document.getElementById("profile-text").textContent =
    `Profile: ${currentProfile}`;
  const optionsList = document.getElementById("options-list");
  optionsList.innerHTML = "";

  options.forEach((opt, idx) => {
    const div = document.createElement("div");
    div.className = "form-check mb-2";
    div.innerHTML = `
      <input class="form-check-input" type="radio" name="treatmentOption" value="${opt}" id="opt${idx}">
      <label class="form-check-label" for="opt${idx}">${opt}</label>
    `;
    optionsList.appendChild(div);
  });

  document.getElementById("options-section").classList.remove("d-none");
  document.getElementById("result-section").classList.add("d-none");
  document.getElementById("simulate-btn").disabled = true;

  optionsList.addEventListener("change", (evt) => {
    if (evt.target.name === "treatmentOption") {
      currentChoice = evt.target.value;
      document.getElementById("simulate-btn").disabled = false;
    }
  }, { once: true });
});

document.getElementById("simulate-btn").addEventListener("click", async () => {
  if (!currentProfile || !currentChoice) return;

  document.getElementById("simulate-btn").textContent = "Thinking...";
  document.getElementById("simulate-btn").disabled = true;

  try {
    const res = await fetch("explain.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: currentProfile,
        choice: currentChoice,
        patient: currentPatient
      })
    });

    const data = await res.json();

    document.getElementById("choice-text").textContent = currentChoice;
    document.getElementById("explanation-text").textContent = data.explanation;

    document.getElementById("result-section").classList.remove("d-none");
  } catch (err) {
    console.error(err);
    alert("Error calling AI explanation. Check console.");
  } finally {
    document.getElementById("simulate-btn").textContent = "Simulate Outcome (AI)";
    document.getElementById("simulate-btn").disabled = false;
  }
});

function classifyPatient(data) {
  const has_ascvd = data.has_ascvd === "yes";
  const has_hf = data.has_hf === "yes";
  const has_ckd = data.has_ckd === "yes";
  const bmi = parseFloat(data.bmi || "0");
  const a1c = parseFloat(data.a1c || "7.5");

  if (has_hf || has_ckd) return "cardiorenal_high_risk";
  if (has_ascvd) return "ascvd";
  if (bmi >= 30 && a1c >= 7.0) return "obesity_high_risk";
  return "standard_new_t2dm";
}

function getOptionsForProfile(profile) {
  if (profile === "cardiorenal_high_risk" || profile === "ascvd") {
    return [
      "Add SGLT2 inhibitor",
      "Add GLP-1 receptor agonist",
      "Add sulfonylurea"
    ];
  } else if (profile === "obesity_high_risk") {
    return [
      "Add GLP-1 receptor agonist (high dose)",
      "Add SGLT2 inhibitor",
      "Add DPP-4 inhibitor"
    ];
  } else {
    return [
      "Start metformin monotherapy",
      "Start metformin + sulfonylurea",
      "Use lifestyle only for now"
    ];
  }
}