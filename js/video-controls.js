// video-controls.js - исправленная версия с проверками безопасности
// Управление видео с контролем музыки
class VideoControls {
    constructor() {
        this.videoPlayButton = document.querySelector('.video-play-button');
        this.storyVideo = document.querySelector('.story-video');
        this.wasMusicPlaying = false;
        this.isVideoPlaying = false;
        this.isSeeking = false;
        
        this.init();
    }
    
    init() {
        // Проверяем существование элементов перед инициализацией
        if (!this.videoPlayButton || !this.storyVideo) {
            console.warn('❌ Элементы видео не найдены, VideoControls не инициализирован');
            return;
        }
        
        console.log('🎬 Инициализация управления видео...');
        
        this.videoPlayButton.addEventListener('click', () => this.toggleVideo());
        
        this.storyVideo.addEventListener('play', () => this.handleVideoPlay());
        this.storyVideo.addEventListener('pause', () => this.handleVideoPause());
        this.storyVideo.addEventListener('ended', () => this.handleVideoEnd());
        this.storyVideo.addEventListener('seeked', () => this.handleVideoSeeked());
        this.storyVideo.addEventListener('error', (e) => this.handleVideoError(e));
        
        // Автопауза при скрытии страницы
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Обработка ошибок загрузки видео
        this.storyVideo.addEventListener('loadstart', () => {
            console.log('📹 Начало загрузки видео');
        });
        
        this.storyVideo.addEventListener('canplay', () => {
            console.log('✅ Видео готово к воспроизведению');
        });
        
        console.log('🎬 Управление видео инициализировано');
    }
    
    async toggleVideo() {
        if (!this.storyVideo) return;
        
        if (this.storyVideo.paused) {
            await this.playVideo();
        } else {
            await this.pauseVideo();
        }
    }
    
    async playVideo() {
        if (!this.storyVideo) return;
        
        console.log('🎬 Запуск видео...');
        
        try {
            // Сохраняем состояние музыки перед воспроизведением видео
            if (window.musicPlayer && window.musicPlayer.isPlaying) {
                this.wasMusicPlaying = true;
                console.log('⏸️ Музыка играет, ставим на паузу');
                await window.musicPlayer.pauseMusic();
            } else {
                this.wasMusicPlaying = false;
                console.log('🔇 Музыка не играет, продолжаем без изменений');
            }
            
            // Воспроизводим видео
            await this.storyVideo.play();
            this.isVideoPlaying = true;
            
        } catch (error) {
            console.error('❌ Ошибка воспроизведения видео:', error);
            this.handleVideoError(error);
            
            // Если видео не запустилось, восстанавливаем музыку
            if (this.wasMusicPlaying) {
                await this.restoreMusic();
            }
        }
    }
    
    async pauseVideo() {
        if (!this.storyVideo) return;
        
        console.log('⏸️ Пауза видео');
        
        try {
            await this.storyVideo.pause();
            this.isVideoPlaying = false;
            await this.restoreMusic();
        } catch (error) {
            console.error('❌ Ошибка при паузе видео:', error);
        }
    }
    
    handleVideoPlay() {
        console.log('🎬 Видео началось');
        
        if (this.videoPlayButton) {
            this.videoPlayButton.style.display = 'none';
        }
        
        this.isVideoPlaying = true;
        
        // При возобновлении видео после паузы снова сохраняем состояние музыки
        if (window.musicPlayer && window.musicPlayer.isPlaying) {
            this.wasMusicPlaying = true;
            console.log('⏸️ Музыка играет при возобновлении видео, ставим на паузу');
            window.musicPlayer.pauseMusic();
        }
    }
    
    handleVideoPause() {
        console.log('⏸️ Видео на паузе');
        
        if (this.videoPlayButton) {
            this.videoPlayButton.style.display = 'flex';
        }
        
        this.isVideoPlaying = false;
        
        // Восстанавливаем музыку только если это не seek
        if (!this.isSeeking) {
            this.restoreMusic();
        }
    }
    
