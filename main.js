/* Wind & Wetter Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true
}).setView([ibk.lat, ibk.lng], 5);

// thematische Layer
let themaLayer = {
    forecast: L.featureGroup().addTo(map),
    wind: L.featureGroup().addTo(map),
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery").addTo(map)
}, {
    "Wettervorhersage MET Norway": themaLayer.forecast,
    "ECMWF Windvorhersage": themaLayer.wind,
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// Wettervorhersage MET Norway
async function showForecast(url) {
    let response = await fetch(url);
    let jsondata = await response.json();

 // aktuelles Wetter und Wettervorhersage implementieren
    console.log(jsondata);
    L.geoJSON(jsondata,{
        pointToLayer: function(feature, latlng) {
            let details = features.properties.timeseries [0].data.instant.details;
            let time = new Date(feature.properties.timeseries[0].time);
            let content= `
                <h4> Wettervorhersage für ${time.toLocaleString()}</h4>
                <ul> 
                    <li> Luftdruck (hPa): ${details.air_pressure_at_sea_level} </li>
                    <li> Lufttemperatur (°C): ${details.air_temperature} </li>
                    <li> Bewölkungsgrad (%): ${details.cloud_area_fraction} </li>
                    <li> Luftfeuchtigkeit (%): ${details.relative_humidity} </li>
                    <li> Windrichtung (°): ${details.wind_from_direction} </li>
                    <li> Windgeschwindigkeit (km/h): ${Math.round(details.wind_speed *3.6)} </li>
                </ul>
            `;

//Wettericons für die nächsten 24 Stunden in 3-Stunden Schritten (mit for-Schleife und mit let definieren wir jedes Mal ein neues Icon)

        for (let i= 0; i <= 24; i +=3) {
            let symbol= feature.properties.timeseries[i].data.next_1_hours.summary.symbol_code;
            let time= new Date (feature.properties.timeseries[i].time);
            content += `<img src="icons/${symbol}.svg" alt="${symbol}" sytle "width: 32px" title="${time.toLocaleString()}" >`;
        }
       
 //Link für Datendownload (+= bedeutet, dass wir was zum Popup anhängen, wenn ich ohne + mache, wird mein alter Content überschrieben)

content += ` 
<p> <a href="${url}" target="met.no" >Daten downloaden </a></p>

`
// Hier endet dann der Inhalt des Popups 
           L.popup(lat,lng, {
                content: content 
        }) .openOn(themaLayer.forecast);
        }
    }).addTo(themaLayer.forecast);
}
//showForecast("https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=47.267222&lon=11.392778");
// wenn ich map fire auslösen will, muss ich obriges showForecast "deaktivieren", also als  Kommentar schreiben 
//hie wollen wir, dass wenn man auf die Karte klickt, eine Sache (Wb.) entsteht
map.on("click", function (evt) {
    console.log(evt);
    console.log(evt.latlng.lat, evt.latlng);
});
showForecast(`https://api.met.no/weatherapi/locationforecast/2.0/compact?evt.lat=${evt.latlng.lat} &lon=${evt.latlng.lng} `);

// Klick auf Innsbruck simulieren (brauchen wir nicht oft, aber nicht schlecht)
map.fire("click", {
latlng: ibk
});

//Windkarte erstellen -_> dafür brauchen wir eine funktion 

async function loadWind(url) {
    const response = await fetch(url);
    const jsondata = await response.json();
    console.log(jsondata);
    L.velocityLayer ({
        data:jsondata,
        lineWidth: 2,
        displayOptions: {
            directionString: "Windrichtung",
            speedString: "WIndgeschwindigkeit",
            speedUnit:"k/h",
            position: "bottomright", 
            velocityType: "",
        }
    }).addTo(themaLayer.wind);

    //Vorhersagezeitpunkt ermitteln

    let forecast = new Date(jsondata[0].header.refTime);
    console.log(forecastDate);  


}
loadWind("https://geographie.uibk.ac.at/data/ecmwf/data/wind-10u-10v-europe.json");