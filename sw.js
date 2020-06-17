
// imports
importScripts('js/sw-utils.js')


/**
 * Cuando cambie algo en la pagina debo subir estas versiones 
 */
const CACHE_STATIC     = 'static-v4';
const CACHE_DYNAMIC    = 'dynamic-v2';
const CACHE_INMUTABLE  = 'inmutable-v1';

const CACHE_DYNAMIC_LIMIT = 50;

/**
 * Lo que vamos a guardar en el cache, mirar el index y ver que guardar 
 * a mi considecarion, lo que sea parte de mi app
 */
const APP_SHELL = [
    // '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/spiderman.jpg',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js'
]

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
]

// Instalar caches
self.addEventListener('install', e => {

    const cacheStatic = caches.open( CACHE_STATIC )
        .then(cache => cache.addAll( APP_SHELL ))

    const cacheInmutable =  caches.open( CACHE_INMUTABLE )
        .then(cache => cache.addAll( APP_SHELL_INMUTABLE ))

    e.waitUntil( Promise.all( [ cacheStatic, cacheInmutable ]) )
})


self.addEventListener('activate', e => {

    // Borrar los cache anteriores
    const resp = caches.keys().then( keys => {
        
        keys.forEach( key => {

            if( key !== CACHE_STATIC && key.includes('static') ) {

                return caches.delete(key);
            }

            if( key !== CACHE_DYNAMIC && key.includes('dynamic') ) {

                return caches.delete(key);
            }
        })
    })

    e.waitUntil( resp );
});

self.addEventListener('fetch', e => {

    // cache only
    const respuesta = caches.match( e.request ).then( res => {

        if( res ) {

            return res

        } else {
            // recursos nuevos no guardados en mi APP_SHELL
            return fetch( e.request ).then( newRes => {
                return actualizaCacheDinamico( CACHE_DYNAMIC, e.request, newRes )
            })
        }
    })

    e.respondWith(
        respuesta
    );
});