importScripts('numeric-1.2.3.js', 'polynomials.js', 'blaschke.js'); 

function rowcallback(i) {
    var endDT = (new Date()).getTime();
    postMessage({rowComplete: i, comptime : endDT - startDT});
}

var startDT;

self.onmessage = function(event) {
    var as = event.data.as;
    var N = event.data.N;

    as = cifyrow(as);

    startDT = (new Date()).getTime();
    var rpip = bpgridevalArray(N, as, rowcallback);
    var endDT = (new Date()).getTime();

    postMessage({rpip: rpip, senddate: (new Date()).getTime(),
		 comptime: endDT - startDT});    
}

    