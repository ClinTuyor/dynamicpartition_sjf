from flask import Flask, request, jsonify

app = Flask(__name__)

def get_next_process(at, rt, current_time):
    idx = -1
    min_rt = float('inf')
    for i, (arrival, remaining) in enumerate(zip(at, rt)):
        if arrival <= current_time and remaining > 0:
            if remaining < min_rt or (remaining == min_rt and (idx == -1 or arrival < at[idx])):
                min_rt = remaining
                idx = i
    return idx

# Updated /calculate route logic
@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    processes = data.get('processes', [])
    if not processes:
        return jsonify({'gantt': [], 'stats': []})

    n = len(processes)
    at = [int(p['at']) for p in processes]
    bt = [int(p['bt']) for p in processes]
    rt = bt.copy()
    names = [p['name'] for p in processes]

    ct = [0] * n
    start_times = [-1] * n
    completed = 0
    current_time = 0
    gantt = []

    while completed < n:
        idx = get_next_process(at, rt, current_time)
        if idx != -1:
            if start_times[idx] == -1:
                start_times[idx] = current_time
            rt[idx] -= 1
            gantt.append({'id': names[idx], 'time': current_time})
            if rt[idx] == 0:
                completed += 1
                ct[idx] = current_time + 1
        current_time += 1

    stats = []
    for i in range(n):
        tat = ct[i] - at[i]
        wt = tat - bt[i]
        stats.append({
            'name': names[i],
            'at': at[i],
            'bt': bt[i],
            'ct': ct[i],
            'tat': tat,
            'wt': wt
        })

    return jsonify({'gantt': gantt, 'stats': stats})