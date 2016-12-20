$(document).ready(function () {

  $('.followIcon').on('click', function (e) {
    const userToFollowID = this.id;
    $.ajax({
      type: 'POST',
      url: '/followUser',
      data: {
        userToFollowID: userToFollowID,
      },
      success: (response) => {
        location.reload();
      },
    });
  });

  $('.unfollowIcon').on('click', function (e) {
    const userToUnfollowID = this.id;
    $.ajax({
      type: 'POST',
      url: '/unfollowUser',
      data: {
        userToUnfollowID: userToUnfollowID,
      },
      success: (response) => {
        location.reload();
      },
    });
  });

});
