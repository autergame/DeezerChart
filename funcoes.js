async function pesquisar() {
	let Usuario = document.getElementById("txtUsuario").value;

	if (Usuario.length == 0) {
		alert("Fill all fields!");
		return;
	}

	window.localStorage.setItem("Usuario", Usuario);

	let deezerProcurarUsuario = await solictar(deezerApiSite + "/search/user?q=" + Usuario);
	let deezerUsuarioChart = await solictar(deezerApiSite + "/user/" + deezerProcurarUsuario.data[0].id + "/charts");

	deezerUsuarioChartPosicao = 1;
	deezerUsuarioChartNext = deezerUsuarioChart.next;

	let dDiv = document.querySelector(".dDiv");
	while (dDiv.firstChild) {
		dDiv.removeChild(dDiv.firstChild);
	}

	let ntTbody = criarTabela(dDiv);
	carregarNaTabela(dDiv, ntTbody, deezerUsuarioChart, true);
}

function solictar(url) {
	return new Promise(function (resolve, reject) {
		let request = new XMLHttpRequest();
		request.onload = function () {
			if (request.status == 200) {
				resolve(JSON.parse(request.responseText));
			} else {
				reject("Status code: " + request.status + " -> Meaning: https://developers.deezer.com/api/errors" + "\n" + request.responseText);
			}
		}
		request.open("GET", url, true);
		request.send();
	});
}

function criarTabela(dDiv) {
	let ntTable = document.createElement("table");
	ntTable.className = "ntTable";

	let ntTr = document.createElement("tr");

	let ntThPosicao = document.createElement("th");
	ntThPosicao.textContent = "#";
	ntTr.appendChild(ntThPosicao);

	let ntThTitulo = document.createElement("th");
	ntThTitulo.textContent = "Title";
	ntTr.appendChild(ntThTitulo);

	let ntThArtista = document.createElement("th");
	ntThArtista.textContent = "Artist";
	ntTr.appendChild(ntThArtista);

	let ntThRank = document.createElement("th");
	ntThRank.textContent = "Rank";
	ntTr.appendChild(ntThRank);

	let ntThead = document.createElement("thead");
	ntThead.appendChild(ntTr);

	ntTable.appendChild(ntThead);

	let ntTbody = document.createElement("tbody");
	ntTable.appendChild(ntTbody);

	let ntDiv = document.createElement("Div");
	ntDiv.className = "ntDiv";
	ntDiv.appendChild(ntTable);

	dDiv.appendChild(ntDiv);

	return ntTbody;
}

function carregarNaTabela(dDiv, ntTbody, deezerUsuarioChart, criarBotao) {
	for (let i = 0; i < deezerUsuarioChart.data.length; i++) {
		let tr = document.createElement("tr");

		let tdPosicao = document.createElement("td");
		tdPosicao.textContent = deezerUsuarioChartPosicao++;
		tr.appendChild(tdPosicao);

		let tdTitle = document.createElement("td");
		tdTitle.textContent = deezerUsuarioChart.data[i].title;
		tdTitle.style.width = "300px";
		tdTitle.style.wordBreak = "break-word";
		tr.appendChild(tdTitle);

		let tdArtist = document.createElement("td");
		tdArtist.textContent = deezerUsuarioChart.data[i].artist.name;
		tdArtist.style.width = "100px";
		tdArtist.style.wordBreak = "break-word";
		tr.appendChild(tdArtist);

		let tdRank = document.createElement("td");
		tdRank.textContent = deezerUsuarioChart.data[i].rank;
		tr.appendChild(tdRank);

		ntTbody.appendChild(tr);
	}

	let bButton = document.querySelector(".bButton");
	if (bButton) {
		bButton.parentNode.removeChild(bButton);
	}

	if (criarBotao) {
		let dButton = document.createElement("button");
		dButton.className = "bButton";
		dButton.textContent = "Show more";
		dButton.onclick = function () { carregarMais(dDiv, ntTbody) };

		let bDiv = document.createElement("Div");
		bDiv.className = "bDiv";
		bDiv.appendChild(dButton);

		dDiv.childNodes[0].appendChild(bDiv);
	}
}

async function carregarMais(dDiv, ntTbody) {
	let deezerUsuarioChart = await solictar(deezerUsuarioChartNext);
	deezerUsuarioChartNext = deezerUsuarioChart.next;

	carregarNaTabela(dDiv, ntTbody, deezerUsuarioChart, deezerUsuarioChartNext != undefined);

}

let deezerUsuarioChartNext = "";
let deezerUsuarioChartPosicao = 1;
let deezerApiSite = "https://api.deezer.com";