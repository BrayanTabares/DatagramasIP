/**
 *
 */

//Datos previos
const VERSION = 4;
const LONG_ENCABEZADO = 5;
const SER_DIF = 0;
const PROTOCOL_LIST = [new protocolObject("ICMP", 1), new protocolObject("TCP", 6), new protocolObject("UDP", 17)];

//Autogenerados
const IDENTY = Math.round(Math.random() * 65535);
const TIME_LIFE = Math.round(Math.random() * 255);

//Campos entrantes - Inputs del html
let MTU = 0;
let LEN_TOTAL = 0;
let PROTOCOL = PROTOCOL_LIST[1];
let DIR_O = "";
let DIR_D = "";

let VERIFY_INPUTS = true;

//lista de fragmentos
let FRAG_LIST = [];

/**
 * FUNCIONES
 */

function fragmento(len, df, mf, despl) {
    this.len = len;
    this.df = df;
    this.mf = mf;
    this.despl = despl;
    this.sum = 0;
    this.sum = calcularSumaComprobacion(this);
    this.binString = generateBinString(this);
    this.bin = generateBin(this);
    this.hexa = generateHexa(this);
}

function protocolObject(nombre, numDecimal) {
    this.nombre = nombre;
    this.numDecimal = numDecimal;
}

function transform(valor, unidad = 2, tamano = 0) {
    let aux = parseInt(valor).toString(unidad);
    if (tamano != 0) {
        aux = aux.padStart(tamano, "0");
    }
    return aux;
}

function generateBinString(fragmento) {
    let cadena = transform(VERSION, 2, 4);
    cadena += transform(LONG_ENCABEZADO, 2, 4);
    cadena += transform(SER_DIF, 2, 8);
    cadena += transform(fragmento.len, 2, 16);
    cadena += transform(IDENTY, 2, 16);
    cadena += "0" + fragmento.df + fragmento.mf;
    cadena += transform(fragmento.despl, 2, 13);
    cadena += transform(TIME_LIFE, 2, 8);
    cadena += transform(PROTOCOL.numDecimal, 2, 8);
    cadena += transform(fragmento.sum, 2, 16);
    let ipO = DIR_O.split(".");
    ipO.forEach((e) => { cadena += transform(Number(e), 2, 8) });
    let ipD = DIR_D.split(".");
    ipD.forEach((e) => { cadena += transform(Number(e), 2, 8) });
    return cadena;
}

function generateHexa(fragmento) {
    let arrayBinario = dividirStringEnArray(generateBinString(fragmento), 8);
    let arrayHexa = new Array(arrayBinario.length);
    arrayBinario.forEach((e, i) => arrayHexa[i] = transform(parseInt(e, 2), 16, 2));
    return arrayHexa;
}

function generateBin(fragmento) {
    return dividirStringEnArray(generateBinString(fragmento), 8);
}

//Divide el string en conjuntos con una cantidad de caracteres especificos, lo devuelve en un array con dichos conjuntos
function dividirStringEnArray(cadena, numDeCaracteres) {
    let newArray = new Array(cadena.length / numDeCaracteres);
    for (let i = 1; i <= newArray.length; i++) {
        newArray[i - 1] = cadena.substring(((i - 1) * numDeCaracteres), (i * numDeCaracteres));
    }
    return newArray;
}

function calcularSumaComprobacion(fragmento) {
    let arrayHexa = generateHexa(fragmento);
    let suma = "0";
    for (let i = 0; i < arrayHexa.length; i += 2) {
        if (i != 10) {
            suma = sumarHexa(suma, arrayHexa[i] + arrayHexa[i + 1]);
            if (suma.length > 4) {
                suma = sumarHexa(suma.substring(0, 1), suma.substring(1));
            }
        }
    }
    return parseInt(restarHexa("FFFF", suma), 16);
}

function sumarHexa(cadena1, cadena2) {
    let num1 = parseInt(cadena1, 16);
    let num2 = parseInt(cadena2, 16);
    return (num1 + num2).toString(16);
}

function restarHexa(cadena1, cadena2) {
    let num1 = parseInt(cadena1, 16);
    let num2 = parseInt(cadena2, 16);
    return (num1 - num2).toString(16);
}

