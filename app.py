from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/simulator')
def simulator():
    return render_template('simulator.html')

@app.route('/statistics')
def statistics():
    return render_template('statistics.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    processes = data.get('processes', [])
    if not processes:
        return jsonify({'gantt': [], 'stats': {}})

    for p in processes:
        p['remaining'] = float(p['bt'])
        p['at'] = float(p['at'])

    time = 0
    completed = 0
    n = len(processes)
    gantt = []
    finish_times = {p['name']: 0 for p in processes}
    
    while completed < n:
        available = [p for p in processes if p['at'] <= time and p['remaining'] > 0]
        if not available:
            time += 1
            continue
            
        current = min(available, key=lambda x: x['remaining'])
        gantt.append({'id': current['name'], 'time': time})
        current['remaining'] -= 1
        time += 1
        
        if current['remaining'] <= 0:
            completed += 1
            finish_times[current['name']] = time

    stats = []
    for p in processes:
        tat = finish_times[p['name']] - p['at']
        wt = tat - float(p['bt'])
        stats.append({
            'name': p['name'],
            'tat': round(tat, 2),
            'wt': round(wt, 2)
        })

    return jsonify({
        'gantt': gantt,
        'stats': {
            'individual': stats,
            'avg_tat': round(sum(s['tat'] for s in stats) / n, 2),
            'avg_wt': round(sum(s['wt'] for s in stats) / n, 2)
        }
    })

if __name__ == '__main__':
    app.run(debug=True)