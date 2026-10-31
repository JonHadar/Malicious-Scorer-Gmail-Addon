function analyzeEmailData(messageId, accessToken) {
  //Connect to Gmail's API for extracting the email
  GmailApp.setCurrentMessageAccessToken(accessToken);
  var message = GmailApp.getMessageById(messageId);
  
  //Extracting raw email data
  var sender = message.getFrom();
  var subject = message.getSubject() || "";
  var attachments = message.getAttachments();
  
  //Extracting the exact domain by using Regex
  var emailRegex = /<([^>]+)>/;
  var match = sender.match(emailRegex);
  var emailAddress = match ? match[1] : sender;
  var domain = emailAddress.indexOf('@') > -1 ? emailAddress.split('@')[1].toLowerCase() : emailAddress;
  
  //Initialize the object that represents the result
  var analysis = {
    score: 0,
    reasons: [],
    senderEmail: emailAddress,
    senderDomain: domain,
    subject: subject,
    verdict: "SAFE"
  };

  //---The rules for determining the maliciousness score of an email---
  
  //Rule 1: the user's blacklist
  var blacklist = getBlacklist();
  if (blacklist.includes(domain)) {
    analysis.score += 100;
    analysis.reasons.push("🚨 Domain '" + domain + "' is on your personal Blacklist.");
  }
  
  //Rule 2: Suspicious keywords in the message subject
  var suspiciousKeywords = ['urgent', 'password', 'invoice', 'action required', 'login'];
  var lowerSubject = subject.toLowerCase();
  
  suspiciousKeywords.forEach(function(keyword) {
    if (lowerSubject.indexOf(keyword) > -1) {
      analysis.score += 25;
      analysis.reasons.push("⚠️ Subject contains suspicious keyword: '" + keyword + "'");
    }
  });
  
  //Rule 3: Suspicious extensions of email attachments
  if (attachments.length > 0) {
    var badExtensions = ['.exe', '.bat', '.js', '.vbs', '.scr', '.jar'];
    attachments.forEach(function(attachment) {
      var fileName = attachment.getName().toLowerCase();
      badExtensions.forEach(function(ext) {
        if (fileName.endsWith(ext)) {
          analysis.score += 40;
          analysis.reasons.push("❌ Dangerous attachment detected: " + fileName);
        }
      });
    });
  }

  //Rule 4: Check the domain by VirusTotal via external API
  var vtMaliciousVotes = checkDomainWithVirusTotal(domain);
  if (vtMaliciousVotes > 0) {
    analysis.score += (vtMaliciousVotes * 15);
    analysis.reasons.push("🌐 VirusTotal Alert: " + vtMaliciousVotes + " security vendors flagged this domain as malicious!");
  } else if (vtMaliciousVotes === 0) {
    analysis.reasons.push("🌐 VirusTotal: Verified clean by global vendors.");
  }

  //Rule 5: Tracking scan history
  var scanCount = recordScan(domain, messageId);
  
  if (scanCount === 1) {
    analysis.score += 5;
    analysis.reasons.push("🆕 First Time Sender: You have never scanned an email from this domain before.");
  } else {
      analysis.reasons.push("🔄 Familiar Sender: You have scanned emails from this domain " + scanCount + " times.");
    
      if (scanCount > 10) {
        analysis.score -= 5;
      }
    }

  //Weighing the final score and determining the verdict
  if (analysis.score >= 70) {
    analysis.verdict = "MALICIOUS";
  } else if (analysis.score >= 30) {
    analysis.verdict = "SUSPICIOUS";
  } else if(analysis.score > 0) {
    analysis.verdict = "SAFE";
  } else if (analysis.score == 0) {
    analysis.reasons.push("✅ No suspicious indicators found.");
  }
  
  //Limiting the maximum score to 100
  analysis.score = Math.min(analysis.score, 100);
  analysis.score = Math.max(analysis.score, 0);

  return analysis;
}