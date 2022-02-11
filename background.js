let lineCount = 10;
let apiKey = "";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ lineCount, apiKey });
});

chrome.runtime.onMessage.addListener(
  function (request, sender, onSuccess) {
    const language = request.language;
    const reqType = request.type;
    const url = request.taburl;
    var postData = async function (contentUrl, lang, ty) {
      if( !!lang ) lang = "english"
      var promiseFunc = new Promise(function (resolve, reject) {
        chrome.storage.sync.get("lineCount", ({ lineCount }) => {
          resolve(lineCount);
        })
      });
      var storedLinecount = await promiseFunc;
      if (!isNaN(storedLinecount))
        lineCount = storedLinecount;
      var apiurl = "USE YOUR BACKEND";
      var data = {
        "type": ty,
        "url": contentUrl,
        "language": lang,
        "sentence_count": lineCount
      }
      const response = await fetch(apiurl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return response.json();
    };
    postData(url, language, reqType ).then(data => {
      onSuccess(JSON.stringify({ isSuccess: true, data: data }));
    }).catch(err => {
      console.error("Error!", err);
      onSuccess(JSON.stringify({ isSuccess: false, error: err }));
    });
    return true;
  }
);
