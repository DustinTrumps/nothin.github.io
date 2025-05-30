/*
let globalTeamNum = "";
let globalTeamColor = "";
let globalMode = "auto";

//placeholders
const qrTitle = "Scan me!";
var qrData = "";
var qrData1 = "";
var qrData2 = "";
var startPos, autoPieceData;
var mobility = "no";
var teleOpPieceData;
var qrData4 = "";
var eventName;
var scoredL1 = 0;
var scoredL2 = 0;
var scoredL3 = 0;
var scoredL4 = 0;
var scoredProcessor = 0;
var scoredNet = 0;
var missedReef = 0;
var missedNet = 0;
var missedProcessor = 0;
var heldPieceID = "0p";

var globMatchNum = 0;

//for backup
var lastQrData;

//for handling undo
var lastAction;
var lastHeldPiece;
var lastScoringLocation;

//for calculations
var autoArr = [];
var teleArr = [];

//used for timestamp tracking
var heldPiece = "0p";

[
  "assignRobot",
  "dropped1",
  "droppedAuto",
  "generateCSV",
  "logPiece",
  "logStart",
  "mobilityToggle",
  "refreshSchedule",
  "scoredPiece",
  "showHistory",
  "teleOpMissUpdateScore",
  "undoAuto",
  "undoTeleOp"
]


*/
let globalTeamNum = "";
let globalTeamColor = "";

