'use strict';
const PORT = 3000;

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

// all lines code above , as role for server 
// Create a route with a method of `get` and a path of `/location`
app.get('/location', handleLocation);
app.get('/weather', handleWeather);

function LocationObject(search_query, formatted_query, latitude, longitude) {
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.latitude = latitude;
    this.longitude = longitude;
}

function WeatherObjects(forecast, time) {

    this.forecast = forecast;
    this.time = time;
}

function handleLocation(request, response) {
    /*. The route callback should invoke a function to convert the search query to a latitude and longitude. The function should use the provided JSON data. */
    // 1. get from json file
    const getLocation = require('./data/location.json');
    let location = request.query.location; // if user Input : Amman , so  location =amman 
    //request is an objecat on system (build In)and have so many method , one of these metohds is query , requset from front end , that is input from the user 

    console.log(request.query);
    let NewObjext = new LocationObject(getLocation[0].type, getLocation[0].display_name, getLocation[0].lat, getLocation[0].lon)
    console.log(NewObjext)
    response.send(NewObjext);
}

function handleWeather(requset, response) {
    const getWeatherData = require('./data/weather.json');
    const weatherArr = []
    getWeatherData.data.forEach(element => {

        let newWeather = new WeatherObjects(element.weather.description, element.valid_date);
        weatherArr.push(newWeather);
        return weatherArr;
    })
    response.send(weatherArr);

}
app.listen(PORT, () => console.log(`app is runing in ${PORT} and the city is `));

/* **Given** that a user does not enter a valid location (eg: empty string) in the input

**When** the user clicks the "Explore!" button

**Then** the user will receive an error message on the page and the data will not be rendered properly

Endpoints:
`/location`, `/weather`

Example Response:

```
{
  status: 500,
  responseText: "Sorry, something went wrong",
  ...
}
```
*/