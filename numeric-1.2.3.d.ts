declare module numeric {
    class T {
        x: number;
        y: number;
        constructor(x: number, y: number)
        add(z2: T) : T;
        sub(z2: T) : T;
        mul(z2: T) : T;
        mul(z2: number) : T;
        div(z2: T) : T;
        dot(z2: T) : T;        
        angle(): number;
        pow(n: number): T;
        abs(): T;
        exp(): T;
        conj(): T;
    }
    
    class EIG {
        lambda: {x: Array<number>; y: Array<number>};
        E: {x: Array<Array<number>>; y: Array<Array<number>>};
    }
    
    function linspace(a: number, b:number) : Array<number>;
    function linspace(a: number, b:number, n:number) : Array<number>;    
    
    function solve(A: Array<Array<number>>, b: Array<number>): Array<number>;
    function sqrt(x: number): number;
    function atan(x: number): number;
    function atan(x: number, y:number): number;
    function atan2(x: number, y:number): number;
    function sin(x: number): number;
    function cos(x: number): number;
    function abs(x: number): number;
    function abs(x: Array<number>): Array<number>;
    function mul(x: Array<number>, y: Array<number>): Array<number>;
    function transpose(x: Array<Array<number>>): Array<Array<number>>;
    function inv(x: Array<Array<number>>): Array<Array<number>>;
    function eig(x: Array<Array<number>>): EIG;
    function dot(x: Array<Array<number>>, y: Array<Array<number>>): Array<Array<number>>;
}
