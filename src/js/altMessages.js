// altMessages.js
async function fetchMessages() {
    const response = await fetch('js/allTheMessages.json');
    const data = await response.json();
    return data;
}

async function init() {
    const messages = await fetchMessages();
    const altMessages = messages.altMessages.concat(messages.playfulMessages);

    function changeText() {
        const textElement = document.getElementById('altMessages');
        textElement.style.opacity = 0;
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * altMessages.length);
            textElement.textContent = altMessages[randomIndex];
            textElement.style.opacity = 1;
        }, 3000); // Fade out duration
    }

    changeText(); // Initial text change
    setInterval(changeText, 8000); // Total cycle: 3s fade out + 3s fade in + 2s delay
}

document.addEventListener('DOMContentLoaded', init);
