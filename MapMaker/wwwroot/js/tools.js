var writingText = false;
var shifted = false;
var layerData = [[],[],[],[],[],[],[],[],[],[]];
var layerSizes = [[1000, 0], [], [], [], [], [], [], [], [], []];
var selectedPath = null;

paper.install(window);

window.onload = function () {
    var canvas = document.getElementById('mainCanvas');

    paper.setup(canvas);

    toolSelect = new Tool();
    toolSelect.activate();
    toolPan = new Tool();
    toolBrush = new Tool();
    toolBrush.fixedDistance = brushSize;
    toolEraser = new Tool();
    toolEraser.fixedDistance = eraserSize;
    toolLine = new Tool();
    toolText = new Tool();
    toolLandmass = new Tool();
    toolCity = new Tool();

    let myPath;
    let pathEnd = new Shape.Circle(new Point(-5, -5), brushSize);
    let text;
    let textBox;
    let cursorCircle = new Shape.Circle(new Point(-5, -5), brushSize);

    toolSelect.onMouseDown = function (event) {
        if (event.modifiers.shift) {
            for (let i = 0; i < layerData.length; i++)
                for (let j = 0; j < layerData[i].length; j++)
                    layerData[i][j].selected = false;
        }
    }

    toolSelect.onKeyDown = function (event) {
        if (event.key == 'backspace') {
            for (let i = 0; i < layerData.length; i++)
                for (let j = 0; j < layerData[i].length; j++)
                    if (layerData[i][j].selected) {
                        layerData[i][j].remove();
                        layerData[i].splice(j, 1);
                    }
                        
        }
    }

    toolPan.onMouseDrag = function (event) {
        let pan_offset = event.point.subtract(event.downPoint);
        let newCenter = paper.view.center.subtract(pan_offset);
        if (newCenter.x + (paper.view.size._width / 2) > canvas.width) {
            newCenter.x = canvas.width - (paper.view.size._width / 2);
        }
        else if (newCenter.x - (paper.view.size._width / 2) < 0) {
            newCenter.x = paper.view.size._width / 2;
        }
        if (newCenter.y + (paper.view.size._height / 2) > canvas.height) {
            newCenter.y = canvas.height - (paper.view.size._height / 2);
        }
        else if (newCenter.y - (paper.view.size._height / 2) < 0) {
            newCenter.y = paper.view.size._height / 2;
        }

        paper.view.center = newCenter;
    }

    toolBrush.onMouseDown = function (event) {
        cursorCircle.remove();
        toolBrush.fixedDistance = brushSize;
        myPath = new Path();
        myPath.fillColor = brushColor;
        myPath.strokeColor = brushColor;
        myPath.add(event.point);
    }
    toolBrush.onMouseDrag = function (event) {
        let step = event.delta;
        step.angle += 90;

        let top = event.middlePoint.add(step);
        let bottom = event.middlePoint.subtract(step);

        myPath.add(top);
        myPath.insert(0, bottom);
        myPath.smooth();
    }

    toolBrush.onMouseUp = function (event) {
        let thisPath = myPath;
        thisPath.onClick = function (e) { HandleClickEvent(e, thisPath) };
        AddToLayers(thisPath);
    }

    toolBrush.onMouseMove = function (event) {
        cursorCircle.remove();
        cursorCircle = new Shape.Circle(event.point, brushSize)
        cursorCircle.strokeColor = '#808080';
        cursorCircle.strokeWidth = 1;
    }

    toolEraser.onMouseDown = function (event) {
        toolEraser.fixedDistance = eraserSize;
        myPath = new Path();
        myPath.fillColor = backgroundColor;
        myPath.strokeColor = backgroundColor;
        myPath.add(event.point);
    }
    toolEraser.onMouseDrag = function (event) {
        cursorCircle.remove();
        cursorCircle = new Shape.Circle(event.point, eraserSize);
        cursorCircle.strokeColor = 'gray';
        cursorCircle.strokeWidth = 1;

        let step = event.delta;
        step.angle += 90;

        let top = event.middlePoint.add(step);
        let bottom = event.middlePoint.subtract(step);

        let line = new Path();
        line.strokeColor = backgroundColor;
        line.add(top);
        line.add(bottom);

        myPath.add(top);
        myPath.insert(0, bottom);
        myPath.smooth();
    }
    toolEraser.onMouseMove = function (event) {
        cursorCircle.remove();
        cursorCircle = new Shape.Circle(event.point, eraserSize);
        cursorCircle.strokeColor = 'gray';
        cursorCircle.strokeWidth = 1;
    }

    toolLine.onMouseDown = function (event) {
        myPath = new Path();
        myPath.strokeColor = lineColor;
        myPath.strokeWidth = lineSize;
        myPath.add(event.point, event.point);
    }
    toolLine.onMouseDrag = function (event) {
        myPath.lastSegment.point = event.point;
    }
    toolLine.onMouseUp = function (event) {
        let thisLine = myPath;
        thisLine.onClick = function (e) { HandleClickEvent(e, thisLine) }
        AddToLayers(thisLine);
    }

    toolCity.onMouseUp = function (event) {
        if (cityType == 'circle') {
            myPath = new Path.Circle({
                center: event.point,
                radius: citySize / 2
            });
        }
        else {
            myPath = new Path.Circle({
                center: event.point,
                radius: citySize / 2
            });
        }
        myPath.strokeColor = cityColor;
        myPath.fillColor = cityColor;

        let thisCity = myPath;
        thisCity.onClick = function (e) { HandleClickEvent(e, thisCity) };
        AddToLayers(thisCity);
    }
    toolCity.onMouseMove = function (event) {
        cursorCircle.remove();
        cursorCircle = new Shape.Circle(event.point, citySize / 2);
        cursorCircle.strokeColor = '#808080';
        cursorCircle.strokeWidth = 1;
    }

    toolText.onMouseDown = function (event) {
        if (writingText) {
            let thisText = text;

            thisText.onClick = function (e) { HandleClickEvent(e, thisText) }
            AddToLayers(thisText);
            writingText = false;
            textBox.remove();
        }
        else {
            writingText = true;
            text = new PointText(event.point);
            text.justification = 'center';
            text.fillColor = '@(Model.ColorPalette.TextColor)';
            text.content = '';
            text.fontFamily = textFont;
            text.fontSize = textSize;
            let textRect = new Rectangle(event.point.x - 40, event.point.y - 20, 80, 40);
            textBox = new Path.Rectangle(textRect);
            textBox.strokeColor = 'black';
            textBox.selected = true;
        }
    }
    toolText.onKeyDown = function (event) {
        if (event.key == 'shift')
            shifted = true;

        else if (writingText) {
            if (event.key == 'backspace')
                text.content = text.content.slice(0, -1);
            else {
                if (shifted)
                    text.content = text.content + event.key.replace('space', ' ').toUpperCase();
                else
                    text.content = text.content + event.key.replace('space', ' ');
            }
        }
    }
    toolText.onKeyUp = function (event) {
        if (event.key == 'shift')
            shifted = false;
    }

    toolLandmass.onMouseDown = function (event) {
        cursorCircle.remove();
        myPath = new Path();
        myPath.strokeColor = landmassColor;
        myPath.add(event.point);
    }
    toolLandmass.onMouseDrag = function (event) {
        myPath.add(event.point);
    }
    toolLandmass.onMouseUp = function (event) {
        myPath.smooth();
        myPath.fillColor = landmassColor;

        let thisPath = myPath;
        thisPath.onClick = function (e) { HandleClickEvent(e, thisPath) };
        AddToLayers(myPath);
    }
    toolLandmass.onMouseMove = function (event) {
        cursorCircle.remove();
        cursorCircle = new Shape.Circle(event.point, 3)
        cursorCircle.strokeColor = '#808080';
        cursorCircle.strokeWidth = 1;
    }
}

