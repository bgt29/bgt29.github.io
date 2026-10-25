# Сборка сайта из assets/js/config.js. Запускать после любых правок конфига
# или смены аватара — одна команда, всё остальное делается само.
#
# Что делает:
#   0. Ужимает фото портфолио из portfolio-src в assets/portfolio.
#   1. Вписывает в index.html заголовок, описание, теги превью и разметку для
#      поиска. Боты мессенджеров и поисковиков скрипты не выполняют, поэтому
#      всё это должно лежать в HTML готовым, а не дописываться из app.js.
#      Из той же разметки делает остальные страницы: английскую версию
#      (en/index.html) и портфолио (portfolio/, en/portfolio/).
#   2. Рисует иконки: вкладка (favicon.svg и favicon.ico) и иконка для экрана
#      «Домой» на iPhone (apple-touch-icon.png).
#   3. Рисует картинку превью для мессенджеров — assets/img/og.jpg
#      (и og-en.jpg для английской версии).
#   4. Вшивает содержимое страницы в HTML на обоих языках — для поисковиков
#      и нейросетей.
#   5. robots.txt, sitemap.xml, llms.txt.
#
# Запуск из папки сайта:
#   powershell -ExecutionPolicy Bypass -File tools\build.ps1
#
# Нужны Python (для временного сервера) и Chrome или Edge (для отрисовки).

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$img  = Join-Path $root 'assets\img'
$port = 8911
$base = "http://127.0.0.1:$port"
$utf8 = New-Object System.Text.UTF8Encoding $false   # без BOM

$script:browser = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $script:browser) { throw 'Не найден ни Chrome, ни Edge — без них сборка невозможна.' }

# Браузер пишет отчёт в поток ошибок даже при успехе. При строгой реакции на
# ошибки PowerShell принял бы это за сбой и оборвал сборку на ровном месте.
function Invoke-Browser([string[]]$BrowserArgs) {
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try { $out = & $script:browser @BrowserArgs 2>$null }
  finally { $ErrorActionPreference = $prev }
  return $out
}

# Готовый HTML страницы после выполнения скриптов. Chrome на Windows — оконное
# приложение, и вызов через & его вывод не ловит: строки просто теряются.
# Поэтому запуск через Start-Process с перенаправлением в файл.
function Get-Dom([string]$url) {
  $out = Join-Path $env:TEMP 'site_dom.txt'
  $err = Join-Path $env:TEMP 'site_dom_err.txt'
  Remove-Item $out, $err -ErrorAction SilentlyContinue
  Start-Process -FilePath $script:browser -NoNewWindow -Wait `
    -ArgumentList '--headless=new', '--disable-gpu', '--virtual-time-budget=3000', '--dump-dom', $url `
    -RedirectStandardOutput $out -RedirectStandardError $err | Out-Null
  $text = if (Test-Path $out) { [System.IO.File]::ReadAllText($out, [System.Text.Encoding]::UTF8) } else { '' }
  Remove-Item $out, $err -ErrorAction SilentlyContinue
  return $text
}

function Save-Shot([string]$url, [int]$w, [int]$h, [string]$file, [string[]]$extra = @()) {
  if (Test-Path $file) { Remove-Item $file -Force }
  $a = @('--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=5000',
         "--window-size=$w,$h", "--screenshot=$file") + $extra + @($url)
  Invoke-Browser $a | Out-Null
  for ($i = 0; $i -lt 20 -and -not (Test-Path $file); $i++) { Start-Sleep -Milliseconds 150 }
  if (-not (Test-Path $file)) { throw "Браузер не отдал картинку: $url" }
}

function Resize([System.Drawing.Image]$src, [int]$w, [int]$h) {
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.SmoothingMode = 'HighQuality'
  $g.PixelOffsetMode = 'HighQuality'
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.DrawImage($src, 0, 0, $w, $h)
  $g.Dispose()
  return $bmp
}

