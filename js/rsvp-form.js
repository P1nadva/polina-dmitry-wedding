// rsvp-form.js - управление формой подтверждения присутствия
class RsvpForm {
    constructor() {
        this.form = document.getElementById('rsvpForm');
        this.attendanceRadios = document.querySelectorAll('input[name="attendance"]');
        this.guest2Fields = document.getElementById('guest2Fields');
        this.drink2Fields = document.getElementById('drink2Fields');
        
        this.init();
    }
    
    init() {
        // Обработчики для всех радио-кнопок присутствия
        this.attendanceRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleAttendanceChange(e.target.value);
            });
        });
        
        // Обработчик отправки формы
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Инициализация скрытых полей
        this.hideGuest2Fields();
    }
    
    handleAttendanceChange(value) {
        console.log('Выбран вариант:', value);
        
        if (value === 'with_guest') {
            this.showGuest2Fields();
        } else {
            this.hideGuest2Fields();
        }
    }
    
    showGuest2Fields() {
        console.log('Показываем поля для второго гостя');
        
        this.guest2Fields.classList.add('visible');
        this.drink2Fields.classList.add('visible');
        
        // Делаем поле имени обязательным, но НЕ чекбоксы
        this.setGuest2NameRequired(true);
    }
    
    hideGuest2Fields() {
        console.log('Скрываем поля для второго гостя');
        
        this.guest2Fields.classList.remove('visible');
        this.drink2Fields.classList.remove('visible');
        
        // Убираем обязательность и очищаем поля
        this.setGuest2NameRequired(false);
        this.clearGuest2Fields();
    }
    
    setGuest2NameRequired(required) {
        const guest2NameInput = document.getElementById('guest2_name');
        
        if (guest2NameInput) {
            guest2NameInput.required = required;
        }
        
        // НЕ делаем чекбоксы обязательными - это вызывает проблемы
        const drink2Checkboxes = document.querySelectorAll('input[name="drinks2"]');
        drink2Checkboxes.forEach(checkbox => {
            checkbox.required = false; // Всегда false для чекбоксов
        });
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
        submitBtn.innerHTML = '<span class="btn-icon">⏳</span> Отправка...';
        
        try {
            const success = await this.submitToGoogleForms(formData);
            if (success) {
                this.showMessage('✅ Спасибо! Ваш ответ успешно отправлен.', 'success');
                this.form.reset();
                this.hideGuest2Fields();
                
                // Показываем анимацию успеха
                this.animateSuccess(submitBtn);
            } else {
                throw new Error('Ошибка отправки');
            }
        } catch (error) {
            console.error('Ошибка отправки:', error);
            this.showMessage('❌ Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз или свяжитесь с нами напрямую.', 'error');
            this.resetButton(submitBtn);
        }
    }
    
    animateSuccess(button) {
        button.innerHTML = '<span class="btn-icon">✅</span> Отправлено!';
        button.style.background = 'linear-gradient(135deg, var(--olive-green) 0%, var(--olive-green-light) 100%)';
        
        setTimeout(() => {
            this.resetButton(button);
        }, 3000);
    }
    
    resetButton(button) {
        button.disabled = false;
        button.innerHTML = '<span class="btn-icon">💌</span> Отправить ответ';
        button.style.background = '';
    }
    
    collectFormData() {
        const formData = new FormData(this.form);
        
        // Собираем чекбоксы вручную, так как FormData может их терять
        const drinks = Array.from(document.querySelectorAll('input[name="drinks"]:checked'))
            .map(cb => cb.value);
        const drinks2 = Array.from(document.querySelectorAll('input[name="drinks2"]:checked'))
            .map(cb => cb.value);
        
        const data = {
            guestName: formData.get('guest_name') || '',
            attendance: formData.get('attendance') || '',
            guest2Name: formData.get('guest2_name') || '',
            drinks: drinks,
            drinks2: drinks2
        };
        
        console.log('Собранные данные:', data);
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
        
        // Проверка имени второго гостя, если выбран вариант "с гостем"
        if (data.attendance === 'with_guest' && !data.guest2Name.trim()) {
            this.showMessage('❌ Пожалуйста, введите имя и фамилию второго гостя', 'error');
            return false;
        }
        
        // Проверка напитков гостя 1
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
    
    async submitToGoogleForms(data) {
        // ЗАМЕНИТЕ НА ВАШУ ССЫЛКУ Google Forms
        const googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdcvuH1aN4kMR_uyI2VUARsYPtak65CAyRgShijENP58u2bFw/formResponse';
        
        // Создаем URL параметры для GET запроса (более надежно)
        const params = new URLSearchParams();
        
        // МАППИНГ ПОЛЕЙ - ЗАМЕНИТЕ НА ВАШИ РЕАЛЬНЫЕ ID!
        params.append('entry.131366440', data.guestName);        // Имя гостя
        params.append('entry.932005373', data.attendance);       // Присутствие
        
        if (data.attendance === 'with_guest') {
            params.append('entry.1614335047', data.guest2Name);   // Имя второго гостя
        }
        
        // Напитки передаем как строку через запятую
        params.append('entry.1682634094', data.drinks.join(', '));
        
        if (data.attendance === 'with_guest') {
            params.append('entry.743493720', data.drinks2.join(', '));
        }
        
        try {
            // Используем fetch с полным URL
            const fullUrl = `${googleFormUrl}?${params.toString()}`;
            console.log('Отправка данных по URL:', fullUrl);
            
            const response = await fetch(fullUrl, {
                method: 'GET',
                mode: 'no-cors' // no-cors для обхода CORS
            });
            
            // При mode: 'no-cors' мы не можем проверить ответ, но запрос отправляется
            console.log('Запрос отправлен (no-cors)');
            return true;
            
        } catch (error) {
            console.error('Ошибка fetch:', error);
            throw error;
        }
    }
    
    showMessage(text, type) {
        // Удаляем предыдущие сообщения
        const existingMessage = this.form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const message = document.createElement('div');
        message.className = `form-message ${type}`;
        message.textContent = text;
        
        this.form.appendChild(message);
        
        // Автоматическое скрытие успешного сообщения
        if (type === 'success') {
            setTimeout(() => {
                message.remove();
            }, 5000);
        }
        
        // Прокрутка к сообщению об ошибке
        if (type === 'error') {
            message.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.rsvpForm = new RsvpForm();
});