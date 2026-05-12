from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/statistics')
def statistics():
    return render_template('statistics.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    processes = data.get('processes', [])
    
    if not processes:
        return jsonify({'gantt': [], 'stats': {}})

    # Setup for SJF-P Logic
    # We use a copy to track 'remaining time' without losing the original burst values
    for p in processes:
        p['remaining'] = float(p['bt'])
        p['at'] = float(p['at'])

    time = 0
    completed = 0
    n = len(processes)
    gantt = []
    
    # Statistics tracking
    finish_times = {p['name']: 0 for p in processes}
    
    while completed < n:
        # Get all processes that have arrived and aren't finished
        available = [p for p in processes if p['at'] <= time and p['remaining'] > 0]
        
        if not available:
            time += 1
            continue
            
        # SJF-P: Pick the one with the shortest REMAINING time
        current = min(available, key=lambda x: x['remaining'])
        
        gantt.append({'id': current['name'], 'time': time})
        current['remaining'] -= 1
        time += 1
        
        if current['remaining'] <= 0:
            completed += 1
            finish_times[current['name']] = time

    # Calculate Analytics
    stats = []
    for p in processes:
        # TAT = Finish Time - Arrival Time
        # WT = TAT - Original Burst Time
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