function fragmentar(mtu, lenTotal, protocol, dirO, dirD) {
    let tamanoEncabezado = 20;
    let numFragments = 1;
    let interLen=lenTotal;
    let lastLen = lenTotal;
    let boolFragmentar = false;
    //Es necesario fragmentar?
    if (mtu < lenTotal) {
        interLen=mtu;
        numFragments = Math.ceil((lenTotal - tamanoEncabezado) / (mtu - tamanoEncabezado));
        lastLen = lenTotal - ((mtu - tamanoEncabezado) * (numFragments - 1));
        boolFragmentar = true;
        if(((mtu-tamanoEncabezado)%8)!=0){
            interLen=(Math.floor((mtu-tamanoEncabezado)/8)*8)+tamanoEncabezado;
            numFragments = Math.ceil((lenTotal - tamanoEncabezado) / (interLen - tamanoEncabezado));
            lastLen = lenTotal - ((interLen - tamanoEncabezado) * (numFragments - 1));
        }
    }
    //Realizar fragmentación
    FRAG_LIST = new Array(numFragments);
    for (let i = 0; i < numFragments; i++) {
        let len = lastLen;
        let mostFragments = 0;
        //Es un fragmento intermedio?
        if ((i + 1) < numFragments) {
            mostFragments = 1;
            len=interLen;
        }
        let frag = new fragmento(len, 0, mostFragments, (i * (interLen - tamanoEncabezado)) / 8)
        FRAG_LIST[i] = frag;
    }
}





const botonCalcular = document.querySelector("#calcular");
botonCalcular.addEventListener("click", (event) => calcular());

const botonGenerar = document.querySelector("#generar");
botonGenerar.addEventListener("click", (event) => generarProblema());



function generarProblema() {
    document.querySelector("#MTU").value = Math.round((Math.random() * 65435) + 100);
    document.querySelector("#LEN_TOTAL").value = Math.round((Math.random() * 65485) + 50);
    document.querySelector("#DIR_O").value = Math.round(Math.random() * 255) + "." + Math.round(Math.random() * 255) + "." + Math.round(Math.random() * 255) + "." + Math.round(Math.random() * 255);
    document.querySelector("#DIR_D").value = Math.round(Math.random() * 255) + "." + Math.round(Math.random() * 255) + "." + Math.round(Math.random() * 255) + "." + Math.round(Math.random() * 255);
    let RADIO_PROTOCOLS = document.getElementsByName('PROTOCOL');
    RADIO_PROTOCOLS[Math.round(Math.random()*2)].click();
}

