const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mysql = require("mysql2");
const cors = require("cors");
queryString = require("querystring");
require("dotenv").config();
const stripe = require("stripe")(
  "sk_test_51PEm52SHW3zvoeaZBW3qm5CRDwa3Ix3IIPzsfvgzHINzzkHapHj1ZyncNiiWEkTRrgCElwqhxDHQzb0ZrUjAPreN00CZniK0eF"
);

require("console");

const app = express();
const port = 3000;
app.use(cors());

// Session configuration
app.use(
  session({
    secret: "your-secret-key", // Change this to a random string
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json());


userData = { email: null, password: null, isLoggedIn: false };


// MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "abhaykumar39",
  database: "tourdb",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

const createCustomer = async (req, res) => {
  const { name, email } = req.body; // Extract name and email from the request body

  try {
    const customer = await stripe.customers.create({
      name: name,
      email: email,
    });

    // Insert the customer details into your SQL table
    console.log(customer);
    connection.query(
      "INSERT INTO customers (name, email, stripe_customer_id) VALUES (?, ?, ?)",
      [name, email, customer.id],
      (error, results) => {
        if (error) {
          console.error("Error inserting customer into database:", error);
          res.status(500).send("Internal Server Error");
          return;
        }

        // Customer details successfully inserted into SQL table
        console.log("Customer details inserted into database:", results);
        res.redirect(301, "http://127.0.0.1:5500/TOUR.html");
      }
    );
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
// Route to handle sign-up requests
app.post("/signup", function (req, res) {
  const { name, email, password } = req.body;

  // Check if the email is already registered
  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (error, results) => {
      if (error) {
        console.error("Error querying database:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      if (results.length > 0) {
        // Email is already registered
        res.redirect(
          301,
          "http://127.0.0.1:5500/signup.html?error=email_registered"
        );
        return;
      }

      // Email is not registered, insert new user into the database
      connection.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [name, email, password],
        (error) => {
          if (error) {
            console.error("Error inserting into database:", error);
            res.status(500).send("Internal Server Error");
            return;
          }

          // User successfully signed up
          userData = { email: email, password: password, isLoggedIn: true };
          createCustomer(req, res);
        }
      );
    }
  );
});

// Route to handle sign-in requests
app.post("/signin", function (req, res) {
  console.log(req.body);
  const { email, password } = req.body;

  // Query the database to check if the user exists and the password is correct
  connection.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (error, results) => {
      if (error) {
        console.error("Error querying database:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      if (results.length === 0) {
        // User not found or password incorrect
        res.redirect(
          301,
          "http://127.0.0.1:5500/signin.html?error=user_not_found"
        );
        return;
      }

      // User successfully signed in
      userData = { email: email, password: password, isLoggedIn: true };
      res.redirect(301, "http://127.0.0.1:5500/travel_tour_website.html");
    }
  );
});





// Route to handle booking requests
app.post("/book", (req, res) => {
  const { name, mobile, package, gender, travelDate } = req.body;
  console.log(req.body);

  connection.query(
    "SELECT user_id FROM Users WHERE email = ?",
    [userData.email],
    (error, results) => {
      if (error) {
        console.error("Error querying database:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      if (results.length === 0) {
        // User not found
        res.status(404).send("User not found");
        return;
      }

      const userId = results[0].user_id;

      connection.query(
        "SELECT package_id,price FROM Packages WHERE package_name = ?",
        [package],
        (error, results) => {
          if (error) {
            console.error("Error querying database:", error);
            res.status(500).send("Internal Server Error");
            return;
          }
          if (results.length === 0) {
            // User not found
            res.status(404).send("package not found");
            return;
          }
          const package_id = results[0].package_id;
          const price = results[0].price;
          // Insert the booking details into the database
          connection.query(
            "INSERT INTO bookings (user_Id,name, mobile, package_id, gender, travel_date) VALUES (?,?, ?, ?, ?, ?)",
            [userId, name, mobile, package_id, gender, travelDate],
            (error, results) => {
              if (error) {
                console.error("Error inserting into database:", error);
                res.status(500).send("Internal Server Error");
                return;
              }

              const bookingDetails = {
                name: name,
                mobile: mobile,
                package: package,
                gender: gender,
                travelDate: travelDate,
                price: price,
              };

              // Send the booking details as JSON response
              const redirectUrl = `http://127.0.0.1:5500/booking_confirmation.html?${queryString.stringify(
                bookingDetails
              )}`;
              res.redirect(301, redirectUrl);
            }
          );
        }
      );
    }
  );
});
// Route to handle adding a card for a customer
// Route to handle adding a card for a customer
app.post("/add-card", async (req, res) => {
  const { cardholderName, cardNumber, expiryMonth, expiryYear, cvv } = req.body; // Extract card details from request body
  // Retrieve customerId from the customers table using the email ID stored in userData.email
  connection.query(
    "SELECT stripe_customer_id FROM customers WHERE email = ?",
    [userData.email],
    async (error, results) => {
      if (error) {
        console.error("Error querying database:", error);
        res.status(500).send("Internal Server Error");
        return;
      }

      if (results.length === 0) {
        // Customer not found
        res.status(404).send("Customer not found");
        return;
      }

      const customerId = results[0].stripe_customer_id;

      try {
        connection.query(
          "INSERT INTO cardDetails (stripe_customer_id, cardholderName,cardNumber,expiryMonth,expiryYear,cvv) VALUES (?, ?, ?,?,?,?)",
          [
            customerId,
            cardholderName,
            cardNumber,
            expiryMonth,
            expiryYear,
            cvv,
          ],
          (error, results) => {
            if (error) {
              console.error("Error inserting card into database:", error);
              res.status(500).send("Internal Server Error");
              return;
            }

            // Card details successfully inserted into SQL table
            console.log("Card details inserted into database:", results);
            res.redirect(301, "http://127.0.0.1:5500/paymentDone.html");
          }
        );
      } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
      }
    }
  );
});

// Route to handle sign-out requests
app.get("/mysignout", (req, res) => {
  userData={email:null, password:null,isLoggedIn:false};
  console.log(userData);

  if (userData.isLoggedIn === true) {
    // User is logged in
    return res.json({ loggedIn: true });
  } else {
    // User is not logged in
    return res.json({ loggedIn: false });
  }
});
app.get("/check-login", (req, res) => {
  console.log(userData);

  if (userData.isLoggedIn === true) {
    // User is logged in
    return res.json({ loggedIn: true });
  } else {
    // User is not logged in
    return res.json({ loggedIn: false });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
