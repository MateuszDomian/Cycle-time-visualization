const sidebar = document.querySelector('.sidebar');
const arrow = document.querySelector('.arrow');
const title = document.querySelector('.title');
const sidebarRows = document.querySelector('.actionNamesRowsContainer')
document.querySelector('#toggleSidebarBtn').onclick = function () {
    sidebar.classList.toggle('sidebarSmall');
    arrow.classList.toggle('arrowTransform');
    title.classList.toggle('hideText');
    sidebarRows.classList.toggle('hideText');
}

function zoomIn() {
    let zoomRatio = Number(getComputedStyle(document.documentElement).getPropertyValue('--zoomRatio'));
    document.documentElement.style.setProperty('--zoomRatio', zoomRatio + 0.1);
    zoomRatio = Number(getComputedStyle(document.documentElement).getPropertyValue('--zoomRatio'));
    let widthBase = getComputedStyle(document.documentElement).getPropertyValue('--widthBase');
    document.documentElement.style.setProperty('--widthUnit', (widthBase * zoomRatio) + 'px');
}

function zoomOut() {
    let zoomRatio = Number(getComputedStyle(document.documentElement).getPropertyValue('--zoomRatio'));
    document.documentElement.style.setProperty('--zoomRatio', zoomRatio - 0.1);
    zoomRatio = Number(getComputedStyle(document.documentElement).getPropertyValue('--zoomRatio'));
    let widthBase = getComputedStyle(document.documentElement).getPropertyValue('--widthBase');
    document.documentElement.style.setProperty('--widthUnit', (widthBase * zoomRatio) + 'px');
}

function createActionRow() {
    //add div row
    const actionRowDiv = document.createElement('div');
    const divContainer = document.getElementById('actionRowsContainer');
    actionRowDiv.classList.add('actionNameRow');
    divContainer.appendChild(actionRowDiv);
    //add action name input
    const actionRowInputName = document.createElement('input');
    actionRowInputName.classList.add('actionNameInput');
    actionRowInputName.setAttribute('type', 'text');
    actionRowInputName.setAttribute('value', 'Action name');
    actionRowInputName.setAttribute('pattern', '^[\\s\\S]{1,20}');
    actionRowDiv.appendChild(actionRowInputName);
    //add action time input
    const actionRowInputTime = document.createElement('input');
    actionRowInputTime.classList.add('actionTimeInput');
    actionRowInputTime.setAttribute('type', 'text');
    actionRowInputTime.setAttribute('value', '10');
    actionRowInputTime.setAttribute('pattern', '^[0-9]{1,3}(\\.[0-9]{1})?');
    //add action div in diagram
    const diagramData = document.querySelector('.diagramData');
    const actionRowDiagram = document.createElement('div');
    actionRowDiagram.setAttribute('class', 'diagramRow');
    actionRowDiagram.setAttribute('onClick', 'toggleInfoPopup(this)')
    diagramData.appendChild(actionRowDiagram);
    //add text div in action div diagram
    const textDiv = document.createElement('div');
    textDiv.classList.add('textDiv');
    actionRowDiagram.appendChild(textDiv);
    //count object with class
    let nextFreeidCounter = nextRowIdCounter();
    actionRowInputTime.setAttribute('id', 'timeValueRow-' + nextFreeidCounter);
    actionRowInputName.setAttribute('id', 'nameValueRow-' + nextFreeidCounter);
    actionRowDiagram.setAttribute('id', 'diagramRow-' + nextFreeidCounter);

    actionRowDiv.appendChild(actionRowInputTime);
    //add popup 
    const popupInfo = document.createElement('span');
    popupInfo.classList.add('popup');
    actionRowDiagram.appendChild(popupInfo);
    popupInfo.setAttribute('id', 'popup-' + nextFreeidCounter);
    //add select element
    const selectElement = document.createElement('select');
    selectElement.setAttribute('id', 'actiontype-' + nextFreeidCounter);
    for (let i = 1; i < 4; i++) {
        const optionElement = document.createElement('option');
        optionElement.value = i;
        optionElement.innerHTML = 'Type ' + i;
        selectElement.appendChild(optionElement);
    }
    actionRowDiv.appendChild(selectElement);
    //add delete button
    const deleteRowBtn = document.createElement('button');
    deleteRowBtn.innerHTML = 'X';
    deleteRowBtn.setAttribute('id', 'deleteBtnRow-' + nextFreeidCounter);
    deleteRowBtn.setAttribute('onclick', 'removeActionRow(this)')
    actionRowDiv.appendChild(deleteRowBtn)
    //add start time input 
    const startTimeInput = document.createElement('input');
    startTimeInput.setAttribute('type', 'text');
    startTimeInput.setAttribute('class', 'startTime');
    startTimeInput.setAttribute('id', 'startTime-' + nextFreeidCounter);
    startTimeInput.setAttribute('placeholder', 'Start Time');
    startTimeInput.setAttribute('pattern', '^[0-9]{1,3}(\\.[0-9]{1})?');
    actionRowDiv.appendChild(startTimeInput);

     drawScale();
     drawActionsDiag();
}

function removeActionRow(actionRow) {
    document.querySelector("#diagramRow-" + objectIdCounter(actionRow)).remove();
    actionRow.parentElement.remove();
    drawActionsDiag();
}

function nextRowIdCounter() {
    let objWithClassArray = document.getElementsByClassName('actionTimeInput');
    let lastObj = objWithClassArray[objWithClassArray.length - 1];
    lastIdChar = objectIdCounter(lastObj);
    let lastIdInt = parseInt(lastIdChar);
    return (lastIdInt + 1);
}

