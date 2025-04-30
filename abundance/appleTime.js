

console.log(orchardsData)
//  –––––––––––––––––––––––––––––––––––––––– Global vars, misc  ––––––––––––––––––––––––––––––––––––––––
// Colors from Paletton (light to dark)
// #9F87D6
// #785BBC
// #5D3DA8 -> DATA POINT SHADE
// #46209E
// #321479

var lightPurple = "#9F87D6"
var darkPurple = "#321479"

const appleLayerName = 'orchardsLayer'
const mapboxSourceName = 'orchardsSource'



// var baseZoom = 5
// var baseCenter = [-120.420, 45.668123]


var baseZoom = 5.75
var baseCenter = [-120.420, 45.448123]



var currentID = 0
var currentDiv 
var pointID
// const expandButton = document.getElementById('expandButton')
const orchardContainer = document.getElementById('orchardContainer')

var breedList = []
var breedCount = 0
var filterBreeds = []

var matchFilter = ['all']

var washingtonBorderLayers = ['washingtonBottom', 'washingtonMiddle', 'washingtonTop']
var oregonBorderLayers = ['oregonBottom', 'oregonMiddle', 'oregonTop']

var currentBreeds
var isMobile = false


// –––––––––––––––––––––––––––––––––––––––– END  ––––––––––––––––––––––––––––––––––––––––


if (window.innerWidth <= 800){
  isMobile = true
  baseZoom = 5
  baseCenter = [-120.420, 45.668123]
  d3.select('#orchardContainer').classed('mobileOrchard', true)
  d3.select('#filterTab').classed('mobileFilterTab', true)
  d3.select('#listContent').classed('hideMobileListContent', true)
}



// –––––––––––––––––––––––––––––––––––––––– MAP HANDLERS –––––––––––––––––––––––––––––––––––––––– 
const bounds = [
  [-137.2102074123973, 35.98336280311873], // Southwest coordinates
  [-102.43831658760334, 51.77076348214101] // Northeast coordinates
];


mapboxgl.accessToken = 'pk.eyJ1IjoiZGxlZ2c0OCIsImEiOiJjbHBpcjhucDkwMXp5MmxvdXZ4OTA3ajIzIn0.VrClHW1R9SYZLfcmTzvrLA';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/dlegg48/cm56a2w8200ls01sp05spgje9',
  center: baseCenter, // Starting position [lng, lat]
  zoom: baseZoom,
  minZoom: 5,
  maxZoom: 11.9,
  maxBounds: bounds  
});

map.getCanvas().style.cursor = 'auto';
map.dragRotate.disable()
map.touchZoomRotate.disableRotation();

// mobile zoom
map.addControl(new mapboxgl.NavigationControl({visualizePitch: true}), 'top-right');


map.addControl(new mapboxgl.NavigationControl({visualizePitch: true}), 'bottom-right');


const mapTitle = document.getElementById("mapTitle")
mapTitle.addEventListener("animationend", function() {
  mapTitle.style.display = "none";
});


map.on('click', 'landcover', () => {
  console.log('landcover click')
  if (clickedPoint || (currentDiv!=undefined && (currentDiv.classList.contains('clicked')))) {
    // clearPanel()
    noHover(currentID)
    clearOrchardContainer()
    d3.selectAll('.selectedOrchard').classed('selectedOrchard', false)
  }
})
map.on('click', 'water', () => {
  if (clickedPoint || (currentDiv!=undefined && (currentDiv.classList.contains('clicked')))) {
    // clearPanel()
    noHover(currentID)
    clearOrchardContainer()
    d3.selectAll('.selectedOrchard').classed('selectedOrchard', false)
  }
})
// –––––––––––––––––––––––––––––––––––––––– END –––––––––––––––––––––––––––––––––––––––– 

$("#openFilters").click(function() {
  console.log('open editing')
  if(orchardContainer.style.display == 'none'){
    d3.select('#orchardContainer').style('display', 'flex')
    d3.select('#openFilters').style('background-color', lightPurple)
  } else {
    d3.select('#orchardContainer').style('display', 'none')
    d3.select('#openFilters').style('background-color', '#785BBC')

  }
  
});

var clickedPoint = false

