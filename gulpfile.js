const {src, dest, series, watch} = require('gulp')
// Очищение папки
const del = require('del')
// Соединение несколькиз файлов в один
const concat = require('gulp-concat');
// Для того, чтобы поднять сервер и автоматически обновлять билд папку
const sync = require('browser-sync').create()

// *html 
// Для возможности в html добавлять компоненты и части
const include = require('gulp-file-include')
// минификация html
const htmlmin = require('gulp-htmlmin')
// Преобразовывает картинки в html в формат webp
const webphtml = require('gulp-webp-html')

// * css
// Преобразование sass в css
const sass = require('gulp-sass')(require('sass'));
// Добавление автопрефиксов
const autoprefixer = require('gulp-autoprefixer')
// Сжатие css
const csso = require('gulp-csso')

// * js
// Минификация js
const uglify = require('gulp-uglify')

// * img
// Сжатие
const imagemin = require('gulp-image')
// Преобразует jpb, png в webp
const webp = require('gulp-webp');


function html() {
  // так указываем какие фалы этой задачей мы хотим обрабатывать
  // src возвращает стрим? с методом pipe, куда можно прописать модули, которые будут добавлять доп функционал
  return src('src/**.html')
    // include - соединить файлы
    // prefix - каким символом подключать части в html
    .pipe(include({
      prefix: '@@'
    }))
    .pipe(htmlmin({
      // Убираем пробелы
      collapseWhitespace: true
    }))
    .pipe(webphtml())
    // dest - переносит этот стрим в конечную папку в указанный файл
    .pipe(dest('dist'))
}

function scss() {
  return src('src/scss/**.scss')
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(csso())
    // Соединяем несколко файлов в один (в index.css)
    .pipe(concat('index.css'))
    .pipe(dest('dist'))
}

function scripts() {
  return src('src/js/**.js')
    .pipe(concat('index.js'))
    // минификация
    .pipe(uglify({
      toplevel: true
    }))
    .pipe(dest('dist'))
}

function image() {
  // Все файлы в папке - /**
  return src('src/assets/image/**')
    .pipe(imagemin())
    .pipe(webp())
    .pipe(dest('dist/img'))
}

// Очищение папки перед каждой сборкой
function clear() {
  return del('dist')
}

function serve() {
  // Организовали сервер
  sync.init({
    server: './dist'
  })

  // Следим за html файлами и если там что-то меняется, выполняем функцию из второго параметра
  watch('src/**.html', series(html)).on('change', sync.reload)
  watch('src/scss/**.scss', series(scss)).on('change', sync.reload)
  watch('src/js/**.js', series(scripts)).on('change', sync.reload)
  watch('src/assets/image/**', series(image)).on('change', sync.reload)
}

// Теперь чтобы харегистрировать задачу, которую мы создали, нужно ее экспортировать для галпа
// чЧтобы запустить задачу - gulp html
// exports.html = html
// exports.scss = scss
// series - чтобы последовательно вызывать задачи
exports.build = series(clear, scss, html, scripts, image)
exports.serve = series(clear, scss, html, scripts, image, serve)
exports.clear = clear
