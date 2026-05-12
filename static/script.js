let processCount = 1;

function addProcess() {
    const list = document.getElementById('process-list');
    const id = `P${processCount++}`;
    
    const row = document.createElement('div');
    row.className = "flex items-center gap-4 mb-4";
    row.innerHTML = `
        <span class="bg-red-500 text-white font-bold py-3 px-6 rounded-xl w-20 text-center">${id}</span>
        <input type="number" class="at-input bg-white text-black p-3 rounded-xl border border-gray-300 w-full" placeholder="INPUT NUMBER">
        <input type="number" class="bt-input bg-white text-black p-3 rounded-xl border border-gray-300 w-full" placeholder="INPUT NUMBER">
        <button onclick="removeRow(this)" class="text-red-500">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
    `;

    list.appendChild(row);

    // Auto-update chart whenever a number is typed
    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updateChart);
    });
}

function removeRow(btn) {
    btn.parentElement.remove();
    if (document.querySelectorAll('#process-list > div').length === 0) {
        processCount = 1;
    }
    updateChart();
}

async function updateChart() {
    const rows = document.querySelectorAll('#process-list > div');
    const processes = Array.from(rows).map(row => ({
        name: row.querySelector('span').innerText,
        at: row.querySelector('.at-input').value,
        bt: row.querySelector('.bt-input').value
    })).filter(p => p.at !== "" && p.bt !== "");

    if (processes.length === 0) return;

    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ processes })
        });
        const data = await response.json();
        renderGantt(data.gantt);
        localStorage.setItem('simulationResults', JSON.stringify(data.stats));
    } catch (e) {
        console.error("Calculation failed", e);
    }
}