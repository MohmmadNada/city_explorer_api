'use strict';
require('dotenv').config(); //this bakege is dawnloaded by terminal (run npm i dotenv )then add this line to able run env / must be in the top 
// const PORT = 3000;//without API 
const PORT = process.env.PORT; //with API / in this case , process.env to go inside file , PORT  is somthing inside , so the same as  const PORT = 3000 , but more daynamic // env had secrite data , will not push , this line must but it in the top  

const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const app = express();
app.use(cors());
// Load Environment Variables from the .env file / get any data req from .env file 
// all lines code above , as role for server 
// Create a route with a method of `get` and a path of `/location`
app.get('/location', handleLocation);
// app.get('/weather', handleWeather);
//in case /abcd , this page not found , code for not found , this line must be add after all app.get , this must be from express , but to practice 
app.use('*', notFoundHandler)

function notFoundHandler(request, response) {
    response.status(404).send('requst doesnt response');
}

function LocationObject(search_query, geoAPIs) {
    this.search_query = search_query;
    this.formatted_query = geoAPIs[0].display_name;
    this.latitude = geoAPIs[0].lat;
    this.longitude = geoAPIs[0].lon;
}

let weatherArr = [];

function WeatherObjects(forecast, time) {
    this.forecast = forecast;
    this.time = time;
    weatherArr.push(this);

}
//save it locally (caching locallyin variable)
let myLocalLocations = {}

function handleLocation(request, response) {
    //data input from user 
    let city = request.query.city;
    // 1. get from json file or request from API
    // const getLocation = require('./data/location.json');
    if (myLocalLocations[city]) {
        console.log('fron local data');
        response.send(myLocalLocations[city])
    } else {
        let key = process.env.GEOCODE_API_KEY;
        //get data from the server 
        const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
        //to help me to connect with another server (superagent )
        // if (myLocalLocations[city]) {
        // console.log('from local data');
        // response.send(myLocalLocations[city]);
        // } else {
        console.log('from APIs data');
        superagent.get(url).then(dataServer => {
            let locationNew = new LocationObject(city, dataServer.body);
            myLocalLocations[locationNew];
            console.log('new object -->', locationNew);
            response.send(locationNew);
        }).catch((err) => {
            console.log('we have error from API');
            console.log(err);
        })
    }
    //then run in succes case 
    //in case we have error in link server(url) catch will run
}

function handleWeather(requset, response) {
    // let city = request.query.city;
    let keyWeather = process.env.WEATHER_API_KEY;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${locationNew.latitude}&lon=${locationNew.latitude}&key=${keyWeather}`;
    superagent.get(url).then(responseServer => {
        console.log(responseServer);
        // let dataObj = responseServer.body;
        // console.log('weather data = ', dataObj)
        // dataObj.data.map(element => {
        //     let time = element.valid_date;
        //     let dis = element.weather.description;
        //     let newDay = new Weathers(dis, time);

    });
    // response.send(weatherArr);
}


// }
app.listen(PORT, () => console.log(`app is runing in ${PORT} and the city is `));

//note : local data didnt work , i need to add any new data for the myLocalLocations