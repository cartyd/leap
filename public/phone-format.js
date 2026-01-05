// Auto-format phone numbers as user types
document.addEventListener('DOMContentLoaded', function() {
  // Function to format phone number
  function formatPhoneNumber(value) {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format based on number of digits
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length <= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else {
      // Limit to 10 digits
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  }
  
  // Add event listeners to all phone inputs
  document.querySelectorAll('input[type="tel"], input.phone-input').forEach(function(input) {
    input.addEventListener('input', function(e) {
      const cursorPosition = e.target.selectionStart;
      const oldLength = e.target.value.length;
      
      // Format the value
      const formatted = formatPhoneNumber(e.target.value);
      e.target.value = formatted;
      
      // Adjust cursor position after formatting
      const newLength = formatted.length;
      const diff = newLength - oldLength;
      
      // Only adjust cursor if we added characters (formatting)
      if (diff > 0 && cursorPosition <= oldLength) {
        e.target.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
      }
    });
    
    // Also format on blur to ensure consistency
    input.addEventListener('blur', function(e) {
      e.target.value = formatPhoneNumber(e.target.value);
    });
  });
});
