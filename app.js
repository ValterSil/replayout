let catalogo = null;

const lista = document.getElementById("listaFilmes");
const pesquisa = document.getElementById("pesquisa");
const btnFavoritos = document.getElementById("btnFavoritos");

const modal = document.getElementById("modal");
const modalTitulo = document.getElementById("modalTitulo");
const modalLinks = document.getElementById("modalLinks");
const fecharModal = document.getElementById("fecharModal");

let favoritos =
    JSON.parse(localStorage.getItem("favoritos")) || [];

let modoFavoritos = false;

/* ---------------- UTIL ---------------- */

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/* ---------------- CARREGAR DADOS ---------------- */

window.onload = async () => {
    try {
        const resposta = await fetch("filmes.json");
        catalogo = await resposta.json();
        renderizar(catalogo.filmes);
    } catch (e) {
        alert("Erro ao carregar filmes.json");
        console.log(e);
    }
};

/* ---------------- RENDER ---------------- */

function renderizar(listaFilmes) {

    lista.innerHTML = "";

    listaFilmes.forEach(f => {

        const ehFavorito = favoritos.includes(f.id);

        const div = document.createElement("div");
        div.className = "filme";

        div.innerHTML = `
            <span>${f.titulo}</span>
            <span class="favorito">
                ${ehFavorito ? "❤️" : "🤍"}
            </span>
        `;

        div.onclick = () => abrirFilme(f);

        const coracao = div.querySelector(".favorito");

        coracao.onclick = (e) => {
            e.stopPropagation();

            if (favoritos.includes(f.id)) {
                favoritos = favoritos.filter(id => id !== f.id);
            } else {
                favoritos.push(f.id);
            }

            localStorage.setItem("favoritos", JSON.stringify(favoritos));

            atualizarTela();
        };

        lista.appendChild(div);
    });
}

/* ---------------- FAVORITOS ---------------- */

function toggleFavoritos() {

    modoFavoritos = !modoFavoritos;

    btnFavoritos.innerText =
        modoFavoritos ? "🎬 Todos" : "❤ Favoritos";

    atualizarTela();
}

function atualizarTela() {

    let listaAtual = catalogo.filmes;

    if (modoFavoritos) {
        listaAtual = catalogo.filmes.filter(f =>
            favoritos.includes(f.id)
        );
    }

    renderizar(listaAtual);
}

/* ---------------- BUSCA ---------------- */

pesquisa.oninput = () => {

    const txt = normalizar(pesquisa.value);

    let listaFiltrada = catalogo.filmes;

    if (modoFavoritos) {
        listaFiltrada = listaFiltrada.filter(f =>
            favoritos.includes(f.id)
        );
    }

    listaFiltrada = listaFiltrada.filter(f =>
        normalizar(f.tituloBusca).includes(txt)
    );

    renderizar(listaFiltrada);
};

/* ---------------- LETRAS ---------------- */

document.querySelectorAll("#letras button")
.forEach(btn => {

    btn.onclick = () => {

        const letra = btn.innerText;

        let listaFiltrada = catalogo.filmes;

        if (modoFavoritos) {
            listaFiltrada = listaFiltrada.filter(f =>
                favoritos.includes(f.id)
            );
        }

        listaFiltrada = listaFiltrada.filter(f =>
            f.grupo === letra
        );

        renderizar(listaFiltrada);
    };

});

/* ---------------- BOTÃO FAVORITOS ---------------- */

btnFavoritos.onclick = toggleFavoritos;

/* ---------------- MODAL ---------------- */

function abrirFilme(filme) {

    if (filme.midias.length === 1) {
        window.open(filme.midias[0].url, "_blank");
        return;
    }

    modalTitulo.innerText = filme.titulo;

    modalLinks.innerHTML = "";

    filme.midias.forEach(m => {

        const a = document.createElement("a");
        a.className = "linkOpcao";
        a.href = m.url;
        a.target = "_blank";
        a.innerText = m.titulo || "Abrir";

        modalLinks.appendChild(a);
    });

    modal.style.display = "block";
}

fecharModal.onclick = () => {
    modal.style.display = "none";
};

window.onclick = e => {
    if (e.target === modal) {
        modal.style.display = "none";
    }

};

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}