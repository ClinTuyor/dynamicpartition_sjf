from flask import Flask, render_template, request, jsonify

app = Flask(__name__, static_folder='templates', static_url_path='/')

def parse_processes(processes):
    parsed = []
    for p in processes:
        try:
            bt = float(p['bt'])
            if bt > 0:
                parsed.append({'id': p['id'], 'at': float(p['at']), 'bt': bt, 'rem': bt})
        except Exception:
            continue
    return parsed


def select_ready_process(procs, time):
    ready = [p for p in procs if p['at'] <= time and p['rem'] > 0]
    if not ready:
        return None
    return min(ready, key=lambda p: p['rem'])


def run_srtf(processes):
    procs = parse_processes(processes)
    if not procs:
        return []

    time = min(p['at'] for p in procs)
    completed, n, last_p, gantt = 0, len(procs), None, []

    while completed < n:
        current = select_ready_process(procs, time)
        if current is None:
            time = round(time + 0.1, 2)
            continue

        if last_p != current['id']:
            if gantt:
                gantt[-1]['end'] = round(time, 2)
            gantt.append({'id': current['id'], 'start': round(time, 2)})
            last_p = current['id']

        current['rem'] = round(current['rem'] - 0.1, 2)
        time = round(time + 0.1, 2)
        if current['rem'] <= 0:
            completed += 1

    if gantt:
        gantt[-1]['end'] = round(time, 2)
    return gantt

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    return jsonify(run_srtf(request.json.get('processes', [])))

if __name__ == '__main__':
    app.run(debug=True)