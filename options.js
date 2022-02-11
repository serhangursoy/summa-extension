let maxlinecount = document.getElementById("maxlinecount");
let saveButton = document.getElementById("requestSummaryButton");
let logo = document.getElementById("logoimage");
let langDropdown = document.getElementById("lang_supportedextlanguages");
logo.src = chrome.runtime.getURL("images/logo-tiny.png");
let successText = document.getElementById("successMessage");
successText.style.visibility = "hidden";
let apiKey = "";
let lineCount = 10;
const MAX_LINE_VALUE = 20;

/* Helper Function */
function ChangeTranslations(lang){
  fetch('./translations/'+lang+'.json').then(response => response.json())
  .then(data => {
    let langDomain = data.options;
    document.getElementById("lang_settings").textContent = langDomain.settings;
    document.getElementById("lang_langlabel").textContent = langDomain.language;
    
    langDropdown.innerHTML = "";
    for (const [key, value] of Object.entries(langDomain.supported_language_list)) {
      langDropdown.innerHTML += `<option value="${key}">${value}</option>`
    }
    saveButton.textContent = langDomain.save;
    document.getElementById("lang_successnotif").textContent = langDomain.save_info;
    document.getElementById("lang_numbersentence").textContent = langDomain.return_count;

    for (var i = 0; i < langDropdown.options.length; i++) {
      if (langDropdown.options[i].value== lang) {
        langDropdown.options[i].selected = true;
        return;
      }
    }

  }).catch(error => console.log(error));
}

// Get extension language and change translations accordingly.
chrome.storage.sync.get("extensionLanguage", ({ extensionLanguage, lineCount }) => {
  let lang = "english"
  if(extensionLanguage){
    lang = extensionLanguage;
  }
  ChangeTranslations(lang);
});
// Read and set line count set by user.
chrome.storage.sync.get("lineCount", ({ lineCount }) => {
  if( lineCount ){
    maxlinecount.value = lineCount;
   }
});

/* Event Listeners */
/***********************************/
maxlinecount.addEventListener("input", NumberCheck);
function NumberCheck(){
  let value = maxlinecount.value;
  if(isNaN(value)){
    maxlinecount.value = lineCount;
  } else {
    value = parseInt(value);
    if(value > MAX_LINE_VALUE){
      maxlinecount.value = MAX_LINE_VALUE;
    }
    if( value < 2){
      maxlinecount.value = 2;
    }
  }
}

saveButton.addEventListener("click", SaveSettings);
function SaveSettings() {
  lineCount = parseInt(maxlinecount.value);
  chrome.storage.sync.set({ apiKey, lineCount });
  successText.style.visibility = "visible";
  successText.style.opacity = 1;
  setTimeout( () => { 
    successText.style.visibility = "hidden";
    successText.style.opacity = 0;
   }, 3000 )
}

langDropdown.addEventListener("change", OnLanguageChange);
function OnLanguageChange(){
  let extensionLanguage = langDropdown.value;
  ChangeTranslations(extensionLanguage);
  chrome.storage.sync.set({ extensionLanguage });
}