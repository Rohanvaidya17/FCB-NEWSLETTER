const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const cors = require('cors');
require('dotenv').config();  // Load environment variables from .env file

const app = express();
app.use(cors());  // Allow cross-origin requests

const PORT = process.env.PORT || 3000;  // Use the port from .env or default to 3000

// Variables to store news and match data
let latestNews = [];
let upcomingMatches = [];

// Function to fetch the latest news from NewsAPI
const fetchNews = async () => {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'FC Barcelona',  // Search for FC Barcelona-related news
        apiKey: process.env.NEWS_API_KEY,  // Use API key from .env file
        language: 'en',
        pageSize: 4  // Limit to 5 articles
      }
    });
    latestNews = response.data.articles;  // Store the latest articles
    console.log('News data updated');
  } catch (error) {
    console.error('Error fetching news:', error);
  }
};

// Function to fetch upcoming matches from Football-Data.org
const fetchMatches = async () => {
  try {
    const response = await axios.get('https://api.football-data.org/v4/matches', {
      headers: { 'X-Auth-Token': 'b5ab7c91bd814281abdd404c44b494ca' },  // Use your API key directly
      params: {
        team: 81,  // FC Barcelona's team ID
        status: 'SCHEDULED',  // Fetch only upcoming matches
        limit: 2  // Limit to 2 upcoming matches
      }
    });
    // Filter matches to include only those involving FC Barcelona
    upcomingMatches = response.data.matches.filter(match =>
      match.homeTeam.id === 81 || match.awayTeam.id === 81
    );
    console.log('Matches data updated');
  } catch (error) {
    console.error('Error fetching matches:', error);
  }
};

// Schedule cron job to update data every hour
cron.schedule('0 * * * *', () => {
  console.log('Running cron job to update news and match data');
  fetchNews();
  fetchMatches();
});

// Fetch data initially when the server starts
fetchNews();
fetchMatches();

// API endpoint to get the latest news
app.get('/api/news', (req, res) => {
  res.json(latestNews);
});

// API endpoint to get upcoming matches
app.get('/api/matches', (req, res) => {
  res.json(upcomingMatches);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
