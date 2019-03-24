var performers = [];
var groups = [];
var formations = [];
var fileLink = "";
var currentFormation = 0;
var selected = [];
var shiftKeyPressed = false;
var songPlaying = false;
var audioElement;

function startUp(){
  $("#loader").hide();
  $("#canvas").css("display","inline-block");

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

function renderPerformer(perfName, groupN, perfIndex){
  var perfDotsElement = "<div class='circle perfDots perfDotsGroup" + groupN + "' id='perfDots" + perfIndex + "'>"
    + "<div class='perfLabel'>" + perfName + "</div></div>";
  $(perfDotsElement).appendTo("#canvas");

  var pageDotElement = $("#perfDots" + perfIndex);
  pageDotElement.css({"background-color":groups[groupN].groupColor});
  pageDotElement.on("click", function(){event.stopPropagation()});
  pageDotElement.on("mousedown", function(){
    event.stopPropagation();
    dotOnmousedown($(this));
  });

  //while we're at it, let's also generate the li's on the performers sidebar
  var perfListElement = "<div class='divInsert listElement perfList perfListGroup" + groupN + "' id='perfList" + perfIndex + "'>"
    + "<div class='colorSample circle colorSampleGroup" + groupN + "'><span hidden>" 
    + groupN + "</span></div>  <b>" + perfName + "</b></div>";
  $(perfListElement).appendTo("#performerList");
  $("#perfList" + perfIndex).find(".colorSample").css("background-color", groups[groupN].groupColor);

  $("#perfList" + perfIndex).on("click", function(){
    var tempIndex = parseInt($(this).attr(`id`).substring(8));
    if($(this).hasClass("listElementHighlight")){
      $(this).removeClass("listElementHighlight");
      $("#perfDots" + tempIndex).removeClass("dotSelected").off("mouseup").off("mousemove");
      selected.splice(selected.indexOf(tempIndex), 1);
    }else{
      if(!shiftKeyPressed){
        $(".dotSelected").removeClass("dotSelected").off("mouseup").off("mousemove");
        $(".perfList.listElementHighlight, .groupList.listElementHighlight").removeClass("listElementHighlight");
        selected = [];
      }
      $(this).addClass("listElementHighlight");
      $("#perfDots" + tempIndex).addClass("dotSelected");
      selected.push(tempIndex);
    }
  });

  $("#perfList" + perfIndex + ", #perfDots" + perfIndex).on("mouseenter", function(){
    var tempIndex = parseInt($(this).attr(`id`).substring(8));
    $("#perfList" + tempIndex).css("filter", "brightness(0.8)");
    $("#perfDots" + tempIndex).css("filter", "brightness(0.8)");
  }).on("mouseleave", function(){
    var tempIndex = parseInt($(this).attr(`id`).substring(8));
    $("#perfList" + tempIndex).css("filter", "none");
    $("#perfDots" + tempIndex).css("filter", "none");
  });

  movePerfDots(0);
}

function dotOnmousedown(pageObj){
  var myIndex = parseInt(pageObj.attr("id").substring(8));
  if(pageObj.hasClass("dotSelected")){
    //console.log("clicked... what next?");
    pageObj.on("mouseup", function(){
      //console.log("unselected");
      pageObj.removeClass("dotSelected");
      $("#perfList" + myIndex).removeClass("listElementHighlight");
      //console.log(dragging);
      selected.splice(selected.indexOf(myIndex), 1);
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

function renderGroupElement(groupName, groupColor, groupIndex){
  var groupElement = "<div class='divInsert listElement groupList' id='groupList" + groupIndex + "'>" +
    "<div class='colorSample'></div> <b>" + groupName + "</b></div>";
  $(groupElement).appendTo("#groupList");
  $("#groupList" + groupIndex).find(".colorSample").css("background-color", groupColor);

  $("#groupList" + groupIndex).on("click", function(){
    var tempIndex = parseInt($(this).attr(`id`).substring(9));
    if($(this).hasClass("listElementHighlight")){
      $(this).removeClass("listElementHighlight");
      $(".perfDotsGroup" + tempIndex).each(function(){
        $(this).removeClass("dotSelected").off("mouseup").off("mousemove");
        selected.splice(selected.indexOf(parseInt($(this).attr("id").substring(8))), 1);
      });
      $(".perfListGroup" + tempIndex).each(function(){
        $(this).removeClass("listElementHighlight");
      });
    }else{
      if(!shiftKeyPressed){
        $(".dotSelected").removeClass("dotSelected").off("mouseup").off("mousemove");
        $(".perfList.listElementHighlight, .groupList.listElementHighlight").removeClass("listElementHighlight");
        selected = [];
      }
      $(this).addClass("listElementHighlight");
      $(".perfDotsGroup" + tempIndex).each(function(){
        $(this).addClass("dotSelected");
        selected.push(parseInt($(this).attr("id").substring(8)));
      });
      $(".perfListGroup" + tempIndex).each(function(){
        $(this).addClass("listElementHighlight");
      });
    }
  });

  $("#groupList" + groupIndex).on("mouseenter", function(){
    var tempIndex = parseInt($(this).attr(`id`).substring(9));
    $(".perfDotsGroup" + tempIndex).each(function(){
      $(this).css("filter", "brightness(0.8)");
    });
    $(".perfListGroup" + tempIndex).each(function(){
      $(this).css("filter", "brightness(0.8)");
    });
  }).on("mouseleave", function(){
    var tempIndex = parseInt($(this).attr(`id`).substring(9));
    $(".perfDotsGroup" + tempIndex).each(function(){
      $(this).css("filter", "none");
    });
    $(".perfListGroup" + tempIndex).each(function(){
      $(this).css("filter", "none");
    });
  });
}

function renderFormationElement(formName, timecode, moveLength, formationIndex){
  var formationElement;
  formationElement = "<div class='divInsert listElement formList' id='formList" + formationIndex + "'>"
        + "<b>" + formName + "</b><br><span class='timecodeSpan'>" + secToTimecode(timecode)
        + "</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class='moveLengthSpan'>" + moveLength + " sec</span></div>";
  if(formationIndex==0){
    $(formationElement).prependTo("#formList");
  }else{
    $(formationElement).insertAfter("#formList" + (formationIndex-1));
  }


  $("#formList" + formationIndex).on("click", function(){
    $(".formList.listElementHighlight").removeClass("listElementHighlight");
    $(this).addClass("listElementHighlight");
    currentFormation = parseInt($(this).attr("id").substring(8));//formationIndex;
    audioElement.currentTime = formations[currentFormation].timecode;
    //movePerfDots(0.1); //it already gets called when you change the time and it updates
  });
  $(".formList.listElementHighlight").removeClass("listElementHighlight");
  $("#formList" + formationIndex).addClass("listElementHighlight");
  currentFormation = formationIndex;
  audioElement.currentTime = formations[currentFormation].timecode;
  //movePerfDots(0.1);
}

function editListObj(listObject, objectType, objectIndex){
  var newValue;
  if(objectType==1){
    //it's a name for a group, performer, or formation group
    newValue = listObject.parent().find("input[type=text]").val();
    if(listObject.parent().parent().parent().hasClass("groupList")){
      groups[objectIndex].groupName = newValue;
      //change the select option name
      $("#groupDropDown option[value=" + objectIndex + "]").html(newValue);
    }else if(listObject.parent().parent().parent().hasClass("perfList")){
      performers[objectIndex].perfName = newValue;
      //change the performer dot name
      $("#perfDots" + objectIndex).find(".perfLabel").html(newValue);
    }else if(listObject.parent().parent().parent().hasClass("formList")){
      formations[objectIndex].formName = newValue;
    }
    listObject.parent().parent().find(".editHover").find("b").html(newValue);
  }else if(objectType==2){
    //it's the color sample for a group
    newValue = listObject.parent().find("input[type=color]").val();
    groups[objectIndex].groupColor = newValue;
    listObject.parent().parent().find(".editHover").find(".colorSample").css("background-color", newValue);
    $(".perfDotsGroup" + objectIndex + ", .colorSampleGroup" + objectIndex).css("background-color", newValue);
  }else if(objectType==3){
    //it's the group (and color sample) for a performer
    newValue = listObject.parent().find("select").val();
    listObject.parent().parent().find(".editHover").find(".colorSample").css("background-color", groups[newValue].groupColor).find("span").html(newValue);
    $("#perfList" + objectIndex).removeClass("perfListGroup" + performers[objectIndex].groupN).addClass("perfListGroup" + newValue);
    $("#perfDots" + objectIndex).css("background-color", groups[newValue].groupColor).removeClass("perfDotsGroup" + performers[objectIndex].groupN).addClass("perfDotsGroup" + newValue);
    performers[objectIndex].groupN = newValue;
  }else if(objectType==4){
    //it's the timecode of a formation
    newValue = listObject.parent().find("input[type=text]").val();
    if(newValue.indexOf(":")==-1){
      //there are no minutes
      newValue = Math.round(parseFloat(newValue)*10)/10;
      if(newValue<0){
        listObject.parent().parent().parent().find(".errorDiv").html("Invalid timecode: timecode must be ≥0.").show();
        return;
      }else if(newValue>=60){
        listObject.parent().parent().parent().find(".errorDiv").html('For timecodes longer than one minute, please use the format "(minutes):(seconds)."').show();
        return;
      }
    }else{
      var tMinutes = parseInt(newValue.substring(0, newValue.indexOf(":")));
      var tSeconds = parseFloat(newValue.substring(newValue.indexOf(":")+1));
      if(tSeconds>=60||tSeconds<0){
        //invalid timecode: greater than or equal to 60 seconds for the seconds section
        listObject.parent().parent().parent().find(".errorDiv").html("Invalid timecode: seconds must be <60 and ≥0.").show();
        return;
      }else if(tMinutes<0){
        listObject.parent().parent().parent().find(".errorDiv").html("Invalid timecode: timecode must be ≥0.").show();
        return;
      }
      newValue = Math.round(((tMinutes*60) + tSeconds)*10)/10;
    }
    if(isNaN(newValue)){
      listObject.parent().parent().parent().find(".errorDiv").html('Please enter a number value for timecodes.').show();
      return;
    }
    var testFormations = formations.slice();
    testFormations.splice(objectIndex, 1);
    //we have to test with the formation removed otherwise it might test against the old version of itself

    //find where in the formations array it fits
    var arrayPlace = testFormations.length-1;
    while(arrayPlace>0&&newValue<testFormations[arrayPlace].timecode){
      arrayPlace--;
    }
    //arrayPlace stops on an index where the thing has a lower timecode than the one you're adding
    //so you want to be one above that for the splice
    arrayPlace++;

    if((newValue-formations[objectIndex].moveLength)<testFormations[arrayPlace-1].timecode){
      //we have an error! you're overlapping the move periods of this step with the step before
      listObject.parent().parent().parent().find(".errorDiv").html("Uh oh! Your move length overlaps the timecode of the formation before it.").css("display", "block");
      return;
    }
    if(arrayPlace!=testFormations.length){
      if(newValue>(testFormations[arrayPlace].timecode-testFormations[arrayPlace].moveLength)){
        //we have an error! you're overlapping the move periods of this step with the step after
        listObject.parent().parent().parent().find(".errorDiv").html("Uh oh! Your new timecode overlaps the moving period of the formation after it.").css("display", "block");
        return;
      }
    }
    currentFormation = arrayPlace;

    //okay, so we know we have a legit timecode now
    audioElement.currentTime = newValue;
    formations[objectIndex].timecode = newValue;
    $("#formList" + objectIndex).find(".timecodeSpan").html(secToTimecode(newValue));
    if(arrayPlace!=objectIndex){
      //drat, this means we actually have to alter the formList, as well as the positions arrays of every performer
      $("#formList" + objectIndex).attr("id", "formListX");
      //step 1: change all the formation ids for the elements affected by it
      if(arrayPlace<objectIndex){
        //this means we have to increment all the formation ids at arrayPlace up through before objectIndex 
        for(var i = arrayPlace; i<objectIndex; i++){
          $("#formList" + i).attr("id", "formList" + (i+1));
        }
      }else{
        //this means we have to decrement all the formation ids at objectIndex up through arrayPlace
        for(var i = arrayPlace; i<objectIndex; i++){
          $("#formList" + i).attr("id", "formList" + (i-1));
        }
      }
      //step 2: update its own id, move it on the page
      $("#formListX").attr("id", "formList" + arrayPlace).detach().insertAfter("#formList" + (arrayPlace-1));
      var tempObj = formations[objectIndex];
      formations.splice(objectIndex, 1);
      formations.splice(arrayPlace, 0, tempObj);
      //step 3: shift the position in all the performers' positions arrays
      for(var i = 0; i<performers.length; i++){
        tempObj = performers[i].positions[objectIndex];
        performers[i].positions.splice(objectIndex, 1);
        performers[i].positions.splice(arrayPlace, 0, tempObj);
      }
    }
    listObject.parent().parent().parent().find(".errorDiv").hide();
  }else if(objectType==5){
    //it's the movelength of a formation
    newValue = Math.round(parseFloat(listObject.parent().find("input[type=number]").val())*10)/10;
    if(formations[objectIndex-1].timecode>(formations[objectIndex].timecode - newValue)){
      listObject.parent().parent().parent().find(".errorDiv").html("Uh oh! Your new move length overlaps the timecode of the formation before it.").show();
      return;
    }
    $("#formList" + objectIndex).find(".moveLengthSpan").html(newValue + " sec");
    formations[objectIndex].moveLength = newValue;
    listObject.parent().parent().parent().find(".errorDiv").hide();
  }else if(objectType==6){
    //it's the song file ID
    newValue = listObject.parent().find("input[type=text]").val();
    fileLink = newValue;
    $("#testAudio").prop("src", "http://docs.google.com/uc?export=open&id=" + newValue);
    $("#fileLinkSpan").html(newValue);
  }
  listObject.parent().hide();
  listObject.parent().parent().find(".editHover").show();

  edited = true;
  $("#saveButton").html("Save");
}

function movePerfDots(stepLength){
  $(".perfDots").css("transition-duration", (stepLength + "s"));
  for(var i =0; i<performers.length; i++){
    $("#perfDots" + i).css({"top":(performers[i].positions[currentFormation].yCoord - (i*22)) + "px",
                        "left":performers[i].positions[currentFormation].xCoord + "px"});
    //okay (this comment is here so that the tabs on line above don't make it hard to make new lines)
  }
}

function checkTimecode(timecode){
  if(timecode.indexOf(":")==-1){
      //there are no minutes
      timecode = Math.round(parseFloat(timecode)*10)/10;
      if(timecode<0){
        return "Invalid timecode: timecode must be ≥0.";
      }else if(timecode>=60){
        return 'For timecodes longer than one minute, please use the format "(minutes):(seconds)."';
      }
    }else{
      var tMinutes = parseInt(timecode.substring(0, timecode.indexOf(":")));
      var tSeconds = parseFloat(timecode.substring(timecode.indexOf(":")+1));
      if(tSeconds>=60||tSeconds<0){
        //invalid timecode: greater than or equal to 60 seconds for the seconds section
        return "Invalid timecode: seconds must be <60 and ≥0.";
      }else if(tMinutes<0){
        return "Invalid timecode: timecode must be ≥0.";
      }
      timecode = Math.round(((tMinutes*60) + tSeconds)*10)/10;
    }
    if(isNaN(timecode)){
      return 'Please enter a number value for timecodes.';
    }
    return timecode;
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
}

function specTimeJump(){
  var timecode = checkTimecode($("#specTimeJump").val());
  if(!(timecode>0)){
    $("#specTimeJumpErr").html(timecode).show();
    return;
  }
  audioElement.currentTime = timecode;
}

function secToTimecode(timecode){
  if(Math.round((timecode%60)*10)/10<10){
    return Math.floor(timecode/60) + ":0" + Math.round((timecode%60)*10)/10;
  }
  return Math.floor(timecode/60) + ":" + Math.round((timecode%60)*10)/10;
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

$(document).ready(function(){
  $(".errorDiv, #fileLinkDiv").hide();
  audioElement = document.getElementById('testAudio');

  audioElement.onplay = function(){
    songPlaying = true;
    searchForCurFormation();
    checkDotMoves();
  }
  audioElement.onpause = function(){
    songPlaying = false;
    var moveX;
    var moveY;
    for(var i =0; i<performers.length; i++){
      moveX = $("#perfDots" + i).position().left - $("#canvas").position().left - 1;// - parseInt(performers[dragging].positions[currentFormation].xCoord);
      moveY = $("#perfDots" + i).position().top - $("#canvas").position().top - (22*i) - 2;
      $("#perfDots" + i).css({"top":moveY, "left":moveX, "transition-duration":"0s"});
    }
    $("#formTimecode").val(secToTimecode(audioElement.currentTime));
  }

  audioElement.onseeked = function(){
    searchForCurFormation();
    $("#formTimecode").val(secToTimecode(audioElement.currentTime));
  }

  $("#canvas").on("click", function(){
    $(".dotSelected").removeClass("dotSelected").off("mouseup").off("mousemove");
    $(".perfList.listElementHighlight, .groupList.listElementHighlight").removeClass("listElementHighlight");
    selected = [];
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
  });
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
    }
  }
  if(songPlaying){
    setTimeout(function(){
      checkDotMoves(); //ooh, recursion!
    }, 100); //that's 0.1 seconds tagHere change this if needed
  }
}