// –––––––––––––––––––––––––––––––––––––––– START MAP.LOAD ––––––––––––––––––––––––––––––––––––––––
map.on('load', () => {
  // console.log(breedList)
  if(isMobile){
    map.setLayoutProperty('Pacific Ocean Label', 'text-offset', [1,0]);
  } else {
    // map.setLayoutProperty('Pacific Ocean Label', 'text-offset', [1,0]);
  }
  

  map.addSource('orchardsSource', {
    "type": 'geojson',
    'data': orchardsData
    
  })

  $('#totalCount').html(orchardsData.features.length)

  
  map.addLayer({
    'id': 'orchardsLayer',
    'type': 'circle',
    'source': 'orchardsSource',
    'paint': {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          5, 4, 
          9, 12
        ],
        'circle-stroke-width': 2,
        'circle-color': '#5d3da8',
        'circle-stroke-color': '#49ffff',        
    }
  });
  

  map.setPaintProperty(appleLayerName, 'circle-color', [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    '#F7E922',
    '#785BBC'
  ]);
  map.moveLayer('Washington-Label')
  map.moveLayer('Oregon label')


  map.on('mouseenter', appleLayerName, (e) => {
    console.log('mouseeneter')
    map.getCanvas().style.cursor = 'pointer';

    if(clickedPoint){
      console.log('popup Open')
    } else {
      var id = e.features[0].properties.id
      currentID = id
  
      setPopupContent(e)
      yesHover(currentID)
  
    }
  })

  map.on('mouseleave', appleLayerName, (e) => {
    map.getCanvas().style.cursor = 'auto';
    // e is the data point and its features -> e.features for geojson object 
    if(clickedPoint){
      console.log('popup open')
    } else{
      popup.remove()
      noHover(currentID)    
    }
  
  })

  map.on('click', appleLayerName, (e) => {
    clickedPoint=true
    // CLEAR OLD HIGHLIGHT FIRST
    noHover(currentID)
    var id = e.features[0].properties.id
    currentID=id
      
    setPopupContent(e)
    yesHover(currentID)
  
  })
  

  runLayerQuery()

  document.getElementById('breedContent').addEventListener('change', function(event) {
    const checkbox = event.target;

    if (checkbox.matches('.breedItem input[type="checkbox"]')) {
        const label = checkbox.closest('label');
        var breedName = label.querySelector('.breedName').textContent;
        
        if (checkbox.checked) {
            addBreed(breedName);
        } else {
            deleteBreed(breedName);
        }
    }
});

}); 
// –––––––––––––––––––––––––––––––––––––––– END MAP.LOAD ––––––––––––––––––––––––––––––––––––––––
  

// ––––––––––––––––––––––––––––––––––––––––  Function Time –––––––––––––––––––––––––––––––––––––––– 
// sets TRUE hover feature state of circle
function yesHover(pointID){
  // console.log('yesHover()',pointID)
  map.setFeatureState(
    { source: 'orchardsSource', id: pointID},
    { hover: true }
  );
}
// sets FALSE hover feature state of cicrle
function noHover(pointID){
  // console.log(pointID)
  map.setFeatureState(
    { source: 'orchardsSource', id: pointID},
    { hover: false }
  );
}

function showBreeds(){
  if(window.innerWidth <= 800){
    d3.select('#listContent').classed('hideMobileListContent', false)
    d3.select('#listContent').classed('mobileListContent', true)
    d3.select('#closeMobileOrchards').style('z-index', '9')
    d3.select('#mobileOrchardGrouped').style('z-index', '8')
  }
  d3.select('#greyMask').style('display', 'block')
  d3.select('#listContent').style('display', 'block')
  d3.select('#breedList').html(currentOrchardBreeds)

}

let currentOrchardName, currentOrchardAddress, currentOrchardGMaps, currentOrchardPhone, currentOrchardBreeds;
let orchardInfo

var popup = new mapboxgl.Popup({className: ''});
popup.on('close', () => {
  console.log('popup was closed');
  clickedPoint=false
  noHover(currentID)
});