# .ico из нескольких размеров; внутри обычные PNG — так поддерживают все
# браузеры начиная с Windows Vista, и качество не теряется.
function Write-Ico([string]$path, [System.Drawing.Image]$src, [int[]]$sizes) {
  $blobs = @()
  foreach ($s in $sizes) {
    $bmp = Resize $src $s $s
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $blobs += ,@($s, $ms.ToArray())
  }
  $fs = [System.IO.File]::Create($path)
  $bw = New-Object System.IO.BinaryWriter $fs
  try {
    $bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]$blobs.Count)
    $offset = 6 + 16 * $blobs.Count
    foreach ($b in $blobs) {
      $side = [byte]$b[0]
      $bw.Write($side); $bw.Write($side)
      $bw.Write([byte]0); $bw.Write([byte]0)
      $bw.Write([UInt16]1); $bw.Write([UInt16]32)
      $bw.Write([UInt32]$b[1].Length); $bw.Write([UInt32]$offset)
      $offset += $b[1].Length
    }
    foreach ($b in $blobs) { $bw.Write([byte[]]$b[1]) }
  }
  finally { $bw.Close() }
}

# Python здесь запускается через заглушку Windows, а сервер живёт в дочернем
# процессе. Гасить по номеру заглушки мало — ищем по командной строке.
function Stop-Server {
  Get-CimInstance Win32_Process -Filter "Name='python.exe'" |
    Where-Object { $_.CommandLine -match "http\.server $port\b" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

# Кнопка языка в готовом HTML: ведёт на ту же страницу на другом языке
function Set-Toggle([string]$html, [string]$tag) {
  $rx = '<a class="lang-toggle"[^>]*>[^<]*</a>'
  if (-not [regex]::IsMatch($html, $rx)) { throw 'В index.html нет кнопки языка (<a class="lang-toggle">).' }
  return [regex]::Replace($html, $rx, [System.Text.RegularExpressions.MatchEvaluator] { param($mm) $tag })
}

# --- Фото портфолио -----------------------------------------------------------
function Get-ImageSize([string]$path) {
  $fs = [System.IO.File]::OpenRead($path)
  try {
    $im = [System.Drawing.Image]::FromStream($fs, $false, $false)
    try { return @($im.Width, $im.Height) } finally { $im.Dispose() }
  }
  finally { $fs.Dispose() }
}

# Ужатая копия снимка: не больше $max точек по длинной стороне, JPEG
function Convert-Photo([string]$src, [string]$dst, [int]$max, [long]$quality) {
  $img = [System.Drawing.Image]::FromFile($src)
  try {
    # Телефон снимает «как держал», а поворот пишет в служебное поле.
    # Не применить его — фото на сайте ляжет на бок.
    if ($img.PropertyIdList -contains 0x0112) {
      $o = [int][BitConverter]::ToUInt16($img.GetPropertyItem(0x0112).Value, 0)
      $flip = @{ 2 = 'RotateNoneFlipX'; 3 = 'Rotate180FlipNone'; 4 = 'Rotate180FlipX'; 5 = 'Rotate90FlipX';
                 6 = 'Rotate90FlipNone'; 7 = 'Rotate270FlipX'; 8 = 'Rotate270FlipNone' }[$o]
      if ($flip) { $img.RotateFlip([System.Drawing.RotateFlipType]$flip) }
    }
    $k = [Math]::Min(1.0, $max / [Math]::Max($img.Width, $img.Height))
    $w = [Math]::Max(1, [int][Math]::Round($img.Width * $k))
    $h = [Math]::Max(1, [int][Math]::Round($img.Height * $k))

    # Рисуем на новом холсте: служебные данные телефона — модель, дата и место
    # съёмки — в копию не переходят и остаются только в оригинале
    $bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $g.InterpolationMode = 'HighQualityBicubic'
      $g.PixelOffsetMode = 'HighQuality'
      $g.Clear([System.Drawing.Color]::White)   # прозрачный PNG ляжет на белое
      $attr = New-Object System.Drawing.Imaging.ImageAttributes
      $attr.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)   # без тёмной каймы по краю
      $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $w, $h),
        0, 0, $img.Width, $img.Height, [System.Drawing.GraphicsUnit]::Pixel, $attr)
    }
    finally { $g.Dispose() }

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
    $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, $quality)
    try { $bmp.Save($dst, $codec, $ep) } finally { $bmp.Dispose() }
    return @($w, $h)
  }
  finally { $img.Dispose() }
}

