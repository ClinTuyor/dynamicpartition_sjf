from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/about', methods=['GET'])
def about():
    return render_template('about.html')

@app.route('/simulator', methods=['GET'])
def simulator():
    return render_template('simulator.html')

@app.route('/statistics', methods=['GET'])
def statistics():
    return render_template('statistics.html')

def select_next_process(processes, time, is_completed, remaining_time, n):
    """Select the next process to run using SRTF algorithm."""
    idx = -1
    min_remaining = float('inf')
    
    for i in range(n):
        if int(processes[i]['at']) <= time and not is_completed[i]:
            if remaining_time[i] < min_remaining:
                min_remaining = remaining_time[i]
                idx = i
            elif remaining_time[i] == min_remaining:
                if int(processes[i]['at']) < int(processes[idx]['at']):
                    idx = i
    return idx

def run_srtf_algorithm(processes):
    """Execute Preemptive SJF (SRTF) scheduling algorithm."""
    time = 0
    completed = 0
    n = len(processes)
    remaining_time = [int(p['bt']) for p in processes]
    finish_time = [0] * n
    start_time = [-1] * n
    is_completed = [False] * n
    gantt_chart = []
    
    while completed != n:
        idx = select_next_process(processes, time, is_completed, remaining_time, n)
        
        if idx != -1:
            if start_time[idx] == -1:
                start_time[idx] = time
            remaining_time[idx] -= 1
            gantt_chart.append({'id': processes[idx]['name'], 'time': time})
            if remaining_time[idx] == 0:
                finish_time[idx] = time + 1
                is_completed[idx] = True
                completed += 1
        else:
            gantt_chart.append({'id': 'Idle', 'time': time})
        time += 1
    
    return gantt_chart, finish_time, start_time

def calculate_statistics(processes, finish_time, start_time):
    """Calculate scheduling statistics for each process."""
    results = []
    for i in range(len(processes)):
        at = int(processes[i]['at'])
        bt = int(processes[i]['bt'])
        ct = finish_time[i]
        tat = ct - at
        wt = tat - bt
        rt = start_time[i] - at
        results.append({
            'name': processes[i]['name'],
            'at': at, 'bt': bt, 'ct': ct,
            'tat': tat, 'wt': wt, 'rt': rt
        })
    return results

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    processes = data['processes']
    
    if not processes:
        return jsonify({'error': 'No processes provided'})

    gantt_chart, finish_time, start_time = run_srtf_algorithm(processes)
    results = calculate_statistics(processes, finish_time, start_time)

    return jsonify({'gantt': gantt_chart, 'stats': results})

if __name__ == '__main__':
    app.run(debug=True)