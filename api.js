//The VirusTotal API key is kept in Script Properties (Project Settings > Script Properties), not in the code
const VT_API_KEY = PropertiesService.getScriptProperties().getProperty('VT_API_KEY');

function checkDomainWithVirusTotal(domain) {
  if (!domain) {
  return 0
  }

  //The API endpoint
  var url = 'https://www.virustotal.com/api/v3/domains/' + domain;

  var options = {
    'method': 'get',
    'headers': {
      'x-apikey': VT_API_KEY,
      'Accept': 'application/json'
    },
    'muteHttpExceptions': true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();

    if (responseCode === 200) {
      var json = JSON.parse(response.getContentText());
      
      //Check how many security vendors have defined the domain as malicious
      var maliciousVotes = json.data.attributes.last_analysis_stats.malicious;
      return maliciousVotes;
    } else {
      return -1;
    }
  } catch (e) {
    return -1;
  }
}