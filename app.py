from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index(): return render_template('index.html')

@app.route('/about')
def about(): return render_template('about.html')

@app.route('/simulator')
def simulator(): return render_template('simulator.html')

@app.route('/statistics')
def statistics(): return render_template('statistics.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    processes = data.get('processes', [])
    if not processes: return jsonify({'gantt': [], 'stats': []})

    n = len(processes)
    at = [int(p['at']) for p in processes]
    bt = [int(p['bt']) for p in processes]
    rt = [int(p['bt']) for p in processes]  # remaining time
    names = [p['name'] for p in processes]
    
    ct = [0] * n
    start_times = [-1] * n
    completed = 0
    current_time = 0
    gantt = []

    while completed < n:
        idx = -1
        min_rt = float('inf')
        
        for i in range(n):
            if at[i] <= current_time and rt[i] > 0:
                if rt[i] < min_rt:
                    min_rt = rt[i]
                    idx = i
                elif rt[i] == min_rt:
                    if at[i] < at[idx]: idx = i

        if idx != -1:
            if start_times[idx] == -1: start_times[idx] = current_time
            rt[idx] -= 1
            gantt.append({'id': names[idx], 'time': current_time})
            if rt[idx] == 0:
                completed += 1
                ct[idx] = current_time + 1
        else:
            gantt.append({'id': 'Idle', 'time': current_time})
        current_time += 1

    stats = []
    for i in range(n):
        tat = ct[i] - at[i]
        wt = tat - bt[i]
        resp = start_times[i] - at[i]
        stats.append({'name': names[i], 'at': at[i], 'bt': bt[i], 'ct': ct[i], 'tat': tat, 'wt': wt, 'rt': resp})

    return jsonify({'gantt': gantt, 'stats': stats})

if __name__ == '__main__':
    app.run(debug=True)