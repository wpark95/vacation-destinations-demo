const userInputForm = document.querySelector("form");
const wishlist = document.querySelector("#wishlist-container");

const init = () => {
    userInputForm.addEventListener("submit", addToListHandler);
}

// Handles the submission of user inputs when Add To List button is clicked
// (currently expecting destination name, location, and description)
const addToListHandler = (e) => {
    e.preventDefault();
    const expectedFields = ["name", "location", "description"];
    const providedInputs = {};

    for (i = 0; i < expectedFields.length; i++) {
        const currElementId = `#dest-${expectedFields[i]}`;
        const currElement = userInputForm.querySelector(currElementId);
        
        providedInputs[expectedFields[i]] = currElement.value;
        currElement.value = "";
    }

    addToWishlist(providedInputs);
    changeWishlistTitle();
}

// Prompts the user to enter new name, location, and photo of the wishlist item that they want to edit. 
// Uses original values if the user omits new values. Otherwise, sets newly provided values to the item
const editButtonHandler = async (e) => {
    listItemContainer = e.target.parentElement.parentElement;
    const destName = listItemContainer.querySelector(".list-item-name");
    const destLocation = listItemContainer.querySelector(".list-item-location");
    const destImage = listItemContainer.querySelector(".list-item-image");

    const newDestName = window.prompt("Enter new name");
    const newDestLocation = window.prompt("Enter new location");
    
    newDestName.length ? destName.innerText = newDestName : null;
    newDestLocation.length ? destLocation.innerText = newDestLocation : null;
    (newDestName.length || newDestLocation.length) 
        ? destImage.setAttribute("src", await getImageUrl(newDestName, newDestLocation)) 
        : null;
}

// Removes the target wishlist item when user clicks the remove button
const removeButtonHandler = (e) => {
    const listItemContainer = e.target.parentElement.parentElement;
    listItemContainer.remove();
}

/* 
Helper Functions
*/
const addToWishlist = async (userInputs) => {
    const { name, location, description } = userInputs;

    // Create container for each wichlist item
    const listItemContainer = document.createElement("div");
    listItemContainer.setAttribute("class", "list-item-container");

    // Create container for wishlist item information
    const listItemInfoContainer = document.createElement("div");
    listItemInfoContainer.setAttribute("class", "list-item-info-container");

    // Create Image element for the list item.
    const listItemImage = document.createElement("img");
    listItemImage.setAttribute("class", "list-item-image");
    listItemImage.setAttribute("src", await getImageUrl(name, location));

    // Create destination name and location elements for the list item
    const listItemName = document.createElement("p");
    listItemName.setAttribute("class", "list-item-name");
    listItemName.innerText = name;

    const listItemLocation = document.createElement("p");
    listItemLocation.setAttribute("class", "list-item-location");
    listItemLocation.innerText = location;

    // Append destinatnion name and location the to list item container.
    // Create & append destination description as well, if user provided description.
    listItemInfoContainer.append(listItemName);
    listItemInfoContainer.append(listItemLocation);
    if (description.length > 0) {
        listItemDescription = document.createElement("p");
        listItemDescription.innerText = description;
        listItemDescription.setAttribute("class", "list-item-description");
        listItemInfoContainer.append(listItemDescription);
    }

    // Create container for edit & remove buttons
    const listItemButtonsContainer = document.createElement("div");
    listItemButtonsContainer.setAttribute("class", "btn-container");

    // Create edit & remove buttons
    const editButton = createEditOrRemoveButton("Edit");
    const removeButton = createEditOrRemoveButton("Remove");

    // Append edit & remove buttons to the created buttons container
    listItemButtonsContainer.append(editButton);
    listItemButtonsContainer.append(removeButton);
    
    // Append the created image, user-provided information, and edit/remove buttons to the list item container.
    listItemContainer.append(listItemImage);
    listItemContainer.append(listItemInfoContainer);
    listItemContainer.append(listItemButtonsContainer);

    // Finally, append the list item container to wishlist.
    wishlist.append(listItemContainer);
}

// Generates an image url for a wishlist item. 
// Automatically uses a photo that matches user-provided name & location. 
// If a matching photo cannot be found, uses a default image.
const getImageUrl = async (destination, location) => {
    const url = `https://api.unsplash.com/search/photos/?client_id=${keys.accessKey}&query=${destination} ${location}`;
    let imageUrl = "https://c.tenor.com/_4YgA77ExHEAAAAd/rick-roll.gif";

    try {
        const queryResults = await fetch(url).then(res => res.json());
        const firstResultUrl = queryResults.results[0].urls.small;
        firstResultUrl.length ? imageUrl = firstResultUrl : null;
    } catch(err) {
        console.error(err);
        alert(`We encountered an error trying to search for a relevant image for your destination.\n
        So, instead of staring at a boring error icon image, please admire Rick Astley in the meantime.\n
        If you edit your destination information, we will try our best to find a relevant image again.`);
    } finally {
        return imageUrl;
    }
}

// Updates wishlist title to become "My Wishlist!" when user adds an item to the wishlist
const changeWishlistTitle = () => {
    wishlistTitle = document.querySelector("#wishlist-title");
    wishlistTitle.innerText = "My Wishlist"
}

// Creates an edit or remove button used for each item in the wishlist
const createEditOrRemoveButton = (buttonType) => {
    const buttonClassName = buttonType.toLowerCase() + "-btn";
    const button = document.createElement("button");
    button.innerText = buttonType;
    button.setAttribute("class", buttonClassName);
    buttonType === "Edit"  
        ? button.addEventListener("click", editButtonHandler)
        : buttonType === "Remove" 
            ? button.addEventListener("click", removeButtonHandler) 
            : null;
    return button;
}

init();
