var client = null;
var name = "User n°" + Math.floor(Math.random() * 10000);

var codes = { "hello.py" : "" };

function connect() {
    if (client)
	return;	// already connected
   
    client = io();
    
    var runNumber = 0;
    
    // interpret python code
    client.on('interpreted', function(chanels) {
        if(runNumber > 0) {
            $("#interpreter-output").append("<div class=\"horizontal-divider\"></div>");
        }
          
        var errors = (chanels.error != null);
        if(errors) {
            $("#interpreter-output").append("<div class=\"errors-output\">"+chanels.stderr.trim()+"</div>")
        }
        
        if(chanels.stdout) {
            if(errors) { $('#interpreter-output').append("<br></br>"); }
            $('#interpreter-output').append("<div class=\"run-output\">"+chanels.stdout+"</div>");
        }

        $("#interpreter-panel").animate({ scrollTop: $('#interpreter-panel')[0].scrollHeight}, 1000);

        runNumber++;
    });

    // update chat and clients number
    client.on("update", function(data) {
        var text = "";
        for(index = 0; index < data.oldMessages.length; index++) {
            text += data.oldMessages[index] + "<br/>";
        }

        $("#chat-discussion").append("<p class=\"old-messages\">" + text + "</p>");
        $("#chat-discussion").animate({ scrollTop: $('#chat-discussion')[0].scrollHeight}, 1000);

        updateClientNumber(data.clientsConnected);
    });

    // client connection
    client.on("connection", function(clientsConnected) {
        $("#chat-discussion").append("<p class=\"new-connection\">A new user has connected.</p>");
        $("#chat-discussion").animate({ scrollTop: $('#chat-discussion')[0].scrollHeight}, 1000);

        updateClientNumber(clientsConnected);
    });

    // client disconnection
    client.on("disconnection", function(data) {
        $("#chat-discussion").append("<p class=\"disconnection\">" + data.name + " has disconnected.</p>");
        $("#chat-discussion").animate({ scrollTop: $('#chat-discussion')[0].scrollHeight}, 1000);

        updateClientNumber(data.clientsConnected);
    });

    // chat message
    client.on("message", function(data) {
        $("#chat-discussion").append("<p>" + data.from + " : " + data.msg + "</p>");
        $("#chat-discussion").animate({ scrollTop: $('#chat-discussion')[0].scrollHeight}, 1000);
    });

    // create a new file
    client.on("new_file", function(filename) {
        createFile(filename);
    });
    
    // switch file
    client.on("focus_file", function(filename) {
        $(".file.current").removeClass("current");
        
        $("#"+filename).addClass("current");
    });
    
    // set the value of the ace editor (file change)
    client.on("update_editor", function(code) {
        editor.setValue(code);
    });

    // delete selected file
    client.on('delete_file', function(filename) {
        $('#'+filename).remove();
    });

    // rename a file
    client.on('rename_file', function(names) {
        $('#'+names.oldName).text(names.newName);
        $('#'+names.oldName).attr('id', names.newName);
    });

    // collaborative editing
    // Open the 'hello' document, which should have type 'text':
    sharejs.open('code', 'text', function(error, doc) {
        doc.attach_ace(editor);
    });
}

// Send a message
function runCode() {
    if (client) {
      	client.emit('run', editor.getValue());
    } else {
        alert("You are not connected yet !");
    }
}


function updateClientNumber(number) {
    var text = number+" user" + ((number > 1)?"s":"") + "<br/>connected";
    $('#users-connections').css("left", '-' + (9*10 + 2) + "px");
    $('#users-connections').html(text);
}


