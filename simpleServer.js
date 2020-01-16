const express = require('express')
const { WebhookClient } = require('dialogflow-fulfillment')
const fetch = require('node-fetch')

const app = express()

const fakeDB = [
  {
    name: 'Luke Skywalker',
    id: 1,
    url: 'https://swapi.co/api/people/1/'
  },
  {
    name: 'Darth Vader',
    id: 4,
    url: 'https://swapi.co/api/people/4'
  },
  {
    name: 'Anakin Skywalker',
    id: 11,
    url: 'https://swapi.co/api/people/11/'
  }
]

app.get('/', (req, res) => res.send('online'))
app.post('/dialogflow', express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res })

  const addCharacterToDb = newCharacter => {
    console.log(newCharacter)
    console.log('in this function Kosh will add new person to DB')
  }

  const getCharacterInfo = async () => {
    const requestedName = req.body.queryResult.parameters.person.name
    const personFromDB = fakeDB.find(person => person.name.toLowerCase().includes(requestedName.toLowerCase()))
    if (personFromDB) {
      const response = await fetch(personFromDB.url)
      const character = await response.text()
      const personFromServer = JSON.parse(character)
      const personInfo = personFromServer.gender === 'male'
        ? `He is ${personFromServer.gender}, his height is ${personFromServer.height}, his skin color is ${personFromServer.skin_color}, his eyes are ${personFromServer.eye_color}.`
        : `She is ${personFromServer.gender}, her height is ${personFromServer.height}, her skin color is ${personFromServer.skin_color}, her eyes are ${personFromServer.eye_color}.`
      agent.add(personInfo)
      return
    }
    agent.add(`There is no star wars person with name ${requestedName}, you can try to find somebody with another name or you can add new character to the database.`)
  }

  const addNewCharacter = () => {
    const newCharacter = {
      name: req.body.queryResult.parameters.person.name,
      height: req.body.queryResult.parameters.height,
      gender: req.body.queryResult.parameters.gender,
      eye_color: req.body.queryResult.parameters.eye_color,
      skin_color: req.body.queryResult.parameters.skin_color,
    }
    addCharacterToDb(newCharacter)
    agent.add('New person was created and added to DB')
  }

  const intentMap = new Map()
  intentMap.set('star wars character request', getCharacterInfo)
  intentMap.set('star wars add character', addNewCharacter)
  agent.handleRequest(intentMap)
})

app.listen(process.env.PORT || 8080)
