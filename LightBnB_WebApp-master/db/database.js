const { query } = require("express");
const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require('pg');

//Added Code that allows database,js to be connecte to lightbnb

const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'lightbnb'
});

// the following assumes that you named your connection variable `pool`
// pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {
//   console.log(response);
// });

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

// const getUserWithEmail = function(email) {
//   let resolvedUser = null;
//   for (const userId in users) {
//     const user = users[userId];
//     if (user && user.email && user.email.toLowerCase() === email.toLowerCase()) {
//       resolvedUser = user;
//     }
//   }
//   return Promise.resolve(resolvedUser);
// };

const getUserWithEmail = function(email) {
  return pool
    .query(`SELECT * FROM users
    WHERE email = $1`, [email])
    .then((result) => {
      console.log('in .then user query',result.rows[0]);
      return result.rows[0];
    })
    .catch((err) => {
      console.log('in .catch user query',err.message);
    });
};
/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
// const getUserWithId = function(id) {
//   return Promise.resolve(users[id]);
// };

const getUserWithId = function(id) {
  return pool
    .query(`SELECT * FROM users
    WHERE id = $1`, [id])
    .then((result) => {
      console.log('in .then of GetUserwithId', result.rows[0]);
      return result.rows[0];
    })
    .catch((err) => {
      console.log('in .catch of getUserWithId', err.message);
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  return pool
    .query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user.name, user.email, user.password]
    )
    .then((result) => {
      return result.rows[0];
    })
    .catch((error) => {
    });
};
/// Reservations
/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool
    .query(
     `SELECT reservations.id, properties.title, properties.cost_per_night, reservations.start_date, avg(rating) as average_rating
     FROM reservations
     JOIN properties ON reservations.property_id = properties.id
     JOIN property_reviews ON properties.id = property_reviews.property_id
     WHERE reservations.guest_id = $1
     GROUP BY properties.id, reservations.id
     ORDER BY reservations.start_date
     LIMIT $2;`, [guest_id,limit]
    )
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      console.log("in getAllReservations", error);
    });
};
/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;
  //Query for My Listings Tab
  if(options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += `WHERE owner_id = $${queryParams.length}`;
  }
  
  //Query for City Search
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }
  //Query for Price search, both fields have to be not null
  if(options.minimum_price_per_night && options.maximum_price_per_night) {
    if(options.city||options.minimum_rating){
      queryString += `AND `;
    }
    else{
      queryString+= `WHERE `;
    }
    queryParams.push(options.minimum_price_per_night *100);
    queryParams.push(options.maximum_price_per_night *100);
    queryString += `properties.cost_per_night BETWEEN $${queryParams.length-1} AND $${queryParams.length}`
  }
  if (options.minimum_rating) {
    if (options.city||(options.minimum_price_per_night && options.maximum_price_per_night)) {
      queryString += `AND `;
    }
    else{
      queryString+= `WHERE `;
    }
    queryParams.push(options.minimum_rating);
    queryString += `
        properties.id IN (
        SELECT property_id
        FROM property_reviews
        GROUP BY property_id
        HAVING AVG(rating) >= $${queryParams.length}
      )
    `;
  }
  // 4
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  //console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);
};
/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const {
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms
  } = property;

  const queryParams = [
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms
  ];

  const queryString = `
    INSERT INTO properties (
      owner_id,
      title,
      description,
      thumbnail_photo_url,
      cover_photo_url,
      cost_per_night,
      street,
      city,
      province,
      post_code,
      country,
      parking_spaces,
      number_of_bathrooms,
      number_of_bedrooms
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
  `;

  return pool
    .query(queryString, queryParams)
    .then((result) => {
      // Return the saved version of the property
      return result.rows[0];
    })
    .catch((error) => {
      // Handle the error if the property insertion fails
      console.error('Error adding property:', error);
      throw error;
    });
};


module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
