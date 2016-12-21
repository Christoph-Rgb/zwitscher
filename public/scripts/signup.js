$(document).ready(function () {

  $('#signupForm #camerabutton')
      .on('click', function (e) {
        $('#signupForm #fileInput', $(e.target).parents()).click();
      });

  $('#signupForm #fileInput').on('change', function (input) {
    var $preview = $('#signupForm #imagePreview');
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $('#signupForm #imagePreview').attr('src', e.target.result);
        $('#imageSegment').attr('style', 'display: block');
      };

      reader.readAsDataURL(this.files[0]);
    } else {
      $('#signupForm #imagePreview').removeAttr('src');
      $('#imageSegment').attr('style', 'display: none');
    }
  });

  $('#signupForm #imagePreview')
      .on('click', function (e) {
        var $control = $('#signupForm #fileInput');
        control.replaceWith($control.val('').clone(true));
        $('#signupForm #imagePreview').removeAttr('src');
        $('#imageSegment').attr('style', 'display: none');
      });

  $('#signupForm').on('submit', function () {
    $('#signupForm').addClass('loading disabled');
  });
});