function calcular() {

    var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    MTU = parseInt(document.querySelector("#MTU").value);
    //validacion del tamaño del MTU/ 65535 es 2^16 -1(64 kilobytes)
    if(MTU>100&&MTU<65535){

    }
    else{
      alert("Usted ha ingresado un MTU invalido");
      return false;
       }

    LEN_TOTAL = parseInt(document.querySelector("#LEN_TOTAL").value);
    //valida la Longitud
    if(LEN_TOTAL>50&&LEN_TOTAL<65535){

    }
    else{
      alert("Usted ha ingresado un MTU invalido");
      return false;
       }

    //Obtener el protocolo seleccionado
    var RADIO_PROTOCOLS = document.getElementsByName('PROTOCOL');
    for (i = 0; i < RADIO_PROTOCOLS.length; i++) {
        if (RADIO_PROTOCOLS[i].checked)
            PROTOCOL = PROTOCOL_LIST[parseInt(RADIO_PROTOCOLS[i].value)]
    }

    console.log(PROTOCOL);
    DIR_O = document.querySelector("#DIR_O").value;
    DIR_D = document.querySelector("#DIR_D").value;

    //valida direcciones ip origen y destino
    if(DIR_O.match(ipformat)){

    }
    else{
      alert("Usted ha ingresado una direccion ip de origen invalida");
      return false;
    }
    if(DIR_D.match(ipformat)){

    }
    else{
      alert("Usted ha ingresado una direccion ip de destino invalida");
      return false;
    }
    //

    fragmentar(MTU, LEN_TOTAL, PROTOCOL_LIST[0], DIR_O, DIR_D);
    rellenarTabla();
    console.log(FRAG_LIST);

}
function rellenarTabla() {
    document.getElementById("Select_Table_Body").innerHTML = "";
    let tableBody = document.getElementById("Select_Table_Body");

    for (let i = 0; i < FRAG_LIST.length; i++) {

        let row = tableBody.insertRow(i)
        row.style = "cursor:pointer";
        row.addEventListener("click", function (event) {
            rellenarTablaBinario(FRAG_LIST[i], i + 1);
            rellenarTablaHexadecimal(FRAG_LIST[i], i + 1);
            rellenarTablaWireShark(FRAG_LIST[i], i + 1);
        });

        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        let cell5 = row.insertCell(4);
        let cell6 = row.insertCell(5);
        let cell7 = row.insertCell(6);

        cell1.innerHTML = i + 1;
        cell2.innerHTML = DIR_O;
        cell3.innerHTML = DIR_D;
        cell4.innerHTML = PROTOCOL.nombre;
        cell5.innerHTML = FRAG_LIST[i].len;
        cell6.innerHTML = FRAG_LIST[i].len-20;
        cell7.innerHTML = FRAG_LIST[i].despl;
    }
}
function rellenarTablaBinario(fragment, number) {
    let binary = fragment.bin;
    document.getElementById("Binary_Table_Body").innerHTML = "";
    document.getElementById("Binary_Table_Title").innerHTML = "Fragmento Binario #" + number;
    let tableBody = document.getElementById("Binary_Table_Body");

    for (let i = 0; i < binary.length; i += 4) {

        let row = tableBody.insertRow(i != 0 ? i / 4 : i);

        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);

        cell1.innerHTML = binary[i];
        cell2.innerHTML = binary[i + 1];
        cell3.innerHTML = binary[i + 2];
        cell4.innerHTML = binary[i + 3];
    }
}
function rellenarTablaHexadecimal(fragment, number) {
    let hexa = fragment.hexa;
    document.getElementById("Hexa_Table_Body").innerHTML = "";
    document.getElementById("Hexa_Table_Title").innerHTML = "Fragmento Hexadecimal #" + number;
    let tableBody = document.getElementById("Hexa_Table_Body");

    for (let i = 0; i < hexa.length; i += 5) {

        let row = tableBody.insertRow(i != 0 ? i / 5 : i);

        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        let cell5 = row.insertCell(4);

        cell1.innerHTML = hexa[i];
        cell2.innerHTML = hexa[i + 1];
        cell3.innerHTML = hexa[i + 2];
        cell4.innerHTML = hexa[i + 3];
        cell5.innerHTML = hexa[i + 4];
    }
}
function rellenarTablaWireShark(fragment, number){
let textArea = document.getElementById("Datagram_TextArea");
document.getElementById("Datagram_TextArea_Title").innerHTML="Fragmento Wireshark #"+number;

let fragmentText = "- MTU: "+MTU+"\n";
    fragmentText += "- Versión del datagrama: "+VERSION+"\n";
    fragmentText += "- Versión del datagrama: "+LONG_ENCABEZADO+"\n";
    fragmentText += "- Servicios diferenciados: "+(SER_DIF==0? "CS0" : "LE")+"\n";
    fragmentText += "- Longitud Datagrama: "+fragment.len+"\n";
    fragmentText += "- No. Identificación: "+IDENTY+"\n";
    fragmentText += "- Flags: "+"\n";
    fragmentText += "\tNo fragmentar: "+(fragment.df>0? "Verdadero" : "Falso")+"\n";
    fragmentText += "\tMás fragmentos: "+(fragment.mf>0? "Verdadero" : "Falso")+"\n";
    fragmentText += "- Desplazamiento: "+fragment.despl+"\n";
    fragmentText += "- Tiempo de vida: "+TIME_LIFE+"ms\n";
    fragmentText += "- Protocolo: "+PROTOCOL.nombre+"\n";
    fragmentText += "- Suma de comprobación: "+fragment.sum+"\n";
    fragmentText += "- IPv4 Origen: "+DIR_O+"\n";
    fragmentText += "- IPv4 Destino: "+DIR_D+"\n";

    textArea.innerHTML=fragmentText;
}
