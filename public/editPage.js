//onload, do an asynchronous check to load the choreo
//have a spinning gif until the choreo loads
var performers = [];
/*array of performers: each has

*/
var groups = [];
var formations = [];
var fileLink = "";
var edited = false;
var currentFormation = 0;
var selected = [];
var dragging = 0;

function startUp(){
  //tagHere delete the following line, which overrides the groups array
  performers = [{perfName: "John", groupN: 0, positions:[{xCoord: "341px", yCoord: "50px"}]},
    {perfName: "Dave", groupN: 1, positions:[{xCoord: "72px", yCoord: "50px"}]},
    {perfName: "Glorya", groupN: 2, positions:[{xCoord: "374px", yCoord: "50px"}]}];
  formations = [{formName: "Formation 1", timecode: 0, moveLength: 0}];
  groups = [{groupName: "Johnathan's stuff", groupColor: "#4682e2"}, {groupName: "Haha yeah", groupColor:"#bf42f4"}, {groupName: "Hell yeah", groupColor:"#34e22b"}];

  $("#loader").hide();
  $("#canvas").css("display","inline-block");
  $("#formFormName").val("Formation " + (formations.length+1));

  //iterate through the groups array to build the groups list on the left sidebar
  //also build the groupDropDown options
  for(var i = 0; i<groups.length; i++){
    renderGroupElement(groups[i].groupName, groups[i].groupColor, i);
  }
  //iterate through the formations array to build the formation list on the right sidebar
  for(var i = 0; i<formations.length; i++){
    renderFormationElement(formations[i].formName, formations[i].timecode, formations[i].moveLength, i);
  }
  //iterate through the performers array to build the circles and performers list in left sidebar
  for(var i = 0; i<performers.length; i++){
    renderPerformer(performers[i].perfName, performers[i].groupN, i);
  }
}

//tagHere: unfinished; add edits for name and group
//for fancies, on "hover", highlight the performer dot on the screen too
function renderPerformer(perfName, groupN, perfIndex){
  //tagHere: make the performer dots
  //make sure each one has a unique id based on their index in performers array
  var perfDotElement = "<div class='circle perfDot' id='perfDot" + perfIndex + "'>"
    + "<div class='perfLabel'>" + perfName + "</div></div>";
  $(perfDotElement).appendTo("#canvas");

  var pageDotElement = $("#perfDot" + perfIndex);
  pageDotElement.css({"background-color":groups[groupN].groupColor,
    "left":performers[perfIndex].positions[currentFormation].xCoord,
    "top":performers[perfIndex].positions[currentFormation].yCoord});
  pageDotElement.on("click", function(){event.stopPropagation()});
  pageDotElement.on("mousedown", function(){
    event.stopPropagation();
    dotOnmousedown($(this));
  });

  //while we're at it, let's also generate the li's on the performers sidebar
  var perfListElement = "<div class='divInsert listElement' id='perfList" + perfIndex + "'>"
    + "<div class='colorSample circle' style='background-color: " + groups[groupN].groupColor
    + "'></div>  <b>" + perfName + "</b></div>";
  $(perfListElement).appendTo("#performerList");
}

function dotOnmousedown(pageObj){
  var myIndex = parseInt(pageObj.attr("id").substring(7));
  if(pageObj.hasClass("dotSelected")){
    //console.log("clicked... what next?");
    pageObj.on("mouseup", function(){
      //console.log("unselected");
      pageObj.removeClass("dotSelected");
      //console.log(dragging);
      selected.splice(selected.indexOf(myIndex), 1);
      pageObj.off("mouseup").off("mousemove");
    });
    pageObj.on("mousemove", function(){
      //console.log("dragging");
      if(dragging==0){
        //console.log("start drag");
        //this triggers the check for mousemoves on the window.ready function
        dragging = myIndex+1;
        pageObj.off("mouseup");
        pageObj.on("mouseup", function(){
          //console.log("finish drag");
          //save all the selected objects' left and top
          for(var i = 0; i<selected.length; i++){
            performers[selected[i]].positions[currentFormation].yCoord = $("#perfDot" + selected[i]).css("top");
            performers[selected[i]].positions[currentFormation].xCoord = $("#perfDot" + selected[i]).css("left");
          }
          dragging = 0;
          pageObj.off("mouseup").off("mousemove");
        });
      }
    });
  }else{
    //console.log("clicked and now selected");
    pageObj.addClass("dotSelected");
    selected.push(myIndex);
  }
}

