// telegram-form.js - полная версия с Telegram отправкой
class TelegramForm {
    constructor() {
        this.form = document.getElementById('rsvpForm');
        this.attendanceRadios = document.querySelectorAll('input[name="attendance"]');
        this.guest2Fields = document.getElementById('guest2Fields');
        this.drink2Fields = document.getElementById('drink2Fields');
        
        // 🔑 ЗАМЕНИТЕ ЭТИ ДАННЫЕ НА ВАШИ:
        this.botToken = '5204273046:AAH0FrePiMSqkmaC5ezZVEi_bcXMNwPBN00'; // Ваш токен от BotFather
        this.chatId = '413268218'; // Ваш Chat ID
        
        this.init();
    }
    
    init() {
        if (!this.form) {
            console.error('❌ Форма RSVP не найдена');
            return;
        }
        
        console.log('🤖 Инициализация Telegram формы...');
        
        this.attendanceRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleAttendanceChange(e.target.value);
            });
        });
        
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        this.hideGuest2Fields();
        console.log('✅ Telegram форма готова');
    }
    
    handleAttendanceChange(value) {
        if (value === 'with_guest') {
            this.showGuest2Fields();
        } else {
            this.hideGuest2Fields();
        }
    }
    
    showGuest2Fields() {
        if (this.guest2Fields) this.guest2Fields.classList.add('visible');
        if (this.drink2Fields) this.drink2Fields.classList.add('visible');
        this.setGuest2NameRequired(true);
    }
    
    hideGuest2Fields() {
        if (this.guest2Fields) this.guest2Fields.classList.remove('visible');
        if (this.drink2Fields) this.drink2Fields.classList.remove('visible');
        this.setGuest2NameRequired(false);
        this.clearGuest2Fields();
    }
    
    setGuest2NameRequired(required) {
        const guest2NameInput = document.getElementById('guest2_name');
        if (guest2NameInput) {
            guest2NameInput.required = required;
        }
    }
    
    clearGuest2Fields() {
        const guest2NameInput = document.getElementById('guest2_name');
        const drink2Checkboxes = document.querySelectorAll('input[name="drinks2"]');
        
        if (guest2NameInput) {
            guest2NameInput.value = '';
        }
        
        drink2Checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    async handleSubmit() {
        const submitBtn = this.form.querySelector('.submit-btn');
        const formData = this.collectFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-icon">📡</span> Отправка в Telegram...';
        
        try {
            const success = await this.sendToTelegram(formData);
            
            if (success) {
                this.showMessage('✅ Спасибо! Ваш ответ отправлен в Telegram. Ждём вас на свадьбе! 💒', 'success');
                this.form.reset();
                this.hideGuest2Fields();
                this.animateSuccess(submitBtn);
            } else {
                throw new Error('Telegram не ответил');
            }
        } catch (error) {
            console.error('❌ Ошибка отправки в Telegram:', error);
            // Fallback: показываем данные для ручной отправки
            this.showDataForManualSubmission(formData, submitBtn);
        }
    }
    
    async sendToTelegram(formData) {
        const message = this.formatTelegramMessage(formData);
        
        console.log('📨 Отправка в Telegram:', message);
        
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            
            const result = await response.json();
            console.log('📬 Ответ Telegram:', result);
            
            return result.ok === true;
            
        } catch (error) {
            console.error('❌ Ошибка fetch:', error);
            return false;
        }
    }
    
    formatTelegramMessage(data) {
        const attendanceEmoji = {
            'coming': '✅',
            'with_guest': '👥', 
            'not_coming': '❌'
        };
        
        // Если пользователь не приходит, показываем специальное сообщение
        if (data.attendance === 'not_coming') {
            return `
<b>💒 НОВЫЙ ОТВЕТ НА СВАДЕБНОЕ ПРИГЛАШЕНИЕ</b>

<b>👤 Гость:</b> ${data.guestName}
<b>${attendanceEmoji[data.attendance]} Присутствие:</b> ${this.getAttendanceText(data.attendance)}

<b>📅 Дата отправки:</b> ${new Date().toLocaleString('ru-RU')}
<b>🌐 Отправлено через:</b> сайт приглашения
            `.trim();
        }
        
        return `
<b>💒 НОВЫЙ ОТВЕТ НА СВАДЕБНОЕ ПРИГЛАШЕНИЕ</b>

<b>👤 Гость:</b> ${data.guestName}
<b>${attendanceEmoji[data.attendance]} Присутствие:</b> ${this.getAttendanceText(data.attendance)}
${data.guest2Name ? `<b>👥 Второй гость:</b> ${data.guest2Name}` : ''}
<b>🍷 Напитки гостя 1:</b> ${data.drinks.join(', ')}
${data.drinks2.length > 0 ? `<b>🍸 Напитки гостя 2:</b> ${data.drinks2.join(', ')}` : ''}

<b>📅 Дата отправки:</b> ${new Date().toLocaleString('ru-RU')}
<b>🌐 Отправлено через:</b> сайт приглашения
        `.trim();
    }
    
    getAttendanceText(value) {
        const attendanceMap = {
            'coming': 'Я буду',
            'with_guest': 'Я буду не один',
            'not_coming': 'К сожалению, не приду'
        };
        return attendanceMap[value] || value;
    }
    
    // Fallback: если Telegram не работает
    showDataForManualSubmission(data, submitBtn) {
        const messageText = `
❌ Не удалось отправить в Telegram автоматически.

Пожалуйста, отправьте эти данные нам в WhatsApp или Telegram:

👤 Имя: ${data.guestName}
✅ Присутствие: ${this.getAttendanceText(data.attendance)}
${data.guest2Name ? `👥 Второй гость: ${data.guest2Name}` : ''}
🍷 Напитки: ${data.drinks.join(', ')}
${data.drinks2.length > 0 ? `🍸 Напитки гостя 2: ${data.drinks2.join(', ')}` : ''}

Скопируйте это сообщение и отправьте нам 📱
        `.trim();
        
        this.showMessage(messageText, 'error');
        this.resetButton(submitBtn);
        
        // Добавляем кнопку для копирования
        this.addCopyButton(messageText);
    }
    
    addCopyButton(text) {
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.innerHTML = '📋 Скопировать данные для Telegram';
        copyBtn.className = 'copy-telegram-btn';
        
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.innerHTML = '✅ Скопировано в буфер!';
                copyBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                
                setTimeout(() => {
                    copyBtn.innerHTML = '📋 Скопировать данные для Telegram';
                    copyBtn.style.background = '';
                }, 2000);
            }).catch(() => {
                copyBtn.innerHTML = '❌ Ошибка копирования';
            });
        };
        
        const messageElement = this.form.querySelector('.form-message');
        if (messageElement) {
            messageElement.appendChild(copyBtn);
        }
    }
    
    animateSuccess(button) {
        button.innerHTML = '<span class="btn-icon">✅</span> Отправлено в Telegram!';
        button.style.background = 'linear-gradient(135deg, #0088cc, #00aced)';
        
        setTimeout(() => {
            this.resetButton(button);
        }, 4000);
    }
    
    resetButton(button) {
        button.disabled = false;
        button.innerHTML = '<span class="btn-icon">🤖</span> Отправить в Telegram';
        button.style.background = '';
    }
    
    collectFormData() {
        const drinks = Array.from(document.querySelectorAll('input[name="drinks"]:checked'))
            .map(cb => cb.value);
        const drinks2 = Array.from(document.querySelectorAll('input[name="drinks2"]:checked'))
            .map(cb => cb.value);
        
        const data = {
            guestName: document.getElementById('guest_name').value.trim(),
            attendance: document.querySelector('input[name="attendance"]:checked')?.value || '',
            guest2Name: document.getElementById('guest2_name').value.trim(),
            drinks: drinks,
            drinks2: drinks2
        };
        
        // Если пользователь не придет, очищаем данные о напитках
        if (data.attendance === 'not_coming') {
            data.drinks = ['Не приходит'];
            data.drinks2 = [];
            data.guest2Name = '';
        }
        
        console.log('📊 Собранные данные для Telegram:', data);
        return data;
    }
    
    validateForm(data) {
        // Проверка имени гостя
        if (!data.guestName.trim()) {
            this.showMessage('❌ Пожалуйста, введите ваше имя и фамилию', 'error');
            return false;
        }

        // Проверка выбора присутствия
        if (!data.attendance) {
            this.showMessage('❌ Пожалуйста, выберите вариант присутствия', 'error');
            return false;
        }

        // Если пользователь не придет, пропускаем остальные проверки
        if (data.attendance === 'not_coming') {
            console.log('Пользователь не придет, пропускаем проверки напитков');
            return true;
        }

        // Проверка имени второго гостя, если выбран вариант "с гостем"
        if (data.attendance === 'with_guest' && !data.guest2Name.trim()) {
            this.showMessage('❌ Пожалуйста, введите имя и фамилию второго гостя', 'error');
            return false;
        }

        // Проверка напитков гостя 1 (только если пользователь придет)
        if (data.drinks.length === 0) {
            this.showMessage('❌ Пожалуйста, выберите предпочтения по напиткам', 'error');
            return false;
        }

        // Проверка напитков гостя 2, если выбран вариант "с гостем"
        if (data.attendance === 'with_guest' && data.drinks2.length === 0) {
            this.showMessage('❌ Пожалуйста, выберите предпочтения по напиткам для второго гостя', 'error');
            return false;
        }

        return true;
    }
    
    showMessage(text, type) {
        const existingMessage = this.form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const message = document.createElement('div');
        message.className = `form-message ${type}`;
        message.innerHTML = text.replace(/\n/g, '<br>');
        this.form.appendChild(message);
        
        if (type === 'success') {
            setTimeout(() => message.remove(), 5000);
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.telegramForm = new TelegramForm();
});