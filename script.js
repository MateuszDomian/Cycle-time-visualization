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
    actionRowDiv.appendChild(actionRowInputName);
    //add action time input
    const actionRowInputTime = document.createElement('input');
    actionRowInputTime.classList.add('actionTimeInput');
    actionRowInputTime.setAttribute('type', 'text');
    actionRowInputTime.setAttribute('value', '10 ');
    //add action div in diagram
    const diagramData = document.querySelector('.diagramData');
    const actionRowDiagram = document.createElement('div');
    diagramData.appendChild(actionRowDiagram);
    //count object with class
    let nextFreeidCounter = nextRowIdCounter();
    actionRowInputTime.setAttribute('id', 'timeValueRow-' + nextFreeidCounter);
    actionRowInputName.setAttribute('id', 'nameValueRow-' + nextFreeidCounter);
    actionRowDiagram.setAttribute('id', 'diagramRow-' + nextFreeidCounter);
    actionRowDiv.appendChild(actionRowInputTime);
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
    //delete button
    const deleteRowBtn = document.createElement('button');
    deleteRowBtn.innerHTML = 'X';
    deleteRowBtn.setAttribute('id', 'deleteBtnRow-' + nextFreeidCounter);
    deleteRowBtn.setAttribute('onclick', 'removeActionRow(this)')
    actionRowDiv.appendChild(deleteRowBtn)

    //drawScale();
    //drawActionsDiag();
}

function removeActionRow(actionRow) {
    document.querySelector("#diagramRow-" + objectIdCounter(actionRow)).remove();
    actionRow.parentElement.remove();
    //drawActionsDiag();
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

    //clear node
    scaleContainer.innerHTML = '';
    //add new divs
    for (let i = 1; i <= totalCycleTime; i++) {
        oneUnitDiv = document.createElement('div');
        oneUnitDiv.innerHTML = i;
        scaleContainer.appendChild(oneUnitDiv);
    }
    scaleContainer.style.gridTemplateColumns = 'repeat(' + totalCycleTime + ', var(--widthUnit))';
    diagramDataContainer.style.gridTemplateColumns = 'repeat(' + totalCycleTime + ', var(--widthUnit))';
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
    for (let i = 1; i < actionNodesList.length; i++) {
        //check nodeType because of some nodes with type text   
        if (actionNodesList[i].nodeType === 1) {
            idCounter = objectIdCounter(actionNodesList[i]);
            actionNodesList[i].innerHTML = document.querySelector('#nameValueRow-' + idCounter).value;
            actionNodesList[i].style.gridRow = idCounter;
            timeValueNumber = Number(document.querySelector('#timeValueRow-' + idCounter).value);
            //draw strip on grid (startGridIndex / endGridIndex)
            actionNodesList[i].style.gridColumn = (currentTime) + ' / ' + (currentTime + timeValueNumber);
            //update current time variable
            currentTime = currentTime + timeValueNumber;
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

function objectIdCounter(element) {
    return (element.id.slice(element.id.indexOf('-') + 1));
}

//event listener
const sidebarPropElement = document.querySelector('.sidebar');

sidebarPropElement.addEventListener("change",drawScale);
sidebarPropElement.addEventListener("change",drawActionsDiag);
   