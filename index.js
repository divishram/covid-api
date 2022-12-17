const axios = require("axios");
const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const res = require("express/lib/response");
var urlEncodedParser = bodyParser.urlencoded({extended: false});

const PORT = process.env.PORT || '8080';

//JSON variable elements
//covid display numbers
var totalCases, deaths, criticalCases;

//display country info
var countryFlagSvg, coatOfArms, population, googleMapsUrl, openMapsUrl;

//open data info
var capitalCity, region, incomeLevel;

const app = express();

app.set('port', PORT);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", {title: "Home"});
});

app.get("/", (req, res) => {
    res.render("api-page", {something: "hello"});
});

app.post("/", urlEncodedParser, (req, res) => {
    let countryName = req.body.country;
    console.log(countryName);

    //displayCountryInfo();
    displayCovidNumbers(countryName);
    displayCountryInfo(countryName);
    openData(countryName);
    
    //I had issues using async and await but if I put the render inside a setTimeout it was able to 
    //display the api data if I set it to 6 seconds
    setTimeout(() => {
        
        res.render("api-page", {
            data: req.body.country,

            //covid api
            totalCases: totalCases,
            deaths: deaths,
            criticalCases: criticalCases,

            //country api
            countryFlagSvg: countryFlagSvg,
            coatOfArms: coatOfArms,
            population: population,
            googleMapsUrl,
            openMapsUrl,

            //open data source
            capitalCity: capitalCity,
            region: region,
            incomeLevel: incomeLevel
        });         
    }, 6000);
});

app..listen(process.env.PORT || 5000);

function displayCovidNumbers(countryToSearch) {
    axios.get(`https://disease.sh/v3/covid-19/countries/${countryToSearch}?strict=true`)
        .then(function (response) {

            totalCases = response.data.cases;
            deaths = response.data.deaths;
            criticalCases = response.data.critical;

        })
        .catch(function (error) {
            console.log(error);
        })
}

function displayCountryInfo(countryToSearch) {
    axios.get(`https://restcountries.com/v3.1/name/${countryToSearch}`)
        .then(function (response) {
            countryFlagSvg = response.data[0].flags.svg;
            coatOfArms = response.data[0].coatOfArms.svg;
            population = response.data[0].population;
            googleMapsUrl = response.data[0].maps.googleMaps;
            openMapsUrl = response.data[0].maps.openStreetMaps;
            
            console.log(googleMapsUrl);    
            console.log(openMapsUrl);
            
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        })
  
}

function openData(countryToSearch) {

   axios.get(`http://api.worldbank.org/v2/country?format=json&per_page=299`)
        .then(function (response) {
            const info = response.data[1]; //index 1 because 0 is JSON info like page, total, per_page etc.
            var countryNumber;

            //for loop to find out which number the country is in
            for (let i = 0; i < 299; i++) {
                if (info[i].name === countryToSearch) {
                    countryNumber = i;           
                }
            }
                        
            //get data according to country number
            incomeLevel = (info[countryNumber]["incomeLevel"]["value"]);
            region = (info[countryNumber]["region"]["value"]);
            capitalCity = (info[countryNumber]["capitalCity"]);
        })
        .catch(function (error) {
            console.log(error);
        });
    }
