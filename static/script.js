let processCount = 1;
let processes = [];

function addProcess() {
    const container = document.getElementById('process-list');
    const id = `P${processCount++}`;
    
    const div = document.createElement('div');
    div.className = "flex items-center space-x-4 mb-4 animate-fade-in";
    div.id = `row-${id}`;
    div.innerHTML = `
        <span class="bg-emerald-500 px-4 py-2 rounded-lg font-bold w-16 text-center">${id}</span>
        <input type="number" placeholder="Arrival" class="bg-gray-800 border-none rounded-lg p-2 w-24 at-input">
        <input type="number" placeholder="Burst" class="bg-gray-800 border-none rounded-lg p-2 w-24 bt-input">
        <button onclick="removeProcess('${id}')" class="text-red-500 hover:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
    `;
    container.appendChild(div);
    updateChart();
}

function removeProcess(id) {
    document.getElementById(`row-${id}`).remove();
    const remaining = document.querySelectorAll('#process-list > div');
    if (remaining.length === 0) processCount = 1;
    updateChart();
}

function endAll() {
    document.getElementById('process-list').innerHTML = '';
    processCount = 1;
    updateChart();
}

async function updateChart() {
    const rows = document.querySelectorAll('#process-list > div');
    let data = [];
    rows.forEach(row => {
        data.push({
            name: row.querySelector('span').innerText,
            at: row.querySelector('.at-input').value || 0,
            bt: row.querySelector('.bt-input').value || 0
        });
    });

    if (data.length === 0) {
        document.getElementById('gantt-chart').innerHTML = '';
        return;
    }

    const response = await fetch('/calculate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({processes: data})
    });
    const result = await response.json();
    renderGantt(result.gantt);
    localStorage.setItem('simulationResults', JSON.stringify(result.stats));
}

function renderGantt(gantt) {
    const chart = document.getElementById('gantt-chart');
    chart.innerHTML = '';
    gantt.forEach(step => {
        const block = document.createElement('div');
        block.className = "h-12 border-r border-gray-700 flex items-center justify-center text-xs";
        block.style.flex = "1";
        block.style.backgroundColor = step.id === 'Idle' ? '#374151' : '#10b981';
        block.innerText = step.id;
        chart.appendChild(block);
    });
}