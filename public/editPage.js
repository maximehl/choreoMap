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
var shiftKeyPressed = false;
var songPlaying = false;
var audioElement;

function startUp(){
  //tagHere comment out the following lines, which override the arrays with testing data
  performers = [{perfName: "John", groupN: 0, positions:[{xCoord: "253px", yCoord: "44px"}, {xCoord: "258px", yCoord: "73px"}, {xCoord: "256px", yCoord: "101px"}]},
    {perfName: "Dave", groupN: 1, positions:[{xCoord: "72px", yCoord: "50px"}, {xCoord: "69px", yCoord: "123px"}, {xCoord: "134px", yCoord: "70px"}]},
    {perfName: "Glorya", groupN: 2, positions:[{xCoord: "374px", yCoord: "50px"}, {xCoord: "371px", yCoord: "123px"}, {xCoord: "319px", yCoord: "71px"}]}];
  formations = [{formName: "Formation 1", timecode: 0, moveLength: 0}, {formName: "Formation 2", timecode: 6, moveLength: 1}, {formName: "Formation 3", timecode: 7, moveLength: 0.5}];
  groups = [{groupName: "Jonathan's group", groupColor: "#4682e2"}, {groupName: "Cool group", groupColor:"#bf42f4"}, {groupName: "Awesome group", groupColor:"#34e22b"}];

  audioElement.oncanplay = function(){
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
    audioElement.oncanplay = "";
  }
  
}

//tagHere: unfinished; add edits for name and group
//for fancies, on "hover", highlight the performer dot on the screen too
//when adding edits, make sure to add "stop event propagation" on all newly-added html elements
function renderPerformer(perfName, groupN, perfIndex){
  var perfDotElement = "<div class='circle perfDot perfDotGroup" + groupN + "' id='perfDot" + perfIndex + "'>"
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
  var perfListElement = "<div class='divInsert listElement perfList perfListGroup" + groupN + "' id='perfList" + perfIndex + "'>"
    + "<div class='colorSample circle' style='background-color: " + groups[groupN].groupColor
    + "'></div>  <b>" + perfName + "</b></div>";
  $(perfListElement).appendTo("#performerList");
  $("#perfList" + perfIndex).on("click", function(){
    if($(this).hasClass("listElementHighlight")){
      $(this).removeClass("listElementHighlight");
      $("#perfDot" + perfIndex).removeClass("dotSelected").off("mouseup").off("mousemove");
      selected.splice(selected.indexOf(perfIndex), 1);
    }else{
      if(!shiftKeyPressed){
        $(".dotSelected").removeClass("dotSelected").off("mouseup").off("mousemove");
        $(".perfList.listElementHighlight, .groupList.listElementHighlight").removeClass("listElementHighlight");
        selected = [];
      }
      $(this).addClass("listElementHighlight");
      $("#perfDot" + perfIndex).addClass("dotSelected");
      selected.push(perfIndex);
    }
  });
  $("#perfList" + perfIndex).children().on("click", function(){
    event.stopPropagation();
  });
}

