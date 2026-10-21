(() => {
  const $ = id => document.getElementById(id);
  const pastebox=$('pastebox'), capture=$('capture'), status=$('status'), download=$('downloadBtn');
  let dataRows=[];
  const escapeHtml = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const setStatus = s => status.textContent=s;
  function parseTSV(text){
    // Split on tabs without dropping empty cells; normalize CRLF and trailing newline only.
    const cleaned=String(text).replace(/\r\n?/g,'\n').replace(/\n+$/,'');
    if(!cleaned.trim()) return [];
    return cleaned.split('\n').map(line=>line.split('\t'));
  }
  function buildTable(rows){
    if(!rows.length) return '';
    const colCount=Math.max(...rows.map(r=>r.length));
    const normalized=rows.map(r=>Array.from({length:colCount},(_,i)=>r[i]??''));
    let html='<table><colgroup>'+Array.from({length:colCount},()=>'<col>').join('')+'</colgroup><tbody>';
    normalized.forEach((row,ri)=>{html+='<tr>';row.forEach(cell=>{const tag=ri===0?'th':'td';html+=`<${tag}>${escapeHtml(cell)}</${tag}>`;});html+='</tr>';});
    return html+'</tbody></table>';
  }
  function render(rows){
    dataRows=rows;
    capture.innerHTML=buildTable(rows);
    const table=capture.querySelector('table');
    $('empty').hidden=!!table;download.disabled=!table;
    if(!table){$('dimensions').textContent='No data yet';setStatus('Paste spreadsheet cells to create the preview.');return;}
    applyControls();
    $('dimensions').textContent=`${rows.length} rows · ${Math.max(...rows.map(r=>r.length))} columns`;
    setStatus('Preview aligned into a consistent grid. First row is styled as the report header.');
  }
  function applyControls(){
    const table=capture.querySelector('table');if(!table)return;
    table.style.width=$('tableWidth').value+'px';
    table.style.fontSize=(13*Number($('fontSize').value)/100)+'px';
    table.querySelectorAll('td,th').forEach(cell=>cell.style.padding=$('padding').value+'px 8px');
    $('fontLabel').textContent=$('fontSize').value+'%';
    $('scaleLabel').textContent=Number($('scale').value).toFixed(2).replace(/0+$/,'').replace(/\.$/,'')+'×';
    $('widthLabel').textContent=$('tableWidth').value+' px';
    $('paddingLabel').textContent=$('padding').value+' px';
  }
  pastebox.addEventListener('paste',e=>{
    const text=e.clipboardData?.getData('text/plain')||'';
    if(text){e.preventDefault();pastebox.value=text;render(parseTSV(text));}
  });
  pastebox.addEventListener('input',()=>{const rows=parseTSV(pastebox.value);if(rows.length && rows.some(r=>r.length>1))render(rows);});
  $('pasteBtn').addEventListener('click',async()=>{
    try{const items=await navigator.clipboard.read();let text='';
      for(const item of items)if(item.types.includes('text/plain'))text=await(await item.getType('text/plain')).text();
      if(text){pastebox.value=text;render(parseTSV(text));}else setStatus('No spreadsheet text found in clipboard. Copy the cells again and use Ctrl+V.');
    }catch{pastebox.focus();setStatus('Clipboard access was blocked. Click the text area and press Ctrl+V instead.');}
  });
  $('clearBtn').addEventListener('click',()=>{pastebox.value='';render([]);});
  ['fontSize','tableWidth','padding'].forEach(id=>$(id).addEventListener('input',applyControls));
  $('scale').addEventListener('input',()=>{applyControls();});
  $('xlsxfile').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;setStatus('Reading workbook…');
    try{const buf=await file.arrayBuffer(),wb=XLSX.read(buf,{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]];
      render(XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:false}));setStatus('Workbook imported. The first worksheet is shown in the clean report style.');
    }catch{setStatus('Could not read this workbook. Try saving it as .xlsx and retry.');}
  });
  $('downloadBtn').addEventListener('click',async()=>{
    if(!capture.querySelector('table'))return;
    if(!window.html2canvas){setStatus('Screenshot library is still loading. Please try again.');return;}
    download.disabled=true;setStatus('Rendering PNG…');
    try{
      const scale=Number($('scale').value);
      const canvas=await html2canvas(capture,{backgroundColor:'#ffffff',scale,useCORS:true,logging:false,scrollX:0,scrollY:0});
      const a=document.createElement('a');a.download='spreadsheet-report-'+new Date().toISOString().slice(0,10)+'.png';a.href=canvas.toDataURL('image/png');a.click();
      setStatus(`PNG downloaded (${canvas.width.toLocaleString()} × ${canvas.height.toLocaleString()} pixels).`);
    }catch{setStatus('The image may be too large. Reduce table width or export scale and retry.');}
    finally{download.disabled=false;}
  });
})();