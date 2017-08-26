# WordPress Development Base

This bases is meant to help those wanting a more structured approach to developing themes and plugins, it's a 
boilerplate and should be customized to suit each individual project, but at its base it works out of the box for
many scenarios.

## Developing

A wide array of development tools have been built in using [Gulp](http://gulpjs.com/), and there's a set of
[Code Sniffer](https://github.com/squizlabs/PHP_CodeSniffer) rules in `wpcs-ruleset.xml`.

To get started developing, it's recommended you have the following:
- node.js
- NPM
- Composer

Initiate the project by running `composer install` from the project root.

Follow up with `npm install` to get the gulp related packages, you are now ready to get started!

Remember to remove the `.gitignore` file from the various directories when you start using them, only the one in the
project root is needed, the others are there to maintain the folder structure when committing empty directories.

### Configuration

The project comes with a `config.json` file, this contains various options that you may wish to change, and comes
pre-configured with the basics.

- `slug` is your theme or plugin slug, since WordPress expects a nested structure your compressed file for publishing
will put all the code inside a folder with the slug name.

- `zip` is what you wish the name of your archive file to be.

- `dev`

  - `proxy` is the URL BrowserSync will create a wrapper around for injecting or refreshing code.

  - `destination` is the directory (with a trailing directory separator) you wish the development files to go into.
  This option is intentionally there as you may have a test environment set up that does not support symlinks etc.

- `paths`

  - `watch`
  
    - `css` is an array of SASS files or locations to look for in our watcher task.
    
    - `php` is an array of PHP files or locations to look for in our watcher task.
    
  - `css` Should point to our primary SASS file that includes all other files
  
  - `javascript`
  
    - `backend` An array of directories holding back-end related JavaScript that will be combined into *backend.js*
    
    - `frontend` An array of directories holding front-end related JavaScript that will be combined into *`slug`.js*


### Styles

All styles are generated using SASS, and are found in the `assets/scss/` folder. You will need a preprocessor to create
actual CSS rules before publishing anything.

The build tools provided includes both a pre-processor for SASS, as well as an auto-prefixer for browser-specific 
styles, and a minification tool for when something is ready to be published.


### JavaScript

JavaScript is split between front-end, and back-end. Both formats can be found under `assets/js/`.

When a site is published, the files are both merged into two individual singular files, and minified for production.


### PHP Code

The main code for the theme lives in `src/`, this is where everything for your theme or plugin is created, 
just as if no fancy tools were being used at all!


## Tools

As mentioned, we have our own set of build tools created with Gulp that help us during development and deployment.

During development, everything is created nad put into the (by default) `build/` folder, this will contain 
un-minified files for ease of use during development.

It's recommended to use the `watch` process in Gulp, this looks for changes to JavaScript, SASS/CSS and PHP source 
running tasks to keep the development directory up to date while you are working on it.

The `watch` process also initiates `BrowserSync`, which performs browser injections to avoid reloads when possible,
as well as performs actual reloads if source files in `src/` are changed.

When you are ready to release the latest version of your code, run the `publish` Gulp task!
This will create a zip-file in your project root with the code ready for use.


### Gulp tasks

There are many more tasks in Gulp, feel free to look them up, but they're all combined into the features mentioned 
above in one way or another, and most of them don't need to be used manually or by them selves, it's just a personal
preference for keeping things modular.