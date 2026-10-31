const BLACKLIST_KEY = 'USER_BLACKLIST';
const HISTORY_KEY_PREFIX = 'SCAN_HISTORY_';

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

function recordScan(domain) {
  var userProperties = PropertiesService.getUserProperties();
  var key = HISTORY_KEY_PREFIX + domain;
  
  var count = userProperties.getProperty(key);
  
  count = count ? parseInt(count) + 1 : 1;
  
  userProperties.setProperty(key, count.toString());
  
  return count;
}