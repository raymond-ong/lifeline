loadData = () => {
     let tableEl = document.getElementById('lifelineTable');
     // TODO: validate the data by the user

     let interval = calculateInterval();
     clearAllData(tableEl);

     let cmbCategorizeEl = document.getElementById('cmbCategorize');
     if (cmbCategorizeEl.value === 'Company') {
          // Draw each item
          drawItemsByCategory(tableEl, interval);

          // Draw the date axis
          displayAxis(tableEl, interval);               
     }
     else {
          // Draw each item
          drawItems(tableEl, interval);

          // Draw the date axis
          displayAxis(tableEl, interval);     

          // Draw the legends
          displayLegends(tableEl);
     }
}

clearAllData = (tableEl) => {
     while(tableEl.firstChild) {
          tableEl.removeChild(tableEl.firstChild);
     }
}

// Draw Items by category
drawItemsByCategory = (tableEl, interval) => {
     let startPeriod = new Date(`${interval.minDate.getFullYear()}-01-01`);
     let endPeriod = new Date(`${interval.maxDate.getFullYear()}-12-31`);
     let totalPeriod = endPeriod.getTime() - startPeriod.getTime();

     lifeLineData.groupings.forEach(group => {
          let groupAccordion = drawGroupAccordion(group);
          let accordionItemsConainer = drawAccordionItemsContainer(groupAccordion);

          lifeLineData.items.forEach(item => {
               let axisRow = document.createElement('div');
               axisRow.classList.add('lifeTableRow');
     
               let axisHeader = document.createElement('div');
               axisHeader.classList.add('lifelineTableHeader');
               axisHeader.innerText = item.displayName;
     
               let ganttCell = document.createElement('div');
               ganttCell.classList.add('ganttCell');

               let slices = [];
               let prev = startPeriod;          
     
               item.dates.forEach(date => {
                    //console.log(`start: ${date.start}, end: ${date.end}`);
                    if (date.group !== group.name) {
                         return;
                    }

                    let dateStart = new Date(date.start);
                    let dateEnd = new Date(date.end);
                    let groupInfo = getGroupInfo(date.group);
     
                    if (dateStart > prev) {
                         addSlice(slices, false, (dateStart.getTime() - prev.getTime()) / totalPeriod, null, null);
                    }
     
                    addSlice(slices, true, (dateEnd.getTime() - dateStart.getTime()) / totalPeriod, date, groupInfo);
                    prev = dateEnd;
               })

               // if there is not slice under the item, don't add it anymore
               if (slices.length === 0) {
                    return;
               }
     
               if (prev < endPeriod) {
                    addSlice(slices, false, (endPeriod.getTime() - prev.getTime()) / totalPeriod, null, null);
               }

               let cellStyle = 'grid-template-columns: ';
               slices.forEach(slice => {
                    //console.log(`slice: visible: ${slice.visible}, ${slice.width}`);
                    drawTime(slice, ganttCell);
                    cellStyle += `${slice.width}fr `
               });
               ganttCell.style = cellStyle;

               axisRow.appendChild(axisHeader);
               axisRow.appendChild(ganttCell);  
               
               accordionItemsConainer.appendChild(axisRow);
          });  // for loop for items

          // TODO: if there is no item under the accordion, do not display it anymore
          tableEl.appendChild(groupAccordion);
          accordionItemsConainer.previousElementSibling.click(); // open the accordions by default
     }); // for loop for groups
}

drawGroupAccordion = (group) => {
     let groupEl = document.createElement('div');
     
     groupEl.classList.add('groupAccordionContainer');
     let groupTitleEl = document.createElement('div');
     groupTitleEl.onclick = onAccordionClicked;
     groupTitleEl.innerText = group.displayName;
     groupTitleEl.classList.add('groupAccordion');
     groupTitleEl.style = `color: ${group.color}; background-color: ${group.backColor}`;

     groupEl.appendChild(groupTitleEl);
     return groupEl;
}

drawAccordionItemsContainer = (accordionEl) => {
     let container = document.createElement('div');
     container.classList.add('accordionItemsContainer');

     accordionEl.appendChild(container);
     return container;
}

onAccordionClicked = (e) => {
     e.target.classList.toggle('groupAccordion-active');
     var panel = e.target.nextElementSibling;
     debugger
     if (panel.style.maxHeight){
          panel.style.maxHeight = null;
     } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
     }
}

/*
drawCategoriesAccordion = (tableEl) => {
     let retList = {};
     lifeLineData.groupings.forEach(group => {
          let groupEl = document.createElement('div');
          groupEl.classList.add('groupAccordion');
          groupEl.innerText = group.displayName;
          groupEl.style = `color: ${group.color}; background-color: ${group.backColor}`;

          tableEl.appendChild(groupEl);
          retList[group.name] = groupEl;
     });

     return retList;
}
*/

