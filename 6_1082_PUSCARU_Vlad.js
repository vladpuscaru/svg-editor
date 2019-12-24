$(document).ready(function () {

  // UI events
  $("#btn").click(function () {
    $(this).toggleClass('rotated');
    $("#sidebar").toggleClass('swipeRight');
    $("#sidebar").toggleClass('swipeLeft');
    $("#info").toggleClass('fadeIn');
    $("#info").toggleClass('fadeOut');
    $("#copy").toggleClass('fadeIn');
    $("#copy").toggleClass('fadeOut');
    $(".container").toggleClass('no-sidebar');
  });

  $("#floating-btns>div").hover(
    function () {
      let info = $(this).attr('info');
      $("#floating-btns__info").html(info);
      $("#floating-btns__info").addClass('active');
    }, function () {
      $("#floating-btns__info").removeClass('active');
    }
  )

});