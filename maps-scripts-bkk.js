var map = L.map('map').setView([14.0, 100.5], 9);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; <a href="https://www.esri.com">Esri</a> | <a href="https://sites.google.com/view/waze-thailand/others/licenses">CC BY-IGO</a> | Waze Thailand',
    maxZoom: 18,
    tileSize: 256,
    zoomOffset: 0
}).addTo(map);

var mapElement = document.getElementById('map');
var geojsonPrefix = mapElement.getAttribute('data-geojson-prefix');

var geojsonUrl = 'https://raw.githubusercontent.com/WazeTH/mapsproject/main/geojson/${geojsonPrefix}.geojson';
var SPGeojsonUrl = 'https://raw.githubusercontent.com/WazeTH/mapsproject/main/geojson/${geojsonPrefix}-SP.geojson';
var SAGeojsonUrl = 'https://raw.githubusercontent.com/WazeTH/mapsproject/main/geojson/${geojsonPrefix}-SA.geojson';
var STGeojsonUrl = 'https://raw.githubusercontent.com/WazeTH/mapsproject/main/geojson/${geojsonPrefix}-ST.geojson';

var selectedLayer = null;
var originalStyles = {};
var geojsonLayer;
var geojsonData;
var currentSuggestionIndex = -1;

fetch(geojsonUrl)
    .then(response => response.json())
    .then(data => {
        geojsonData = data;
        geojsonLayer = L.geoJSON(data, {
            style: function (feature) {
                return { color: '#00FFFF', fillOpacity: 0.2, weight: 2 };
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.ADM2_TH && feature.properties.ADM1_TH) {
                    layer.on('click', function (e) {
                        if (selectedLayer) {
                            selectedLayer.setStyle(originalStyles[selectedLayer.feature.id]);
                        }
                        layer.setStyle({
                            fillOpacity: 0.5,
                            weight: 2,
                            color: '#f00'
                        });
                        selectedLayer = layer;

                        updateTable(feature.properties);

                        // Zoom to the selected polygon
                        map.fitBounds(layer.getBounds());
                    });

                    layer.on('mouseover', function (e) {
                        layer.setStyle({ fillOpacity: 0.5 });
                    });

                    layer.on('mouseout', function (e) {
                        if (layer !== selectedLayer) {
                            layer.setStyle(originalStyles[layer.feature.id]);
                        }
                    });

                    originalStyles[layer.feature.id] = JSON.parse(JSON.stringify(layer.options));
                }
            }
        }).addTo(map);
        map.fitBounds(geojsonLayer.getBounds());

        geojsonBounds = geojsonLayer.getBounds();

        document.getElementById('spinner').style.display = 'none';
        document.getElementById('map').style.visibility = 'visible';
    })
.catch(error => {
    console.error('Error loading GeoJSON:', error);

    document.getElementById('spinner').style.display = 'none';
});

map.createPane('spPane');
map.getPane('spPane').style.zIndex = 650;

map.createPane('saPane');
map.getPane('saPane').style.zIndex = 600;

map.createPane('stPane');
map.getPane('stPane').style.zIndex = 550;

