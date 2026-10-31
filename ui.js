//Build the main UI on the basis of the Gmail's event object
function buildMainCard(e) {
  //Extracting the object's data
  var messageId = e.messageMetadata.messageId;
  var accessToken = e.messageMetadata.accessToken;

  //Running the email malware rating engine
  var analysis = analyzeEmailData(messageId, accessToken);

  //Creating the UI panel
  var card = CardService.newCardBuilder();

  //Building the title of the panel with the verdict
  var verdictText = analysis.verdict;
  if (verdictText === "MALICIOUS") { 
    verdictText = "🔴 " + verdictText
  } else if (verdictText === "SUSPICIOUS") {
  verdictText = "🟠 " + verdictText 
  } else if (verdictText === "SAFE" && analysis.score > 0) {
    verdictText = "🟡 " + verdictText;
  } else {
    verdictText = "🟢 CLEAN"; 
  }

  card.setHeader(CardService.newCardHeader()
      .setTitle("Scan Result: " + verdictText)
      .setSubtitle("Risk Score: " + analysis.score + " / 100"));

  //Email sender details
  var infoSection = CardService.newCardSection().setHeader("Email Details");
  
  infoSection.addWidget(CardService.newDecoratedText()
    .setTopLabel("Sender Domain")
    .setText(analysis.senderDomain) 
    .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.EMAIL)));

  //The explanation for the malicious rating received for the email
  var explainSection = CardService.newCardSection().setHeader("Analysis Reasons");
  
  analysis.reasons.forEach(function(reason) {
    explainSection.addWidget(CardService.newTextParagraph().setText(reason));
  });

  //Creating a user action menu
  var actionSection = CardService.newCardSection();
  
  //A trigger button that will activate the function "buildSettingsCard"
  var settingsAction = CardService.newAction().setFunctionName("buildSettingsCard");
  
  var settingsButton = CardService.newTextButton()
      .setText("⚙️ Manage Blacklist")
      .setOnClickAction(settingsAction);

  var refreshAction = CardService.newAction().setFunctionName("onRefreshClick");
  var refreshButton = CardService.newTextButton()
      .setText("🔄 Refresh Score")
      .setOnClickAction(refreshAction);    
      
  actionSection.addWidget(CardService.newButtonSet()
      .addButton(refreshButton)
      .addButton(settingsButton));

  //Connecting all parts to the main UI panel
  card.addSection(infoSection);
  card.addSection(explainSection);
  card.addSection(actionSection);

  return card.build();
}

//Build the user settings card
function buildSettingsCard(e) {
  var card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle("⚙️ Manage Blacklist"));

  //Adding domain
  var addSection = CardService.newCardSection().setHeader("Add New Domain");
  
  var domainInput = CardService.newTextInput()
      .setFieldName("new_domain_input")
      .setTitle("e.g., evil-hacker.com");
      
  var addAction = CardService.newAction().setFunctionName("onAddDomainClick");
  var addButton = CardService.newTextButton()
      .setText("➕Add to Blacklist")
      .setOnClickAction(addAction);
      
  addSection.addWidget(domainInput);
  addSection.addWidget(CardService.newButtonSet().addButton(addButton));

  //The existing blacklist
  var listSection = CardService.newCardSection().setHeader("Currently Blocked Domains");
  var blacklist = getBlacklist();

  if (blacklist.length === 0) {
    listSection.addWidget(CardService.newTextParagraph().setText("Your blacklist is empty."));
  } else {
    //Dynamic rendering of each domain in the list
    blacklist.forEach(function(domain) {
      var removeAction = CardService.newAction()
          .setFunctionName("onRemoveDomainClick")
          .setParameters({ "domainToRemove": domain });
          
      var removeButton = CardService.newTextButton()
          .setText("❌")
          .setOnClickAction(removeAction);

      listSection.addWidget(CardService.newDecoratedText()
          .setText(domain)
          .setButton(removeButton));
    });
  }

  card.addSection(addSection);
  card.addSection(listSection);

  return card.build();
}

function onAddDomainClick(e) {
  //Extracting the user's input
  var newDomain = e.formInput.new_domain_input;
  
  if (newDomain) {
    addToBlacklist(newDomain);
  }
  
  //Refresh the screen to display the latest information
  return refreshCard(e);
}

function onRemoveDomainClick(e) {
  //Extracting the button's parameter input
  var domain = e.parameters.domainToRemove;
  
  if (domain) {
    removeFromBlacklist(domain);
  }
  
  return refreshCard(e);
}

function onRefreshClick(e) {
  var newCard = buildMainCard(e);
  
  var navigation = CardService.newNavigation().updateCard(newCard);
  return CardService.newActionResponseBuilder().setNavigation(navigation).build();
}

//Helper function to refresh the current tab
function refreshCard(e) {
  var newCard = buildSettingsCard(e);
  var navigation = CardService.newNavigation().updateCard(newCard);
  return CardService.newActionResponseBuilder().setNavigation(navigation).build();
}