//tagHere: unfinished; add editing for color chip
function renderGroupElement(groupName, groupColor, groupIndex){
  var groupElement = "<div class='divInsert listElement' id='groupList" + groupIndex + "'>" +
    "<div class='colorSample' style='background-color: " + groupColor
    + "'></div>  <div class='editHover'><b>" + groupName + "</b></div></div>";
  $(groupElement).appendTo("#groupList");

  var groupOption = "<option value='" + $("#groupDropDown option").length + "'>" + groupName + "</option>";
  $(groupOption).appendTo("#groupDropDown");

  //tagHere change the .on() if the one below is changed
  //tagHere doesn't work with johnathan's stuff: breaks on the apostrophe
  $("#groupList" + groupIndex).find("b").on("click", function(){
    var inputVal = $(this).html();
    $("<input class='noMargin' type='text' placeholder='Name'>").appendTo($(this).parent().parent());
    $(this).parent().parent().find(':text').val(inputVal);
    $("<a class='plainlink' onclick='saveListName($(this), 1, parseInt($(this).parent().parent().find(&quot;a&quot;).parent().attr(&quot;id&quot;).substring(9)))'>Save&nbsp;name</a>").appendTo($(this).parent().parent());
    $(this).remove();
  });

  //tagHere: attach .on("click", function(){}) to the color swatch, the <b> name,
  //onclick, create a "save" link in the listElement and swap the text for a text input
  //or the color swatch for a color input
}

//tagHere: unfinished; add editing for name, timecode, moveLength
function renderFormationElement(formName, timecode, moveLength, formationIndex){
  var formationElement = "<div class='divInsert listElement' id='formList" + formationIndex + "'>"
    + "<div class='editHover'><b>" + formName + "</b><br><span>" + secToTimecode(timecode)
    + "</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>" + moveLength + " sec</span></div></div>";
  if(formationIndex==0){
    $(formationElement).prependTo("#formList");
  }else{
    $(formationElement).insertAfter("#formList" + (formationIndex-1));
  }

  /*
  //tagHere change the .on() if the one below is changed
  //tagHere doesn't work with johnathan's stuff: breaks on the apostrophe
  $("#groupList" + groupIndex).find("b").on("click", function(){
    var inputVal = $(this).html();
    $("<input class='noMargin' type='text' placeholder='Name'>").appendTo($(this).parent().parent());
    $(this).parent().parent().find(':text').val(inputVal);
    $("<a class='plainlink' onclick='saveListName($(this), 1, parseInt($(this).parent().parent().find(&quot;a&quot;).parent().attr(&quot;id&quot;).substring(9)))'>Save&nbsp;name</a>").appendTo($(this).parent().parent());
    $(this).remove();
  });*/
}

function saveListName(listObject, objectType, objectIndex){
  console.log(objectIndex);
  var newValue = listObject.parent().find(":text").val();

  if(objectType==1){
    //it's a group
    groups[objectIndex].groupName = newValue;
    //also change the option name
    $("#groupDropDown option[value=" + objectIndex + "]").html(newValue);
  }else if(objectType==2){
    //it's a performer
    performers[objectIndex].perfName = newValue;
  }
  //tagHere change the .on() if the one above is changed
  $("<b>" + newValue + "</b>").appendTo(listObject.parent().find('.editHover')).on("click", function(){
    var inputVal = $(this).html();
    $("<input class='noMargin' type='text' placeholder='Name'>").appendTo($(this).parent().parent());
    $(this).parent().parent().find(':text').val(inputVal);
    $("<a class='plainlink' onclick='saveListName($(this), 1, parseInt($(this).parent().parent().find(&quot;a&quot;).parent().attr(&quot;id&quot;).substring(9)))'>Save&nbsp;name</a>").appendTo($(this).parent().parent());
    $(this).remove();
  });
  listObject.parent().find(":text").remove();
  listObject.remove();
}