# --- Видео портфолио ----------------------------------------------------------
# ffmpeg нужен только для видео; если его нет — ролики пропускаются с подсказкой
$script:ffmpeg = (Get-Command ffmpeg -ErrorAction SilentlyContinue | Select-Object -First 1).Source

# Ролик для сайта: H.264 в MP4, не больше 1280 точек по длинной стороне, без
# служебных данных (модель телефона, дата, место съёмки). faststart — чтобы
# играл сразу, не дожидаясь загрузки целиком. Плюс кадр для обложки в PNG.
function Convert-Video([string]$src, [string]$dst, [string]$poster) {
  $scale = "scale='if(gte(iw,ih),min(1280,iw),-2)':'if(gte(iw,ih),-2,min(1280,ih))'"
  # ffmpeg пишет в поток ошибок и при успехе — как браузер, см. Invoke-Browser
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    & $script:ffmpeg -nostdin -y -v error -i $src -map_metadata -1 -vf $scale -c:v libx264 -preset slow `
      -crf 26 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart $dst 2>$null
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $dst)) { throw "ffmpeg не смог пережать $src" }
    # Обложка — кадр на полсекунды, у совсем коротких роликов — первый
    & $script:ffmpeg -nostdin -y -v error -ss 0.5 -i $dst -frames:v 1 $poster 2>$null
    if (-not (Test-Path $poster)) { & $script:ffmpeg -nostdin -y -v error -i $dst -frames:v 1 $poster 2>$null }
    if (-not (Test-Path $poster)) { throw "ffmpeg не смог взять кадр для обложки из $src" }
  }
  finally { $ErrorActionPreference = $prev }
}

# Из оригиналов в portfolio-src — копии в assets/portfolio и их список
# assets/portfolio/photos.js. Пережимает только новые и изменённые снимки.
# Видео (mp4, mov, m4v, webm) — рядом с фото в той же папке: в списке у них
# обложка-кадр и поле video, на странице работы вместо фото играет ролик.
function Update-Photos {
  $srcRoot = Join-Path $root 'portfolio-src'
  $outRoot = Join-Path $root 'assets\portfolio'
  New-Item -ItemType Directory -Force $outRoot | Out-Null
  $res = @{ count = 0; fresh = 0; videos = 0; notes = @() }
  $json = @()
  # 1.jpg, 2.jpg … 10.jpg — по-человечески, а не 1, 10, 2
  $natural = { [regex]::Replace($_.Name, '\d+', { param($d) $d.Value.PadLeft(8, '0') }) }
  $isPhoto = '^\.(jpe?g|png)$'
  $isVideo = '^\.(mp4|mov|m4v|webm)$'
  $junk = '^(desktop\.ini|thumbs\.db|\.ds_store|ПРОЧТИ\.txt)$'

  $ids = @()
  if (Test-Path $srcRoot) { $ids += Get-ChildItem $srcRoot -Directory | ForEach-Object { $_.Name } }
  # Папки с готовыми копиями без оригиналов тоже в деле: оригиналы могли
  # просто убрать с диска после сборки — фото на сайте от этого не пропадут
  $ids += Get-ChildItem $outRoot -Directory | ForEach-Object { $_.Name } | Where-Object { $ids -notcontains $_ }

  foreach ($id in ($ids | Sort-Object)) {
    if ($id -cnotmatch '^[a-z0-9][a-z0-9-]*$') {
      $res.notes += "portfolio-src\$id — имя папки: только строчная латиница, цифры и дефис. Папка пропущена"
      continue
    }
    $srcDir = Join-Path $srcRoot $id
    $outDir = Join-Path $outRoot $id
    New-Item -ItemType Directory -Force $outDir | Out-Null
    $list = @()

    if (Test-Path $srcDir) {
      $all = @(Get-ChildItem $srcDir -File)
      # Своя обложка ролика — картинка с тем же именем рядом (reel-1.mov + reel-1.jpg,
      # просьба Кирилла 25.10.2026). Такая картинка — не отдельное фото в галерее
      $videoNames = @($all | Where-Object { $_.Extension -match $isVideo } | ForEach-Object { $_.BaseName.ToLower() })
      $posters = @{}
      $all | Where-Object { $_.Extension -match $isPhoto -and $videoNames -contains $_.BaseName.ToLower() } |
        ForEach-Object { $posters[$_.BaseName.ToLower()] = $_ }
      $files = @($all | Where-Object { ($_.Extension -match $isPhoto -and -not $posters.ContainsKey($_.BaseName.ToLower())) -or
                                       $_.Extension -match $isVideo } | Sort-Object $natural)
      $all | Where-Object { $_.Extension -notmatch $isPhoto -and $_.Extension -notmatch $isVideo -and $_.Name -notmatch $junk } | ForEach-Object {
        $res.notes += "portfolio-src\$id\$($_.Name) — не фото (JPG, PNG) и не видео (MP4, MOV), пропущен (про HEIC — в ПРОЧТИ.txt)"
      }
      $keep = @{}
      foreach ($f in $files) {
        $video = $f.Extension -match $isVideo
        if ($video -and -not $script:ffmpeg) {
          $res.notes += "portfolio-src\$id\$($f.Name) — видео пропущено: не найден ffmpeg (winget install ffmpeg)"
          continue
        }
        $name = ($f.BaseName.ToLower() -replace '[^a-z0-9_-]+', '-').Trim('-')
        if (-not $name) { $name = 'photo' }
        $n = $name; $i = 2
        while ($keep.ContainsKey("$n.jpg")) { $n = "$name-$i"; $i++ }
        $keep["$n.jpg"] = 1; $keep["$n-s.jpg"] = 1
        if ($video) { $keep["$n.mp4"] = 1 }
        $big = Join-Path $outDir "$n.jpg"
        $small = Join-Path $outDir "$n-s.jpg"
        $mp4 = Join-Path $outDir "$n.mp4"
        $poster = if ($video) { $posters[$f.BaseName.ToLower()] } else { $null }
        $stale = -not (Test-Path $big) -or -not (Test-Path $small) -or
                 ((Get-Item $big).LastWriteTimeUtc -lt $f.LastWriteTimeUtc) -or
                 ($poster -and (Get-Item $big).LastWriteTimeUtc -lt $poster.LastWriteTimeUtc) -or
                 ($video -and -not (Test-Path $mp4))
        if ($stale -and $video) {
          $frame = Join-Path $env:TEMP "site_poster_$id`_$n.png"
          Convert-Video $f.FullName $mp4 $frame
          # Своя обложка, если положили; иначе — кадр из ролика
          $cover = if ($poster) { $poster.FullName } else { $frame }
          try {
            $d = Convert-Photo $cover $big 1600 82     # обложка в окне работы
            $t = Convert-Photo $cover $small 640 78    # обложка карточки
          }
          finally { Remove-Item $frame -ErrorAction SilentlyContinue }
          $res.fresh++
        }
        elseif ($stale) {
          $d = Convert-Photo $f.FullName $big 1600 82    # для окна работы
          $t = Convert-Photo $f.FullName $small 640 78   # для карточки
          $res.fresh++
        }
        else { $d = Get-ImageSize $big; $t = Get-ImageSize $small }
        if ($video) { $res.videos++ }
        $list += @{ n = $n; d = $d; t = $t; v = $video }
      }
      # Копии снимков, которых среди оригиналов больше нет, — убираем: их делала сборка
      Get-ChildItem $outDir -File | Where-Object { -not $keep.ContainsKey($_.Name) } | Remove-Item -Force
    }
    else {
      Get-ChildItem $outDir -File -Filter '*.jpg' | Where-Object { $_.Name -notmatch '-s\.jpg$' } | Sort-Object $natural |
        ForEach-Object {
          $n = $_.BaseName
          $small = Join-Path $outDir "$n-s.jpg"
          $v = Test-Path (Join-Path $outDir "$n.mp4")
          if (Test-Path $small) { $list += @{ n = $n; d = (Get-ImageSize $_.FullName); t = (Get-ImageSize $small); v = $v } }
        }
    }

    if ($list.Count) {
      $rows = $list | ForEach-Object {
        '{"src":"/assets/portfolio/' + $id + '/' + $_.n + '.jpg","w":' + $_.d[0] + ',"h":' + $_.d[1] +
        ',"thumb":"/assets/portfolio/' + $id + '/' + $_.n + '-s.jpg","tw":' + $_.t[0] + ',"th":' + $_.t[1] +
        $(if ($_.v) { ',"video":"/assets/portfolio/' + $id + '/' + $_.n + '.mp4"' } else { '' }) + '}'
      }
      $json += '  "' + $id + '": [' + "`n    " + ($rows -join ",`n    ") + "`n  ]"
      $res.count += $list.Count
    }
  }

  $js = "/* Список фото портфолио. Файл целиком пишет сборка (tools/build.ps1) из папки`n" +
        "   portfolio-src — руками не править, изменения затрутся. */`n"
  $js += if ($json.Count) { "window.SITE_PHOTOS = {`n" + ($json -join ",`n") + "`n};`n" } else { "window.SITE_PHOTOS = {};`n" }
  [System.IO.File]::WriteAllText((Join-Path $outRoot 'photos.js'), $js, $utf8)
  return $res
}