// Draw all items
drawItems = (tableEl, interval) => {
     let startPeriod = new Date(`${interval.minDate.getFullYear()}-01-01`);
     let endPeriod = new Date(`${interval.maxDate.getFullYear()}-12-31`);
     let totalPeriod = endPeriod.getTime() - startPeriod.getTime();

     lifeLineData.items.forEach(item => {
          console.log(`Item: ${item.name}`);
          let axisRow = document.createElement('div');
          axisRow.classList.add('lifeTableRow');

          let axisHeader = document.createElement('div');
          axisHeader.classList.add('lifelineTableHeader');
          axisHeader.innerText = item.displayName;

          let ganttCell = document.createElement('div');
          ganttCell.classList.add('ganttCell');

          let slices = [];
          let prev = startPeriod;          

          item.dates.forEach(date => {
               //console.log(`start: ${date.start}, end: ${date.end}`);
               let dateStart = new Date(date.start);
               let dateEnd = new Date(date.end);
               let groupInfo = getGroupInfo(date.group);

               if (dateStart > prev) {
                    addSlice(slices, false, (dateStart.getTime() - prev.getTime()) / totalPeriod, null, null);
               }

               addSlice(slices, true, (dateEnd.getTime() - dateStart.getTime()) / totalPeriod, date, groupInfo);
               prev = dateEnd;
          })

          if (prev < endPeriod) {
               addSlice(slices, false, (endPeriod.getTime() - prev.getTime()) / totalPeriod, null, null);
          }

          let cellStyle = 'grid-template-columns: ';
          slices.forEach(slice => {
               //console.log(`slice: visible: ${slice.visible}, ${slice.width}`);
               drawTime(slice, ganttCell);
               cellStyle += `${slice.width}fr `
          });
          ganttCell.style = cellStyle;

          axisRow.appendChild(axisHeader);
          axisRow.appendChild(ganttCell);  
          
          tableEl.appendChild(axisRow);
     })
}

getGroupInfo = (groupName) => {
     return lifeLineData.groupings.find( (currGroup) => {
          return currGroup.name === groupName;
     });
}

addSlice = (slices, visible, width, date, groupInfo) => {
     let cumulativeWidth = slices.reduce( (accumulator, curr) => {
          return accumulator + curr.width;
     }, 0)

     slices.push({
          visible,
          width,
          date,
          cumulativeWidth,
          groupInfo
     });
}

// Draws the divs that represent the data
drawTime = (slice, ganttCell) => {
     let sliceEl = document.createElement('div');
     if (slice.visible) {
          sliceEl.classList.add('visibleTime');          
          sliceEl.onmouseover = onMouseOver.bind(this, slice);
          sliceEl.onmouseleave = onMouseLeave;
          let fontColor = slice.groupInfo.color;
          let backColor = slice.groupInfo.backColor;
          let caption = slice.date.caption ? slice.date.caption : '';               
          let style = `color:${fontColor};`;
          let classStr = 'caption';
          let checkboxEl = document.getElementById('chkCaption');
          if (!checkboxEl.checked) {
               classStr += ' caption-invisible';
          }
          sliceEl.innerHTML = `<div class="${classStr}" style="${style}">${caption}</div>`;
          sliceEl.style = `background-color: ${backColor}`;
     }
     else {
          sliceEl.classList.add('placeholderTime');
     }
     
     ganttCell.appendChild(sliceEl);
}

onMouseOver = (slice, e) => {
     //debugger
     // draw the tooltip now -- testing
     let tip = document.createElement('span');
     tip.classList.add('speech-bubble');
     tip.id = 'tipLifeLine'; // there is only 1 instance at a time because we will remove it on MouseLeave

     // If it's very short, choose left or right; otherwise select bottom
     if (slice.width > 0.15) {
          tip.classList.add('speech-bubble-bottom-left');
     }
     else if (slice.cumulativeWidth < 0.5) {
          tip.classList.add('speech-bubble-right');
     }
     else {
          tip.classList.add('speech-bubble-left');
     }

     let caption = slice.date.caption ? `${slice.date.caption}<hr>` : '';
     let width = caption !== '' ? 150 : 100;

     tip.innerHTML = caption + `Start: ${formatDate(slice.date.start)}<br/>End: &nbsp;${formatDate(slice.date.end)}`;     
     tip.style = `width: ${width}px`;
     e.target.appendChild(tip);
}

const dateMMM = {
     0: 'Jan',     1: 'Feb',     2: 'Mar',     3: 'Apr',     4: 'May',     5: 'Jun',
     6: 'Jul',     7: 'Aug',     8: 'Sept',     9: 'Oct',     10: 'Nov',     11: 'Dec'
}

// We only want to show month and year
formatDate = (dateStr) => {
     // Seems like there is no builtin Javascript library to format to MMM
     let date = new Date(dateStr);
     let monthStr = dateMMM[date.getMonth()];
     return `${date.getFullYear()} ${monthStr}`;
}

onMouseLeave = (e) => {
     let tipEl = document.getElementById('tipLifeLine');
     if (tipEl) {
          e.target.removeChild(tipEl);
     }
}

