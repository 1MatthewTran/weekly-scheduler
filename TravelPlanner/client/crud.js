export async function createNewTrip(title, destination, date ) {
  const response = await fetch(`/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title:title, destination:destination, date:date }),
  });
  const data = await response.json();
  if(data.error) alert(data.error);
  return data;
}

export async function readTrip(title) {
  try {
    const response = await fetch(`/read?title=${title}`, {
      method: 'GET',
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}
export async function deleteTrip(title) {
  try {
    const response = await fetch(`/delete?title=${title}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}

export async function addDayToTrip(title, date) {
  try {
    const response = await fetch(`/update?title=${title}&date=${date}`, {
      method: 'PUT',
    });
    const data = await response.json();
    if(data.error) alert(data.error);
    return data;
  } catch (err) {
  }
}

export async function removeDayFromTrip(title, date) {
  try {
    const response = await fetch(`/removeDest?title=${title}&date=${date}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if(data.error) alert(data.error);
    return data;
  } catch (err) {
    console.log(err);
  }
}

export async function addEventToDay(title,date,time,event,location,cost) {
  try {
    const response = await fetch(`/addEvent?title=${title}&date=${date}&time=${time}&event=${event}&location=${location}&cost=${cost}`, {
      method: 'PUT',
    });
    const data = await response.json();
    if(data.error) alert(data.error);
    return data;
  } catch (err) {
    console.log(err);
  }
}

export async function removeEventFromDay(title, date, event) {
  try {
    const response = await fetch(`/removeEvent?title=${title}&date=${date}&event=${event}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if(data.error) alert(data.error);
    return data;
  } catch (err) {
  }
}

export async function readInTrips() {
  try{
    const response = await fetch(`/dump`, {
    method: 'GET',
    });
    const data = await response.json();
    if(data.error) alert(data.error);
    return data;
  }catch (err) {
  }
}
