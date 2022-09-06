const userInputForm = document.querySelector('#form');

const init = () => {
    userInputForm.addEventListener('submit', formSubmitHandler);
};

// Handles the submission of user inputs when Add To List button is clicked
// (currently expecting destination name, location, and description)
const formSubmitHandler = async (e) => {
    e.preventDefault();
    // Update the array below when changing input fields
    const expectedFields = ['name', 'location', 'description']; 
    const destinationInfo = {};

    for (i = 0; i < expectedFields.length; i++) {
        const currElementId = '#dest-' + expectedFields[i];
        const currElement = userInputForm.querySelector(currElementId);
        
        destinationInfo[expectedFields[i]] = currElement.value;
        currElement.value = '';
    }
    await getImageUrl('post', destinationInfo.name, destinationInfo.location)
        .then(({ id, url, imgFetchSuccessful }) => {
            destinationInfo.dbId = id;
            destinationInfo.imageUrl = url;
            if (!imgFetchSuccessful) {
                displayErrorMessage('image');
            }
        })
        .catch((err) => {
            displayErrorMessage('server');
        });

    addToWishList(destinationInfo);
    changeWishlistTitle();
};

const addToWishList = (userInputs) => {
    const { dbId, name, location, description, imageUrl } = userInputs;
    const wishlist = document.querySelector('#wishlist-container');

    // Create container for each wichlist item
    const listItemContainer = document.createElement('div');
    listItemContainer.setAttribute('class', 'list-item-container');
    listItemContainer.setAttribute('id', dbId);

    // Create container for wishlist item information
    const listItemInfoContainer = document.createElement('div');
    listItemInfoContainer.setAttribute('class', 'list-item-info-container');

    // Create Image element for the list item.
    const listItemImage = document.createElement('img');
    listItemImage.setAttribute('class', 'list-item-image');
    listItemImage.setAttribute('src', imageUrl);        

    // Create destination name and location elements for the list item
    const listItemName = document.createElement('p');
    listItemName.setAttribute('class', 'list-item-name');
    listItemName.innerText = name;

    const listItemLocation = document.createElement('p');
    listItemLocation.setAttribute('class', 'list-item-location');
    listItemLocation.innerText = location;

    // Append destinatnion name and location the to list item container.
    // Create & append destination description as well, if user provided description.
    listItemInfoContainer.append(listItemName);
    listItemInfoContainer.append(listItemLocation);
    if (description.length > 0) {
        listItemDescription = document.createElement('p');
        listItemDescription.innerText = description;
        listItemDescription.setAttribute('class', 'list-item-description');
        listItemInfoContainer.append(listItemDescription);
    }

    // Create container for edit & remove buttons
    const listItemButtonsContainer = document.createElement('div');
    listItemButtonsContainer.setAttribute('class', 'btn-container');

    // Create edit & remove buttons
    const editButton = createEditOrRemoveButton('Edit');
    const removeButton = createEditOrRemoveButton('Remove');

    // Append edit & remove buttons to the created buttons container
    listItemButtonsContainer.append(editButton);
    listItemButtonsContainer.append(removeButton);
    
    // Append the created image, user-provided information, and edit/remove buttons to the list item container.
    listItemContainer.append(listItemImage);
    listItemContainer.append(listItemInfoContainer);
    listItemContainer.append(listItemButtonsContainer);

    // Finally, append the list item container to wishlist.
    wishlist.append(listItemContainer);
};

// Prompts the user to enter new name, location, and photo of the wishlist item that they want to edit. 
// Uses original values if the user omits new values. Otherwise, sets newly provided values to the item
const editButtonHandler = async (e) => {
    const listItemContainer = e.target.parentElement.parentElement;
    const destId = listItemContainer.getAttribute('id');
    const destName = listItemContainer.querySelector('.list-item-name');
    const destLocation = listItemContainer.querySelector('.list-item-location');
    const destImage = listItemContainer.querySelector('.list-item-image');

    const newDestName = window.prompt('Enter new name');
    const newDestLocation = window.prompt('Enter new location');
    
    if (newDestName.length) {
        destName.innerText = newDestName;
    }
    if (newDestLocation.length) {
        destLocation.innerText = newDestLocation;
    }
    if (newDestName.length || newDestLocation.length) {
        await getImageUrl('put', destName.innerText, destLocation.innerText, destId)
            .then(({ url, imgFetchSuccessful }) => {
                destImage.setAttribute('src', url);
                if (!imgFetchSuccessful) {
                    displayErrorMessage('image');
                }
            })
            .catch((err) => {
                displayErrorMessage('server');
            });
    }
};

// Removes the target wishlist item when user clicks the remove button
const removeButtonHandler = async (e) => {
    const listItemContainer = e.target.parentElement.parentElement;
    const destId = listItemContainer.getAttribute('id');

    await fetch('/wishlist', {
        method: 'delete',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: destId,
        })
    })
        .then(() => {
            listItemContainer.remove();
        })
        .catch((err) => {
            displayErrorMessage('server');
        });
};

// Updates wishlist title to become 'My Wishlist!' when user adds an item to the wishlist
const changeWishlistTitle = () => {
    wishlistTitle = document.querySelector('#wishlist-title');
    wishlistTitle.innerText = 'My Wishlist';
};

/*
    Helper Functions
*/
const getImageUrl = async (method, name, location, id) => (
    await fetch('/wishlist', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name,
            location: location,
            id: id,
        })
    })
        .then((res) => res.json())
        .catch((err) => { 
            throw err;
         })
);

const displayErrorMessage = (errorType) => {
    if (errorType === 'server') {
        alert('We encountered an error while trying to connect to the server.\n' + 
              'Your destination card(s) may not have been saved.\n' +
              'Please try again and we apologize for the inconvenience.');
    } 
    if (errorType === 'image') {
        alert('We encountered an error while searching for a relevant image for your destination.\n' + 
              'If you edit your destination information using a more widely-used name or location, ' + 
              'we will try our best to find a relevant image again.\n');
    }
};

// Creates an edit or remove button used for each item in the wishlist
const createEditOrRemoveButton = (buttonType) => {
    const buttonId = buttonType.toLowerCase() + '-btn';
    const button = document.createElement('button');
    button.innerText = buttonType;
    button.setAttribute('class', 'card-button');
    button.setAttribute('id', buttonId);
    if (buttonType === 'Edit') {
        button.addEventListener('click', editButtonHandler);
    }
    if (buttonType === 'Remove') {
        button.addEventListener('click', removeButtonHandler) 
    }
    return button;
};

init();
