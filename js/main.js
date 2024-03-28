window.addEventListener("load", init);

//Globals
const apiUrl = "https://stud.hosted.hr.nl/1087172/quick-database-crud-cle3/";
let allRestaurantsInfo;
let restaurantSmallDetails = {};
let restaurantBigDetails = {};
let searchResultsDialog;
let searchResultsContainer

function init() {
    getData(apiUrl, fetchAllHandler);

    //Get the dialog for the search results
    searchResultsDialog = document.getElementById('search_results_dialog');
    //Add a temporary way to open the dialog
    let testSearchDialog = document.getElementById('show_search_results');
    testSearchDialog.addEventListener('click', () => {
        searchResultsDialog.show();
    })
    //Add a temporary way to close the dialog
    let hideSearchDialog = document.getElementById('hide_search_results');
    hideSearchDialog.addEventListener('click', () => {
        searchResultsDialog.close();
    })

    //Get the container to put the search results in
    searchResultsContainer = document.getElementById('search_results');

}

function getData(url, success) {
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(success)
        .catch(errorHandler);
}

/**
 * Creates small articles displaying a summary of the fetched restaurant info, and stores the fetched object in global variable.
 * @param {Object} restaurants - Main object
 * @param {Object} restaurants.restaurant - A child of the main object
 * @param {Number} restaurants.restaurant.id - Restaurant id
 * @param {String} restaurants.restaurant.name - Restaurant name
 * @param {String} restaurants.restaurant.location - Restaurant location
 * @param {String} restaurants.restaurant.website - Link to the restaurant's own website
 * @param {String} restaurants.restaurant.pricing - Price range of the restaurant
 */
function fetchAllHandler(restaurants) {

    allRestaurantsInfo = restaurants;

    //Loop through all the restaurants and create articles for search results modal
    for (const restaurant of restaurants) {

        //Create the article element
        let article = document.createElement('article');

        //Create image element
        let image = document.createElement('img');

        //Create div for name, location, pricing and website
        let infoDiv = document.createElement('div');

        //Create a h2 for name
        let name = document.createElement('h2');

        //Create a paragraph for the location
        let location = document.createElement('p');

        //Create an image element for the pricing
        let pricing = document.createElement('img');

        //Create an Anchor for the website link
        let website = document.createElement('a');

        //Create a div to contain the accessibility rating text and image
        let ratingDiv = document.createElement('div');

        //Create an image element for the accessibility rating image
        let ratingImage = document.createElement('img');

        //Create a paragraph to put the rating in text
        let ratingText = document.createElement('p');

        //Fill the info div with correct elements
        infoDiv.appendChild(name);
        infoDiv.appendChild(location);
        infoDiv.appendChild(pricing)
        infoDiv.appendChild(website);

        //Fill the rating div with correct elements
        ratingDiv.appendChild(ratingImage);
        ratingDiv.appendChild(ratingText);

        //Fill main article with correct elements
        article.appendChild(image);
        article.appendChild(infoDiv);
        article.appendChild(ratingDiv);

        //Get general accessibility rating for restaurant
        let rating = getGeneralRating(restaurant);

        //Give the images the right sources
        // image.src = `images/${restaurant.id}.png`;
        image.src = `images/placeholder.png`;
        ratingImage.src = `images/rating/${rating}.png`;
        pricing.src = `images/pricing/${restaurant.pricing}.png`;

        //Fill created elements with the restaurant info
        name.innerText = restaurant.name;
        location.innerText = restaurant.location;
        website.href = restaurant.website;
        website.innerText = restaurant.website;
        ratingText.innerText = rating;

        //Add dataset to article
        article.dataset.name = restaurant.name;
        article.dataset.size = 'small';
        article.dataset.id = `${restaurant.id}`;

        //Add final article to object
        restaurantSmallDetails[restaurant.id] = article;

        //Add final article to search results dialog for testing
        searchResultsContainer.appendChild(article);
    }

}

/**
 * Checks a given restaurant's accessibility accommodations
 *
 * @param {Object} restaurant - Object containing all the restaurant info
 * @param {String} restaurant.wc - If the building has a handicapped toilet or not
 * @param {String} restaurant.ground_floor - If the building is on the ground floor or not
 * @param {String} restaurant.lift - If the building has a lift or not
 * @param {String} restaurant.ramp - If the building has a ramp or not
 * @param {String} restaurant.door_system - What system the front door uses to open and close
 * @param {Number} restaurant.door_width - Width of the front door in centimeters
 * @param {Number} restaurant.hall_width - Width of most halls in centimeters
 * @param {Number} restaurant.distance_ov - Distance to the closest public transit stop in meters
 * @param {Number} restaurant.distance_park - Distance to the closest parking spot in meters
 *
 * @returns {String} - General rating of the restaurant's accessibility
 */
function getGeneralRating(restaurant) {
    let score = 0;

    if (restaurant.wc === 'on') {
        score++;
    }

    //If the restaurant is not on the ground floor, checks the lift and ramp situation
    if (restaurant.ground_floor !== 'on') {

        if (restaurant.ramp === 'on') {
            score++;
        }

        if (restaurant.lift === 'on') {
            score++;
        }

    } else {
        score += 2;
    }

    if (restaurant.hall_width >= 180) {
        score++;
    }

    if (restaurant.door_width >= 180) {
        score++;
    }

    if (restaurant.door_system === 'Automatic') {
        score++;
    }

    if (restaurant.distance_ov <= 100) {
        score++;
    }

    if (restaurant.distance_park <= 100) {
        score++;
    }

    let rating;

    if (score >= 7) {
        rating = 'good'
    } else if (score < 7 && score >= 5) {
        rating = 'medium';
    } else {
        rating = 'bad';
    }

    return rating;


}

function errorHandler(error) {
    console.log(error);
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("error");
    errorDiv.innerText = "data not available";
}