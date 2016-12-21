$(document).ready(function () {

  $('#profileForm #camerabutton')
      .on('click', function (e) {
        $('#profileForm #fileInput', $(e.target).parents()).click();
      });

  $('#profileForm #fileInput').on('change', function (input) {
    var $preview = $('#profileForm #imagePreview');
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $('#profileForm #imagePreview').attr('src', e.target.result);
        $('#imageSegment').attr('style', 'display: block');
      };

      reader.readAsDataURL(this.files[0]);
    } else {
      $('#profileForm #imagePreview').removeAttr('src');
      $('#imageSegment').attr('style', 'display: none');
    }
  });

  $('#profileForm #imagePreview')
      .on('click', function (e) {
        var $control = $('#profileForm #fileInput');
        control.replaceWith($control.val('').clone(true));
        $('#profileForm #imagePreview').removeAttr('src');
        $('#imageSegment').attr('style', 'display: none');
      });

  $('#profileForm').on('submit', function () {
    $('#profileForm').addClass('loading disabled');
  });
});
