// Map initialization and shared map state.

    // 1. INITIALIZE MAP
const map = L.map('map').setView([22.9734, 78.6569], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
      maxZoom: 19, 
      attribution: '©️ OpenStreetMap contributors' 
    }).addTo(map);
    const markerLayer = L.layerGroup().addTo(map);
    
    let routingControl = null;
    let searchController = null; 
    let currentMappedRules = [];