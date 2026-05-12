let counter = 1;
const colors = ['#FF5F5F', '#FF6BCB', '#4BC0FF', '#FFB84D', '#10B981', '#9B59B6'];

function addProcess() {
    const list = document.getElementById('process-list');
    const name = `P${counter++}`;
    const color = colors[(counter - 2) % colors.length];
    
    const div = document.createElement('div');
    div.className = "grid grid-cols-[80px_1fr_1fr_50px] gap-3 items-center";
    div.innerHTML = `
        <div class="h-10 rounded-lg flex items-center justify-center text-white font-extrabold text-lg shadow-sm" style="background-color: ${color}">${name}</div>
        <input type="number" placeholder="0" class="at-input input-field" min="0">
        <input type="number" placeholder="0" class="bt-input input-field" min="1">
        <button onclick="removeThis(this)" class="text-red-500 hover:scale-110 transition-transform flex justify-center">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
        </button>
    `;
    list.appendChild(div);

    div.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updateUI);
    });
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
    
    localStorage.setItem('simulationResults', JSON.stringify({
        stats: data.stats, 
        processes: processes
    }));

    renderScale(data.gantt, processes);
}

function renderScale(gantt, processes) {
    const scale = document.getElementById('cpu-scale');
    scale.innerHTML = '';
    
    // We reverse the array so the LATEST time is handled first in the DOM,
    // but because the container is 'flex-col-reverse' or 'justify-end',
    // it will visually stack from the bottom up.
    const visualGantt = [...gantt].reverse();
    
    visualGantt.forEach((step, index) => {
        const p = processes.find(proc => proc.name === step.id);
        const block = document.createElement('div');
        
        // CSS Animation for 'filling' effect
        block.className = "w-full flex items-center justify-center text-black font-bold text-xs border-b border-white/10 shrink-0 animate-fill-up";
        
        block.style.backgroundColor = p ? p.color : '#e9ecef';
        block.style.height = "30px"; 
        block.style.animationDelay = `${index * 0.05}s`; // Staggered appearance
        block.innerText = step.id;
        
        scale.appendChild(block);
    });
}

addProcess();