(() => {
  let currentFieldIndex = 0;
  const fieldImages = ['./assets/redField.png', './assets/blueField.png'];

  function showPage(pageNum) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(`page${pageNum}`);
    if (page) {
      page.classList.add('active');
      if (pageNum === 2) updateFieldImage(true);
      window.scrollTo(0, 0);
      updateTeamHeader(globalTeamNum, globalTeamColor);
    }
  }

  function validatePage(current, next) {
    const page = document.getElementById(`page${current}`);
    if (!page) return;

    const inputs = page.querySelectorAll('input, select, textarea');
    for (const input of inputs) {
      if (!input.checkValidity()) {
        input.reportValidity();
        return;
      }
    }

    showPage(next);
  }

  function updateFieldImage(fromRole = false) {
    const role = document.getElementById('roleSelect')?.value;
    const fieldImg = document.getElementById('fieldImg');
    const autoFieldImg = document.getElementById('autoFieldImg');
    const page2 = document.getElementById('page2');
    const page3 = document.getElementById('page3');

    if (!role) return;

    currentFieldIndex = role.startsWith('red') ? 0 : 1;

    if (fieldImg) fieldImg.src = fieldImages[currentFieldIndex];
    if (autoFieldImg) autoFieldImg.src = fieldImages[currentFieldIndex];

    const allianceClass = currentFieldIndex === 0 ? 'red-alliance' : 'blue-alliance';

    page2?.classList.remove('red-alliance', 'blue-alliance');
    page3?.classList.remove('red-alliance', 'blue-alliance');
    page2?.classList.add(allianceClass);
    page3?.classList.add(allianceClass);
  }

  // === NEW FUNCTION: Update fixed team header bar ===
function updateTeamHeader(teamNum, teamColorName) {
  const activePage = document.querySelector('.page.active');
  if (!activePage) return;

  const teamHeader = activePage.querySelector('.teamHeader');
  if (!teamHeader) return;

  const teamNumberText = teamHeader.querySelector('.teamNumberText');
  teamNumberText.textContent = `TEAM: ${teamNum}, ${teamColorName}`;
}


  async function getTeam() {
    const eventKey = document.getElementById('eventKey').value;
    const matchNumber = parseInt(document.getElementById('matchNumber').value);
    const role = document.getElementById('roleSelect').value;
    const display = document.getElementById('assignedTeamDisplay');

    if (!eventKey || !matchNumber || !role) {
      display.textContent = 'Please fill out all fields first.';
      return;
    }

    if (typeof TBA_KEY === 'undefined') {
      display.textContent = 'API key missing. Please check key.js';
      return;
    }

    const matchKey = `${eventKey}_qm${matchNumber}`;
    const url = `https://www.thebluealliance.com/api/v3/match/${matchKey}`;
    try {
      const res = await fetch(url, {
        headers: { 'X-TBA-Auth-Key': TBA_KEY }
      });
      if (!res.ok) throw new Error('Match not found');
      const data = await res.json();
      const alliance = role.startsWith('red') ? data.alliances.red.team_keys : data.alliances.blue.team_keys;
      const index = parseInt(role.slice(-1)) - 1;

      if (index < 0 || index > 2 || !alliance[index]) {
        display.textContent = 'Invalid role or team data.';
        return;
      }

      // Set the global team number and color
      globalTeamNum = alliance[index].replace('frc', '');
      globalTeamColor = role.startsWith('red') ? 'red' : 'blue';

      display.textContent = `Team: ${globalTeamNum}`;

      // Update the fixed header team display
      updateTeamHeader(globalTeamNum, globalTeamColor);

    } catch (err) {
      display.textContent = `Error: ${err.message}`;
    }
  }


  function Finish() {
    const matchInput = document.getElementById('matchNumber');
    let matchNum = parseInt(matchInput.value) || 1;
    matchInput.value = matchNum + 1;

    localStorage.removeItem('scoutForm');
    showPage(1);
  }

  function popupFn(id) {
    document.getElementById(`${id}Overlay`).style.display = "block";
    document.getElementById(`${id}Dialog`).style.display = "block";
  }

  function closeFn(id) {
    document.getElementById(`${id}Overlay`).style.display = "none";
    document.getElementById(`${id}Dialog`).style.display = "none";
  }

  window.addEventListener('DOMContentLoaded', () => {
    const saved = JSON.parse(localStorage.getItem('scoutForm') || '{}');
    document.getElementById('eventKey').value = saved.eventKey || '2025pncmp';
    document.getElementById('roleSelect').value = saved.roleSelect || '';
    document.getElementById('scoutName').value = saved.scoutName || '';
    document.getElementById('matchNumber').value = saved.matchNumber || 1;

    document.getElementById('getRobotBtn')?.addEventListener('click', getTeam);

    // NEXT buttons with validation (except last page maybe)
    const nextButtonsWithValidation = [
      { btnId: 'nextBtnPage1', from: 1, to: 2 },
      { btnId: 'nextBtnPage2', from: 2, to: 3 },
      { btnId: 'nextBtnPage3', from: 3, to: 4 },
      { btnId: 'nextBtnPage4', from: 4, to: 5 },
      { btnId: 'nextBtnPage5', from: 5, to: 6 }
    ];
    nextButtonsWithValidation.forEach(({ btnId, from, to }) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', () => validatePage(from, to));
      }
    });

    // BACK buttons just show previous page
    const backButtons = [
      { btnId: 'backBtnPage2', to: 1 },
      { btnId: 'backBtnPage3', to: 2 },
      { btnId: 'backBtnPage4', to: 3 },
      { btnId: 'backBtnPage5', to: 4 },
      { btnId: 'backBtnPage6', to: 5 } // If you add this button in future
    ];
    backButtons.forEach(({ btnId, to }) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', () => showPage(to));
      }
    });

    document.getElementById('roleSelect')?.addEventListener('change', () => updateFieldImage(true));

    // Initialize team header with empty or last known team
    updateTeamHeader(globalTeamNum || '0000', globalTeamColor || '');
  });

  window.addEventListener('beforeunload', () => {
    localStorage.setItem('scoutForm', JSON.stringify({
      eventKey: document.getElementById('eventKey').value,
      roleSelect: document.getElementById('roleSelect').value,
      scoutName: document.getElementById('scoutName').value,
      matchNumber: document.getElementById('matchNumber').value
    }));
  });

  window.showPage = showPage;
  window.validatePage = validatePage;
  window.popupFn = popupFn;
  window.closeFn = closeFn;
  window.Finish = Finish;
})();
