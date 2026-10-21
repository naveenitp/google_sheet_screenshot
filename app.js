(() => {
  const $ = id => document.getElementById(id);
  const pastebox=$('pastebox'), capture=$('capture'), status=$('status'), download=$('downloadBtn');
  let currentHtml='', currentText='';
  const setStatus = s => status.textContent=s;
  const escapeHtml = s => s.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function tableFromText(text){
    const rows=text.replace(/\r/g,'').replace(/\n$/,'').split('\n').map(r=>r.split('\t'));
    const cols=Math.max(1,...rows.map(r=>r.length));
    return '<table>'+rows.map(row=>'<tr>'+Array.from({length:cols},(_,i)=>'<td class="plain-cell">'+escapeHtml(row[i]||'')+'</td>').join('')+'</tr>').join('')+'</table>';
  }
  function safeClipboardTable(html){
    const doc=new DOMParser().parseFromString(html,'text/html');
    let source=doc.querySelector('table');
    if(!source) return '';
    const table=document.createElement('table');
    for(const row of source.querySelectorAll('tr')){
      const tr=document.createElement('tr');
      for(const cell of row.querySelectorAll(':scope > td, :scope > th')){
        const td=document.createElement(cell.tagName.toLowerCase()==='th'?'th':'td');
        td.textContent=cell.textContent;
        for(const attr of ['rowspan','colspan','width','height']) if(cell.hasAttribute(attr)) td.setAttribute(attr,cell.getAttribute(attr));
        const style=cell.getAttribute('style')||'';
        const allowed=['background-color','color','font-weight','font-style','font-size','font-family','text-align','vertical-align','border','border-left','border-right','border-top','border-bottom','padding','white-space','width','height'];
        const safe=style.split(';').map(x=>x.trim()).filter(Boolean).filter(x=>allowed.includes(x.split(':')[0].trim().toLowerCase()) && !/url\s*\(|expression|javascript/i.test(x)).join(';');
        if(safe) td.setAttribute('style',safe);
        tr.appendChild(td);
      }
      if(tr.children.length) table.appendChild(tr);
    }
    return table.rows.length?table.outerHTML:'';
  }
  function render(html,text){
    currentHtml=safeClipboardTable(html||'');
    currentText=text||'';
    if(!currentHtml && currentText.trim()) currentHtml=tableFromText(currentText);
    capture.innerHTML=currentHtml;
    const table=capture.querySelector('table');
    $('empty').hidden=!!table;
    download.disabled=!table;
    if(table){
      table.style.fontSize=($('fontSize').value/100*13)+'px';
      table.style.width=$('widthMode').value==='readable'?'max(700px, 100%)':'auto';
      if($('widthMode').value==='readable') table.style.tableLayout='fixed';
      else table.style.tableLayout='auto';
      capture.style.background=$('bg').value==='transparent'?'transparent':$('bg').value;
      $('dimensions').textContent=`${table.rows.length} rows · ${Math.max(0,...Array.from(table.rows,r=>r.cells.length))} columns`;
      setStatus(currentHtml && html ? 'Rich clipboard table loaded. Review the preview before exporting.' : 'Plain text loaded. Values and cell positions are preserved; original formatting was not present in the clipboard.');
    }else{
      $('dimensions').textContent='No data yet';setStatus('Paste data to create a preview.');
    }
  }
  function parsePaste(raw){
    // Clipboard event provides HTML separately where supported. Text input remains a dependable fallback.
    const lines=raw.split('\n');
    if(lines.length===1 && !raw.includes('\t')) return;
    render('',raw);
  }
  pastebox.addEventListener('paste', e=>{
    const html=e.clipboardData?.getData('text/html')||'';
    const text=e.clipboardData?.getData('text/plain')||'';
    if(html||text){e.preventDefault();pastebox.value=text;render(html,text);}
  });
  pastebox.addEventListener('input',()=>parsePaste(pastebox.value));
  $('pasteBtn').addEventListener('click',async()=>{
    try{const clip=await navigator.clipboard.read();let html='',text='';
      for(const item of clip){if(item.types.includes('text/html')) html=await (await item.getType('text/html')).text();if(item.types.includes('text/plain'))text=await (await item.getType('text/plain')).text();}
      pastebox.value=text;render(html,text);
    }catch{pastebox.focus();setStatus('Clipboard permission was not granted. Click the text area and press Ctrl+V instead.');}
  });
  $('clearBtn').addEventListener('click',()=>{pastebox.value='';render('','');capture.innerHTML='';});
  ['fontSize','widthMode','bg'].forEach(id=>$(id).addEventListener('input',()=>{if(currentHtml)render(currentHtml,currentText);}));
  $('scale').addEventListener('input',()=>{$('scaleLabel').textContent=$('scale').value+'×';});
  $('fontSize').addEventListener('input',()=>{$('fontLabel').textContent=$('fontSize').value+'%';});
  $('xlsxfile').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;
    setStatus('Reading workbook…');
    try{
      if(!window.XLSX) await loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
      const buf=await file.arrayBuffer(), wb=XLSX.read(buf,{type:'array',cellStyles:true});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const html=XLSX.utils.sheet_to_html(ws,{editable:false});
      render(html,XLSX.utils.sheet_to_csv(ws,{FS:'\t'}));
      setStatus('Workbook imported. The first worksheet is shown; some Excel styling may not transfer exactly.');
    }catch(err){setStatus('Could not read this workbook. Try saving it as .xlsx and retry.');}
  });
  function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
  $('downloadBtn').addEventListener('click',async()=>{
    const table=capture.querySelector('table');if(!table)return;
    if(!window.html2canvas){setStatus('Screenshot library is still loading. Please try again in a moment.');return;}
    download.disabled=true;setStatus('Rendering the full table to PNG…');
    try{
      const scale=Number($('scale').value);
      const canvas=await html2canvas(capture,{backgroundColor:$('bg').value==='transparent'?null:$('bg').value,scale, useCORS:true,logging:false,windowWidth:Math.max(document.documentElement.clientWidth,capture.scrollWidth+80),onclone:doc=>{const el=doc.getElementById('capture');el.style.transform='none';el.style.width='max-content';}});
      const a=document.createElement('a');a.download='google-sheets-capture-'+new Date().toISOString().slice(0,10)+'.png';a.href=canvas.toDataURL('image/png');a.click();
      setStatus(`PNG downloaded (${canvas.width.toLocaleString()} × ${canvas.height.toLocaleString()} pixels).`);
    }catch(err){setStatus('The table may be too large for one image. Lower Image scale or export smaller ranges.');}
    finally{download.disabled=false;}
  });
  // Extension can open the site with encoded clipboard data in the hash.
  if(location.hash.startsWith('#clipboard=')){
    try{const data=JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(11)))));pastebox.value=data.text||'';render(data.html||'',data.text||'');history.replaceState(null,'',location.pathname+location.search);}
    catch{setStatus('Could not load captured clipboard data. Paste it manually instead.');}
  }
})();