function expandPopup(){
  console.log('expandPopup()')
  const expandedContent = `
    <div class="panelContentContainer">
      <h1 class="panelName">${currentOrchardName}</h1>
      <p class="panelText kanitMedium">
        Address: <a class="infoAddress" href=${currentOrchardGMaps} target="_blank">${currentOrchardAddress}</a>
      </p>
      <div class="panelText kanitMedium">
        Phone: ${currentOrchardPhone}
      </div>
      <div class="containerBreeds panelText kanitMedium" onclick="showBreeds()">
        Breeds: ${currentOrchardBreeds}
      </div>
      <div class='expandContainer' onclick="collapsePopup()">
        <div class="panelText kanitMedium">Less info</div>
        <img src="img/doubleUp.png">
      </div>
    </div>
  `;
  popup.setHTML(expandedContent).setMaxWidth("300px")
  ;
}

function collapsePopup() {
  popup.setHTML(orchardInfo);
}

// sets the information in the top right info panel.
function setPopupContent(e, idx=0){
  console.log('setPopupContent()', e)
  const coordinates = e.features[idx].geometry.coordinates.slice();
  const rawBreedData = e.features[idx].properties.Breeds;
  currentOrchardName = e.features[idx].properties.orchardName;
  currentOrchardAddress = e.features[idx].properties.Address
  currentOrchardGMaps = e.features[idx].properties.GMapsLink
  currentOrchardPhone = e.features[idx].properties.PhoneNumber
  currentOrchardBreeds = rawBreedData.toString().replace('[', '').replace(']', '').replaceAll('"', '').replaceAll(',', ', ')

  orchardInfo = `
      <div class="panelContentContainer">
        <h1 class=panelName>${currentOrchardName}</h1>
        <p class="panelText kanitMedium">
          Address: <a class="infoAddress" href=${currentOrchardGMaps} target="_blank">${currentOrchardAddress}</a>
        </p>
        <div class='expandContainer' onclick="expandPopup()">
          <div class="panelText kanitMedium">More info</div>
          <img src="img/doubleDown.png">
        </div>
      </div>
    `;

  popup
      .setLngLat(coordinates)
      .setHTML(orchardInfo)
      .setMaxWidth("300px")
      .addTo(map);

}

popup.on('close', () => {
  console.log('popup was closed');
  noHover(currentID)
});


// clears the information in the top right info panel, and the highlighted circle
// function clearPanel(){
//   noHover(currentID)
//   clickedPoint=false
//   // clearButton.style.display='none'
//   if(currentDiv){
//     currentDiv.classList.remove('clicked')
//     currentDiv.style.backgroundColor = "#785BBC"
//   }
// }

function findPropertiesById(featureCollection, id) {
  const feature = featureCollection.features.find(f => f.id === id);
  return feature ? feature.properties : null;
}

// clears panel and then highlights the circle that the sidebar selection is
function containerClick(orchard){
  console.log('containerClick()', orchard)
  clearOrchardContainer()

  const breedsContent = orchard.querySelector('.containerBreeds').innerHTML;
  console.log(breedsContent)
  currentOrchardBreeds = breedsContent

  currentDiv = orchard
  var orchardName = orchard.id.slice(4,).replaceAll('_', ' ')

  // new point logic here -> update pointId with pointID = function(orchard name)
  pointID = getOrchardIdx(orchardName)

  console.log('POINT ID =', pointID)
  currentID=pointID
  currentDiv.classList.add('clicked')

  // setPopupContent(orchardsData, idx=pointID)

  // if panel does not have clicked class onto it
  if(!clickedPoint){
    console.log(pointID-1)
    clickedPoint=true
    // clearButton.style.display='block'
    currentDiv.style.backgroundColor = lightPurple
    yesHover(pointID)
  }

  d3.select(orchard).classed('selectedOrchard', true)

}

// on click of land, water, or exit button clear the side bar highlight and panel
function clearOrchardContainer(){
  console.log('clearOrchardContainer')
  noHover(currentID)
  clickedPoint=false
  if(currentDiv){
    currentDiv.style.backgroundColor = "#785BBC"
  }
  d3.selectAll('.selectedOrchard').classed('selectedOrchard', false)

}

