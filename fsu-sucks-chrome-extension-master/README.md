# Chrome Extension Tutorial
Welcome! Today we'll be taking a look at how to build an extension for Google Chrome. The extension we will be building today will be replacing text on web pages related to Florida State University (such as FSU, Seminoles, etc.) with more accurate text (such as FSU Sucks, fsu < uf, etc.).

This extension is relatively simple and is designed to teach you the basics of how to make a chrome extension that can interact with the contents of a web page. Once you know how to do that, there are tons of possibilities for cool stuff you can do!

## Prerequisites
* Prior to this tutorial please install a text editor. I personally use [Atom](https://atom.io/), however feel free to use [Sublime](https://www.sublimetext.com/) or any other editor of your choice.

* Please install [Google Chrome](https://www.google.com/chrome/browser/)

## What is a Chrome Extension?

A chrome extension is just that... and extension for Google Chrome. This allows you to add functionality to your browser without having to actually modify the core code of the browser.

Chrome extensions are building using web technologies (HTML, CSS, and JavaScript) which makes development quite easy for someone already comfortable with web development.

You can do quite a lot with chrome extensions including modifying the content of the current web page, storing data in the browser, opening a popup that the user can interact with, etc. For the sake of this tutorial we will be focusing on modifying the contents of a web page.

For more information check out this [guide](https://developer.chrome.com/extensions/getstarted).

## Manifest Declaration

The first thing you'll need to do is create a manifest file named 'manifest.json'. This is a metadata file in JSON format that contains properties that chrome needs to know about your extension.

The very first thing we'll need to create is a manifest file named manifest.json. This manifest is nothing more than a metadata file in JSON format that contains properties like your extension's name, description, version number and so on. At a high level, we will use it to declare to Chrome what the extension is going to do, and what permissions it requires in order to do those things. To learn more about the manifest, read the Manifest File Format documentation.

Our manifest.json file is going to look like this:

```JSON
{
  "manifest_version": 2,
  "name": "FSU Sucks",
  "description": "Replaces FSU stuff with more accurate text.",
  "version": "1.0",
  "browser_action": {
    "default_icon": "Seminole.png",
    "default_popup": "popup.html"
  },
  "content_scripts":
  [
    {
      "matches": [
        "http://*/*",
        "https://*/*"
      ],
      "js": [
        "content.js"
      ],
      "run_at": "document_end"
    }
  ]
}
```

Here we specified various attributes of our extension like the manifest version, name, description, etc. There are a few important things to note here:

* browser_action. This is where we show chrome what icon will be used for the extension (default_icon) and an html file that will be opened when we click on the icon (default_popup).

* content_scripts. Here we specify what scripts we will be running. The matches attributes is used to tell chrome to run the script on pages where the url matches a certain format. By using "http://*/*" and "https://*/*", our script will be run on all pages. The js tag shows chrome which script we want to run, and we specify when it will be ran with "run_at". Since we want to manipulate the contents of the page, we want to wait until the page has loaded (hence the script will be run at the end).

## Creating Necessary Files

We are telling our manifest to use Seminole.png as our icon, popup.html as our popup, and content.js as our script. We will need to create these files. At the root directory of the project (at the same level as the manifest), create a content.js file, popup.html file, and download the icon [here](https://github.com/UFSEC/fsu-sucks-chrome-extension/raw/master/Seminole.png).

## Load the Extension

At this point, we have everything we need to load the extension in chrome (although it does not really do anything yet). Lets load the extension in chrome now.

1. Visit chrome://extensions/ in your browser.  

2. If you have not done so yet, enable developer mode. There is a checkbox in the top right corner - make sure this is checked.

3. Click Load unpacked extension and select the directory that contains all of the files we have just created.

If everything worked fine, the extension should be loaded and you should see the icon to the right of the address bar. You can go back to this page to update the extension whenever you have modified files locally.

## Understanding the DOM

Before we proceed, I want to take a brief moment to introduce the Document Object Model (DOM). If you are already familiar with what the DOM is, feel free to skip this section and move on to the next.

The DOM is a programming interface for HTML and XML documents. Basically, for our purposes, it represents an HTML document as nodes and objects so that we can interact with it in code.

We will be using the DOM to access the document (the web pages we wish to interact with). We will be searching through all the elements of this document for nodes that contain text. Any text that contains certain keywords (such as fsu or seminoles) will then be replaced with other words.

This explanation should be sufficient in understanding the rest of this tutorial. A more in-depth explanation of the DOM can be found [here](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction).

## Getting All the Elements on the Page

The first thing well need to do is find all of the elements on the page and traverse through them. To get all the elements on the page we will need to use the DOM. Calling `document.getElementsByTagName('*')` will give us all of the elements. '\*' is a wildcard and will give us elements with any tag name.

We will need to traverse through all of these elements and look at all of their children nodes. For example, we may encounter the following element in the document: <p>Florida State University</p>. The element itself will be the paragraph, however, the text "Florida State University" is actually a child of the paragraph element.

To begin the traversal, in content.js, write a function called doReplacement as the following:

```JavaScript
var doTheReplacement = function(){
  var elements = document.getElementsByTagName('*'); // Gives all elements on the page

  for (var i = 0; i < elements.length; i++) {
      var element = elements[i];

      for (var j = 0; j < element.childNodes.length; j++) {
          var node = element.childNodes[j];

          if (node.nodeType === Node.TEXT_NODE) { // NodeType 3 is a text node.

              // TODO: Implement the rest of this method.
          }
      }
  }
}
```

Here we start by getting all the elements in the document. For each element we are then traversing through each of its childNodes. There are multiple different [types](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) of nodes in the DOM. We are interested in working with text nodes, so the rest of our program will be implement inside of the if statement.

## Some Helper Methods

Before we continue lets create some helper methods. We will create methods that describe the mapping of keywords. Lets create a method that returns a dictionary (in js this is really just an object) where the key is the keyword, and the value is an array of potential strings to replace they keyword with.

```JavaScript
var getMappings = function(){
  return {
    "fsu": ["fsu sucks!", "fsu < uf"],
    "seminoles": ["people who didn't get into UF", "semi-NULLS"],
    "florida state university": ["Florida State High School", "Florida State Community College"],
    "academics": ["\"academics\""],
    "research": ["research 😔"] // emoji is CMD + CTRL + SPACE
  };
}
```

We will create another function that uses this mapping to return a list of just the keywords.

```JavaScript
var getWords = function(){
  return Object.keys(getMappings());
}
```

And another function that, given a keyword, will determine which word to replace it with. Since we created the mapping as a word -> list of words, we will be generating a random integer in the range [0, length of list) to determine which word in the list to use.

```JavaScript
var getReplacement = function(original){
  var mapping = getMappings();
  var replacements = mapping[original];
  var index = Math.floor(Math.random() * (replacements.length));
  return replacements[index];
}
```

## Do the replacements

Now that those helper methods are done, lets finish our doReplacement function. At the very beginning of the function (right before we declare an initialize our variable elements), add the following statement `var wordsToReplace = getWords()`. This will be the list of words we are searching for in the document.

Now, go back to where we left that TODO inside the if statement. Delete the TODO statement and add the following code.

```JavaScript
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
```

We are doing a few things here:
* We are getting the text from the node.
* We are traversing through all of the words that need to be replaced.
* For each word, we are getting the appropriate replacement.
* We are using the replace method on text. We are creating a Regular Expression with the word and the "gi" flag. The "g" tells the method to replace all instances of this word in the text (not just one), and the "i" tells the method to be case-insensitive.
* If the text is different, that means a keyword is found so we must create a new text node with the modified text. We then replace the old node with this new node and update the values for node and text.

Note: Regular Expression is incredibly useful and can be used to match all kinds of patterns (not just strings matching a specific word). For the purposes of this tutorial, we will not be going very in depth, however, I recommend learning more about it if you are interested.

```JavaScript
var doTheReplacement = function(){
  var wordsToReplace = getWords();
  var elements = document.getElementsByTagName('*'); // Gives all elements on the page

  for (var i = 0; i < elements.length; i++) {
      var element = elements[i];

      for (var j = 0; j < element.childNodes.length; j++) {
          var node = element.childNodes[j];

          if (node.nodeType === Node.TEXT_NODE) { // NodeType 3 is a text node.
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
```

## Finishing Touches

We have one more thing we need to do before we can finish. Right now, we have only defined a bunch of methods, but nothing will actually happen (as nothing is being called. At the very bottom of the page, add a call to doTheReplacement(). Your content.js file should now look like this:

```JavaScript
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

                node = newNode
                text = replacedText
              }
            }
          }
      }
  }
}

doReplacement();
```

Lets Reload this extension in chrome. Open chrome and go back to chrome://extensions. On the FSU Sucks extension, click Reload and ensure that the Enabled checkbox is checked.

Congratulations thats it! Try out a website like https://www.fsu.edu/. And take a look at the text on the page! We have successfully made their website a lot more accurate!

## Challenge Time!

You may have noticed that I have included a popup.html file in the project and a reference to it in the manifest. This popup will be opened when you click on the chrome extension icon. Open popup.html and add some text in there. Reload the extension and click on the icon. Do you see the text you just added?

This particular extension did not really need a visual component, however, this is how you can add one if you wanted to.

You can add a CSS file and a JavaScript file and add them to your html file. You basically have all the resources available to you as if you were making a web page (plus a few more actually!).

As an exercise you can try to display a title and show the number of words that were replaced in the popup.

You could also try to replace images as well (instead of just text). There are tons of resources online that you can leverage to learn how to do this.

You could also just use what you've learned from this tutorial to make something else entirely!

We'd love to see your completed challenges! Email or Facebook message them to me and, with your position, we might feature them on our Facebook and website!

## Thanks for following along!
My name is Bradley and my email is bradleymtreuherz@gmail.com. If you have any questions or comments don't hesitate to reach out!
