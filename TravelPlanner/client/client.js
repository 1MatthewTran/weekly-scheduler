import * as crud from './crud.js';

const title = document.getElementById('title');
const destination = document.getElementById('destination');
const createButton = document.getElementById('createTrip');
const tripSections = document.getElementById('trips');

async function refresh() {
  const json = await crud.readInTrips();
  tripSections.innerHTML = '';
  for (let key in json) {
    const trip = document.createElement('div');
    trip.classList.add('tripBox');
    trip.id = key;
    trip.innerHTML = `
    <h1 class="title">${key}, <span class="date">Dest: ${json[key]['destination']}, Date: ${json[key]['date']}</span></h1>
    <h2 class="cost marginsLvl1">Budget: ${json[key]['expectedCost']} $ 
    <a href="#" id="delete${key}">Delete Trip</a>
    </h2>`;
    tripSections.appendChild(trip);
    const elem = document.getElementById(key);
    const data = await crud.readTrip(key);
    const tripData = document.createElement('div');
    tripData.id = `tripInfo${key}`;
    for (let date in data['tripInfo']['days']) {
      const dateElement = document.createElement('p');
      dateElement.classList.add('marginsLvl2');
      dateElement.textContent = `Schedule on ${date}:`;
      tripData.appendChild(dateElement);
      for (let event in data['tripInfo']['days'][date]['events']) {
        const eventElement = document.createElement('p');
        eventElement.classList.add('marginsLvl3');
        eventElement.textContent = `${event} at ${data['tripInfo']['days'][date]['events'][event]['time']}, Location: ${data['tripInfo']['days'][date]['events'][event]['location']}, Cost: ${data['tripInfo']['days'][date]['events'][event]['cost']}`;
        tripData.appendChild(eventElement);
      }
    }
    elem.appendChild(tripData);
    elem.innerHTML += `<label for="newDate${key}">New Date</label>:
                      <input type="text" id="newDate${key}"/>
                      <input type="button" value="add new date to trip" id="addDate${key}"/>
                      <label for="deleteThisDate${key}">Date</label>:
                      <input type="text" id="deleteThisDate${key}"/>
                      <input type="button" value="delete date from trip" id="deleteDate${key}"/>
                      <br>
                      <label for="date${key}">Date</label>:
                      <input type="text" id="date${key}" />
                      <label for="time${key}">Time</label>:
                      <input type="text" id="time${key}" />
                      <label for="event${key}">Event</label>:
                      <input type="text" id="event${key}" />
                      <label for="location${key}">Location</label>:
                      <input type="text" id="location${key}" />
                      <label for="cost${key}">Cost</label>:
                      <input type="text" id="cost${key}" />
                      <input type="button" value="add event to date" id="addEvent${key}"/>
                      <br>
                      <label for="eventDate${key}">Date</label>:
                      <input type="text" id="eventDate${key}"/>
                      <label for="eventToRemove${key}">Event</label>:
                      <input type="text" id="eventToRemove${key}" />
                      <input type="button" value="remove event from date" id="removeEvent${key}"/>`;
    const deleteTrip = document.getElementById(`delete${key}`);
    const addDateButton = document.getElementById(`addDate${key}`);
    const newDate = document.getElementById(`newDate${key}`);
    const deleteDateButton = document.getElementById(`deleteDate${key}`);
    const deleteThis = document.getElementById(`deleteThisDate${key}`);
    const date = document.getElementById(`date${key}`);
    const time = document.getElementById(`time${key}`);
    const event = document.getElementById(`event${key}`);
    const location = document.getElementById(`location${key}`);
    const cost = document.getElementById(`cost${key}`);
    const addEventButton = document.getElementById(`addEvent${key}`);
    const removeEventFromDate = document.getElementById(`eventDate${key}`);
    const eventToRemove = document.getElementById(`eventToRemove${key}`)
    const removeEventButton = document.getElementById(`removeEvent${key}`);
    addDateButton.addEventListener('click', async (e) => {
      const j = await crud.addDayToTrip(key, newDate.value);
      await refresh();
    });
  
    deleteDateButton.addEventListener('click', async (e) => {
      const j = await crud.removeDayFromTrip(key, deleteThis.value);
      await refresh();
    });

    addEventButton.addEventListener('click', async (e) => {
      const j = await crud.addEventToDay(key, date.value, time.value, event.value, location.value, cost.value);
      await refresh();
    });
    removeEventButton.addEventListener('click', async (e) => {
      const j = await crud.removeEventFromDay(key, removeEventFromDate.value, eventToRemove.value);
      await refresh();
    });
  
    deleteTrip.addEventListener('click', async (e) => {
      await crud.deleteTrip(key);
      const deletedTrip = document.getElementById(key);
      deletedTrip.parentNode.removeChild(deletedTrip);
    });
  }
}

createButton.addEventListener('click', async (e) => {
  const json = await crud.createNewTrip(title.value, destination.value, date.value);
  await refresh();
});


refresh();