displayAxis = (tableEl, interval) => {
     let axisRow = document.createElement('div');
     axisRow.id = 'axisRow';
     axisRow.classList.add('lifeTableRow');
     axisRow.classList.add('axisRow');

     let axisHeader = document.createElement('div');
     axisHeader.classList.add('lifelineTableHeader');

     let axisCell = document.createElement('div'); 
     axisCell.id = 'axisCell';
     axisCell.classList.add('ganttCell');     

     axisRow.appendChild(axisHeader);
     axisRow.appendChild(axisCell);     

     tableEl.appendChild(axisRow);

     drawAxisLabels(interval, axisCell);
}

drawAxisLabels = (interval, axisCell) => {
     let minYear = interval.minDate.getFullYear();
     let maxYear = interval.maxDate.getFullYear();
     let numItems = maxYear - minYear + 1;

     // calculate how many will fit
     let skips = calculateAxisSkips(numItems);
     let numAxisItems = Math.ceil(numItems/skips);

     axisCell.style = `grid-template-columns: repeat(${numAxisItems}, 1fr)`;
     
     for (let i = minYear; i <= maxYear; i = i + skips) {
          let axisItemEl = document.createElement('div');
          axisItemEl.classList.add('axisItem');
          axisItemEl.innerText = i;
          axisCell.appendChild(axisItemEl);
     }
}

// Skip every n items
// e.g. if return is 2, display only 1st, 3rd, 5th...
// e.g. if return is 3, display only 1st, 4th, 7th...
calculateAxisSkips = (inputNum) => {
     let ret = 1;
     let rulerEl = document.getElementById('ruler');
     let axisCellEl = document.getElementById('axisCell');
     if (!rulerEl || !axisCellEl) {
          return ret; // do not skip
     }

     let displayableNum = axisCellEl.clientWidth / rulerEl.offsetWidth;
     while (displayableNum < inputNum / ret) {
          ret++;
     }

     return ret;
}

redrawAxisLabels = (interval) => {
     let axisCell = document.getElementById('axisCell');
     clearAllData(axisCell);
     drawAxisLabels(interval, axisCell);
}

canAxisFit = () => {
     let lifelineEl = document.getElementById('lifeline');
     let rect1 = lifelineEl.getClientRects()[0];

     let axisEl = document.getElementById('axisRow');     
     let rect2 = axisEl.getClientRects()[0];
     //console.log(`lifelineEl: ${rect1.width}, axisEl: ${rect2.width} `);
     console.log(`lifelineEl: ${rect1.width}, axisEl: ${axisEl.scrollWidth} `);

     return lifelineEl.clientWidth > axisEl.scrollWidth;
}

getMinDate = (allDates) => {
      let minItem = allDates.reduce((prev, curr) => {
          return prev.start < curr.start ? prev : curr;
     });

     return minItem.start;
}

getMaxDate = (allDates) => {
     let maxItem = allDates.reduce((prev, curr) => {
          return prev.end > curr.end ? prev : curr;
     });

     return maxItem.end;
}

calculateInterval = () => {
     let allDates = lifeLineData.items.reduce((accumulator, curr) => {
          return accumulator.concat(curr.dates);
     }, []);

     let minDateStr = getMinDate(allDates);
     let maxDateStr = getMaxDate(allDates);

     let minDate = new Date(minDateStr);
     let maxDate = new Date(maxDateStr);

     let differenceMs = maxDate.getTime() - minDate.getTime();
     const ONE_DAY =1000*60*60*24;
     const ONE_MONTH = ONE_DAY * 30;
     const ONE_YEAR = ONE_DAY * 365;

     var yearsDiff = Math.round(differenceMs/ONE_YEAR); 

     // Hardcode as years diff for now
     return {
          periodUnit: 'year',
          periodValue: yearsDiff,
          minDate,
          maxDate
     };
}

displayLegends = (tableEl) => {
     lifeLineData.groupings.forEach( group => {
          let legendEl = document.createElement('div');
          legendEl.classList.add('legendContainer');

          let nameEl = document.createElement('div');
          nameEl.innerText = group.displayName;
          nameEl.classList.add('legendName');

          let squareEl = document.createElement('div');
          squareEl.classList.add('legendSquare');
          squareEl.style = `background-color: ${group.backColor};`;          

          legendEl.appendChild(squareEl);
          legendEl.appendChild(nameEl);
          tableEl.appendChild(legendEl);
     });
}

handleResize = () => {
     let interval = calculateInterval();
     redrawAxisLabels(interval);
}

captionCheckedChanged = () => {
     let checkboxEl = document.getElementById('chkCaption');
     let captionEls = document.getElementsByClassName('caption');

     for (let i = 0; i < captionEls.length; i++) {
          let captionEl = captionEls[i];
          captionEl.classList.toggle('caption-invisible');
     };
     
}

cmbCategorizeChanged = () => {
     loadData();
     
}