fetch(SPGeojsonUrl)
    .then(response => response.json())
    .then(data => {
        var SPGeojsonLayer = L.geoJSON(data, {
            pane: 'spPane',
            style: function (feature) {
                return { color: '#000000', fillOpacity: 0.1, weight: 2 }; 
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.ADM1_PCODE === 'TH10') {
                    layer.bindTooltip(
                        `<div class="custom-tooltip-2">${feature.properties.ADM1_TH}<br/><small>${feature.properties.ADM1_EN}</small></div>`, 
                        {
                            permanent: true,
                            direction: 'center',
                            className: 'custom-tooltip-2',
                            offset: [0, 0]
                        }
                    );
                } else if (feature.properties && feature.properties.ADM1_PCODE !== 'TH10') {
                    layer.bindTooltip(
                        `<div class="custom-tooltip-2">จ.${feature.properties.ADM1_TH}<br/><small>${feature.properties.ADM1_EN} Province</small></div>`, 
                        {
                            permanent: true,
                            direction: 'center',
                            className: 'custom-tooltip-2',
                            offset: [0, 0]
                        }
                    );
                }
            }
        });

    fetch(SAGeojsonUrl)
        .then(response => response.json())
        .then(data => {
            var SAGeojsonLayer = L.geoJSON(data, {
                pane: 'saPane',
                style: function (feature) {
                    return { color: '#808080', fillOpacity: 0.0, weight: 2 }; 
                },
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.ADM1_PCODE === 'TH10') {
                        layer.bindTooltip(
                            `<div class="custom-tooltip-2">เขต${feature.properties.ADM2_TH}<br/><small>Khet ${feature.properties.ADM2_EN}</small></div>`, 
                            {
                                permanent: true,
                                direction: 'center',
                                className: 'custom-tooltip-2',
                                offset: [0, 0]
                            }
                        );
                    } else if (feature.properties && feature.properties.ADM1_PCODE !== 'TH10') {
                        layer.bindTooltip(
                            `<div class="custom-tooltip-2">อ.${feature.properties.ADM2_TH}<br/><small>Amphoe ${feature.properties.ADM2_EN}</small></div>`, 
                            {
                                permanent: true,
                                direction: 'center',
                                className: 'custom-tooltip-2',
                                offset: [0, 0]
                            }
                        );
                    }
                }
            });

            fetch(STGeojsonUrl)
                .then(response => response.json())
                .then(data => {
                    var STGeojsonLayer = L.geoJSON(data, {
                        pane: 'stPane',
                        style: function (feature) {
                            return { color: '#FFFFFF', fillOpacity: 0.0, weight: 2 }; 
                        },
                        onEachFeature: function (feature, layer) {
                            if (feature.properties && feature.properties.ADM1_PCODE === 'TH10') {
                                layer.bindTooltip(
                                    `<div class="custom-tooltip-2">เขต${feature.properties.ADM2_TH}<br/><small>Khet ${feature.properties.ADM2_EN}</small></div>`, 
                                    {
                                        permanent: true,
                                        direction: 'center',
                                        className: 'custom-tooltip-2',
                                        offset: [0, 0]
                                    }
                                );
                            } else if (feature.properties && feature.properties.ADM1_PCODE !== 'TH10') {
                                layer.bindTooltip(
                                    `<div class="custom-tooltip-2">ต.${feature.properties.ADM3_TH}<br/><small>Tambon ${feature.properties.ADM3_EN}</small></div>`, 
                                    {
                                        permanent: true,
                                        direction: 'center',
                                        className: 'custom-tooltip-2',
                                        offset: [0, 0]
                                    }
                                );
                            }
                        }
                    });

                var overlayMaps = {
                    "ชั้นข้อมูลจังหวัดรอบข้าง (Adjacent Province [1])": SPGeojsonLayer,
                    "ชั้นข้อมูลอำเภอรอบข้าง (Adjacent Amphoe [2])": SAGeojsonLayer,
                    "ชั้นข้อมูลตำบลรอบข้าง (Adjacent Tambon [3])": STGeojsonLayer,
                };

                var layerControl = L.control.layers(null, overlayMaps, { collapsed: true }).addTo(map);

                document.getElementsByClassName('leaflet-control-layers-toggle')[0].addEventListener('click', function () {
                    if (layerControl._container.classList.contains('leaflet-control-layers-expanded')) {
                        layerControl._collapse();
                    } else {
                        layerControl._expand();
                    }
                });

                layerControl.getContainer().addEventListener('mouseleave', function () {
                    if (layerControl._container.classList.contains('leaflet-control-layers-expanded')) {
                        layerControl._collapse();
                    }
                });

                SPGeojsonLayer.remove();
                SAGeojsonLayer.remove();
                STGeojsonLayer.remove();
            })
            .catch(error => {
                console.error('Error loading new GeoJSON:', error);
            });
        });
    })
