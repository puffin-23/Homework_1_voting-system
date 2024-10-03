const variantsDiv = document.getElementById('variants');
const statisticsDiv = document.getElementById('statistics');

async function fetchVariants() {
    const response = await fetch('/variants');
    return await response.json();
}

async function fetchStats() {
    const response = await fetch('/stat', { method: 'POST' });
    return await response.json();
}

async function submitVote(variantId) {
    await fetch('/vote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variantId })
    });
    
    updateStatistics();
}

async function updateStatistics() {
    const stats = await fetchStats();
    statisticsDiv.innerHTML = stats.map(stat => `Вариант ${stat.id}: ${stat.count} голосов`).join('<br>');
}

async function renderVariants() {
    const variants = await fetchVariants();
    variantsDiv.innerHTML = variants.map(v => `
        <button onclick="submitVote(${v.id})">${v.text}</button>
    `).join('');
}

async function init() {
    await renderVariants();
    await updateStatistics();
}

init();