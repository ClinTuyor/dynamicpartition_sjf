let counter = 1;
const colors = ['#38BDF8', '#8B5CF6', '#FBBF24', '#10B981', '#FF5F5F', '#FF69B4'];

function addProcess(atVal = "", btVal = "") {
    const list = document.getElementById('process-list');
    if (!list) return;
    const name = `P${counter++}`;
    const color = colors[(counter - 2) % colors.length];
    const div = document.createElement('div');
    div.className = "process-row grid grid-cols-[100px_1fr_1fr_60px] gap-4 items-center p-4 border-b border-white/5";
    div.innerHTML = `
        <div class="proc-id text-xs font-mono font-bold" style="color:${color}">${name}</div>
        <input type="number" class="at-input input-field" placeholder="Arrival" value="${atVal}">
        <input type="number" class="bt-input input-field" placeholder="Burst" value="${btVal}">
        <button onclick="this.closest('div').remove(); saveState();" class="text-slate-600 hover:text-red-400 text-xl text-right">×</button>`;
    list.appendChild(div);
}

function saveState() {
    const rows = document.querySelectorAll('.process-row');
    const state = Array.from(rows).map(row => ({
        at: row.querySelector('.at-input').value,
        bt: row.querySelector('.bt-input').value
    }));
    localStorage.setItem('simulatorState', JSON.stringify(state));
}

function restoreState() {
    const saved = localStorage.getItem('simulatorState');
    const list = document.getElementById('process-list');
    if (!list) return;
    list.innerHTML = "";
    counter = 1;
    if (saved) {
        JSON.parse(saved).forEach(p => addProcess(p.at, p.bt));
    } else {
        for(let i=0; i<5; i++) addProcess("", "");
    }
}

async function startSimulation() {
    saveState();
    const rows = document.querySelectorAll('.process-row');
    const processes = [];
    rows.forEach(row => {
        const at = row.querySelector('.at-input').value;
        const bt = row.querySelector('.bt-input').value;
        if (bt !== "" && Number(bt) > 0) {
            processes.push({
                name: row.querySelector('.proc-id').innerText,
                at: Number.parseFloat(at || 0),
                bt: Number.parseFloat(bt),
                color: row.querySelector('.proc-id').style.color
            });
        }
    });

    if (processes.length === 0) return;

    const res = await fetch('/calculate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ processes })
    });
    const data = await res.json();
    localStorage.setItem('simulationResults', JSON.stringify({ ...data, processes }));
    renderCharts(data, processes);
}

function renderCharts(data, processes) {
    // Select the main containers (where the clip-path animation is applied)
    const execContainer = document.querySelector('.gantt-container');
    const projContainer = document.getElementById('project-gantt');
    
    // Select the inner elements for content injection
    const execChart = document.getElementById('gantt-chart');
    const timelineRows = document.getElementById('timeline-rows');
    const timeScale = document.getElementById('time-scale');

    if (!execContainer || !projContainer) return;

    // Reset Animations & Force Synchronized Reflow
    [execContainer, projContainer].forEach(c => {
        c.classList.remove('wipe-in', 'wipe-out');
        globalThis.getComputedStyle(c).opacity; // Force browser to acknowledge the reset
        c.classList.add('wipe-in'); // Both start the 2.0s journey now
    });

    // 1. CPU Execution Chart (Chart 1)
    execChart.innerHTML = '';
    let compressed = [];
    let current = { id: data.gantt[0].id, duration: 1 };
    for (let i = 1; i < data.gantt.length; i++) {
        if (data.gantt[i].id === current.id) current.duration++;
        else { compressed.push(current); current = { id: data.gantt[i].id, duration: 1 }; }
    }
    compressed.push(current);

    const totalTime = data.gantt.length;
    compressed.forEach(block => {
        const p = processes.find(proc => proc.name === block.id);
        const div = document.createElement('div');
        div.className = "gantt-block";
        div.style.backgroundColor = p ? p.color : '#334155';
        div.style.width = `${(block.duration / totalTime) * 100}%`;
        div.innerText = block.id;
        execChart.appendChild(div);
    });

    // 2. Project Timeline Chart (Chart 2)
    timelineRows.innerHTML = '';
    timeScale.innerHTML = '';
    processes.forEach(p => {
    const pStat = data.stats.individual.find(s => s.name === p.name);
    if (pStat) {
        const finishTime = p.at + pStat.tat;
        
        // Ensure start and width are relative to the SAME totalTime used for Chart 1
        let startPct = (p.at / totalTime) * 100;
        let widthPct = ((finishTime - p.at) / totalTime) * 100;

        // Safety check: Clip the values if they exceed 100% due to float rounding
        if (startPct + widthPct > 100) {
            widthPct = 100 - startPct;
        }

        const row = document.createElement('div');
        row.className = "timeline-row";
        row.innerHTML = `
            <div class="text-[10px] font-mono font-bold" style="color:${p.color}">${p.name}</div>
            <div class="timeline-bar-container">
                <div class="timeline-bar" style="left:${startPct}%; width:${widthPct}%; background-color:${p.color}"></div>
            </div>`;
        timelineRows.appendChild(row);
    }
});

    for (let i = 0; i <= totalTime; i += Math.max(1, Math.ceil(totalTime / 10))) {
        const span = document.createElement('span');
        span.textContent = `${i}ms`;
        timeScale.appendChild(span);
    }
}

function endAll() {
    const execContainer = document.querySelector('.gantt-container');
    const projContainer = document.getElementById('project-gantt');
    
    [execContainer, projContainer].forEach(c => {
        c.classList.remove('wipe-in');
        c.classList.add('wipe-out');
    });

    setTimeout(() => {
        document.getElementById('process-list').innerHTML = '';
        document.getElementById('timeline-rows').innerHTML = '';
        document.getElementById('time-scale').innerHTML = '';
        document.getElementById('gantt-chart').innerHTML = '';
        [execContainer, projContainer].forEach(c => c.classList.remove('wipe-out'));
        localStorage.removeItem('simulatorState');
        localStorage.removeItem('simulationResults');
        counter = 1;
        for(let i=0; i<5; i++) addProcess("", "");
        saveState();
    }, 2000);
}

function handleExecution() {
    if (localStorage.getItem('simulationResults')) globalThis.location.href = '/statistics';
}

document.addEventListener('input', (e) => { 
    if (e.target.classList.contains('input-field')) saveState(); 
});

document.addEventListener('DOMContentLoaded', restoreState);