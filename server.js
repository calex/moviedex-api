const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const MOVIEDEX = require('./moviedex.json');

require('dotenv').config();

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));

app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req,res,next) {
    authToken = req.get('Authorization');
    apiToken = process.env.API_TOKEN;

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' });
    }

    next();
});

function handleGetMovies(req, res) {
    const { genre, country, avg_vote } = req.query;

    let results = MOVIEDEX;

    if (genre) {
        results = results
            .filter(movie =>
                movie
                .genre
                .toLowerCase()
                .includes(genre.toLowerCase())
            );
    }

    if (country) {
        results = results
            .filter(movie =>
                movie
                .country
                .toLowerCase()
                .includes(country.toLowerCase())
            );
    }

    if (avg_vote) {
        const numberizedAvgVote = Number(avg_vote);

        if (!isNaN(numberizedAvgVote)) {
            results = results
                .filter(movie => 
                    movie.avg_vote >= numberizedAvgVote
                );
        } else {
            return res
                .status(400)
                .send(`Average vote must be a number.`);
        }
    }

    res.json(results);
 }
    
app.get('/movie', handleGetMovies);

// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
    let response;

    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }

    res.status(500).json(response);
});  

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})