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
app.get('/weather', handleWeather);
app.get('/parks', handleParks);

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
            myLocalLocations[city] = new LocationObject(city, dataServer.body);
            // console.log('new object -->', locationNew);
            // console.log('all objects not empty:', myLocalLocations);

            // console.log('data lon is', myLocalLocations[city].latitude);
            response.send(locationNew);
        }).catch((err) => {
            console.log('we have error from API');
            console.log(err);
        })
    }
    //then run in succes case 
    //in case we have error in link server(url) catch will run
}

function handleWeather(request, response) {
    // let search_query = request.query.search_query;
    let keyWeather = process.env.WEATHER_API_KEY;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${request.query.latitude}&lon=${request.query.longitude}&key=${keyWeather}`;
    superagent.get(url).then(dataServer => {
        let cityWeather = dataServer.body.data;
        cityWeather.map(element => {
            let time = element.valid_date;
            let dis = element.weather.description;
            let newWeather = new WeatherObjects(dis, time);
            // console.log('weather data = ', weatherArr)
        });
        response.send(weatherArr);
    })


}

let allParksObj = [];

function ParksObjects(name, address, fee, description, url) {
    this.name = name;
    this.address = address;
    this.fee = fee;
    this.description = description;
    this.url = url;
    allParksObj.push(this);
}

function handleParks(request, response) {
    let city = request.query.search_query;
    let keyParks = process.env.PARKS_API_KEY;
    let url = `https://developer.nps.gov/api/v1/parks?q=${city}&api_key=${keyParks}`
    superagent.get(url).then(severData => {
        severData.body.data.map(element => {
            let name = element.fullName;
            let addresses = element.addresses[0].line1;
            let fees;
            if (element.fees.length == 0) {
                fees = 'no fees, free '
            } else { fees = element.fees[0] }
            let description = element.description;
            let url = element.url;
            let newParksObject = new ParksObjects(name, addresses, fees, description, url)
        })
        response.send(allParksObj.slice(0, 10));
        // console.log(allParksObj);
    })

}
app.listen(PORT, () => console.log(`app is runing in ${PORT} and the city is `));

//note : local data didnt work , i need to add any new data for the myLocalLocations