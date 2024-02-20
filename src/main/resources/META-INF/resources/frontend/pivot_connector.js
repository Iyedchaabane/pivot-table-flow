//import $ from "jquery";
//import "pivottable/dist/pivot.min.js";

window.drawPivotUI = function(id, dataJson, optionsJson, renderer, aggregator,CustomAggregators, column, disabled, noui) {
  let dj = $.parseJSON(dataJson);
  let oj = $.parseJSON(optionsJson);
  if (CustomAggregators){
    oj.aggregators = getCustomAggregators(CustomAggregators)
  }
  $("#"+id).pivotUI(dj, oj);
  setupPivotPopupDragging();
  if (disabled) {
    disableFields(id);
  }
  if (renderer) {
    $("#"+id).find(".pvtRenderer").val(renderer);
  }
  if (!CustomAggregators){
    setAggregator(id, aggregator, column);
  }
  if (noui) {
    disableUI(id);
  }
}

window.drawChartPivotUI = function(id, dataJson, cols, rows, disabledRenderers, renderer, aggregator, customAggregators, column, disabled, noui) {
  var renderers = $.extend(
     $.pivotUtilities.renderers,
     $.pivotUtilities.c3_renderers,
     $.pivotUtilities.export_renderers
  )
  let dj = $.parseJSON(dataJson);
  const cs = cols.split(",");
  const rs = rows.split(",");
  const agg = getCustomAggregators(customAggregators);
  if (Object.keys(agg).length === 0) {
    $("#"+id).pivotUI(dj, { cols: cs, rows: rs, renderers: renderers}, true);
  } else {
    $("#"+id).pivotUI(dj, { cols: cs, rows: rs, renderers: renderers, aggregators: agg }, true);
  }
  setupPivotPopupDragging(id);
  if (renderer) {
    $("#"+id).find(".pvtRenderer").val(renderer);
  }
  setAggregator(id, aggregator, column);
  if (disabled) {
    disableFields(id);
  }
  if (disabledRenderers) {
    disableRenderers(id, disabledRenderers);
  }
  if (noui) {
    disableUI(id);
  }
}

function disableUI(id) {
  $("#"+id).find(".pvtUiCell").css("display","none");
}

function setAggregator(id, aggregator, column) {
 if (aggregator) {
    $("#"+id).find(".pvtAggregator").val(aggregator);
    if (column) {
      setTimeout(() => {
        $("#"+id).find(".pvtAttrDropdown").val(column);
        $("#"+id).find(".pvtAttrDropdown").trigger("change");
        }, 100);
	}
  }
}

function disableRenderers(id, disabledRenderers) {
	const disabled = disabledRenderers.split(",");
    for (let i=0;i<disabled.length;i++) {
		$("#"+id).find(".pvtRenderer").find("[value='"+disabled[i]+"']").css("display","none");
    }
}

function disableFields(id) {
	$("#"+id).find(".pvtUnused").css("display","none");
    const elements = $("#"+id).find(".ui-sortable-handle");
    for (let i=0;i<elements.length;i++) {
		elements[i].style.pointerEvents = "none";
		elements[i].getElementsByClassName("pvtTriangle")[0].style.display = "none";
	}
}

function setupPivotPopupDragging(id) {
    const elements = $("#"+id).find(".pvtFilterBox");
    for (let i=0;i<elements.length;i++) {
		dragPivotPopup(elements[i]);
	}
}

function dragPivotPopup(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const element = elmnt.getElementsByTagName("h4")[0];
  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function getCustomAggregators(customAggregatorsList) {
  var tpl = $.pivotUtilities.aggregatorTemplates;
  var customAggregators = {};
  var Objects = customAggregatorsList ? customAggregatorsList.substring(2, customAggregatorsList.length - 2).split("), (") : null;
  if (Objects) {
    Objects.forEach(function (object) {
      var Values = object.split(',');
      if (Values.length === 3) {
        var funcName = Values[0].trim();
        var label = Values[1].trim();
        var column = Values[2].trim();
        if (tpl[funcName]) {
          customAggregators[label] = createAggregatorFunction(tpl[funcName], column);
        } else {
          console.error("Function not supported:", funcName);
        }
      } else {
        console.error("Invalid object structure:", object);
      }
    });
  } else {
    return customAggregators ;
  }

  return customAggregators;
}

function createAggregatorFunction(aggregatorTemplate, column) {
  if (typeof aggregatorTemplate === "function") {
    return () => aggregatorTemplate()([column]);
  } else if (typeof aggregatorTemplate === "object" && typeof aggregatorTemplate.call === "function") {
    return () => aggregatorTemplate.call(null, [])([column]);
  } else {
    console.error("Invalid aggregator function:", aggregatorTemplate);
  }
}