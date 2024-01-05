const express = require('express');
const app=express();
const mysql=require("mysql");
const cors=require("cors")
const bodyParser=require("body-parser");
const nodemailer = require("nodemailer");
app.use(cors());
app.use(express.json());

const dp=mysql.createConnection({
    host:"brd5rohp616w73oh8mb3-mysql.services.clever-cloud.com",
    user:"uy9zv2alcimdtouo",
    password:"zCGGge3XtE3heDr9Srr0",
    database:"brd5rohp616w73oh8mb3",
})
dp.connect((err)=>{
    if(err)
    {
        console.log(`error while connecting to db ${err}`);
    }
    else{
        console.log(`database connected`);
        createTables();
    }
})

function createTables() {
    const createFlightTableQuery = `CREATE TABLE IF NOT EXISTS brd5rohp616w73oh8mb3.newflight (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(255),
        number VARCHAR(255),
        depaturelocation VARCHAR(255),
        destinationlocation VARCHAR(255),
        availableseats INT,
        ticket INT,
        depaturedate DATE,
        departuretime TIME
    )`;

    const createUserTableQuery = `CREATE TABLE IF NOT EXISTS brd5rohp616w73oh8mb3.user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phonenumber VARCHAR(20),
        password VARCHAR(255),
        aatharcardnumber VARCHAR(255),
        age INT,
        gender VARCHAR(10)
    )`;

    dp.query(createFlightTableQuery, (flightErr, flightResult) => {
        if (flightErr) {
            console.log(`Error creating flight table: ${flightErr}`);
        } else {
            console.log(`Flight table created or already exists`);
            dp.query(createUserTableQuery, (userErr, userResult) => {
                if (userErr) {
                    console.log(`Error creating user table: ${userErr}`);
                } else {
                    console.log(`User table created or already exists`);
                }
            });
        }
    });
}

// Call the function to create both tables
createTables();


const transporter = nodemailer.createTransport({
  service: 'gmail',
     
  auth: {
    user: 'testme2206@gmail.com',
    pass: 'uluwiknwquogwxbm'
  }
});
// const dp=mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     password:"",
//     database:"employee",
// })



app.get("/", (req, res) => {
    const q="SELECT * FROM newflight;";
    dp.query(q,(err,result)=>{
        if(err) console.log(err);
        res.json({message:result})
    })
//   res.json({message:"hello"});
});
// app.post("/post",(req,res)=>{
//     const q="INSERT INTO employee.newflight (name, number, depaturelocation, destinationlocation, availableseats, ticket, depaturedate, departuretime) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
//     console.log(req.body);
//     const values=[
//         req.body.name,
//         req.body.number,
//         req.body.depaturelocation,
//         req.body.destinationlocation,
//         req.body.availableseats,
//         req.body.ticket,
//         req.body.depaturedate,
//         req.body.departuretime
//     ];
//     dp.query(q, values, (err,result)=>{
//         if(err) {
//             console.log(err);
//             return res.status(500).json({ message: "Error inserting data" });
//         }
//         res.json({ message: "success" });
//     });
// });
app.post("/post", (req, res) => {
    const { name, number, depaturelocation, destinationlocation, availableseats, ticket, depaturedate, departuretime, user_id } = req.body;
    const q = "INSERT INTO brd5rohp616w73oh8mb3.newflight (user_id, name, number, depaturelocation, destinationlocation, availableseats, ticket, depaturedate, departuretime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
        user_id,
        name,
        number,
        depaturelocation,
        destinationlocation,
        availableseats,
        ticket,
        depaturedate,
        departuretime
    ];

    dp.query(q, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error inserting data" });
        }
        res.json({ message: "success" });
    });
});
app.get("/getuserflight/:id", (req, res) => {
    const { id } = req.params;

    const q = "SELECT * FROM brd5rohp616w73oh8mb3.newflight WHERE user_id = ?";
    dp.query(q, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error fetching user's flights" });
        }
        res.json({ flights: result });
    });
});

app.post("/delete/", (req, res) => {
    const { id } = req.body;
    console.log(id);
    const q = "DELETE FROM newflight WHERE id = ?";
    dp.query(q, [id], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ message: "error occurred", error: err });
        } else {
            res.json({ message: "successfully deleted", result: result });
        }
    });
});


app.put("/update/:id", (req, res) => {
    const flightId = req.params.id;
    const { user } = req.body;
    console.log(user);
    const q = "UPDATE brd5rohp616w73oh8mb3.newflight SET availableseats = availableseats - 1, user_id = ? WHERE id = ?";
    const values = [user.id, flightId];
    
    dp.query(q, values, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Error occurred while updating available seats", error: err });
            
        } else {
            res.json({ message: "Successfully updated available seats", result: result });
            var mailOptions = {
                from: 'testme2206@gmail.com',
                to: `${user.email}`,
                subject: `Hey user, your flight is booked`,
                text: `Dear ${user.name} this is your flight booked sucessfully :) \\n happy journey`
              };
    
              transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
        }
    });
});

app.put("/cancel/:id", (req, res) => {
    const flightId = req.params.id;
    const q = "UPDATE brd5rohp616w73oh8mb3.newflight SET availableseats = availableseats + 1, user_id = null WHERE id = ?";
    const values = [flightId];
    
    dp.query(q, values, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: "Error occurred while updating available seats", error: err });
        } else {
            res.json({ message: "Successfully updated available seats", result: result });
        }
    });
});


app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const q = "SELECT * FROM brd5rohp616w73oh8mb3.user WHERE email = ?";
    dp.query(q, [email], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error occurred while fetching user data" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const user = result[0];
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }
        res.json({ message: "Login successful", user: user });
    });
});
app.post("/register",(req,res)=>{
    const { name, email, phonenumber, password, aatharcardnumber, age, gender } = req.body;
        const checkUserQuery = "SELECT * FROM brd5rohp616w73oh8mb3.user WHERE email = ?";
    dp.query(checkUserQuery, [email], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error occurred while checking user existence" });
        }
        if (result.length > 0) {
            return res.status(409).json({ message: "User already exists" });
        }
        const registerQuery = "INSERT INTO brd5rohp616w73oh8mb3.user (name, email, phonenumber, password, aatharcardnumber, age, gender,isadmin) VALUES (?, ?, ?, ?, ?, ?, ?,?)";
        dp.query(registerQuery, [name, email, phonenumber, password, aatharcardnumber, age, gender,0], (registerErr, registerResult) => {
            if (registerErr) {
                console.log(registerErr);
                return res.status(500).json({ message: "Error occurred during user registration" });
            }
            res.json({ message: "User registered successfully", userId: registerResult.insertId });
        });
    });
});

app.listen(8000,()=>{
    console.log(`running on 8000`);
})