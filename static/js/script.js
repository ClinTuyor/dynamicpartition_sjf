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
        <input type="number" step="any" class="at-input input-field px-4 py-2 rounded text-sm" placeholder="ms">
        <input type="number" step="any" class="bt-input input-field px-4 py-2 rounded text-sm" placeholder="ms">
        <button onclick="this.closest('div').remove(); updateUI();" class="text-slate-600 hover:text-red-400 flex justify-end">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>`;
    list.appendChild(div);
    div.querySelectorAll('input').forEach(i => i.addEventListener('input', updateUI));
}

async function updateUI() {
    const rows = document.querySelectorAll('#process-list > div');
    
    const processes = Array.from(rows).map(row => {
        const atVal = row.querySelector('.at-input').value;
        const btVal = row.querySelector('.bt-input').value;
        return {
            name: row.querySelector('div').innerText,
            at: atVal === "" ? null : Number.parseFloat(atVal),
            bt: btVal === "" ? null : Number.parseFloat(btVal),
            color: row.querySelector('div').style.color
        };
    }).filter(p => p.at !== null && p.bt !== null && p.bt >= 0); // Strictly allow 0

    const ganttContainer = document.getElementById('gantt-chart');

    if (processes.length === 0) {
        ganttContainer.innerHTML = '<div class="flex items-center justify-center w-full text-slate-600 font-mono text-xs italic">Awaiting calculation...</div>';
        return false;
    }

    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ processes })
        });
        
        if (!response.ok) throw new Error('Calculation Error');
        
        const data = await response.json();
        // Save results for the statistics page
        localStorage.setItem('simulationResults', JSON.stringify({ stats: data.stats, processes }));
        renderGantt(data.gantt, processes);
        return true;
    } catch (e) {
        console.error("Live update failed:", e);
        return false;
    }
}

function renderGantt(gantt, processes) {
    const chart = document.getElementById('gantt-chart');
    chart.innerHTML = '';
    
    if (!gantt || gantt.length === 0) return;

    let compressedGantt = [];
    let currentBlock = { id: gantt[0].id, duration: 1 };

    for (let i = 1; i < gantt.length; i++) {
        if (gantt[i].id === currentBlock.id) {
            currentBlock.duration++;
        } else {
            compressedGantt.push(currentBlock);
            currentBlock = { id: gantt[i].id, duration: 1 };
        }
    }
    compressedGantt.push(currentBlock);

    compressedGantt.forEach(blockData => {
        const p = processes.find(proc => proc.name === blockData.id);
        const block = document.createElement('div');
        block.className = "gantt-block";
        block.style.backgroundColor = p ? p.color : '#334155';
        block.style.flex = `${blockData.duration} 1 0%`; 
        block.innerText = blockData.id;
        chart.appendChild(block);
    });
}

async function handleExecution() {
    const success = await updateUI();
    if (success) {
        globalThis.location.href = '/statistics';
    } else {
        alert("Enter values for all processes. Burst time can be 0, but fields cannot be empty.");
    }
}

function endAll() {
    document.getElementById('process-list').innerHTML = '';
    counter = 1;
    updateUI();
}

// Ensure 5 processes exist on load
document.addEventListener('DOMContentLoaded', () => {
    for(let i=0; i<5; i++) addProcess();
});