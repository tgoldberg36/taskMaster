
var taskMaster = {
  signal: {
    add: 'ADD',
    clear: 'CLEAR'
  }
}

var makeSignaller = function() {
  var _subscribers = [];

  return {
    add: function(handlerFunction) { _subscribers.push(handlerFunction); },

    notify: function(args) {
      for (var i = 0; i < _subscribers.length; i++) {
        _subscribers[i](args);
      }
    }
  };
}

var makeModel = function() {
  var _taskList = [];
  var _observers = makeSignaller();

  return {
    addTask: function(task){
      if(task.length > 0) {
        _taskList.unshift({"task":task, "time": getTime(), "complete": false});
        _observers.notify();
      }else{
        alert("Please input a task before selecting Add Task button");
      }
    },
    getTasks : function() { return _taskList;},
    register: function(fxn) { _observers.add(fxn);}
  };
}

var addControlBtn = function(model, txtId, btnId) {
  var _txt = document.getElementById(txtId);
  var _btn = document.getElementById(btnId);
  var _observers = makeSignaller();

  _btn.addEventListener('click',function(){
    _observers.notify({
      type: taskMaster.signal.add,
      value: _txt.value
    });
  });

  return {
    render: function() {
      _txt.value = "";
    },

    register: function(fxn) { _observers.add(fxn); }
  };

}


var taskView = function(model, listId) {
  var _list = document.getElementById(listId);
  var _observers = makeSignaller();

  var _addTasks = function(task,num) {
    console.log(task);
    var newDiv = document.createElement('div');
    var newSpan = document.createElement('span');
    newSpan.append(document.createTextNode(task.task));
    newDiv.setAttribute("class","taskDiv");
    newSpan.setAttribute("class","taskItem");
    var time = task.time;
    var timeNode = document.createElement("span");
    timeNode.setAttribute("class","timeFormat");
    timeNode.append(time);
    newSpan.append(timeNode);
    newDiv.append(newSpan);
    _list.append(newDiv);
  }

  return {
    render: function() {
      while(_list.firstChild) {
        _list.removeChild(_list.firstChild);
      }

      var tasks = model.getTasks();
      for(var i = 0; i < tasks.length; i++){
        _addTasks(tasks[i],i);
      }
    },

    register: function(fxn) {_observers.add(fxn); }
  };
}


var makeController = function(model) {
  return {
    dispatch: function(event){
      switch(event.type) {
        case taskMaster.signal.add:
          model.addTask(event.value);
          break;
        default:
          console.log('Unknown Event Type: ', event);
      }
    }
  };
}

var getTime = function(){
    var d = new Date(); 
    d = d.toString().slice(0,21);
    return d;
}

document.addEventListener("DOMContentLoaded", function(event){
  var model = makeModel();
  var view = taskView(model, 'taskList');
  var addControl = addControlBtn(model,'addTxt','addBtn');
  var controller = makeController(model);

  model.register(view.render);
  model.register(addControl.render);

  view.register(controller.dispatch);
  addControl.register(controller.dispatch);
});
