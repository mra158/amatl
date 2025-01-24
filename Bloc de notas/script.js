/**
**
** Editor de texto
** @archivo: Javascript()js
** @autor: mra158
** @version: Bloc de notas 1.0
** @descripcion: Este editor es la primera parte de un editor enriquesido (EDE), Tiene como finalidad controlar los aspectos basicos de cualquier editor
** @funciones:
**		* Escribir texto en un contenedor contenteditable
**		* Guardar puntero del cursor 
**		* Historial de cambios (Deshacer y Rehacer)
**		* Funciones basicas de archivo (Nuevo, Abrir, Guardar)
**		* Funciones de portapapeles (copiar, cortar, pegar)
**		* Busqueda de texto dentro del archivo
**		*  
** @errores: Guardar el rango en seleccion del texto (Ya vi mi errorxD), Optimizar mi codigo :3 
**
**/
/*
tlaj={
	axka:{//
		iyukin:{},//forma de el, formato
		tlapiloli:{},//paquetes
		axto:{},//primero, antes de
	},
	kaxtli:{//contenedor;
		pantli:[],
		tokaitl:"",//nombre de documento
		tlakatl:"",//persona;?tlatokai?autor;
		netolistli:"",//escrito
	},
}
*/
var txtcpr="",cambios,objrposicion=0,grdRngPntr,rngCmb,nombreFl=[false,""],inpevnt = new Event('input', { bubbles: true,detail:"copia"}),pila=()=>{
var nota=document.getElementById("nota");
cambios = [{
evento: "",
valor: "",
ini: 0,
fin: 0,
acumulativa:0
}],edicion=(e)=>{
	if(nombreFl[1]!="")nombreFl[0]=true;
	let disparar=(e.detail==undefined)? "abrir":"Escribir";
	var item={
		evento: disparar,
		valor: e.target.textContent,
        inicio: rngCmb(nota).i,
        fin: rngCmb(nota).f
	};
	cambios.length = ++objrposicion;
    cambios.push(item);
},ctrls=(e)=>{
	if(e.ctrlKey && e.key=="z"){
	e.preventDefault();
	herramientas.acciones.historial.des();
	}else if(e.ctrlKey && e.key=="y"){
	e.preventDefault();
	herramientas.acciones.historial.re();
	}else if(e.ctrlKey && e.key=="s"){
	e.preventDefault();
	herramientas.archivo.guardar();
	}else if(e.ctrlKey && e.key=="v"){
	e.preventDefault();
	herramientas.portapapeles.pegar.txt();
	}else if(event.keyCode == 9){
	e.preventDefault();
		nota.innerHTML+="<pre>\t</pre>";
	}
};
rngCmb=(nd)=>{//crear selectionStart y selectionEnd para contenteditable
	var rng=window.getSelection().getRangeAt(0), rngSlccn=rng.cloneRange();
	rngSlccn.selectNodeContents(nd);rngSlccn.setEnd(rng.startContainer,rng.startOffset);
	var ini=rngSlccn.toString().length,fin=ini+rng.toString().length;
	return {
		i:ini,
		f:fin,
	}
}
nota.addEventListener("input",edicion,false);
document.addEventListener("keydown",ctrls,false);
}
nota.addEventListener("blur",function(){
	let slcnt=window.getSelection();
	let elmnrslc=slcnt.getRangeAt(0);
	txtcpr=slcnt.toString();
	let puntero = rngCmb(nota);
	document.getElementById("copiar").addEventListener("click",()=>{
		if(txtcpr!=""){
			herramientas.portapapeles.copiar.txt(txtcpr);
		}
		txtcpr="";
	},false);
	document.getElementById("cortar").addEventListener("click",()=>{
		if(txtcpr!=""){
			nota.focus();
			let crt=elmnrslc.extractContents();
			console.log(txtcpr);
			console.log(elmnrslc);
			herramientas.portapapeles.cortar.txt(txtcpr);   
		}
		txtcpr="";elmnrslc="";
	},false);
	document.getElementById("pegar").addEventListener("click",()=>{
		//console.log(puntero);
	},false);
},false);
//comprobar estados
// if(document.execCommand){var ccmnd=true}else{var ccmnd=false;pila();}
pila();
var ccmnd = false;
var herramientas={
	acciones:{
		get historial(){
			function crsrfinal(){//llevar puntero al final del documento
				let range = document.createRange();
				range.selectNodeContents(nota);
				range.collapse(false);
				let selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			}
			function rstrrcursor(ndElmnt,grdSlc){ //funcion para colocar puntero a posicion de edicion(deshacer, rehacer, reinicio, etc...)
				var inchr=0, rng=document.createRange();
				rng.setStart(nota,0);rng.collapse(true);
				var ndPila=[nota], nodo, iniBus = false, det = false;
				//
				while(!det && (nodo=ndPila.pop())){
					if(nodo.nodeType==3){
						var siginchr = inchr + nodo.length;
						if(!iniBus && grdSlc.ini >= inchr && grdSlc.ini <= siginchr){
							rng.setStart(nodo,grdSlc.ini - inchr);
							iniBus=true;
						}
						if(iniBus && grdSlc.fin >= inchr && grdSlc.fin <= siginchr){
							rng.setEnd(nodo, grdSlc.fin - inchr);
							det=true;
						}
						inchr=siginchr;
					}else{
						var i = nodo.childNodes.length;
						while(i--){
							ndPila.push(nodo.childNodes[i]);
						}
					}
				}
				var slcc=window.getSelection();
				slcc.removeAllRanges();
				slcc.addRange(rng);
			}var slccGrdd;
			function rstrrdato(odato){
				nota.textContent = odato.valor;
				nota.slini = odato.ini;
				nota.slfin = odato.fin;
			}
			function des(){
				if(ccmnd==="true"){
					document.execCommand('undo', false, null);
				}else{
					if (objrposicion > 0) {
						rstrrdato( cambios[--objrposicion] );
						grdRngPntr = window.getSelection().getRangeAt(0);
					}
					crsrfinal();
					nota.focus();
				}
			}
			function re(){
				if(ccmnd==="true"){
					document.execCommand('redo', false, null);
				}else{
					if (objrposicion < cambios.length - 1) {
						rstrrdato( cambios[++objrposicion] );
					}
					crsrfinal();
					nota.focus();
				}
			}
			return {
				des:des,
				re:re
			}
		},
		set historial(x){
			
		},
		leer(e,iev){
			let archivo=e.target.files[0];
			if(!archivo) {
				return;
			}else{
				let leertxt=new FileReader();
				leertxt.onload = function(e) {
					var txt = e.target.result;
					nota.textContent=txt;
					//if(ccmnd)
						nota.dispatchEvent(iev);
				};
				leertxt.readAsText(archivo);
				document.title=archivo.name;
				nombreFl=[false,archivo.name];
				delete archivo;
				delete leertxt;
			}
		}
	}, 
	archivo:{
		nuevo(){
			function reiniciar(){
				nota.textContent="";
				cambios = [{
					escribir: "",
					valor: "",
					ini: 0,
					fin: 0,
					acumulativa:0
				}];
				objrposicion=0;
				nombreFl=[false,""];
				document.title="nuevo";
			}
			if(nota.textContent==""){
				reiniciar();
			}else{
				let alrtGrdr=confirm("¿Desea guardar este archivo?");
				if(alrtGrdr==true){
					herramientas.archivo.guardar();
					reiniciar();
				}else{
					reiniciar();
				}
			}
		},
		abrir(){
			let infl=document.createElement("input");infl.type="file";infl.accept="text/plain"; infl.setAttribute("onchange","herramientas.acciones.leer(event,inpevnt)");
			infl.click();
		},
		guardar(){
			if(nombreFl[1]==""){
			let nombre = prompt("Guardar","Ingrese un nombre para el archivo");
			if(nombre!=null){
				let txtfrmtd= nota.innerText.replaceAll("\n", '\n\r');
				let fileg = new File([txtfrmtd],nombre+".txt",{type:"text/plain;charset=utf-8"});
				let urlg  = URL.createObjectURL(fileg);
				let linkg = document.createElement("a");
				//document.body.appendChild(linkg);
				document.title = fileg.name;
				nombreFl[1] = fileg.name;
				//
				linkg.href = urlg;
				linkg.download = fileg.name;
				linkg.click();
				URL.revokeObjectURL(urlg);
				delete fileg;
			}else{alert("No ingreso un nombre: Archivo no guardado");}
			}else if(nombreFl[0]==true){
				let fileg = new File([nota.textContent],nombreFl[1],{type:"text/plain;charset=utf-8"});
				let urlg  = URL.createObjectURL(fileg);
				let linkg = document.createElement("a");
				//document.body.appendChild(linkg);
				document.title = fileg.name;
				nombreFl[1] = fileg.name;
				//
				linkg.href = urlg;
				linkg.download = fileg.name;
				linkg.click();
				URL.revokeObjectURL(urlg);
				delete fileg;
			}
		}
	},
	portapapeles:{
		cortar:{
			txt(txtcp){
				navigator.clipboard.writeText(txtcp);
			},
			formato(){
				
			},
			especial(){
				
			}
		},
		copiar:{
			txt(txtcp){
				navigator.clipboard.writeText(txtcp);
				nota.focus();
			},
			formato(){
				
			},
			especial(){
				
			},
			documento(){
				window.getSelection().selectAllChildren( nota );
				navigator.clipboard.writeText(nota.textContent);
			}
		},pegar:{
			txt(){
				nota.focus();
					navigator.clipboard.readText().then(txtpgr => {
					nota.textContent+=txtpgr;
				});
			}
		}
	},
	edicion:{
		palabras:[],
		nbusqueda:0,
		cuadro:{
			busqueda:{
				abrir(t){
					let cdrbscr=t.getAttribute("name"),btnA=document.getElementById("btn-lupa"),cdr=document.getElementById("cuadro-buscar");
					if(cdrbscr=="abrir"){
						cdr.style.display="block";
						btnA.setAttribute("name","cerrar");
					}else if(cdrbscr=="btn-cerrar"){
						cdr.style.display="none";
						btnA.setAttribute("name","abrir");
						edicion.palabras=[];
						edicion.nbusqueda=0;
					}else if(cdrbscr=="cerrar"){
						cdr.style.display="none";
						btnA.setAttribute("name","abrir");
						edicion.palabras=[];
						edicion.nbusqueda=0;
					}
				},
				buscar(){},
				sig(){
					let inin=herramientas.edicion, bsqd=inin.palabras,cntr=document.getElementById("nmrBsqd");
					if(herramientas.edicion.nbusqueda<(bsqd.length)){
						let range = new Range();
						range.setStart(nota.firstChild, bsqd[herramientas.edicion.nbusqueda][0]);
						range.setEnd(nota.firstChild, bsqd[herramientas.edicion.nbusqueda][1]);
						cntr.textContent=herramientas.edicion.nbusqueda+1;
						nota.focus;
						window.getSelection().removeAllRanges();
						window.getSelection().addRange(range);
						herramientas.edicion.nbusqueda++;
					}
				},
				ant(){
					let cntr=document.getElementById("nmrBsqd");
					if(herramientas.edicion.nbusqueda>0){
						herramientas.edicion.nbusqueda--;
						let inin=herramientas.edicion, bsqd=inin.palabras;
						let range = new Range();
						range.setStart(nota.firstChild, bsqd[herramientas.edicion.nbusqueda][0]);
						range.setEnd(nota.firstChild, bsqd[herramientas.edicion.nbusqueda][1]);
						cntr.textContent=herramientas.edicion.nbusqueda+1;
						nota.focus;
						window.getSelection().removeAllRanges();
						window.getSelection().addRange(range);
					}
				},
			}
		},
		buscar(){
			let bcdn=document.getElementById("buscar").value,lbc=bcdn.length,nmrcnt=document.getElementById("cntrBsqd"),cntr=document.getElementById("nmrBsqd");
			let cntnd=nota.innerText,pscn=0,dsd=0,ib=0,bsqd=[];
			while(pscn>=0){
				pscn = cntnd.indexOf(bcdn, dsd);
				if(pscn>=0){
					dsd=pscn + lbc;
					let smlg=(ib==0)?0:(lbc)*ib;
					bsqd[ib]=[pscn,dsd];
					ib++;
				}else{
					nmrcnt.textContent=0;
				}
			}
			if(bsqd.length>0){
			this.nbusqueda=0;
			nmrcnt.textContent=bsqd.length;
			this.palabras=bsqd;
			console.log(this.palabras);
			let range = new Range();
			range.setStart(nota.firstChild, this.palabras[this.nbusqueda][0]);
			range.setEnd(nota.firstChild, this.palabras[this.nbusqueda][1]);
			cntr.textContent=1;
			nota.focus;
			window.getSelection().removeAllRanges();
			window.getSelection().addRange(range);
			this.nbusqueda=1;
			}
		}
	}
}