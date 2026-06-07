const CACHE = "replayout-v1";

const arquivos = [

    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./filmes.json",
    "./icon-192.png",
    "./icon-512.png"

];

self.addEventListener(
    "install",
    e => {

        e.waitUntil(

            caches.open(CACHE)
            .then(cache => {

                return cache.addAll(
                    arquivos
                );

            })

        );

    }
);

self.addEventListener(
    "fetch",
    e => {

        e.respondWith(

            caches.match(
                e.request
            ).then(resp => {

                return (
                    resp ||
                    fetch(e.request)
                );

            })

        );

    }
);