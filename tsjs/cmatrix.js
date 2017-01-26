/// <reference path="numeric-1.2.3.d.ts" />
var CMatrix = (function () {
    /**
     *
     */
    function CMatrix(inrp, inip) {
        this.rp = inrp;
        this.ip = inip;
        if (this.rp.length != this.ip.length) {
            throw "Size Mismatch";
        }
        else {
            var rowlenghts = this.rp.map(function (row) { return row.length; });
            if (Math.min.apply(Math, rowlenghts) != Math.max.apply(Math, rowlenghts)) {
                throw "Row length mismatch.";
            }
            var rowlenghts = this.ip.map(function (row) { return row.length; });
            if (Math.min.apply(Math, rowlenghts) != Math.max.apply(Math, rowlenghts)) {
                throw "Row length mismatch.";
            }
        }
    }
    CMatrix.prototype.n = function () { return this.rp.length; };
    return CMatrix;
}());
function trace(A0) {
    return A0.ip.map(function (row, i) { return c(A0.rp[i][i], A0.ip[i][i]); }).csum();
}
function zeroes(n) {
    var retval = new Array(n);
    for (var i = 0; i < n; i++) {
        retval[i] = new Array(n);
        for (var j = 0; j < n; j++) {
            retval[i][j] = 0;
        }
    }
    return retval;
}
function realmatrix(m) {
    return new CMatrix(m, zeroes(m.length));
}
function ceye(n) {
    var rp = numeric.identity(n);
    var ip = zeroes(n);
    return new CMatrix(rp, ip);
}
//
// http://mathfaculty.fullerton.edu/mathews/n2003/faddeev/FaddeevLeverrierMod/Links/FaddeevLeverrierMod_lnk_4.html
function chareq(A0) {
    var n = A0.ip.length;
    var I = ceye(A0.ip.length);
    var Bmatrices = new Array(n + 1);
    var ps = new Array(n + 1);
    var BLast = A0;
    var pLast = trace(A0);
    ps[1] = pLast;
    Bmatrices[1] = BLast;
    console.log(printMatrix(BLast));
    console.log(pLast);
    for (var i = 2; i <= n; i++) {
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
    var poly = ps.filter(function (z) { return z != undefined; }).reverse();
    console.log(poly);
    poly = poly.map(function (z) { return z.mul(-1); });
    poly.push(c(1, 0));
    console.log(poly);
    var evalues = polyroots(poly);
    return evalues;
}
function evalsnumeric(A0) {
    var eig = numeric.eig(CtoRFourBlock(A0));
    return eig.lambda.x.map(function (x0, i) { return c(x0, eig.lambda.y[i]); });
}
function evecsnumeric(A0) {
    var eig = numeric.eig(CtoRFourBlock(A0));
    return eig.E.x.map(function (e, i) {
        return ({ lambda: c(eig.lambda.x[i], eig.lambda.y[i]),
            vec: e.map(function (v, j) { return c(eig.E.x[i][j], eig.E.y[i][j]); }) });
    });
}
// function algorithmB(A: CMatrix) {
//     var thetas = spacedAngles(32);
//     for(var t of thetas) {
//         var HT = ScalarMult(A, t2c(-t));
//         var eig = numeric.eig(HT.rp);
//         eig.E.map(())
//     }
function sideBySide(A, B) {
    var rp = A.rp.map(function (row, i) { return row.concat(B[i]); });
    var ip = A.ip.map(function (row, i) { return row.concat(B[i]); });
    return new CMatrix(rp, ip);
}
function sideBySideN(A, B) {
    return A.map(function (row, i) { return row.concat(B[i]); });
}
function stackN(A, B) {
    return A.concat(B);
}
function stack(A, B) {
    var rp = A.rp.concat(B.rp);
    var ip = A.ip.concat(B.ip);
    return new CMatrix(rp, ip);
}
function fourBlockN(A00, A01, A10, A11) {
    var A0 = sideBySideN(A00, A01);
    var A1 = sideBySideN(A10, A11);
    return stackN(A0, A1);
}
function fourBlock(A00, A01, A10, A11) {
    var A0 = sideBySide(A00, A01);
    var A1 = sideBySide(A10, A11);
    return stack(A0, A1);
}
function VtoRStack(vec) {
    return vec.map(function (z) { return z.x; }).concat(vec.map(function (z) { return z.y; }));
}
function RStackToV(vec) {
    var retval = new Array();
    for (var i = 0; i < vec.length / 2; i++) {
        retval.push(c(vec[i], vec[i + vec.length / 2]));
    }
    return retval;
}
function CtoRFourBlock(mat) {
    return fourBlockN(mat.rp, ScalarMult(realmatrix(mat.ip), c(-1, 0)).rp, mat.ip, mat.rp);
}
function MVDot(mat, vec) {
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
function printMatrix(A0) {
    return printMatrixT(tosingle(A0));
}
function printMatrixT(A0) {
    return "[\r\n" +
        A0.map(function (row) { return "[" + row.map(function (v) { return ccmd(v); }).join(",") + "]"; }).join(",\r\n")
        + "\r\n]";
}
function printMatrixN(A0) {
    return "[\r\n" +
        A0.map(function (row) { return "[" + row.map(function (v) { return ccmd(c(v, 0)); }).join(",") + "]"; }).join(",\r\n")
        + "\r\n]";
}
function fromsingle(A0) {
    var rp = A0.map(function (row) { return row.map(function (c) { return fixy(c).x; }); });
    var ip = A0.map(function (row) { return row.map(function (c) { return fixy(c).y; }); });
    return new CMatrix(rp, ip);
}
function tosingle(A0) {
    return A0.rp.map(function (row, i) { return row.map(function (v, j) { return c(A0.rp[i][j], A0.ip[i][j]); }); });
}
function coerceToCMatrix(A) {
    if (A instanceof CMatrix) {
        return A;
    }
    else {
        return fromsingle(A);
    }
}
function coerceToSingle(A) {
    if (A instanceof CMatrix) {
        return tosingle(A);
    }
    else {
        return A;
    }
}
function CMult(A0, B0) {
    var A = coerceToCMatrix(A0);
    var B = coerceToCMatrix(B0);
    var rp = numeric.sub(numeric.dot(A.rp, B.rp), numeric.dot(A.ip, B.ip));
    var ip = numeric.add(numeric.dot(A.ip, B.rp), numeric.dot(A.rp, B.ip));
    return new CMatrix(rp, ip);
}
function SingleMult(A, B) {
    return tosingle(CMult(A, B));
}
function CSub(A, B) {
    return new CMatrix(numeric.sub(A.rp, B.rp), numeric.sub(A.ip, B.ip));
}
function CAdd(A, B) {
    return new CMatrix(numeric.sub(A.rp, B.rp), numeric.sub(A.ip, B.ip));
}
function vz(v, z) {
    return v.map(function (row) { return row.map(function (y) { return y * z; }); });
}
function ScalarMult(A, z) {
    var z1 = fixy(z);
    var rp = numeric.sub(vz(A.rp, z1.x), vz(A.ip, z1.y));
    var ip = numeric.add(vz(A.ip, z1.x), vz(A.rp, z1.y));
    return new CMatrix(rp, ip);
}
function psub(x, y) {
    return x.map(function (v, i) { return v.sub(y[i]); });
}
function pmul(x, y) {
    return x.map(function (v, i) { return v.mul(y[i]); });
}
function swapRows(N, i, j) {
    var A = tosingle(ceye(N));
    var row = A[i];
    A[i] = A[j];
    A[j] = row;
    return A;
}
function maxIndex(startI, vec) {
    var maxI = 0;
    var maxV = null;
    for (var i = startI; i < vec.length; i++) {
        var v = vec[i].abs().x;
        if (maxV == null || v > maxV) {
            maxI = i;
            maxV = v;
        }
    }
    return { maxI: maxI, maxV: maxV };
}
function multipliers(B, col) {
    var retvalL = tosingle(ceye(B.length));
    var retvalR = tosingle(ceye(B.length));
    var pivotvalue = B[col][col];
    if (pivotvalue.abs().x > 0) {
        for (var i = col + 1; i < B.length; i++) {
            retvalL[i][col] = B[i][col].div(pivotvalue);
            retvalR[i][col] = B[i][col].div(pivotvalue).mul(-1);
        }
    }
    return { retvalL: retvalL, retvalR: retvalR };
}
function CLU(A) {
    console.log(printMatrix(A));
    var L = tosingle(ceye(A.n()));
    var U = tosingle(A);
    var P = tosingle(ceye(A.n()));
    console.log(printMatrix(CMult(L, U)));
    for (var col = 0; col < A.n(); col++) {
        // Get max in column;
        var colvec = U.map(function (r) { return r[col]; });
        var maxes = maxIndex(col, colvec);
        var permute = swapRows(A.n(), col, maxes.maxI);
        // L = SingleMult(L, permute);
        U = SingleMult(permute, U);
        P = SingleMult(permute, P);
        var multipliersMat = multipliers(U, col);
        console.log(printMatrix(CMult(multipliersMat.retvalL, multipliersMat.retvalR)));
        L = SingleMult(L, multipliersMat.retvalL);
        U = SingleMult(multipliersMat.retvalR, U);
        console.log(printMatrix(CMult(L, U)));
    }
    return { U: U, L: L, P: P };
}
function CheckCLU(A) {
    var LU = CLU(A);
    console.log("L, U, P");
    console.log(printMatrixT(LU.L));
    console.log(printMatrixT(LU.U));
    console.log(printMatrixT(LU.P));
    console.log("P*A");
    console.log(printMatrix(CMult(LU.P, A)));
    console.log("L*U");
    console.log(printMatrix(CMult(LU.L, LU.U)));
}
//# sourceMappingURL=cmatrix.js.map