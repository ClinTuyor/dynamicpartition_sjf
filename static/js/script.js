function renderScale(gantt, processes) {
    const scale = document.getElementById('cpu-scale');
    scale.innerHTML = '';
    
    // We render the sequence as vertical blocks
    gantt.forEach(step => {
        const p = processes.find(proc => proc.name === step.id);
        const block = document.createElement('div');
        // Height is fixed/calculated based on time slice to fill the scale
        block.className = "w-full flex items-center justify-center text-black font-bold text-sm border-b border-white/20";
        block.style.backgroundColor = p.color;
        block.style.height = "50px"; 
        block.innerText = step.id;
        scale.appendChild(block);
    });
}