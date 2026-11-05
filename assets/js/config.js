/* ============================================================================
 *  ЕДИНСТВЕННЫЙ ФАЙЛ, КОТОРЫЙ НУЖНО РЕДАКТИРОВАТЬ
 * ----------------------------------------------------------------------------
 *  Меняй текст между кавычками — сайт перестроится сам.
 *  Добавить ссылку — скопируй строку с { } и поменяй значения.
 *  Убрать что-то — удали строку целиком или поставь enabled: false.
 *
 *  ДВА ЯЗЫКА. Где текст на русском и английском разный, он записан парой:
 *      { ru: 'Телеграм профиль', en: 'Telegram profile' }
 *  Где одинаковый (Telegram, GitHub, ник) — просто строкой.
 *  Добавляешь новую строку — пиши сразу оба варианта. Забудешь английский —
 *  на английской странице будет русский, а сборка напишет, где именно.
 * ==========================================================================*/

window.SITE_CONFIG = {

  /* --- Страница ----------------------------------------------------------- */
  /* ВАЖНО: после правок этого блока, имени, описания или ссылок запусти
     сборку — tools\build.ps1. Иначе превью в мессенджерах и поисковики
     увидят старые данные: они читают готовый HTML, а не этот файл.         */
  meta: {
    /* Заголовок вкладки и превью. Имя и ник вместе — чтобы находили по обоим. */
    title: { ru: 'Кирилл Булдаков · Багет',
             en: 'Kirill Buldakov · Baget' },
    /* Описание для поиска и превью ссылки — на самой странице его не видно.
       Длиннее строчки под именем: поисковик показывает до ~160 знаков.    */
    description: {
      ru: 'Кирилл Булдаков, он же Багет — сборка ПК, сайты, нейросети, ' +
          'фото и видео. Telegram, ВК, Авито, проекты и каналы.',
      en: 'Kirill Buldakov, aka Baget — PC builds, websites, AI, ' +
          'photo and video. Telegram, VK, Avito, projects and channels.',
    },
    /* Картинку превью рисует сборка. Для английской версии она же рисует
       рядом og-en.jpg — с именем латиницей.                               */
    image: 'assets/img/og.jpg',
    /* Иконку вкладки рисует сборка: первая буква имени в фирменном градиенте.
       Если хочется эмодзи вместо неё — впиши сюда, например favicon: '🌤'. */
    favicon: '',
    /* 'auto'  — как настроено у гостя в браузере/системе (рекомендую)
       'light' — всегда тёплый светлый
       'dark'  — всегда тёплый тёмный
       Ручное переключение кнопкой в любом случае запоминается.          */
    theme: 'auto',
    /* Адрес сайта после публикации, например 'https://bgt29.github.io'.
       Пока пусто, превью ссылки в мессенджерах не заработает.
       Свой домен Кирилл купил 25.10.2026; он же записан в файле CNAME
       в корне сайта — по нему GitHub Pages узнаёт адрес.                 */
    url: 'https://kirillbuldakov.ru',
  },

  /* --- Английская версия -------------------------------------------------- */
  /* Отдельная страница по адресу /en/, её делает сборка из этого же файла.
     Кнопка EN / RU стоит рядом с кнопкой оформления. Отдельный адрес, а не
     переключение на месте, — чтобы поисковики видели обе версии: по-русски
     тебя найдут как «Кирилл Булдаков», по-английски — как «Kirill Buldakov».
     enabled: false — сайт только на русском, кнопка пропадёт.             */
  english: {
    enabled: true,
  },

  /* --- Шапка -------------------------------------------------------------- */
  hero: {
    /* Положи файл в assets/img/ и укажи путь. Меняешь фото — просто заменяешь
       файл тем же именем. Если файла нет, покажется буква вместо него.        */
    avatar: 'assets/img/avatar.jpg',
    /* Имя на каждом языке стоит на своей странице. В разметку для поиска и в
       справку для нейросетей попадают оба написания, ник и его формы — так
       поисковик понимает, что это один человек. Повторять имя много раз или
       прятать текст нельзя: поисковики считают это спамом.                */
    name: { ru: 'Кирилл Булдаков', en: 'Kirill Buldakov' },
    /* Отчество — на странице не видно: уходит в разметку для поиска,
       в справку для нейросетей и в политику конфиденциальности.          */
    patronymic: { ru: 'Сергеевич', en: 'Sergeevich' },
    /* Ник — плашка под именем: на русской версии Багет, на английской Baget
       (решил Кирилл 22.10.2026). Для поиска сборка берёт оба написания.
       Без @: на каждой площадке он в своей форме, общий корень один.     */
    nick: { ru: 'Багет', en: 'Baget' },
    /* Формы ника на площадках — их тоже ищут */
    aliases: ['Baget_PC', 'bgt29', 'kbaget29', 'bagetpc'],
    role: '',                    // строка под именем. Пусто — скрыта
    /* Строчка под именем. \n — перенос: сверху занятия, снизу о чём сайт */
    bio: {
      ru: 'Сборка ПК · Сайты · Нейросети · Фото и видео\nВсе мои ссылки: проекты, соцсети и каналы.',
      en: 'PC builds · Websites · AI · Photo & video\nAll my links: projects, socials and channels.',
    },
    status: '',                  // плашка над именем. Пусто — скрыта
  },

  /* --- Проекты: раздел над профилями -------------------------------------- */
  /* Каждый проект — крупная карточка с кнопкой. Новый — скопируй строку.
     logo: 'ebk' — фирменный знак EBK KVN: собран из трафаретов
     (assets/img/ebk), сам перекрашивается под тему, жёлтый курсор мигает.
     Без logo карточка возьмёт обычный значок icon (как у ссылок ниже).
     enabled: false — убрать раздел целиком.                                */
  projects: {
    enabled: true,
    title: { ru: 'Проекты', en: 'Projects' },
    items: [
      { logo: 'ebk',
        title: { ru: 'VPN-бот в Telegram', en: 'VPN bot on Telegram' },
        handle: '@EBK_KVN_BOT',
        cta: { ru: 'Открыть', en: 'Open' },
        url: 'https://t.me/EBK_KVN_BOT' },
    ],
  },

  /* --- Ссылки. Главный блок ----------------------------------------------- */
  /* icon: telegram, vk, itd, instagram, threads, youtube, github, gitlab,
     boosty, avito, x, linkedin, discord, tiktok, twitch, whatsapp, spotify,
     behance, dribbble, habr, email, link. Неизвестное имя — значок ссылки. */
  links: [
    /* Строка вида { group: 'Название' } — это заголовок раздела, а не ссылка.
       Уберёшь обе такие строки — список снова станет сплошным.
       featured: true — большая цветная плитка вверху, рядом с именем.      */
    { group: { ru: 'Профили', en: 'Profiles' } },

    /* handle — подпись под названием: настоящий ник, а не «ВК профиль»
       (решил Кирилл 25.10.2026 — так меньше похоже на шаблон) */
    { icon: 'telegram',  label: 'Telegram', featured: true,
      handle: '@Baget_PC',
      url: 'https://t.me/Baget_PC' },
    { icon: 'instagram', label: 'Instagram',
      handle: '@kbaget29',
      url: 'https://instagram.com/kbaget29' },
    { icon: 'vk',        label: 'VK',
      handle: '@baget_pc',
      url: 'https://vk.com/Baget_PC' },
    /* На английской версии — латиницей: ITD (решил Кирилл). Значок — родной логотип */
    { icon: 'itd',       label: { ru: 'ИТД', en: 'ITD' },
      handle: '@baget',
      url: 'https://итд.com/@baget' },

    /* ▼ АВИТО МЕНЯЕТ ССЫЛКУ НА ПРОФИЛЬ — правь её ТОЛЬКО ЗДЕСЬ.
       Карточка ниже ведёт не напрямую на Авито, а на свою страницу /avito,
       которая берёт адрес отсюда и перебрасывает дальше. Поэтому ссылку
       вида «мойсайт/avito» можно раздавать где угодно — она не сломается,
       даже когда Авито в очередной раз поменяет адрес профиля.             */
    /* Авто-отслеживание невозможно: у Авито адрес профиля отдаёт только API,
       а оно доступно лишь на платных тарифах. Поэтому — руками: Авито →
       профиль → «Поделиться», вставить сюда. Дата — когда ссылку проверяли
       последний раз. Прошлая (август) умерла к 20.10.2026.                  */
    { icon: 'avito',     label: 'Avito',
      handle: { ru: 'мои объявления', en: 'my listings' },
      url: '/avito',
      redirectTo: 'https://www.avito.ru/user/3deda8ba570de4f43f16c4784a6716bb/profile' }, // проверено 20.10.2026

    { icon: 'github',    label: 'GitHub',
      handle: 'bgt29',
      url: 'https://github.com/bgt29' },

    { icon: 'email',     label: { ru: 'Почта', en: 'Email' },
      handle: 'uspeshniyparen@gmail.com',
      url: 'mailto:uspeshniyparen@gmail.com' },

    /* Все каналы на русском — англоязычному гостю это сказано в заголовке,
       а не под каждой ссылкой: на телефоне приписка обрезалась бы */
    { group: { ru: 'Каналы', en: 'Channels · in Russian' } },

    /* YouTube — ПЕРВЫМ в каналах, над Boosty (так решил Кирилл 20.10.2026).
       Адрес дал Кирилл 25.10.2026, канал «Кирюха Багет». */
    { icon: 'youtube',  label: 'YouTube',
      // Ник кириллицей и на английской версии — такой он у канала (пара — чтобы сборка не ругалась)
      handle: { ru: '@багет29', en: '@багет29' },
      url: 'https://www.youtube.com/@багет29' },

    { icon: 'boosty',   label: 'Boosty',
      handle: 'bagetpc',
      url: 'https://boosty.to/bagetpc' },

    { icon: 'telegram', label: { ru: 'Про ПК', en: 'About PCs' },
      handle: '@ShizaBageta',
      url: 'https://t.me/ShizaBageta' },

    { icon: 'telegram', label: { ru: 'Барахолка', en: 'Flea market' },
      handle: '@DlyaProdazhi',
      url: 'https://t.me/DlyaProdazhi' },   // ссылку дал Кирилл 24.10.2026
  ],

  /* --- Портфолио: страница /portfolio/ ------------------------------------ */
  /* Переключатель «Ссылки | Портфолио» под описанием появится сам, как только
     здесь будет хоть одна работа. Пока работ нет — страниц тоже нет.

     Как устроено (решил Кирилл 23.10.2026):
       /portfolio/            — по ряду-карусели на каждый раздел;
       /portfolio/pc/         — страница раздела со всеми его работами;
       /portfolio/pc/имя/     — страница работы: фото листаются, ниже текст.
     Все эти страницы делает сборка. Раздел без работ не показывается.

     Как добавить работу:
       1. Создай папку portfolio-src\имя-работы (латиница, цифры и дефис,
          например gaming-pc-4070) и положи туда фото в JPG или PNG.
          Порядок — по имени файла: 1.jpg, 2.jpg… Первое фото — обложка.
       2. Допиши работу в items ниже: id — то же имя, что у папки.
       3. Запусти сборку. Она ужмёт фото, повернёт их как надо и сотрёт
          служебные данные телефона — модель, дату и место съёмки.
     Оригиналы из portfolio-src на сайт не выкладываются.                  */
  portfolio: {
    enabled: true,
    /* true — вкладка и все ряды видны, даже пока работ нет: в пустом ряду
       карточка «Скоро здесь появятся работы». Включено 23.10.2026, пока сайт
       не опубликован. Перед публикацией — false, если работ так и не будет:
       сборка напомнит. Страница без работ закрыта от поиска.              */
    showEmpty: false,   // выключено перед публикацией 25.10.2026: у всех разделов есть работы или предложение
    title: { ru: 'Портфолио', en: 'Portfolio' },
    /* Описание страницы для поиска и превью ссылки */
    description: {
      ru: 'Работы Кирилла Булдакова: сборки ПК, фото, сайты и внедрение ИИ.',
      en: 'Work by Kirill Buldakov: PC builds, photography, websites and AI integration.',
    },
    /* Разделы — по ряду-карусели на каждый, в этом порядке. Новый раздел —
       скопируй строку. id — латиницей: он же часть адреса (/portfolio/pc/).
       description — необязательно: текст для поиска на странице раздела.
       more — необязательно: куда звать из раздела, одна ссылка или список.
       С offer: true это предложение услуги — плашкой над кейсами (первым
       делом); без него — канал, карточкой последней в ряду и на странице
       раздела. На странице работы — все плашками после описания. Раздел без
       работ с more тоже виден: вместо «Скоро здесь…» в нём эти плашки.
       icon — значок соцсети, как у ссылок; title — главная строка, sub —
       мелкая под ней (необязательно).
       org — необязательно: где сделаны работы раздела. text — строка под
       заголовком ряда и в шапке раздела; work — строка на странице работы,
       только у работ с team: true (заказы компании; у своих проектов её
       нет). С url — ссылкой.                                                */
    categories: [
      { id: 'pc',    name: { ru: 'Собранные ПК', en: 'PC builds' },
        // Сначала предложение услуг (просьба Кирилла 25.10.2026), потом
        // канал «Про ПК» (24.10). Услуги — как в закрепе его канала
        more: [
          { icon: 'telegram', url: 'https://t.me/Baget_PC', offer: true,
            title: { ru: 'Могу собрать ПК под ваши задачи', en: 'I can build a PC for your needs' },
            sub: { ru: 'Сборка, апгрейд и обслуживание — напишите мне в Telegram',
                   en: 'Builds, upgrades and servicing — message me on Telegram' } },
          { icon: 'telegram', url: 'https://t.me/ShizaBageta',
            title: { ru: 'Больше сборок — в моём Telegram-канале «Про ПК»',
                     en: 'More builds on my Telegram channel' },
            sub: { ru: 'Сборки на заказ и под продажу, обслуживание видеокарт',
                   en: 'Custom and ready-made PCs, GPU servicing · in Russian' } },
        ] },
      { id: 'photo', name: { ru: 'Фото',         en: 'Photo' },
        // Сначала предложение фотосессии (просьба Кирилла 25.10.2026), потом
        // Instagram (24.10). more может быть и одной ссылкой, и списком
        more: [
          { icon: 'telegram', url: 'https://t.me/Baget_PC', offer: true,
            title: { ru: 'Могу устроить фотосессию', en: 'I can do a photoshoot for you' },
            sub: { ru: 'Напишите мне в Telegram — обсудим идею и место',
                   en: 'Message me on Telegram to discuss the idea and location' } },
          { icon: 'instagram', url: 'https://instagram.com/kbaget29',
            title: { ru: 'Больше фото — в моём Instagram', en: 'More photos on my Instagram' },
            sub: '@kbaget29' },
        ] },
      /* Видео — рилсы для «Онлайн-Сервис», съёмка и монтаж (раздел попросил
         Кирилл 25.10.2026, под «Фото»). Работы появятся, когда пришлёт ролики. */
      { id: 'video', name: { ru: 'Видео',        en: 'Video' },
        org: { text: { ru: 'Снимаю сам и для «Онлайн-Сервис»',
                       en: 'Filmed on my own and for Online-Service' },
               work: { ru: 'Снято для «Онлайн-Сервис»',
                       en: 'Filmed for Online-Service' },
               url: 'https://www.on-lineservice.ru/' },
        more: [
          { icon: 'telegram', url: 'https://t.me/Baget_PC', offer: true,
            title: { ru: 'Могу снять и смонтировать видео', en: 'I can film and edit a video for you' },
            sub: { ru: 'Рилсы и ролики — напишите мне в Telegram',
                   en: 'Reels and short videos — message me on Telegram' } },
          /* Соцсети компании ведёт Кирилл (его просьба 25.10.2026). Вместо
             одного url — links: карточка с круглыми значками, каждый ведёт
             в свою соцсеть. Пустой url — значка нет. Адреса дал Кирилл. */
          { icon: 'megaphone',
            title: { ru: 'Веду соцсети «Онлайн-Сервис»', en: 'I run Online-Service’s social media' },
            sub: { ru: 'Рилсы и посты для компании', en: 'Reels and posts for the company · in Russian' },
            links: [
              { icon: 'vk',        label: { ru: 'ВКонтакте', en: 'VK' },  url: 'https://vk.com/onlinewebservice' },
              { icon: 'youtube',   label: 'YouTube',   url: 'https://www.youtube.com/@On-lineService' },
              { icon: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/onlineservice99/' },
              { icon: 'telegram',  label: 'Telegram',  url: 'https://t.me/onlinesdigital' },
            ] },
          { icon: 'youtube', url: 'https://www.youtube.com/@багет29',
            title: { ru: 'Мой YouTube-канал', en: 'My YouTube channel' },
            sub: { ru: 'Кирюха Багет', en: 'Kiryukha Baget · in Russian' } },
        ] },
      /* Сайты и ИИ — свои проекты и заказы компании, где работает Кирилл
         (у заказов компании ставь team: true); звать в его Telegram.
         Тексты — его выбор 25.10.2026 */
      { id: 'sites', name: { ru: 'Сайты',        en: 'Websites' },
        org: { text: { ru: 'Делаю сам и в команде «Онлайн-Сервис»',
                       en: 'Built on my own and with the Online-Service team' },
               work: { ru: 'Сделано в команде «Онлайн-Сервис»',
                       en: 'Made with the Online-Service team' },
               url: 'https://www.on-lineservice.ru/' },
        more: [
          /* «разработать или доработать» — он ведёт и дорабатывает сайты
             компании (25.10.2026) */
          { icon: 'telegram', url: 'https://t.me/Baget_PC', offer: true,
            title: { ru: 'Могу разработать или доработать сайт',
                     en: 'I can build or improve your website' },
            sub: { ru: 'Новый сайт, доработки и поддержка — напишите мне в Telegram',
                   en: 'A new site, improvements and support — message me on Telegram' } },
          /* Сайты компании, которые он ведёт: публикации и мелкие доработки.
             Ссылки без icon — плашками с подписью (адреса дал Кирилл) */
          { icon: 'browser',
            title: { ru: 'Веду сайты «Онлайн-Сервис»', en: 'I run Online-Service’s websites' },
            sub: { ru: 'Публикую новости и делаю доработки', en: 'Publishing news and making improvements · in Russian' },
            links: [
              { label: 'on-lineservice.ru', url: 'https://www.on-lineservice.ru/' },
              { label: 'os-24.ru',          url: 'https://os-24.ru/' },
              { label: 'dmitrygulenok.ru',  url: 'https://dmitrygulenok.ru/' },
            ] },
        ] },
      { id: 'ai',    name: { ru: 'Внедрение ИИ', en: 'AI integration' },
        org: { text: { ru: 'Делаю сам и в команде «Онлайн-Сервис»',
                       en: 'Built on my own and with the Online-Service team' },
               work: { ru: 'Сделано в команде «Онлайн-Сервис»',
                       en: 'Made with the Online-Service team' },
               url: 'https://www.on-lineservice.ru/' },
        more: { icon: 'telegram', url: 'https://t.me/Baget_PC', offer: true,
                title: { ru: 'Могу внедрить ИИ в ваш проект',
                         en: 'I can bring AI into your project' },
                sub: { ru: 'Напишите мне в Telegram — обсудим задачу',
                       en: 'Message me on Telegram to discuss it' } } },
    ],
    /* Новые сверху: работы сортируются по дате, свежие первыми */
    items: [
      /* Образец — скопируй ниже, убери обрамление комментария и заполни.
      { id: 'gaming-pc-4070',          // = имя папки в portfolio-src
        category: 'pc',                // из разделов выше
        date: '2026-10',               // год-месяц
        title: { ru: 'Игровой ПК на RTX 4070', en: 'Gaming PC with RTX 4070' },
        // \n — новый абзац
        text: { ru: 'Что за задача, что сделал, что получилось.',
                en: 'The task, what I did, how it turned out.' },
        // Необязательно: характеристики плашками
        specs: ['Ryzen 7 7700', 'RTX 4070 Super', '32 GB DDR5'],
        // Необязательно: true — заказ компании, на странице работы появится
        // строка org.work раздела («Сделано в команде «Онлайн-Сервис»»)
        team: false,
        // Необязательно: ссылка (сайт, видео, пост) и надпись на кнопке.
        // Без cta: пост t.me — «Пост в Telegram», instagram.com — «Пост
        // в Instagram», в «Сайтах» — «Открыть сайт», иначе — «Подробнее»
        url: '', cta: '' },
      */

      /* Сборки ПК — из постов канала t.me/ShizaBageta, выбрал Кирилл 24.10.2026.
         url — пост об этой сборке, на странице работы кнопка «Пост в Telegram». */
      { id: 'server-1c-i5-12400',   // пост 1542
        url: 'https://t.me/ShizaBageta/1542',
        category: 'pc',
        date: '2026-10',
        title: { ru: 'Сервер под 1С для магазина', en: 'A 1C server for a shop' },
        text: { ru: 'Главный компьютер магазина под 1С и работу с документами. Задача — собрать на нормальном железе и при этом максимально сэкономить.\nВсе комплектующие брал в DNS, два жёстких диска перенёс со старого сервера магазина.',
                en: 'The main computer of a shop, running 1C accounting and document work. The task was decent hardware at the lowest possible cost.\nAll parts came from a DNS store, and two hard drives were moved over from the shop’s old server.' },
        specs: ['Core i5-12400', 'MAXSUN Challenger H610M', 'G.Skill Aegis 2×8 GB DDR4 3200',
                'Teamgroup MP33 500 GB', 'PentaWave Z04E', 'Powercase PW500', 'Xastra A306M'] },

      { id: 'ryzen-7-7800x3d',      // пост 1522
        url: 'https://t.me/ShizaBageta/1522',
        category: 'pc',
        date: '2026-06',
        title: { ru: 'Игровой ПК на Ryzen 7 7800X3D', en: 'Gaming PC with Ryzen 7 7800X3D' },
        text: { ru: 'Компьютер для игр. Видеокарту заказчик решил поставить сам, поэтому сборка без неё.\nВсе комплектующие новые, с российских складов и с быстрой доставкой.',
                en: 'A gaming PC. The client decided to install the graphics card on their own, so the build comes without one.\nAll parts are new, shipped fast from Russian warehouses.' },
        specs: ['Ryzen 7 7800X3D', 'ASRock B850 Pro A WiFi', 'Patriot Viper Venom 2×16 GB DDR5 6000',
                'Silicon Power UD90 1 TB', 'Ocypus Sigma L36 Pro', '1stPlayer NGDP 850 W Gold', 'Jonsbo TK-3'] },

      { id: 'ryzen-7-9800x3d-rtx-5070-ti',   // пост 1514
        url: 'https://t.me/ShizaBageta/1514',
        category: 'pc',
        date: '2026-05',
        title: { ru: 'ПК на Ryzen 7 9800X3D и RTX 5070 Ti', en: 'PC with Ryzen 7 9800X3D and RTX 5070 Ti' },
        text: { ru: 'Собран под игры, которые упираются в процессор, и немного под стримы. Процессор выбрал заказчик.\nВсе комплектующие новые, с российских складов и с быстрой доставкой.',
                en: 'Built for CPU-heavy games and some streaming. The processor was the client’s pick.\nAll parts are new, shipped fast from Russian warehouses.' },
        specs: ['Ryzen 7 9800X3D', 'RTX 5070 Ti Zotac Solid SFF', 'ASRock B850M Pro A WiFi',
                'Patriot Viper Venom 2×16 GB DDR5 6000', 'Silicon Power UD90 1 TB',
                'Thermalright Frozen Vision 240', '1stPlayer NGDP 850 W Gold', 'Zalman P10 Namu'] },

      { id: 'ryzen-5-7500f-rtx-4070-super',  // пост 1491
        url: 'https://t.me/ShizaBageta/1491',
        category: 'pc',
        date: '2026-03',
        title: { ru: 'ПК в корпусе Jonsbo TK-1', en: 'PC in a Jonsbo TK-1 case' },
        text: { ru: 'Игровой компьютер на заказ, интересный в первую очередь корпусом.\nВсё железо новое, с российских складов, а корпус заказчик взял б/у сам.',
                en: 'A custom gaming PC that stands out mostly for its case.\nAll hardware is new, from Russian warehouses; the client bought the case used.' },
        specs: ['Ryzen 5 7500F', 'RTX 4070 Super ASUS Dual', 'MAXSUN B850M eSport WiFi Ice',
                'XPG Lancer Blade 2×16 GB DDR5 6000', 'Silicon Power UD90 1 TB',
                'Thermalright Aqua Elite 240 V5', '1stPlayer NGDP 750 W Gold', 'Jonsbo TK-1'] },

      { id: 'ryzen-5-7500f-rtx-3080',        // пост 1472
        url: 'https://t.me/ShizaBageta/1472',
        category: 'pc',
        date: '2026-03',
        title: { ru: 'Игровой ПК на RTX 3080', en: 'Gaming PC with RTX 3080' },
        text: { ru: 'Игровой компьютер, собран под продажу.\nВидеокарта б/у, поэтому перед установкой её обслужили: термопаста с фазовым переходом Honeywell PTM7950 и новые термопрокладки.',
                en: 'A gaming PC built for sale.\nThe graphics card is used, so it was serviced before installation: Honeywell PTM7950 phase-change paste and new thermal pads.' },
        specs: ['Ryzen 5 7500F', 'RTX 3080 Inno3D X3', 'Biostar B650MT', 'Acer Predator Pallas II 2×16 GB DDR5 6000',
                'Patriot P320 1 TB', 'PentaWave Z04E ARGB V2', 'Redragon RGPS 850 W Gold', 'Powercase D3B V2'] },

      { id: 'ryzen-9-9900x-rtx-5050',        // пост 1431
        url: 'https://t.me/ShizaBageta/1431',
        category: 'pc',
        date: '2026-02',
        title: { ru: 'Рабочий ПК на Ryzen 9 9900X', en: 'Work PC with Ryzen 9 9900X' },
        text: { ru: 'Рабочий компьютер для постоянного заказчика: 12 ядер, 64 ГБ памяти и SSD на 4 ТБ. До этого он уже брал у меня ПК под те же задачи, а позже я собрал ему ещё один такой же.\nВсё новое, с российских складов, с доставкой в Москву.',
                en: 'A work computer for a returning client: 12 cores, 64 GB of RAM and a 4 TB SSD. The client had already ordered a PC from me for the same tasks, and later I built one more identical machine.\nAll parts are new, from Russian warehouses, delivered to Moscow.' },
        specs: ['Ryzen 9 9900X', 'RTX 5050 Gigabyte', 'ASRock B850M Pro A WiFi', 'Kingston Fury Beast 2×32 GB DDR5 5600',
                'Adata Legend 960 4 TB', 'Thermalright Aqua Elite V6', '1stPlayer NGDP 750 W Gold', '1stPlayer AU6'] },

      { id: 'ryzen-5-7500f-rtx-3080-ti',     // пост 1386
        url: 'https://t.me/ShizaBageta/1386',
        category: 'pc',
        date: '2026-01',
        title: { ru: 'Игровой ПК на RTX 3080 Ti', en: 'Gaming PC with RTX 3080 Ti' },
        text: { ru: 'Игровой компьютер, собран под продажу.\nВидеокарта б/у, перед установкой обслужена: термопаста Honeywell PTM7950 и термопрокладки Fehonda.',
                en: 'A gaming PC built for sale.\nThe used graphics card was serviced before installation: Honeywell PTM7950 paste and Fehonda thermal pads.' },
        specs: ['Ryzen 5 7500F', 'RTX 3080 Ti Peladn', 'Biostar B650MT', 'Acer Predator Pallas II 2×16 GB DDR5 6000',
                'Patriot P320 1 TB', 'Thermalright Assassin King 120 SE', 'Redragon RGPS 850 W Gold', 'DeepCool CH370'] },

      { id: 'i3-12100f-rx-6600',             // пост 1300
        url: 'https://t.me/ShizaBageta/1300',
        category: 'pc',
        date: '2025-11',
        title: { ru: 'Бюджетный ПК из новых комплектующих', en: 'Budget PC from new parts' },
        text: { ru: 'Базовый минимум 2025 года, чтобы играть и работать. Всё железо новое, из России, с гарантией.\nОтдельно запаривался с кабелями: уложил аккуратно и красиво.',
                en: 'The 2025 baseline for gaming and work. All hardware is new, bought in Russia, with warranty.\nI took extra care with the cables to route them neatly.' },
        specs: ['Core i3-12100F', 'RX 6600 ASRock Challenger', 'MAXSUN Challenger H610M', 'Netac Shadow S 2×16 GB DDR4 3200',
                'Digma Meta M6 1 TB', 'PentaWave Z04E V2', 'DeepCool PF600X', 'Xastra A303M'] },

      { id: 'i5-14600kf-rtx-3050',           // пост 1101
        url: 'https://t.me/ShizaBageta/1101',
        category: 'pc',
        date: '2025-04',
        title: { ru: 'ПК по необычному ТЗ', en: 'A PC built to an unusual spec' },
        text: { ru: 'Заказчик пришёл с готовым ТЗ: процессор от 12 ядер, видеокарта уровня GTX 1650, SSD от 2 ТБ и от 64 ГБ памяти. Договорились, что всё будет новым, с российских складов.\nЯ предлагал сбалансировать конфигурацию, но заказчику нужна была именно такая.',
                en: 'The client came with a ready spec: a 12+ core CPU, a GTX 1650-class graphics card, at least 2 TB of SSD and 64 GB of RAM. We agreed on all-new parts from Russian warehouses.\nI suggested a more balanced configuration, but the client needed exactly this one.' },
        specs: ['Core i5-14600KF', 'RTX 3050 6 GB MSI Ventus', 'MAXSUN Challenger B760M D5 WiFi', 'Kingbank 2×32 GB DDR5 6400',
                'Adata Legend 960 Max 2 TB', 'Thermalright Royal Knight 120 SE', 'XPG Pylon 550 W Bronze', 'Powercase Byteflow'] },

      { id: 'i5-14600kf-rtx-4070',           // пост 1064
        url: 'https://t.me/ShizaBageta/1064',
        category: 'pc',
        date: '2025-03',
        title: { ru: 'Игровой ПК на RTX 4070', en: 'Gaming PC with RTX 4070' },
        text: { ru: 'Новый игровой компьютер: от заказа комплектующих до готовой настроенной сборки прошло 5 дней — всё бралось новым, с быстрой доставкой по России. Внешний вид выбирал заказчик.\nОбновил BIOS и подобрал для процессора пониженное напряжение.',
                en: 'A new gaming PC: five days from ordering the parts to a finished, configured build, with everything new and delivered fast within Russia. The client chose the look.\nI updated the BIOS and tuned a lower CPU voltage.' },
        specs: ['Core i5-14600KF', 'RTX 4070 Palit Dual', 'MAXSUN Terminator B760M D5', 'Kingbank 2×24 GB DDR5 6800',
                'Adata Legend 960 Max 2 TB', 'Thermalright Peerless Assassin 120 SE', '1stPlayer NGDP 850 W Gold', '1stPlayer MV8-TP'] },

      /* Фото: съёмка для бренда одежды Vulgar (так пишет Кирилл) — снимал и
         обрабатывал он; оригиналы положил 25.10.2026, дата — из данных камеры
         (Fujifilm X-A5, ночь на 15.08.2026). Сайт бренда vulgarclub.ru 25.10
         не открывался — кнопка на их Telegram; заработает — можно сменить. */
      { id: 'vulgar',
        url: 'https://t.me/vulgar_cult',
        cta: { ru: 'Бренд в Telegram', en: 'The brand on Telegram' },
        category: 'photo',
        date: '2026-08',
        title: { ru: 'Съёмка для бренда одежды Vulgar', en: 'Shoot for the Vulgar clothing brand' },
        // Текст — вариант 4, выбор Кирилла 25.10.2026
        text: { ru: 'Фото для бренда одежды Vulgar — для их соцсетей и магазина.',
                en: 'Photos for the Vulgar clothing brand — for their social media and store.' },
        specs: ['Fujifilm X-A5', { ru: 'Съёмка и обработка', en: 'Shooting and editing' },
                { ru: 'Ночная съёмка', en: 'Night shoot' }] },

      /* Фото: Нижний Новгород — Кирилл разложил кадры по папкам «сет 1–8»
         по стилю (сборка их не читает); 18 выбранных скопированы в корень
         папки и идут группами в порядке его сетов (25.10.2026). Весна — по его хэштегам в Instagram; месяц не
         знаем, поэтому только год. Камера — по номерам кадров DSCF, как у X-A5. */
      { id: 'nizhny-novgorod',
        category: 'photo',
        date: '2026',
        title: { ru: 'Нижний Новгород, весна', en: 'Nizhny Novgorod in spring' },
        text: { ru: 'Весенний Нижний Новгород: улицы, набережные и купола — днём, на закате и ночью.',
                en: 'Nizhny Novgorod in spring: streets, embankments and church domes — by day, at sunset and at night.' },
        specs: ['Fujifilm X-A5', { ru: 'Стрит-фото', en: 'Street photography' },
                { ru: 'Съёмка и обработка', en: 'Shooting and editing' }] },

      /* Фото: Череповец — 18 из 59 (выбор 25.10.2026), остальные в
         portfolio-src\cherepovets\не вошли. Весна (кадры с камеры) и зима
         (сохранены из Telegram, 2560 px). Порядок — по стилю, а не по сюжету:
         просьба Кирилла «соблюди стилистический порядок». */
      { id: 'cherepovets',
        category: 'photo',
        date: '2026',
        title: { ru: 'Череповец', en: 'Cherepovets' },
        text: { ru: 'Череповец весной и зимой: порт с кранами, набережные, заводские трубы, туман и ночные улицы.',
                en: 'Cherepovets in spring and winter: the port and its cranes, embankments, factory chimneys, fog and streets at night.' },
        specs: ['Fujifilm X-A5', { ru: 'Стрит-фото', en: 'Street photography' },
                { ru: 'Съёмка и обработка', en: 'Shooting and editing' }] },

      /* Фото: лето в деревне (папка bor) — Кирилл: «обычные кадры», отобрать
         лучшее и много не плодить (25.10.2026). 10 из 24, остальные лежат в
         portfolio-src\bor\не вошли. Даты — из данных камеры: 31.07–01.08.2026. */
      { id: 'bor',
        category: 'photo',
        date: '2026-07',
        title: { ru: 'Лето в деревне', en: 'Summer in the village' },
        text: { ru: 'Летние кадры из деревни: вечерний свет, детали двора, ягоды и сосны.',
                en: 'Summer shots from the village: evening light, yard details, berries and pines.' },
        // Без программы обработки — просьба Кирилла 25.10.2026
        specs: ['Fujifilm X-A5', { ru: 'Съёмка и обработка', en: 'Shooting and editing' }] },

      /* Сайты Кирилла (дал 25.10.2026). Фото — скриншоты живых сайтов
         (Playwright + Chrome; плашка куки и чат спрятаны только на снимке);
         мобильные — два телефона в одном кадре.
         Оба — заказы «Онлайн-Сервис» (ответ Кирилла 25.10.2026), отсюда team: true. */
      { id: 'mirumir',
        url: 'https://мирумир.рф/',
        team: true,
        category: 'sites',
        date: '2026-10',
        title: { ru: 'Сайт благотворительного фонда «Миру Мир»', en: 'Website for the Miru Mir charity foundation' },
        // «с нуля» не пишем: сайты на Битриксе (просьба Кирилла 25.10.2026)
        text: { ru: 'Сайт благотворительного фонда из Череповца, собранный по концепции фонда: главная, «О фонде», страницы для меценатов, бизнеса и волонтёров, благотворительный бал.\nОтдельная страница пожертвований с QR-кодом для оплаты из приложения банка и реквизитами. Заявки с сайта сразу попадают в CRM фонда.',
                en: 'Website for a charity foundation from Cherepovets, built to the foundation’s concept: home page, about, pages for patrons, businesses and volunteers, a charity ball.\nA separate donation page with a QR code for paying from a banking app and bank details. Requests from the site go straight to the foundation’s CRM.' },
        specs: ['Битрикс24.Сайты', { ru: 'Свой дизайн и CSS', en: 'Custom design and CSS' },
                { ru: 'CRM-формы', en: 'CRM forms' }, { ru: 'QR-оплата', en: 'QR payments' },
                { ru: 'Адаптив под телефоны', en: 'Mobile-friendly' }] },

      { id: 'argumenty',
        url: 'https://argumenty.su/',
        team: true,
        category: 'sites',
        date: '',   // Кирилл решил дату не указывать (25.10.2026)
        title: { ru: 'Интернет-магазин экипировки для бокса «Аргументы»', en: 'Argumenty boxing gear online store' },
        text: { ru: 'Интернет-магазин экипировки для бокса из Ижевска: каталог перчаток, защиты, одежды и обуви, фильтр по цене и брендам, карточки товаров, корзина и личный кабинет покупателя.',
                en: 'An online store of boxing gear from Izhevsk: a catalogue of gloves, protection, clothing and footwear, filters by price and brand, product pages, a cart and a customer account.' },
        specs: ['Битрикс24', { ru: 'Интернет-магазин', en: 'Online store' },
                { ru: 'Каталог с фильтрами', en: 'Catalogue with filters' },
                { ru: 'Адаптив под телефоны', en: 'Mobile-friendly' }] },

      /* Новости на втором сайте компании — делал сам (сказал Кирилл 25.10.2026).
         Скриншоты — мои, со статьёй без чужих кадров (у одной обложка — эфир ТВ) */
      { id: 'os24-news',
        url: 'https://os-24.ru/news/',
        category: 'sites',
        date: '2026-08',   // делал 06–11.08.2026
        title: { ru: 'Раздел новостей для «Онлайн-Сервис»', en: 'News section for Online-Service' },
        text: { ru: 'Отдельная страница новостей на втором сайте компании, os-24.ru: вкладки «Главная / Новости» в шапке, лента карточек с обложкой, датой и кнопкой «Читать», страница статьи и переход между страницами ленты.\nНовости и статьи на сайтах компании публикую тоже я.',
                en: 'A separate news page on the company’s second website, os-24.ru: “Home / News” tabs in the header, a feed of cards with a cover, date and a “Read” button, an article page and paging through the feed.\nI also publish the news and articles on the company’s websites.' },
        specs: ['1С-Битрикс', { ru: 'Лента и страница статьи', en: 'Feed and article page' },
                { ru: 'Адаптив под телефоны', en: 'Mobile-friendly' },
                { ru: 'Публикация статей', en: 'Publishing articles' }] },
    ],
  },

  /* --- Панель оформления (кнопка в правом верхнем углу) -------------------- */
  /* Гость может подобрать себе яркость и акцентный цвет; выбор запоминается
     у него в браузере и на других не влияет. enabled: false — убрать панель
     совсем, тогда кнопка просто переключает светлую и тёмную тему.          */
  appearance: {
    enabled: true,
    title: { ru: 'Яркость темы', en: 'Brightness' },
    accentTitle: { ru: 'Акцентный цвет', en: 'Accent color' },
    customLabel: { ru: 'Другое', en: 'Custom' },

    /* Первый в списке — родной цвет сайта, он же по умолчанию.
       accent — основной, accent2 — второй цвет градиентов.                  */
    accents: [
      { name: { ru: 'Терракота',  en: 'Terracotta' }, accent: '#d9744f', accent2: '#e8a04b' },
      { name: { ru: 'Красный',    en: 'Red' },        accent: '#e0574f', accent2: '#f08a63' },
      { name: { ru: 'Оранжевый',  en: 'Orange' },     accent: '#e8862e', accent2: '#f2b455' },
      { name: { ru: 'Зелёный',    en: 'Green' },      accent: '#5fa86b', accent2: '#8cc47a' },
      { name: { ru: 'Бирюзовый',  en: 'Teal' },       accent: '#3fa8a0', accent2: '#63c8be' },
      { name: { ru: 'Синий',      en: 'Blue' },       accent: '#5486d8', accent2: '#79aae8' },
      { name: { ru: 'Фиолетовый', en: 'Purple' },     accent: '#9a6ee0', accent2: '#bb92ee' },
    ],
  },

  /* --- Необязательный блок «Сейчас». Максимум 3 строки -------------------- */
  now: {
    enabled: false,              // поставь true, если хочешь показать
    title: { ru: 'Сейчас', en: 'Now' },
    items: [
      'Пишу телеграм-ботов на Python',
      'Читаю про архитектуру приложений',
    ],
  },

  /* --- Статистика посещений: Яндекс.Метрика ------------------------------- */
  /* Номер счётчика с metrika.yandex.ru — только цифры, например '98765432'.
     Пока пусто, сайт не собирает ничего: ни счётчика, ни куки, поэтому нет
     и уведомления о них. Впишешь номер — сами появятся три вещи:
       · внизу экрана уведомление «Принять / Отказаться»;
       · Метрика, которая включается ТОЛЬКО после «Принять»;
       · ссылка «Конфиденциальность и куки» в подвале на страницу /privacy/.
     При создании счётчика Вебвизор не включай: он записывает действия
     гостя целиком, и про это пришлось бы отдельно писать в политике.      */
  analytics: {
    metrika: '113771484',   // счётчик создал Кирилл 24.10.2026
    /* Второй счётчик, без куки — GoatCounter (решил Кирилл 25.10.2026).
       Считает всех гостей, без уведомления, и нажатия на ссылки. Сюда — код
       сайта: из адреса статистики КОД.goatcounter.com, например 'kirill'.
       Считает только на адресе из meta.url — не на компьютере. Пусто — выключен. */
    goatcounter: 'kirillbuldakov',   // kirillbuldakov.goatcounter.com — завёл Кирилл 25.10.2026
    /* Текст уведомления. Пусто — стандартный, от первого лица.
       Свой — парой { ru: '…', en: '…' }                                     */
    text: '',
  },

  /* --- Подвал ------------------------------------------------------------- */
  footer: {
    /* Пусто — берётся имя из шапки (hero.name), чтобы при смене имени
       подвал не остался со старым. Впиши текст, если нужен другой.       */
    text: '',
    showYear: true,
    /* Куда ведёт строка подвала по нажатию. Пусто — просто текст */
    url: 'https://t.me/Baget_PC',
    /* Кнопка «Нашли ошибку? Напишите мне» в подвале каждой страницы
       (попросил Кирилл 25.10.2026). Telegram откроется с готовым началом
       сообщения — в нём адрес страницы, где гость нашёл ошибку. Можно
       и почту: 'mailto:адрес' — тогда адрес страницы будет в письме.
       Пусто — кнопки нет.                                                 */
    bugUrl: 'https://t.me/Baget_PC',
  },
};
