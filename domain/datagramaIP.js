/**
 *
 */

//Datos previos
const VERSION = 4;
const LONG_ENCABEZADO =5;
const SER_DIF = 0;
const PROTOCOL_LIST=[new protocolObject("ICMP",1),new protocolObject("TCP",6),new protocolObject("UDP",17)];

//Autogenerados
const IDENTY = Math.round(Math.random()*65535);
const TIME_LIFE = Math.round(Math.random()*255);

//Campos entrantes - Inputs del html
let MTU = 0;
let LEN_TOTAL = 0;
let PROTOCOL = PROTOCOL_LIST[1];
let DIR_O = "";
let DIR_D = "";
/*
let MTU = 1500;
let LEN_TOTAL = 3500;
let PROTOCOL = PROTOCOL_LIST[0];
let DIR_O = "192.168.0.1";
let DIR_D = "192.168.0.2";
*/
//Datos calculados

    //lista de fragmentos
let FRAG_LIST = [];


/**
 * FUNCIONES
 */


function fragmento (len,df,mf,despl){
    this.len=len;
    this.df=df;
    this.mf=mf;
    this.despl=despl;
    this.sum=0;
    this.sum=calcularSumaComprobacion(this);
    this.binString=generateBinString(this);
    this.bin=generateBin(this);
    this.hexa=generateHexa(this);
}

function protocolObject (nombre,numDecimal){
    this.nombre=nombre;
    this.numDecimal=numDecimal;
}

function transform(valor,unidad = 2,tamano = 0){
    let aux = valor.toString(unidad);
    if (tamano!=0){
        aux=aux.padStart(tamano,"0");
    }
    return aux;
}

function generateBinString (fragmento) {
    let cadena=transform(VERSION,2,4);
    cadena+=transform(LONG_ENCABEZADO,2,4);
    cadena+=transform(SER_DIF,2,8);
    cadena+=transform(fragmento.len,2,16);
    cadena+=transform(IDENTY,2,16);
    cadena+="0"+fragmento.df+fragmento.mf;
    cadena+=transform(fragmento.despl,2,13);
    cadena+=transform(TIME_LIFE,2,8);
    cadena+=transform(PROTOCOL.numDecimal,2,8);
    cadena+=transform(fragmento.sum,2,16);
    let ipO=DIR_O.split(".");
    ipO.forEach((e)=>{ cadena+=transform(Number(e),2,8)});
    let ipD=DIR_D.split(".");
    ipD.forEach((e)=>{ cadena+=transform(Number(e),2,8)});
    return cadena;
}

function generateHexa (fragmento){
    let arrayBinario=dividirStringEnArray(generateBinString(fragmento),8);
    let arrayHexa=new Array(arrayBinario.length);
    arrayBinario.forEach((e,i)=>arrayHexa[i]=transform(parseInt(e,2),16,2));
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

function calcularSumaComprobacion(fragmento){
    let arrayHexa=generateHexa(fragmento);
    let suma="0";
    for(let i=0;i<arrayHexa.length;i+=2){
        if(i!=10){
            suma=sumarHexa(suma,arrayHexa[i]+arrayHexa[i+1]);
            if(suma.length>4){
                suma=sumarHexa(suma.substring(0,1),suma.substring(1));
            }
        }
    }
    return parseInt(restarHexa("FFFF",suma),16);
}

function sumarHexa(cadena1,cadena2){
    let num1=parseInt(cadena1,16);
    let num2=parseInt(cadena2,16);
    return (num1+num2).toString(16);
}

function restarHexa(cadena1,cadena2){
    let num1=parseInt(cadena1,16);
    let num2=parseInt(cadena2,16);
    return (num1-num2).toString(16);
}

function fragmentar(mtu,lenTotal,protocol,dirO,dirD){
    let tamanoEncabezado=20;
    let numFragments=1;
    let lastLen=lenTotal;
    let boolFragmentar=false;
    //Es necesario fragmentar?
    if(mtu<lenTotal){
        numFragments=Math.ceil((lenTotal-tamanoEncabezado)/(mtu-tamanoEncabezado));
        lastLen=lenTotal-((mtu-tamanoEncabezado)*(numFragments-1));
        boolFragmentar=true;
    }
    //Realizar fragmentación
    FRAG_LIST=new Array(numFragments);
    for (let i=0;i<numFragments;i++){
        let len=mtu;
        let mostFragments=0;
        //Es el último fragmento?
        if(boolFragmentar){
            if((i+1)<numFragments){
                mostFragments=1;
            }else{
                len=lastLen;
            }
        }
        let frag=new fragmento(len,0,mostFragments,(i*(mtu-tamanoEncabezado))/8)
        FRAG_LIST[i]=frag;
    }
}



//document.write("<p><marquee><h1>HOOOOOOOOOOOOOLI</h1><marquee></p><p>MADAFAKA</p>")

/*
document.write(identity+"\n");
document.write(transform(192,2,9)+"\n");
document.write(Number("192").toString(2));
document.write("192.168.0.1".split("."));
document.write("192.168.0.1".split("."));
*/

fragmentoPrueba=new fragmento(LEN_TOTAL,0,0,0);
//console.log(generateBin(fragmentoPrueba));
//console.log(generateHexa(fragmentoPrueba));
//console.log(fragmentoPrueba.binString);
//console.log(fragmentoPrueba.bin);
//console.log(fragmentoPrueba.hexa);
function calcular(){
MTU = parseInt( document.getElementById("MTU").value);
LEN_TOTAL = parseInt(document.getElementById("LEN_TOTAL").value);

var RADIO_PROTOCOLS = document.getElementsByName('PROTOCOL');

          for(i = 0; i < RADIO_PROTOCOLS.length; i++) {
              if(RADIO_PROTOCOLS[i].checked)
              PROTOCOL = PROTOCOL_LIST[parseInt(RADIO_PROTOCOLS[i].value)]
          }
DIR_O= document.getElementById("DIR_O").value;
DIR_D= document.getElementById("DIR_D").value;

  fragmentar(MTU,LEN_TOTAL,PROTOCOL,DIR_O,DIR_D);
  console.log(FRAG_LIST);
  debugger;
}
