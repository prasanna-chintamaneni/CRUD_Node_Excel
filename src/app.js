const express = require('express');
const bodyParser = require('body-parser');
const Excel = require('exceljs');
const mongoose = require('mongoose');
const db = require('./db');
const fs = require('fs');
const path = require('path');
const User = require('./User'); // Import the User model

const app = express();
const PORT = 3000;
const filePath = path.join(__dirname, 'data.xlsx');

// Create the Excel file with basic data headers if it doesn't exist
if (!fs.existsSync(filePath)) {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');
  worksheet.addRow(['id', 'name', 'age', 'email']);
  workbook.xlsx.writeFile(filePath);
}

// Middleware to parse JSON data
app.use(bodyParser.json());

// Create a new record in MongoDB and Excel
app.post('/users', async (req, res) => {
  try {
    const newUser = req.body;
    const user = new User(newUser);
    await user.save();

    // Update the Excel file
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);

    worksheet.addRow([user._id, user.name, user.age, user.email]);

    await workbook.xlsx.writeFile(filePath);

    res.status(201).json(user);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ... Other routes ...

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