Add-Type -AssemblyName System.Drawing
Stop-Server   # хвост от прерванного прошлого запуска

Start-Process -FilePath 'python' -ArgumentList '-m', 'http.server', $port, '--bind', '127.0.0.1' `
  -WorkingDirectory $root -WindowStyle Hidden | Out-Null

$written = @()
try {
  $up = $false
  for ($i = 0; $i -lt 40; $i++) {
    try { Invoke-WebRequest "$base/index.html" -UseBasicParsing -TimeoutSec 2 | Out-Null; $up = $true; break }
    catch { Start-Sleep -Milliseconds 250 }
  }
  if (-not $up) { throw 'Временный сервер не поднялся.' }

  # --- 0. Фото портфолио -----------------------------------------------------
  # Первым делом: список фото нужен и заголовкам, и страницам
  $photos = Update-Photos
  if ($photos.count) {
    $written += "assets/portfolio — фото: $($photos.count - $photos.videos)" +
      $(if ($photos.videos) { ", видео: $($photos.videos)" } else { '' }) + ", пережато заново: $($photos.fresh)"
  }

  # --- 1. Заголовок страницы ------------------------------------------------
  $dump = Get-Dom "$base/tools/build-head.html"
  $m = [regex]::Match($dump, '(?s)<body[^>]*>(.*?)</body>')
  if (-not $m.Success -or -not $m.Groups[1].Value.Trim()) {
    throw 'Служебная страница ничего не вернула — скорее всего, в config.js синтаксическая ошибка.'
  }
  $data = [System.Net.WebUtility]::HtmlDecode($m.Groups[1].Value).Trim() | ConvertFrom-Json
  # Конфиг с ошибкой не загружается, а служебная страница всё равно отвечает —
  # пустыми данными. Без этой проверки сборка затёрла бы заголовки страниц
  if (-not $data.config) {
    throw 'config.js не загрузился — в нём синтаксическая ошибка (кавычка, запятая, перенос строки внутри текста). Сборка остановлена, страницы не тронуты.'
  }

  # Разметка у всех страниц одна — index.html. Остальные (английская версия,
  # портфолио) сборка делает из неё копиями: свой язык, свой заголовок, своя
  # кнопка языка. Содержимое каждой вшивается ниже, в шаге 4.
  $indexPath = Join-Path $root 'index.html'
  $tpl = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)
  $pattern = '(?s)(<!-- build:meta[^>]*-->)(.*?)(\s*<!-- /build:meta -->)'
  if (-not [regex]::IsMatch($tpl, $pattern)) { throw 'В index.html нет меток build:meta.' }
  if ($tpl -notmatch '<body>') { throw 'В index.html тег <body> должен быть без атрибутов — по нему сборка помечает портфолио.' }

  # Список страниц — от служебной: главная, портфолио, разделы и работы,
  # каждая на каждом языке. Файл кладётся по адресу: /portfolio/pc/ —
  # это portfolio\pc\index.html.
  $pagesBuilt = @()
  foreach ($pg in @($data.pages)) {
    $trim = ([string]$pg.path).Trim('/')
    $rel = if ($trim) { ($trim -replace '/', '\') + '\index.html' } else { 'index.html' }
    $path = Join-Path $root $rel
    $html = $tpl
    if ($pg.lang -eq 'en') { $html = $html -replace '<html lang="ru"', '<html lang="en"' }
    if ($pg.body) { $html = $html.Replace('<body>', '<body' + $pg.body + '>') }
    $html = [regex]::Replace($html, $pattern, [System.Text.RegularExpressions.MatchEvaluator] {
      param($mm) $mm.Groups[1].Value + "`n  " + $pg.head + $mm.Groups[3].Value
    })
    $html = Set-Toggle $html ([string]$pg.toggle)
    New-Item -ItemType Directory -Force (Split-Path $path) | Out-Null
    [System.IO.File]::WriteAllText($path, $html, $utf8)
    $pagesBuilt += [pscustomobject]@{ kind = [string]$pg.kind; lang = [string]$pg.lang; rel = $rel
                                      path = $path; public = [string]$pg.path; index = [bool]$pg.index }
  }

  # Страницы, которых больше нет в конфиге (удалённая работа, раздел без
  # работ, выключенный английский), — убираем. Только те, что делала сборка:
  # в них метка build:meta. Только в папках en и portfolio — их целиком
  # ведёт сборка; privacy, avito и прочее не трогаем.
  $keep = @{}
  $pagesBuilt | ForEach-Object { $keep[$_.path.ToLower()] = 1 }
  $gone = 0
  foreach ($d in @('en', 'portfolio')) {
    $dir = Join-Path $root $d
    if (-not (Test-Path $dir)) { continue }
    Get-ChildItem $dir -Recurse -File -Filter 'index.html' | ForEach-Object {
      if ($keep.ContainsKey($_.FullName.ToLower())) { return }
      $txt = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
      if ($txt -match '<!-- build:meta') { Remove-Item $_.FullName -Force; $gone++ }
    }
    # Опустевшие папки — с самых глубоких
    Get-ChildItem $dir -Recurse -Directory | Sort-Object { $_.FullName.Length } -Descending |
      Where-Object { -not (Get-ChildItem $_.FullName -Force) } | Remove-Item -Force
    if (-not (Get-ChildItem $dir -Force)) { Remove-Item $dir -Force }
  }
  if ($gone) { $written += "убрано старых страниц: $gone (их больше нет в конфиге)" }

  $kindRu = @{ home = 'главная'; portfolio = 'портфолио'; category = 'разделы'; work = 'работы' }
  $kinds = $pagesBuilt | Group-Object kind | ForEach-Object { "$($kindRu[$_.Name]): $($_.Count)" }
  $written += 'заголовки, описание, превью, разметка для поиска — страниц ' + $pagesBuilt.Count +
              ' (' + ($kinds -join ', ') + ')'

  # --- 2. Иконки -------------------------------------------------------------
  # На сайт кладётся SVG без размеров — браузер сам впишет его во вкладку.
  $svgPath = Join-Path $img 'favicon.svg'
  [System.IO.File]::WriteAllText($svgPath, $data.iconRound, $utf8)
  $written += 'assets/img/favicon.svg'

  # Для отрисовки в PNG нужны копии С ЯВНЫМ размером: без width и height
  # Chrome снимает SVG как пустой документ — белый или прозрачный лист.
  function Write-SizedSvg([string]$svg, [int]$side, [string]$name) {
    $path = Join-Path $env:TEMP $name
    $sized = $svg -replace 'viewBox="0 0 64 64"', ('viewBox="0 0 64 64" width="' + $side + '" height="' + $side + '"')
    [System.IO.File]::WriteAllText($path, $sized, $utf8)
    return $path
  }

  # Проверка середины иконки: пусто — значит, отрисовка не удалась
  function Assert-Drawn([string]$png, [string]$what) {
    $b = New-Object System.Drawing.Bitmap $png
    try {
      $p = $b.GetPixel([int]($b.Width / 2), [int]($b.Height * 0.85))
      $blank = ($p.A -lt 200) -or ($p.R -gt 245 -and $p.G -gt 245 -and $p.B -gt 245)
    }
    finally { $b.Dispose() }
    if ($blank) { throw "$what отрисовалась пустой — сборка остановлена, файлы не годятся." }
  }

  # Для iPhone — квадрат без прозрачности: углы система скругляет сама,
  # а прозрачные места закрасила бы чёрным.
  $square = Write-SizedSvg $data.iconSquare 180 'site_icon_square.svg'
  $applePng = Join-Path $img 'apple-touch-icon.png'
  Save-Shot ('file:///' + ($square -replace '\\', '/')) 180 180 $applePng
  Assert-Drawn $applePng 'Иконка для iPhone'
  $written += 'assets/img/apple-touch-icon.png'

  # Для вкладки — со скруглёнными углами на прозрачном фоне
  $roundSvg = Write-SizedSvg $data.iconRound 192 'site_icon_round.svg'
  $roundPng = Join-Path $env:TEMP 'site_icon_round.png'
  Save-Shot ('file:///' + ($roundSvg -replace '\\', '/')) 192 192 $roundPng @('--default-background-color=00000000')
  Assert-Drawn $roundPng 'Иконка вкладки'
  $round = [System.Drawing.Image]::FromFile($roundPng)
  try { Write-Ico (Join-Path $root 'favicon.ico') $round @(16, 32, 48) }
  finally { $round.Dispose() }
  Remove-Item $roundPng, $roundSvg, $square -Force
  $written += 'favicon.ico — 16, 32 и 48 пикселей'

  # --- 3. Картинка превью ----------------------------------------------------
  function Write-Og([string]$url, [string]$name) {
    $ogTmp = Join-Path $env:TEMP 'site_og_raw.png'
    Save-Shot $url 1200 630 $ogTmp @('--force-device-scale-factor=2')

    # Пустой лист выглядит как ровный фон: если по углам и в центре один и тот
    # же цвет, превью не отрисовалось
    $chk = New-Object System.Drawing.Bitmap $ogTmp
    try {
      $pts = @(@(0.5, 0.25), @(0.5, 0.5), @(0.3, 0.85), @(0.7, 0.85))
      $cols = $pts | ForEach-Object { $chk.GetPixel([int]($chk.Width * $_[0]), [int]($chk.Height * $_[1])).ToArgb() }
    }
    finally { $chk.Dispose() }
    if (@($cols | Select-Object -Unique).Count -lt 2) { throw "Превью $name отрисовалось пустым — сборка остановлена." }

    $src = [System.Drawing.Image]::FromFile($ogTmp)
    try {
      $dst = Resize $src 1200 630
      $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
        Where-Object { $_.MimeType -eq 'image/jpeg' }
      $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
      $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]86)
      $dst.Save((Join-Path $img $name), $codec, $ep)
      $dst.Dispose()
    }
    finally { $src.Dispose() }
    Remove-Item $ogTmp -Force
  }

  Write-Og "$base/tools/og.html" 'og.jpg'
  $written += 'assets/img/og.jpg — превью 1200×630'

  # У английской версии своё превью — с именем латиницей
  $ogEn = Join-Path $img 'og-en.jpg'
  if ($data.english) {
    Write-Og "$base/tools/og.html?lang=en" 'og-en.jpg'
    $written += 'assets/img/og-en.jpg — превью английской версии'
  }
  elseif (Test-Path $ogEn) { Remove-Item $ogEn -Force }

  # Прежняя версия превью была в PNG и весила вчетверо больше
  $legacy = Join-Path $img 'og.png'
  if (Test-Path $legacy) { Remove-Item $legacy -Force; $written += 'assets/img/og.png — удалён, заменён на og.jpg' }

  # --- 4. Содержимое страницы прямо в HTML ----------------------------------
  # Поисковики выполняют скрипты не всегда, а боты нейросетей — почти никогда.
  # Без этого шага они видят пустую страницу с одним заголовком. Берём то,
  # что нарисовал браузер, и вшиваем в index.html; скрипт потом всё равно
  # перерисует страницу из конфига, так что правки видны и до сборки.
  # $must — что обязано быть на странице (ссылки, ряды, работы); его и считаем.
  # $who — откуда видно, чья это страница: имя в шапке или путь с именем.
  function Write-Prerender([string]$url, [string]$path, [string]$must, [string]$who) {
    $dom = Get-Dom $url
    $mMain = [regex]::Match($dom, '(?s)<main class="page"[^>]*>(.*?)</main>')
    $mFoot = [regex]::Match($dom, '(?s)<footer class="footer"[^>]*>(.*?)</footer>')
    if (-not $mMain.Success -or $mMain.Groups[1].Value -notmatch $must -or $mMain.Groups[1].Value -notmatch $who) {
      throw "Страница $url отрисовалась без содержимого или имени — не вшито, сборка остановлена."
    }
    # Служебные задержки анимации в готовом HTML не нужны
    $mainHtml = $mMain.Groups[1].Value -replace '\s*style="--d:\s*\d+ms;?"', ''
    $footHtml = if ($mFoot.Success) { $mFoot.Groups[1].Value } else { '' }

    $html = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $html = [regex]::Replace($html, '(?s)<main class="page"[^>]*>.*?</main>',
      [System.Text.RegularExpressions.MatchEvaluator] { param($mm) '<main class="page" data-static>' + $mainHtml + '</main>' })
    $html = [regex]::Replace($html, '(?s)(<footer class="footer"[^>]*>).*?(</footer>)',
      [System.Text.RegularExpressions.MatchEvaluator] { param($mm) $mm.Groups[1].Value + $footHtml + $mm.Groups[2].Value })
    [System.IO.File]::WriteAllText($path, $html, $utf8)
    return ([regex]::Matches($mainHtml, $must)).Count
  }

  $checks = @{
    home      = @('class="link[ "]',  'class="name"')
    portfolio = @('class="shelf[ "]', 'class="name"')
    category  = @('class="work[ "]',  'class="crumbs')
    work      = @('class="work-page', 'class="crumbs')
  }
  foreach ($p in $pagesBuilt) {
    $c = $checks[$p.kind]
    $n = Write-Prerender "$base$($p.public)" $p.path $c[0] $c[1]
    # Без lang="en" скрипты отрисовали бы её по-русски, а поиск счёл бы дублем
    if ($p.lang -eq 'en') {
      $check = [System.IO.File]::ReadAllText($p.path, [System.Text.Encoding]::UTF8)
      if ($check -notmatch '<html lang="en"') { throw "$($p.rel) вышла без lang=""en"" — сборка остановлена." }
    }
    if ($p.kind -eq 'home') { $written += "$($p.rel) — содержимое вшито, $n ссылок" }
  }
  $deep = @($pagesBuilt | Where-Object { $_.kind -ne 'home' }).Count
  if ($deep) { $written += "портфолио — содержимое вшито в страниц: $deep" }

  # --- 5. Файлы для роботов -------------------------------------------------
  $site = [string]$data.base
  $robots = @('User-agent: *', 'Allow: /',
              '# служебное: заготовки сборки, инструкция и админка', 'Disallow: /tools/', 'Disallow: /README.md',
              'Disallow: /admin/')
  if ($site) { $robots += @('', "Sitemap: $site/sitemap.xml") }
  [System.IO.File]::WriteAllText((Join-Path $root 'robots.txt'), (($robots -join "`n") + "`n"), $utf8)
  $written += 'robots.txt — служебное закрыто от поиска'

  if ($site) {
    $day = Get-Date -Format 'yyyy-MM-dd'
    # Страницы, закрытые от поиска (портфолио без работ), в карту не идут
    $urls = @($pagesBuilt | Where-Object { $_.index } |
              ForEach-Object { "  <url><loc>$site$($_.public)</loc><lastmod>$day</lastmod></url>" })
    $map = (@('<?xml version="1.0" encoding="UTF-8"?>',
              '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">') + $urls + @('</urlset>')) -join "`n"
    [System.IO.File]::WriteAllText((Join-Path $root 'sitemap.xml'), $map + "`n", $utf8)
    $written += 'sitemap.xml — карта сайта для поисковиков'
  }

  [System.IO.File]::WriteAllText((Join-Path $root 'llms.txt'), [string]$data.llms, $utf8)
  $written += 'llms.txt — справка о тебе для нейросетей'
}
finally {
  Stop-Server
}

Write-Host ''
Write-Host 'Сборка готова. Обновлено:'
$written | ForEach-Object { Write-Host "  · $_" }
$notes = @($data.warn) + @($photos.notes) | Where-Object { $_ }
if ($notes.Count) {
  Write-Host ''
  Write-Host 'Обрати внимание:'
  $notes | ForEach-Object { Write-Host "  ! $_" }
}
