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
    const listItemContainer = document.createElement("div");
    listItemContainer.setAttribute("class", "list-item-container");

    // Create container for wishlist item information
    const listItemInfoContainer = document.createElement("div");
    listItemInfoContainer.setAttribute("class", "list-item-info-container");

    // Create Image element for list item container. If not provided, use default image
    const listItemPhoto = document.createElement("img");
    listItemPhoto.setAttribute("class", "list-item-image")
    const defaultPhoto = "https://misstourist.com/wp-content/uploads/2021/03/0-best-airbnb-aruba.jpg";
    photo.length > 0 ? listItemPhoto.setAttribute("src", photo) : listItemPhoto.setAttribute("src", defaultPhoto);

    // Create children for wishlist item information (i.e., destination name, location, and description if provided) for list item information container
    const listItemName = document.createElement("p");
    listItemName.setAttribute("class", "list-item-name");
    listItemName.innerText = name;

    const listItemLocation = document.createElement("p");
    listItemLocation.setAttribute("class", "list-item-location");
    listItemLocation.innerText = location;

    // Append name, location, and description (if provided) to list item information container
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
    
    listItemContainer.append(listItemPhoto);
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
    
    newName.length > 0 ? name.innerText = newName : null;
    newLocation.length > 0 ? location.innerText = newLocation : null;
    newPhotoUrl.length > 0 ? photo.setAttribute("src", newPhotoUrl) : null;
}

const removeButtonHandler = (e) => {
    const listItemContainer = e.target.parentElement.parentElement;
    listItemContainer.remove();
}

const changeWishlistTitle = () => {
    wishlistTitle = document.querySelector("#wishlist-title");
    wishlistTitle.innerText = "My Wishlist"
}

const createEditOrRemoveButton = (buttonType) => {
    const buttonClassName = buttonType.toLowerCase() + "-btn";
    const button = document.createElement("button");
    button.innerText = buttonType;
    button.setAttribute("class", buttonClassName);
    buttonType === "Edit" ? button.addEventListener("click", editButtonHandler) : button.addEventListener("click", removeButtonHandler);
    return button;
}

init();