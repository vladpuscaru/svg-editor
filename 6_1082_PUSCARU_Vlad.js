$(document).ready(function () {


  // Audio sources
  let audioItemClick = new Audio("./media/click.mp3");
  let audioEraserClick = new Audio("./media/erase.mp3");
  let audioSlide = new Audio("./media/slide.mp3");
  let audioBeep = new Audio("./media/beep.mp3");

  //#region UI events
  let activeItem = $(".item.active");

  $("#btn").click(function () {
    audioSlide.play();
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

  // Removes the elements created
  $("#clear").click(function () {
    audioEraserClick.play();
    elements.empty();
    $("#selected-properties .row").removeClass("active");
  });

  // Generates the code for the SVG
  $("#save").click(function () {
    audioBeep.play();
    $("#save-screen").removeClass("animated swipeRightLong");
    $("#save-screen").addClass("animated swipeLeftLong");

    $("#save-screen #close").addClass("active");

    // Copy svg
    let svg = $("#editor").html();
    svg = svg.split('id="selection--rectangle"')[0];
    svg = svg.slice(0, svg.length - 7).trim();
    $("#save-screen textarea").val(svg);
  })

  $("#save-screen #close").click(function () {
    audioSlide.play();
    $("#save-screen").removeClass("animated swipeLeftLong");
    $("#save-screen").addClass("animated swipeRightLong");

    $("#save-screen #close").removeClass("active");

  });

  // Toggle's the SHIFT flag
  // --> it enables to making of squares and circles
  // Also deletes selected SVG on DELETE KEY
  // Also ends the path with ENTER KEY
  $(document)
    .keydown(function (e) {
      if (e.which == KEY_SHIFT) {
        shiftPressed = true;
      } else if (e.which == KEY_DELETE) {
        $(".selected").remove();
      } else if (e.which == KEY_ENTER) {
        endPath(pathSVG);
      }
    })
    .keyup(function (e) {
      shiftPressed = false;
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

  $("#text-input").change(function () {
    if ($(".selected").prop("tagName") === "text") {
      $(".selected").html($(this).val());
    }
  });

  $("#selected-properties .row input").change(function () {
    let attr = $(this).attr("id");
    let val = $(this).val();
    updateSVGElement($(".selected"), attr, val);
  });

  $(".item").click(function () {
    audioItemClick.play();
    activeItem.removeClass("active");
    $(this).addClass("active");
    activeItem = $(this);

    selectionMode = false;
    pathSelected = false;
    $("#text-input").removeClass("active");

    $("#elements").children().removeClass("clickable");

    // modify selection for editor
    if ($(this).hasClass("item--select")) {
      selectionMode = true;
      $("#elements").children().addClass("clickable");
    } else if ($(this).hasClass("item--rectangle")) {
      selection = $("#selection--rectangle");
      newElementType = "rect";
    } else if ($(this).hasClass("item--ellipse")) {
      selection = $("#selection--ellipse");
      newElementType = "ellipse";
    } else if ($(this).hasClass("item--line")) {
      selection = $("#selection--line");
      newElementType = "line";
    } else if ($(this).hasClass("item--text")) {
      selection = $("#selection--text");
      newElementType = "text";
      $("#text-input").addClass("active");
    } else if ($(this).hasClass("item--poly")) {
      selection = $("#selection--path");
      newElementType = "path";
      pathSelected = true;
    }
  });
  //#endregion


  //#region SVG Editor
  let editor = $("#editor");
  let selection = $("#selection--rectangle");
  let elements = $("#elements");
  let newElementType = "rect";

  let selectionMode = false;
  let shiftPressed = false;
  let drag = false;
  let pathSelected = false;

  let pathSVG = null;

  const MOUSE_LEFT = 1;
  const KEY_DELETE = 46;
  const KEY_SHIFT = 16;
  const KEY_ENTER = 13;

  let mouseX1 = 0, mouseY1 = 0;
  let mouseX2 = 0, mouseY2 = 0;

  let dragOffSet = {};

  const namespaceURI = "http://www.w3.org/2000/svg";

  editor.contextmenu(() => false);

  // Sets the class for the selected SVG
  // which will be dragged
  const makeSVGElementDraggable = () => {
    $(".selected").addClass("draggable");
  }

  //#region Dragging
  // Functions to drag a SVG Element
  const startDragSVG = evt => {
    makeSVGElementDraggable()
    let el = $(".selected")[0];

    dragOffSet = getMousePositionSVG(evt);
    switch ($(".selected").prop("tagName")) {
      case "rect":
        dragOffSet.x -= parseFloat(el.getAttributeNS(null, "x"));
        dragOffSet.y -= parseFloat(el.getAttributeNS(null, "y"));
        break;
      case "ellipse":
        dragOffSet.x -= parseFloat(el.getAttributeNS(null, "cx"));
        dragOffSet.y -= parseFloat(el.getAttributeNS(null, "cy"));
        break;
      case "text":
        dragOffSet.x -= parseFloat(el.getAttributeNS(null, "x"));
        dragOffSet.y -= parseFloat(el.getAttributeNS(null, "y"));
        break;
      // case "line":
      //   dragOffSet.x -= parseFloat(el.getAttributeNS(null, "x1"));
      //   dragOffSet.y -= parseFloat(el.getAttributeNS(null, "y1"));
      //   break;
    }


    // Update the inputs
    updateUIProps($(el));
  }

  const dragSVG = evt => {
    if (drag) {
      evt.preventDefault();

      let coord = getMousePositionSVG(evt);

      let el = $(".selected")[0];

      switch ($(".selected").prop("tagName")) {
        case "rect":
          el.setAttributeNS(null, "x", coord.x - dragOffSet.x);
          el.setAttributeNS(null, "y", coord.y - dragOffSet.y);
          break;
        case "ellipse":
          el.setAttributeNS(null, "cx", coord.x - dragOffSet.x);
          el.setAttributeNS(null, "cy", coord.y - dragOffSet.y);
          break;
        case "text":
          el.setAttributeNS(null, "x", coord.x - dragOffSet.x);
          el.setAttributeNS(null, "y", coord.y - dragOffSet.y);
          break;
      }

    }
  }

  // Transforms the coordinates from screen
  // to SVG coordinates
  const getMousePositionSVG = evt => {
    let CTM = editor.get(0).getScreenCTM();
    return {
      x: (evt.clientX - CTM.e) / CTM.a,
      y: (evt.clientY - CTM.f) / CTM.d
    };
  }
  //#endregion


  //#region Making a Path
  // Defines the starting point for the path
  const startPath = svg => {
    let xStart = mouseX1;
    let yStart = mouseY1;
    $(svg).attr("d", "M" + xStart + " " + yStart);

    // make a circle at the starting point
    selection.attr("cx", xStart);
    selection.attr("cy", yStart);
    selection.show();
  }

  const makePathPoint = (svg, x, y, pathAction) => {
    let path = $(svg).attr("d");
    path += " " + pathAction + x + " " + y;
    $(svg).attr("d", path);
  }

  const endPath = svg => {
    let path = $(svg).attr("d");
    path += " " + "Z";
    $(svg).attr("d", path);

    pathSVG = null;
    pathSelected = false;
  }
  //#endregion


  // Updates the element based on the inputs
  const updateSVGElement = (el, attr, val) => {
    if (attr === "fill" && $(el).prop("tagName") === "line") {
      $(el).attr("stroke", val);
    } else {
      $(el).attr(attr, val);
    }
  };

  const createSVGElement = (x1, y1, x2, y2) => {
    let svg = document.createElementNS(namespaceURI, newElementType);
    if (newElementType === "path") {
      startPath(svg);
      pathSVG = svg;
      pathSelected = true;
    }
    setSVGElementAttributes($(svg), x1, y1, x2, y2);
    setSVGElementEvents($(svg));

    return svg;
  }

  const setSVGElementEvents = el => {
    el
      .mousedown(e => {
        if (e.which == MOUSE_LEFT && activeItem.hasClass("item--select")) {
          elements.children().attr("class", "");
          $(el).addClass("selected");
          updateUIProps(el);
          if ($(el).prop("tagName") !== "path") {
            drag = true;
            startDragSVG(e);
          }
        }
      })
      .mousemove(e => {
        if (drag && el.prop("tagName") !== "path") {
          dragSVG(e)
          updateUIProps(el);
        }
      })
      .mouseup(e => {
        drag = false;
      });
  }

  // Returns the proper inputs for the selected element
  // Based on the "data-for" attr on the HTML element
  const getSelectedInputs = el => {
    let inputs = [];
    let selected = el.prop("tagName");
    $("#selected-properties .row:not(.header)").each(function () {
      // Split the attribute into tokens
      let tokens = $(this).data("for").split(",");
      tokens.forEach(token => {
        if (token === selected) {
          inputs.push($(this));
        }
      });

      if (el.prop("tagName") == "text") {
        inputs.push($("#text-input"));
      }
    });
    return inputs;
  }

  // Sets the values for the inputs
  // based on what element was selected
  const setUIPropsValues = el => {
    let type = el.prop("tagName");
    switch (type) {
      case "rect":
        $("#width").val(el.attr("width"));
        $("#height").val(el.attr("height"));
        $("#x").val(el.attr("x"));
        $("#y").val(el.attr("y"));
        $("#fill").val(el.attr("fill"));
        break;
      case "ellipse":
        $("#cx").val(el.attr("cx"));
        $("#cy").val(el.attr("cy"));
        $("#rx").val(el.attr("rx"));
        $("#ry").val(el.attr("ry"));
        $("#fill").val(el.attr("fill"));
        break;
      case "line":
        $("#x1").val(el.attr("x1"));
        $("#y1").val(el.attr("y1"));
        $("#x2").val(el.attr("x2"));
        $("#y2").val(el.attr("y2"));
        $("#stroke-width").val(el.attr("stroke-width"));
        $("#fill").val(el.attr("stroke"));
        break;
      case "text":
        $("#x").val(el.attr("x"));
        $("#y").val(el.attr("y"));
        $("#fill").val(el.attr("fill"));
        let fontSize = el.css("font-size");
        fontSize = fontSize.slice(0, fontSize.length - 2);
        $("#font-size").val(fontSize);
        $("#text-input").val(el.html());
        break;
      case "path":
        $("#fill").val(el.attr("fill"));
        break;
    }
  }

  // Sets the active properties inputs
  // based on what element was selected
  const updateUIProps = el => {
    // Deactivate all
    $("#selected-properties .row").removeClass("active");
    // Get the proper inputs based on the element's type
    let inputs = getSelectedInputs(el);
    // Active the proper inputs
    inputs.forEach(input => {
      input.addClass("active");
      // Set the values
      setUIPropsValues(el);
    });
  }

  const setSVGElementAttributes = (el, x1, y1, x2, y2) => {
    switch (newElementType) {
      case "line":
        el.attr('x1', x1);
        el.attr('y1', y1);
        el.attr('x2', x2);
        el.attr('y2', y2);
        el.attr('stroke-width', 10);
        el.attr("stroke", "#37392E");
        break;
      case "rect":
        el.attr('x', Math.min(x1, x2));
        if (shiftPressed) {
          // SQUARE
          el.attr('width', Math.max(x1, x2) - Math.min(x1, x2));
          el.attr('height', el.attr('width'));
          el.attr('y', y1);
        } else {
          // RECTANGLE
          el.attr('width', Math.max(x1, x2) - Math.min(x1, x2));
          el.attr('height', Math.max(y1, y2) - Math.min(y1, y2));
          el.attr('y', Math.min(y1, y2));
        }
        el.attr("fill", "#37392E");
        break;
      case "ellipse":
        el.attr('cx', x1);
        el.attr('cy', y1);
        if (shiftPressed) {
          // CIRCLE
          el.attr('rx', Math.max(x1, x2) - Math.min(x1, x2));
          el.attr('ry', el.attr('rx'));
        } else {
          // ELLIPSE
          el.attr('rx', Math.max(x1, x2) - Math.min(x1, x2));
          el.attr('ry', Math.max(y1, y2) - Math.min(y1, y2));
        }
        el.attr("fill", "#37392E");
        break;
      case "text":
        el.attr('x', x2);
        el.attr('y', y2);
        el.attr("fill", "#37392E");
        let text = $("#text-input").val();
        el.html(text);
        let fontSize = $("#font-size").val();
        el.css("font-size", fontSize + "px");
        break;
      case "path":
        el.attr("fill", "#37392E");
        break;
    }
  }

  editor.mousedown(e => {
    mouseX1 = e.pageX - editor.offset().left;
    mouseY1 = e.pageY - editor.offset().top;
    // Reveals the preview SVG
    if (e.which == MOUSE_LEFT && !selectionMode) {
      setSVGElementAttributes(selection, mouseX1, mouseY1, mouseX1, mouseY1);
      selection.show();
    }


  });

  editor.mousemove(e => {
    // Updates the preview SVG
    mouseX2 = e.pageX - editor.offset().left;
    mouseY2 = e.pageY - editor.offset().top;
    setSVGElementAttributes(selection, mouseX1, mouseY1, mouseX2, mouseY2);
  });

  editor.mouseup(e => {
    // Creates the new SVG Element
    if (e.which == MOUSE_LEFT && !selectionMode && pathSVG == null) {
      mouseX2 = e.pageX - editor.offset().left;
      mouseY2 = e.pageY - editor.offset().top;

      selection.hide();

      let newElement = createSVGElement(mouseX1, mouseY1, mouseX2, mouseY2);
      $(newElement).appendTo(elements);
    } else if (pathSelected) {
      // Makes another point for the path
      makePathPoint(pathSVG, mouseX2, mouseY2, "L");
    }
  });
});
//#endregion