import express from 'express';
import logger from 'morgan';
import { connectToDb, getDb } from './db.js';
let db
let id
let trips = {};
const JSONfile = '';

async function reload(filename) {
  console.log('reloadddddddd')
  try {
    const users = await db.collection('users').find({}, { projection: { _id: 0 } }).toArray();
    const withID = await db.collection('users').find({}, { projection: { _id: 1 } }).toArray();
    trips = users[0];
    id = withID[0]._id;
  } catch (err) {
    console.log(err);
    trips = {};
  }
}

async function saveTrips() {
  try {
    const data = JSON.stringify(trips);
    const filter = { _id: id}; 
    const result = await db.collection('users').replaceOne(filter, trips);
    if (result.modifiedCount !== 1) {
      throw Error;
    }
  } catch (err) {
    console.log(err);
  }
}


async function createNewTrip(response, title, destination, date) {
  if (title === undefined || title === '') {
    response.status(400).json({ error: 'Need a trip name to create trip' });
  } 
  else if(destination === undefined || destination === ''){
    response.status(400).json({ error: 'Need a destination to create trip' });
  }
  else if(date === undefined || date === ''){
    response.status(400).json({ error: 'Need a date to create trip' });
  }
  else {
    await reload(JSONfile);
    trips[title] = {destination:destination, date:date, expectedCost:0, days:{}};
    await saveTrips();
    response.json({ title:title, destination:destination, date:date });
  }
}

async function readTrip(response, title) {
  await reload(JSONfile);
  if (title in trips) {
    response.json({ title: title, tripInfo: trips[title] });
  } else {
    response.json({ error: `Could not find trip ${title}` });
  }
}

async function deleteTrip(response, title) {
  await reload(JSONfile);
  if ((title in trips)) {
    delete trips[title];
    await saveTrips();
    response.json({ title: title });
  } else {
    response.json({ error: `Could not find trip ${title}`});
  };
}


async function addDayToTrip(response,title,date) {
  await reload(JSONfile);
  if (date === undefined || date === '') {
    response.status(400).json({ error: 'Need to enter date to add' });
  } 
  else {
    trips[title]['days'][date] = {events: {}, cost:0};
    await saveTrips();
    response.json({ title:title, tripInfo: trips[title] });
  }
}

async function removeDayFromTrip(response, title, date) {
  await reload(JSONfile);
  if (date === undefined || date === '') {
    response.status(400).json({ error: 'Need to enter date to delete' });
  } 
  else if (!(date in trips[title]['days'])){
    response.status(400).json({ error: `Could not delete, date '${date}' Not Found` });
  } 
  else {
    for(let i in trips[title]['days'][date]['events']){
      trips[title]['expectedCost']-=trips[title]['days'][date]['events'][i]['cost'];
    }
    delete trips[title]['days'][date];
    await saveTrips();
    response.json({ title:title, tripInfo: trips[title] });
  }
}

async function addEventToDay(response,title,date,time,event,location,cost) {
  await reload(JSONfile);
  console.log(typeof(parseInt(cost)));
  if (date === undefined || date === ''|| time === undefined || time === ''|| event === undefined || event === ''|| location === undefined || location=== ''|| cost === undefined || cost === '') {
    response.status(400).json({ error: 'Please fill in all the boxes'});
  } 
  else if (!(date in trips[title]['days'])) {
    response.status(400).json({ error: `Date ${date} is not in trip` });
  } 
  else if(isNaN(parseInt(cost))){
    response.status(400).json({ error: `Please enter a number for the cost` });
  }
  else {
    let Cost = parseInt(cost);
    trips[title]['days'][date]['events'][event] = {time:time, location:location, cost:Cost};
    trips[title]['days'][date]['cost']+=Cost;
    trips[title]['expectedCost'] +=Cost;
    await saveTrips();
    response.json({ title:title, tripInfo: trips[title] });
  }
}
async function removeEventFromDay(response, title, date, event) {
  await reload(JSONfile);
  if (date === undefined || date === ''|| event === undefined || event === '') {
    response.status(400).json({ error: 'Please fill in all the boxes'});
  } 
  else if (!(date in trips[title]['days'])) {
    response.status(400).json({ error: `Date ${date} is not in trip` });
  } 
  else if (!(event in trips[title]['days'][date]['events'])) {
    response.status(400).json({ error: `Event ${event} is not in date ${date}`});
  } 
  else{
    const Cost = trips[title]['days'][date]['events'][event]['cost'];
    trips[title]['days'][date]['cost']-=Cost;
    trips[title]['expectedCost'] -=Cost;
    delete trips[title]['days'][date]['events'][event];
    await saveTrips();
    response.json({ title:title, tripInfo: trips[title] });
  }
}

async function dumpTrips(response) {
  await reload(JSONfile);
  response.json(trips);
}

const app = express();
const port = 3000;
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/client', express.static('client'));

app.get('/users', async (req, res) => {
  try {
    console.log('hello');
    const users = await db.collection('users').find().toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Could not fetch the documents' });
  }
});

app.post('/create', async (request, response) => {
  const options = request.body;
  createNewTrip(response, options.title, options.destination, options.date);
});

app.get('/read', async (request, response) => {
  const options = request.query;
  readTrip(response, options.title);
});

app.delete('/delete', async (request, response) => {
  const options = request.query;
  deleteTrip(response, options.title);
});

app.put('/update', async (request, response) => {
  const options = request.query;
  addDayToTrip(response, options.title, options.date);
});

app.delete('/removeDest', async (request, response) => {
  const options = request.query;
  removeDayFromTrip(response, options.title, options.date);
});

app.put('/addEvent', async (request, response) => {
  const options = request.query;
  addEventToDay(response, options.title, options.date, options.time, options.event, options.location, options.cost);
});

app.delete('/removeEvent', async (request, response) => {
  const options = request.query;
  removeEventFromDay(response, options.title, options.date, options.event);
});

app.get('/dump', async (request, response) => {
  const options = request.body;
  dumpTrips(response);
});

app.get('*', async (request, response) => {
  response.status(404).send(`Not found: ${request.path}`);
});

connectToDb((err) => {
  if(!err){
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
    db = getDb();
  }
});

