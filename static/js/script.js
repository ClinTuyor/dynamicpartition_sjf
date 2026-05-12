let counter = 1;
const colors = ['#FF5F5F', '#FF69B4', '#38BDF8', '#FBBF24', '#10B981', '#8B5CF6', '#F43F5E', '#0EA5E9'];

function addProcess() {
    const list = document.getElementById('process-list');
    const name = `P${counter++}`;
    const color = colors[(counter - 2) % colors.length];
    
    const div = document.createElement('div');
    div.className = "grid grid-cols-[100px_1fr_1fr_60px] gap-4 items-center p-4 hover:bg-white/[0.02] transition-colors";
    div.innerHTML = `
        <div class="text-xs font-mono font-bold" style="color:${color}">${name}</div>
        <input type="number" step="any" class="at-input input-field px-4 py-2 rounded text-sm" placeholder="0">
        <input type="number" step="any" class="bt-input input-field px-4 py-2 rounded text-sm" placeholder="0">
        <button onclick="this.closest('div').remove(); updateUI();" class="text-slate-600 hover:text-red-400 flex justify-end">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>`;
    list.appendChild(div);
    
    // Trigger update on every keystroke
    div.querySelectorAll('input').forEach(i => i.addEventListener('input', updateUI));
}

// FIX: Clear Buffer Button
function endAll() {
    document.getElementById('process-list').innerHTML = '';
    counter = 1; // Resets numbering back to P1
    document.getElementById('gantt-chart').innerHTML = '<div class="flex items-center justify-center w-full text-slate-600 font-mono text-xs italic">Awaiting calculation...</div>';
}

async function updateUI() {
    const rows = document.querySelectorAll('#process-list > div');
    const processes = [];

    rows.forEach(row => {
        const atVal = row.querySelector('.at-input').value;
        const btVal = row.querySelector('.bt-input').value;

        // CRITICAL: Explicitly check if the string is not empty. 
        // This allows '0' and decimals like '3.1' to pass.
        if (atVal !== "" && btVal !== "") {
            processes.push({
                name: row.querySelector('div').innerText,
                at: Number.parseFloat(atVal),
                bt: Number.parseFloat(btVal),
                color: row.querySelector('div').style.color
            });
        }
    });

    if (processes.length === 0) return;

    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ processes })
        });
        const data = await response.json();
        
        // Store for the statistics page
        localStorage.setItem('simulationResults', JSON.stringify({ 
            stats: data.stats, 
            gantt: data.gantt,
            processes: processes 
        }));
        
        renderGantt(data.gantt, processes);
    } catch (e) {
        console.error("Calculation failed:", e);
    }
}

function renderGantt(gantt, processes) {
    const chart = document.getElementById('gantt-chart');
    if (!gantt || gantt.length === 0) return;
    chart.innerHTML = '';

    let compressed = [];
    let current = { id: gantt[0].id, duration: 1 };

    for (let i = 1; i < gantt.length; i++) {
        if (gantt[i].id === current.id) {
            current.duration++;
        } else {
            compressed.push(current);
            current = { id: gantt[i].id, duration: 1 };
        }
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

// FIX: Execute Button
function handleExecution() {
    const results = localStorage.getItem('simulationResults');
    if (results) {
        globalThis.location.href = '/statistics';
    } else {
        alert("Please fill in the process data first.");
    }
}

// Start with 5 processes automatically
document.addEventListener('DOMContentLoaded', () => {
    for(let i=0; i<5; i++) addProcess();
});