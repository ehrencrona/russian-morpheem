"use strict"

var module = angular.module('morpheemJapanese',
    [
        'ngAnimate', 'ngRoute'
    ])

module
    .factory('_', function() {
        return window._ // assumes underscore has already been loaded on the page
    })
    .config(['$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {
            $locationProvider.hashPrefix('!')

            $routeProvider.
                when('/study-hiragana', {
                    templateUrl: 'study-hiragana.html',
                    controller: 'StudyHiraganaController'
                })
        }])
    .controller('StudyHiraganaController',
        require('./StudyHiraganaController'))

