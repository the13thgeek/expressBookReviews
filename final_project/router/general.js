const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered!"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    } else {
      return res.status(404).json({message: "Unable to register user - username/password not provided."});
    }
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const getBooks = await new Promise((resolve, reject) => {
      if(books) {
        resolve(books);
      } else {
        reject("Books data is not available.");
      }
      res.send(JSON.stringify(books,null,4));
    });
  } catch(e) {
    res.status(500).send(e.message);
  }  
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  const getBookFromIsbn = new Promise((resolve, reject) => {
    try {
      resolve(books[isbn]);
    } catch(e) {
      reject(e.message);
    }
  });

  getBookFromIsbn.then((book) => { res.send(book); }).catch((e) => { res.status(500).send(e) });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  const getBookFromAuthor = new Promise((resolve, reject) => {
    try {
      resolve(Object.values(books).filter((book) => book.author.toLowerCase() === author.toLowerCase()));
    } catch(e) {
      reject(e.message);
    }
  });

  getBookFromAuthor.then((booklist) => { res.send(booklist); }).catch((e) => { res.status(500).send(e) });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;

  const getBookByTitle = new Promise((resolve, reject) => {
    try {
      resolve(Object.values(books).filter((book) => book.title.toLowerCase() === title.toLowerCase()));
    } catch(e) {
      reject(e.message);
    }
  });

    getBookByTitle.then((booklist) => { res.send(booklist); }).catch((e) => { res.status(500).send(e) });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;
