
// https://github.com/matthew-andrews/isomorphic-fetch
// npm install --save isomorphic-fetch es6-promise
require('es6-promise').polyfill();
require('isomorphic-fetch');

// npm i -S unsplash-js
const UnsplashLib = require('./node_modules/unsplash-js/lib/unsplash.js');
const Unsplash    = UnsplashLib.default;
const toJson      = UnsplashLib.toJson;

// npm i -S image-downloader
const download = require('image-downloader')

const fs          = require('fs');
const glob        = require('glob');
const fm 		      = require('front-matter');

//const cachedir    = './unsplash.com-cache';
const cachedir    = './build/unsplash.com';
const content     = '../content/*/**/*.md';

const cachefile   = cachedir +'/cache.json';
//const cacheObj    = require(cachefile);
let cacheObj = {};
try {
  let _cacheObj = require(cachefile);
  console.log('using existing cache.json file');
  cacheObj = _cacheObj;
}catch(e){
  console.log('using empty cache.json file');
};

const unsplash = new Unsplash({
  applicationId: '23cee39261b31a7b6a736ba583a5aaf6a16082f55b913d182d5b231636f987f4',
  secret:        'ada04b832d8159b0a6710858b67785289fa5c591230eb4360c1a5bf5ad44b198'
});

let dl_inprog = 0;
let dl_count  = 0;
let dl_queue  = [];

let cache = [];
glob.sync( cachedir +'/*.jpg', {} ).map( function(filename){
  cache.push( filename.split(/\//g).pop().split('.').shift() );
});
console.log('cache:', cache)


glob.sync('../content/**/*.md', {} ).map( function(contentFilename){
  //console.log('contentFilename', contentFilename);

  let f = fm(fs.readFileSync(contentFilename).toString()).attributes;

  //console.log('f', f);
  if( f.HeaderImage ){
    //console.log('> headerImage:', f.HeaderImage);
    let h = f.HeaderImage.split(/\//g).pop();

    //console.log('>> headerImage:', h);

    // in cache?
    if( cache.indexOf(h) < 0 && dl_queue.indexOf(h) < 0 ){
      console.log('>>> go get ', h );

      dl_queue.push(h);

      unsplash.photos.getPhoto(h)
        .then(toJson)
        .then(json => {
          //console.log(json);
          let customUrl = json.urls.custom; //https://images.unsplash.com/photo-1420578481027-ed20272bbb81?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=&h=&rect=&fit=crop&s=4270ee6591d61107b18efa1d37c2ad27
          customUrl = customUrl.replace('&w=&h=&', '&w=1600&h=900&');
          let entry = {"image":json.id, "name": json.user.name, "link": json.user.links.html, "url":customUrl};
          //console.log('entry', entry);

          //cacheObj.push( entry );
          cacheObj[json.id] = entry;

          dl_inprog++;
          console.log('>>> dl_inprog:', dl_inprog);

          download.image({
            url: customUrl,
            dest: cachedir +'/'+ json.id +'.jpg'
          }).then(({ filename, image }) => {
              console.log('File saved to', filename);
              dl_fn(true);
          }).catch((err) => {
              console.log('downloader ERROR')
              dl_fn(false);
              throw err
          });

      }).catch((err) => {
          console.log('unsplash ERROR')
          throw err
      });

    }else{
      console.log('Already cached:', h, 'from:', contentFilename );
    }

  }
  //console.log('\n')
});

const dl_fn = (ok) => {
  dl_inprog --;
  dl_count++;
  console.log('% dl_inprog:', dl_inprog, 'dl_count:', dl_count);
  if( dl_inprog <= 0 ){
    console.log('Saving');
    console.dir( cacheObj );

    fs.writeFileSync(cachefile, JSON.stringify(cacheObj, null, '\t'));
  }
}
