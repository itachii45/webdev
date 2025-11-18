const state = {
    revenue: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        values: [220, 240, 310, 365]
    },
    channels: {
        labels: ['Organic', 'Paid', 'Partners', 'Community'],
        values: [45, 26, 18, 11]
    }
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

    const form = document.getElementById('dataForm');
    form.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(form);
        const target = formData.get('target');
        const label = formData.get('label');
        const value = Number(formData.get('value'));

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
        form.reset();
    });
});

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