// expands div
function changeOrchardContainerSize(){
  // mobile handler
  if(window.innerWidth <= 800){
    console.log('mobile time!')
    d3.select('#mobileOrchardGrouped').style('display', 'block')
    d3.select('#mobileOrchardGrouped').style('z-index', '10')

    d3.select('#greyMask').style('display', 'block')
    d3.select('#closeMobileOrchards').style('display', 'block')
  } else  { // desktop handler
    console.log('desktop handler height', orchardContainer.style.height)
      // this expands the div
      if(window.getComputedStyle(orchardContainer).height === '64px'){
        console.log('expand container desktop')
        if(window.innerHeight <= 600 ){
          orchardContainer.style.height = '50%'
        }
        else{
          orchardContainer.style.height = '75%'
        }
      } else if (orchardContainer.style.height === '75%'){ // shrink the div
        console.log('shrink container desktop')
        orchardContainer.style.height = '4em'
    }
  }
}

function clearStateIcons(){
  d3.select('#washingtonButton').classed('lightBackground', false)
  d3.select('#oregonButton').classed('lightBackground', false)
  d3.select('#washingtonButton').style('border-style', 'outset')
  d3.select('#oregonButton').style('border-style', 'outset')
  d3.selectAll('.oregon').style('display', 'block')
  d3.selectAll('.washington').style('display', 'block')
  document.getElementById("washImage").src="img/washOutline.png"
  document.getElementById("oregonImage").src="img/oregonOutline.png"
  d3.select('#oregonDark').style('display', 'none')
  d3.select('#washDark').style('display', 'none')
}

// handles reset button functions
function resetButton(){
  clearOrchardContainer()
  // clearPanel()
  clearBreeds()
  resetStateBorderColor()
  clearStateIcons()
  runLayerQuery()
  popup.remove()
}

// {
//   "id": 1,
//   "orchardName": "Lopez Orchards",
//   "City": "Yakima",
//   "State": "Washington",
//   "Breeds": [
//       "Red Delicious",
//       "Golden Delicious",
//       "Gala",
//       "Honeycrisp",
//       "Cosmic Crisp"
//   ],
//   "Address": "121 Ehler Rd, Yakima, WA 98908",
//   "GMapsLink": "https://www.google.com/maps/place/Lopez+Orchard/@46.6262081,-120.6284517,15z/data=!4m6!3m5!1s0x54976090b697be21:0x1be8314a12a72567!8m2!3d46.6265404!4d-120.6236212!16s%2Fg%2F1tfbhfs4?entry=ttu",
//   "PhoneNumber": "(509) 966 4697",
//   "Website": ""
// }

function filterData(data){
  console.log('filterData()')
  let newData = data.features.filter( data => {
    let washingtonConditional = (d3.select('#washingtonButton').style('border-style')) == 'inset' ? data.properties.State == 'Washington' : true
    let oregonConditional = (d3.select('#oregonButton').style('border-style')) == 'inset' ? data.properties.State == 'Oregon' : true
    let breedConditional = (filterBreeds.length > 0) ? data.properties.Breeds.some(breed => filterBreeds.includes(breed)) : true 
    
    return washingtonConditional && oregonConditional && breedConditional
  })
  return newData

}

// updates the directory panel with new filtered orchards
function updateOrchards(data){
  console.log('updateOrchards()')
  document.getElementById('orchardGrouped').innerHTML = null
  document.getElementById('mobileOrchardGrouped').innerHTML = null
  for(orchard of data){
      oName = orchard.properties.orchardName
      oState = orchard.properties.State
      oAddress = orchard.properties.Address
      oGMaps = orchard.properties.GMapsLink
      oPhone = orchard.properties.PhoneNumber
      oCity = orchard.properties.City
      var myBreeds = orchard.properties.Breeds
      var htmlBreeds = myBreeds.toString().replace('[', '').replace(']', '').replaceAll('"', '').replaceAll(',', ', ')

      // console.log(mybreeds.toString())
      if(htmlBreeds.toString() === ''){
        // console.log('NO BREEDS')
        htmlBreeds = 'No breed data!'
      }
      // console.log('htmlBreeds', htmlBreeds)
      // var idx = parseInt(orchardIDX)+1
      // divName = "info" + (idx).toString()
      divName = "info"+oName.replaceAll(' ', '_')
      var div = document.createElement('div')
      div.id = divName
      div.classList.add('scrollInfo')
      div.setAttribute("onclick", `containerClick(this)`);
    
      if(oState == 'Washington'){
        div.classList.add('washington')
        div.innerHTML = `
          <h1 class="containerOrchardName kanitMedium oneLineTruncate"><u>${oName}</u></h1>
          <p class="containerOrchardText kanitMedium">
          <span class="oneLineTruncate">
          Address: <a class="infoAddress" href=${oGMaps} target="_blank"> ${oAddress} </a><br>
          </span>
          <span>
          Phone Number: ${oPhone}<br>
          </span>
          <span class="containerBreeds" onclick="showBreeds()">
          Breeds: ${htmlBreeds}<br>
          </span>
          </p>
      `;
      } else {
        div.classList.add('oregon')
        div.innerHTML = `
          <h1 class="containerOrchardName kanitMedium oneLineTruncate"><u>${oName}</u></h1>
          <p class="containerOrchardText kanitMedium">
          <span class="oneLineTruncate">
          Address: <a class="infoAddress" href=${oGMaps} target="_blank"> ${oAddress} </a><br>
          </span>
          <span>
          Phone Number: ${oPhone}<br>
          </span>
          <span class="containerBreeds" onclick="showBreeds()">
          Breeds: ${htmlBreeds}<br>
          </span>
          </p>
      `;
      }
      document.getElementById('orchardGrouped').appendChild(div)
    
    // }
  }
  let $el = $('#orchardGrouped').children().clone()
  $('#mobileOrchardGrouped').append($el)
}

