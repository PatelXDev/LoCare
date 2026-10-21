// 3. CLEANED MULTI-SYMPTOM DICTIONARY & AI TRIAGE ENGINE
    const NATURAL_SYMPTOMS = [
      "Severe pain in eye", "Sudden blurry vision", "Red and watering eyes", "Red eye or pink eye", "Swollen and itching eye", "Cannot see clearly",
      "Terrible toothache", "Bleeding gums", "Tooth highly sensitive to cold", "Jaw pain",
      "Sore and scratchy throat", "Ear pain inside", "Constantly blocked nose", "Ringing sound in ear", "Severe cough and cold", "Swollen tonsils",
      "Pregnant with cramps", "Severe period pain", "Water broke", "Missed period feeling sick", "Severe pelvic pain",
      "Baby won't stop crying", "Child has high fever", "Toddler has a strange rash",
      "Burning sensation while urinating", "Severe kidney pain", "Blood in urine",
      "Sharp pain in chest and breathlessness", "Heart beating too fast", "Heavy feeling in chest", "Very high blood pressure", "Sweating profusely with chest pain",
      "Stomach hurts badly", "Vomiting continuously", "Severe loose motions or diarrhea", "Severe acidity and burning", "Feeling very nauseous", "Severe constipation", "Abdomen pain",
      "Muscle twitching and aching", "Severe splitting headache", "Half of face feels numb", "Seizure or fainting", "Dizzy and weak", "Terrible migraine", "Hands trembling continuously",
      "Fell and injured bone", "Joints are stiff and aching", "Twisted ankle and swollen", "Severe back pain, possible fracture", "Knee hurts when walking", "Severe muscle cramp or sprain",
      "Red itchy rash", "Peeling and dry skin", "Severe acne breakout", "Bad skin allergy", "Scalp is itching intensely",
      "Extremely anxious and panicked", "Severely depressed", "Cannot sleep and stressed", "Panic attack",
      "Swallowed poison or chemical", "Severe burn injury", "Dog bite, snake bite, or animal attack", "Bleeding heavily from cut",
      "Feverish and weak", "High fever and chills", "Body aches all over", "Cold and runny nose", "Diabetes or sugar is very high", "Suspect dengue or malaria"
    ];

    const SYMPTOM_RULES = [
      { keys: ['eye', 'eyes', 'vision', 'blurry', 'blind', 'watering', 'sight', 'pink eye', 'cataract', 'glaucoma'], label: 'Ophthalmologist (Eye Specialist)', tags: ['eye', 'ophthalmolog'], helplineName: 'Health Helpline', helplineNum: '104' },
      { keys: ['tooth', 'teeth', 'gums', 'dental', 'jaw', 'cavity', 'toothache'], label: 'Dentist', tags: ['dentist', 'dental', 'tooth'], helplineName: 'Health Helpline', helplineNum: '104' },
      { keys: ['ear', 'nose', 'throat', 'tonsil', 'scratchy', 'blocked', 'cough'], label: 'ENT Specialist', tags: ['ent', 'ear', 'nose', 'throat'], helplineName: 'Health Helpline', helplineNum: '104' },
      { keys: ['pregnancy', 'pregnant', 'water broke', 'period', 'maternity', 'gynec', 'cramps', 'pelvic', 'uterus', 'vaginal'], label: 'Gynecologist / Maternity', tags: ['gynaecology', 'maternity', 'women'], helplineName: 'Women Ambulance', helplineNum: '102' },
      { keys: ['baby', 'child', 'crying', 'pediatric', 'toddler', 'infant', 'kid'], label: 'Pediatrician', tags: ['pediatric', 'child'], helplineName: 'Health Helpline', helplineNum: '104' },
      { keys: ['kidney', 'urine', 'bladder', 'urinating', 'urinary'], label: 'Urologist / Nephrologist', tags: ['uro', 'nephro'], helplineName: 'Health Helpline', helplineNum: '104' },
      { keys: ['chest', 'heart', 'breathless', 'blood pressure', 'sweaty', 'cardiac', 'palpitation'], label: 'Cardiologist', tags: ['cardiology', 'emergency', 'icu', 'heart'], helplineName: 'Medical Emergency', helplineNum: '108' },
      { keys: ['stomach', 'vomiting', 'loose motions', 'diarrhea', 'acidity', 'nauseous', 'constipation', 'abdomen', 'gastric', 'liver', 'digestion'], label: 'Gastroenterologist', tags: ['gastro'], helplineName: 'Health Helpline', helplineNum: '104' },
      { keys: ['headache', 'numb', 'dizzy', 'seizure', 'fainted', 'paralysis', 'brain', 'twitching', 'migraine', 'trembling', 'nerve', 'stroke'], label: 'Neurologist / Neurosurgeon', tags: ['neuro'], helplineName: 'Medical Emergency', helplineNum: '108' },
      { keys: ['bone', 'joints', 'ankle', 'back hurts', 'fell', 'fracture', 'twisted', 'sprain', 'knee', 'muscle', 'arthritis', 'spine'], label: 'Orthopedic Surgeon', tags: ['orthopaedic', 'ortho', 'trauma'], helplineName: 'Ambulance SOS', helplineNum: '108' },
      { keys: ['skin', 'rash', 'acne', 'itchy', 'itching', 'peeling', 'allergy', 'scalp', 'hair', 'pimple'], label: 'Dermatologist (Skin Specialist)', tags: ['dermatolog', 'skin'], helplineName: 'Health Helpline', helplineNum: '104' },
      { keys: ['stress', 'anxious', 'panicked', 'depressed', 'sleep', 'mental', 'panic attack', 'anxiety'], label: 'Psychiatrist / Counseling', tags: ['psychiatry', 'mental'], helplineName: 'Tele-MANAS', helplineNum: '14416' },
      { keys: ['poison', 'burn', 'chemical', 'bite', 'snake', 'dog', 'bleeding heavily', 'cut', 'accident'], label: 'Emergency & Toxicology', tags: ['emergency', 'hospital', 'icu'], helplineName: 'National Health Helpline', helplineNum: '104' },
      { keys: ['fever', 'feverish', 'chills', 'body aches', 'cold', 'weak', 'sugar', 'diabetes', 'dengue', 'malaria', 'infection', 'typhoid'], label: 'General Physician / Primary Care', tags: ['general', 'physician', 'clinic'], helplineName: 'Health Helpline', helplineNum: '104' }
    ];

    function suggestSymptom(query) {
      silentLocalMap(); 
      const dropdown = document.getElementById('symptomSuggestions');
      if (query.length < 2) { dropdown.style.display = 'none'; return; }
      
      const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 0);
      const matches = NATURAL_SYMPTOMS.filter(s => {
        const lowerS = s.toLowerCase();
        return queryWords.every(word => lowerS.includes(word));
      });
      
      if (matches.length > 0) {
        dropdown.innerHTML = matches.map(m => `
          <div class="suggestion-item" onclick="selectSymptom('${m.replace(/'/g, "\\'")}')">
            ${m}
          </div>
        `).join('');
        dropdown.style.display = 'block';
      } else { dropdown.style.display = 'none'; }
    }

    function selectSymptom(phrase) {
      document.getElementById('symptomInput').value = phrase;
      document.getElementById('symptomSuggestions').style.display = 'none';
      runAITriage(); 
    }

    function quickSymptom(sym) {
      document.getElementById('symptomInput').value = sym;
      runAITriage(); 
    }

    function silentLocalMap() {
       const searchStr = document.getElementById('symptomInput').value.toLowerCase();
       let matchedRules = [];
       for (let i = 0; i < SYMPTOM_RULES.length - 1; i++) {
           if (SYMPTOM_RULES[i].keys.some(k => searchStr.includes(k))) {
               matchedRules.push(SYMPTOM_RULES[i]);
           }
       }
       if (matchedRules.length === 0) matchedRules.push(SYMPTOM_RULES[SYMPTOM_RULES.length - 1]);
       currentMappedRules = [...new Set(matchedRules)];
       updateHelplineUIWithRules(currentMappedRules, "Awaiting AI Triage Analysis...");
    }

    async function runAITriage() {
      const btn = document.getElementById('aiBtn');
      const originalText = btn.innerHTML;
      btn.innerHTML = '⏳ AI Analyzing...';
      btn.disabled = true;

      const sym = document.getElementById('symptomInput').value;
      const q1Elem = document.getElementById('q1');
      const q2Elem = document.getElementById('q2');
      const q3Elem = document.getElementById('q3');
      const q4Elem = document.getElementById('q4');
      const q5Elem = document.getElementById('q5');

      const q1 = q1Elem.options[q1Elem.selectedIndex].text;
      const q2 = q2Elem.options[q2Elem.selectedIndex].text;
      const q3 = q3Elem.options[q3Elem.selectedIndex].text;
      const q4 = q4Elem.options[q4Elem.selectedIndex].text;
      const q5 = q5Elem.options[q5Elem.selectedIndex].text;

      let aiResponseText = "";
      try {
         const prompt = `Search the internet to analyze these medical symptoms written in casual language: "${sym}". Act as a medical triage assistant. Duration: ${q1}. Prior Treatment: ${q2}. Focus: ${q3}. Severity: ${q4}. History: ${q5}. Based on your internet search of the symptoms and the triage rules (acute/generalized/first-time = General Physician; chronic/severe/localized/failed treatments = Specialist), identify the most accurate medical specialists. Return ONLY a comma-separated list of doctors.`;
         
         const res = await fetch('https://text.pollinations.ai/?search=true', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: prompt
         });
         aiResponseText = await res.text();
      } catch (e) {
         console.warn("Free AI network issue. Falling back to On-Device Triage Rules.", e);
         aiResponseText = "Fallback";
      }

      let genPoints = 0; let specPoints = 0;
      if (q1Elem.value === 'A') genPoints++; if (q1Elem.value === 'C') specPoints++;
      if (q2Elem.value === 'A') genPoints++; if (q2Elem.value === 'B') specPoints++; if (q2Elem.value === 'C') specPoints += 2;
      if (q3Elem.value === 'A') genPoints++; if (q3Elem.value === 'B') specPoints++;
      if (q4Elem.value === 'A') genPoints++; if (q4Elem.value === 'B') specPoints++;
      if (q5Elem.value === 'A' || q5Elem.value === 'B') genPoints++; if (q5Elem.value === 'C') specPoints += 2;

      let matchedRules = [];
      const searchStr = (sym + " " + aiResponseText).toLowerCase();

      for (let i = 0; i < SYMPTOM_RULES.length - 1; i++) {
         if (SYMPTOM_RULES[i].keys.some(k => searchStr.includes(k)) || SYMPTOM_RULES[i].label.toLowerCase().split(' ').some(w => w.length > 4 && searchStr.includes(w))) {
             matchedRules.push(SYMPTOM_RULES[i]);
         }
      }

      matchedRules = [...new Set(matchedRules)]; 
      const generalRule = SYMPTOM_RULES[SYMPTOM_RULES.length - 1]; 
      
      if (genPoints > specPoints || matchedRules.length === 0) {
         matchedRules = [generalRule, ...matchedRules];
      }

      matchedRules = [...new Set(matchedRules)];
      currentMappedRules = matchedRules;
      const aiContextMsg = aiResponseText !== "Fallback" ? `AI Assessment: ${aiResponseText}` : "Analyzed via On-Device Triage Rules.";
      updateHelplineUIWithRules(currentMappedRules, aiContextMsg);

      btn.innerHTML = originalText;
      btn.disabled = false;

      if (!document.getElementById('btnScan').disabled && currentFacilities.length > 0) {
        renderClinicList();
      }
    }

    function updateHelplineUIWithRules(rules, aiContextMsg) {
      const banner = document.getElementById('helplineBanner');
      let priorityHelplineName = rules[0].helplineName;
      let priorityHelplineNum = rules[0].helplineNum;
      for (let r of rules) {
         if (r.helplineNum === '108' || r.helplineNum === '102') {
            priorityHelplineName = r.helplineName;
            priorityHelplineNum = r.helplineNum;
            break;
         }
      }

      banner.innerHTML = `<span>📞 24/7 National Health Helpline: <b>${priorityHelplineName}</b></span> <a href="tel:${priorityHelplineNum}" style="color:#991b1b; text-decoration:underline; font-weight:800;">Dial ${priorityHelplineNum}</a>`;
      banner.style.display = 'flex';
      
      const labels = rules.map(r => r.label).join(' & ');
      const mapperBanner = document.getElementById('mapperBanner');
      mapperBanner.innerHTML = `🧠 <strong>Recommended Specialists:</strong> <br><span style="font-size:0.75rem; color:var(--muted);">${aiContextMsg}</span><br>Highlighting: <strong style="color:var(--primary);">${labels}</strong>`;
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.input-wrapper')) {
        document.getElementById('citySuggestions').style.display = 'none';
        document.getElementById('landmarkSuggestions').style.display = 'none';
        document.getElementById('symptomSuggestions').style.display = 'none';
      }
    });