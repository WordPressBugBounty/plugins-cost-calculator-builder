function p(o,t){const e=(t||"document").replace(/[\\/:*?"<>|]+/g,"-").trim()||"document",n=e.toLowerCase().endsWith(".pdf")?e:`${e}.pdf`,c=new File([o],n,{type:"application/pdf"}),i=URL.createObjectURL(c);window.open(i)}export{p as o};
//# sourceMappingURL=open-pdf-preview-QpFYzkRU.js.map
