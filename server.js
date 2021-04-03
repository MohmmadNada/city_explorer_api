'use strict';
require('dotenv').config(); //this bakege is dawnloaded by terminal(run npm i dotenv)then add this line to able run env / must be in the top 
// const PORT = 3000;//without API 
const PORT = process.env.PORT; //with API / in this case , process.env to go inside file , PORT  is somthing inside , so the same as  const PORT = 3000 , but more daynamic // env had secrite data , will not push , this line must but it in the top  

const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg'); //lab09DATABASE //run pgstart after restart
const app = express();
const client = new pg.Client(process.env.DATABASE_URL); //lab09DATABASE
client.on('error', err => console.log("PG PROBLEM!!!")); //lab09DATABASE
app.use(cors());

// Load Environment Variables from the .env file / get any data req from .env file 
// all lines code above , as role for server 
// Create a route with a method of `get` and a path of `/location`
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/parks', handleParks);
app.get('/movies', handleMovies);
app.get('/yelp', handleYelp);

//in case /abcd , this page not found , code for not found , this line must be add after all app.get , this must be from express , but to practice 
app.use('*', notFoundHandler)
app.get('/test', (erq, res) => {
    let sql = 'SELECT * FROM cityTable;';
    client.query(sql).then(result => {
        res.send(result)
    })
})

function notFoundHandler(request, response) {
    response.status(404).send('requst doesn`t response');
}


//save it locally (caching locally in variable)
function LocationObject(search_query, geoAPIs) {
    this.search_query = search_query;
    this.formatted_query = geoAPIs.display_name;
    this.latitude = geoAPIs.lat;
    this.longitude = geoAPIs.lon;
}

let myLocalLocations = {};

function handleLocation(request, response) {
    let city = request.query.city; //city from front end 
    let SQL = `SELECT * FROM cityTable WHERE search_query=$1`;
    let values = [city];
    client.query(SQL, values).then(result => {
        if (result.rowCount) {

            console.log('these data from data base , result .rows[0] is : ======>', result.rows[0]);
            response.send(result.rows[0])
        } else {
            console.log('these data from API not from  data base ');
            let key = process.env.GEOCODE_API_KEY;
            const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
            superagent.get(url).then(data => {
                //in case we need API , use superagent
                let newLocation = new LocationObject(city, data.body[0]);
                let SQL = `INSERT INTO cityTable(search_query, formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4)`;
                let values = [newLocation.search_query, newLocation.formatted_query, newLocation.latitude, newLocation.longitude];
                client.query(SQL, values).then(result => {
                    response.send(newLocation);
                }).catch(error => {
                    console.log('we face some error from data base :', error);
                })
            }).catch(error => {
                console.log('ERROR FROM API', error);
                response.status(500).send('We face some issue with this data , try another one ');
            })


        }
    }).catch(error => {
        console.log('we face some error ', error)

    })
};

let weatherArr = [];

function WeatherObjects(forecast, time) {
    this.forecast = forecast;
    this.time = time;
    weatherArr.push(this);

}

function handleWeather(request, response) {
    weatherArr = [];
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
    }).catch(error => {
        console.log('ERROR FROM API', error);
        response.status(500).send('We face some issue with this data , try another one ');
    })
}

let allParksObj = [];

function ParksObjects(name, address, fees, description, url) {
    this.name = name;
    this.address = address;
    this.fees = fees;
    this.description = description;
    this.url = url;
    allParksObj.push(this);
}

function handleParks(request, response) {
    allParksObj = [];
    let city = request.query.search_query;
    let keyParks = process.env.PARKS_API_KEY;
    let url = `https://developer.nps.gov/api/v1/parks?q=${city}&api_key=${keyParks}&limit=10`
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
        response.send(allParksObj);
        // console.log(allParksObj);
    }).catch(error => {
        console.log('ERROR FROM API', error);
        response.status(500).send('We face some issue with this data , try another one ');
    })
};
let allMovies = [];

function MovieObject(title, overview, average_votes, total_votes, image_url, popularity, released_on) {
    this.title = title;
    this.overview = overview;
    this.average_votes = average_votes;
    this.total_votes = total_votes;
    this.image_url = image_url;
    this.popularity = popularity;
    this.released_on = released_on;
    allMovies.push(this);
}

function handleMovies(request, response) {
    allMovies = [];
    let city = request.query.search_query;
    let keyMovies = process.env.MOVIE_API_KEY;
    let url = `http://api.themoviedb.org/3/movie/top_rated?api_key=${keyMovies}&query=${request.query.city}`;
    superagent.get(url).then(result => {
        // console.log(result.body.results);
        let data = result.body.results;
        data.slice(0, 10).map(element => {
            let pathImage = 'https://image.tmdb.org/t/p/w500/' + element.poster_path;
            let newMovieItem = new MovieObject(element.title, element.overview, element.vote_average, element.vote_count, pathImage, element.popularity, element.release_date)
        });
        response.send(allMovies);
    }).catch(error => {
        console.log('ERROR FROM API', error);
        response.status(500).send('We face some issue with this data , try another one ');
    })
}
let allYelps = []

function YelpObject(name, image_url, price, rating, url) {
    this.name = name;
    this.image_url = image_url;
    this.price = price;
    this.rating = rating;
    this.url = url;
    allYelps.push(this);
}
let oldFive = 0;

function handleYelp(request, response) {
    allYelps = [];
    let yelpKey = process.env.YELP_API_KEY;
    let url = `https://api.yelp.com/v3/businesses/search?term=restaurants&location=${request.query.search_query}&limit=25`;
    superagent.get(url).set('Authorization', `Bearer ${yelpKey}`).then(data => {
        console.log(data.body.businesses);
        let dataServer = data.body.businesses
        dataServer.map(result => {
            let newYelp = new YelpObject(result.name, result.image_url, result.price, result.rating, result.url);
        })
        return allYelps;
    }).then(element => {
        let newFive = oldFive + 5;
        let fiveArr = allYelps.slice(oldFive, newFive);
        oldFive + 5;
        response.send(fiveArr)
    }).catch(error => {
        console.log('ERROR', error);
        response.status(500).send('So sorry, something went wrong.');
    });


}
client.connect().then(() => {
    console.log('you are connect with database ,good luck');
    app.listen(PORT, () => console.log(`app is runing in ${PORT} and the city is `));
})