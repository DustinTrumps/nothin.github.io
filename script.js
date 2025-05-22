let currentFieldIndex = 0;
const fieldImages = ['redField.png', 'blueField.png'];

function showPage(pageNum) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(`page${pageNum}`);
  if (page) {
    page.classList.add('active');
    if (pageNum === 2) updateFieldImage(true);
  }
}

function validatePage(current, next) {
  showPage(next);
}

function updateFieldImage(fromRole = false) {
  const role = document.getElementById('roleSelect')?.value;
  const fieldImg = document.getElementById('fieldImg');
  const page2 = document.getElementById('page2');

  if (!fieldImg || !role) return;

  currentFieldIndex = role.startsWith('red') ? 0 : 1;
  fieldImg.src = fieldImages[currentFieldIndex];

  if (currentFieldIndex === 0) {
    page2.classList.add('red-alliance');
    page2.classList.remove('blue-alliance');
  } else {
    page2.classList.add('blue-alliance');
    page2.classList.remove('red-alliance');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const getRobotBtn = document.getElementById('getRobotBtn');
  const nextBtnPage1 = document.getElementById('nextBtnPage1');

  if (getRobotBtn) {
    getRobotBtn.addEventListener('click', async () => {
      const eventKey = document.getElementById('eventKey').value;
      const matchNumber = parseInt(document.getElementById('matchNumber').value);
      const role = document.getElementById('roleSelect').value;
      const display = document.getElementById('assignedTeamDisplay');

      if (!eventKey || !matchNumber || !role) {
        display.textContent = 'Please fill out all fields first.';
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
        display.textContent = `Team: ${alliance[index].replace('frc', '')}`;
      } catch (err) {
        display.textContent = 'Error fetching match data.';
      }
    });
  }

  if (nextBtnPage1) {
    nextBtnPage1.addEventListener('click', () => {
      showPage(2);
    });
  }

  document.getElementById('roleSelect').addEventListener('change', () => {
    updateFieldImage(true);
  });
});

function Finish() {
  const matchInput = document.getElementById('matchNumber');
  let matchNum = parseInt(matchInput.value) || 1;
  matchInput.value = matchNum + 1;

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
