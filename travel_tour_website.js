// Function to check if the user is logged in
async function checkLoginStatus() {
  const response = await fetch("http://localhost:3000/check-login");
  const data = await response.json();
  // Update the UI based on the login status
  const signInLinkElement = document.getElementById("signInLink");
  console.log("sign in link accessed: " + data);
  if (data.loggedIn) {
    // User is logged in
    console.log("user is logged in ");
    signInLinkElement.textContent = "Log Out";
    // Add an event listener to the sign-in link
    signInLinkElement.addEventListener("click", async function (event) {
      // Prevent the default behavior of the link
      event.preventDefault();

      // Make a GET request to the logout endpoint
      try {
        const response = await fetch("http://localhost:3000/mysignout");
        const data = await response.json();
        console.log(data);
        if (response.ok) {
          // If the logout request is successful, redirect the user to the sign-in page
          signInLinkElement.textContent = "Sign In";
          window.location.href = "http://127.0.0.1:5500/signin.html";
        } else {
          // If there's an error, log it to the console
          console.error("Logout failed:", response.statusText);
        }
      } catch (error) {
        console.error("Logout failed:", error);
      }
    });
  } else {
    // User is not logged in
    console.log("user not logged in");
    signInLinkElement.textContent = "Sign In";
    signInLinkElement.href = "signin.html";
  }
}

function checkLoginStatusForBookButton() {
  fetch("http://localhost:3000/check-login")
    .then((response) => response.json())
    .then((data) => {
      // Update the UI based on the login status
      const signInLinkElement = document.getElementById("bookButton");

      console.log(data);
      if (data.loggedIn) {
        // User is logged in
        // Update this to your logout route
      } else {
        // User is not logged in
        signInLinkElement.textContent = "Sign In";
        signInLinkElement.href = "../signin.html";
      }
    })
    .catch((error) => {
      console.error("Error checking login status:", error);
      return;
    });
}

function checkLoginStatusForTravelBookButton() {
  fetch("http://localhost:3000/check-login")
    .then((response) => response.json())
    .then((data) => {
      // Update the UI based on the login status
      const signInLinkElement = document.getElementById("travelBookButton");

      console.log(data);
      if (data.loggedIn) {
        // User is logged in
        // Update this to your logout route
      } else {
        // User is not logged in
        signInLinkElement.textContent = "Sign In";
        signInLinkElement.href = "/signin.html";
      }
    })
    .catch((error) => {
      console.error("Error checking login status:", error);
      return;
    });
}
// Call the function to check login status when the page loads
window.addEventListener("load", checkLoginStatus);
window.addEventListener("load", checkLoginStatusForBookButton);
window.addEventListener("load", checkLoginStatusForTravelBookButton);
