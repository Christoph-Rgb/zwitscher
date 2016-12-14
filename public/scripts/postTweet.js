$(document).ready(function () {

  $('#tweetForm #camerabutton')
      .on('click', function (e) {
        $('#tweetForm #fileInput', $(e.target).parents()).click();
      });

  $('#tweetForm #fileInput').on('change', function (input) {
    var $preview = $('#tweetForm #imagePreview');
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $('#tweetForm #imagePreview').attr('src', e.target.result);
        $('#imageSegment').attr('style', 'display: block');
      };

      reader.readAsDataURL(this.files[0]);
    } else {
      $('#tweetForm #imagePreview').removeAttr('src');
      $('#imageSegment').attr('style', 'display: none');
    }
  });

  $('#tweetForm #imagePreview')
      .on('click', function (e) {
        var $control = $('#tweetForm #fileInput');
        control.replaceWith($control.val('').clone(true));
        $('#tweetForm #imagePreview').removeAttr('src');
        $('#imageSegment').attr('style', 'display: none');
      });

  $('#tweetForm').on('submit', function () {
    $('#tweetForm').addClass('loading disabled');
  });
});
