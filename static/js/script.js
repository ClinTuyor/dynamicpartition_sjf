let counter = 1;
const colors = ['#FF5F5F', '#FF69B4', '#38BDF8', '#FBBF24', '#10B981', '#8B5CF6'];

function addProcess() {
    const list = document.getElementById('process-list');
    if (!list) return;
    const name = `P${counter++}`;
    const color = colors[(counter - 2) % colors.length];
    const div = document.createElement('div');
    div.className = "grid grid-cols-[100px_1fr_1fr_60px] gap-4 items-center p-4 border-b border-white/5";
    div.innerHTML = `
        <div class="text-xs font-mono font-bold" style="color:${color}">${name}</div>
        <input type="number" class="at-input input-field" value="0">
        <input type="number" class="bt-input input-field" placeholder="Burst">
        <button onclick="this.closest('div').remove()" class="text-right text-slate-600 hover:text-red-400 text-lg">×</button>`;
    list.appendChild(div);
}

async function startSimulation() {
    const rows = document.querySelectorAll('#process-list > div');
    const processes = [];
    rows.forEach(row => {
        const at = row.querySelector('.at-input').value;
        const bt = row.querySelector('.bt-input').value;
        if (bt !== "" && bt > 0) {
            processes.push({
                name: row.querySelector('div').innerText,
                at: Number.parseFloat(at),
                bt: Number.parseFloat(bt),
                color: row.querySelector('div').style.color
            });
        }
    });

    if (processes.length === 0) return;

    try {
        const res = await fetch('/calculate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ processes })
        });
        const data = await res.json();
        localStorage.setItem('simulationResults', JSON.stringify({ ...data, processes }));
        renderGantt(data.gantt, processes);
    } catch (error) {
        console.error("Calculation failed:", error.message);
    }
}

function renderGantt(gantt, processes) {
    const chart = document.getElementById('gantt-chart');
    if (!chart) return;
    chart.innerHTML = '';
    
    let compressed = [];
    let current = { id: gantt[0].id, duration: 1 };
    for (let i = 1; i < gantt.length; i++) {
        if (gantt[i].id === current.id) current.duration++;
        else { compressed.push(current); current = { id: gantt[i].id, duration: 1 }; }
    }
    compressed.push(current);

    compressed.forEach((blockData, index) => {
        const p = processes.find(proc => proc.name === blockData.id);
        const block = document.createElement('div');
        block.className = "gantt-block";
        block.style.backgroundColor = p ? p.color : '#334155';
        block.style.flex = `${blockData.duration} 1 0%`; 
        block.innerText = blockData.id;
        block.style.animationDelay = `${index * 0.1}s`; 
        chart.appendChild(block);
    });
}

function handleExecution() {
    if (localStorage.getItem('simulationResults')) globalThis.location.href = '/statistics';
}

function endAll() {
    const list = document.getElementById('process-list');
    const chart = document.getElementById('gantt-chart');
    if (list) list.innerHTML = '';
    if (chart) chart.innerHTML = '';
    localStorage.removeItem('simulationResults');
    counter = 1;
}

// Initial processes
document.addEventListener('DOMContentLoaded', () => { 
    if (document.getElementById('process-list')) {
        for(let i=0; i<3; i++) addProcess(); 
    }
});