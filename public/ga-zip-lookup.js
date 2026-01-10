// Georgia ZIP code lookup and auto-population
(function() {
  let gaZipData = {};
  let dataLoaded = false;
  let pendingValidation = null;
  
  // Load GA ZIP code data
  fetch('/public/ga-zip-codes.json')
    .then(response => response.json())
    .then(data => {
      // Convert array to object for faster lookup
      data.forEach(item => {
        gaZipData[item.zip] = {
          city: item.city,
          county: item.county
        };
      });
      dataLoaded = true;
      console.log('Loaded', Object.keys(gaZipData).length, 'GA ZIP codes');
      
      // If there was a pending validation (from page load), run it now
      if (pendingValidation) {
        pendingValidation();
        pendingValidation = null;
      }
    })
    .catch(error => {
      console.error('Failed to load GA ZIP codes:', error);
      dataLoaded = true; // Mark as loaded even on error to prevent hanging
    });
  
  // Function to lookup and populate city, state, county from ZIP
  function lookupZip(zipCode) {
    const zip = zipCode.replace(/\D/g, ''); // Remove non-digits
    
    if (zip.length === 5 && gaZipData[zip]) {
      return {
        city: gaZipData[zip].city,
        state: 'GA',
        county: gaZipData[zip].county
      };
    }
    
    return null;
  }
  
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    // Find the applicant ZIP, city, state, and county fields
    const zipInput = document.querySelector('input[name="applicant[zip]"]');
    const cityInput = document.querySelector('input[name="applicant[city]"]');
    const stateInput = document.querySelector('input[name="applicant[state]"]');
    const countyInput = document.querySelector('input[name="applicant[county]"]');
    
    if (!zipInput || !cityInput || !stateInput || !countyInput) {
      return; // Not on the right page
    }
    
    // Disable city, state, and county inputs (they'll be auto-populated)
    cityInput.readOnly = true;
    stateInput.readOnly = true;
    countyInput.readOnly = true;
    
    // Add visual indication that fields are auto-populated
    cityInput.style.backgroundColor = '#f0f0f0';
    stateInput.style.backgroundColor = '#f0f0f0';
    countyInput.style.backgroundColor = '#f0f0f0';
    
    // Update ZIP field to only accept 5 digits
    zipInput.maxLength = 5;
    zipInput.pattern = '[0-9]{5}';
    zipInput.title = 'Please enter a 5-digit Georgia ZIP code';
    zipInput.placeholder = '30301';
    
    // Function to validate and populate
    function validateAndPopulate() {
      const zipValue = zipInput.value.trim();
      
      if (zipValue.length === 5) {
        const location = lookupZip(zipValue);
        
        if (location) {
          // Valid GA ZIP code - populate fields
          cityInput.value = location.city;
          stateInput.value = location.state;
          countyInput.value = location.county;
          
          // Clear any error state
          zipInput.setCustomValidity('');
          
          // Visual feedback - success
          zipInput.style.borderColor = '';
        } else {
          // Invalid GA ZIP code
          cityInput.value = '';
          stateInput.value = '';
          countyInput.value = '';
          
          zipInput.setCustomValidity('Please enter a valid Georgia ZIP code (30000-39999)');
          zipInput.reportValidity();
          
          // Visual feedback - error
          zipInput.style.borderColor = '#dc3545';
        }
      } else if (zipValue.length > 0) {
        // Incomplete ZIP
        cityInput.value = '';
        stateInput.value = '';
        countyInput.value = '';
      }
    }
    
    // Validate on input
    zipInput.addEventListener('input', function(e) {
      // Remove non-digits
      e.target.value = e.target.value.replace(/\D/g, '');
      
      // Validate if we have 5 digits
      if (e.target.value.length === 5) {
        validateAndPopulate();
      } else {
        zipInput.setCustomValidity('');
        cityInput.value = '';
        stateInput.value = '';
        countyInput.value = '';
      }
    });
    
    // Also validate on blur
    zipInput.addEventListener('blur', function() {
      if (zipInput.value.length > 0) {
        validateAndPopulate();
      }
    });
    
    // On page load, if ZIP is already filled, populate the fields
    if (zipInput.value && zipInput.value.length === 5) {
      if (dataLoaded) {
        validateAndPopulate();
      } else {
        // Queue validation to run once data is loaded
        pendingValidation = validateAndPopulate;
      }
    }
  });
})();
