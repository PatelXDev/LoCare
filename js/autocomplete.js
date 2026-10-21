// 2. AUTOCOMPLETE LOGIC: STRICT FILTERING & DEDUPLICATION
    let suggestTimer;
    async function debounceSuggest(query, type) {
      clearTimeout(suggestTimer);
      const dropdown = document.getElementById(`${type}Suggestions`);
      if (query.length < 2) { dropdown.style.display = 'none'; return; }
      
      suggestTimer = setTimeout(async () => {
        try {
          const cityContext = type === 'landmark' ? document.getElementById('cityInput').value.trim() : '';
          const searchQuery = type === 'city' ? `${query} India` : `${query} ${cityContext} India`;
          
          const fetchLimit = type === 'landmark' ? 25 : 10;
          const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=${fetchLimit}`);
          const data = await res.json();
          
          if (data.features && data.features.length > 0) {
            const uniqueResults = [];
            const seenNames = new Set();
            
            for (const item of data.features) {
              const props = item.properties;
              if (props.country && props.country !== "India") continue; 
              
              if (type === 'landmark' && cityContext) {
                const areaStr = [props.city, props.district, props.locality, props.county, props.state].filter(Boolean).join(' ').toLowerCase();
                const cityTarget = cityContext.toLowerCase().split(',')[0].trim();
                if (!areaStr.includes(cityTarget)) continue; 
              }
              
              const name = props.name || props.street || query;
              const area = [props.city || props.district || props.locality, props.state].filter(Boolean).join(', ');
              const uniqueKey = `${name}-${area}`;
              
              if (!seenNames.has(uniqueKey)) {
                seenNames.add(uniqueKey);
                uniqueResults.push({ name, area, original: item });
              }
            }

            if (uniqueResults.length > 0) {
              dropdown.innerHTML = uniqueResults.slice(0, 5).map(item => `
                <div class="suggestion-item" onclick="selectSuggestion('${item.name.replace(/'/g, "\\'")}', '${type}')">
                  <b style="color:var(--text);">${item.name}</b> <br>
                  <span style="font-size:0.7rem; color:var(--muted);">${item.area}</span>
                </div>
              `).join('');
              dropdown.style.display = 'block';
            } else {
              if (type === 'landmark') {
                dropdown.innerHTML = `<div class="suggestion-item" style="color:#b91c1c; font-weight:600;" onclick="useMyGPS()">⚠️ Landmark not found. <br><b>Click here to use "📍 Near me" option or locate on map.</b></div>`;
                dropdown.style.display = 'block';
              } else { dropdown.style.display = 'none'; }
            }
          } else { 
            if (type === 'landmark') {
              dropdown.innerHTML = `<div class="suggestion-item" style="color:#b91c1c; font-weight:600;" onclick="useMyGPS()">⚠️ Landmark not found. <br><b>Click here to use "📍 Near me" option or locate on map.</b></div>`;
              dropdown.style.display = 'block';
            } else { dropdown.style.display = 'none'; }
          }
        } catch (e) { 
            if (type === 'landmark') {
              dropdown.innerHTML = `<div class="suggestion-item" style="color:#b91c1c; font-weight:600;" onclick="useMyGPS()">⚠️ Landmark not found. <br><b>Click here to use "📍 Near me" option or locate on map.</b></div>`;
              dropdown.style.display = 'block';
            } else { dropdown.style.display = 'none'; }
        }
      }, 400);
    }

    function selectSuggestion(name, type) {
      document.getElementById(`${type}Input`).value = name;
      document.getElementById(`${type}Suggestions`).style.display = 'none';
if (document.getElementById('cityInput').value.trim() && document.getElementById('landmarkInput').value.trim()) locateAddressOnly();
    }