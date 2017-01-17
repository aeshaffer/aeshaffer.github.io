/// <reference path="numeric-1.2.3.d.ts" />

class CMatrix {
    /**
     *
     */
    constructor(inrp: number[][], inip: number[][]) {
        this.rp = inrp;
        this.ip = inip;
        if(this.rp.length != this.ip.length) { 
            throw "Size Mismatch";
        } else {
            var rowlenghts =this.rp.map(row => row.length); 
            if(Math.min(... rowlenghts) != Math.max(... rowlenghts)) {
                throw "Row length mismatch.";
            }
            var rowlenghts =this.ip.map(row => row.length); 
            if(Math.min(... rowlenghts) != Math.max(... rowlenghts)) {
                throw "Row length mismatch.";
            }
        }
    }
    rp: number[][];
    ip: number[][];
}

function trace(A0: CMatrix): numeric.T {
    return A0.ip.map((row, i) => c(A0.rp[i][i], A0.ip[i][i])).csum();
}

function ceye(n: number) {
    var rp = numeric.identity(n);
    var ip = numeric.sub(numeric.identity(n), numeric.identity(n));
    return new CMatrix(rp, ip);    
}
//
// http://mathfaculty.fullerton.edu/mathews/n2003/faddeev/FaddeevLeverrierMod/Links/FaddeevLeverrierMod_lnk_4.html
function chareq(A0: CMatrix) {
    var Bmatrices = new Array<CMatrix>();
    var ps = new Array<C>();
    var BLast = A0;
    var pLast = trace(A0);
    Bmatrices.push(BLast);
    ps.push(pLast);
    console.log(printMatrix(BLast));
    console.log(pLast);
    for(var i = 2; i <= A0.rp.length; i++) {
        var piI = ScalarMult(ceye(A0.ip.length), pLast);
        var Bnext = CMult(A0, CSub(BLast, piI));
        var pNext = trace(Bnext).div(i);
        BLast = Bnext;
        pLast = pNext;
        ps.push(pLast);
        console.log(printMatrix(Bnext));
        console.log(pLast);
    }
    var poly = ps.reverse();
    console.log(poly);
    poly = poly.map(z => z.mul(-1));
    poly.push(c(1,0));
    console.log(poly);
    var evalues = polyroots(poly);
    return evalues;
}

function printMatrix(A0: CMatrix) {
    return "[\r\n" + 
    tosingle(A0).map((row) => "[" + row.map((v) => ccmd(v)).join(",") + "]").join(",\r\n") 
    + "\r\n]";
}

function fromsingle(A0: numeric.T[][]) {
    var rp = A0.map(row => row.map(c => fixy(c).x));
    var ip = A0.map(row => row.map(c => fixy(c).y));
    return new CMatrix(rp, ip);
}

function tosingle(A0: CMatrix) {
    return A0.rp.map((row,i) => row.map((v, j) => c(v, A0.ip[i][j])));
}

function CMult(A: CMatrix, B: CMatrix) {
    var rp = numeric.sub(numeric.dot(A.rp, B.rp), numeric.dot(A.ip, B.ip));
    var ip = numeric.add(numeric.dot(A.ip, B.rp), numeric.dot(A.rp, B.ip));
    return new CMatrix(rp, ip);
}

function CSub(A: CMatrix, B: CMatrix) {
    return new CMatrix(numeric.sub(A.rp, B.rp), numeric.sub(A.ip, B.ip));
}

function CAdd(A: CMatrix, B: CMatrix) {
    return new CMatrix(numeric.sub(A.rp, B.rp), numeric.sub(A.ip, B.ip));
}
function vz(v: number[][], z: number): number[][] {
    return v.map(row => row.map(y => y * z));
}

function ScalarMult(A: CMatrix, z: C) : CMatrix {
    var z1 = fixy(z);
    var rp = numeric.sub(vz(A.rp, z1.x), vz(A.ip, z1.y));
    var ip = numeric.add(vz(A.ip, z1.x), vz(A.rp, z1.y));
    return new CMatrix(rp, ip);
}
