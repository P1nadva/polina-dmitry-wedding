// animations.js - исправленная версия
class ScrollAnimations {
    constructor() {
        this.hero = document.querySelector('.hero');
        this.heroContent = document.querySelector('.hero-content');
        this.header = document.getElementById('mainHeader');
        this.headerLeft = document.getElementById('headerLeft');
        this.headerRight = document.getElementById('headerRight');
        this.heroTitle = document.querySelector('.hero-title');
        this.heroSubtitle = document.querySelector('.hero-subtitle');
        this.heroDate = document.querySelector('.hero-date');
        this.sections = document.querySelectorAll('section:not(.hero)');
        this.goldBeads = document.querySelectorAll('.gold-bead');
        
        this.animationCompleted = false;
        this.heroContentHidden = false;
        this.scrollThreshold = 150;
        this.parallaxSpeed = 0.5;
        this.fadeStartThreshold = 300;
        
        // Оптимизация производительности
        this.lastScrollY = 0;
        this.ticking = false;
        this.rafId = null;
        
        console.log('💫 Анимации с параллаксом и исчезновением инициализированы');
    }
    
    initPageLoadAnimations() {
        console.log('🎨 Запускаем плавные анимации с параллаксом...');
        
        // Проверяем существование элементов перед работой с ними
        if (!this.checkRequiredElements()) {
            console.error('❌ Не найдены необходимые элементы для анимаций');
            return;
        }
        
        // Подготавливаем секции для анимации
        this.sections.forEach(section => {
            if (section) {
                section.classList.add('section-animate');
            }
        });
        
        // Подготавливаем элементы героя для плавного исчезновения
        [this.heroTitle, this.heroSubtitle, this.heroDate].forEach(el => {
            if (el) {
                el.classList.add('hero-element-fading');
            }
        });
        
        // Подготавливаем hero-content для плавного исчезновения
        if (this.heroContent) {
            this.heroContent.classList.add('hero-content-fading');
        }
        
        // Инициализируем параллакс для бусин
        this.goldBeads.forEach(bead => {
            if (bead) {
                bead.classList.add('scroll-parallax');
            }
        });
        
        // Слушаем скролл с requestAnimationFrame для плавности
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        
        // Сразу проверяем видимость
        this.animateSections();
        
        console.log('✅ Анимации с параллаксом готовы');
    }
    
    // Проверка необходимых элементов
    checkRequiredElements() {
        const required = [
            this.hero, this.heroContent, this.header,
            this.heroTitle, this.heroSubtitle, this.heroDate
        ];
        
        return required.every(el => {
            if (!el) {
                console.warn('Элемент не найден:', el);
                return false;
            }
            return true;
        });
    }
    
    handleScroll() {
        this.lastScrollY = window.scrollY;
        
        if (!this.ticking) {
            this.rafId = requestAnimationFrame(() => {
                this.processScroll(this.lastScrollY);
                this.ticking = false;
            });
            this.ticking = true;
        }
    }
    
    processScroll(scrollY) {
        // Параллакс и плавное исчезновение контента героя
        this.applyHeroParallaxAndFade(scrollY);
        
        // Параллакс для бусин
        this.animateBeads(scrollY);
        
        // Анимация шапки при достижении порога
        if (scrollY > this.scrollThreshold && !this.animationCompleted) {
            this.startHeaderAnimation();
        }
        
        // Анимация секций (реже для производительности)
        if (scrollY % 30 === 0) { // Проверяем каждые 30px скролла
            this.animateSections();
        }
    }
    
    applyHeroParallaxAndFade(scrollY) {
        if (!this.heroContent || this.heroContentHidden) return;
        
        // Рассчитываем порог исчезновения относительно hero секции
        const heroRect = this.hero.getBoundingClientRect();
        const heroBottom = heroRect.bottom + scrollY;
        const fadeStart = heroBottom - window.innerHeight + this.fadeStartThreshold;
        
        // Параллакс - контент двигается вверх медленнее скролла
        const parallaxOffset = scrollY * this.parallaxSpeed;
        this.heroContent.style.transform = `translateY(${parallaxOffset}px)`;
        
        // Плавное исчезновение начинается после определенного порога
        if (scrollY > fadeStart) {
            // Вычисляем прозрачность от 1 до 0
            const fadeProgress = Math.min(1, (scrollY - fadeStart) / 200);
            const opacity = 1 - fadeProgress;
            
            this.heroContent.style.opacity = opacity.toString();
            
            // Если полностью исчез, помечаем как скрытый
            if (opacity <= 0.1 && !this.heroContentHidden) {
                this.heroContentHidden = true;
                this.heroContent.classList.add('hero-content-hidden');
                console.log('🎭 Hero-content плавно исчез');
            }
        } else {
            // Пока не достигли порога исчезновения - полная прозрачность
            this.heroContent.style.opacity = '1';
            this.heroContentHidden = false;
            this.heroContent.classList.remove('hero-content-hidden');
        }
    }
    
    startHeaderAnimation() {
        console.log('👑 Запускаем переход в шапку...');
        this.animationCompleted = true;

        // Показываем шапку
        if (this.header) {
            this.header.classList.add('visible');
            // Гарантируем, что шапка всегда видна после показа
            this.header.style.transform = 'translateY(0)';
            this.header.style.opacity = '1';
            this.header.style.pointerEvents = 'all';
        }

        // Плавно скрываем отдельные элементы героя
        [this.heroTitle, this.heroSubtitle, this.heroDate].forEach(el => {
            if (el) {
                el.classList.add('fading-to-header');
            }
        });

        // Ускоряем исчезновение hero-content если еще не исчез
        if (!this.heroContentHidden && this.heroContent) {
            this.heroContent.style.opacity = '0';
            this.heroContent.classList.add('hero-content-hidden');
            this.heroContentHidden = true;
        }

        // После скрытия элементов - показываем контент в шапке
        setTimeout(() => {
            if (this.headerLeft && this.heroTitle) {
                this.headerLeft.textContent = this.heroTitle.textContent;
                this.headerLeft.classList.add('visible');
            }
            
            if (this.headerRight && this.heroDate) {
                this.headerRight.textContent = this.heroDate.textContent;
                this.headerRight.classList.add('visible');
            }
            
            console.log('🎉 Переход в шапку завершен');
        }, 600);
    }
    
    animateBeads(scrollY) {
        if (this.animationCompleted) return;
        
        this.goldBeads.forEach((bead, index) => {
            if (!bead) return;
            
            const speed = (index % 3 + 1) * 0.1;
            const movement = scrollY * speed * 0.3;
            
            bead.style.transform = `translateY(${movement}px)`;
        });
    }
    
    animateSections() {
        const viewportHeight = window.innerHeight;
        
        this.sections.forEach((section, index) => {
            if (!section) return;
            
            const sectionTop = section.getBoundingClientRect().top;
            const sectionVisible = 100;
            
            if (sectionTop < viewportHeight - sectionVisible) {
                setTimeout(() => {
                    section.classList.add('section-visible');
                }, index * 200);
            }
        });
    }
    
    // Метод для очистки при уничтожении
    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        window.removeEventListener('scroll', this.handleScroll);
    }
}

// Инициализация с обработкой ошибок
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.scrollAnimations = new ScrollAnimations();
    } catch (error) {
        console.error('Ошибка инициализации анимаций:', error);
        // Fallback: показываем все элементы без анимаций
        document.body.classList.add('page-loaded');
        document.querySelectorAll('.section-animate').forEach(section => {
            section.classList.add('section-visible');
        });
    }
});