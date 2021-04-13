/**
 * 
 */

function protocolObject (nombre,numDecimal){
    this.nombre=nombre;
    this.numDecimal=numDecimal;
}

function transform(valor = 0,unidad = 2,tamano = 0){    
    let aux = valor.toString(unidad);
    if (tamano!=0){
        aux=aux.padStart(tamano,"0");
    }
    return aux;
    
}

//let protocolList=[protocolObject("ICMP",1),protocolObject("TCP",6),protocolObject("UDP",17)];
let protocolList=[{nombre:"ICMP",numDecimal:1},{nombre:"TCP",numDecimal:6},{nombre:"UDP",numDecimal:17}];
console.log(protocolList);

//Campos entrantes
let mtu = 1500;
let lenTotal = 3500;
let protocol = protocolList[0];
let dirO = "192.168.0.1";
let dirD = "192.168.0.2";


//Autogenerados
const identy = Math.round(Math.random()*65535);
const timeLife = Math.round(Math.random()*255);

//Datos previos
const version = 4;
const longEncabezado =5;
const servDif = 0;

//Datos calculados



//Funcion para la creacion de fragmentos
function fragmento (len,df,mf,despl,sum){
    this.len=len;
    this.df=df;
    this.mf=mf;
    this.despl=despl;
    this.sum=sum;
}

function generateBinString (fragmento) {
    let cadena=transform(version,2,4);
    cadena+=transform(longEncabezado,2,4);
    cadena+=transform(servDif,2,8);
    cadena+=transform(fragmento.len,2,16);
    cadena+=transform(identy,2,16);
    cadena+="0"+fragmento.df+fragmento.mf;
    cadena+=transform(fragmento.despl,2,13);
    cadena+=transform(timeLife,2,8);
    cadena+=transform(protocol.numDecimal,2,8);
    cadena+=transform(fragmento.sum,2,16);
    let ipO=dirO.split(".");
    ipO.forEach((e)=>{ cadena+=transform(Number(e),2,8)});
    let ipD=dirD.split(".");
    ipD.forEach((e)=>{ cadena+=transform(Number(e),2,8)});
    return cadena;
}

function generateHexa (fragmento){
    let arrayBinario=dividirStringEnArray(generateBinString(fragmento),4);
    let arrayHexa=new Array(arrayBinario.length);
    arrayBinario.forEach((e,i,a)=>arrayHexa[i]=(parseInt(e,2)).toString(16));
    return arrayHexa;
}

function generateBin (fragmento){
    return dividirStringEnArray(generateBinString(fragmento),8);
}

//Divide el string en conjuntos con una cantidad de caracteres especificos, lo devuelve en un array con dichos conjuntos
function dividirStringEnArray (cadena,numDeCaracteres){
    let newArray=new Array(cadena.length/numDeCaracteres);
    for(let i=1;i<=newArray.length;i++){
         newArray[i-1]=cadena.substring(((i-1)*numDeCaracteres),(i*numDeCaracteres));        
    }
    return newArray;
}


//Funcion para la lista de fragmentos

let listFrag = [];



/*
document.write(identy+"\n");
document.write(transform(192,2,9)+"\n");
document.write(Number("192").toString(2));
document.write("192.168.0.1".split("."));
document.write("192.168.0.1".split("."));
*/
console.log(generateBin(new fragmento(lenTotal,0,0,0,0)));
console.log(generateHexa(new fragmento(lenTotal,0,0,0,0)));
