// Boot system
    window.addEventListener('DOMContentLoaded', () => { 
      silentLocalMap(); // Auto-generates initial mapping array

      if (document.getElementById('cityInput').value.trim() || document.getElementById('landmarkInput').value.trim()) locateAddressOnly();
    });