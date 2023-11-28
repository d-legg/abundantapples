const orchardData = {
    "O'Brien Farms": {
      "lat-long": [46.28025734543195, -119.64109341314949],
      "location": "Prosser, Washington",
      "Breeds": ["Fuji", "Gala", "Granny Smith", "Red Delicious", "Pink Lady", "Koru", "Cosmic Crisp"]
    },
    "Lopez Orchards": {
      "lat-long": [46.628486412788966, -120.61752802081268],
      "location": "Cowiche, Washington",
      "Breeds": ["Red Delicious", "Golden Delicious", "Gala", "Honeycrisp", "Cosmic Crisp"]
    },
    "MM Orchards": {
      "lat-long": [47.26169587761203, -119.76834856415466],
      "location": "Quincy, Washington",
      "Breeds": ["Gala", "KIKU", "Ambrosia", "Fuji", "Honeycrisp", "Red Delicious", "Cosmic Crisp"]
    },
    "CMI Orchards": {
      "lat-long": [47.40253871145277, -120.2168894497705],
      "location": "Wenatchee, Washington",
      "Breeds": ["KIKU", "Kanzi", "Smitten", "Honeycrisp", "Gala"]
    },
    "Orondo Orchards": {
      "lat-long": [47.64894823648951, -120.2112153258481],
      "location": "Orondo, Washington",
      "Breeds": ["Gala", "Honeycrisp", "Fuji", "Envy", "Sugarbee"]
    },
    "Carleton Orchards": {
      "lat-long": [47.91591124734381, -120.18478961563386],
      "location": "Manson, Washington",
      "Breeds": ["Golden Delicious", "Granny Smith", "Fuji", "Honeycrisp", "Pink Lady", "Cosmic Crisp", "Gala"]
    },
    "Stennes Orchards": {
      "lat-long": [48.072853596587805, -119.91999929125791],
      "location": "Pateros, Washington",
      "Breeds": ["Fuji", "Honeycrisp", "Gala", "Granny Smith", "Golden Delicious"]
    },
    "Schoenwald Orchards": {
      "lat-long": [48.10160403087789, -119.78816159736691],
      "location": "Brewster, Washington",
      "Breeds": ["Cosmic Crisp", "Pink Lady", "Rockit", "Sugarbee", "Gala", "Golden Delicious", "Red Delicious", "Granny Smith", "Honeycrisp"]
    }
  }

var map = L.map('map', {
    zoomControl: false
}).setView([47.4235, -120.3103], 7)

// BASE MAP LAYER
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Orchard data layer
const orchardLayer = L.esri.featureLayer({
    url: 'https://services5.arcgis.com/W1uyphp8h2tna3qJ/arcgis/rest/services/appleData/FeatureServer/0',
    style:{
        color: 'orchid'
    }

}).addTo(map);

// adding zoom features on top right of map
L.control.zoom({ position: 'topright' }).addTo(map);

let myTab = document.getElementById("actionTab")
let clearButton = document.getElementById("clearButton")

// Container for markers
const markers = []

// Container for breeds
const appleBreeds = ["Pink Lady", "Fuji", "Envy", "Sugarbee", "Kanzi", "Rockit", "Smitten", "Gala", "Ambrosia", "Honeycrisp", "Red Delicious", "Golden Delicious", "Koru", "Cosmic Crisp", "Granny Smith"]

// Populate select element
selectElement = document.getElementById("appleID")
selectElement.innerHTML = ""

// default option
var defaultOption = document.createElement("option");
defaultOption.value = "start";
defaultOption.text = "Select your apple!";
defaultOption.selected = true;
defaultOption.hidden = true;
selectElement.add(defaultOption);

// options for breeds in list
appleBreeds.forEach(function (breed) {
    var option = document.createElement("option");
    option.value = breed;
    option.text = breed;
    selectElement.add(option);
});

// Create markers
function orchardMarkers(){
    // Clear previous markers and divs
    markers.forEach(marker => map.removeLayer(marker));
    document.getElementById("orchardsContainer").innerHTML = ""

    console.log("hit")

    // Get the select element
    var selectElement = document.getElementById("appleID");
    var selectedOption = selectElement.options[selectElement.selectedIndex];
    var selectedText = selectedOption.textContent;

    // Get the orchard container 
    var containerDiv = document.getElementById("orchardsContainer")

    for(var orchard in orchardData){
        var latLng = orchardData[orchard]["lat-long"]
        var location = orchardData[orchard]["location"]
        var breedList = orchardData[orchard]["Breeds"]

        var orchardDiv = document.createElement('div')

        if(orchardData[orchard]["Breeds"].includes(selectedText)){
            const marker = L.marker(latLng).addTo(map)
            markers.push(marker)
            marker.bindPopup(`<p>Orchard name: ${orchard}<br>Orchard location: ${location}<br> Breeds grown here: ${breedList.join(",&nbsp;")}</p>`)
            
            // New divs here? when the normal markers trigger --> same orchards
            orchardDiv.innerHTML = "woah"
            orchardDiv.classList.add("orchardPanel")
            containerDiv.appendChild(orchardDiv)
        }
    } 
    
} 

function appleTime(){
    console.log("it's apple time")
    myTab.style.display = "block"
    clearButton.style.display = "block"
    // Move apple time tab, display img
}

function clearMap(){
    myTab.style.display = "none"
    clearButton.style.display = "none"
    document.getElementById("appleID").value = "start"
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
}

