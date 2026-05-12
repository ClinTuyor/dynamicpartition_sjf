let counter = 1;
// Industrial/Cyberpunk Palette
const colors = ['#0ea5e9', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#10b981'];

function addProcess() {
    const list = document.getElementById('process-list');
    const name = `P${counter++}`;
    const color = colors[(counter - 2) % colors.length];
    
    const div = document.createElement('div');
    div.className = "grid grid-cols-[80px_1fr_1fr_60px] gap-4 items-center p-4 hover:bg-white/[0.02] transition-colors group";
    div.innerHTML = `
        <div class="text-xs font-mono font-bold" style="color: ${color}">${name}</div>
        <input type="number" placeholder="0" class="at-input input-field px-4 py-2 rounded-lg text-sm">
        <input type="number" placeholder="0" class="bt-input input-field px-4 py-2 rounded-lg text-sm">
        <button onclick="removeThis(this)" class="text-slate-600 hover:text-red-400 transition-colors flex justify-end">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
    `;
    list.appendChild(div);
    div.querySelectorAll('input').forEach(i => i.addEventListener('input', updateUI));
}

function removeThis(btn) {
    btn.closest('div').remove();
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
        color: row.querySelector('div').style.color
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
    localStorage.setItem('simulationResults', JSON.stringify({ stats: data.stats, processes }));
    renderScale(data.gantt, processes);
}

function renderScale(gantt, processes) {
    const scale = document.getElementById('cpu-scale');
    scale.innerHTML = '';
    
    // Reverse for "Water Bottle" fill effect
    const visualGantt = [...gantt].reverse();
    
    visualGantt.forEach((step, index) => {
        const p = processes.find(proc => proc.name === step.id);
        const block = document.createElement('div');
        block.className = "w-full border-t border-slate-950 shrink-0 animate-fill flex items-center px-4 relative group";
        block.style.backgroundColor = p ? p.color : '#1e293b';
        block.style.height = "24px";
        block.style.animationDelay = `${index * 0.02}s`;
        
        block.innerHTML = `
            <span class="text-[8px] font-mono font-bold text-white/40 uppercase">${step.id}</span>
            <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        `;
        scale.appendChild(block);
    });
}

addProcess();