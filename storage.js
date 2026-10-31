const BLACKLIST_KEY = 'USER_BLACKLIST';
const HISTORY_KEY_PREFIX = 'SCAN_HISTORY_';
const MAX_REMEMBERED_MESSAGES = 100;

function getBlacklist() {
  var userProperties = PropertiesService.getUserProperties();
  var data = userProperties.getProperty(BLACKLIST_KEY);

  return data ? JSON.parse(data) : [];
}

function addToBlacklist(domain) {
  if (!domain) return;
  
  var list = getBlacklist();
  var cleanDomain = domain.toLowerCase().trim();
  
  if (!list.includes(cleanDomain)) {
    list.push(cleanDomain);
    PropertiesService.getUserProperties().setProperty(BLACKLIST_KEY, JSON.stringify(list));
  }
  
  return list;
}

function removeFromBlacklist(domain) {
  if (!domain) return;
  
  var list = getBlacklist();
  var cleanDomain = domain.toLowerCase().trim();
  
  list = list.filter(function(d) {
    return d !== cleanDomain;
  });
  
  PropertiesService.getUserProperties().setProperty(BLACKLIST_KEY, JSON.stringify(list));
  return list;
}

//Records a scan of an email from the domain and returns how many different emails from it were scanned.
//Each email is counted once, so reopening the same email or pressing Refresh does not change the count.
function recordScan(domain, messageId) {
  var userProperties = PropertiesService.getUserProperties();
  var key = HISTORY_KEY_PREFIX + domain;
  
  var stored = userProperties.getProperty(key);
  var history = { count: 0, messageIds: [] };
  
  if (stored) {
    //Earlier versions stored only a number
    history = isNaN(stored) ? JSON.parse(stored) : { count: parseInt(stored), messageIds: [] };
  }
  
  if (history.messageIds.indexOf(messageId) === -1) {
    history.count++;
    history.messageIds.push(messageId);
    
    //Remember only the most recent emails, so the stored value stays small
    if (history.messageIds.length > MAX_REMEMBERED_MESSAGES) {
      history.messageIds.shift();
    }
    
    userProperties.setProperty(key, JSON.stringify(history));
  }
  
  return history.count;
}