var filteredIDs
// updates ID for map.setFilter, updates Breeds for dynamic filter
function updateDataCounts(data){
  console.log('updateDataCounts()')
  filteredIDs = []
  breedList = []
  document.getElementById('breedContent').innerHTML = ''

  data.forEach((orchard) => {
    // console.log(orchard)
    var id = orchard.properties.id
    filteredIDs.push(id)

    try{ 
      var breeds = orchard.properties.Breeds
      breeds.forEach((appleBreed) => {
          // console.log(appleBreed)
          if(!breedList.includes(appleBreed)){
            // console.log('new apple!')
            breedList.push(appleBreed)
          }
      })
    } catch (error) {
      console.log('no apple Breeds')
    }
    breedList.sort()
  })

  // loop through breedList
  for(var breed of breedList){
    var isChecked = filterBreeds.includes(breed) ? 'checked' : '';
    var divContent = document.createElement('div')
    divContent.classList.add('breedItem')  
    divContent.innerHTML = `
      <label class="container">
        <input type="checkbox" ${isChecked}>
        <span class="checkBox"></span>
        <p class=breedName>${breed}</p>
      </label>
    `
    document.getElementById('breedContent').appendChild(divContent)
  }
  
}

function runLayerQuery(){
  console.log('runLayerQuery()')
  let filteredOrchards = filterData(orchardsData)
  console.log('filteredOrchards =',filteredOrchards.length)
  updateDataCounts(filteredOrchards)
  updateOrchards(filteredOrchards)

  map.setFilter('orchardsLayer', [
    'match',
    ['get', 'id'],
    filteredIDs,  
    true,     
    false       
  ])

  $('#activeCount').html(filteredOrchards.length)

}

function colorBorder(state){
  if(state == 'Washington'){
    washingtonBorderLayers.map( (layer) => 
      map.setPaintProperty(
        layer, 
        'line-color', 
        '#5D3DA8'
      )
    );
    map.moveLayer('oregonBottom', 'washingtonBottom')
    map.moveLayer('oregonMiddle', 'washingtonMiddle')
    map.moveLayer('oregonTop', 'washingtonTop')

  } else if (state == 'Oregon'){
    oregonBorderLayers.map((layer) => 
      map.setPaintProperty(
        layer, 
        'line-color', 
        '#5D3DA8'
      )
    );
    map.moveLayer('washingtonBottom', 'oregonBottom')
    map.moveLayer('washingtonMiddle', 'oregonMiddle')
    map.moveLayer('washingtonTop', 'oregonTop')

  }
}

