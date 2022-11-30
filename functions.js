async function submit() {
	let ID = document.getElementById("txtID").value;
	let radioID = document.getElementById("radioID").checked;
	let Username = document.getElementById("txtUsername").value;
	let radioUsername = document.getElementById("radioUsername").checked;

	window.localStorage.setItem("ID", ID);
	window.localStorage.setItem("RadioID", radioID);
	window.localStorage.setItem("Username", Username);
	window.localStorage.setItem("RadioUsername", radioUsername);

	if (radioID && (ID.length > 0)) {
		await loadUserChart(ID);
	}
	else if (radioUsername && (Username.length > 0)) {
		let deezerUserID = await request(deezerProxy(deezerApi + "/search/user?q=" + Username), "Searching ID from username");
		if (deezerUserID != undefined) {
			if (deezerUserID.total != 0) {
				await loadUserChart(deezerUserID.data[0].id);
			}
			else {
				alert("Username not found!");
			}
		}
	}
	else {
		alert("Check and Fill one of the fields!");
	}
}

async function loadUserChart(id) {
	let deezerUserChart = await request(deezerProxy(deezerApi + "/user/" + id + "/charts/tracks"), "Getting charts tracks");
	if (deezerUserChart != undefined) {
		deezerUserChartPosition = 1;
		deezerUserChartNext = deezerUserChart.next;

		let dDiv = document.querySelector(".dDiv");
		while (dDiv.firstChild) {
			dDiv.removeChild(dDiv.firstChild);
		}

		let ntTbody = createTable(dDiv);
		loadInTable(dDiv, ntTbody, deezerUserChart, true);
	}
	else {
		alert("User chart or ID not found!");
	}
}

async function request(url, message) {
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
				"Response text: " + xhr.responseText
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

function createTable(dDiv) {
	let ntTable = document.createElement("table");
	ntTable.className = "ntTable";

	let ntTr = document.createElement("tr");

	let ntThPosition = document.createElement("th");
	ntThPosition.textContent = "#";
	ntTr.appendChild(ntThPosition);

	let ntThTitle = document.createElement("th");
	ntThTitle.textContent = "Title";
	ntTr.appendChild(ntThTitle);

	let ntThArtist = document.createElement("th");
	ntThArtist.textContent = "Artist";
	ntTr.appendChild(ntThArtist);

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

function loadInTable(dDiv, ntTbody, deezerUserChart) {
	for (let i = 0; i < deezerUserChart.data.length; i++) {
		let tr = document.createElement("tr");

		let tdPosition = document.createElement("td");
		tdPosition.textContent = deezerUserChartPosition++;
		tr.appendChild(tdPosition);

		let tdTitle = document.createElement("td");
		tdTitle.textContent = deezerUserChart.data[i].title;
		tdTitle.style.maxWidth = "300px";
		tdTitle.style.wordBreak = "break-word";
		tr.appendChild(tdTitle);

		let tdArtist = document.createElement("td");
		tdArtist.textContent = deezerUserChart.data[i].artist.name;
		tdArtist.style.maxWidth = "150px";
		tdArtist.style.wordBreak = "break-word";
		tr.appendChild(tdArtist);

		let tdRank = document.createElement("td");
		tdRank.textContent = deezerUserChart.data[i].rank;
		tr.appendChild(tdRank);

		ntTbody.appendChild(tr);
	}

	let bButton = document.querySelector(".bButton");
	if (bButton) {
		bButton.parentNode.removeChild(bButton);
	}

	if (deezerUserChart.next != undefined) {
		let dButton = document.createElement("button");
		dButton.className = "bButton";
		dButton.textContent = "Show more";
		dButton.onclick = function () { showMore(dDiv, ntTbody) };

		let bDiv = document.createElement("Div");
		bDiv.className = "bDiv";
		bDiv.appendChild(dButton);

		dDiv.childNodes[0].appendChild(bDiv);
	}
}

async function showMore(dDiv, ntTbody) {
	let deezerUserChart = await request(deezerProxy(deezerUserChartNext), "Loading more charts");
	if (deezerUserChart != undefined) {
		deezerUserChartNext = deezerUserChart.next;
		loadInTable(dDiv, ntTbody, deezerUserChart);
	}
}

function deezerProxy(url) {
	return "https://api.codetabs.com/v1/proxy/?quest=" + url;
}

let deezerUserChartNext = "";
let deezerUserChartPosition = 1;

let deezerApi = "https://api.deezer.com";
