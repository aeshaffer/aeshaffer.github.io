declare module numeric {
    class T {
        x: number;
        y: number;
        constructor(x: number, y: number)
        Cadd(z2: T): T;
        add(z2: T): T;
        sub(z2: T): T;
        Csub(z2: T): T;
        mul(z2: T): T;
        mul(z2: number): T;
        Cmul(z2: T): T;
        div(z2: T): T;
        Cdiv(z2: T): T;
        div(x2: number): T;
        dot(z2: T): T;
        angle(): number;
        pow(n: number): T;
        abs(): T;
        exp(): T;
        conj(): T;
        unit(): T;
        norm2(): number;
    }

    class EIG {
        lambda: { x: Array<number>; y: Array<number> };
        E: { x: Array<Array<number>>; y: Array<Array<number>> };
    }

    function prettyPrint(w: any): string;

    function linspace(a: number, b: number): Array<number>;
    function linspace(a: number, b: number, n: number): Array<number>;
    function sqrt(x: number): number;
    function atan(x: number): number;
    function atan(x: number, y: number): number;
    function atan2(x: number, y: number): number;
    function sin(x: number): number;
    function cos(x: number): number;
    function abs(x: number): number;
    function abs(x: Array<number>): Array<number>;
    function mul(x: Array<number>, y: Array<number>): Array<number>;
    function transpose(x: Array<Array<number>>): Array<Array<number>>;
    function inv(x: Array<Array<number>>): Array<Array<number>>;
    function eig(x: Array<Array<number>>): EIG;
    function solve(A: Array<Array<number>>, b: Array<number>): Array<number>;
    function dot(A: Array<Array<number>>, z: number | Array<Array<number>>): Array<Array<number>>;
    function dot(A: Array<Array<number>>, z: Array<number>): Array<number>;
    function add(A: Array<Array<number>>, y: Array<Array<number>>): Array<Array<number>>;
    function sub(A: Array<Array<number>>, y: Array<Array<number>>): Array<Array<number>>;
    function identity(n: number): Array<Array<number>>;
    function clone(A: Array<Array<T>>): Array<Array<T>>;
    function clone(A: Array<T>): Array<T>;
}

type C = numeric.T;
