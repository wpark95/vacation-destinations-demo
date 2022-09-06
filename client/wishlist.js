const userInputForm = document.querySelector('#form');

const init = () => {
    userInputForm.addEventListener('submit', formSubmitHandler);
    loadSavedDestinations();
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
    await getImageUrl('post', destinationInfo.name, destinationInfo.location, destinationInfo.description)
        .then(({ id, url, imgFetchSuccessful }) => {
            destinationInfo._id = id;
            destinationInfo.image = url;
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
    const { _id, name, location, description, image } = userInputs;
    const wishlist = document.querySelector('#wishlist-container');

    // Create container for each wichlist item
    const listItemContainer = document.createElement('div');
    listItemContainer.setAttribute('class', 'list-item-container');
    listItemContainer.setAttribute('id', _id);

    // Create container for wishlist item information
    const listItemInfoContainer = document.createElement('div');
    listItemInfoContainer.setAttribute('class', 'list-item-info-container');

    // Create Image element for the list item.
    const listItemImage = document.createElement('img');
    listItemImage.setAttribute('class', 'list-item-image');
    listItemImage.setAttribute('src', image);        

    // Create destination name and location elements for the list item
    const listItemName = document.createElement('p');
    listItemName.setAttribute('class', 'list-item-name');
    listItemName.innerText = name;

    const listItemLocation = document.createElement('p');
    listItemLocation.setAttribute('class', 'list-item-location');
    listItemLocation.innerText = location;

    // Create description for the list item (can be empty if user omitted description)
    listItemDescription = document.createElement('p');
    listItemDescription.setAttribute('class', 'list-item-description');
    if (description.length) {
        listItemDescription.innerText = description;
    }

    // Append destinatnion name, location, and description the to list item container.
    listItemInfoContainer.append(listItemName);
    listItemInfoContainer.append(listItemLocation);
    listItemInfoContainer.append(listItemDescription);

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
    const destDescription = listItemContainer.querySelector('.list-item-description');

    const newDestName = window.prompt('Enter new name');
    const newDestLocation = window.prompt('Enter new location');
    const newDescription = window.prompt('Enter new description');
    
    if (newDestName.length) {
        destName.innerText = newDestName;
    }
    if (newDestLocation.length) {
        destLocation.innerText = newDestLocation;
    }
    if (newDescription.length) {
        destDescription.innerText = newDescription;
    }
    if (newDestName.length || newDestLocation.length || newDescription.length) {
        await getImageUrl('put', destName.innerText, destLocation.innerText, destDescription.innerText, destId)
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

const loadSavedDestinations = async () => {
    return await fetch('/wishlist')
    .then((res) => (res.json()))
    .then((data) => {
        if (data.length) {
            for (let i = 0; i < data.length; i++) {
                addToWishList(data[i]);
            }
        }
    })
    .catch((err) => {
        console.error(err);
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
const getImageUrl = async (method, name, location, description, id) => (
    await fetch('/wishlist', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name,
            location: location,
            description: description,
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