function makeNewPerformer(){
  $("#perfErr").css("display", "none");
  if($("#formPerfName").val()){
    var perfName = $("#formPerfName").val();
    var groupN = $("#groupDropDown").val();
    $("#formGroupName").val("");

    var positionsArray = [];
    var randomXCoord = Math.floor(400*Math.random()) + "px";

    //tagHere change the 400
    //automatically fill the performer's positions array with filler values
    for(var n = 0; n<formations.length; n++){
      positionsArray.push({xCoord:randomXCoord, yCoord: "50px"});
      //tagHere change the 200 value
    }

    //add a new person to the performers array
    performers.push({perfName: perfName, groupN: groupN, positions: positionsArray});
    edited = true;

    //add a new li to the performers list, and a new performer dot
    renderPerformer(perfName, groupN, performers.length-1);
  }else{
    //no performer name throw error
    $("#perfErr").html("Please enter a name for this performer.").css("display", "block");
  }
}

function makeNewGroup(){
  $("#groupErr").css("display", "none");
  var groupColor = $("#groupColor").val()
  for(var n = 0; n<groups.length; n++){
    if(groupColor==groups[n].groupColor){
      $("#groupErr").html("Please choose a unique color for this group.").css("display", "block");
      return;
    }
  }
  if($("#formGroupName").val()){
    var groupName = $("#formGroupName").val();
    $("#formGroupName").val("");

    renderGroupElement(groupName, groupColor, groups.length);

    groups.push({groupName: groupName, groupColor: groupColor});
    edited = true;
  }else{
    //no group name throw error
    $("#groupErr").html("Please enter a name for this group.").css("display", "block");
  }
}

function makeNewFormation(){
  $("#formationErr").css("display", "none");

  if($("#formFormName").val()&&$("#formTimecode").val()&&$("#formMoveLength").val()){
    var formName = $("#formFormName").val();
    var timecode = $("#formTimecode").val();
    var moveLength = Math.round(parseFloat($("#formMoveLength").val())*10)/10;

    //convert timecode to seconds
    if(timecode.indexOf(":")==-1){
      //there are no minutes
      timecode = Math.round(parseFloat(timecode)*10)/10;
      if(timecode<0){
        $("#formationErr").html("Invalid timecode: timecode must be ≥0.").css("display", "block");
        return;
      }else if(timecode>=60){
        $("#formationErr").html('For timecodes longer than one minute, please use the format "(minutes):(seconds)."').css("display", "block");
        return;
      }
    }else{
      var tMinutes = parseInt(timecode.substring(0, timecode.indexOf(":")));
      var tSeconds = parseFloat(timecode.substring(timecode.indexOf(":")+1));
      if(tSeconds>=60||tSeconds<0){
        //invalid timecode: greater than or equal to 60 seconds for the seconds section
        $("#formationErr").html("Invalid timecode: seconds must be <60 and ≥0.").css("display", "block");
        return;
      }else if(tMinutes<0){
        $("#formationErr").html("Invalid timecode: timecode must be ≥0.").css("display", "block");
        return;
      }
      timecode = Math.round(((tMinutes*60) + tSeconds)*10)/10;
    }
    if(isNaN(timecode)){
      $("#formationErr").html('Please enter a number value for timecodes.').css("display", "block");
      return;
    }

    //find where in the formations array it fits
    var arrayPlace = formations.length-1;
    while(arrayPlace>0&&timecode<formations[arrayPlace].timecode){
      arrayPlace--;
    }
    //arrayPlace stops on an index where the thing has a lower timecode than the one you're adding
    //so you want to be one above that for the splice
    arrayPlace++;

    if((timecode-moveLength)<formations[arrayPlace-1].timecode){
      //we have an error! you're overlapping the move periods of this step with the step before
      $("#formationErr").html("Uh oh! Your new formation's move length overlaps the timecode of the formation before it.").css("display", "block");
      return;
    }
    if(arrayPlace!=formations.length){
      if(timecode>(formations[arrayPlace].timecode-formations[arrayPlace].moveLength)){
        //we have an error! you're overlapping the move periods of this step with the step after
        $("#formationErr").html("Uh oh! Your new formation's timecode overlaps the moving period of the formation after it.").css("display", "block");
        return;
      }
    }

    //tagHere checking the things

    renderFormationElement(formName, timecode, moveLength, arrayPlace);

    formations.splice(arrayPlace, 0, {formName: formName, timecode: timecode, moveLength: moveLength});
    //copy a new position into each performer's positions array
    for(var perf of performers){
      perf.positions.splice(arrayPlace, 0, perf.positions[arrayPlace-1]);
    }
    //increment the ids of all the formation dom objects on the page
    while(arrayPlace<formations.length-1){
      $("#formList" + arrayPlace).attr("id", "formList" + arrayPlace+1);
      arrayPlace++;
    }

    //clear form inputs
    $("#formFormName").val("Formation " + (formations.length+1));
    $("#formTimecode").val("");
    $("#formMoveLength").val("");
    edited = true;
  }else{
    if(!$("#formFormName").val()){
      //no form name throw error
      $("#formationErr").html('Please enter a name for this formation (even "Formation 1" is fine).').css("display", "block");
    }else if(!$("#formTimecode").val()){
      //no timecode throw error
      $("#formationErr").html("Please enter a timecode for this formation.").css("display", "block");
    }else{
      //no moveLength throw error
      $("#formationErr").html("Please enter the length of time to move into this formation.").css("display", "block");
      //tagHere change these messages
    }
  }
  edited = true;
}

