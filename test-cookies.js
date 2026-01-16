// Test file to verify cookie functionality
// This can be run in the browser console to test cookies

// Test setting and getting cookies
console.log('Testing cookie functionality...')

// Import cookie functions (in browser console you would need to paste the functions)
// For now, let's just verify the cookies are being created

// Check if cookies exist
document.cookie.split(';').forEach(cookie => {
  console.log(cookie.trim())
})