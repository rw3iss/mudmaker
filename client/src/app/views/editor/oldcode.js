



app.controller.AreaEditorController = function($scope, $location) {
	$(document).ready(function() {
		//Resizable layout panels
		var rpanel = $("#rooms-panel");
		var rprops = $("#room-properties");

		rpanel.resizable( {
			handles: "e",
			resize: function(event, ui) {
	            rprops.css("left", rpanel.width());
        	}
        });

		rprops.resizable( {
			handles: "n",
			resize: function(event, ui) {
	            rprops.css("position", "absolute");
	            rprops.css("bottom", "0px");
	            rprops.css("top", "");
        	}
		});

		$scope.canvas = $('#area-canvas');
		$scope.cContext = $scope.canvas[0].getContext('2d');

		//Clickable center area/room gui
		$scope.canvas.click(function(event) {
			if($scope.areaData == null)
				return;

			var totalOffsetX = 0;
		    var totalOffsetY = 0;
		    var canvasX = 0;
		    var canvasY = 0;
		    var currentElement = this;

		    do {
		        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
		        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
		    }
		    while(currentElement = currentElement.offsetParent)

		    canvasX = event.pageX - totalOffsetX;
		    canvasY = event.pageY - totalOffsetY;

		    if(event.which == 2) {
		    	//stop drag?
		    	$scope.dragEnd();
		    	return;
		    }

		 	$scope.canvasClick(canvasX, canvasY, event);
		});
	});

	//scroll events for zoom
	$scope.canvas.on('mousewheel', function(event) {
		$scope.zoom(event.deltaY);
	});

	//scroll events for zoom
	$scope.canvas.on('mousemove', function(event) {
		if($scope.draggingCanvas) {
			$scope.dragCanvas(event);
		}
	});	

	$scope.canvas.mousedown(function(e){
	    switch(e.which)
	    {
	        case 1:
	            console.log("LEFT");
	            //left Click
	        break;
	        case 2:
	            console.log("MIDDLE", e);
	            event.preventDefault();
	            $scope.draggingCanvas = true;
	        break;
	        case 3:
	            console.log("RIGHT");
	            event.preventDefault();
	            //right Click
	        break;
	    }
	    return true;// to allow the browser to know that we handled it.
	});

	//set canvas size
	var ww = $(window).width();
	var wh = $(window).height();

	$scope.canvas.attr('width', ww);
	$scope.canvas.attr('height', wh)

	$(window).resize(function() {
		var ww = $(window).width();
		var wh = $(window).height();

		$scope.canvas.attr('width', ww);
		$scope.canvas.attr('height', wh)
		console.log("RESIZE");

		$scope.renderAll();
	});

	//check local storage enabled
    if (!store.enabled) {
        alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.')
    }

    console.log("Controller load");

	angular.extend($scope, {
		baseRoomSize: 20,
		baseGridSize: 30,
		gridZoomSize: 1,
		gridZoomPercentage: 100,
		selectedRooms: [],
		editingRoom: null,
		areaData: null,
		draggingCanvas: false, //true when we start a drag
		previousDragEvent: null,
		newAreaName: "",

		startNewArea: function() {
			if ($scope.newAreaName == "") {
				alert("Please enter a name for the area.");
			} else {
				$scope.areaData = {
					name: $scope.newAreaName,
					rooms: []
				}
			}
		},

		zoom: function(delta) {
			/*
			delta = delta*.1;
			$scope.gridZoomSize += delta;
			$scope.gridZoomPercentage = Math.floor($scope.gridZoomSize * 100);
			$scope.renderAll();
			$scope.$apply();
			*/
		},

		canvasClick: function(x, y, event) {
			if(event.which == 2)
				return; //middle button, ignore

		    if(event.ctrlKey == true) {
		    	$scope.removeRoom(x, y);
		    	return;
		    };

			//find the closest grid point to the click:
			var gridCoords = $scope.findGridPoint(x, y);

			var existingRoom = $scope.roomAtClick(gridCoords.x, gridCoords.y);
			if (existingRoom != null) {
				$scope.selectRoom(existingRoom, event, true);
			} else {
				$scope.addRoom(gridCoords.x, gridCoords.y, event);
				if($scope.areaData.rooms.length == 0) {
					//store our first room so we can create a grid relative to that:
				}
			}
		},

		selectRoom: function(room, event, fromCanvas) {
			console.log("SELECT", room, event);

			var addToSelection = false;

			if(typeof event != 'undefined') {
				event.preventDefault();
				addToSelection = event.shiftKey;
			}

			if(typeof fromCanvas == 'undefined')
				fromCanvas = false;

			if(!addToSelection) {
				$scope.clearSelection();
			}

			$scope.selectedRooms.push(room);
			room.selected = true;
			$scope.editingRoom = room;

			$scope.renderAll();

			if(fromCanvas) {
				$scope.$apply();
			}

			//TODO: load room properties
		},

		clearSelection: function() {
			$scope.selectedRooms = [];

			for(var i in $scope.areaData.rooms) {
				var r =  $scope.areaData.rooms[i];
				r.selected = false;
			}
		},

		addRoom: function(x, y, event) {	
			$scope.clearSelection();

			//find the closest grid point to the click:
			var room = new Room(x, y, ++$scope.areaData.lastRoomID);

			$scope.areaData.rooms.push(room);

			//select the new room
			$scope.selectRoom(room, event, true);

			$scope.$apply();
		},

		removeRoom: function(x, y) {
			for(var i in $scope.areaData.rooms) {
				var r =  $scope.areaData.rooms[i];

				if( (x > r.x-$scope.baseRoomSize/2 && x < r.x+$scope.baseRoomSize) && (y > r.y-$scope.baseRoomSize/2 && y < r.y+$scope.baseRoomSize) ) {
					$scope.areaData.rooms.splice(i, 1);
				}
			}

			$scope.renderAll();
			$scope.$apply();
		},

		findGridPoint: function(x, y) {
			var gridResolution = $scope.baseGridSize*$scope.gridZoomSize; //pixels per room
			var tx = x % gridResolution;
			var ty = y % gridResolution;
			var rx = 0; //result x
			var ry = 0; //result y

			if (tx < gridResolution / 2) {
				//round down
				rx = Math.floor(x / gridResolution) * gridResolution;
			} else {
				//round up
				rx = Math.ceil(x / gridResolution) * gridResolution;
			}

			if (ty < gridResolution / 2) {
				//round down
				ry = Math.floor(y / gridResolution) * gridResolution;
			} else {
				//round up
				ry = Math.ceil(y / gridResolution) * gridResolution;
			}

			return { x: rx, y: ry }
		},

		roomAtClick: function(x, y) {
			for(var i in $scope.areaData.rooms) {
				var r =  $scope.areaData.rooms[i];

				if( (x > r.x-$scope.baseRoomSize/2 && x < r.x+$scope.baseRoomSize) && (y > r.y-$scope.baseRoomSize/2 && y < r.y+$scope.baseRoomSize) ) {
					r.selected = true;
					return r;	
				}
			}

			return null;
		},

		//iterates through rooms and such and draws everything
		renderAll: function() {
			$scope.clearCanvas();

			for(var i in $scope.areaData.rooms) {
				var r =  $scope.areaData.rooms[i];
				console.log(r);

				var color = '#B5B07F';
				var width = $scope.baseRoomSize * $scope.gridZoomSize;

				//draw exits first so room block covers them
				$scope.drawRoomExits(r);

				if(r.selected == true) {
					color = "#FFD04F";

					$('canvas').drawRect({
					  fillStyle: "#B0DAFF",
					  x: r.x, y: r.y,
					  width: width+2*$scope.gridZoomSize,
					  height: width+2*$scope.gridZoomSize
					});

					$('canvas').drawRect({
					  fillStyle: color,
					  x: r.x, y: r.y,
					  width: width,
					  height: width
					});
				} else {
					$('canvas').drawRect({
					  fillStyle: "#112",
					  x: r.x+1, y: r.y+1,
					  width: width+2*$scope.gridZoomSize,
					  height: width+2*$scope.gridZoomSize
					});

					$('canvas').drawRect({
					  fillStyle: color,
					  x: r.x, y: r.y,
					  width: width,
					  height: width
					});
				}
			}
		},

		drawRoomExits: function(room) {
			for(var i in room.exits) {
				var e = room.exits[i];
				switch(e) {
					case 'n':
						$scope.canvas.drawLine({
						  strokeStyle: '#fff',
						  strokeWidth: 1,
						  x1: room.x, y1: room.y,
						  x2: room.x, y2: room.y-$scope.baseRoomSize * $scope.gridZoomSize
						});
						break;
					case 's':
						$scope.canvas.drawLine({
						  strokeStyle: '#fff',
						  strokeWidth: 1,
						  x1: room.x, y1: room.y,
						  x2: room.x, y2: room.y+$scope.baseRoomSize * $scope.gridZoomSize
						});
						break;
					case 'e':
						$scope.canvas.drawLine({
						  strokeStyle: '#fff',
						  strokeWidth: 1,
						  x1: room.x, y1: room.y,
						  x2: room.x+$scope.baseRoomSize, y2: room.y
						});
						break;
					case 'w':
						$scope.canvas.drawLine({
						  strokeStyle: '#fff',
						  strokeWidth: 1,
						  x1: room.x, y1: room.y,
						  x2: room.x-$scope.baseRoomSize, y2: room.y
						});
						break;
					case 'nw':
						$scope.canvas.drawLine({
						  strokeStyle: '#eef',
						  strokeWidth: 1,
						  x1: room.x, y1: room.y,
						  x2: room.x-$scope.baseRoomSize * $scope.gridZoomSize, y2: room.y-$scope.baseRoomSize * $scope.gridZoomSize
						});
						break;
					case 'ne':
						$scope.canvas.drawLine({
						  strokeStyle: '#eef',
						  strokeWidth: 1,
						  x1: room.x, y1: room.y,
						  x2: room.x+$scope.baseRoomSize * $scope.gridZoomSize, y2: room.y-$scope.baseRoomSize * $scope.gridZoomSize
						});
						break;
					case 'sw':
						$scope.canvas.drawLine({
						  strokeStyle: '#eef',
						  strokeWidth: 1,
						  x1: room.x, y1: room.y,
						  x2: room.x-$scope.baseRoomSize * $scope.gridZoomSize, y2: room.y+$scope.baseRoomSize * $scope.gridZoomSize
						});
						break;
					case 'se':
						$scope.canvas.drawLine({
						  strokeStyle: '#eef',
						  strokeWidth: 1,
						  x1: room.x, y1: room.y,
						  x2: room.x+$scope.baseRoomSize * $scope.gridZoomSize, y2: room.y+$scope.baseRoomSize * $scope.gridZoomSize
						});
						break;
				}
			}
		},

		clearCanvas: function() {
			var ctx = $scope.cContext;

			ctx.save();
			ctx.setTransform(1,0,0,1,0,0);
			ctx.clearRect(0,0,$scope.canvas[0].width,$scope.canvas[0].height);
			ctx.restore();
		},

		toggleExitSelection: function(exit) {   
			var idx = $scope.editingRoom.exits.indexOf(exit);

		    // is currently selected
		    if (idx > -1) {
		      $scope.editingRoom.exits.splice(idx, 1);
		    }

		    // is newly selected
		    else {
		      $scope.editingRoom.exits.push(exit);
		    }

		    $scope.renderAll();
		},

		saveArea: function() {
			console.log("SAVE AREA");
		
			localStorage["mudArea"] = JSON.stringify($scope.areaData);
			
			$scope.statusUpdate("Area saved.");
		},

		loadArea: function() {
			alert('load');
			var data = JSON.parse(localStorage["mudArea"]);
			$scope.areaData = data;
			$scope.selectRoom($scope.areaData.rooms[0]);

			$scope.renderAll();

			$scope.statusUpdate("Area loaded.");
		},

		dragCanvas: function(e) {
			if ($scope.previousDragEvent != null) {
				//find delta and move all rooms by delta
				var deltaX = e.clientX - $scope.previousDragEvent.clientX;
				var deltaY = e.clientY - $scope.previousDragEvent.clientY;

				for(var i in $scope.areaData.rooms) {

					var r =  $scope.areaData.rooms[i];
					r.x += deltaX;
					r.y += deltaY;
				}
			}

			$scope.renderAll();

			$scope.previousDragEvent = e;
		},

		dragEnd: function() {
			$scope.draggingCanvas = false;

			//fix all rooms to grid:
			for(var i in $scope.areaData.rooms) {
				var r =  $scope.areaData.rooms[i];

				var gridCoords = $scope.findGridPoint(r.x, r.y);
				r.x = gridCoords.x;
				r.y = gridCoords.y;
			}
					
			$scope.renderAll();
		},

		statusUpdate: function(msg) {
			var su = $("#status-update").css('display', 'block').text(msg).fadeIn(0);
			su.animate({backgroundColor: '#C9B16B',opacity:1}, 100, 'swing', function() {
				su.animate({backgroundColor: '#9C8B5A'}, 1000, 'swing', function() {
					setTimeout(function() {
						su.fadeOut(2500);
					}, 500);
				});
			});
		},

		addNewObject: function(room) {
			var o = new RoomObject();
			o.aliases = "Aliases";
			o.longDesc = "Long";
			o.editing = true;

			//TODO: remove later when data is clean
			if(typeof room.objects == 'undefined') {
				room.objects = [];
			}

			room.objects.push(o);
		},

		removeObject: function(o) {
			for(var i in $scope.editingRoom.objects) {
				var co =  $scope.editingRoom.objects[i];
				if( o == co ) {
					$scope.editingRoom.objects.splice(i, 1);
				}
			}
		},

		addNewItem: function(room) {
			var o = new RoomItem();
			o.aliases = "Aliases";
			o.shortDesc = "Short";
			o.longDesc = "Long";
			o.editing = true;

			//TODO: remove later when data is clean
			if(typeof room.items == 'undefined') {
				room.items = [];
			}

			room.items.push(o);
		},

		removeItem: function(o) {
			for(var i in $scope.editingRoom.items) {
				var co =  $scope.editingRoom.items[i];
				if( o == co ) {
					$scope.editingRoom.items.splice(i, 1);
				}
			}
		},

		addNewNpc: function(room) {
			var o = new RoomNpc();
			o.aliases = "Aliases";
			o.name = "Name";
			o.shortDesc = "Short";
			o.longDesc = "Long";
			o.editing = true;

			//TODO: remove later when data is clean
			if(typeof room.npcs == 'undefined') {
				room.npcs = [];
			}

			room.npcs.push(o);
		},

		removeNpc: function(o) {
			for(var i in $scope.editingRoom.npcs) {
				var co =  $scope.editingRoom.npcs[i];
				if( o == co ) {
					$scope.editingRoom.npcs.splice(i, 1);
				}
			}
		}
	});

	
};

var Room = function(x, y, id) {
	var r = {
		id: id,
		x: x,
		y: y,
		size: 1,
		selected: false,
		filename: "",
		shortDesc: "Short",
		longDesc: "Long",
		exits: [],
		objects: [],
		items: [],
		npcs: []
	}

	return r;
}

var RoomObject = function() {
	var o = {
		id: 0,
		aliases: "",
		longDesc: "",
		editing: false
	};

	return o;
};

var RoomItem = function() {
	var o = {
		id: 0,
		aliases: "",
		shortDesc: "",
		longDesc: "",
		editing: false
	};

	return o;
};

var RoomNpc = function() {
	var o = {
		id: 0,
		aliases: "",
		name: "",
		shortDesc: "",
		longDesc: "",
		editing: false
	};

	return o;
};

//For top nav
app.controller.NavController = function($rootScope, $scope, $location, Utility) {
	var self = this;
	self.sectionContent = $('#section-content');
	
	angular.extend($scope, {
		loadSection: function(el) {
			var id = el.attr('href').replace('#/','');
			$rootScope.activeSection = id;
		}
	});
};


app.controller.ServiceController = function($scope) {
	angular.extend($scope, {
		search: function() {
			alert('search');
		}
	});
};