function editPerformer(){
  //tagHere
  //make sure to update the li with the new group color and the new class name,
  //and delete the old class name
  edited = true;
}

function editGroup(){
  //tagHere
  edited = true;
}

function editFormation(){
  //tagHere
  edited = true;
}

function deletePerformer(){
  //iterate through perfDot elements, if their index>deleted index, decrement their index
  //also simultaneously iterate through the perfList elements
  //tagHere
  edited = true;

  //$(id).remove() the entry on the performers sidebar
}

function deleteGroup(){
  //iterate through performers array, check if groupN==deleted index, set to undetermined group
  //if groupN>deleted index, groupN--;

  //tagHere
  edited = true;

  //$(id).remove() the entry on the groups sidebar
}

function deleteFormation(){
  //iterate through performers array, somehow delete that position object in each of their positions[] arrays
  //tagHere
  edited = true;

  //$(id).remove() the entry on the formations sidebar
}



$(document).ready(function(){
  $(".errorDiv").css("display","none");
  $("#canvas").on("click", function(){
    $(this).find(".dotSelected").removeClass("dotSelected").off("mouseup").off("mousemove");
    selected = [];
    console.log("clearing selected");
  }).on("mousemove", function(){
    //console.log(event.pageX + " " + event.pageY);
    if(dragging>0){
      var elementIndex = dragging-1;
      //tagHere change the 11 and 22 if the perfDot width changes
      //it's outerWidth: so if the perfDot has a width of 18, add 2*2 to that for a border of 2
      var moveX = event.pageX - $("#canvas").position().left - 11 - (22*elementIndex);// - parseInt(performers[dragging].positions[currentFormation].xCoord);
      var moveY = event.pageY - $("#canvas").position().top - 11;// - parseInt(performers[dragging].positions[currentFormation].yCoord);
      //console.log(moveX + " " + moveY);
      for(var i = 0; i<selected.length; i++){
        var yDiff = parseInt(performers[selected[i]].positions[currentFormation].yCoord) - parseInt(performers[elementIndex].positions[currentFormation].yCoord);
        var xDiff = parseInt(performers[selected[i]].positions[currentFormation].xCoord) - parseInt(performers[elementIndex].positions[currentFormation].xCoord);
        $("#perfDot" + selected[i]).css({"left": moveX + xDiff, "top": moveY + yDiff});
      }
      //$("#perfDot" + elementIndex).css({"left": moveX, "top": moveY});
    }
  });
  //tagHere delete comment
  //autoSave() //this starts the autoSave() self-calls every two minutes

  //tagHere reenable eventually
  /*window.onbeforeunload = function(){
    if(edited){
      return confirm("You have unsaved changes. Are you sure you want to leave this tab?");
    }
  */
});

function draggedElements(){

}

function autoSave(){
  setTimeout(function(){
    if(edited){
      saveChoreo();
      edited = false;
      console.log("saving this choreo");
    }
    autoSave(); //ooh, recursion!
  }, 120000); //that's two minutes
}

function updateFileLink(newFileLink){
  //tagHere
  fileLink = newFileLink;
  edited = true;
  $("#testAudio").prop("src", "http://docs.google.com/uc?export=open&id=" + newFileLink);
}

function secToTimecode(timecode){
  if((timecode%60)<10){
    return Math.floor(timecode/60) + ":0" + (timecode%60);
  }
  return Math.floor(timecode/60) + ":" + (timecode%60);
}
