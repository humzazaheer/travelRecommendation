
// Define the path to your JSON file
const DATA_SOURCE = 'https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBMSkillsNetwork-JS0101EN-SkillsNetwork/travel1.json';
let travelData = null; // Variable to hold the fetched data globally

// DOM elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resetBtn = document.getElementById('reset-btn');
const introBox = document.getElementById('intro-box');
const resultsOverlay = document.getElementById('results-container');
const resultsDisplay = document.getElementById('recommendations-display');
const clearResultsOverlayBtn = document.getElementById('clear-results-overlay');

// Map generic image placeholders to actual URLs (YOU SHOULD UPDATE THESE)
const imageMap = {
    // Countries/Cities
    'enter_your_image_for_sydney.jpg': 'https://placehold.co/300x200/4ECDC4/1A1A1A?text=Sydney',
    'enter_your_image_for_melbourne.jpg': 'https://placehold.co/300x200/FF6B6B/1A1A1A?text=Melbourne',
    'enter_your_image_for_tokyo.jpg': 'https://placehold.co/300x200/4ECDC4/1A1A1A?text=Tokyo',
    'enter_your_image_for_kyoto.jpg': 'https://placehold.co/300x200/FF6B6B/1A1A1A?text=Kyoto',
    'enter_your_image_for_rio.jpg': 'https://placehold.co/300x200/4ECDC4/1A1A1A?text=Rio',
    'enter_your_image_for_sao-paulo.jpg': 'https://placehold.co/300x200/FF6B6B/1A1A1A?text=Sao+Paulo',
    
    // Temples
    'enter_your_image_for_angkor-wat.jpg': 'https://placehold.co/300x200/F7FFF7/1A1A1A?text=Angkor+Wat',
    'enter_your_image_for_taj-mahal.jpg': 'https://placehold.co/300x200/F7FFF7/1A1A1A?text=Taj+Mahal',
    
    // Beaches
    'enter_your_image_for_bora-bora.jpg': 'https://placehold.co/300x200/69DBFF/1A1A1A?text=Bora+Bora',
    'enter_your_image_for_copacabana.jpg': 'https://placehold.co/300x200/69DBFF/1A1A1A?text=Copacabana',
};


/**
 * Fetches data from the local JSON file.
 * Stores the result in the global travelData variable.
 */
async function fetchData() {
    try {
        const response = await fetch(DATA_SOURCE);
        if (!response.ok) {
            // Check for file existence/correct path
            throw new Error(`HTTP error! Status: ${response.status}. Ensure '${DATA_SOURCE}' exists.`);
        }
        travelData = await response.json();
        console.log("Successfully fetched travel data:", travelData);
    } catch (error) {
        console.error("Could not fetch the travel recommendations data:", error);
    }
}


/**
 * Handles the search button click event, performing case-insensitive keyword matching.
 */
function handleSearch() {
    if (!travelData) {
        displayError("Travel data is not available. Please check the JSON file path.");
        return;
    }

    // 1. Normalize the search term (convert to lowercase and trim spaces)
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm.length === 0) {
        displayError("Please enter 'beach', 'temple', or 'country' to get recommendations.");
        return;
    }

    let recommendations = [];

    // 2. Keyword Matching Logic for the three main categories
    if (searchTerm.includes('beach') || searchTerm.includes('beaches')) {
        recommendations = travelData.beaches;
    } else if (searchTerm.includes('temple') || searchTerm.includes('temples')) {
        recommendations = travelData.temples;
    } else if (searchTerm.includes('country') || searchTerm.includes('countries')) {
        // Collect all cities from all countries for a 'country' search
        travelData.countries.forEach(country => {
            recommendations.push(...country.cities);
        });
    } else {
        // Broad search for city/country names if specific category keyword is not used
        recommendations = searchBroadly(searchTerm);
    }


    // 3. Display the results
    if (recommendations.length > 0) {
        displayResults(recommendations);
    } else {
        displayError(`No recommendations found for keyword: "${searchInput.value}"`);
    }
}


/**
 * Performs a broad search across all cities, temples, and beaches
 * based on partial name matches.
 * @param {string} term - The normalized search term.
 * @returns {Array} List of matching recommendations.
 */
function searchBroadly(term) {
    let matches = [];
    
    // Search cities (from countries section)
    travelData.countries.forEach(country => {
        country.cities.forEach(city => {
            if (city.name.toLowerCase().includes(term) || country.name.toLowerCase().includes(term)) {
                matches.push(city);
            }
        });
    });

    // Search dedicated sections
    const combinedDestinations = [...travelData.temples, ...travelData.beaches];
    combinedDestinations.forEach(item => {
        if (item.name.toLowerCase().includes(term)) {
            matches.push(item);
        }
    });

    // Return unique matches
    const uniqueMatches = Array.from(new Set(matches.map(a => JSON.stringify(a)))).map(a => JSON.parse(a));
    return uniqueMatches;
}


/**
 * Renders the recommendation cards to the UI.
 * @param {Array} recommendations - List of objects to display.
 */
function displayResults(recommendations) {
    resultsDisplay.innerHTML = ''; // Clear previous results
    
    // Hide main intro and show results overlay
    introBox.classList.add('hidden');
    resultsOverlay.classList.remove('hidden');

    recommendations.forEach(item => {
        // Get the mapped image URL or use a fallback placeholder
        const imageUrl = imageMap[item.imageUrl] || 'https://placehold.co/300x200/888/FFF?text=Image+Missing';
        
        const card = document.createElement('div');
        card.classList.add('result-card');
        
        // Structure matches the screenshot (Image, Name, Description, Button)
        card.innerHTML = `
            <img src="${imageUrl}" alt="${item.name}" onerror="this.onerror=null; this.src='https://placehold.co/300x200/888/FFF?text=Image+Load+Error';" />
            <div class="card-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <button class="btn book-now-btn" style="margin-top: 15px; padding: 8px 15px;">Visit</button>
            </div>
        `;
        resultsDisplay.appendChild(card);
    });
}


/**
 * Displays an error or informational message in the results area.
 * @param {string} message - The message to display.
 */
function displayError(message) {
    resultsDisplay.innerHTML = `<p style="color: white; font-size: 1.5em; text-align: center; padding: 50px;">${message}</p>`;
    // Show results overlay even for errors
    introBox.classList.add('hidden');
    resultsOverlay.classList.remove('hidden');
}


/**
 * Clears the search results and resets the UI to the homepage view.
 * This function is called by the 'Clear' button in the navbar and the 'X Clear Results' button.
 */
function handleReset() {
    searchInput.value = ''; // Clear the input field
    resultsDisplay.innerHTML = ''; // Clear the results container
    
    // Hide results overlay and show main intro
    resultsOverlay.classList.add('hidden');
    introBox.classList.remove('hidden');
}


// =======================================================================
// Event Listeners Initialization
// =======================================================================

// Attach event listeners to the Search and Reset buttons
searchBtn.addEventListener('click', handleSearch);
resetBtn.addEventListener('click', handleReset);
clearResultsOverlayBtn.addEventListener('click', handleReset); // Overlay 'X Clear' button

// Initialize data fetching on page load
fetchData();
