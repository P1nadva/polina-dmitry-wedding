// countdown.js - обратный отсчёт до свадьбы
class WeddingCountdown {
    constructor() {
        this.weddingDate = new Date('2026-06-27T16:00:00'); // 27 июня 2026, 16:00
        this.countdownElement = document.getElementById('weddingCountdown');
        this.daysElement = document.getElementById('countdownDays');
        this.hoursElement = document.getElementById('countdownHours');
        this.minutesElement = document.getElementById('countdownMinutes');
        this.secondsElement = document.getElementById('countdownSeconds');
        
        this.init();
    }
    
    init() {
        this.updateCountdown();
        // Обновляем каждую секунду
        setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }
    
    updateCountdown() {
        const now = new Date();
        const timeDifference = this.weddingDate - now;
        
        if (timeDifference <= 0) {
            this.showWeddingStarted();
            return;
        }
        
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
        
        this.updateDisplay(days, hours, minutes, seconds);
    }
    
    updateDisplay(days, hours, minutes, seconds) {
        if (this.daysElement) this.daysElement.textContent = this.formatTime(days);
        if (this.hoursElement) this.hoursElement.textContent = this.formatTime(hours);
        if (this.minutesElement) this.minutesElement.textContent = this.formatTime(minutes);
        if (this.secondsElement) this.secondsElement.textContent = this.formatTime(seconds);
    }
    
    formatTime(time) {
        return time < 10 ? `0${time}` : time;
    }
    
    showWeddingStarted() {
        if (this.countdownElement) {
            this.countdownElement.innerHTML = `
                <div class="countdown-completed">
                    🎉 Свадьба началась! 🎉
                </div>
            `;
        }
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.weddingCountdown = new WeddingCountdown();
});