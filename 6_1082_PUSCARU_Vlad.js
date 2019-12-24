$(document).ready(function () {

  let activeItem = $(".item.active");

  // UI events
  $("#btn").click(function () {
    if ($(this).hasClass('rotated')) {
      setTimeout(function () {
        $("#info").removeClass('animated--fast fadeOut');
        $("#copy").removeClass('animated--fast fadeOut');
        $("#toolbar").removeClass('animated--fast fadeOut');
        $("#selected-properties").removeClass('animated--fast fadeOut');
        $("#info").addClass('animated fadeIn active');
        $("#copy").addClass('animated fadeIn active');
        $("#toolbar").addClass('animated fadeIn active');
        $("#selected-properties").addClass('animated fadeIn active');
      }, 500);
    } else {
      setTimeout(function () {
        $("#info").removeClass('active');
        $("#copy").removeClass('active');
        $("#toolbar").removeClass('active');
        $("#selected-properties").removeClass('active');
      }, 500);
      $("#info").removeClass('animated fadeIn');
      $("#copy").removeClass('animated fadeIn');
      $("#toolbar").removeClass('animated fadeIn');
      $("#selected-properties").removeClass('animated fadeIn');
      $("#info").addClass('animated--fast fadeOut');
      $("#copy").addClass('animated--fast fadeOut');
      $("#toolbar").addClass('animated--fast fadeOut');
      $("#selected-properties").addClass('animated--fast fadeOut');
    }

    $(this).toggleClass('rotated');
    $("#sidebar").toggleClass('swipeRight');
    $("#sidebar").toggleClass('swipeLeft');


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
  );

  $(".item").click(function () {
    activeItem.removeClass("active");
    $(this).addClass("active");
    activeItem = $(this);
  });

});