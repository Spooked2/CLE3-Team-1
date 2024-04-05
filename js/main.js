window.addEventListener("load", init);

//Globals
const apiUrl = "https://stud.hosted.hr.nl/1087172/quick-database-crud-cle3/";
let allRestaurantsInfo = {};
let restaurantSmallDetails = {};
let restaurantBigDetails = {};
let searchResultsDialog;
let searchResultsContainer;
let bigDetailDialog;
let bigDetailArticle;

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
    //Add a click event listener to all search results  to make them display a big modal with more details
    searchResultsContainer.addEventListener('click', resultClickHandler);

    //Get the dialog for the big details
    bigDetailDialog = document.getElementById('big_detail_dialog');
    //Add a way to close the dialog if you click outside the window
    bigDetailDialog.addEventListener('click', (e) => {
        if (e.target.tagName === 'DIALOG') {
            bigDetailDialog.close();
        }
    })

    //Get the container for the big dialog article
    bigDetailArticle = document.getElementById('big_detail_article');

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

    //Loop through all the restaurants and create articles for search results modal
    for (const restaurant of restaurants) {

        //Store the restaurant info in variable, so we don't need to fetch the information again
        allRestaurantsInfo[restaurant.id] = restaurant;

        //Create the article element
        let article = document.createElement('article');

        //Create a div for the restaurant's image
        let imageDiv = document.createElement('div');

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

        //Fill the image div with the image
        imageDiv.appendChild(image);

        //Fill the info div with correct elements
        infoDiv.appendChild(name);
        infoDiv.appendChild(location);
        infoDiv.appendChild(pricing)
        infoDiv.appendChild(website);

        //Fill the rating div with correct elements
        ratingDiv.appendChild(ratingImage);
        ratingDiv.appendChild(ratingText);

        //Fill main article with correct elements
        article.appendChild(imageDiv);
        article.appendChild(infoDiv);
        article.appendChild(ratingDiv);

        //Get general accessibility rating for restaurant
        let rating = getGeneralRating(restaurant);

        //Give the images the right sources
        // image.src = `images/${restaurant.id}.png`;
        image.src = `images/placeholder.png`;
        ratingImage.src = `images/rating/${rating.general}.png`;
        pricing.src = `images/pricing/${restaurant.pricing}.png`;

        //Fill created elements with the restaurant info
        name.innerText = restaurant.name;
        location.innerText = restaurant.location;
        website.href = restaurant.website;
        website.innerText = restaurant.website;
        ratingText.innerText = rating.general;

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
 * @returns {Object} - Contains a string of a general rating of the restaurant's accessibility and information for each accessibility feature
 */
function getGeneralRating(restaurant) {
    let score = 0;
    let rating = {};


    if (restaurant.wc === 'on') {
        score++;
        rating['wc'] = 'good';
    } else {
        rating['wc'] = 'bad';
    }


    //If the restaurant is not on the ground floor, checks the lift and ramp situation
    if (restaurant.ground_floor !== 'on') {

        if (restaurant.ramp === 'on') {
            score++;
            rating['ramp'] = 'good';
        } else {
            rating['ramp'] = 'bad';
        }

        if (restaurant.lift === 'on') {
            score++;
            rating['lift'] = 'good';
        } else {
            rating['lift'] = 'bad';
        }

        rating['ground_floor'] = 'bad';

    } else {
        score += 2;
        rating['ground_floor'] = 'good';
        rating['lift'] = 'medium';
        rating['ramp'] = 'medium';
    }

    if (restaurant.hall_width >= 180) {
        score++;
        rating['hall_width'] = 'good';
    } else {
        rating['hall_width'] = 'bad';
    }

    if (restaurant.door_width >= 180) {
        score++;
        rating['door_width'] = 'good';
    } else {
        rating['door_width'] = 'bad';
    }

    if (restaurant.door_system === 'Automatic') {
        score++;
        rating['door_system'] = 'good';
    } else {
        rating['door_system'] = 'bad';
    }

    if (restaurant.distance_ov <= 100) {
        score++;
        rating['distance_ov'] = 'good';
    } else {
        rating['distance_ov'] = 'bad';
    }

    if (restaurant.distance_park <= 100) {
        score++;
        rating['distance_park'] = 'good';
    } else {
        rating['distance_park'] = 'bad';
    }


    if (score >= 7) {
        rating['general'] = 'good'
    } else if (score < 7 && score >= 5) {
        rating['general'] = 'medium';
    } else {
        rating['general'] = 'bad';
    }

    return rating;

}

function resultClickHandler(e) {

    //Don't do anything if the clicked thing is a dialog, section or anchor
    if (e.target.tagName === 'DIALOG' || e.target.tagName === 'SECTION' || e.target.tagName === 'A') {
        return;
    }

    //Get the correct ID even if the clicked thing wasn't the article element
    let id;

    if (e.target.tagName === 'ARTICLE') {
        id = e.target.dataset.id;
    } else if (e.target.tagName === 'DIV') {
        id = e.target.parentElement.dataset.id;
    } else {
        id = e.target.parentElement.parentElement.dataset.id;
    }

    //Create a big detail article if one doesn't exist already
    if (!restaurantBigDetails[id]) {
        createBigDetailArticle(allRestaurantsInfo[id]);
    }

    //Replace the innerHTML of the big detail article with the correct article
    bigDetailArticle.innerHTML = restaurantBigDetails[id];

    //Show the dialog
    bigDetailDialog.showModal();

}

function createBigDetailArticle(restaurant) {

    //Get the rating information of the restaurant
    let rating = getGeneralRating(restaurant);

    //Create all the required DOM elements
    let article = document.createElement('article');
    let image = document.createElement('img');
    let name = document.createElement('h2');
    let type = document.createElement('p');
    let location = document.createElement('p');
    let website = document.createElement('p');
    let pricing = document.createElement('img');

    //Create divs for easier styling
    let imageDiv = document.createElement('div');
    let infoDiv = document.createElement('div');
    let ratingDiv = document.createElement('div');

    //Fill the divs with the correct elements
    imageDiv.appendChild(image);

    infoDiv.appendChild(name);
    infoDiv.appendChild(type);
    infoDiv.appendChild(pricing);
    infoDiv.appendChild(location);
    infoDiv.appendChild(website);

    const accessibilityFeatures = ['wc', 'ground_floor', 'lift', 'ramp', 'door_system', 'door_width', 'hall_width', 'distance_park', 'distance_ov']

    for (const accessibilityFeature of accessibilityFeatures) {
        //Create elements
        let div = document.createElement('div');
        let name = document.createElement('p');
        let description = document.createElement('p');
        let ratingImage = document.createElement('img');

        div.appendChild(name);
        div.appendChild(description);
        div.appendChild(ratingImage);

        //Fill elements with correct information
        description.innerText = restaurant[accessibilityFeature];
        ratingImage.src = `images/rating/${rating[accessibilityFeature]}.png`;

        let text;
        switch (accessibilityFeatures.indexOf(accessibilityFeature)) {
            case 0: text = 'Is er een invalidetoilet aanwezig?'; break;
            case 1: text = 'Op de begane grond?'; break;
            case 2: text = 'Is er een lift aanwezig?'; break;
            case 3: text = 'Is er een helling aanwezig?'; break;
            case 4: text = 'Wat voor deur is er?'; break;
            case 5: text = 'Hoe wijd zijn de deuren?'; break;
            case 6: text = 'Hoe wijd zijn de gangpaden?'; break;
            case 7: text = 'Hoe ver is de dichtstbijzijnde parkeerplaats?'; break;
            case 8: text = 'Hoe ver is de dichtstbijzijnde OV halte?'; break;
            default: text = 'Er is iets fout gegaan!';
        }
        name.innerText = text;
        ratingImage.src = `images/rating/${rating[accessibilityFeature]}.png`;

        //Add div to ratingDiv
        ratingDiv.appendChild(div);

    }

    //Fill elements with correct information
    name.innerText = restaurant.name;
    type.innerText = restaurant.type;
    location.innerText = restaurant.location;
    website.innerText = restaurant.website;
    pricing.src = `images/pricing/${restaurant.pricing}.png`;
    image.src = `images/placeholder.png`;

    //Create a separate div for the image and info divs for styling
    let info = document.createElement('div');
    info.appendChild(imageDiv);
    info.appendChild(infoDiv);

    //Add everything to the article
    article.appendChild(info);
    article.appendChild(ratingDiv);

    //Save the article in global variable
    restaurantBigDetails[restaurant.id] = article.innerHTML;

}

function errorHandler(error) {
    console.log(error);
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("error");
    errorDiv.innerText = "data not available";
}