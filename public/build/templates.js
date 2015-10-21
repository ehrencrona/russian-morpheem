angular.module('morpheemJapanese').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('study-hiragana.html',
    "<div ng-if=\"current.newFacts.length\">\n" +
    "\n" +
    "    Some new knowledge:\n" +
    "\n" +
    "    <div ng-repeat=\"fact in current.newFacts\" class=\"knownFact new\">\n" +
    "        {{ fact.explanation }}\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-click=\"current.newFacts = null\" class=\"button\">Got it</div>\n" +
    "\n" +
    "</div>\n" +
    "<div ng-if=\"!current.newFacts.length\">\n" +
    "    How do you pronounce this?\n" +
    "\n" +
    "    <h3>\n" +
    "        {{ current.sentenceModel.sentence.toString() }}\n" +
    "    </h3>\n" +
    "\n" +
    "    <h4 ng-if=\"current.revealed\">\n" +
    "        {{ current.sentenceModel.meaning }}\n" +
    "    </h4>\n" +
    "\n" +
    "    <div ng-click=\"reveal()\" ng-if=\"!current.revealed\" class=\"button\">Reveal</div>\n" +
    "\n" +
    "    <div ng-click=\"allKnown()\" ng-if=\"current.revealed\" class=\"button\">I got it right</div>\n" +
    "\n" +
    "    <div ng-click=\"someForgotten()\" ng-if=\"current.revealed\" class=\"button\">I forgot the following:</div>\n" +
    "\n" +
    "    <div\n" +
    "        ng-repeat=\"knownFact in current.knownFacts\"\n" +
    "        ng-class=\"{ known : knownFact.known }\"\n" +
    "        ng-if=\"current.revealed\"\n" +
    "        ng-click=\" toggleKnown(knownFact) \"\n" +
    "        class=\"knownFact\">\n" +
    "        {{ knownFact.fact.explanation }} - {{ knownFact.knowledge }}\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "    <div ng-controller=\"KnowledgeDebugController\">\n" +
    "\n" +
    "        <div ng-repeat=\"knownFact in knownFacts track by knownFact.fact.getId()\">\n" +
    "            <div style=\"width: {{ knownFact.knowledge * 100}}px\" class=\"bar\"></div>\n" +
    "\n" +
    "            {{ knownFact.fact.getId() }} {{ knownFact.strength }}\n" +
    "        </div>\n" +
    "\n" +
    "        <table>\n" +
    "            <tr>\n" +
    "                <th width=\"180px\">\n" +
    "                    strengthAtRisk\n" +
    "                </th>\n" +
    "                <th width=\"180px\">\n" +
    "                    chanceOfUnderstandingForgotten\n" +
    "                </th>\n" +
    "                <th width=\"180px\">\n" +
    "                    knowledge\n" +
    "                </th>\n" +
    "                <th>\n" +
    "                </th>\n" +
    "            </tr>\n" +
    "            <tr ng-repeat=\"sentenceScore in sentenceScores track by sentenceScore.sentence.id\">\n" +
    "                <td>\n" +
    "                    <div style=\"width: {{ sentenceScore.strengthAtRisk * 180}}px\" class=\"bar\"></div>\n" +
    "                </td>\n" +
    "                <td>\n" +
    "                    <div style=\"width: {{ sentenceScore.chanceOfUnderstandingForgotten * 180}}px\" class=\"bar\"></div>\n" +
    "                </td>\n" +
    "                <td>\n" +
    "                    <div style=\"width: {{ sentenceScore.knowledge * 180}}px\" class=\"bar\"></div>\n" +
    "                </td>\n" +
    "                <td>\n" +
    "                    {{sentenceScore.sentence.toString()}}\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "        </table>\n" +
    "    </div>\n"
  );

}]);