.catch(error => {
    console.error('Error loading new GeoJSON:', error);
});

var attributeMapping = {
    "ADM2_EN": "District",
    "ADM2_TH": "เขต",
    "ADM2_PCODE": "รหัสเขต <small>(กรมการปกครอง)</small>",
    "ADM1_EN": "-",
    "ADM1_TH": "-",
    "ADM1_PCODE": "-"
};

var attributeOrder = [
    "ADM1_TH",
    "ADM2_TH",
    "ADM1_PCODE",
    "ADM2_PCODE",
    "ADM1_EN",
    "ADM2_EN"
];

function updateTable(properties) {
    var tableBody = document.getElementById('attributeTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    for (var i = 0; i < attributeOrder.length; i++) {
        var prop = attributeOrder[i];
        if (properties.hasOwnProperty(prop)) {
            var displayName = attributeMapping[prop] || prop;
            var row = tableBody.insertRow();
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            cell1.innerHTML = '<strong>' + displayName + '</strong>';
            if (prop === "ADM1_PCODE" || prop === "ADM2_PCODE") {
                var numericCode = properties[prop].substring(2);
                cell2.innerHTML = numericCode;
            } else {
                cell2.innerHTML = properties[prop];
            }
        }
    }
    document.getElementById('message').style.display = 'none';
    document.getElementById('attributeTable').style.display = 'table';
}

function search() {
    var input = document.getElementById('searchInput').value.toLowerCase();
    if (!input) return;

    var found = false;

    geojsonLayer.eachLayer(function (layer) {
        var props = layer.feature.properties;
        if (props.ADM2_TH.toLowerCase().includes(input) || props.ADM2_EN.toLowerCase().includes(input)) {
            if (selectedLayer) {
                selectedLayer.setStyle(originalStyles[selectedLayer.feature.id]);
            }

            layer.setStyle({
                fillOpacity: 0.5,
                weight: 2,
                color: '#f00'
            });
            selectedLayer = layer;
            updateTable(props);
            map.fitBounds(layer.getBounds()); // Zoom to the selected polygon
            found = true;
        }
    });

    if (!found) {
        alert('No matching results found');
    }

    document.getElementById('suggestions').style.display = 'none'; // Hide suggestions after search
}

function showSuggestions(value) {
    var suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';
    if (value.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    var suggestions = [];
    var count = 0;

    geojsonLayer.eachLayer(function (layer) {
        var props = layer.feature.properties;
        var names = [props.ADM2_TH, props.ADM2_EN];
        for (var i = 0; i < names.length; i++) {
            var nameWords = names[i].split(' ');
            for (var j = 0; j < nameWords.length; j++) {
                if (nameWords[j].toLowerCase().includes(value.toLowerCase())) {
                    suggestions.push(props.ADM2_TH + ' / ' + props.ADM2_EN);
                    count++;
                    return; // Break out of the loop if a match is found
                }
            }
        }
        if (count >= 5) return;
    });

    if (suggestions.length > 0) {
        suggestions.forEach(function (suggestion, index) {
            var div = document.createElement('div');
            div.innerHTML = suggestion;
            div.id = 'suggestion-' + index;
            div.classList.add('suggestion-item');
            div.onclick = function () {
                document.getElementById('searchInput').value = suggestion.split(' / ')[0];
                suggestionsDiv.innerHTML = '';
                suggestionsDiv.style.display = 'none';
                search();
            };
            suggestionsDiv.appendChild(div);
        });
        suggestionsDiv.style.display = 'block'; // Show suggestions when available
    } else {
        // Show "No match" message
        var div = document.createElement('div');
        div.innerHTML = '<i><center>ไม่พบชื่อเขต / No District found</center></i>';
        div.classList.add('no-match');
        suggestionsDiv.appendChild(div);
        suggestionsDiv.style.display = 'block'; // Show message
    }
}

function selectSuggestion(index) {
    var suggestions = document.querySelectorAll('#suggestions .suggestion-item');
    if (index >= 0 && index < suggestions.length) {
        suggestions.forEach(function (suggestion) {
            suggestion.classList.remove('selected');
        });
        suggestions[index].classList.add('selected');
    }
}

document.getElementById('searchInput').addEventListener('keyup', function (e) {
    var suggestions = document.querySelectorAll('#suggestions .suggestion-item');
    if (e.key === 'Enter') {
        if (currentSuggestionIndex >= 0 && currentSuggestionIndex < suggestions.length) {
            document.getElementById('searchInput').value = suggestions[currentSuggestionIndex].innerHTML.split(' / ')[0];
            search();
        } else {
            search();
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentSuggestionIndex = (currentSuggestionIndex + 1) % suggestions.length;
        selectSuggestion(currentSuggestionIndex);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentSuggestionIndex = (currentSuggestionIndex - 1 + suggestions.length) % suggestions.length;
        selectSuggestion(currentSuggestionIndex);
    } else {
        currentSuggestionIndex = -1;
        showSuggestions(e.target.value);
    }
});

document.getElementById('searchInput').addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); // Prevent the cursor from moving in the input field
    }
});