function colorStateFilter(state){
  console.log('colorStateFilter()')
  if((d3.select('#washingtonButton').classed('lightBackground') && state == 'Washington') || (d3.select('#oregonButton').classed('lightBackground') && state == 'Oregon')){
    console.log('RECLICK CANCEL BURN IT ALL DOWN')
    clearStateIcons()
    resetStateBorderColor()
  } else {
    clearStateIcons()
    resetStateBorderColor()
    if( (state == 'Washington') ){
      console.log('coloring washington')
      d3.select('#washingtonButton').classed('lightBackground', true)
      d3.select('#oregonButton').classed('lightBackground', false)
      d3.select('#washingtonButton').style('border-style', 'inset')
      d3.select('#oregonButton').style('border-style', 'outset')
      d3.selectAll('.oregon').style('display', 'none')
      document.getElementById("washImage").src="img/washFilled.png"
      d3.select('#washDark').style('display', 'inline')
      colorBorder(state)

    } else if (state == 'Oregon'){
      console.log('coloring OREGON')

      d3.select('#washingtonButton').classed('lightBackground', false)
      d3.select('#oregonButton').classed('lightBackground', true)
      d3.select('#oregonButton').style('border-style', 'inset')
      d3.select('#washingtonButton').style('border-style', 'outset')
      d3.selectAll('.washington').style('display', 'none')
      document.getElementById("oregonImage").src="img/oregonFilled.png"
      d3.select('#oregonDark').style('display', 'inline')
      colorBorder(state)

    }
  }
}

function resetStateBorderColor(){
  oregonBorderLayers.map((layer) => 
    map.setPaintProperty(
      layer, 
      'line-color', 
      '#ffffff'
  ));

  washingtonBorderLayers.map((layer) => 
  map.setPaintProperty(
    layer, 
    'line-color', 
    '#ffffff'
  ));
}

function closeBreedList(){
  d3.select('#listContent').style('display', 'none')
  if(!window.innerWidth <= 800){
    d3.select('#greyMask').style('display', 'none')
  }
}

function closeHelp(){
  console.log('closeHelp()')
  d3.select('#greyMask').style('display', 'none')
  d3.select('#howTo').style('display', 'none')
  d3.select('#listContent').style('display', 'none')

  let titleFade = false
  if(window.innerWidth <= 800){
    if(titleFade === false){
      titleFade = true
      setTimeout(function(){
        d3.select('#mapTitle').classed('fadeTitle', true)
      }, 500)
    }
    d3.select("#mapTitle").classed('fadeTitle', true)
    console.log('mobile info panel')
    // clearPanel()
    d3.select('#closeMobileOrchards').style('z-index', '11')
  
  }

  if(!d3.select('#breedSelector').style('display', 'none')){
    d3.select('#breedSelector').style('display', 'none')
  }

  if(!d3.select('#dataViewer').style('display', 'none')){
    d3.select('#dataViewer').style('display', 'none')
  }

  // if(!d3.select('#mobileOrchardGrouped').style('display', 'none')){
  //   console.log('here')
    d3.select('#mobileOrchardGrouped').style('display', 'none')
    d3.select('#closeMobileOrchards').style('display', 'none')
  // }



}

function openHelp(){
  d3.select('#greyMask').style('display', 'block')
  d3.select('#howTo').style('display', 'flex')
}

function openBreedSelector(){
  d3.select('#greyMask').style('display', 'block')
  d3.select('#breedSelector').style('display', 'block')
}

function addBreed(breedName){
  breedCount+=1
  document.getElementById('count').innerHTML = breedCount
  filterBreeds.push(breedName)
  console.log(filterBreeds)
}

function deleteBreed(breedName){
  breedCount-=1
  document.getElementById('count').innerHTML = breedCount
  var idx = filterBreeds.indexOf(breedName)
  filterBreeds.splice(idx, 1)
  // console.log(filterBreeds)

}

function clearBreeds(){
  breedCount = 0
  document.getElementById('count').innerHTML = breedCount
  document.querySelectorAll('#breedContent input[type="checkbox"]').forEach(function(checkbox) {
    checkbox.checked = false;
  });
  filterBreeds = []
}

function getOrchardIdx(name){
  console.log('getOrchardIdx()',name)
  for(var orchard of orchardsData.features){
    // console.log(orchard)
    if(orchard.properties.orchardName == name){
      // console.log('GOT IT at', name)
      var idx = orchard.properties.id
      break
    }
  }
  return idx
}

// on click of home icon
function returnHome(){
  console.log('returnHome()')
  map.flyTo({
    center: baseCenter, 
    zoom: baseZoom
  })
}

