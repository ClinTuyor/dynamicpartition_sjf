from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

def find_next_process(arrival_time, remaining_time, time):
    idx = -1
    min_remaining = float('inf')
    for i, (at, rem) in enumerate(zip(arrival_time, remaining_time)):
        if at <= time and rem > 0 and rem < min_remaining:
            min_remaining = rem
            idx = i
    return idx


def calculate_srtf(processes):
    # processes: list of dicts {'id': 'P1', 'at': 0.0, 'bt': 5.0}
    n = len(processes)
    remaining_time = [p['bt'] for p in processes]
    arrival_time = [p['at'] for p in processes]

    time = 0.0
    completed = 0
    last_process = None
    gantt_data = []  # List of {process, start, end}

    while completed < n:
        idx = find_next_process(arrival_time, remaining_time, time)
        if idx == -1:
            time += 0.1
            continue

        if last_process != processes[idx]['id']:
            if gantt_data:
                gantt_data[-1]['end'] = round(time, 2)
            gantt_data.append({'id': processes[idx]['id'], 'start': round(time, 2)})
            last_process = processes[idx]['id']

        remaining_time[idx] -= 0.1
        time += 0.1

        if remaining_time[idx] <= 0:
            remaining_time[idx] = 0
            completed += 1

    if gantt_data:
        gantt_data[-1]['end'] = round(time, 2)

    return gantt_data

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve():
    data = request.json
    result = calculate_srtf(data['processes'])
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)