const userInputForm = document.querySelector('#form');

const init = () => {
  loadSavedDestinations();
  userInputForm.addEventListener('submit', formSubmitHandler);
};

const loadSavedDestinations = async () => {
  await fetch('/wishlist')
    .then((res) => (res.json()))
    .then((data) => {
      if (data.length) {
        for (let i = 0; i < data.length; i++) {
          addToWishList(data[i]);
        }
      }
    })
    .catch(() => {
      displayErrorMessage();
    });
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
  const listItemDescription = document.createElement('p');
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

  // Append the created image, user-provided information,
  // and edit/remove buttons to the list item container.
  listItemContainer.append(listItemImage);
  listItemContainer.append(listItemInfoContainer);
  listItemContainer.append(listItemButtonsContainer);

  // Finally, append the list item container to wishlist.
  wishlist.append(listItemContainer);
};

// Creates an edit or remove button used for each item in the wishlist
const createEditOrRemoveButton = (buttonType) => {
  const buttonId = `${buttonType.toLowerCase()}-btn`;
  const button = document.createElement('button');
  button.innerText = buttonType;
  button.setAttribute('class', 'card-button');
  button.setAttribute('id', buttonId);

  if (buttonType === 'Edit') {
    button.addEventListener('click', editButtonHandler);
  }
  if (buttonType === 'Remove') {
    button.addEventListener('click', removeButtonHandler);
  }

  return button;
};

// Handles the submission of user inputs when "Add To List" button is clicked
const formSubmitHandler = async (e) => {
  e.preventDefault();
  // Update the array below when changing input fields
  const expectedFields = ['name', 'location', 'description'];
  const destinationInfo = {};

  for (let i = 0; i < expectedFields.length; i++) {
    const currElementId = `#dest-${expectedFields[i]}`;
    const currElement = userInputForm.querySelector(currElementId);

    destinationInfo[expectedFields[i]] = currElement.value;
    currElement.value = '';
  }

  // Post destination information to the server and save the information in the database.
  // Then, receive an unique ID, image URL, and whether the image fetch was successful
  // (i.e., whether if the image is the default image or a relevant one from an external API).
  // If both the post request and database operation is successful,
  // display the destination card. Otherwise, display an error message to the user.
  await fetch('/destination', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(destinationInfo),
  })
    .then((res) => res.json())
    .then(({ id, url, isDefaultImage }) => {
      destinationInfo._id = id;
      destinationInfo.image = url;
      if (isDefaultImage) {
        displayErrorMessage('image');
      }
      addToWishList(destinationInfo);
      wishlistEmptyTitle(false);
    })
    .catch(() => {
      displayErrorMessage('server');
    });
};

// Prompts user to enter new name, location, and description of the item they want to edit.
// Uses original value if user omits new value.
const editButtonHandler = async (e) => {
  const listItemContainer = e.target.parentElement.parentElement;
  const destName = listItemContainer.querySelector('.list-item-name');
  const destLocation = listItemContainer.querySelector('.list-item-location');
  const destImage = listItemContainer.querySelector('.list-item-image');
  const destDescription = listItemContainer.querySelector('.list-item-description');
  let needNewImage = false;
  let updateDescription = false;

  const newDestination = {
    id: listItemContainer.getAttribute('id'),
    name: window.prompt('Enter new name (if left empty, we will use its current value)'),
    location: window.prompt('Enter new location (if left empty, we will use its current value)'),
    description: window.prompt('Enter new description (if left empty, we will use its current value)'),
  };

  if (newDestination.name.length && newDestination.name !== destName.innerText) {
    needNewImage = true;
  } else {
    newDestination.name = destName.innerText;
  }

  if (newDestination.location.length && newDestination.location !== destLocation.innerText) {
    needNewImage = true;
  } else {
    newDestination.location = destLocation.innerText;
  }

  if (!newDestination.description.length) {
    newDestination.description = destDescription.innerText;
  } else {
    updateDescription = true;
  }

  // Get new image URL if needed. Otherwise, simply update the description.
  if (needNewImage) {
    await fetch('/destination', {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDestination),
    })
      .then((res) => res.json())
      .then(({ url, isDefaultImage }) => {
        destName.innerText = newDestination.name;
        destLocation.innerText = newDestination.location;
        destDescription.innerText = newDestination.description;
        destImage.setAttribute('src', url);
        if (isDefaultImage) {
          displayErrorMessage('image');
        }
      })
      .catch(() => {
        displayErrorMessage('server');
      });
  } 
  if (!needNewImage && updateDescription) {
    await fetch('/description', {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newDestination.id,
        description: newDestination.description,
      }),
    })
      .then(() => {
        destDescription.innerText = newDestination.description;
      })
      .catch((err) => {
        throw err;
      });
  }
};

// Removes the target wishlist item when user clicks the remove button
const removeButtonHandler = async (e) => {
  const listItemContainer = e.target.parentElement.parentElement;
  const destId = listItemContainer.getAttribute('id');
  const totalDestNum = listItemContainer.parentElement.children.length; // The number of current total destinations

  await fetch('/destination', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: destId,
    }),
  })
    .then(() => {
      listItemContainer.remove();
      if (totalDestNum === 1) {
        wishlistEmptyTitle(true);
      }
    })
    .catch(() => {
      displayErrorMessage('server');
    });
};

// Updates wishlist title to be either 'My Wishlist!' or "Add Destination Details"
const wishlistEmptyTitle = (listIsEmpty) => {
  if (listIsEmpty) {
    const wishlistTitle = document.querySelector('#wishlist-title');
    wishlistTitle.innerText = 'Enter destination details';
  } else {
    const wishlistTitle = document.querySelector('#wishlist-title');
    wishlistTitle.innerText = 'My Wishlist';
  }
};

const displayErrorMessage = (errorType) => {
  if (errorType === 'server') {
    alert('We encountered an error while trying to connect to the server.\n'
              + 'Your destination card(s) may not have been saved.\n'
              + 'Please try again and we apologize for the inconvenience.');
  } else {
    alert('We encountered an error while searching for a relevant image for your destination.\n'
              + 'If you edit your destination information using a more widely-used name or location, '
              + 'we will try our best to find a relevant image again.\n');
  }
};

init();
