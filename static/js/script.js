let counter = 1;
const colors = ['#FF5F5F', '#FF6BCB', '#4BC0FF', '#FFB84D', '#2ECC71', '#9B59B6'];

function addProcess() {
    const list = document.getElementById('process-list');
    const name = `P${counter++}`;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const div = document.createElement('div');
    div.className = "flex items-center gap-6";
    div.innerHTML = `
        <div class="w-24 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg" style="background-color: ${color}">${name}</div>
        <input type="number" placeholder="INPUT NUMBER" class="at-input flex-1 p-5 rounded-2xl text-black text-2xl font-semibold border-none outline-none">
        <input type="number" placeholder="INPUT NUMBER" class="bt-input flex-1 p-5 rounded-2xl text-black text-2xl font-semibold border-none outline-none">
        <button onclick="removeThis(this)" class="text-red-500 hover:scale-110 transition-transform">
            <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm3 3a1 1 0 112 0v9a1 1 0 11-2 0V5z"/></svg>
        </button>
    `;
    list.appendChild(div);
    div.querySelectorAll('input').forEach(i => i.addEventListener('input', updateUI));
}

function removeThis(btn) {
    btn.closest('div').remove();
    if (document.querySelectorAll('#process-list > div').length === 0) counter = 1;
    updateUI();
}

function endAll() {
    document.getElementById('process-list').innerHTML = '';
    counter = 1;
    updateUI();
}

async function updateUI() {
    const rows = document.querySelectorAll('#process-list > div');
    const processes = Array.from(rows).map(row => ({
        name: row.querySelector('div').innerText,
        at: row.querySelector('.at-input').value,
        bt: row.querySelector('.bt-input').value,
        color: row.querySelector('div').style.backgroundColor
    })).filter(p => p.at !== "" && p.bt !== "");

    if (processes.length === 0) {
        document.getElementById('cpu-scale').innerHTML = '';
        return;
    }

    const response = await fetch('/calculate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ processes })
    });
    const data = await response.json();
    localStorage.setItem('simulationResults', JSON.stringify({stats: data.stats, processes}));
    renderScale(data.gantt, processes);
}

function renderScale(gantt, processes) {
    const scale = document.getElementById('cpu-scale');
    scale.innerHTML = '';
    gantt.slice().reverse().forEach(step => {
        const p = processes.find(proc => proc.name === step.id);
        const block = document.createElement('div');
        block.className = "w-full border-b border-gray-900/20 flex items-center justify-center text-white font-bold text-lg min-h-[40px]";
        block.style.backgroundColor = step.id === 'Idle' ? '#374151' : p.color;
        block.innerText = step.id;
        scale.appendChild(block);
    });
}