function dotOnmousedown(pageObj){
  var myIndex = parseInt(pageObj.attr("id").substring(7));
  if(pageObj.hasClass("dotSelected")){
    //console.log("clicked... what next?");
    pageObj.on("mouseup", function(){
      //console.log("unselected");
      pageObj.removeClass("dotSelected");
      $("#perfList" + myIndex).removeClass("listElementHighlight");
      //console.log(dragging);
      selected.splice(selected.indexOf(myIndex), 1);
      pageObj.off("mouseup").off("mousemove");
    });
    pageObj.on("mousemove", function(){
      //console.log("dragging");
      if(dragging==0){
        //console.log("start drag");
        audioElement.pause(); //we don't want the song playing (and possibly triggering transitions) when dragging elements
        $(".perfDot").css("transition-duration", "0s"); //so they don't glide around when you drag them
        dragging = myIndex+1; //this triggers the check for mousemoves on the window.ready function
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
    if(!shiftKeyPressed){
      $(".dotSelected").removeClass("dotSelected").off("mouseup").off("mousemove");
      $(".perfList.listElementHighlight, .groupList.listElementHighlight").removeClass("listElementHighlight");
      selected = [];
    }
    pageObj.addClass("dotSelected");
    $("#perfList" + myIndex).addClass("listElementHighlight");
    selected.push(myIndex);
  }
}

//tagHere: unfinished; add editing for color chip
//tagHere: change editing entirely: have the input elements pre-loaded, but hidden,
//alongside the actual text elements, that way you can just swap the stuff back and forth
//no deleting required
function renderGroupElement(groupName, groupColor, groupIndex){
  var groupElement = "<div class='divInsert listElement groupList' id='groupList" + groupIndex + "'>" +
    "<div class='colorSample' style='background-color: " + groupColor
    + "'></div>  <div class='editHover'><b>" + groupName + "</b></div></div>";
  $(groupElement).appendTo("#groupList");

  var groupOption = "<option value='" + $("#groupDropDown option").length + "'>" + groupName + "</option>";
  $(groupOption).appendTo("#groupDropDown");

  //tagHere change the .on() if the one below is changed
  //tagHere doesn't work with johnathan's stuff: breaks on the apostrophe
  $("#groupList" + groupIndex).find("b").on("click", function(){
    event.stopPropagation();
    var inputVal = $(this).html();
    $("<input class='noMargin' type='text' placeholder='Name'>").appendTo($(this).parent().parent());
    $(this).parent().parent().find(':text').val(inputVal);
    $("<a class='plainlink' onclick='saveListName($(this), 1, parseInt($(this).parent().parent().find(&quot;a&quot;).parent().attr(&quot;id&quot;).substring(9)))'>Save&nbsp;name</a>").appendTo($(this).parent().parent());
    $(this).remove();
  });
  $("#groupList" + groupIndex).on("click", function(){
    /*if(!shiftKeyPressed){
      $(".dotSelected").removeClass("dotSelected").off("mouseup").off("mousemove");
      $(".perfList.listElementHighlight, .groupList.listElementHighlight").removeClass("listElementHighlight");
      selected = [];
    }*/
    if($(this).hasClass("listElementHighlight")){
      $(this).removeClass("listElementHighlight");
      $(".perfDotGroup" + groupIndex).each(function(){
        $(this).removeClass("dotSelected").off("mouseup").off("mousemove");
        selected.splice(selected.indexOf(parseInt($(this).attr("id").substring(7))), 1);
      });
      $(".perfListGroup" + groupIndex).each(function(){
        $(this).removeClass("listElementHighlight");
      });
    }else{
      if(!shiftKeyPressed){
        $(".dotSelected").removeClass("dotSelected").off("mouseup").off("mousemove");
        $(".perfList.listElementHighlight, .groupList.listElementHighlight").removeClass("listElementHighlight");
        selected = [];
      }
      $(this).addClass("listElementHighlight");
      $(".perfDotGroup" + groupIndex).each(function(){
        $(this).addClass("dotSelected");
        selected.push(parseInt($(this).attr("id").substring(7)));
      });
      $(".perfListGroup" + groupIndex).each(function(){
        $(this).addClass("listElementHighlight");
      });
    }
  });

  //tagHere: attach .on("click", function(){}) to the color swatch, the <b> name,
  //onclick, create a "save" link in the listElement and swap the text for a text input
  //or the color swatch for a color input
}

//tagHere: unfinished; add editing for name, timecode, moveLength
function renderFormationElement(formName, timecode, moveLength, formationIndex){
  var formationElement = "<div class='divInsert listElement formList' id='formList" + formationIndex + "'>"
    + "<div class='editHover'><b>" + formName + "</b><br><span>" + secToTimecode(timecode)
    + "</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>" + moveLength + " sec</span></div></div>";
  if(formationIndex==0){
    $(formationElement).prependTo("#formList");
  }else{
    $(formationElement).insertAfter("#formList" + (formationIndex-1));
  }

  $("#formList" + formationIndex).on("click", function(){
    $(".listElementHighlight").removeClass("listElementHighlight");
    $(this).addClass("listElementHighlight");
    currentFormation = formationIndex; //parseInt($(this).attr("id").substring(8));
    audioElement.currentTime = formations[currentFormation].timecode;
    movePerfDots(0.1);
  });

  $(".listElementHighlight").removeClass("listElementHighlight");
  $("#formList" + formationIndex).addClass("listElementHighlight");
  currentFormation = formationIndex;
  audioElement.currentTime = formations[currentFormation].timecode;
  movePerfDots(0.1);
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

    //tagHere checking the things -- I don't know if this is necessary anymore

    formations.splice(arrayPlace, 0, {formName: formName, timecode: timecode, moveLength: moveLength});
    //copy a new position into each performer's positions array
    for(var perf of performers){
      perf.positions.splice(arrayPlace, 0, {"xCoord":perf.positions[arrayPlace-1].xCoord, "yCoord":perf.positions[arrayPlace-1].yCoord});
    }
    //increment the ids of all the formation dom objects on the page
    while(arrayPlace<formations.length-1){
      $("#formList" + arrayPlace).attr("id", "formList" + arrayPlace+1);
      arrayPlace++;
    }

    renderFormationElement(formName, timecode, moveLength, arrayPlace);

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
  //iterate through performers array, delete that position object in each of their positions[] arrays
  //tagHere
  edited = true;

  //$(id).remove() the entry on the formations sidebar
}

function movePerfDots(stepLength){
  /*for(var i =0; i<performers.length; i++){
    $("perfDot" + i).css("animation-play-state", "paused");
  }*/
  $(".perfDot").css("transition-duration", (stepLength + "s"));
  for(var i =0; i<performers.length; i++){
    $("#perfDot" + i).css({"top":performers[i].positions[currentFormation].yCoord,
                        "left":performers[i].positions[currentFormation].xCoord});
    //okay (this comment is here so that the tabs on line above don't make it hard to make new lines)
  }
}

function incrementTime(inc){
  audioElement.currentTime=(audioElement.currentTime+inc);
  var curTime = audioElement.currentTime;
  if(currentFormation!=(formations.length-1)){
    if(curTime>(formations[currentFormation+1].timecode-formations[currentFormation+1].moveLength)){
      $("#formList" + currentFormation).removeClass("listElementHighlight");
      while(currentFormation<formations.length-1){
        if(curTime>formations[currentFormation+1].timecode-formations[currentFormation+1].moveLength){
          currentFormation++;
        }else{
          break;
        }
      }
      $("#formList" + currentFormation).addClass("listElementHighlight");
      movePerfDots(0.1);//formations[currentFormation].timecode-curTime);
    }
  }
  if(currentFormation>0){
    if(curTime<(formations[currentFormation].timecode-formations[currentFormation].moveLength)){
      $("#formList" + currentFormation).removeClass("listElementHighlight");
      while(currentFormation>0){
        if(curTime<formations[currentFormation].timecode-formations[currentFormation].moveLength){
          currentFormation--;
        }else{
          break;
        }
      }
      $("#formList" + currentFormation).addClass("listElementHighlight");
      movePerfDots(0.1);
    }
  }
  //tagHere: unfinished?
}

function searchForCurFormation(){
  var curTime = audioElement.currentTime;
    $("#formList" + currentFormation).removeClass("listElementHighlight");
    for(var i = formations.length-1; i>0; i--){
      if(formations[i].timecode<=curTime){
        break;
      }
    }
    currentFormation = i;
    $("#formList" + currentFormation).addClass("listElementHighlight");
    movePerfDots(0.1);
}

function giveTimeFormatted(){
  var curTime = audioElement.currentTime;
    if(Math.round((curTime%60)*10)/10<10){
      $("#formTimecode").val(Math.floor(curTime/60) + ":0" + Math.round((curTime%60)*10)/10);
    }else{
      $("#formTimecode").val(Math.floor(curTime/60) + ":" + Math.round((curTime%60)*10)/10);
    }
}

$(document).ready(function(){
  $(".errorDiv").css("display","none");
  audioElement = document.getElementById('testAudio');

  audioElement.onplay = function(){
    songPlaying = true;
    searchForCurFormation();
    checkDotMoves();
  }
  audioElement.onpause = function(){
    songPlaying = false;
    giveTimeFormatted();
  }
  //below commented out because it switches between seeking and seeked super fast
  /*audioElement.onseeking = function(){
    songPlaying = false;
  }*/
  audioElement.onseeked = function(){
    searchForCurFormation();
    giveTimeFormatted();
  }

  $("#canvas").on("click", function(){
    $(".dotSelected").removeClass("dotSelected").off("mouseup").off("mousemove");
    $(".perfList.listElementHighlight, .groupList.listElementHighlight").removeClass("listElementHighlight");
    selected = [];
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

  $(this).keydown(function(){
    if(event.keyCode == 16){
      shiftKeyPressed = true;
    }
  });
  $(this).keyup(function(){
    if(event.keyCode == 16){
      shiftKeyPressed = false;
    }
  })
  //tagHere delete comment
  //autoSave() //this starts the autoSave() self-calls every two minutes

  //tagHere reenable eventually
  /*window.onbeforeunload = function(){
    if(edited){
      return confirm("You have unsaved changes. Are you sure you want to leave this tab?");
    }
  */
});

function checkDotMoves(){
  //console.log("checking!")
  var curTime = audioElement.currentTime;
  if(currentFormation!=(formations.length-1)){
    if(curTime>(formations[currentFormation+1].timecode-formations[currentFormation+1].moveLength)){
      $("#formList" + currentFormation).removeClass("listElementHighlight");
      while(currentFormation<formations.length-1){
        if(curTime>formations[currentFormation+1].timecode-formations[currentFormation+1].moveLength){
          currentFormation++;
        }else{
          break;
        }
      }
      $("#formList" + currentFormation).addClass("listElementHighlight");
      movePerfDots(formations[currentFormation].timecode-curTime);
      /*console.log("move, wait...");
      setTimeout(function(){
        if(songPlaying){
          console.log("checking again");
          checkDotMoves();
        }else{
          return;
        }
      }, (formations[currentFormation].timecode-curTime)*1000);
      return;*/
    }
  }
  if(songPlaying){
    setTimeout(function(){
      checkDotMoves(); //ooh, recursion!
    }, 100); //that's 0.1 seconds tagHere change this?
  }
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
