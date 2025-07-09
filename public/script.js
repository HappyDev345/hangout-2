async function getAvailability() {
  const res = await fetch('/get');
  const data = await res.json();
  const counts = {};

  for (const user in data) {
    data[user].forEach(slot => {
      counts[slot] = (counts[slot] || 0) + 1;
    });
  }

  let resultHTML = "";
  for (const slot in counts) {
    resultHTML += `<p><strong>${slot}</strong>: ${counts[slot]} people</p>`;
  }
  document.getElementById('results').innerHTML = resultHTML;
}

async function submit() {
  const name = document.getElementById('name').value.trim();
  if (!name) return alert("Enter your name!");

  const selected = Array.from(document.querySelectorAll('.slot:checked'))
                        .map(cb => cb.value);
  if (selected.length === 0) return alert("Select at least one time slot!");

  await fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, slots: selected })
  });

  getAvailability();
}
getAvailability();