// add a new file in the list
function createFile(filename) {
    var li = $("<li id=\""+filename+"\" class=\"file\">"+filename+"</li>").insertBefore("#add-file");
    
    // switch to another file
    li.click(function() {
        client.emit("select_file", { filename: $(this).text(), oldCode: editor.getValue() });
    });

    var fileItem = $('#'+filename);
    
    var menu = 
        [{
            name: 'rename',
            // img: 'images/create.png',
            fun: function () {
                fileItem.html('<input id="rename-input"></input>');

                var input = $('#rename-input');
                input.keypress(function(event) {
                    if(event.which == 0) {
                        input.remove();
                        fileItem.text(fileItem.attr('id'));
                    } else if(event.which == 13) {
                        client.emit('rename', { oldName: fileItem.attr('id'), newName: input.val().trim() });
                        input.remove();
                    }
                });
                input.focus();
            }  
        }, 
        {
            name: 'delete',
            // img: 'images/create.png',
            fun: function () {
                if(confirm("Do you want to delete " + filename + " file ?")) {
                    client.emit('delete', filename);
                }
            }
        }]

    li.contextMenu("menu", menu, { triggerOn: 'contextmenu', mouseClick: 'right' });
}



$(document).ready(function() {
    
    connect();
    
    // chat events
    $(window).bind('beforeunload', function(){
        client.emit("disconnection", name);
    });

    
    $("#chat-form").submit(function() {
        var message = $("#chat-text-input").val();
        
        client.emit('message', { from: name, msg: message });
        
        $("#chat-discussion").append("<p class=\"owner-message\">You : " +  message + "</p>");
        $("#chat-discussion").animate({ scrollTop: $('#chat-discussion')[0].scrollHeight}, 1000);
        
        $("#chat-text-input").val("");
        
        return false;
    });
  

    // run program
    $("#run-btn").click(function() {
        runCode();
    });


    // panels resize
    $("#resize-anchor").mousedown(function(event) {
        var widthLimit = 250;
        
        var initX = event.screenX;
        
        var editWidth = $('#editor').width();
        var btnLeft = parseFloat($('#run-btn').css('left'));
        var anchorLeft = parseFloat($('#anchor-bounds').css('left'));
        var interpreterLeft = parseFloat($('#interpreter-panel').css('left'));
        var interpreterWidth = $('#interpreter-panel').width();
        
        $(window).mousemove(function(event) {
            var deltaX = (event.screenX - initX);
            
            if(editWidth + deltaX > widthLimit && interpreterWidth - deltaX > widthLimit) {
                $('#editor').width(editWidth + deltaX); 
                $('#run-btn').css('left', (btnLeft + deltaX) + "px");
                $('#anchor-bounds').css('left', (anchorLeft + deltaX) + "px");
                $('#interpreter-panel').css('left', (interpreterLeft + deltaX) + "px");
                $('#interpreter-panel').width(interpreterWidth - deltaX);
            }
        });
    });

    $(window).mouseup(function() {
        $(window).unbind("mousemove");
    });

    
    // files management
    $("#add-file").click(function() {
        client.emit("create_file");
    });
});


function bindInfoPanel(parent, covering, text) {
    $('#'+parent).append("<div id='info-"+covering+"' class='info-panel' style=\"" +
                                "left:" + $('#'+covering).css('left') + "; "+ 
                                "top: " + $('#'+covering).css('top') + "; "+
                                "\"><p>"+text+"</p></div>");

    // panel hide everything beneath it
    var panel = $('#info-'+covering);

    panel.width($('#'+covering).width());
    panel.height($('#'+covering).height());

    // center text
    var p = panel.find("p");
    p.css("line-height", panel.css("height"));
    
    panel.hover(function() {
        $(this).animate({ opacity:0 }, 1000, function() {
            $(this).css('display', 'none');
            $(this).unbind("hover");
        });
    });
}

$(window).ready(function() {
    bindInfoPanel("top-main-panel", "editor", "Write your code here"); 

    bindInfoPanel("top-main-panel", "interpreter-panel", "Interprete your Python code");

    bindInfoPanel("bottom-main-panel", "chat-panel", "Chat with other users");
});
