async function pesquisar() {
	let ID = document.getElementById("txtID").value;
	let radioID = document.getElementById("radioID").checked;
	let Usuario = document.getElementById("txtUsuario").value;
	let radioUsuario = document.getElementById("radioUsuario").checked;

	window.localStorage.setItem("ID", ID);
	window.localStorage.setItem("RadioID", radioID);
	window.localStorage.setItem("Usuario", Usuario);
	window.localStorage.setItem("RadioUsuario", radioUsuario);

	if (radioUsuario && (Usuario.length > 0)) {
		let deezerUsuarioID = await solicitar(deezerProxy(deezerApiSite + "/search/user?q=" + Usuario), "Searching username");
		if (deezerUsuarioID != undefined) {
			if (deezerUsuarioID.total != 0) {
				await solicitarUsuarioChart(deezerUsuarioID.data[0].id);
			}
			else {
				alert("Username not found!");
			}
		}
	}
	else if (radioID && (ID.length > 0)) {
		await solicitarUsuarioChart(ID);
	}
	else {
		alert("Check and Fill one of the fields!");
	}
}

async function solicitarUsuarioChart(id) {
	let deezerUsuarioChart = await solicitar(deezerProxy(deezerApiSite + "/user/" + id + "/charts"), "Getting charts");
	if (deezerUsuarioChart != undefined) {
		deezerUsuarioChartPosicao = 1;
		deezerUsuarioChartNext = deezerUsuarioChart.next;

		let dDiv = document.querySelector(".dDiv");
		while (dDiv.firstChild) {
			dDiv.removeChild(dDiv.firstChild);
		}

		let ntTbody = criarTabela(dDiv);
		carregarNaTabela(dDiv, ntTbody, deezerUsuarioChart, true);
	}
	else {
		alert("User chart or ID not found!");
	}
}

async function solicitar(url, message) {
	let loader = document.getElementById("loader");
	let loaderText = document.getElementById("loaderText");

	loader.style.display = "block";
	loaderText.style.display = "block";
	loaderText.innerText = "Wait: " + message;

	let promiseReturn = await new Promise(function (resolve) {
		let xhr = new XMLHttpRequest();
		xhr.onload = function () {
			if (xhr.status == 200) {
				let jsonParsed = JSON.parse(xhr.responseText);
				if (jsonParsed.error != undefined) {
					alert(JSON.stringify(jsonParsed, null, " "));
					resolve(undefined);
				}
				else {
					resolve(jsonParsed);
				}
			}
			else {
				alert(
					"Status code: " + xhr.status + "\n" +
					"Status text: " + xhr.statusText + "\n" +
					"Response text: " + xhr.responseText
				);
				resolve(undefined);
			}
		}
		xhr.onerror = function () {
			alert(
				"Status code: " + xhr.status + "\n" +
				"Status text: " + xhr.statusText + "\n" +
				"Response text: " + hr.responseText
			);
			resolve(undefined);
		};
		xhr.open("GET", url, true);
		xhr.send();
	});

	loader.style.display = "none";
	loaderText.style.display = "none";

	return promiseReturn;
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

function carregarNaTabela(dDiv, ntTbody, deezerUsuarioChart) {
	for (let i = 0; i < deezerUsuarioChart.data.length; i++) {
		let tr = document.createElement("tr");

		let tdPosicao = document.createElement("td");
		tdPosicao.textContent = deezerUsuarioChartPosicao++;
		tr.appendChild(tdPosicao);

		let tdTitle = document.createElement("td");
		tdTitle.textContent = deezerUsuarioChart.data[i].title;
		tdTitle.style.maxWidth = "300px";
		tdTitle.style.wordBreak = "break-word";
		tr.appendChild(tdTitle);

		let tdArtist = document.createElement("td");
		tdArtist.textContent = deezerUsuarioChart.data[i].artist.name;
		tdArtist.style.maxWidth = "150px";
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

	if (deezerUsuarioChart.next != undefined) {
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
	let deezerUsuarioChart = await solicitar(deezerProxy(deezerUsuarioChartNext), "Loading more charts");
	if (deezerUsuarioChart != undefined) {
		deezerUsuarioChartNext = deezerUsuarioChart.next;
		carregarNaTabela(dDiv, ntTbody, deezerUsuarioChart);
	}
}

function deezerProxy(url) {
	return "https://api.codetabs.com/v1/proxy/?quest=" + url;
}

let deezerUsuarioChartNext = "";
let deezerUsuarioChartPosicao = 1;

let deezerApiSite = "https://api.deezer.com";
