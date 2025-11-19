const yearLabels = ['2020', '2021', '2022', '2023', '2024'];
const enrollmentValues = [3200, 3420, 3650, 3880, 4105];
const specializationLabels = [
    'Informatique',
    'Intelligence Artificielle',
    'Télécommunications',
    'Énergies Renouvelables',
    'Génie Biomédical'
];
const specializationValues = [860, 720, 540, 610, 375];

const studentEntries = [
    {
        name: 'Nesrine Mahdi',
        matricule: '20AI108',
        speciality: 'Intelligence Artificielle',
        year: '2024',
        semester: 'S2',
        gpa: 15.8,
        pathway: 'Entrepreneuriat',
        notes: 'Co-fondatrice de la startup GreenAI, finaliste Hult Prize.'
    },
    {
        name: 'Yacine Boulifa',
        matricule: '19CSI222',
        speciality: 'Informatique',
        year: '2023',
        semester: 'S1',
        gpa: 14.1,
        pathway: 'Recherche',
        notes: 'Travaille sur la détection d’objets pour le laboratoire LCSI.'
    },
    {
        name: 'Samia Zerhouni',
        matricule: '21TEL045',
        speciality: 'Télécommunications',
        year: '2024',
        semester: 'S2',
        gpa: 13.6,
        pathway: 'Internationale',
        notes: 'Échange Erasmus+ à l’Université de Porto.'
    }
];

const enrollmentCtx = document.getElementById('enrollmentChart');
const specializationCtx = document.getElementById('specializationChart');
const studentLog = document.getElementById('studentLog');
const gpaValue = document.getElementById('gpaValue');
const studentMetric = document.querySelector('[data-metric="students"]');

const enrollmentChart = new Chart(enrollmentCtx, {
    type: 'line',
    data: {
        labels: yearLabels,
        datasets: [
            {
                label: 'Étudiants inscrits',
                data: enrollmentValues,
                borderColor: '#25d2ff',
                backgroundColor: 'rgba(37, 210, 255, 0.25)',
                borderWidth: 3,
                fill: true,
                tension: 0.35
            }
        ]
    },
    options: {
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.05)' }
            },
            y: {
                beginAtZero: false,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: {
                    callback: (value) => `${value.toLocaleString('fr-DZ')} étudiants`
                }
            }
        }
    }
});

const specializationChart = new Chart(specializationCtx, {
    type: 'doughnut',
    data: {
        labels: specializationLabels,
        datasets: [
            {
                data: specializationValues,
                backgroundColor: ['#ff7d9c', '#25d2ff', '#c7ff6b', '#ffdd57', '#a784ff'],
                borderWidth: 0,
                hoverOffset: 8
            }
        ]
    },
    options: {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: 'rgba(238, 241, 255, 0.9)'
                }
            }
        },
        cutout: '55%'
    }
});

function updateStudentMetric() {
    const total = specializationValues.reduce((acc, value) => acc + value, 0);
    studentMetric.textContent = total.toLocaleString('fr-DZ');
}

function renderLog() {
    if (!studentEntries.length) {
        studentLog.innerHTML = '<p class="muted">Aucune fiche soumise pour le moment.</p>';
        return;
    }

    studentLog.innerHTML = studentEntries
        .slice(0, 6)
        .map(
            (student) => `
            <article class="log-entry">
                <header>
                    <span>${student.name}</span>
                    <span>${student.gpa.toFixed(1)}/20</span>
                </header>
                <p class="meta">${student.matricule} • ${student.speciality} • ${student.year} ${student.semester}</p>
                <p class="meta">Orientation : ${student.pathway}</p>
                <p>${student.notes || '—'}</p>
            </article>
        `
        )
        .join('');
}

function incrementDataset(labels, values, key) {
    const index = labels.indexOf(key);
    if (index === -1) {
        labels.push(key);
        values.push(1);
    } else {
        values[index] += 1;
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const entry = Object.fromEntries(formData.entries());
    entry.gpa = Number(entry.gpa);
    studentEntries.unshift(entry);

    incrementDataset(yearLabels, enrollmentValues, entry.year);
    enrollmentChart.update();

    incrementDataset(specializationLabels, specializationValues, entry.speciality);
    specializationChart.update();

    updateStudentMetric();
    renderLog();

    event.target.reset();
    event.target.gpa.value = 14;
    gpaValue.textContent = '14.0';
}

function setupRangeOutput() {
    const range = document.querySelector('input[name="gpa"]');
    range.addEventListener('input', (event) => {
        gpaValue.textContent = Number(event.target.value).toFixed(1);
    });
}

function exportData(format) {
    const payload = {
        charts: {
            enrollment: {
                labels: yearLabels,
                values: enrollmentValues
            },
            specializations: {
                labels: specializationLabels,
                values: specializationValues
            }
        },
        students: studentEntries
    };

    let blob;
    let filename;

    if (format === 'json') {
        blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        filename = 'ub1-students.json';
    } else {
        const headers = ['Nom', 'Matricule', 'Spécialité', 'Année', 'Semestre', 'Moyenne', 'Orientation', 'Notes'];
        const rows = studentEntries.map((student) =>
            [
                student.name,
                student.matricule,
                student.speciality,
                student.year,
                student.semester,
                student.gpa,
                student.pathway,
                (student.notes || '').replace(/\n/g, ' ')
            ]
                .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                .join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');
        blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        filename = 'ub1-students.csv';
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function bindExports() {
    document.getElementById('exportJson').addEventListener('click', () => exportData('json'));
    document.getElementById('exportCsv').addEventListener('click', () => exportData('csv'));
}

function init() {
    updateStudentMetric();
    renderLog();
    setupRangeOutput();
    bindExports();
    document.getElementById('studentForm').addEventListener('submit', handleFormSubmit);
}

window.addEventListener('DOMContentLoaded', init);
