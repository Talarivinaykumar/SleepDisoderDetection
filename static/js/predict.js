// Prediction page JavaScript

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('predictionForm');
    const resultCard = document.getElementById('resultCard');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');

    // Add floating label effect
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function () {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });

        // Check if input has value on load
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });

    // Form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Show loader
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';

        // Collect form data
        const formData = {
            age: document.getElementById('age').value,
            gender: document.getElementById('gender').value,
            sleep_duration: document.getElementById('sleep_duration').value,
            stress_level: document.getElementById('stress_level').value,
            daily_steps: document.getElementById('daily_steps').value,
            heart_rate: document.getElementById('heart_rate').value,
            systolic_bp: document.getElementById('systolic_bp').value,
            diastolic_bp: document.getElementById('diastolic_bp').value
        };

        try {
            // Send data to backend
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                displayResult(result);
            } else {
                alert('Error: ' + (result.error || 'Something went wrong'));
            }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            // Hide loader
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
});

function displayResult(result) {
    const resultCard = document.getElementById('resultCard');
    const predictionText = document.getElementById('predictionText');
    const resultBadge = document.getElementById('resultBadge');
    const confidenceProgress = document.getElementById('confidenceProgress');
    const confidenceText = document.getElementById('confidenceText');
    const suggestionsList = document.getElementById('suggestionsList');

    // Set prediction text
    predictionText.textContent = result.prediction;

    // Set color based on prediction
    const colorMap = {
        'No Sleep Disorder': 'success',
        'Insomnia': 'danger',
        'Sleep Apnea': 'warning',
        'Restless Legs Syndrome': 'rls',
        'Hypersomnia': 'info',
        'Circadian Rhythm Disorder': 'purple',
        'Severe Sleep Deprivation': 'dark'
    };
    const colorClass = colorMap[result.prediction] || 'success';

    // Apply color classes
    predictionText.className = 'prediction-text ' + colorClass;
    resultBadge.className = 'result-badge ' + colorClass;
    resultBadge.textContent = result.prediction;

    // Set confidence
    const confidence = Math.round(result.confidence);
    confidenceProgress.style.width = confidence + '%';
    confidenceText.textContent = confidence + '% Confidence';

    // Set suggestions
    suggestionsList.innerHTML = '';
    result.suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        suggestionsList.appendChild(li);
    });

    // === RISK LEVEL METER ===
    if (result.risk_level) {
        const riskMeterFill = document.getElementById('riskMeterFill');
        const riskLevelBadge = document.getElementById('riskLevelBadge');

        riskMeterFill.style.width = result.risk_level.score + '%';
        riskMeterFill.className = 'risk-meter-fill risk-' + result.risk_level.level;

        riskLevelBadge.textContent = result.risk_level.emoji + ' ' + result.risk_level.label + ' (Score: ' + result.risk_level.score + '/100)';
        riskLevelBadge.className = 'risk-level-badge risk-badge-' + result.risk_level.level;
    }

    // === HEALTH RISKS (IF NEGLECTED) ===
    if (result.health_risks) {
        const healthRisksSummary = document.getElementById('healthRisksSummary');
        const healthRisksList = document.getElementById('healthRisksList');

        healthRisksSummary.textContent = result.health_risks.summary;
        healthRisksList.innerHTML = '';

        result.health_risks.risks.forEach((risk, index) => {
            const riskCard = document.createElement('div');
            riskCard.className = 'health-risk-card severity-' + risk.severity;
            riskCard.style.animationDelay = (index * 0.1) + 's';

            const severityBadgeClass = 'severity-badge severity-' + risk.severity;
            const severityLabel = risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1);

            riskCard.innerHTML = `
                <div class="risk-card-header">
                    <span class="risk-card-icon">${risk.icon}</span>
                    <div class="risk-card-title-group">
                        <h4 class="risk-card-name">${risk.name}</h4>
                        <div class="risk-card-meta">
                            <span class="${severityBadgeClass}">${severityLabel}</span>
                            <span class="timeline-badge">🕐 ${risk.timeline}</span>
                        </div>
                    </div>
                </div>
                <p class="risk-card-description">${risk.description}</p>
            `;

            healthRisksList.appendChild(riskCard);
        });
    }

    // === PREDICTION RANGES GUIDE ===
    if (result.prediction_ranges) {
        const rangesGrid = document.getElementById('rangesGrid');
        rangesGrid.innerHTML = '';

        Object.entries(result.prediction_ranges).forEach(([disorder, data]) => {
            const isCurrentPrediction = disorder === result.prediction;
            const rangeCard = document.createElement('div');
            rangeCard.className = 'range-card range-' + data.color + (isCurrentPrediction ? ' range-active' : '');

            let rangeRows = '';
            Object.entries(data.ranges).forEach(([param, value]) => {
                rangeRows += `
                    <div class="range-row">
                        <span class="range-param">${param}</span>
                        <span class="range-value">${value}</span>
                    </div>
                `;
            });

            rangeCard.innerHTML = `
                <div class="range-card-header">
                    <span class="range-card-icon">${data.icon}</span>
                    <h4 class="range-card-title">${disorder}</h4>
                    ${isCurrentPrediction ? '<span class="current-prediction-tag">YOUR RESULT</span>' : ''}
                </div>
                <div class="range-card-body">
                    ${rangeRows}
                </div>
            `;

            rangesGrid.appendChild(rangeCard);
        });
    }

    // === SLEEP DURATION INTERPRETATION GUIDE ===
    const durationGuide = [
        { range: '0 – 3 hrs', condition: 'Severe Sleep Deprivation / Extreme Insomnia', color: '#6b7280' },
        { range: '3 – 5 hrs', condition: 'Chronic Insomnia', color: '#ef4444' },
        { range: '5 – 6.5 hrs', condition: 'Mild Insomnia or Restless Legs Syndrome', color: '#f97316' },
        { range: '6 – 7 hrs', condition: 'Borderline Deficiency / Possible Sleep Apnea', color: '#f59e0b' },
        { range: '7 – 9 hrs', condition: '✅ Normal Healthy Sleep', color: '#10b981' },
        { range: '9 – 12 hrs', condition: 'Hypersomnia', color: '#60a5fa' },
        { range: 'Variable timing', condition: 'Circadian Rhythm Disorder', color: '#d8b4fe' }
    ];

    const durationSection = document.getElementById('durationGuideSection');
    const durationTableBody = document.getElementById('durationTableBody');

    if (durationSection && durationTableBody) {
        durationTableBody.innerHTML = '';
        durationGuide.forEach(row => {
            const isMatch = (
                (result.prediction === 'Severe Sleep Deprivation' && row.range === '0 – 3 hrs') ||
                (result.prediction === 'Insomnia' && (row.range === '3 – 5 hrs' || row.range === '5 – 6.5 hrs')) ||
                (result.prediction === 'Sleep Apnea' && row.range === '6 – 7 hrs') ||
                (result.prediction === 'No Sleep Disorder' && row.range === '7 – 9 hrs') ||
                (result.prediction === 'Hypersomnia' && row.range === '9 – 12 hrs') ||
                (result.prediction === 'Circadian Rhythm Disorder' && row.range === 'Variable timing') ||
                (result.prediction === 'Restless Legs Syndrome' && row.range === '5 – 6.5 hrs')
            );
            const tr = document.createElement('tr');
            tr.className = isMatch ? 'duration-row-active' : '';
            tr.innerHTML = `
                <td class="duration-range" style="color:${row.color}">${row.range}</td>
                <td class="duration-condition">${row.condition} ${isMatch ? '<span class="your-range-tag">← YOUR RANGE</span>' : ''}</td>
            `;
            durationTableBody.appendChild(tr);
        });
        durationSection.style.display = 'block';
    }

    // Show result card with animation
    resultCard.style.display = 'block';

    // Scroll to result
    setTimeout(() => {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function resetForm() {
    const form = document.getElementById('predictionForm');
    const resultCard = document.getElementById('resultCard');

    form.reset();
    resultCard.style.display = 'none';

    // Remove focused class from all form groups
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('focused');
    });

    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Input validation and formatting
document.addEventListener('DOMContentLoaded', function () {
    // Age validation
    const ageInput = document.getElementById('age');
    if (ageInput) {
        ageInput.addEventListener('change', function () {
            if (this.value !== "" && this.value < 1) this.value = 1;
            if (this.value > 120) this.value = 120;
        });
    }

    // Sleep duration validation
    const sleepInput = document.getElementById('sleep_duration');
    if (sleepInput) {
        sleepInput.addEventListener('change', function () {
            if (this.value !== "" && this.value < 0) this.value = 0;
            if (this.value > 24) this.value = 24;
        });
    }

    // Stress level validation
    const stressInput = document.getElementById('stress_level');
    if (stressInput) {
        stressInput.addEventListener('change', function () {
            if (this.value !== "" && this.value < 1) this.value = 1;
            if (this.value > 10) this.value = 10;
        });
    }

    // Heart rate validation
    const heartRateInput = document.getElementById('heart_rate');
    if (heartRateInput) {
        heartRateInput.addEventListener('change', function () {
            if (this.value !== "" && this.value < 30) this.value = 30;
            if (this.value > 200) this.value = 200;
        });
    }

    // Blood pressure validation
    const systolicInput = document.getElementById('systolic_bp');
    if (systolicInput) {
        systolicInput.addEventListener('change', function () {
            if (this.value !== "" && this.value < 70) this.value = 70;
            if (this.value > 200) this.value = 200;
        });
    }

    const diastolicInput = document.getElementById('diastolic_bp');
    if (diastolicInput) {
        diastolicInput.addEventListener('change', function () {
            if (this.value !== "" && this.value < 40) this.value = 40;
            if (this.value > 130) this.value = 130;
        });
    }

    // Daily steps validation
    const stepsInput = document.getElementById('daily_steps');
    if (stepsInput) {
        stepsInput.addEventListener('change', function () {
            if (this.value !== "" && this.value < 0) this.value = 0;
        });
    }
});
