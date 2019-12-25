$(document).ready(function () {

  let activeItem = $(".item.active");

  // Audio sources
  let audioItemClick = new Audio("./media/click.mp3");

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
    audioItemClick.play();
    activeItem.removeClass("active");
    $(this).addClass("active");
    activeItem = $(this);

    // modify selection for editor
    if ($(this).hasClass("item--select")) {
      selectionMode = true;
    } else if ($(this).hasClass("item--rectangle")) {
      selection = $("#selection--rectangle");
      selectionName = "rect";
      selectionMode = false;
    } else if ($(this).hasClass("item--ellipse")) {
      selection = $("#selection--ellipse");
      selectionName = "ellipse";
      selectionMode = false;
    } else if ($(this).hasClass("item--line")) {
      selection = $("#selection--line");
      selectionName = "line";
      selectionMode = false;
    }
  });











  /**
   * SVG Editor
   */

  const updateUIAttributes = el => {
    $("#width").val(el.attr('width'));
    $("#height").val(el.attr('height'));
    $("#x").val(el.attr('x'));
    $("#y").val(el.attr('y'));
  }

  const setAttributes = (el, x1, y1, x2, y2) => {
    el.attr('x', Math.min(x1, x2));
    el.attr('y', Math.min(y1, y2));
    el.attr('width', Math.max(x1, x2) - Math.min(x1, x2));
    el.attr('height', Math.max(y1, y2) - Math.min(y1, y2));
  }

  let selectionMode = false;

  let editor = $("#editor");
  let selection = $("#selection--rectangle");
  let elements = $("#elements");
  let selectionName = "rect";

  const MOUSE_LEFT = 1,
    MOUSE_RIGHT = 3,
    KEY_DELETE = 46;

  let mouseX1 = 0, mouseY1 = 0;
  let mouseX2 = 0, mouseY2 = 0;

  editor.mousedown(e => {
    if (e.which == MOUSE_LEFT && !selectionMode) {
      mouseX1 = e.pageX - editor.offset().left;
      mouseY1 = e.pageY - editor.offset().top;
      // console.log(editorX + ", " + editorY);
      setAttributes(selection, mouseX1, mouseY1, mouseX1, mouseY1);
      selection.show();
    }
  });

  editor.mouseup(e => {
    if (e.which == MOUSE_LEFT && !selectionMode) {
      mouseX2 = e.pageX - editor.offset().left;
      mouseY2 = e.pageY - editor.offset().top;

      selection.hide();

      let newElement = document.createElementNS("http://www.w3.org/2000/svg", selectionName);
      setAttributes($(newElement), mouseX1, mouseY1, mouseX2, mouseY2);
      $(newElement).mousedown(e => {
        if (e.which == MOUSE_LEFT && activeItem.hasClass("item--select")) {
          elements.children().attr("class", "");
          $(newElement).addClass("selected");
          updateUIAttributes($(newElement));
        }
      });
      $(newElement).appendTo(elements);
    }
  });

  editor.mousemove(e => {
    mouseX2 = e.pageX - editor.offset().left;
    mouseY2 = e.pageY - editor.offset().top;

    setAttributes(selection, mouseX1, mouseY1, mouseX2, mouseY2);
  });

  editor.contextmenu(() => false);

});