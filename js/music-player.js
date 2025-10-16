// Музыкальный плеер - теперь инициализируется первым
class MusicPlayer {
    constructor() {
        this.music = document.getElementById('backgroundMusic');
        this.toggleButton = document.getElementById('musicToggle');
        this.musicPrompt = document.getElementById('musicPrompt');
        this.enableBtn = document.getElementById('enableMusic');
        this.skipBtn = document.getElementById('skipMusic');
        this.promptLoader = document.querySelector('.prompt-loader');
        this.musicPlayerElement = document.querySelector('.music-player');
        
        this.musicStarted = false;
        this.isPlaying = false;
        this.pageLoaded = false;
        this.userMadeChoice = false; // Флаг выбора пользователя
        
        this.FADE_DURATION = 1000;
        this.FADE_STEPS = 20;
        this.FADE_INTERVAL = this.FADE_DURATION / this.FADE_STEPS;
        
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            this.musicPrompt.style.display = 'flex';
            this.musicPrompt.classList.add('visible');
        }, 100);
        
        this.init();
    }
    
    init() {
        // Показываем загрузчик на 2 секунды для красоты
        setTimeout(() => {
            this.promptLoader.style.display = 'none';
        }, 2000);
        
        // Назначаем обработчики
        this.enableBtn.addEventListener('click', () => this.handleEnableMusic());
        this.skipBtn.addEventListener('click', () => this.handleSkipMusic());
        this.toggleButton.addEventListener('click', () => this.toggleMusic());
        
        // Обработка ошибок
        this.music.addEventListener('error', (e) => this.handleMusicError(e));
        
        // НЕ загружаем сохраненное состояние автоматически
        // Даем пользователю сделать выбор каждый раз
    }
    
    async handleEnableMusic() {
        if (this.userMadeChoice) return; // Защита от повторных нажатий
        
        this.userMadeChoice = true;
        this.enableBtn.disabled = true;
        this.skipBtn.disabled = true;
        
        await this.startMusic();
        this.hidePromptAndStartPage();
    }
    
    handleSkipMusic() {
        if (this.userMadeChoice) return; // Защита от повторных нажатий
        
        this.userMadeChoice = true;
        this.enableBtn.disabled = true;
        this.skipBtn.disabled = true;
        
        this.hidePromptAndStartPage();
    }
    
    hidePromptAndStartPage() {
        console.log('Скрываем промпт, запускаем страницу...');
        
        // Скрываем промпт с анимацией
        this.musicPrompt.classList.add('hidden');
        
        // Показываем музыкальный плеер если музыка включена
        if (this.musicStarted && this.isPlaying) {
            setTimeout(() => {
                this.musicPlayerElement.classList.add('visible');
            }, 500);
        }
        
        // Запускаем загрузку страницы
        setTimeout(() => {
            this.startPageLoad();
        }, 800);
    }
    
    startPageLoad() {
        console.log('Запускаем загрузку страницы...');
        
        document.body.style.overflow = 'auto';
        this.pageLoaded = true;
        document.body.classList.add('page-loaded');
        
        // ВАЖНО: Запускаем анимации
        if (window.scrollAnimations) {
            window.scrollAnimations.initPageLoadAnimations();
        }
        
        this.saveMusicState();
        console.log('Страница загружена');
    }
    
    // Плавное включение музыки
    async fadeIn() {
        return new Promise((resolve) => {
            this.music.volume = 0;
            let step = 0;
            
            const fadeInterval = setInterval(() => {
                step++;
                this.music.volume = (step / this.FADE_STEPS) * 0.3;
                
                if (step >= this.FADE_STEPS) {
                    clearInterval(fadeInterval);
                    resolve();
                }
            }, this.FADE_INTERVAL);
        });
    }
    
    // Плавное выключение музыки
    async fadeOut() {
        return new Promise((resolve) => {
            let step = this.FADE_STEPS;
            
            const fadeInterval = setInterval(() => {
                step--;
                this.music.volume = (step / this.FADE_STEPS) * 0.3;
                
                if (step <= 0) {
                    clearInterval(fadeInterval);
                    this.music.pause();
                    resolve();
                }
            }, this.FADE_INTERVAL);
        });
    }
    
    // Запуск музыки
    async startMusic() {
        if (!this.musicStarted) {
            try {
                this.setLoadingState(true);
                console.log('Пытаемся запустить музыку...');
                await this.music.play();
                console.log('Музыка успешно запущена');
                this.musicStarted = true;
                this.isPlaying = true;
                await this.fadeIn();
                this.toggleButton.classList.add('playing');
            } catch (error) {
                console.log('Ошибка воспроизведения:', error);
                // Если музыка не запустилась, все равно продолжаем
            } finally {
                this.setLoadingState(false);
            }
        } else if (this.musicStarted && !this.isPlaying) {
            // Если музыка уже загружена, но на паузе
            try {
                this.setLoadingState(true);
                await this.music.play();
                this.isPlaying = true;
                await this.fadeIn();
                this.toggleButton.classList.add('playing');
            } catch (error) {
                console.log('Ошибка возобновления:', error);
            } finally {
                this.setLoadingState(false);
            }
        }
    }
    
    // Переключение музыки
    async toggleMusic() {
        if (!this.musicStarted) {
            await this.startMusic();
            return;
        }
        
        this.setLoadingState(true);
        
        if (this.isPlaying) {
            await this.fadeOut();
            this.isPlaying = false;
            this.toggleButton.classList.remove('playing');
        } else {
            try {
                await this.music.play();
                this.isPlaying = true;
                await this.fadeIn();
                this.toggleButton.classList.add('playing');
            } catch (error) {
                console.log('Ошибка возобновления:', error);
            }
        }
        
        this.setLoadingState(false);
        this.saveMusicState();
    }
    
    // Публичный метод для паузы музыки (для использования из video-controls)
    async pauseMusic() {
        if (this.musicStarted && this.isPlaying) {
            await this.fadeOut();
            this.isPlaying = false;
            this.toggleButton.classList.remove('playing');
            return true; // Музыка была остановлена
        }
        return false; // Музыка не играла
    }
    
    // Публичный метод для возобновления музыки
    async resumeMusic() {
        if (this.musicStarted && !this.isPlaying) {
            try {
                await this.music.play();
                this.isPlaying = true;
                await this.fadeIn();
                this.toggleButton.classList.add('playing');
                return true; // Музыка была возобновлена
            } catch (error) {
                console.log('Ошибка возобновления музыки:', error);
                return false;
            }
        }
        return false; // Музыка уже играет или не инициализирована
    }
    
    setLoadingState(loading) {
        if (loading) {
            this.toggleButton.classList.add('loading');
            this.toggleButton.style.pointerEvents = 'none';
        } else {
            this.toggleButton.classList.remove('loading');
            this.toggleButton.style.pointerEvents = 'auto';
        }
    }
    
    handleMusicError(e) {
        console.error('Ошибка загрузки музыки:', e);
        this.toggleButton.style.display = 'none';
        // Продолжаем загрузку страницы даже при ошибке музыки
        if (!this.userMadeChoice) {
            this.userMadeChoice = true;
            this.hidePromptAndStartPage();
        }
    }
    
    saveMusicState() {
        // Сохраняем только если пользователь явно включил музыку
        if (this.userMadeChoice) {
            localStorage.setItem('musicEnabled', this.isPlaying);
            localStorage.setItem('musicStarted', this.musicStarted);
            localStorage.setItem('userMadeChoice', this.userMadeChoice);
        }
    }
    
    loadMusicState() {
        // Этот метод больше не вызывается автоматически
        // Пользователь каждый раз делает выбор заново
    }
}

// Инициализируем музыкальный плеер СРАЗУ при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
});