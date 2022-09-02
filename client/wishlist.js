const userInputForm = document.getElementById('form');
const defaultImageUrl = 'https://c.tenor.com/_4YgA77ExHEAAAAd/rick-roll.gif';

const init = () => {
    userInputForm.addEventListener('submit', formSubmitHandler);
}

// Handles the submission of user inputs when Add To List button is clicked
// (currently expecting destination name, location, and description)
const formSubmitHandler = async (e) => {
    e.preventDefault();
    const expectedFields = ['name', 'location', 'description'];
    const destinationInfo = {};

    for (i = 0; i < expectedFields.length; i++) {
        const currElementId = `#dest-${expectedFields[i]}`;
        const currElement = userInputForm.querySelector(currElementId);
        
        destinationInfo[expectedFields[i]] = currElement.value;
        currElement.value = '';
    }

    try {
        await fetch('/destinations', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: destinationInfo.name,
                location: destinationInfo.location
            }),
        })
            .then(res => res.json())
            .then(({ url }) => {
                destinationInfo.imageUrl = url;
            })
    } catch(error) {
        console.error(error);
        // If the fetch fails, use default image url.
        destinationInfo.imageUrl = defaultImageUrl; 
        // Display an alert for the user.
        alert(`We encountered an error trying to search for a relevant image for your destination.\n
        If you edit your destination information, we will try our best to find a relevant image again.\n
        If you decide to edit your destination, please try to use a more widely-used name for destination name and/or location.\n
        And instead of staring at a boring error icon, please feel free to admire Rick Astley in the meantime.`);
    } finally {
        addToWishList(destinationInfo);
        changeWishlistTitle();
    }
}

// Prompts the user to enter new name, location, and photo of the wishlist item that they want to edit. 
// Uses original values if the user omits new values. Otherwise, sets newly provided values to the item
const editButtonHandler = async (e) => {
    listItemContainer = e.target.parentElement.parentElement;
    const destName = listItemContainer.querySelector('.list-item-name');
    const destLocation = listItemContainer.querySelector('.list-item-location');
    const destImage = listItemContainer.querySelector('.list-item-image');

    const newDestName = window.prompt('Enter new name');
    const newDestLocation = window.prompt('Enter new location');
    
    newDestName.length ? destName.innerText = newDestName : null;
    newDestLocation.length ? destLocation.innerText = newDestLocation : null;
    if (newDestName.length || newDestLocation.length) {
        let imageUrl;

        try {
            await fetch('/destinations', {
                method: 'put',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newDestName,
                    location: newDestLocation
                }),
            })
                .then(res => res.json())
                .then(({ url }) => {
                    imageUrl = url;
                })
        } catch(error) {
            console.error(error);
            // If the fetch fails, use default image url.
            imageUrl = defaultImageUrl; 
            // Display an alert for the user.
            alert(`We encountered an error trying to search for a relevant image for your destination.\n
            If you edit your destination information, we will try our best to find a relevant image again.\n
            If you decide to edit your destination, please try to use a more widely-used name for destination name and/or location.\n
            And instead of staring at a boring error icon, please feel free to admire Rick Astley in the meantime.`);
        } finally {
            destImage.setAttribute('src', imageUrl);
        }
    }
}

// Removes the target wishlist item when user clicks the remove button
const removeButtonHandler = (e) => {
    const listItemContainer = e.target.parentElement.parentElement;
    listItemContainer.remove();
}

/* 
Helper Functions
*/
const addToWishList = (userInputs) => {
    const { name, location, description, imageUrl } = userInputs;
    const wishlist = document.getElementById('wishlist-container');

    // Create container for each wichlist item
    const listItemContainer = document.createElement('div');
    listItemContainer.setAttribute('class', 'list-item-container');

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
}

// Updates wishlist title to become 'My Wishlist!' when user adds an item to the wishlist
const changeWishlistTitle = () => {
    wishlistTitle = document.getElementById('wishlist-title');
    wishlistTitle.innerText = 'My Wishlist'
}

// Creates an edit or remove button used for each item in the wishlist
const createEditOrRemoveButton = (buttonType) => {
    const buttonId = buttonType.toLowerCase() + '-btn';
    const button = document.createElement('button');
    button.innerText = buttonType;
    button.setAttribute('class', 'card-button');
    button.setAttribute('id', buttonId);
    buttonType === 'Edit'  
        ? button.addEventListener('click', editButtonHandler)
        : buttonType === 'Remove' 
            ? button.addEventListener('click', removeButtonHandler) 
            : null;
    return button;
}

init();