function countTotalCycleTime() {
    let totalCycleTime = 0;
    const nodeList = document.querySelectorAll('.actionTimeInput');
    for (let i = 0; i < nodeList.length; i++) {
        totalCycleTime = totalCycleTime + Number(nodeList[i].value);
    }
    return totalCycleTime;
}

function drawScale() {
    const scaleContainer = document.querySelector('.scale');
    const totalCycleTime = countTotalCycleTime();
    const diagramDataContainer = document.querySelector('.diagramData')
    const unitResolution = Number(getComputedStyle(document.documentElement).getPropertyValue('--unitResolution'));

    //clear node
    scaleContainer.innerHTML = '';
    //add new divs
    for (let i = 0; i <= Math.ceil(totalCycleTime); i++) {
        oneUnitDiv = document.createElement('div');
        //do not write number on start scale
        if (i !== 0) {
            oneUnitDiv.innerHTML = i;
        }
        scaleContainer.appendChild(oneUnitDiv);
    }
    scaleContainer.style.gridTemplateColumns = 'repeat(' + Math.ceil(totalCycleTime + 1) + ', var(--widthUnit))';
    diagramDataContainer.style.gridTemplateColumns = 'repeat(' + Math.ceil(totalCycleTime * unitResolution) + ', calc((var(--widthUnit) / var(--unitResolution))))';
}

function drawActionsDiag() {
    //read action nodes from sidebar
    const actionNodesList = document.querySelector('.diagramData').childNodes;
    //variable to control where start to draw next strip
    let currentTime = 1;
    //variable to convert time data value from text to number 
    let timeValueNumber = 0;
    //variable to check current id counter
    let idCounter = 0;
    //variable to check selected type
    let typeValue;

    const unitResolution = Number(getComputedStyle(document.documentElement).getPropertyValue('--unitResolution'));
    for (let i = 1; i < actionNodesList.length; i++) {
        //check nodeType because of some nodes with type text   
        if (actionNodesList[i].nodeType === 1) {
            idCounter = objectIdCounter(actionNodesList[i]);
            actionNodesList[i].querySelector('.textDiv').innerHTML = document.querySelector('#nameValueRow-' + idCounter).value;
            actionNodesList[i].style.gridRow = idCounter;
            timeValueNumber = Number(document.querySelector('#timeValueRow-' + idCounter).value);
            // if action time equal zero, then hide action strip on diagram
            if (timeValueNumber === 0) {
                actionNodesList[i].style.visibility = 'hidden';
            } else {
                actionNodesList[i].style.visibility = 'visible';
                //check start  time input
                if (document.querySelector('#startTime-' + idCounter).value !== '') {
                    currentTime = Number(document.querySelector('#startTime-' + idCounter).value);
                }
                //draw strip on grid (startGridIndex / endGridIndex)
                let startGridIndex;
                let endGridIndex;

                if (currentTime === 1) {
                    startGridIndex = 1;
                    endGridIndex = Math.ceil(timeValueNumber * unitResolution + 1);
                } else {
                    startGridIndex = Math.ceil(currentTime * unitResolution + 1);
                    endGridIndex = Math.ceil(currentTime * unitResolution + 1 + timeValueNumber * unitResolution);
                }
                actionNodesList[i].style.gridColumn = (startGridIndex) + ' / ' + (endGridIndex);
                //write text in popup        
                if (currentTime === 1) {
                    actionNodesList[i].querySelector('.popup').innerHTML = 'Start: ' + 0 + '; End: ' + (timeValueNumber);
                } else {
                    actionNodesList[i].querySelector('.popup').innerHTML = 'Start: ' + currentTime + '; End: ' + (currentTime + timeValueNumber);
                }
                //update current time variable
                if (currentTime === 1) {
                    currentTime = timeValueNumber;
                } else {
                    currentTime = currentTime + timeValueNumber;
                }
                //color current strip depend on selected type
                typeValue = document.querySelector('#actiontype-' + idCounter).value;
                switch (typeValue) {
                    case '1':
                        actionNodesList[i].style.backgroundColor = 'blue';
                        break;
                    case '2':
                        actionNodesList[i].style.backgroundColor = 'red';
                        break;
                    case '3':
                        actionNodesList[i].style.backgroundColor = 'green';
                        break;
                    default:
                        actionNodesList[i].style.backgroundColor = 'pink';
                        break;
                }

            }
        }
    }
}

function objectIdCounter(element) {
    return (element.id.slice(element.id.indexOf('-') + 1));
}

function toggleInfoPopup(element) {
    idCounter = objectIdCounter(element);
    document.getElementById('popup-' + idCounter).classList.toggle('popupShow');
}

//If inputs are valid then draw scale and actions rows
function isInputsValid(){
    let inputs = document.getElementsByTagName('input');
    for (let i=0; i < inputs.length; i++){   
        if (!inputs[i].validity.valid){
            return false
        }
        if (i === inputs.length-1){
            drawScale();
            drawActionsDiag();
            return true;
        }
    }
}


//event listener
const sidebarPropElement = document.querySelector('.sidebar');

sidebarPropElement.addEventListener("change", isInputsValid);
document.addEventListener("DOMContentLoaded", drawScale);
document.addEventListener("DOMContentLoaded", drawActionsDiag);

// TEST
document.addEventListener("DOMContentLoaded", isInputsValid);
sidebarPropElement.addEventListener("change", isInputsValid);