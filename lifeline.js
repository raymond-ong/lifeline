loadData = () => {
     let tableEl = document.getElementById('lifelineTable');

     // TODO: validate the data by the user
     let interval = calculateInterval();

     // Draw each item
     drawItems(tableEl, interval);

     // Draw the date axis
     displayAxis(tableEl, interval);     

     // Draw the legends
     displayLegends(tableEl);
}

drawItems = (tableEl, interval) => {
     let startPeriod = new Date(`${interval.minDate.getFullYear()}-01-01`);
     let endPeriod = new Date(`${interval.maxDate.getFullYear()}-12-31`);
     let totalPeriod = endPeriod.getTime() - startPeriod.getTime();

     lifeLineData.items.forEach(item => {
          console.log(`Item: ${item.name}`);
          let axisRow = document.createElement('tr');
          axisRow.classList.add('lifeTableRow');

          let axisHeader = document.createElement('th');
          axisHeader.innerText = item.displayName;

          let axisCell = document.createElement('td');
          axisCell.classList.add('ganttCell');

          let slices = [];
          let prev = startPeriod;          

          item.dates.forEach(date => {
               console.log(`start: ${date.start}, end: ${date.end}`);
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
               console.log(`slice: visible: ${slice.visible}, ${slice.width}`);
               drawTime(slice, axisCell);
               cellStyle += `${slice.width}fr `
          });
          axisCell.style = cellStyle;

          axisRow.appendChild(axisHeader);
          axisRow.appendChild(axisCell);  
          
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
drawTime = (slice, axisCell) => {
     let sliceEl = document.createElement('div');
     if (slice.visible) {
          sliceEl.classList.add('visibleTime');          
          sliceEl.onmouseover = onMouseOver.bind(this, slice);
          sliceEl.onmouseleave = onMouseLeave;
          let fontColor = slice.groupInfo.color;
          let backColor = slice.groupInfo.backColor;
          let caption = slice.date.caption ? slice.date.caption : '';     
          let style = `position:absolute;color:${fontColor};text-align: center; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; width: 100%; font-size: 0.8em`;          
          sliceEl.innerHTML = `<div style="${style}">${caption}</div>`;
          sliceEl.style = `background-color: ${backColor}`;
     }
     else {
          sliceEl.classList.add('placeholderTime');
     }
     
     axisCell.appendChild(sliceEl);
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
     let axisRow = document.createElement('tr');
     axisRow.classList.add('lifeTableRow');

     let axisHeader = document.createElement('th');

     let axisCell = document.createElement('td');     
     axisCell.classList.add('ganttCell');

     let minYear = interval.minDate.getFullYear();
     let maxYear = interval.maxDate.getFullYear();
     axisCell.style = `grid-template-columns: repeat(${maxYear-minYear+1}, 1fr)`;
     
     for (let i = minYear; i <= maxYear; i++) {
          let axisItemEl = document.createElement('div');      
          axisItemEl.innerText = i;
          axisCell.appendChild(axisItemEl);
     }

     axisRow.appendChild(axisHeader);
     axisRow.appendChild(axisCell);     

     tableEl.appendChild(axisRow);
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