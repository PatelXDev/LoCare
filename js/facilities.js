// 4. STEP 1: LOCATE ADDRESS ONLY WITH ALERT POPUPS
    let currentFacilities = [];
    let currentLandmark = { name: 'Bus Stand', area: 'Kagal', lat: 16.5816, lng: 74.3216 };

    function getBackgroundSortDist(lat1, lon1, lat2, lon2) {
      const R = 6371e3; const rad = d => (d * Math.PI) / 180;
      const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
      return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }

    async function locateAddressOnly() {
      if (searchController) searchController.abort();
      searchController = new AbortController();
      const signal = searchController.signal;

      if(routingControl) { map.removeControl(routingControl); routingControl = null; }
      
      const city = document.getElementById('cityInput').value.trim();
      const landmark = document.getElementById('landmarkInput').value.trim();
      if (!city || !landmark) { alert('Please enter both a city and a landmark.'); return; }
      
      const btnLocate = document.getElementById('btnLocate');
      const btnScan = document.getElementById('btnScan');
      
      btnLocate.disabled = true;
      btnLocate.innerHTML = '⏳ Pinpointing Map...';
      btnScan.disabled = true;

      try {
        const queryStr = landmark ? `${landmark} ${city} India` : `${city} India`;
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(queryStr)}&limit=1`, { signal });
        let data = await res.json();
        
        let landmarkNotFound = false;

        if ((!data.features || data.features.length === 0) && landmark) {
            landmarkNotFound = true;
            const cityRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(city + ' India')}&limit=1`, { signal });
            data = await cityRes.json();
        }

        if (data.features && data.features.length > 0) {
          const props = data.features[0].properties;
          const coords = data.features[0].geometry.coordinates; 
          currentLandmark = {
            name: landmarkNotFound ? city : (landmark || city),
            area: [props.city || props.district, props.state].filter(Boolean).join(', '),
            lat: coords[1],
            lng: coords[0]
          };
          
          if (landmarkNotFound) {
            alert(`Landmark not found in suggestions!\n\nPlease use the "📍 Near me" option or locate it directly on the map.`);
          }
        } else {
          alert(`Location not found!\n\nPlease use the "📍 Near me" option or locate it directly on the map.`);
        }
      } catch (e) { 
        if (e.name === 'AbortError') return; 
        console.warn("Geocoding network error."); 
      }

      pinCurrentLocation(btnLocate, btnScan);
    }

    function pinCurrentLocation(btnLocate, btnScan) {
      markerLayer.clearLayers();
      document.getElementById('clinicList').innerHTML = '';
      currentFacilities = [];
      document.getElementById('resultsCount').textContent = 'Location Pinned. Ready to scan.';

      const locIcon = L.divIcon({
        className: 'user-loc-pin',
        html: '📍',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -28]
      });
      L.marker([currentLandmark.lat, currentLandmark.lng], { icon: locIcon, zIndexOffset: 1000 }).addTo(markerLayer)
        .bindPopup(`<b>📍 Searched Location:</b><br>${currentLandmark.name}`).openPopup();
      
      map.setView([currentLandmark.lat, currentLandmark.lng], 15);

      btnLocate.disabled = false;
      btnLocate.innerHTML = '📍 1. Pinpoint Location on Map';
      btnScan.disabled = false;
      btnScan.style.opacity = '1';
      btnScan.style.boxShadow = '0 0 0 4px rgba(22, 163, 74, 0.3)';
      setTimeout(() => btnScan.style.boxShadow = '', 2000);
    }

    // Shows the real place name of the GPS position in the city/landmark boxes (display only)
    async function fillBoxesFromGPS(lat, lng) {
      const cityEl = document.getElementById('cityInput');
      const landEl = document.getElementById('landmarkInput');
      try {
        const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const p = data.features && data.features[0] && data.features[0].properties;
        if (!p) throw new Error('no result');
        cityEl.value = p.city || p.district || p.county || p.state || '';
        landEl.value = p.name || p.street || p.locality || p.suburb || p.district || '';
      } catch (e) {
        cityEl.value = '';
        landEl.value = '';
      }
    }

    function useMyGPS() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          currentLandmark = { name: 'My GPS Location', area: 'Current Position', lat: pos.coords.latitude, lng: pos.coords.longitude };
          pinCurrentLocation(document.getElementById('btnLocate'), document.getElementById('btnScan'));
                    fillBoxesFromGPS(pos.coords.latitude, pos.coords.longitude);
        }, () => {
          alert("Ensure location permissions are granted in your browser settings.");
        }, { enableHighAccuracy: true });
      } else {
        alert("Geolocation is not supported by your browser.");
      }
    }

    // 5. STEP 2: SCAN FACILITIES
    async function findFacilitiesOnly() {
      if (searchController) searchController.abort();
      searchController = new AbortController();
      const signal = searchController.signal;

      const btnScan = document.getElementById('btnScan');
      btnScan.disabled = true;
      btnScan.innerHTML = '⏳ Scanning 15km Radius...';
      
      document.getElementById('resultsCount').textContent = 'Searching OpenStreetMap...';

      const overpassQL = `[out:json][timeout:45];
      (
        nwr["amenity"~"hospital|clinic|doctors|dentist|pharmacy|nursing_home"](around:${SEARCH_RADIUS_METERS},${currentLandmark.lat},${currentLandmark.lng});
        nwr["healthcare"](around:${SEARCH_RADIUS_METERS},${currentLandmark.lat},${currentLandmark.lng});
      ); out center;`;

      let data = null;
      for (const endpoint of OVERPASS_ENDPOINTS) {
        try {
          const res = await fetch(endpoint, { method: 'POST', body: 'data=' + encodeURIComponent(overpassQL), signal });
          if (res.ok) {
            data = await res.json();
            break; 
          }
        } catch (e) {
          if (e.name === 'AbortError') return; 
        }
      }

      if (data) {
        currentFacilities = (data.elements || [])
          .filter(el => el.lat || (el.center && el.center.lat))
          .map((el, idx) => {
            const lat = el.lat || el.center.lat;
            const lng = el.lon || el.center.lon;
            const tags = el.tags || {};
            const rawType = tags.amenity || tags.healthcare || 'clinic';
            
            let category = (rawType === 'hospital' || rawType === 'nursing_home') ? 'hospital' : 'micro';
            let typeLabel = category === 'hospital' ? '🟢 Hospital' : '🟣 Small Clinic';
            
            return {
              id: el.id,
              name: tags.name || tags['name:en'] || `Medical Facility (Registered Location)`,
              category, typeLabel,
              specialty: tags['healthcare:speciality'] || 'General & Primary Care',
              lat, lng, 
              sortDist: getBackgroundSortDist(currentLandmark.lat, currentLandmark.lng, lat, lng),
              phone: tags.phone || tags['contact:phone'] || tags['contact:mobile'] || null
            };
        });
      }

      btnScan.disabled = false;
      btnScan.innerHTML = '🔍 2. Scan Medical Facilities Nearby';
      renderClinicList();
    }

    // 6. RENDER MULTI-SYMPTOM LIST 
    function renderClinicList() {
      markerLayer.eachLayer(layer => {
        if (!layer.options.icon || layer.options.icon.options.className !== 'user-loc-pin') {
          markerLayer.removeLayer(layer);
        }
      });

      const boundsArr = [[currentLandmark.lat, currentLandmark.lng]];

      document.getElementById('clinicList').innerHTML = '';

      if (currentFacilities.length === 0) {
        document.getElementById('resultsCount').textContent = `0 Facilities Found`;
        document.getElementById('clinicList').innerHTML = `<div style="padding:1rem; color:#b91c1c; font-weight:700; background:#fef2f2; border-radius:8px;">⚠️ No medical facilities registered on the Open Map within 15 km of this exact location.</div>`;
        map.setView([currentLandmark.lat, currentLandmark.lng], 14);
        return;
      }

      let allRequiredTags = [];
      currentMappedRules.forEach(r => allRequiredTags.push(...r.tags));

      const processedFacilities = currentFacilities.map(f => {
        const isMatch = allRequiredTags.some(t => f.specialty.toLowerCase().includes(t) || f.name.toLowerCase().includes(t));
        return { ...f, isMatch };
      });

      const sortedFacilities = processedFacilities.sort((a, b) => {
        if (a.isMatch !== b.isMatch) return a.isMatch ? -1 : 1;
        return a.sortDist - b.sortDist;
      });

      document.getElementById('resultsCount').textContent = `${sortedFacilities.length} Facilities Found (15km radius)`;
      const listEl = document.getElementById('clinicList');
      listEl.innerHTML = '';

      let priorityHelplineNum = currentMappedRules.length > 0 ? currentMappedRules[0].helplineNum : '104';
      for (let r of currentMappedRules) {
         if (r.helplineNum === '108' || r.helplineNum === '102') {
            priorityHelplineNum = r.helplineNum;
            break;
         }
      }

      sortedFacilities.forEach(f => {
        const pinColor = f.category === 'micro' ? '#7c3aed' : '#16a34a';
        boundsArr.push([f.lat, f.lng]);

        const displayPhone = f.phone ? f.phone : priorityHelplineNum;
        const callBtnText = f.phone ? `📞 Call: ${f.phone}` : `📞 Call ${priorityHelplineNum} (No direct #)`;
        const callBtnStyle = !f.phone ? 'style="background:var(--warning);border-color:var(--warning);"' : '';

        const sharedCardHtml = `
          <div class="clinic-top">
            <div class="clinic-name">${f.name}</div>
          </div>
          <div class="badge-row">
            <span class="tag-type">${f.typeLabel}</span>
            <span class="tag-spec">• ${f.specialty}</span>
          </div>
          <div class="route-info routeMsg_${f.id}"></div>
          <div class="clinic-actions">
            <button class="btn-route" onclick="drawAccurateRoute(${f.lat}, ${f.lng}, '${f.id}', event)">📍 Show Route & ETA</button>
            <a href="tel:${displayPhone}" class="btn-call" ${callBtnStyle}>${callBtnText}</a>
          </div>
        `;

        const marker = L.circleMarker([f.lat, f.lng], { radius: 8, fillColor: pinColor, color: '#fff', weight: 2, fillOpacity: 0.95 }).addTo(markerLayer);
        const popupWrapper = `<div style="margin:-2px -4px;">${sharedCardHtml}</div>`;
        marker.bindPopup(popupWrapper);

        const card = document.createElement('div');
        card.className = `clinic-card ${f.isMatch ? 'priority' : (f.category === 'micro' ? 'micro' : '')}`;
        card.innerHTML = sharedCardHtml;
        
        card.onclick = () => { map.setView([f.lat, f.lng], 16); marker.openPopup(); };
        listEl.appendChild(card);
        if (window.LoCareSync) window.LoCareSync.register(f, card, marker); // UI hook: map <-> list highlight (optional)
      });

      if (boundsArr.length > 1) { 
        map.fitBounds(boundsArr, { padding: [40, 40] }); 
      }
    }

    // 7. EXACT DRIVING ROUTING
    function drawAccurateRoute(destLat, destLng, cardId, e) {
      if(e) e.stopPropagation(); 
      if(routingControl) map.removeControl(routingControl);
      
      document.querySelectorAll('.route-info').forEach(el => el.style.display = 'none');
      
      const routeMsgBoxes = document.querySelectorAll(`.routeMsg_${cardId}`);
      routeMsgBoxes.forEach(box => {
        box.style.display = 'block';
        box.innerHTML = '⏳ <i>Calculating route...</i>';
      });

      routingControl = L.Routing.control({
        waypoints: [ L.latLng(currentLandmark.lat, currentLandmark.lng), L.latLng(destLat, destLng) ],
        router: L.Routing.osrmv1({ profile: 'driving' }),
        lineOptions: { styles: [{ color: '#2563eb', weight: 6, opacity: 0.85 }] },
        show: false,
        createMarker: () => null 
      }).on('routesfound', function(e) {
        const routes = e.routes;
        const exactDistanceKm = (routes[0].summary.totalDistance / 1000).toFixed(2);
        const exactTimeMins = Math.round(routes[0].summary.totalTime / 60) || 1; 
        
        routeMsgBoxes.forEach(box => {
          box.innerHTML = `🚗 Driving Route: <b>${exactDistanceKm} km</b> <br> ⏳ ETA: <b>${exactTimeMins} min${exactTimeMins > 1 ? 's' : ''}</b>`;
        });
        
        const routeBounds = L.latLngBounds(routes[0].coordinates);
        map.fitBounds(routeBounds, { padding: [40, 40] });
      }).on('routingerror', function() {
        routeMsgBoxes.forEach(box => {
          box.innerHTML = `⚠️ <i>Unable to map driving route at this time.</i>`;
        });
      }).addTo(map);
    }