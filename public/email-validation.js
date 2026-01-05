// Real-time email validation
document.addEventListener('DOMContentLoaded', function() {
  // Email validation regex (same as HTML pattern)
  const emailRegex = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i;
  
  // Function to validate email
  function validateEmail(email) {
    return emailRegex.test(email);
  }
  
  // Add validation to all email inputs
  document.querySelectorAll('input[type="email"]').forEach(function(input) {
    // Validate on input (while typing)
    input.addEventListener('input', function(e) {
      const value = e.target.value.trim();
      
      if (value === '') {
        // Empty is valid (unless required)
        e.target.setCustomValidity('');
        return;
      }
      
      if (!validateEmail(value)) {
        e.target.setCustomValidity('Please enter a valid email address (e.g., example@email.com)');
      } else {
        e.target.setCustomValidity('');
      }
    });
    
    // Also validate on blur
    input.addEventListener('blur', function(e) {
      const value = e.target.value.trim();
      
      // Update the value to the trimmed version
      e.target.value = value;
      
      if (value === '') {
        e.target.setCustomValidity('');
        return;
      }
      
      if (!validateEmail(value)) {
        e.target.setCustomValidity('Please enter a valid email address (e.g., example@email.com)');
        // Trigger validation message display
        e.target.reportValidity();
      } else {
        e.target.setCustomValidity('');
      }
    });
    
    // Convert to lowercase on blur for consistency
    input.addEventListener('blur', function(e) {
      if (e.target.value) {
        e.target.value = e.target.value.toLowerCase().trim();
      }
    });
  });
});
