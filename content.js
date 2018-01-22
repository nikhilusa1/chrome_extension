var getMappings = function(){
  return {
    "fsu": ["fsu sucks!", "fsu < uf"],
    "seminoles": ["people who didn't get into UF", "semi-NULLS"],
    "florida state university": ["Florida State High School", "Florida State Community College"],
    "academics": ["\"academics\""],
    "research": ["research 😔"] // emoji is CMD + CTRL + SPACE
  };
}

var getWords = function(){
  return Object.keys(getMappings());
}

var getReplacement = function(original){
  var mapping = getMappings();
  var replacements = mapping[original];
  var index = Math.floor(Math.random() * (replacements.length));
  return replacements[index];
}

var doReplacement = function(){
  var wordsToReplace = getWords();
  var elements = document.getElementsByTagName('*'); // Gives all elements on the page

  for (var i = 0; i < elements.length; i++) {
      var element = elements[i];

      for (var j = 0; j < element.childNodes.length; j++) {
          var node = element.childNodes[j];

          if (node.nodeType === Node.TEXT_NODE) {
            var text = node.nodeValue;

            for (var k = 0; k < wordsToReplace.length; k++){
              var word = wordsToReplace[k];
              var replacement = getReplacement(word);

              // gi means global (all matches not just first) and case insensitive
              var replacedText = text.replace(new RegExp(word, "gi"), replacement);

              if (replacedText !== text) {
                var newNode = document.createTextNode(replacedText);
                element.replaceChild(newNode, node);

                node = newNode;
                text = replacedText;
              }
            }
          }
      }
  }
}

doReplacement();
