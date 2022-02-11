let createButton = document.getElementById("requestSummaryButton");
let summaryContainer = document.getElementById("summaryContainer");
let summaryElement = document.getElementById("summaryResultArea");
let summaryTitle = document.getElementById("summaryTitle");
let summaryQuota = document.getElementById("summaryQuota");
let summaryReduced = document.getElementById("summaryReduced");
let loader = document.getElementById("loader");
let optionsButton = document.getElementById("optionsButton");
let errorContainer = document.getElementById("errorContainer");
let informationText = document.getElementById("informationText");
let languageSelectInput = document.getElementById("languageSelectInput");

// <a href="https://www.flaticon.com/free-icons/panda" title="panda icons">Panda icons created by Freepik - Flaticon</a>
let logo = document.getElementById("logoimage");
logo.src = chrome.runtime.getURL("images/logo-tiny.png");
errorContainer.style.display = "none";

let isApiKeySet = false;
var currentLanguage = "english";

// Translate
chrome.storage.sync.get("extensionLanguage", ({ extensionLanguage }) => {
  let lang = "english"
  if(extensionLanguage){
    lang = extensionLanguage;
  }
  currentLanguage = extensionLanguage;
  fetch('./translations/'+lang+'.json').then(response => response.json())
  .then(data => {
    let langDomain = data.popup;
    createButton.textContent = langDomain.summarize;
    document.getElementById("lang_contentlang").textContent = langDomain.content_language;
    languageSelectInput.innerHTML = "";
    for (const [key, value] of Object.entries(langDomain.content_language_list)) {
      languageSelectInput.innerHTML += `<option value="${key}">${value}</option>`
    }
    errorContainer.textContent = langDomain.error_container;
    document.getElementById("lang_contentreduced").textContent = langDomain.content_reduced;
  }).catch(error => console.log(error));
});

// Dirty hack for translating
chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
  var disableButton = () =>{
    console.log("current lang", currentLanguage)
    switch(currentLanguage){
      case "english":
        informationText.innerText = "You cannot use summary-feature in this page."
        break;
      case "turkish":
        informationText.innerText = "Bu özelliği bu sayfada kullanamazsınız."
        break;
      case "french":
        informationText.innerText = "Vous ne pouvez pas utiliser la fonction de résumé dans cette page."
        break;
      case "russian":
        informationText.innerText = "На этой странице нельзя использовать функцию сводки."
        break;
      case "german":
        informationText.innerText = "Auf dieser Seite können Sie die Funktion Zusammenfassung nicht verwenden. "
        break;
      case "portuguese":       
      case "spanish":
        informationText.innerText = "No puede utilizar la función de resumen en esta página."
        break;
      case "italian":
        informationText.innerText = "Non puoi usare la funzione di riepilogo in questa pagina. "
        break;   
    }
    createButton.classList.add("disabled");
  }
  const tabURL = tabs[0].url;
  const mediaRegex = /(http(s?):)([\/|.|\w|\s|-])*\.(?:jpg|jpeg|gif|png|mp3|mp4|ogg|mkv|webp)/g;
  if (!(tabURL.includes("http") ||
    tabURL.includes("https"))) {
      disableButton();
  } else {
    if (tabURL.match(mediaRegex) != null) {
      disableButton();
    }
  }
});


createButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  loader.style.display = "block";
  createButton.classList.add("disabled");
  var documentTitle = tab.title;
  chrome.runtime.sendMessage(
    { taburl: tab.url, type: "FROM_URL", language: languageSelectInput.value },
    responseObjectSeril => {
      const responseObject = JSON.parse(responseObjectSeril);
      if (!responseObject.isSuccess) {
        // Show error.
        loader.style.display = "none";
        errorContainer.style.display = "block";
        return;
      }
      var responseData = responseObject.data;
      summaryContainer.style.display = "block";
      loader.style.display = "none";
      createButton.style.display = "none";
      console.log("Here is the response data", responseData);
      const content = responseData.summary;
      const reduced = responseData.reduced;
      summaryElement.innerText = content;
      summaryTitle.innerText = documentTitle;
      summaryReduced.innerText = reduced + "%";
    }
  );
});


optionsButton.addEventListener('click', async () => {
  chrome.runtime.openOptionsPage();
});
