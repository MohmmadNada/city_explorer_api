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

    // 1. get from json file or request from API
    // const getLocation = require('./data/location.json');

    let location = request.query.location; // if user Input : Amman , so  location =amman 
    //request is an objecat on system (build In)and have so many method , one of these metohds is query , requset from front end , that is input from the user
    let key = process.env.GEOCODE_API_KEY;
    //get data from the server 
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${location}&format=json`;
    //to help me to connect with another server (superagent )
    superagent.get(url).then(dataServer => {
        // console.log(dataServer.body[0]);
        let locationResponse = dataServer.body[1]
        console.log(locationResponse);
    })
    response.send(locationResponse);
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