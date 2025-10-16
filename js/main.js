// main.js - оптимизированная версия
// Основной файл для инициализации всех компонентов
class WeddingInvitation {
    constructor() {
        this.componentsInitialized = false;
        this.init();
    }
    
    init() {
        console.log('🚀 Свадебное приглашение инициализировано!');
        this.initGlobalHandlers();
        this.initAnalytics();
        this.checkComponents();
        this.componentsInitialized = true;
    }
    
    checkComponents() {
        console.log('🔧 Проверка компонентов:');
        console.log('- Music Player:', typeof window.musicPlayer);
        console.log('- Scroll Animations:', typeof window.scrollAnimations);
        console.log('- Video Controls:', typeof window.videoControls);
        console.log('- Telegram Form:', typeof window.telegramForm);
        console.log('- Countdown:', typeof window.weddingCountdown);
        
        // Автоматическое восстановление при отсутствии компонентов
        if (!window.scrollAnimations) {
            console.warn('⚠️ ScrollAnimations не найден, применяем fallback');
            this.applyAnimationFallback();
        }
        
        if (!window.videoControls) {
            console.warn('⚠️ VideoControls не найден');
        }
        
        if (!window.musicPlayer) {
            console.warn('⚠️ MusicPlayer не найден');
        }
        
        if (!window.telegramForm) {
            console.warn('⚠️ TelegramForm не найден');
        }
    }
    
    applyAnimationFallback() {
        console.log('🔄 Применяем fallback для анимаций...');
        
        // Показываем все элементы без анимаций
        document.body.classList.add('page-loaded', 'animation-fallback');
        
        // Показываем все секции
        document.querySelectorAll('.section-animate').forEach(section => {
            if (section) {
                section.classList.add('section-visible');
            }
        });
        
        // Показываем шапку сразу
        const header = document.getElementById('mainHeader');
        const headerLeft = document.getElementById('headerLeft');
        const headerRight = document.getElementById('headerRight');
        const heroTitle = document.querySelector('.hero-title');
        const heroDate = document.querySelector('.hero-date');
        
        if (header && headerLeft && headerRight && heroTitle && heroDate) {
            header.classList.add('visible');
            headerLeft.textContent = heroTitle.textContent;
            headerLeft.classList.add('visible');
            headerRight.textContent = heroDate.textContent;
            headerRight.classList.add('visible');
        }
        
        console.log('✅ Fallback анимаций применен');
    }
    
    initGlobalHandlers() {
        // Обработчик для всех внешних ссылок
        this.handleExternalLinks();
        
        // Обработчик для touch устройств
        this.handleTouchDevices();
        
        // Обработчик для изображений с ошибками загрузки
        this.handleImageErrors();
        
        // Обработчик ошибок JavaScript
        this.handleJSErrors();
        
        // Обработчик для медленных соединений
        this.handleSlowConnections();
    }
    
    handleExternalLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.target === '_blank') {
                console.log('🔗 Внешняя ссылка:', link.href);
                // Можно добавить аналитику здесь
            }
        });
    }
    
    handleTouchDevices() {
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
            console.log('📱 Touch device detected');
        } else {
            document.body.classList.add('no-touch-device');
            console.log('💻 Desktop device detected');
        }
    }
    
    handleImageErrors() {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                console.warn('🖼️ Ошибка загрузки изображения:', e.target.src);
                // Можно добавить fallback изображение
                e.target.style.display = 'none';
            }
        }, true);
    }
    
    handleJSErrors() {
        window.addEventListener('error', (e) => {
            console.error('🚨 Глобальная ошибка JavaScript:', e.error);
            // Гарантируем, что страница остается функциональной
            if (!this.componentsInitialized) {
                this.applyAnimationFallback();
            }
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('🚨 Необработанный Promise rejection:', e.reason);
        });
    }
    
    handleSlowConnections() {
        // Если страница загружается долго, показываем fallback
        const slowLoadTimeout = setTimeout(() => {
            if (!document.body.classList.contains('page-loaded')) {
                console.log('🐌 Медленная загрузка, применяем упрощенный режим');
                this.applyAnimationFallback();
            }
        }, 5000); // 5 секунд
        
        // Очищаем таймаут при успешной загрузке
        window.addEventListener('load', () => {
            clearTimeout(slowLoadTimeout);
        });
    }
    
    initAnalytics() {
        // Простая аналитика - отслеживание просмотров секций
        if (window.IntersectionObserver) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        console.log(`👀 Секция "${entry.target.id}" в поле зрения`);
                        // Можно добавить отправку в аналитику
                    }
                });
            }, { 
                threshold: 0.5,
                rootMargin: '0px 0px -100px 0px' // Учитываем только когда секция полностью в поле зрения
            });
            
            document.querySelectorAll('section').forEach(section => {
                if (section) {
                    observer.observe(section);
                }
            });
        } else {
            console.warn('IntersectionObserver не поддерживается в этом браузере');
        }
        
        // Отслеживание кликов по важным элементам
        this.trackImportantClicks();
    }
    
    trackImportantClicks() {
        const importantSelectors = [
            '.video-play-button',
            '.music-toggle',
            '.submit-btn',
            '.address-link'
        ];
        
        document.addEventListener('click', (e) => {
            importantSelectors.forEach(selector => {
                if (e.target.closest(selector)) {
                    console.log(`🎯 Клик по: ${selector}`);
                }
            });
        });
    }
    
    // Вспомогательные методы для оптимизации производительности
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Метод для безопасного выполнения кода
    safeExecute(callback, fallback = null) {
        try {
            return callback();
        } catch (error) {
            console.error('Ошибка выполнения:', error);
            if (fallback) {
                return fallback();
            }
            return null;
        }
    }
}

// Инициализация при полной загрузке страницы
window.addEventListener('load', () => {
    window.weddingInvitation = new WeddingInvitation();
});

// Fallback для старых браузеров
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
        return setTimeout(callback, 1000 / 60);
    };
    console.warn('requestAnimationFrame не поддерживается, используется fallback');
}

// Проверка поддержки современных функций
if (!window.Promise) {
    console.error('Promise не поддерживается в этом браузере');
    // Можно добавить polyfill здесь
}

// Добавляем класс no-js для случаев отключенного JavaScript
document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js-enabled');