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