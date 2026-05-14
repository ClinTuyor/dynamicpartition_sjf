# SHORTEST JOB FIRST (PREEMPTIVE) SIMULATOR #

A professional-grade CPU scheduling simulator designed for accuracy and visual clarity. This tool visualizes the Shortest Remaining Time First (SRTF) algorithm, demonstrating dynamic CPU management through high-fidelity Gantt charts and project-style timelines.

🚀 Overview
Preemptive Shortest Job First (SJF) is a dynamic scheduling strategy where the scheduler selects the process with the smallest remaining execution time to run next. Unlike non-preemptive versions, this algorithm interrupts currently running tasks if a new process arrives with a shorter burst time, minimizing Average Waiting Time.

✨ Key Features
Dynamic Gantt Chart: Real-time visualization of CPU execution and preemption.
Project-Style Timeline: Visualizes process lifetimes, distinguishing between "waiting" and "executing" states.
Responsive Dashboard: Built with a sleek "Dark Mode" aesthetic using Tailwind CSS for professional use.
Interactive Input: Add, edit, or remove processes with real-time state saving and deletion features.

🛠️ Tech Stack
Frontend: React, TypeScript, Vite, and Tailwind CSS.
Icons: Lucide Icons for intuitive navigation.
Algorithm: Preemptive Shortest Job First (SRTF).

📂 Project Structure
dynamicsjf-simulator
├── static/
│   ├── css/
│   │   └── style.css      # Custom hero containers & timeline animations
│   └── js/
│       └── script.js     # Simulation logic and chart rendering
├── templates/
│   ├── index.html        # High-impact landing page
│   ├── simulator.html    # Core simulation interface
│   └── about.html        # Technical algorithm documentation
└── app.py                # Backend simulation handling

📖 How to Use
Add Processes: Use the "ADD PROCESS" button to generate new process rows.

Define Parameters: Input the Arrival Time and Burst Time for each process.

Run Simulation: Click "START PROCESS" to calculate the schedule and "VIEW ANALYTICS" to see the visual results.

Analyze: View the Gantt chart to see where preemptions occurred and the timeline to check for potential starvation.