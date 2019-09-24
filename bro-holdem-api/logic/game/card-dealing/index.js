const { models: { Card } } = require('bro-holdem-data')

/**
* Helper function for random card dealing.
* @param {array} destArray - Array to store random cards dealt
* @param {number} numberOfCards - Number of random cards to be dealt
* @param {array} usedCards - Array of cards to be check against to avoid repetition
* @return {undefined}
*
*/

async function cardDealing(destArray, numberOfCards, usedCards) {

    let randomCard, match

    for (i = 0; i < numberOfCards; i++) {
        do {
            randomCard = await Card.aggregate([{ $sample: { size: 1 } }])
            match = usedCards.some(card => card.ref === randomCard[0].ref)
        } while (match)
        destArray.push(randomCard[0])
        usedCards.push(randomCard[0])
        match = false
    }
}

module.exports = cardDealing