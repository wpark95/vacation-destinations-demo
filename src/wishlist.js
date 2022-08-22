const userInputForm = document.querySelector("form");
const userInputs = userInputForm.querySelectorAll(".user-input-box");
const wishlist = document.querySelector("#wishlist-container");

const init = () => {
    userInputForm.addEventListener("submit", addToListHandler);
}

const addToListHandler = (e) => {
    const userInputsArr = [];

    e.preventDefault();
    for (i = 0; i < userInputs.length; i++) {
        userInputsArr.push(userInputs[i].value);
        userInputs[i].value = "";
    }
    addToWishlist(userInputsArr[0], userInputsArr[1], userInputsArr[2], userInputsArr[3]);
    changeWishlistTitle();
}

const addToWishlist = (name, location, photo, description) => {
    // Create container for each wichlist item
    let listItemContainer = document.createElement("div");
    listItemContainer.setAttribute("class", "list-item-container");

    // Create container for wishlist item information
    let listItemInfoContainer = document.createElement("div");

    // Create children for wishlist item information (destination name, location, photo) to list item information container (listItemInfoContainer)
    let listItemName = document.createElement("p");
    listItemName.setAttribute("class", "list-item-name");
    listItemName.innerText = name;

    let listItemLocation = document.createElement("p");
    listItemLocation.setAttribute("class", "list-item-location");
    listItemLocation.innerText = location;

    let listItemPhoto = document.createElement("img");
    listItemPhoto.setAttribute("class", "list-item-image")
    let defaultPhoto = "https://misstourist.com/wp-content/uploads/2021/03/0-best-airbnb-aruba.jpg";
    photo.length > 0 ? listItemPhoto.setAttribute("src", photo) : listItemPhoto.setAttribute("src", defaultPhoto);

    // Append the created children to list item information container
    listItemInfoContainer.append(listItemPhoto);
    listItemInfoContainer.append(listItemName);
    listItemInfoContainer.append(listItemLocation);
    if (description.length > 0) {
        listItemDescription = document.createElement("p");
        listItemDescription.innerText = description;
        listItemDescription.setAttribute("class", "list-item-description");
        listItemInfoContainer.append(listItemDescription);
    }

    // Create container for edit & remove buttons
    let listItemButtonsContainer = document.createElement("div");

    // Create edit & remove buttons
    let editButton = document.createElement("button");
    editButton.innerText = "Edit";
    editButton.setAttribute("class", "edit-btn");
    editButton.addEventListener("click", editButtonHandler);
    let removeButton = document.createElement("button")
    removeButton.innerText = "Remove";
    removeButton.setAttribute("class", "remove-btn");
    removeButton.addEventListener("click", removeButtonHandler);

    // Append edit & remove buttons to the created buttons container
    listItemButtonsContainer.append(editButton);
    listItemButtonsContainer.append(removeButton);
    
    listItemContainer.append(listItemInfoContainer);
    listItemContainer.append(listItemButtonsContainer);

    wishlist.append(listItemContainer);
}

const editButtonHandler = (e) => {
    listItemContainer = e.target.parentElement.parentElement;
    const name = listItemContainer.querySelector(".list-item-name");
    const location = listItemContainer.querySelector(".list-item-location");
    const photo = listItemContainer.querySelector(".list-item-image");

    const newName = window.prompt("Enter new name");
    const newLocation = window.prompt("Enter new location");
    const newPhotoUrl = window.prompt("Enter new photo url");
    
    newName.length < 1 ? null : name.innerText = newName;
    newLocation.length < 1 ? null : location.innerText = newLocation;
    newPhoto.length < 1 ? null : photo.setAttribute("src", newPhotoUrl);
}

const removeButtonHandler = (e) => {
    const listItemContainer = e.target.parentElement.parentElement;
    listItemContainer.remove();
}

const changeWishlistTitle = () => {
    wishlistTitle = document.querySelector("#wishlist-title");
    wishlistTitle.innerText = "My Wishlist"
}

init();