const gulp = require("gulp");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const less = require("gulp-less");
const cssnano = require("gulp-cssnano");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const imagemin = require("gulp-imagemin");
const cache = require("gulp-cache");
const kit = require("gulp-kit");
const htmlmin = require("gulp-htmlmin");
const autoprefixer = require("gulp-autoprefixer");
const babel = require("gulp-babel");
const zip = require("gulp-zip");
const del = require("del");

filesPath = {
  sass: "./src/sass/**/*.scss",
  less: "./src/less/styles.less",
  js: "./src/js/**/*.js",
  images: "./src/img/**/*.+(png|jpg|gif|svg)",
  html: "./html/**/*.kit"
}

// Sass

gulp.task("sass", function(done) {
  return (
    gulp
      .src([filesPath.sass, "!./src/sass/widget.scss"])
      // *.scss - all files at the end of the path
      //  **/*.scss - match all files at the end of the path plus all children files and folders
      // !*.scss or !**/*.scss - exclude the matching expressions
      .pipe(sourcemaps.init())
      .pipe(autoprefixer())
      .pipe(sass())
      .pipe(cssnano())
      .pipe(sourcemaps.write("."))
      .pipe(
        rename(function(path) {
          if (!path.extname.endsWith(".map")) {
            path.basename += ".min";
          }
        })
      )
      .pipe(gulp.dest("./dist/css"))
  );
  done();
});

// Less

gulp.task("less", function(done) {
  return gulp
    .src(filesPath.less)
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(cssnano())
    .pipe(sourcemaps.write("."))
    .pipe(rename("./styles.min.css"))
    .pipe(gulp.dest("./dist/css"));
  done();
});

// Javascript

gulp.task("javascript", function(done) {
  return gulp
    .src(["./src/js/alert.js", "./src/js/project.js"])
    .pipe(babel({
      presets: ["@babel/env"]
    }))
    .pipe(concat("project.js"))
    .pipe(uglify())
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(gulp.dest("./dist/js"));
  done();
});

// Images optimization

gulp.task("imagemin", function(done) {
  return (
    gulp.src(filesPath.images)
    .pipe(cache(imagemin()))
    .pipe(gulp.dest("./dist/img/"))
  )
  done();
})

//  HTML kit templating

gulp.task("kit", function(done) {
  return (
    gulp.src(filesPath.html)
      .pipe(kit())
      .pipe(htmlmin({
        collapseWhitespace: true
      }))
      .pipe(gulp.dest("./"))
  )
  done();
})

// Watch task with BrowserSync

gulp.task("watch", function() {
  browserSync.init({
    server: {
      baseDir: "./"
    },
    browser: "firefox developer edition"
  });

  gulp
    .watch(
      [
        filesPath.sass,
        filesPath.html,
        filesPath.less,
        filesPath.js,
        filesPath.images
      ],
      gulp.parallel(["sass", "less", "javascript", "imagemin", "kit"])
    )
    .on("change", browserSync.reload);
});

// Clear cache

gulp.task("clear-cache", function(done) {
  return cache.clearAll(done);
});

// Serve

gulp.task("serve", gulp.parallel(["sass", "less", "javascript", "imagemin", "kit"]));

// Gulp default command

gulp.task("default", gulp.series(["serve", "watch"]));

// Zip project

gulp.task("zip", function(done) {
  return(
    gulp.src(["./**/*", "!./node_modules/**/*"])
    .pipe(zip("project.zip"))
    .pipe(gulp.dest("./"))
  )
  done();
})

// Clean "dist" folder

gulp.task("clean-dist", function(done) {
  return del(["./dist/**/*"]);
    done();
});

