    (function () {
        const translations = {
            en: {
                intro: 'A system for all your needs. In development.',
                featuresTitle: 'Available now',
                mailTitle: 'Mail service',
                mailDescription: 'A secure mail service with limited data exposure and strong encryption. Built and refined on top of Mailu. To register, contact the administrator via Telegram.',
                cipherTitle: 'Cipher machine',
                cipherDescription: 'UltimateCrypt is an open self-hosted site for customizing and creating your own encryption pair. By default you can encrypt using stock, weather, and crypto exchange data.',
                devTitle: 'KYO Crypt 1.0',
                devDescription: 'Special encryption scheme: PBKDF2-SHA256 → AES-256-GCM. Provides strict data protection. The more iterations you use, the stronger the protection.',
                servicesButton: 'Services',
                modalTitle: 'YouNa Services',
                modalHelper: 'New services will appear here as they are developed.',
                openLabel: 'Open',
                services: {
                    mail: {
                        name: 'Mail service',
                        description: 'Secure mail service based on Mailu. To register, contact the administrator.'
                    },
                    cipher: {
                        name: 'Cipher machine',
                        description: 'UltimateCrypt is a self-hosted solution for custom encryption using real-time data.'
                    }
                }
            },
            ru: {
                intro: 'Система под все твои нужды. В разработке',
                featuresTitle: 'Доступно',
                mailTitle: 'Почтовый сервис',
                mailDescription: 'Защищенный почтовый сервис, с ограниченным пакетом данных, сильной шифровкой. Создан и доработан на основе Mailu. Для регистрации свяжитесь в Telegram с администратором',
                cipherTitle: 'Шифровая машина',
                cipherDescription: 'UltimateCrypt - открытый self-host сайт для кастомизации и создания собственной пары шифровки. В стандартном режиме доступна шифровка по данным биржи, погоды, криптобиржи.',
                devTitle: 'KYO Crypt 1.0',
                devDescription: 'Уникальная схема шифрования PBKDF2-SHA256 -> AES-256-GCM. Позволяет строго защищать данные. Чем больше итерации - тем больше защищены данные.',
                servicesButton: 'Сервисы',
                modalTitle: 'Сервисы YouNa',
                modalHelper: 'Новые сервисы будут появляться здесь по мере разработки.',
                openLabel: 'Открыть',
                services: {
                    mail: {
                        name: 'Почтовый сервис',
                        description: 'Защищенный почтовый сервис на базе Mailu. Для регистрации свяжитесь с администратором.'
                    },
                    cipher: {
                        name: 'Шифровая машина',
                        description: 'UltimateCrypt - self-host решение для кастомной шифровки с использованием реальных данных.'
                    }
                }
            }
        };

window.currentLang = 'en';
let currentLang = window.currentLang;


        const services = [
            {
                key: 'mail',
                url: 'https://mail.youna.uk',
                emoji: '📨'
            },
            {
                key: 'cipher',
                url: 'https://github.com/KZ-KyodaN/UltimateCrypt',
                emoji: '🧬'
            }
        ];

        const modalStyles = `
        .youna-modal-backdrop {
            position: fixed;
            inset: 0;
            background: radial-gradient(circle at 10% 0%, rgba(168, 85, 255, 0.35), transparent 55%),
                        radial-gradient(circle at 90% 100%, rgba(255, 58, 167, 0.30), transparent 55%),
                        rgba(3, 1, 10, 0.88);
            backdrop-filter: blur(18px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 50;
        }
        .youna-modal {
            width: min(520px, 92vw);
            max-height: 78vh;
            border-radius: 20px;
            padding: 1.5rem 1.6rem 1.4rem;
            background: linear-gradient(135deg, rgba(255, 58, 167, 0.08), rgba(168, 85, 255, 0.1));
            border: 1px solid rgba(255, 255, 255, 0.10);
            box-shadow: 0 26px 70px rgba(0, 0, 0, 0.65), var(--glow);
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .youna-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.2rem;
        }
        .youna-modal-title {
            margin: 0;
            font-size: 1.25rem;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #fff;
            text-shadow: 0 0 14px rgba(168, 85, 255, 0.7);
        }
        .youna-modal-close {
            border: 1px solid rgba(255, 255, 255, 0.18);
            background: rgba(10, 4, 18, 0.85);
            color: var(--muted);
            border-radius: 999px;
            width: 2.1rem;
            height: 2.1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.1rem;
            line-height: 1;
            padding: 0;
            transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease;
        }
        .youna-modal-close:hover {
            transform: translateY(-1px);
            background: rgba(15, 7, 26, 0.95);
            box-shadow: 0 0 18px rgba(255, 255, 255, 0.18);
        }
        .youna-modal-body {
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            padding-right: 0.1rem;
        }
        .youna-service-card {
            display: flex;
            align-items: flex-start;
            gap: 0.9rem;
            padding: 0.9rem 1rem;
            background: linear-gradient(135deg, rgba(255, 58, 167, 0.08), rgba(168, 85, 255, 0.1));
            border: 1px solid rgba(255, 255, 255, 0.06);
            box-shadow: var(--glow);
        }
        .youna-service-avatar {
            flex-shrink: 0;
            width: 42px;
            height: 42px;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            background: radial-gradient(circle at 20% 0%, rgba(255, 58, 167, 0.9), rgba(168, 85, 255, 0.9));
            box-shadow: 0 0 22px rgba(255, 58, 167, 0.7), 0 0 32px rgba(168, 85, 255, 0.6);
        }
        .youna-service-content {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
        }
        .youna-service-title {
            margin: 0;
            font-weight: 600;
            color: #fff;
        }
        .youna-service-description {
            margin: 0;
            font-size: 0.95rem;
            color: var(--muted);
        }
        .youna-service-actions {
            margin-top: 0.25rem;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        .youna-service-open {
            padding: 0.5rem 0.95rem;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            background: linear-gradient(135deg, #ff3aa7, #a855ff);
            color: #0a0412;
            font-weight: 600;
            font-size: 0.92rem;
            cursor: pointer;
            letter-spacing: 0.01em;
            box-shadow: var(--glow);
            transition: transform 140ms ease, box-shadow 140ms ease, filter 140ms ease;
        }
        .youna-service-open:hover {
            transform: translateY(-1px) scale(1.01);
            box-shadow: 0 0 24px rgba(255, 58, 167, 0.9), 0 0 40px rgba(168, 85, 255, 0.75);
            filter: brightness(1.05);
        }
        .youna-modal-helper {
            font-size: 0.82rem;
            color: var(--muted);
            opacity: 0.85;
            margin-top: 0.1rem;
        }
        @media (max-width: 480px) {
            .youna-service-card {
                align-items: stretch;
            }
            .youna-service-avatar {
                width: 38px;
                height: 38px;
                font-size: 1.1rem;
            }
        }`;

        const langToggleStyles = `
        .youna-lang-toggle {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            background: radial-gradient(circle at 0% 0%, rgba(255, 58, 167, 0.35), transparent 55%),
                        radial-gradient(circle at 100% 100%, rgba(168, 85, 255, 0.3), transparent 55%),
                        rgba(5, 1, 15, 0.9);
            box-shadow: var(--glow);
            cursor: pointer;
            user-select: none;
            font-size: 0.78rem;
        }
        .youna-lang-label {
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }
        .youna-lang-toggle-track {
            position: relative;
            width: 56px;
            height: 24px;
            border-radius: 999px;
            background: linear-gradient(135deg, rgba(255, 58, 167, 0.6), rgba(168, 85, 255, 0.6));
            display: flex;
            align-items: center;
            padding: 2px;
        }
        .youna-lang-toggle-knob {
            position: absolute;
            width: 20px;
            height: 20px;
            border-radius: 999px;
            background: #0a0412;
            box-shadow: 0 0 10px rgba(0,0,0,0.65), 0 0 18px rgba(255,255,255,0.35);
            transform: translateX(0);
            transition: transform 160ms ease;
        }
        .youna-lang-toggle[data-lang="ru"] .youna-lang-toggle-knob {
            transform: translateX(32px);
        }
        .youna-lang-toggle[data-lang="en"] .youna-lang-label-en,
        .youna-lang-toggle[data-lang="ru"] .youna-lang-label-ru {
            color: #fff;
        }
        @media (max-width: 640px) {
            .youna-lang-toggle {
                margin-top: 0.75rem;
            }
        }`;

        function ensureModalStyles() {
            if (document.getElementById('youna-modal-styles')) return;
            const styleTag = document.createElement('style');
            styleTag.id = 'youna-modal-styles';
            styleTag.textContent = modalStyles + langToggleStyles;
            document.head.appendChild(styleTag);
        }

        function updateLangToggleState(container) {
            const toggle = container || document.querySelector('.youna-lang-toggle');
            if (!toggle) return;
            toggle.setAttribute('data-lang', currentLang);
            toggle.setAttribute('aria-checked', currentLang === 'en' ? 'true' : 'false');
        }

        function createLangToggle() {
            const header = document.querySelector('header');
            if (!header || document.querySelector('.youna-lang-toggle')) return;

            const toggle = document.createElement('div');
            toggle.className = 'youna-lang-toggle';
            toggle.setAttribute('role', 'switch');
            toggle.setAttribute('aria-label', 'Language');

            toggle.innerHTML = `
                <span class="youna-lang-label youna-lang-label-en">EN</span>
                <div class="youna-lang-toggle-track">
                    <div class="youna-lang-toggle-knob"></div>
                </div>
                <span class="youna-lang-label youna-lang-label-ru">RU</span>
            `;

toggle.addEventListener('click', function () {
    currentLang = currentLang === 'en' ? 'ru' : 'en';
    window.currentLang = currentLang;
    updateLanguage();
});


            header.appendChild(toggle);
            updateLangToggleState(toggle);
        }

        function closeModal() {
            const backdrop = document.querySelector('.youna-modal-backdrop');
            if (backdrop) backdrop.remove();
            document.removeEventListener('keydown', handleEsc);
        }

        function handleEsc(e) {
            if (e.key === 'Escape') closeModal();
        }

        function openModal() {
            ensureModalStyles();

            const existing = document.querySelector('.youna-modal-backdrop');
            if (existing) existing.remove();

            const backdrop = document.createElement('div');
            backdrop.className = 'youna-modal-backdrop';

            const modal = document.createElement('div');
            modal.className = 'youna-modal';

            const header = document.createElement('div');
            header.className = 'youna-modal-header';

            const title = document.createElement('h3');
            title.className = 'youna-modal-title';
            title.textContent = translations[currentLang].modalTitle;

            const closeBtn = document.createElement('button');
            closeBtn.className = 'youna-modal-close';
            closeBtn.type = 'button';
            closeBtn.setAttribute('aria-label', 'Close');
            closeBtn.textContent = '×';
            closeBtn.addEventListener('click', closeModal);

            header.appendChild(title);
            header.appendChild(closeBtn);

            const body = document.createElement('div');
            body.className = 'youna-modal-body';

            services.forEach(service => {
                const tService = translations[currentLang].services[service.key];

                const card = document.createElement('div');
                card.className = 'youna-service-card';

                const avatar = document.createElement('div');
                avatar.className = 'youna-service-avatar';
                avatar.textContent = service.emoji || (tService ? tService.name.charAt(0) : '');

                const content = document.createElement('div');
                content.className = 'youna-service-content';

                const serviceTitle = document.createElement('h4');
                serviceTitle.className = 'youna-service-title';
                serviceTitle.textContent = tService ? tService.name : '';

                const desc = document.createElement('p');
                desc.className = 'youna-service-description';
                desc.textContent = tService ? tService.description : '';

                const actions = document.createElement('div');
                actions.className = 'youna-service-actions';

                const openBtn = document.createElement('button');
                openBtn.className = 'youna-service-open';
                openBtn.type = 'button';
                openBtn.textContent = translations[currentLang].openLabel;
                openBtn.addEventListener('click', () => {
                    window.open(service.url, '_blank', 'noopener');
                });

                actions.appendChild(openBtn);
                content.appendChild(serviceTitle);
                content.appendChild(desc);
                content.appendChild(actions);

                card.appendChild(avatar);
                card.appendChild(content);
                body.appendChild(card);
            });

            const helper = document.createElement('div');
            helper.className = 'youna-modal-helper';
            helper.textContent = translations[currentLang].modalHelper;

            modal.appendChild(header);
            modal.appendChild(body);
            modal.appendChild(helper);

            backdrop.appendChild(modal);
            document.body.appendChild(backdrop);

            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) closeModal();
            });

            document.addEventListener('keydown', handleEsc);
        }

        function updateLanguage() {
            const t = translations[currentLang];

            const introP = document.querySelector('#intro p');
            if (introP) introP.textContent = t.intro;

            const featuresTitle = document.querySelector('#features h2');
            if (featuresTitle) featuresTitle.textContent = t.featuresTitle;

            const cards = document.querySelectorAll('#features .card');
            if (cards[0]) {
                const strong = cards[0].querySelector('strong');
                const span = cards[0].querySelector('span');
                if (strong) strong.textContent = t.mailTitle;
                if (span) span.textContent = t.mailDescription;
            }
            if (cards[1]) {
                const strong = cards[1].querySelector('strong');
                const span = cards[1].querySelector('span');
                if (strong) strong.textContent = t.cipherTitle;
                if (span) span.textContent = t.cipherDescription;
            }
            if (cards[2]) {
                const strong = cards[2].querySelector('strong');
                const span = cards[2].querySelector('span');
                if (strong) strong.textContent = t.devTitle;
                if (span) span.textContent = t.devDescription;
            }

            const actionBtn = document.getElementById('actionBtn');
            if (actionBtn) actionBtn.textContent = t.servicesButton;

            const modalTitleEl = document.querySelector('.youna-modal-title');
            if (modalTitleEl) modalTitleEl.textContent = t.modalTitle;

            const helperEl = document.querySelector('.youna-modal-helper');
            if (helperEl) helperEl.textContent = t.modalHelper;

            const modalServiceCards = document.querySelectorAll('.youna-service-card');
            modalServiceCards.forEach((card, index) => {
                const service = services[index];
                if (!service) return;
                const tService = t.services[service.key];
                const titleEl = card.querySelector('.youna-service-title');
                const descEl = card.querySelector('.youna-service-description');
                const btnEl = card.querySelector('.youna-service-open');

                if (tService && titleEl) titleEl.textContent = tService.name;
                if (tService && descEl) descEl.textContent = tService.description;
                if (btnEl) btnEl.textContent = t.openLabel;
            });

            updateLangToggleState();
          
        }

        ensureModalStyles();
        createLangToggle();
        updateLanguage();

        const actionBtn = document.getElementById('actionBtn');
        if (actionBtn) {
            actionBtn.addEventListener('click', openModal);
        }
        document.getElementById('osuBtn').addEventListener('click', function (e) {
    e.preventDefault(); 
    console.log("osu! launched");
    runOsuScript(); 
});
(function () {
  const rtBtn = document.getElementById("rtBtn");
  const rtBackdrop = document.getElementById("rt-modal-backdrop");
  const rtClose = document.getElementById("rt-close");
  const rtBox = document.getElementById("rt-box");
  const rtText = document.getElementById("rt-text");
  const rtResult = document.getElementById("rt-result");

  if (!rtBtn || !rtBackdrop || !rtClose || !rtBox || !rtText || !rtResult) return;

  let waiting = false;
  let canClick = false;
  let startTime = 0;
  let timeoutId = null;
  let best = null;

  function resetBox() {
    waiting = false;
    canClick = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    rtBox.style.background = "#2a2a2a";
    rtBox.textContent = "CLICK TO START";
    rtText.textContent = "Click the box to start. Wait for green, then click as fast as you can.";
  }

  function startWaiting() {
    waiting = true;
    canClick = false;
    rtText.textContent = "Wait for green...";
    rtBox.style.background = "#444";
    rtBox.textContent = "WAIT...";
    const delay = 800 + Math.random() * 2500;

    timeoutId = setTimeout(() => {
      rtBox.style.background = "#00c853";
      rtBox.textContent = "CLICK!";
      startTime = performance.now();
      canClick = true;
      waiting = false;
      timeoutId = null;
    }, delay);
  }

  rtBox.addEventListener("click", () => {
    // старт теста
    if (!waiting && !canClick) {
      resetBox();
      startWaiting();
      return;
    }

    // клик слишком рано
    if (waiting && !canClick) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      waiting = false;
      rtBox.style.background = "#c62828";
      rtBox.textContent = "TOO EARLY";
      rtText.textContent = "Too early. Click again to restart.";
      return;
    }

    // нормальный результат
    if (canClick) {
      const rt = Math.floor(performance.now() - startTime);
      canClick = false;
      rtBox.style.background = "#263238";
      rtBox.textContent = rt + " ms";
      rtText.textContent = "Your reaction: " + rt + " ms (click to try again)";

      if (best === null || rt < best) {
        best = rt;
      }

      rtResult.textContent = "Best: " + best + " ms";
    }
  });

  function openRtModal() {
    resetBox();
    rtBackdrop.style.display = "flex";
  }

  function closeRtModal() {
    rtBackdrop.style.display = "none";
    resetBox();
  }

  rtBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openRtModal();
  });

  rtClose.addEventListener("click", () => {
    closeRtModal();
  });

  rtBackdrop.addEventListener("click", (e) => {
    if (e.target === rtBackdrop) {
      closeRtModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && rtBackdrop.style.display === "flex") {
      closeRtModal();
    }
  });
})();
(function () {
  const cpsBtn = document.getElementById("cpsBtn");
  const cpsBackdrop = document.getElementById("cps-modal-backdrop");
  const cpsClose = document.getElementById("cps-close");
  const cpsBox = document.getElementById("cps-box");
  const cpsText = document.getElementById("cps-text");
  const cpsResult = document.getElementById("cps-result");

  if (!cpsBtn || !cpsBackdrop || !cpsClose || !cpsBox || !cpsText || !cpsResult) return;

  const TEST_DURATION = 5000; 
  let isRunning = false;
  let clickCount = 0;
  let startTime = 0;
  let timerId = null;
  let bestCps = null;

  function resetCpsBox() {
    isRunning = false;
    clickCount = 0;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    cpsBox.style.background = "#2a2a2a";
    cpsBox.textContent = "CLICK TO START";
    cpsText.textContent = "Click inside the box as fast as you can for 5 seconds.";
    cpsResult.textContent = "Clicks: 0 | CPS: 0 | Best: " + (bestCps === null ? "- CPS" : bestCps + " CPS");
  }

  function finishTest() {
    isRunning = false;
    timerId = null;

    const elapsed = (performance.now() - startTime) / 1000;
    const cps = elapsed > 0 ? clickCount / elapsed : 0;
    const cpsRounded = Math.round(cps * 100) / 100;

    if (bestCps === null || cpsRounded > bestCps) {
      bestCps = cpsRounded;
    }

    cpsBox.style.background = "#263238";
    cpsBox.textContent = cpsRounded + " CPS";
    cpsText.textContent = "Time's up! Click again to retry.";
    cpsResult.textContent = "Clicks: " + clickCount + " | CPS: " + cpsRounded + " | Best: " + bestCps + " CPS";
  }

  cpsBox.addEventListener("click", () => {
    // старт нового теста
    if (!isRunning && clickCount === 0) {
      isRunning = true;
      clickCount = 1;
      startTime = performance.now();
      cpsBox.style.background = "#00c853";
      cpsBox.textContent = "CLICK!";

      cpsText.textContent = "Keep clicking! Test ends in 5 seconds.";
      cpsResult.textContent = "Clicks: " + clickCount + " | CPS: 0 | Best: " + (bestCps === null ? "- CPS" : bestCps + " CPS");

      timerId = setTimeout(finishTest, TEST_DURATION);
      return;
    }

    // клик во время теста
    if (isRunning) {
      clickCount++;
      const elapsed = (performance.now() - startTime) / 1000;
      const cps = elapsed > 0 ? clickCount / elapsed : 0;
      const cpsRounded = Math.round(cps * 100) / 100;

      cpsResult.textContent = "Clicks: " + clickCount + " | CPS: " + cpsRounded + " | Best: " + (bestCps === null ? "— CPS" : bestCps + " CPS");
    }

    if (!isRunning && clickCount > 0) {
      // сброс и новый старт
      clickCount = 0;
      resetCpsBox();
    }
  });

  function openCpsModal() {
    resetCpsBox();
    cpsBackdrop.style.display = "flex";
  }

  function closeCpsModal() {
    cpsBackdrop.style.display = "none";
    resetCpsBox();
  }

  cpsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openCpsModal();
  });

  cpsClose.addEventListener("click", () => {
    closeCpsModal();
  });

  cpsBackdrop.addEventListener("click", (e) => {
    if (e.target === cpsBackdrop) {
      closeCpsModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cpsBackdrop.style.display === "flex") {
      closeCpsModal();
    }
  });
})();

    })();