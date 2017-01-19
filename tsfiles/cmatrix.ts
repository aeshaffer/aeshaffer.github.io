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

function zeroes(n: number) {
    var retval = new Array<Array<number>>(n);
    for(var i = 0; i < n; i++) {
        retval[i] = new Array<number>(n);
        for(var j = 0; j < n; j++) {retval[i][j] = 0;}
    }
    return retval;
}

function realmatrix(m: Array<Array<number>>) {
    return new CMatrix(m, zeroes(m.length));
}

function ceye(n: number) {
    var rp = numeric.identity(n);
    var ip = zeroes(n);
    return new CMatrix(rp, ip);    
}
//
// http://mathfaculty.fullerton.edu/mathews/n2003/faddeev/FaddeevLeverrierMod/Links/FaddeevLeverrierMod_lnk_4.html
function chareq(A0: CMatrix) {
    var n = A0.ip.length;
    var I = ceye(A0.ip.length);
    var Bmatrices = new Array<CMatrix>(n + 1);
    var ps = new Array<C>(n + 1);
    var BLast = A0;
    var pLast = trace(A0);
    ps[1] = pLast;
    Bmatrices[1] = BLast;
    console.log(printMatrix(BLast));
    console.log(pLast);
    for(var i = 2; i <= n; i++) {
        var piI = ScalarMult(I, pLast);
        var Bnext = CMult(A0, CSub(BLast, piI));
        var pNext = trace(Bnext).div(i);
        BLast = Bnext;
        pLast = pNext;
        Bmatrices[i] = BLast;
        ps[i] = pLast;
        console.log(printMatrix(Bnext));
        console.log(pLast);
    }
    //var Ainv = ScalarMult(CSub(Bmatrices[n-1], ScalarMult(I, ps[n -1])), c(1, 0).div(ps[n]));
    var poly = ps.filter(z => z != undefined).reverse();
    console.log(poly);
    poly = poly.map(z => z.mul(-1));
    poly.push(c(1,0));
    console.log(poly);
    var evalues = polyroots(poly);
    return evalues;
}

function evalsnumeric(A0: CMatrix) {
    var eig = numeric.eig(CtoRFourBlock(A0));
    return eig.lambda.x.map((x0, i) => c(x0, eig.lambda.y[i]));
}

function evecsnumeric(A0: CMatrix) {
    var eig = numeric.eig(CtoRFourBlock(A0));
    return eig.E.x.map((e,i) => 
         ({lambda: c(eig.lambda.x[i], eig.lambda.y[i]), 
         vec: e.map((v,j) => c(eig.E.x[i][j], eig.E.y[i][j]))})
         );
}

// function algorithmB(A: CMatrix) {
//     var thetas = spacedAngles(32);
//     for(var t of thetas) {
//         var HT = ScalarMult(A, t2c(-t));
//         var eig = numeric.eig(HT.rp);
//         eig.E.map(())
//     }

function sideBySide(A: CMatrix, B: CMatrix) {
    var rp = A.rp.map((row, i) => row.concat(B[i]));
    var ip = A.ip.map((row, i) => row.concat(B[i]));
    return new CMatrix(rp, ip);
}

function sideBySideN(A: number[][], B: number[][]) {
    return A.map((row, i) => row.concat(B[i]));
}

function stackN(A: number[][], B: number[][]) {
    return A.concat(B);
}

function stack(A:CMatrix, B: CMatrix) {
    var rp = A.rp.concat(B.rp);
    var ip = A.ip.concat(B.ip);
    return new CMatrix(rp, ip);
}

function fourBlockN(A00: number[][], A01: number[][], A10: number[][], A11: number[][]) {
    var A0 = sideBySideN(A00, A01);
    var A1 = sideBySideN(A10, A11);
    return stackN(A0, A1);
}

function fourBlock(A00: CMatrix, A01: CMatrix, A10: CMatrix, A11: CMatrix): CMatrix {
    var A0 = sideBySide(A00, A01);
    var A1 = sideBySide(A10, A11);
    return stack(A0, A1);
}

function VtoRStack(vec: Array<C>) {
    return vec.map(z => z.x).concat(vec.map(z => z.y));
}

function RStackToV(vec: Array<number>) {
    var retval = new Array<C>();
    for(var i = 0; i < vec.length / 2; i++) {
        retval.push(c(vec[i], vec[i + vec.length /2]));
    }
    return retval;
}

function CtoRFourBlock(mat: CMatrix) {
    return fourBlockN(
            mat.rp, ScalarMult(realmatrix(mat.ip), c(-1, 0 )).rp, 
            mat.ip, mat.rp);
}

function MVDot(mat: CMatrix, vec: Array<C>): Array<C> {
    var mat1 = CtoRFourBlock(mat);
    var vec1 = VtoRStack(vec);
    var retval0 = numeric.dot(mat1, vec1);
    return RStackToV(retval0);
}

// function evectors(A0: CMatrix) {
//     var x = chareq(A0);
//     var retval = new Array<numeric.EIG>();
//     for(var ev of x) {
//         var mat = CSub(A0, ScalarMult(ceye(2), ev));
//         var realmat = 
//         var sln = numeric.eig(realmat);
//         retval.push(sln);
//     }
//     return retval;
// }

function printMatrix(A0: CMatrix) {
    return printMatrixT(tosingle(A0));
}

function printMatrixT(A0: C[][]) {
    return "[\r\n" + 
    A0.map((row) => "[" + row.map((v) => ccmd(v)).join(",") + "]").join(",\r\n") 
    + "\r\n]";
}

function printMatrixN(A0: number[][]) {
    return "[\r\n" + 
    A0.map((row) => "[" + row.map((v) => ccmd(c(v,0))).join(",") + "]").join(",\r\n") 
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

function psub(x: Array<C>, y: Array<C>): Array<C> {
    return x.map((v,i) => v.sub(y[i]));
}

function pmul(x: Array<C>, y: Array<C>): Array<C> {
    return x.map((v,i) => v.mul(y[i]));
}
