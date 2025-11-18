const state = {
    revenue: {
        labels: ['Q1 Launch', 'Q2 Refactor', 'Summer AI beta', 'Autumn GA'],
        values: [220, 248, 315, 382]
    },
    channels: {
        labels: ['DevRel', 'Paid media', 'Strategic partners', 'AI community'],
        values: [36, 24, 21, 19]
    },
    scenarios: []
};

const colors = {
    purple: 'rgba(124, 93, 255, 0.9)',
    orange: 'rgba(244, 96, 54, 0.9)',
    teal: 'rgba(93, 244, 180, 0.9)',
    purpleSoft: 'rgba(124, 93, 255, 0.3)',
    orangeSoft: 'rgba(244, 96, 54, 0.3)'
};

let revenueChart;
let channelChart;

document.addEventListener('DOMContentLoaded', () => {
    const revenueCtx = document.getElementById('revenueChart');
    const channelCtx = document.getElementById('channelChart');
    const scenarioLog = document.getElementById('scenarioLog');
    const exportJsonBtn = document.getElementById('exportJson');
    const exportCsvBtn = document.getElementById('exportCsv');

    revenueChart = new Chart(revenueCtx, {
        type: 'line',
        data: {
            labels: state.revenue.labels,
            datasets: [
                {
                    data: state.revenue.values,
                    borderColor: colors.purple,
                    backgroundColor: colors.purpleSoft,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#fff'
                }
            ]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#a8b2d4' }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#a8b2d4', callback: value => `$${value}k` }
                }
            }
        }
    });

    channelChart = new Chart(channelCtx, {
        type: 'bar',
        data: {
            labels: state.channels.labels,
            datasets: [
                {
                    data: state.channels.values,
                    backgroundColor: [colors.orange, colors.purple, colors.teal, '#5b8dff'],
                    borderRadius: 10
                }
            ]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#a8b2d4' }, grid: { display: false } },
                y: { beginAtZero: true, ticks: { color: '#a8b2d4', callback: val => `${val}%` }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });

    renderScenarioLog(scenarioLog);

    const form = document.getElementById('dataForm');
    const confidenceInput = form.querySelector('input[name="confidence"]');
    const confidenceOutput = document.getElementById('confidenceValue');

    confidenceInput?.addEventListener('input', event => {
        confidenceOutput.textContent = `${event.target.value}%`;
    });

    exportJsonBtn?.addEventListener('click', () => exportData('json'));
    exportCsvBtn?.addEventListener('click', () => exportData('csv'));

    form.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(form);
        const target = formData.get('target');
        const label = formData.get('label');
        const value = Number(formData.get('value'));
        const scenarioType = formData.get('scenario');
        const confidence = Number(formData.get('confidence'));
        const notes = (formData.get('notes') || '').toString().trim();

        if (!label || Number.isNaN(value)) {
            return;
        }

        const dataset = state[target];
        const existingIndex = dataset.labels.findIndex(item => item.toLowerCase() === label.toLowerCase());

        if (existingIndex >= 0) {
            dataset.values[existingIndex] = value;
        } else {
            dataset.labels.push(label);
            dataset.values.push(value);
        }

        updateChart(target);
        prependScenario({
            scenarioType,
            target,
            label,
            value,
            confidence,
            notes
        });
        renderScenarioLog(scenarioLog);
        form.reset();
        confidenceOutput.textContent = '80%';
    });
});

function exportData(format) {
    const payload = {
        revenue: { ...state.revenue },
        channels: { ...state.channels },
        scenarios: state.scenarios
    };

    if (format === 'json') {
        const jsonString = JSON.stringify(payload, null, 2);
        triggerDownload(jsonString, 'insightflow-data.json', 'application/json');
        return;
    }

    if (format === 'csv') {
        const csvString = buildCsvString(payload);
        triggerDownload(csvString, 'insightflow-data.csv', 'text/csv');
    }
}

function buildCsvString(payload) {
    const rows = [
        ['dataset', 'label', 'value', 'confidence', 'scenarioType', 'target', 'notes']
    ];

    payload.revenue.labels.forEach((label, index) => {
        rows.push(['Revenue', label, payload.revenue.values[index], '', '', '', '']);
    });

    payload.channels.labels.forEach((label, index) => {
        rows.push(['Channels', label, payload.channels.values[index], '', '', '', '']);
    });

    payload.scenarios.forEach(entry => {
        rows.push([
            'Scenario',
            entry.label,
            entry.value,
            entry.confidence || '',
            entry.scenarioType || '',
            entry.target || '',
            (entry.notes || '').replace(/\n/g, ' ')
        ]);
    });

    return rows
        .map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
}

function triggerDownload(content, filename, type) {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

function updateChart(target) {
    if (target === 'revenue' && revenueChart) {
        revenueChart.data.labels = state.revenue.labels;
        revenueChart.data.datasets[0].data = state.revenue.values;
        revenueChart.update();
    }

    if (target === 'channels' && channelChart) {
        channelChart.data.labels = state.channels.labels;
        channelChart.data.datasets[0].data = state.channels.values;
        channelChart.update();
    }
}

function prependScenario(entry) {
    state.scenarios.unshift({
        ...entry,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    state.scenarios = state.scenarios.slice(0, 5);
}

function renderScenarioLog(container) {
    if (!state.scenarios.length) {
        container.innerHTML = '<p class="muted">Submit a scenario to see it logged here.</p>';
        return;
    }

    container.innerHTML = state.scenarios
        .map(scenario => `
            <article class="scenario-entry">
                <header>
                    <span class="scenario-pill">${scenario.scenarioType}</span>
                    <span class="timestamp">${scenario.timestamp}</span>
                </header>
                <p class="scenario-target">${scenario.target === 'revenue' ? 'Revenue' : 'Channel mix'} → <strong>${scenario.label}</strong> updated to <strong>${scenario.value}</strong></p>
                <p class="scenario-meta">Confidence: ${scenario.confidence || 0}%</p>
                ${scenario.notes ? `<p class="scenario-notes">${scenario.notes}</p>` : ''}
            </article>
        `)
        .join('');
}
