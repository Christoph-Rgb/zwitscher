$(document).ready(function () {

  //array to store ids of items to delete
  var itemsToDelete = [];

  //add changed event handler to all deleteCheckboxes
  $('.deleteCheckbox').change(function () {

    if (this.checked) {
      //add item
      itemsToDelete.push(this.id);
    } else {//remove item
      const indexOfTweet = itemsToDelete.indexOf(this.id);
      if (indexOfTweet > -1) {
        itemsToDelete.splice(indexOfTweet, 1);
      }
    }
  });

  $('#deleteSelectedButton').on('click', function (e) {

    //hide deletion menu and stay on screen if nothing was checked
    if (itemsToDelete.length === 0) {
      hideMultipleDelete();
      return;
    }

    //get the path to send the post to
    var path;
    if (this.baseURI.includes('globalTimeline') || this.baseURI.includes('home')) {
      path = '/globalTimeline/deleteTweets';
    } else if (this.baseURI.includes('userTimeline')) {
      path = '/userTimeline/deleteTweets';
    } else if (this.baseURI.includes('users')) {
      path = '/users/deleteUsers';
    } else {
      return;
    }

    //create form for submission
    var submitForm = document.createElement('form');
    submitForm.setAttribute('method', 'POST');
    submitForm.setAttribute('action', path);

    //create input to hold the IDs of the tweets to delete
    var itemsToDeleteInput = document.createElement('input'); //input element, text
    itemsToDeleteInput.setAttribute('type', 'text');
    itemsToDeleteInput.setAttribute('name', 'itemsToDelete');
    itemsToDeleteInput.setAttribute('value', JSON.stringify(itemsToDelete));

    submitForm.appendChild(itemsToDeleteInput);

    submitForm.submit();
  });

  $('#showSelectItemsToDeleteButton').on('click', function (e) {
    showMultipleDelete();
  });

  $('#deleteSelectedCancelButton').on('click', function (e) {
    hideMultipleDelete();
  });
});

function hideMultipleDelete() {
  //switch displayed cards
  $('#userButtonsCard').attr('style', 'display: block');
  $('#deleteButtonsCard').attr('style', 'display: none');

  //display toggle button on tweets
  $('.deleteSelector').attr('style', 'display: none');
}

function showMultipleDelete() {
  //switch displayed cards
  $('#userButtonsCard').attr('style', 'display: none');
  $('#deleteButtonsCard').attr('style', 'display: block');

  //display toggle button on tweets
  $('.deleteSelector').attr('style', 'display: block');
}
