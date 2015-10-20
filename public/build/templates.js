angular.module('morpheemJapanese').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('study-hiragana.html',
    "\n" +
    "<div ng-click=\"reveal()\">Reveal</div>\n" +
    "\n" +
    "<div>\n" +
    "\n" +
    "    {{ sentence.meaning }} ( {{ sentence.explanation }} )\n" +
    "\n" +
    "    <ul>\n" +
    "        <li ng-repeat=\"knownFact in knownFactsByKnowledge\">\n" +
    "            {{ knownFact.fact.description }} - {{ knownFact.knowledge }}\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "\n"
  );

}]);