function AddToLayers(path) {
    let layerButtons = document.getElementsByClassName('layer-button');
    for (let i = 0; i < layerButtons.length; i++) {
        if (layerButtons[i].classList.contains('selected'))
            layerData[i].push(path);
    }
}

function ChangeLayer() {
    let selectedLayers = document.getElementsByClassName('layer-button selected')

    for (let i = 0; i < layerData.length; i++)
        for (let j = 0; j < layerData[i].length; j++)
            layerData[i][j].opacity = 0;

    for (let i = 0; i < selectedLayers.length; i++) {
        let currentLayer = layerData[parseInt(selectedLayers[i].id.replace('layer-', '')) - 1];
        for (let j = 0; j < currentLayer.length; j++)
            currentLayer[j].opacity = 1;
    }
}

function ZoomChangeLayer(layerIdx) {
    for (let i = 0; i < layerData.length; i++)
        for (let j = 0; j < layerData[i].length; j++)
            layerData[i][j].opacity = 0;

    let currentLayer = layerData[layerIdx];
    for (let j = 0; j < currentLayer.length; j++)
        currentLayer[j].opacity = 1;
}

function GetLayerFromZoom(zoomLevel) {
    for (let i = 0; i < layerSizes.length; i++) {
        if (zoomLevel <= Math.max(...layerSizes[i]) && zoomLevel >= Math.min(...layerSizes[i]))
            return i;
    }

    return 0;
}

function AddNewLayer(count) {
    for (let i = 0; i < count; i++) {
        let minZoom = Math.floor((1000 / count) * i);
        let maxZoom = Math.floor(((1000 / count) * i) + (1000 / count) - 1);
        if (i == count - 1)
            maxZoom = 1000;
        layerSizes[i] = [minZoom, maxZoom];
    }
}

function HandleClickEvent(e, path) {
    for (let i = 0; i < layerData.length; i++)
        for (let j = 0; j < layerData[i].length; j++)
            layerData[i][j].selected = false;

    if (path != null && toolSelect.isActive()) {
        path.selected = true;
        selectedPath = path;
    }
}