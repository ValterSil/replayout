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
/* ---------------- MENSAGEM INICIAL ---------------- */
function mostrarMensagemInicial() {
    lista.innerHTML = `
        <div style="text-align: center; margin-top: 60px; color: #666;">
            <h2 style="font-size: 50px; margin-bottom: 15px;">🍿</h2>
            <h3>O que vamos assistir hoje?</h3>
            <p style="margin-top: 10px; font-size: 16px;">Use a barra de pesquisa ou as letras acima para explorar o catálogo.</p>
        </div>
    `;
}
/* ---------------- CARREGAR DADOS ---------------- */
window.onload = async () => {
    try {
        const resposta = await fetch("filmes.json");
        catalogo = await resposta.json();
        
        // Em vez de renderizar tudo, mostra a mensagem inicial
        mostrarMensagemInicial();

    } catch (e) {
        alert("Erro ao carregar filmes.json. Certifique-se de rodar o script Python primeiro!");
        console.log(e);
    }
};

/* ---------------- RENDER ---------------- */

function renderizar(listaFilmes) {

    lista.innerHTML = "";

    // O fragmento cria uma "tela invisível" na memória.
    const fragmento = document.createDocumentFragment();

    // TRAVA DE SEGURANÇA: Limita a exibição aos 50 primeiros filmes
    const limite = 50;
    const filmesParaMostrar = listaFilmes.slice(0, limite);

    filmesParaMostrar.forEach(f => {

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

        // Adiciona o filme no fragmento invisível
        fragmento.appendChild(div);
    });

    // Joga os filmes (no máximo 50) na tela de uma única vez
    lista.appendChild(fragmento);

    // MENSAGEM EXTRA: Se houver mais filmes do que o limite, avisa o usuário
    if (listaFilmes.length > limite) {
        const aviso = document.createElement("div");
        aviso.style.textAlign = "center";
        aviso.style.padding = "20px";
        aviso.style.color = "#aaa";
        aviso.style.fontSize = "14px";
        aviso.innerText = `Mostrando 50 de ${listaFilmes.length} resultados. Continue digitando para filtrar.`;
        lista.appendChild(aviso);
    }
}

/* ---------------- BUSCA (COM DEBOUNCE) ---------------- */

let timerBusca; // Variável para controlar o tempo

pesquisa.oninput = () => {

    // Cancela a busca anterior se a pessoa ainda estiver digitando
    clearTimeout(timerBusca);

    // Aguarda 300 milissegundos após a última letra para iniciar a busca
    timerBusca = setTimeout(() => {
        
        const txt = normalizar(pesquisa.value);
        let listaFiltrada = catalogo.filmes;

        if (modoFavoritos) {
            listaFiltrada = listaFiltrada.filter(f =>
                favoritos.includes(f.id)
            );
        }

        listaFiltrada = listaFiltrada.filter(f =>
            // Removido o normalizar() daqui! O JSON já tem isso pronto.
            f.tituloBusca.includes(txt)
        );

        renderizar(listaFiltrada);

    }, 300); 
};

/* ---------------- FAVORITOS ---------------- */

function toggleFavoritos() {

    modoFavoritos = !modoFavoritos;

    btnFavoritos.innerText =
        modoFavoritos ? "🎬 Todos" : "❤ Favoritos";

    atualizarTela();
}

function atualizarTela() {
    if (modoFavoritos) {
        let listaAtual = catalogo.filmes.filter(f => favoritos.includes(f.id));
        renderizar(listaAtual);
    } else {
        // Se desativou os favoritos, limpa a busca e volta para a tela inicial
        pesquisa.value = "";
        mostrarMensagemInicial();
    }
}

/* ---------------- BUSCA ---------------- */

/* ---------------- BUSCA (COM DEBOUNCE) ---------------- */
let timeoutBusca; 

pesquisa.oninput = () => {
    clearTimeout(timeoutBusca);

    timeoutBusca = setTimeout(() => {
        const txt = normalizar(pesquisa.value);

        // Se o texto estiver vazio e NÃO estiver nos favoritos, mostra a tela inicial
        if (txt === "" && !modoFavoritos) {
            mostrarMensagemInicial();
            return; // Para a execução da função aqui
        }

        let listaFiltrada = catalogo.filmes;

        if (modoFavoritos) {
            listaFiltrada = listaFiltrada.filter(f => favoritos.includes(f.id));
        }

        if (txt !== "") {
            listaFiltrada = listaFiltrada.filter(f => f.tituloBusca.includes(txt));
        }

        renderizar(listaFiltrada);
    }, 300); 
};

/* ---------------- FILTRO DE LETRAS ---------------- */
document.querySelectorAll("#letras button").forEach(btn => {
    btn.onclick = () => {
        pesquisa.value = ""; // Limpa a barra de pesquisa visualmente
        
        const letra = btn.innerText;
        let listaFiltrada = catalogo.filmes;

        if (modoFavoritos) {
            listaFiltrada = listaFiltrada.filter(f => favoritos.includes(f.id));
        }

        listaFiltrada = listaFiltrada.filter(f => f.grupo === letra);
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
    // Troque "sw.js" por "service-worker.js"
    navigator.serviceWorker.register("service-worker.js")
        .then(() => console.log("Service Worker registrado com sucesso!"))
        .catch(err => console.error("Erro ao registrar SW:", err));
}