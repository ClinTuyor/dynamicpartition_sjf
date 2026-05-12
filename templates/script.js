let chart;
let processCounter = 1;
const COLORS = ['#ff5e5e', '#ff78cb', '#4eb3ff', '#ffb35e', '#00c853'];

// Limits to 5 processes
function addRow() {
    const container = document.getElementById('list');
    if (container.children.length >= 5) return;

    const row = document.createElement('div');
    row.className = 'input-row';
    const color = COLORS[container.children.length];

    row.innerHTML = `
        <div class="pid-label" style="background: ${color}">P${processCounter++}</div>
        <input type="number" step="0.1" class="at" value="0" min="0" onkeypress="return isNumber(event)">
        <input type="number" step="0.1" class="bt" value="1" min="0" onkeypress="return isNumber(event)">
        <button class="btn-trash" onclick="removeRow(this)">🗑️</button>
    `;
    container.appendChild(row);
    update();
}

// Blocks negatives and special chars
function isNumber(evt) {
    const charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode === 46) return true; // Allow decimal point
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
}

function removeRow(btn) {
    btn.parentElement.remove();
    if (document.getElementById('list').children.length === 0) {
        processCounter = 1;
        if(chart) chart.destroy();
        document.getElementById('partition-visual').innerHTML = '<div class="kernel-header">Kernel</div>';
    } else {
        update();
    }
}

function removeAll() {
    document.getElementById('list').innerHTML = '';
    processCounter = 1;
    if(chart) chart.destroy();
    document.getElementById('partition-visual').innerHTML = '<div class="kernel-header">Kernel</div>';
}

document.addEventListener('input', (e) => { if(e.target.tagName === 'INPUT') update(); });

async function update() {
    const rows = document.querySelectorAll('.input-row');
    const procs = Array.from(rows).map(r => ({
        id: r.querySelector('.pid-label').innerText,
        at: r.querySelector('.at').value,
        bt: r.querySelector('.bt').value
    }));

    const res = await fetch('/calculate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({processes: procs})
    });
    const data = await res.json();
    
    renderPartition(procs);
    drawGantt(data);
}

function renderPartition(procs) {
    const visual = document.getElementById('partition-visual');
    visual.innerHTML = '<div class="kernel-header">Kernel</div>';
    const totalBT = procs.reduce((s, p) => s + (Number.parseFloat(p.bt) || 0), 0);
    
    procs.forEach((p, i) => {
        const block = document.createElement('div');
        block.className = 'process-block';
        block.style.backgroundColor = COLORS[i % COLORS.length];
        const h = totalBT > 0 ? ((Number.parseFloat(p.bt) || 0) / totalBT) * 100 : 0;
        block.style.height = `${h}%`;
        block.innerText = p.id;
        visual.appendChild(block);
    });
}

function drawGantt(data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    if(chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: data.map((d, i) => ({
                label: d.id,
                data: [{x: [d.start, d.end], y: 'Timeline'}],
                backgroundColor: COLORS[i % COLORS.length]
            }))
        },
        options: {
            indexAxis: 'y',
            maintainAspectRatio: false,
            scales: { x: { type: 'linear' }, y: { display: false, stacked: true } }
        }
    });
}

window.onload = addRow;