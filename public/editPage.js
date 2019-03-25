var performers = [];
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
var dragEdges;

function startUp(){
  $("#loader").hide();
  $("#canvas").css("display","inline-block");
  $("#formFormName").val("Formation " + (formations.length+1));
  $("#fileLinkSpan").html(fileLink);
  $("#fileLinkDiv").show();

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
  currentFormation = 0;
  $(".formList.listElementHighlight").removeClass("listElementHighlight");
  $("#formList0").addClass("listElementHighlight");
  audioElement.currentTime = 0.1;
  autoSave() //this starts the autoSave() recursive calls
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
    + "<div class='inlineDiv'><div class='editHover circle'><div class='colorSample circle colorSampleGroup" + groupN + "'><span hidden>" 
    + groupN + "</span></div></div><div class='editElements'><select></select><a class='plainlink' onclick='editListObj($(this), 3, " 
    + "parseInt($(this).parent().parent().parent().attr(`id`).substring(8)))'><br>Save&nbsp;group</a></div></div>" + "  <div class='inlineDiv'><div class='editHover'><b>" + perfName 
    + "</b></div><div class='editElements'><input class='noMargin' type='text' placeholder='Name'>"
    + "<a class='plainlink' onclick='editListObj($(this), 1, parseInt($(this).parent().parent().parent().attr(`id`).substring(8)))'><br>Save&nbsp;name</a></div></div>" 
    + "<div class='delButton'>x</div></div>";
  $(perfListElement).appendTo("#performerList");
  $("#perfList" + perfIndex).find(".colorSample").css("background-color", groups[groupN].groupColor);
  $("#perfList" + perfIndex).children().on("click", function(){
    event.stopPropagation();
  });

  $("#perfList" + perfIndex).find(".editHover").on("mouseenter", function(){
    $(this).css({"border": "0.5px solid lightgrey", "background-color": "white", "padding": "3px"})
  }).on("mouseleave", function(){
    $(this).css({"border": 0, "background-color": "transparent", "padding": 0})
  }).on("click", function(){
    $(this).hide();
    if($(this).find("b").length>0){
      $(this).parent().find("input[type=text]").val($(this).find("b").html());
    }else if($(this).find(".colorSample").length>0){
      $(this).parent().find("select").html($("#groupDropDown").children().clone()).val($(this).find(".colorSample > span").html());
    }
    $(this).parent().find(".editElements").show();
  });
  $("#perfList" + perfIndex).find(".delButton").on("click", function(){
    if(confirm('Are you sure you want to delete this performer? This action cannot be undone.')){
      deletePerformer(parseInt($(this).parent().attr(`id`).substring(8)));
    }
  });

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

function renderGroupElement(groupName, groupColor, groupIndex){
  var groupElement = "<div class='divInsert listElement groupList' id='groupList" + groupIndex + "'>" +
    "<div class='inlineDiv'><div class='editHover'><div class='colorSample'></div></div><div class='editElements'>" 
    + "<input type='color' value='#4682e2' class='noMargin'><a class='plainlink' onclick='editListObj($(this), 2, parseInt($(this).parent().parent().parent().attr(`id`).substring(9))"
    + ")'><br>Save&nbsp;color</a></div></div>  <div class='inlineDiv'><div class='editHover'><b>" + groupName
    + "</b></div><div class='editElements'><input class='noMargin' type='text' placeholder='Name'>"
    + "<a class='plainlink' onclick='editListObj($(this), 1, parseInt($(this).parent().parent().parent().attr(`id`).substring(9)))'><br>Save&nbsp;name</a></div></div>" 
    + "<div class='delButton'>x</div></div>";
  $(groupElement).appendTo("#groupList");
  $("#groupList" + groupIndex).find(".colorSample").css("background-color", groupColor);
  $("#groupList" + groupIndex).children().on("click", function(){
    event.stopPropagation();
  });

  var groupOption = "<option value='" + $("#groupDropDown option").length + "'>" + groupName + "</option>";
  $(groupOption).appendTo("#groupDropDown");
  $(groupOption).appendTo(".perfList select");

  
  $("#groupList" + groupIndex).find(".editHover").on("mouseenter", function(){
    $(this).css({"border": "0.5px solid lightgrey", "background-color": "white", "padding": "3px"})
  }).on("mouseleave", function(){
    $(this).css({"border": 0, "background-color": "transparent", "padding": 0})
  }).on("click", function(){
    $(this).hide();
    if($(this).find("b").length>0){
      $(this).parent().find("input[type=text]").val($(this).find("b").html());
    }else if($(this).find(".colorSample").length>0){
      $(this).parent().find("input[type=color]").val(groups[groupIndex].groupColor);
    }
    $(this).parent().find(".editElements").show();
  });
  $("#groupList" + groupIndex).find(".delButton").on("click", function(){
    var tempIndex = parseInt($(this).parent().attr(`id`).substring(9));
    if($(".perfDotsGroup" + tempIndex).length>0){
      alert("You can't delete this group yet—there are still performers that have this group assigned to them. Please change those performers before deleting.");
    }else if(confirm('Are you sure you want to delete this group? This action cannot be undone.')){
      deleteGroup(tempIndex);
    }
  });

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
  if(formationIndex>0){
    formationElement = "<div class='divInsert listElement formList' id='formList" + formationIndex + "'>"
        + "<div class='inlineDiv'><div class='editHover'><b>" + formName 
        + "</b></div><div class='editElements'><input class='noMargin' type='text' placeholder='Name'>"
        + "<a class='plainlink' onclick='editListObj($(this), 1, parseInt($(this).parent().parent().parent().attr(`id`).substring(8)))'><br>Save&nbsp;name</a></div></div>" 
        + "<div class='delButton'>x</div><br><div class='inlineDiv'><div class='editHover'><span class='timecodeSpan'>" + secToTimecode(timecode)
        + "</span></div><div class='editElements'><input class='noMargin' type='text' placeholder='- - : - - . - (min : sec)'>"
        + "<a class='plainlink' onclick='editListObj($(this), 4, parseInt($(this).parent().parent().parent().attr(`id`).substring(8)))'><br>Save&nbsp;timecode</a></div></div>" 
        + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div class='inlineDiv'><div class='editHover'><span class='moveLengthSpan'>" 
        + moveLength + " sec</span></div><div class='editElements'><input class='noMargin' type='number' step='0.1' min='0' placeholder='(sec)'>"
        + "<a class='plainlink' onclick='editListObj($(this), 5, parseInt($(this).parent().parent().parent().attr(`id`).substring(8)))'><br>Save&nbsp;move&nbsp;length</a></div></div>" 
        + "<div class='errorDiv'></div></div>";
  }else{
    formationElement = "<div class='divInsert listElement formList' id='formList" + formationIndex + "'>"
        + "<div class='inlineDiv'><div class='editHover'><b>" + formName 
        + "</b></div><div class='editElements'><input class='noMargin' type='text' placeholder='Name'>"
        + "<a class='plainlink' onclick='editListObj($(this), 1, 0)'><br>Save&nbsp;name</a></div></div>" 
        + "<br><span class='timecodeSpan'>" + secToTimecode(timecode)
        + "</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class='moveLengthSpan'>" + moveLength + " sec</span>" 
        + "<div class='errorDiv'></div></div>";
  }
  if(formationIndex==0){
    $(formationElement).prependTo("#formList");
  }else{
    $(formationElement).insertAfter("#formList" + (formationIndex-1));
  }

  $("#formList" + formationIndex).find(".errorDiv").hide();
  $("#formList" + formationIndex).children().on("click", function(){
    event.stopPropagation();
  });

  $("#formList" + formationIndex).find(".editHover").on("mouseenter", function(){
    $(this).css({"border": "0.5px solid lightgrey", "background-color": "white", "padding": "3px"})
  }).on("mouseleave", function(){
    $(this).css({"border": 0, "background-color": "transparent", "padding": 0})
  }).on("click", function(){
    $(this).hide();
    $(this).parent().parent().find(".errorDiv").hide();
    if($(this).find("b").length>0){
      $(this).parent().find("input[type=text]").val($(this).find("b").html());
    }else if($(this).find(".timecodeSpan").length>0){
      $(this).parent().find("input[type=text]").val($(this).find(".timecodeSpan").html());
    }else if($(this).find(".moveLengthSpan").length>0){
      var moveLengthEntry = $(this).find(".moveLengthSpan").html();
      $(this).parent().find("input[type=number]").val(moveLengthEntry.substring(0,moveLengthEntry.indexOf(" sec")));
    }
    $(this).parent().find(".editElements").show();
  });
  $("#formList" + formationIndex).find(".delButton").on("click", function(){
    if(confirm('Are you sure you want to delete this formation? This action cannot be undone.')){
      deleteFormation(parseInt($(this).parent().attr("id").substring(8)));
    }
  });


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
      pageObj.off("mouseup").off("mousemove");
    });
    pageObj.on("mousemove", function(){
      //console.log("dragging");
      if(dragging==0){
        //console.log("start drag");
        audioElement.pause(); //we don't want the song playing (and possibly triggering transitions) when dragging elements
        $(".perfDots").css("transition-duration", "0s"); //so they don't glide around when you drag them

        //find the max and min of each so we can keep the dots from going outside the stage workingHere
        dragEdges = [parseInt($("#canvas").width()), 0, parseInt($("#canvas").height()), 0]; //left, right, top, bottom
        var testVal;
        for(var i in selected){
          testVal = performers[i].positions[currentFormation];
          if(parseInt(testVal.xCoord)<dragEdges[0]){
            dragEdges[0] = parseInt(testVal.xCoord);
          }
          if(parseInt(testVal.xCoord)>dragEdges[1]){
            dragEdges[1] = parseInt(testVal.xCoord);
          }
          if(parseInt(testVal.yCoord)<dragEdges[2]){
            dragEdges[2] = parseInt(testVal.yCoord);
          }
          if(parseInt(testVal.xCoord)>dragEdges[3]){
            dragEdges[3] = parseInt(testVal.yCoord);
          }
        }
        //now we have the mins and maxes, we have to figure out what the maximum shift in each of these must be

        dragging = myIndex+1; //this triggers the check for mousemoves on the window.ready function
        pageObj.off("mouseup");
        $(window).on("mouseup", function(){
          //console.log("finish drag");
          //save all the selected objects' left and top
          for(var i = 0; i<selected.length; i++){
            performers[selected[i]].positions[currentFormation].yCoord = parseInt($("#perfDots" + selected[i]).css("top")) + (selected[i]*22);
            performers[selected[i]].positions[currentFormation].xCoord = parseInt($("#perfDots" + selected[i]).css("left"));
          }

          edited = true;
          $("#saveButton").html("Save");
          dragging = 0;
          pageObj.off("mousemove");
          $(window).off("mouseup");
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
      listObject.parent().parent().parent().find(".errorDiv").html("Uh oh! Your move length overlaps the timecode of the formation before it.").show();
      return;
    }
    if(arrayPlace!=testFormations.length){
      if(newValue>(testFormations[arrayPlace].timecode-testFormations[arrayPlace].moveLength)){
        //we have an error! you're overlapping the move periods of this step with the step after
        listObject.parent().parent().parent().find(".errorDiv").html("Uh oh! Your new timecode overlaps the moving period of the formation after it.").show();
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

function selectedScale(vertHoriz, scale){
  if(selected.length==0||scale==100){
    //nothing to transform
    return;
  }
  var multiplier = scale/100;
  var minVal;
  var maxVal = 0;
  var testVal;
  if(vertHoriz==1){
    //it's a horizontal scale
    minVal = parseInt($("#canvas").width());
  }else{
    //it's a vertical scale
    minVal = parseInt($("#canvas").height());
  }
  for(var i = 0; i<selected.length; i++){
    if(vertHoriz==1){
      testVal = performers[selected[i]].positions[currentFormation].xCoord;
    }else{
      testVal = performers[selected[i]].positions[currentFormation].yCoord;
    }
    if(testVal<minVal){
      minVal = testVal;
    }
    if(testVal>maxVal){
      maxVal = testVal;
    }
  }
  var average = (minVal + maxVal)/2 + 11; //it's not actually an average, its the midpoint of the formation
  var oldVal;
  var newVal;
  $(".perfDots").css("transition-duration", ("0.1s"));
  if(vertHoriz==1){
    for(var i of selected){
      oldVal = performers[i].positions[currentFormation].xCoord;
      newVal = average + (oldVal-average)*multiplier;
      if(newVal<0){
        newVal = 0;
      }else if(newVal>parseInt($("#canvas").width())-22){
        newVal = parseInt($("#canvas").width())-22;
      }
      performers[i].positions[currentFormation].xCoord = newVal;
    }
  }else{
    for(var i of selected){
      oldVal = performers[i].positions[currentFormation].yCoord;
      newVal = average + (oldVal-average)*multiplier;
      if(newVal<0){
        newVal = 0;
      }else if(newVal>parseInt($("#canvas").height())-22){
        newVal = parseInt($("#canvas").height())-22;
      }
      performers[i].positions[currentFormation].yCoord = newVal;
    }
  }
  movePerfDots(0.1);
  edited = true;
  $("#saveButton").html("Save");
}

function makeNewPerformer(){
  $("#perfErr").hide();
  if($("#formPerfName").val()&&$("#groupDropDown").val()){
    var perfName = $("#formPerfName").val();
    var groupN = $("#groupDropDown").val();
    $("#formPerfName").val("");

    var positionsArray = [];
    var randomXCoord = Math.floor(400*Math.random());

    //tagHere change the 400
    //automatically fill the performer's positions array with filler values
    for(var n = 0; n<formations.length; n++){
      positionsArray.push({xCoord:randomXCoord, yCoord: 25});
      //tagHere change the 200 value
    }

    //add a new person to the performers array
    performers.push({perfName: perfName, groupN: groupN, positions: positionsArray});
    edited = true;
    $("#saveButton").html("Save");

    //add a new li to the performers list, and a new performer dot
    renderPerformer(perfName, groupN, performers.length-1);
  }else{
    if(!$("#groupDropDown").val()){
      //no groups, throw error
      $("#perfErr").html("You must make a group before you make any performers.").show();
    }else if(!$("#formPerfName").val()){
      //no performer name throw error
      $("#perfErr").html("Please enter a name for this performer.").show();
    }
  }
}

function makeNewGroup(){
  $("#groupErr").hide();
  var groupColor = $("#groupColor").val()
  for(var n = 0; n<groups.length; n++){
    if(groupColor==groups[n].groupColor){
      $("#groupErr").html("Please choose a unique color for this group.").show();
      return;
    }
  }
  if($("#formGroupName").val()){
    var groupName = $("#formGroupName").val();
    $("#formGroupName").val("");

    renderGroupElement(groupName, groupColor, groups.length);

    groups.push({groupName: groupName, groupColor: groupColor});
    edited = true;
    $("#saveButton").html("Save");
  }else{
    //no group name throw error
    $("#groupErr").html("Please enter a name for this group.").show();
  }
}

function makeNewFormation(){
  $("#formationErr").hide();

  if($("#formFormName").val()&&$("#formTimecode").val()&&$("#formMoveLength").val()){
    var formName = $("#formFormName").val();
    var moveLength = Math.round(parseFloat($("#formMoveLength").val())*10)/10;

    var timecode = checkTimecode($("#formTimecode").val());
    if(!timecode>0){
      $("#formationErr").html(timecode).show();
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
      $("#formationErr").html("Uh oh! Your new formation's move length overlaps the timecode of the formation before it.").show();
      return;
    }
    if(arrayPlace!=formations.length){
      if(timecode>(formations[arrayPlace].timecode-formations[arrayPlace].moveLength)){
        //we have an error! you're overlapping the move periods of this step with the step after
        $("#formationErr").html("Uh oh! Your new formation's timecode overlaps the moving period of the formation after it.").show();
        return;
      }
    }

    formations.splice(arrayPlace, 0, {formName: formName, timecode: timecode, moveLength: moveLength});
    //copy a new position into each performer's positions array
    for(var perf of performers){
      perf.positions.splice(arrayPlace, 0, {"xCoord":perf.positions[arrayPlace-1].xCoord, "yCoord":perf.positions[arrayPlace-1].yCoord});
    }
    //increment the ids of all the formation dom objects on the page
    for(var i = formations.length-1; i>=arrayPlace; i--){
      $("#formList" + i).attr("id", "formList" + (i+1));
    }

    renderFormationElement(formName, timecode, moveLength, arrayPlace);

    //clear form inputs
    $("#formFormName").val("Formation " + (formations.length+1));
    $("#formTimecode").val("");
    $("#formMoveLength").val("");
    edited = true;
    $("#saveButton").html("Save");
  }else{
    if(!$("#formFormName").val()){
      //no form name throw error
      $("#formationErr").html('Please enter a name for this formation (even "Formation 1" is fine).').show();
    }else if(!$("#formTimecode").val()){
      //no timecode throw error
      $("#formationErr").html("Please enter a timecode for this formation.").show();
    }else{
      //no moveLength throw error
      $("#formationErr").html("Please enter the length of time to move into this formation.").show();
      //tagHere change these messages
    }
  }
  edited = true;
  $("#saveButton").html("Save");
}

function deletePerformer(perfIndex){
  $("#perfDots" + perfIndex + ", #perfList" + perfIndex).remove();
  for(var i = perfIndex+1; i<performers.length; i++){
    $("#perfDots" + i).attr("id", "perfDots" + (i-1));
    $("#perfList" + i).attr("id", "perfList" + (i-1));
  }
  performers.splice(perfIndex, 1);
  edited = true;
  $("#saveButton").html("Save");
  movePerfDots(0);
}

function deleteGroup(groupIndex){
  console.log(groupIndex);
  $("#groupList" + groupIndex).remove();
  $("#groupDropDown option[value=" + groupIndex + "]").remove();
  $(".perfList").find("select option[value=" + groupIndex + "]").remove();
  for(var i = groupIndex+1; i<groups.length; i++){
    $("#groupList" + i).attr("id", "groupList" + (i-1));
    $("#groupDropDown option[value=" + i + "]").attr("value", (i-1));
    $(".perfList").find("select option[value=" + i + "]").attr("value", (i-1));
  }
  for(var i = 0; i<performers.length; i++){
    if(performers[i].groupN>groupIndex){
      performers[i].groupN--;
    }
  }
  for(var i = groupIndex+1; i<groups.length; i++){
    $(".perfDotsGroup" + i).removeClass("perfDotsGroup" + i).addClass("perfDotsGroup" + (i-1));
    $(".perfListGroup" + i).removeClass("perfListGroup" + i).addClass("perfListGroup" + (i-1));
    $(".colorSampleGroup" + i).removeClass("colorSampleGroup" + i).addClass("colorSampleGroup" + (i-1));
  }

  groups.splice(groupIndex, 1);
  edited = true;
  $("#saveButton").html("Save");
}

function deleteFormation(formationIndex){
  if(formationIndex==currentFormation){
    if(formationIndex==formations.length-1){
      currentFormation--;
      $("#formList" + currentFormation).addClass("listElementHighlight");
      audioElement.currentTime = formations[currentFormation].timecode;
    }else{
      $("#formList" + (formationIndex+1)).addClass("listElementHighlight");
      audioElement.currentTime = formations[formationIndex+1].timecode;
    }
  }
  $("#formList" + formationIndex).remove();
  for(var i = formationIndex+1; i<formations.length; i++){
    $("#formList" + i).attr("id", "formList" + (i-1));
  }
  for(var i = 0; i<performers.length; i++){
    performers[i].positions.splice(formationIndex, 1);
  }
  formations.splice(formationIndex, 1);
  movePerfDots(0.1);
  edited = true;
  $("#saveButton").html("Save");
}

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
    }, 100); //that's 0.1 seconds tagHere change this if needed
  }
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
      moveY = $("#perfDots" + i).position().top - $("#canvas").position().top - (22*i) - 1;
      $("#perfDots" + i).css({"top":moveY, "left":moveX, "transition-duration":"0s"});
    }
    $("#formTimecode").val(secToTimecode(audioElement.currentTime));
  }
  //below commented out because it switches between seeking and seeked super fast
  /*audioElement.onseeking = function(){
    songPlaying = false;
  }*/
  audioElement.onseeked = function(){
    searchForCurFormation();
    $("#formTimecode").val(secToTimecode(audioElement.currentTime));
  }

  $("#fileLinkDiv").find(".editHover").on("mouseenter", function(){
    $(this).css({"border": "0.5px solid lightgrey", "background-color": "white", "padding": "3px"})
  }).on("mouseleave", function(){
    $(this).css({"border": 0, "background-color": "transparent", "padding": 0})
  }).on("click", function(){
    $(this).hide();
    $(this).parent().find("input[type=text]").val($(this).find("#fileLinkSpan").html());
    $(this).parent().find(".editElements").show();
  });

  $("#canvas").on("click", function(){
    $(".dotSelected").removeClass("dotSelected").off("mouseup").off("mousemove");
    $(".perfList.listElementHighlight, .groupList.listElementHighlight").removeClass("listElementHighlight");
    selected = [];
  });
  $(window).on("mousemove", function(){
    //console.log(event.pageX + " " + event.pageY);
    if(dragging>0){
      var elementIndex = dragging-1;
      //tagHere change the 11 and 22 if the perfDots width changes
      //it's outerWidth: so if the perfDots has a width of 18, add 2*2 to that for a border of 2
      var moveX = event.pageX - $("#canvas").position().left - 11;
      var moveY = event.pageY - $("#canvas").position().top - 11 - (22*elementIndex);
      var yPos;
      var xPos;
      //console.log(moveX + " " + moveY);
      for(var i = 0; i<selected.length; i++){
        yPos = moveY + performers[selected[i]].positions[currentFormation].yCoord - performers[elementIndex].positions[currentFormation].yCoord - (selected[i]-elementIndex)*22 + (selected[i]*22);
        if(yPos<0){
          yPos = 0;
        }else if(yPos>parseInt($("#canvas").height())-22){
          yPos = parseInt($("#canvas").height())-22;
        }

        xPos = moveX + performers[selected[i]].positions[currentFormation].xCoord - performers[elementIndex].positions[currentFormation].xCoord;
        if(xPos<0){
          xPos = 0;
        }else if(xPos>parseInt($("#canvas").width())-22){
          xPos = parseInt($("#canvas").width())-22;
        }

        $("#perfDots" + selected[i]).css({"left": xPos, "top": yPos - (selected[i]*22)});
      }
      //$("#perfDots" + elementIndex).css({"left": moveX, "top": moveY});
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
  });

  window.onbeforeunload = function(){
    if(edited){
      return confirm("You have unsaved changes. Are you sure you want to leave this tab?");
    }
  }
});

function autoSave(){
  //console.log("autosave rolling");
  setTimeout(function(){
    if(edited){
      saveChoreo();
      edited = false;
      //console.log("saving this choreo");
    }
    autoSave(); //ooh, recursion!
  }, 10000); //10000 is 10 seconds //120000 is two minutes tagHere
}

function selectAll(){
  $(".perfDots").addClass("dotSelected");
  $(".perfList").addClass("listElementHighlight");
  selected = [];
  for(var i = 0; i<performers.length; i++){
    selected.push(i);
  }
}

function tryUpdate(time){
  if(checkTimecode(time)>0){
    audioElement.currentTime = checkTimecode(time);
  }
}