var alertPopup = document.createElement('div');
alertPopup.className = 'map-alert-popup';
alertPopup.innerHTML = 'Out of Area';
document.getElementById('map').appendChild(alertPopup);

function showAlertPopup(message) {
    alertPopup.innerHTML = message;
    alertPopup.style.display = 'block';
    setTimeout(function() {
        alertPopup.style.display = 'none';
    }, 5000);
}

function locateUser() {
    var coords = document.getElementById("geolocationInput").value.split(",");
    if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
        alert("Invalid coordinates format. Please enter latitude,longitude");
        return;
    }
    var lat = parseFloat(coords[0]);
    var lng = parseFloat(coords[1]);

    var latlng = L.latLng(lat, lng);
    var projectedLatLng = L.CRS.EPSG4326.project(latlng); // Project to EPSG:3857
  
    // Create a marker at the searched location
    var marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup("พิกัดที่ค้นหา: [" + lat + ", " + lng + "]").openPopup();
    map.setView([lat, lng], 16);  // Adjust zoom level as needed
  
    // Check if the searched location falls within any polygon
    var foundFeature = null;
    geojsonLayer.eachLayer(function (layer) {
        if (layer.getBounds().contains(L.latLng(lat, lng))) {
                foundFeature = layer.feature;
                if (selectedLayer) {
                    selectedLayer.setStyle(originalStyles[selectedLayer.feature.id]);  // Reset previous highlight
                }
            selectedLayer = layer;
            layer.setStyle({ color: 'red', fillOpacity: 0.5 });  // Highlight style
            updateTable(foundFeature.properties);
            return false;  // Exit loop after finding the first match
        }
    });
    if (!foundFeature) {
        showAlertPopup('<big>⚠️</big><br/>พิกัดอยู่นอกพื้นที่<br/>Out of Area');
        map.removeLayer(marker);
        map.fitBounds(geojsonBounds)
    }
}

function clearLocation() {
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    if (geojsonBounds) {
        map.fitBounds(geojsonBounds);
    } else {
        map.setView([14.0, 100.5], 9); // Fallback default view
    }

    document.getElementById('locateButton').disabled = false;
    document.getElementById('clearButton').disabled = true;

    if (selectedLayer) {
        selectedLayer.setStyle(originalStyles[selectedLayer.feature.id]);
        selectedLayer = null;
        document.getElementById('attributeTable').style.display = 'none'; // Hide the attribute table
        document.getElementById('message').style.display = 'block'; // Show the message
    }
}
