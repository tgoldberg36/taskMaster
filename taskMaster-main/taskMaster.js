
var taskMaster = {
  signal: {
    add: 'ADD',
    clear: 'CLEAR',
    doneTask: 'DONETASK',
    findCity: 'FINDING',
    penSelec: 'PENSELEC',
    deleteTask: 'DELETETASK'
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
  var _fontColor = "black";
  var _weatherData;
  var _observers = makeSignaller();

  return {
    addTask: function(task){
      if(task.length > 0) {
        _taskList.unshift({"task":task, "time": getTime(), "complete": false, "color": _fontColor});
        _observers.notify();
      }else{
        alert("Please input a task before selecting Add Task button");
      }
    },

    clearTasks: function(){
      _taskList = [];
      _observers.notify();
    },

    doneTask: function(task){
      console.log(task);
      var index = _taskList.indexOf(task);
      console.log(index);
      if(_taskList[index].complete == true){
        _taskList[index].complete = false;
      }else{
        _taskList[index].complete = true;
      }
      _observers.notify();

    },

    findCity: function(city){
      const apiKey = "6ff56b0ba014487dd1c2d7dded3688e4";
      const cityVal = city;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityVal}&appid=${apiKey}&units=metric`;
      const data = fetchData(url);
      _weatherData = data;
      _observers.notify();
    },

    getCityData: function(){
      return _weatherData;
    },

    penSelec: function(color){
      _fontColor = color;
      _observers.notify();
    },

    deleteTask: function(task){
      var index = _taskList.indexOf(task);
      if (index > -1) {
        _taskList.splice(index, 1);
      }     
      _observers.notify();
    },

    getColor : function(){
      return _fontColor;
    },

    getTasks : function() { 
      return _taskList;
    },

    register: function(fxn) { _observers.add(fxn);}
  };
}

var fetchData = async function(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin'
    });
    const _wData = await response.json();
      return _wData;
  } catch (error) {
    console.error(error);
  }
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

var penSelecBtn = function(btnId){
  var _btn = document.getElementById(btnId);
  var _observers = makeSignaller();

  _btn.addEventListener('click', function() {
    _observers.notify({
      type: taskMaster.signal.penSelec,
      value: _btn.value
    });
  });
  return {
    register: function(fxn) { _observers.add(fxn);}
  }
}

var clearControlBtn = function(btnId) {
  var _btn = document.getElementById(btnId);
  var _observers = makeSignaller();

  _btn.addEventListener('click',function() {
    _observers.notify({
      type: taskMaster.signal.clear
    });
  });

  return {
    register: function(fxn) { _observers.add(fxn);}
  }
}

// creates the button listening event for searching for a city
var findCity = function(model,btnId,textId){
  var _btn = document.getElementById(btnId);
  var _wData = document.getElementById(textId);
  var _observers = makeSignaller();
  _btn.addEventListener('click',function() {
    _observers.notify({
      type: taskMaster.signal.findCity,
      value: _wData.value
    });
  });

  return {
    register: function(fxn) { _observers.add(fxn);}
  }
}

var searchControlBtn = function(btnId) {
  var _btn = document.getElementById(btnId);
  var _observers = makeSignaller();

  _btn.addEventListener('click',function(){
    _observers.notify({
      type: taskMaster.signal.findCity
    });
  });
}


var taskView = function(model, listId) {
  var _list = document.getElementById(listId);
  var _observers = makeSignaller();

  var _addTasks = function(task,num,color) {
    //console.log(task);
    var newDiv = document.createElement('div');
    var newSpan = document.createElement('span');
    var color = color;
    console.log(color);

    newSpan.append(document.createTextNode(task.task));

    if(task.complete == false){
      newDiv.setAttribute("class","taskDiv");
    }else{
      newDiv.setAttribute("class","taskDiv crossOut");
    }
    
    newSpan.setAttribute("class",task.color);
    
    // adds time each task was written
    var time = task.time;
    var timeNode = document.createElement("span");
    timeNode.setAttribute("class","timeFormat");
    timeNode.append(time);
    newSpan.append(timeNode);

    newDiv.append(newSpan);

    var xBtn = document.createElement('button');
    xBtn.setAttribute("class","xBtn");
    xBtn.innerHTML = "X";
    newDiv.append(xBtn);

    _list.append(newDiv);

    newSpan.addEventListener('click',function() {
      _observers.notify({
        type: taskMaster.signal.doneTask,
        value: task
      });
    });

    xBtn.addEventListener('click', function() {
      _observers.notify({
        type: taskMaster.signal.deleteTask,
        value: task
      });
    });
  }

  return {
    render: function() {
      while(_list.firstChild) {
        _list.removeChild(_list.firstChild);
      }

      var tasks = model.getTasks();
      var color = model.getColor();
      for(var i = 0; i < tasks.length; i++){
        _addTasks(tasks[i],i,color);
      }
    },

    register: function(fxn) {_observers.add(fxn); }
  };
}


var weatherView = function(model, wView) {
  var _weatherDiv = document.getElementById(wView);
  var _cityList = document.getElementById('cities');
  var _observers = makeSignaller();

  var _addCityData = function(wData){
    wData.then(data => {
      console.log(data);
      document.getElementById('cities').innerHTML = "";
      const { main, name, sys, weather } = data;
      console.log(_cityList);
          const icon = getIcon(weather[0]);
          const li = document.createElement("span");

          const markup = `
            <h2 class="city-name" data-name="${name},${sys.country}">
              <span>${name}</span>
              <sup>${sys.country}</sup>
            </h2>
            <div class="city-temp">${Math.round(main.temp * (9/5) + 32)}<sup>°F</sup></div>
            <div class = "cityWeather">${weather[0]["description"]}</div>
            `;
            var figure = document.createElement('figure');
            var image = document.createElement('img');
            image = icon;
            figure.appendChild(image);
            li.innerHTML = markup;
            _cityList.appendChild(li);
            _cityList.appendChild(image);
    }, otherwise => {
      console.error(otherwise); 
    });
  };
  return {
      render: function() {
        var weatherData = model.getCityData();
        _addCityData(weatherData);
      },
      register: function(fxn) {_observers.add(fxn); }
    };
}


var getIcon = function(weather){
  var rain = new Image;
  rain.src = "rain.gif";
  var clouds = new Image;
  clouds.src = "cloudy.gif";
  var clear = new Image; 
  clear.src = "dayClear.gif";
  var foggy = new Image;
  foggy.src = "foggy.gif";
  var snow = new Image;
  snow.src = "snow.gif";
  var thunder = new Image;
  thunder.src = "thunder.gif";

  if(weather["main"].includes("rain")){
    return rain;
  }
  if(weather["description"].includes("snow")){
    return snow;
  }
  if(weather["description"].includes("clear")){
    return clear;
  }
  if(weather["description"].includes("fog")){
    return foggy;
  }
  if(weather["description"].includes("thunder")){
    return thunder;
  }
  if(weather["description"].includes("clouds")){
    return clouds;
  }
  return clear;
}

var makeController = function(model) {
  return {
    dispatch: function(event){
      switch(event.type) {
        case taskMaster.signal.add:
          model.addTask(event.value);
          break;
        case taskMaster.signal.clear:
          model.clearTasks();
          break;
        case taskMaster.signal.doneTask:
          model.doneTask(event.value);
          break;
        case taskMaster.signal.findCity:
          model.findCity(event.value);
          break;
        case taskMaster.signal.penSelec:
          model.penSelec(event.value);
          break;
        case taskMaster.signal.deleteTask:
          model.deleteTask(event.value);
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
  var wView = weatherView(model,'weatherAjax');
  var addControl = addControlBtn(model,'addTxt','addBtn');
  var clearBtn = clearControlBtn('clearBtn');
  var cityBtn = findCity(model,'searchBtn','cityInput');
  var blackBtn = penSelecBtn('black');
  var redBtn = penSelecBtn('red');
  var blueBtn = penSelecBtn('blue');
  var controller = makeController(model);


  model.register(view.render);
  model.register(wView.render);
  model.register(addControl.render);

  wView.register(controller.dispatch);
  view.register(controller.dispatch);


  addControl.register(controller.dispatch);
  clearBtn.register(controller.dispatch);
  blackBtn.register(controller.dispatch);
  redBtn.register(controller.dispatch);
  blueBtn.register(controller.dispatch);
  cityBtn.register(controller.dispatch);
});