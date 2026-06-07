let catalogo = null;

const telaUpload = document.getElementById("telaUpload");
const app = document.getElementById("app");
const lista = document.getElementById("listaFilmes");
const pesquisa = document.getElementById("pesquisa");

const modal = document.getElementById("modal");
const modalTitulo = document.getElementById("modalTitulo");
const modalLinks = document.getElementById("modalLinks");
const fecharModal = document.getElementById("fecharModal");

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

window.onload = async () => {

    try {

        const resposta = await fetch(
            "filmes.json"
        );

        catalogo =
            await resposta.json();

        iniciar();

    } catch (e) {

        alert(
            "Erro ao carregar filmes.json"
        );

        console.log(e);

    }

};
function iniciar(){

    renderizar(
        catalogo.filmes
    );

}

function renderizar(listaFilmes){

    lista.innerHTML="";

    listaFilmes.forEach(f=>{

        const div =
            document.createElement("div");

        div.className="filme";

        div.innerHTML=`
            <span>${f.titulo}</span>
            <span>❤</span>
        `;

        div.onclick=()=>abrirFilme(f);

        lista.appendChild(div);

    });

}

function abrirFilme(filme){

    if(
        filme.midias.length===1
    ){
        window.open(
            filme.midias[0].url,
            "_blank"
        );
        return;
    }

    modalTitulo.innerText=
        filme.titulo;

    modalLinks.innerHTML="";

    filme.midias.forEach(m=>{

        const a =
            document.createElement("a");

        a.className=
            "linkOpcao";

        a.href=m.url;

        a.target="_blank";

        a.innerText=
            m.titulo || "Abrir";

        modalLinks.appendChild(a);

    });

    modal.style.display="block";
}

fecharModal.onclick=()=>{

    modal.style.display="none";

};

window.onclick=e=>{

    if(
        e.target===modal
    ){
        modal.style.display="none";
    }

};

pesquisa.oninput = () => {

    const txt = normalizar(
        pesquisa.value
    );

    const resultado =
        catalogo.filmes.filter(f =>

            f.tituloBusca.includes(
                txt
            )

        );

    renderizar(
        resultado
    );

};

document
.querySelectorAll("#letras button")
.forEach(btn=>{

    btn.onclick=()=>{

        const letra=
            btn.innerText;

        const resultado=
            catalogo.filmes.filter(f=>

                f.grupo===letra

            );

        renderizar(
            resultado
        );

    };

});