    handleVideoEnd() {
        console.log('🏁 Видео завершено');
        
        if (this.videoPlayButton) {
            this.videoPlayButton.style.display = 'flex';
        }
        
        this.isVideoPlaying = false;
        this.restoreMusic();
        
        // Автоматическое возвращение к началу
        setTimeout(() => {
            if (this.storyVideo) {
                this.storyVideo.currentTime = 0;
            }
        }, 1000);
    }
    
    handleVideoSeeked() {
        // Сбрасываем флаг seek после завершения перемотки
        setTimeout(() => {
            this.isSeeking = false;
        }, 100);
    }
    
    handleVideoError(error) {
        console.error('❌ Ошибка видео:', error);
        
        // Показываем кнопку воспроизведения при ошибке
        if (this.videoPlayButton) {
            this.videoPlayButton.style.display = 'flex';
        }
        
        // Восстанавливаем музыку при ошибке
        this.restoreMusic();
        
        // Можно показать сообщение об ошибке пользователю
        this.showVideoError();
    }
    
    showVideoError() {
        // Создаем сообщение об ошибке
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 14px;
            z-index: 10;
        `;
        errorMessage.textContent = 'Ошибка загрузки видео';
        
        const videoContainer = this.storyVideo?.parentElement;
        if (videoContainer) {
            videoContainer.appendChild(errorMessage);
            
            // Убираем сообщение через 3 секунды
            setTimeout(() => {
                if (errorMessage.parentElement) {
                    errorMessage.remove();
                }
            }, 3000);
        }
    }
    
    handleVisibilityChange() {
        if (document.hidden && this.isVideoPlaying) {
            console.log('📄 Страница скрыта, ставим видео на паузу');
            this.pauseVideo();
        }
    }
    
    async restoreMusic() {
        console.log('🔄 Восстановление музыки...');
        console.log('wasMusicPlaying:', this.wasMusicPlaying);
        console.log('musicPlayer available:', !!window.musicPlayer);
        
        if (window.musicPlayer) {
            console.log('musicPlayer state:', {
                isPlaying: window.musicPlayer.isPlaying,
                musicStarted: window.musicPlayer.musicStarted
            });
        }
        
        // Восстанавливаем музыку если она играла до видео и сейчас не играет
        if (this.wasMusicPlaying && 
            window.musicPlayer && 
            !window.musicPlayer.isPlaying &&
            window.musicPlayer.musicStarted) {
            
            console.log('🎵 Восстанавливаем музыку');
            const success = await window.musicPlayer.resumeMusic();
            
            if (success) {
                console.log('✅ Музыка успешно восстановлена');
                // НЕ сбрасываем флаг wasMusicPlaying здесь!
                // Он должен сохраняться для случая возобновления видео
            } else {
                console.log('❌ Не удалось восстановить музыку');
            }
        } else {
            console.log('♻️ Восстановление музыки не требуется:', {
                wasMusicPlaying: this.wasMusicPlaying,
                musicPlayerExists: !!window.musicPlayer,
                isPlaying: window.musicPlayer ? window.musicPlayer.isPlaying : 'N/A',
                musicStarted: window.musicPlayer ? window.musicPlayer.musicStarted : 'N/A'
            });
        }
    }
    
    // Публичные методы для внешнего управления
    play() {
        return this.playVideo();
    }
    
    pause() {
        return this.pauseVideo();
    }
    
    // Метод для безопасного уничтожения
    destroy() {
        if (this.storyVideo) {
            this.storyVideo.pause();
            this.storyVideo.currentTime = 0;
        }
        
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        console.log('🎬 VideoControls уничтожен');
    }
}

// Инициализация управления видео при загрузке DOM с обработкой ошибок
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.videoControls = new VideoControls();
    } catch (error) {
        console.error('❌ Ошибка инициализации VideoControls:', error);
        // Fallback: показываем стандартные элементы управления видео
        const storyVideo = document.querySelector('.story-video');
        if (storyVideo) {
            storyVideo.controls = true;
        }
    }
});

// Fallback для старых браузеров
if (!HTMLVideoElement.prototype.play) {
    console.warn('HTMLVideoElement.play не поддерживается');
}