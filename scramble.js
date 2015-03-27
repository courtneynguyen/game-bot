var lodash = require('lodash');
module.exports = (function(){
    var timeoutId = 0;
    var roundNumber = 0;
    var categories = {
        vegetable: [
            'potato', 'carrot', 'turnip', 'parsnip', 'rhutabaga', 'radish', 'kale'],
        pokemon: [
            'charizard', 'pikachu', 'snorelax'],
        color: [
            'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'black',
            'white', 'pink', 'brown', 'grey'],
        country: [
            'france', 'italy', 'russia', 'china', 'mexico', 'madagascar', 'egypt',
            'peru', 'argentina', 'norway', 'australia'],
        insect: [
            'ant', 'beetle', 'butterfly', 'moth', 'termite'],
        planet: [
            'mercury', 'venus', 'earth', 'mars', 'saturn', 'jupiter', 'neptune',
            'pluto']
    };

    var scrambleWord = function (word) {
        var scrambleFunction = function () { return 0.5 - Math.random(); };
        return word.split('').sort(scrambleFunction).join('');
    };

    var getRandomCategory = function () {
        var keys = Object.keys(categories);
        console.log(keys);
        return keys[Math.floor(Math.random() * keys.length)];
    };

    var isCategory = function (category) {
        var categoryKeys = lodash.keys(categories);
        return categoryKeys.indexOf(category) >= 0 ? true : false;
    }
    
    var getScramble = function (category) {
        if (!(category in categories)) {
            category = getRandomCategory();
        }

        var randomIndex = Math.floor(Math.random() * categories[category].length);
        var answer = categories[category][randomIndex];
        var scramble = scrambleWord(answer);

        return {
            category: category,
            scramble: scramble,
            answer: answer
        };
    };

    function startRound () {
        roundNumber++;
        
    }

    function loop () {
        // pause to announce scrambled word:
        window.setTimeout(startRound, 5000);
    }

    var startGame = function(people, room){
        state = "running";
        console.log('STARTED GAME!!');
        // while(state === "running"){

        // }
    }

    var pauseGame = function(){
        state = "paused";
    };

    var terminateGame = function(){
        state = "";
    };

    return {
        getScramble: getScramble,
        isCategory: isCategory,
        state: "",
        scores: {},
        startGame: startGame,
        terminateGame: terminateGame,
        pauseGame: pauseGame,
        roundNumber: roundNumber
    };
})();