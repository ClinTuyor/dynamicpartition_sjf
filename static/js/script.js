let counter = 1;
const colors = ['#FF5F5F', '#FF69B4', '#38BDF8', '#FBBF24', '#10B981', '#8B5CF6', '#F43F5E'];

function addProcess() {
    const list = document.getElementById('process-list');
    const name = `P${counter++}`;
    const color = colors[(counter - 2) % colors.length];
    
    const div = document.createElement('div');
    div.className = "grid grid-cols-[100px_1fr_1fr_60px] gap-4 items-center p-4 border-b border-white/5";
    div.innerHTML = `
        <div class="text-xs font-mono font-bold" style="color:${color}">${name}</div>
        <input type="number" step="any" class="at-input input-field" placeholder="0">
        <input type="number" step="any" class="bt-input input-field" placeholder="0">
        <button onclick="this.closest('div').remove()" class="flex justify-end text-slate-600 hover:text-red-400">×</button>`;
    list.appendChild(div);
}

async function startSimulation() {
    const rows = document.querySelectorAll('#process-list > div');
    const processes = [];

    rows.forEach(row => {
        const atVal = row.querySelector('.at-input').value;
        const btVal = row.querySelector('.bt-input').value;

        if (atVal !== "" && btVal !== "") {
            processes.push({
                name: row.querySelector('div').innerText,
                at: Number.parseFloat(atVal), // Fixed S7773 warning
                bt: Number.parseFloat(btVal), // Fixed S7773 warning
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
        // Fixed S2486 warning from image_9e38da.png
        console.error("Calculation failed:", error.message); 
    }
}

function renderGantt(gantt, processes) {
    const chart = document.getElementById('gantt-chart');
    chart.innerHTML = '';
    
    let compressed = [];
    let current = { id: gantt[0].id, duration: 1 };

    for (let i = 1; i < gantt.length; i++) {
        if (gantt[i].id === current.id) current.duration++;
        else { compressed.push(current); current = { id: gantt[i].id, duration: 1 }; }
    }
    compressed.push(current);

    compressed.forEach(blockData => {
        const p = processes.find(proc => proc.name === blockData.id);
        const block = document.createElement('div');
        block.className = "gantt-block";
        block.style.backgroundColor = p ? p.color : '#334155';
        block.style.flex = `${blockData.duration} 1 0%`; 
        block.innerText = blockData.id;
        chart.appendChild(block);
    });
}

function handleExecution() {
    // Fixed S7764 warning
    if (localStorage.getItem('simulationResults')) globalThis.location.href = '/statistics';
}

function endAll() {
    document.getElementById('process-list').innerHTML = '';
    document.getElementById('gantt-chart').innerHTML = 'Awaiting simulation start...';
    localStorage.removeItem('simulationResults');
    counter = 1;
}

document.addEventListener('DOMContentLoaded', () => { for(let i=0; i<5; i++) addProcess(); });